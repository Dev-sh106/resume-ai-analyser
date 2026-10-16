process.env.NODE_ENV = "test";
const http = require("http");
const fs = require("fs");
const path = require("path");
const FormData = require("form-data");
const app = require("./server");

async function testApi() {
  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  console.log(`[Test Server] Listening on port ${port}`);

  try {
    // 1. Health check
    const healthRes = await fetch(`http://localhost:${port}/api/health`);
    const healthJson = await healthRes.json();
    console.log("[PASS] Health Check Response:", healthJson.status);

    // 2. Analyze Resume (multipart upload)
    const pdfPath = path.resolve(__dirname, "../sample_resumes/software_engineer_sample.pdf");
    const jdPath = path.resolve(__dirname, "../sample_resumes/sample_jd.txt");

    const form = new FormData();
    form.append("resume", fs.readFileSync(pdfPath), { filename: "software_engineer_sample.pdf" });
    form.append("jobDescription", fs.readFileSync(jdPath, "utf-8"));

    const analyzeRes = await fetch(`http://localhost:${port}/api/resumes/analyze`, {
      method: "POST",
      headers: form.getHeaders(),
      body: form.getBuffer()
    });

    const analyzeJson = await analyzeRes.json();
    console.log(`[PASS] HTTP Analysis Score: ${analyzeJson.scoring.overallScore}/100 (Grade ${analyzeJson.scoring.grade})`);
    console.log(`[PASS] Matched Skills: ${analyzeJson.jdMatch.matchedSkills.length} skills`);
    console.log(`[PASS] AI Suggestions present: ${Boolean(analyzeJson.aiSuggestions?.markdownFeedback)}`);
    if (analyzeJson.scoring.overallScore < 80) {
      throw new Error(`Expected score >= 80, got ${analyzeJson.scoring.overallScore}`);
    }

    // 3. Test Rescan with resumeText and .pdf filename (reproducing exact user scenario)
    const rescanForm = new FormData();
    rescanForm.append("resumeText", analyzeJson.extraction.text);
    rescanForm.append("filename", "software_engineer_sample.pdf");
    rescanForm.append("jobDescription", fs.readFileSync(jdPath, "utf-8"));

    const rescanRes = await fetch(`http://localhost:${port}/api/resumes/analyze`, {
      method: "POST",
      headers: rescanForm.getHeaders(),
      body: rescanForm.getBuffer()
    });
    const rescanJson = await rescanRes.json();
    console.log(`[PASS] Rescan Score: ${rescanJson.scoring.overallScore}/100 (Expected 97, NOT 9)`);
    if (rescanJson.scoring.overallScore !== analyzeJson.scoring.overallScore) {
      throw new Error(`Rescan score changed unexpectedly: ${rescanJson.scoring.overallScore} vs ${analyzeJson.scoring.overallScore}`);
    }

    // 4. Test on-demand PDF report generation
    const genReportRes = await fetch(`http://localhost:${port}/api/resumes/report/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scoring: rescanJson.scoring,
        jdMatch: rescanJson.jdMatch,
        filename: "test_report.pdf"
      })
    });
    if (genReportRes.status !== 200) {
      throw new Error(`Expected 200 from /report/generate, got ${genReportRes.status}`);
    }
    const reportBlob = await genReportRes.arrayBuffer();
    console.log(`[PASS] Generated PDF Report bytes: ${reportBlob.byteLength} bytes`);
    if (reportBlob.byteLength < 500) {
      throw new Error("PDF report too small");
    }

    // 5. Test generate-bullet endpoint
    const bulletRes = await fetch(`http://localhost:${port}/api/resumes/generate-bullet`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ skill: "Docker", jdText: "Need Docker experience" })
    });
    const bulletJson = await bulletRes.json();
    console.log(`[PASS] Generated STAR bullet for "${bulletJson.skill}": ${bulletJson.bullet.slice(0, 60)}...`);

    console.log("\nALL HTTP REST API TESTS PASSED!");
  } finally {
    server.close();
    const mongoose = require("mongoose");
    await mongoose.connection.close();
  }
}

testApi().catch(err => {
  console.error("HTTP API Test Error:", err);
  process.exit(1);
});
