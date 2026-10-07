/**
 * Comprehensive Node.js Integration & Regression Tests for ATS Engine
 */

const fs = require("fs");
const path = require("path");
const DocumentExtractor = require("./services/documentExtractor");
const DeterministicATSEngine = require("./atsEngine");
const OpenAIService = require("./services/openaiService");
const PDFReportGenerator = require("./services/pdfReportGenerator");

async function runTests() {
  console.log("\n============================================================");
  console.log("TEST 1: Testing Node.js Extractor on PDF, DOCX, and TXT");
  console.log("============================================================");

  const goodTxtPath = path.resolve(__dirname, "../sample_resumes/software_engineer_good.txt");
  const docxPath = path.resolve(__dirname, "../sample_resumes/sample_jane.docx");
  const pdfPath = path.resolve(__dirname, "../sample_resumes/software_engineer_sample.pdf");
  const poorTxtPath = path.resolve(__dirname, "../sample_resumes/poor_resume.txt");
  const jdPath = path.resolve(__dirname, "../sample_resumes/sample_jd.txt");

  const jdText = fs.readFileSync(jdPath, "utf-8");

  // 1. TXT Extraction
  const txtExt = await DocumentExtractor.extract(fs.readFileSync(goodTxtPath), "software_engineer_good.txt");
  console.log(`[PASS] TXT Extracted: ${txtExt.wordCount} words, fileType: ${txtExt.fileType}`);

  // 2. DOCX Extraction
  const docxExt = await DocumentExtractor.extract(fs.readFileSync(docxPath), "sample_jane.docx");
  console.log(`[PASS] DOCX Extracted: ${docxExt.wordCount} words, fileType: ${docxExt.fileType}`);

  // 3. PDF Extraction
  const pdfExt = await DocumentExtractor.extract(fs.readFileSync(pdfPath), "software_engineer_sample.pdf");
  console.log(`[PASS] PDF Extracted: ${pdfExt.wordCount} words, pages: ${pdfExt.pageCount}, fileType: ${pdfExt.fileType}`);

  console.log("\n============================================================");
  console.log("TEST 2: Testing Deterministic ATS Engine on Good Resume + JD");
  console.log("============================================================");

  const goodResult = DeterministicATSEngine.analyze(txtExt, jdText);
  const goodScore = goodResult.scoring.overallScore;
  console.log(`Good Resume ATS Score: ${goodScore}/100 (Grade: ${goodResult.scoring.grade}, Rating: ${goodResult.scoring.rating})`);
  console.log("Subscores:", Object.fromEntries(Object.entries(goodResult.scoring.subscores).map(([k, v]) => [k, v.score])));
  console.log("Matched Skills:", goodResult.jdMatch.matchedSkills);
  console.log("Missing Skills:", goodResult.jdMatch.missingSkills);
  console.log("Critical Issues:", goodResult.scoring.criticalIssues.length);
  console.log("Strengths:", goodResult.scoring.strengths.length);

  if (goodScore < 80) throw new Error(`Expected score >= 80, got ${goodScore}`);
  if (goodResult.scoring.criticalIssues.length !== 0) throw new Error(`Expected 0 critical issues, got ${goodResult.scoring.criticalIssues.length}`);
  console.log("[PASS] Test 2 passed!");

  console.log("\n============================================================");
  console.log("TEST 3: Testing Deterministic ATS Engine on Poor Resume");
  console.log("============================================================");

  const poorExt = await DocumentExtractor.extract(fs.readFileSync(poorTxtPath), "poor_resume.txt");
  const poorResult = DeterministicATSEngine.analyze(poorExt, jdText);
  const poorScore = poorResult.scoring.overallScore;
  console.log(`Poor Resume ATS Score: ${poorScore}/100 (Grade: ${poorResult.scoring.grade}, Rating: ${poorResult.scoring.rating})`);
  console.log("Critical Issues Found:", poorResult.scoring.criticalIssues.map(c => c.issue));

  if (poorScore >= 55) throw new Error(`Expected poor score < 55, got ${poorScore}`);
  if (poorResult.scoring.criticalIssues.length < 3) throw new Error("Expected >= 3 critical issues");
  console.log("[PASS] Test 3 passed!");

  console.log("\n============================================================");
  console.log("TEST 4: Testing AI Advisor / STAR Rewrites Generation");
  console.log("============================================================");

  const aiFeedback = await OpenAIService.generateSuggestions({
    resumeText: txtExt.text,
    scoreData: goodResult.scoring,
    jdData: goodResult.jdMatch
  });
  console.log("Advisor Source:", aiFeedback.source);
  console.log("Advisor Feedback preview:\n", aiFeedback.markdownFeedback.slice(0, 260) + "...\n");
  if (!aiFeedback.markdownFeedback.includes("STAR")) throw new Error("Expected STAR method feedback in output");
  console.log("[PASS] Test 4 passed!");

  console.log("\n============================================================");
  console.log("TEST 5: Testing PDF Report Generator (PDFKit replacement for reportlab)");
  console.log("============================================================");

  const pdfReportBuffer = await PDFReportGenerator.generateReportBuffer(goodResult, "software_engineer_good.txt");
  console.log(`Generated PDF report buffer: ${pdfReportBuffer.length} bytes`);
  if (pdfReportBuffer.length < 500) throw new Error("Generated PDF is too small or corrupt");
  console.log("[PASS] Test 5 passed!");

  console.log("\n============================================================");
  console.log("ALL NODE.JS TESTS PASSED SUCCESSFULLY! 100% VERIFIED.");
  console.log("============================================================\n");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});
