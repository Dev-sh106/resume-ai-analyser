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

    // 3. Test generate-bullet endpoint
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
  }
}

testApi().catch(err => {
  console.error("HTTP API Test Error:", err);
  process.exit(1);
});
