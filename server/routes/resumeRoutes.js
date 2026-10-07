/**
 * Resume Analysis & Management Routes
 */

const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");
const AffindaService = require("../services/affindaService");
const OpenAIService = require("../services/openaiService");
const PDFReportGenerator = require("../services/pdfReportGenerator");
const DeterministicATSEngine = require("../atsEngine");
const ResumeAnalysis = require("../models/ResumeAnalysis");

// POST /api/resumes/analyze
// Auth is optional: analysis always works, but results are only saved when logged in.
router.post("/analyze", protect, upload.single("resume"), async (req, res) => {
  try {
    let fileBuffer = null;
    let filename = "resume.txt";

    if (req.file) {
      fileBuffer = req.file.buffer;
      filename = req.file.originalname;
    } else if (req.body.resumeText) {
      fileBuffer = Buffer.from(req.body.resumeText, "utf-8");
      filename = req.body.filename || "pasted_resume.txt";
    } else {
      return res.status(400).json({ error: "Please upload a resume file (PDF/DOCX/TXT) or provide resume text." });
    }

    const jobDescription = req.body.jobDescription || "";

    // API keys come from .env only — never accepted from the client
    const openaiApiKey = process.env.OPENAI_API_KEY;
    const affindaApiKey = process.env.AFFINDA_API_KEY;

    // Step 1: Resume extraction (Affinda API or local parser fallback)
    const extractionResult = await AffindaService.parseResume(fileBuffer, filename, affindaApiKey);
    const extractionData = extractionResult.metadata;

    // Step 2: Deterministic ATS engine
    const atsResult = DeterministicATSEngine.analyze(extractionData, jobDescription);

    // Step 3: AI coaching (OpenAI API or rule-based fallback)
    const aiSuggestions = await OpenAIService.generateSuggestions({
      resumeText: extractionData.text,
      scoreData: atsResult.scoring,
      jdData: atsResult.jdMatch,
      apiKey: openaiApiKey
    });

    const fullResult = {
      ...atsResult,
      aiSuggestions,
      affindaDetails: {
        source: extractionResult.source,
        isAffindaLive: extractionResult.isAffindaLive,
        parsedData: extractionResult.parsedData,
        note: extractionResult.note
      }
    };

    // Step 4: Persist to MongoDB only when the user is logged in
    if (req.user) {
      try {
        const savedDoc = await ResumeAnalysis.create({
          user: req.user._id,
          filename,
          fileType: extractionData.fileType || "UNKNOWN",
          overallScore: atsResult.scoring.overallScore,
          grade: atsResult.scoring.grade,
          rating: atsResult.scoring.rating,
          subscores: atsResult.scoring.subscores,
          criticalIssues: atsResult.scoring.criticalIssues,
          warnings: atsResult.scoring.warnings,
          recommendations: atsResult.scoring.recommendations,
          strengths: atsResult.scoring.strengths,
          contact: atsResult.contact,
          skillsDetected: atsResult.keywords.allDetectedSkills,
          skillsByCategory: atsResult.keywords.skillsByCategory,
          jobDescription,
          jdMatch: atsResult.jdMatch,
          aiSuggestions,
          affindaData: extractionResult.parsedData,
          rawText: extractionData.text
        });
        fullResult.id = savedDoc._id;
      } catch (dbErr) {
        console.warn("MongoDB save warning:", dbErr.message);
      }
    }

    res.json(fullResult);
  } catch (err) {
    console.error("Analysis route error:", err);
    res.status(500).json({ error: err.message || "An error occurred during resume analysis." });
  }
});

// GET /api/resumes/history — requires login, returns only the current user's analyses
router.get("/history", protect, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Sign in to view your analysis history." });
  }
  try {
    const analyses = await ResumeAnalysis.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-rawText");
    res.json(analyses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resumes/:id — requires login, only the owner can view
router.get("/:id", protect, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required." });
  }
  try {
    const doc = await ResumeAnalysis.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Analysis not found." });
    if (String(doc.user) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied." });
    }
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resumes/:id/report — PDF download, requires login and ownership
router.get("/:id/report", protect, async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required to download reports." });
  }
  try {
    const doc = await ResumeAnalysis.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Analysis not found." });
    if (String(doc.user) !== String(req.user._id)) {
      return res.status(403).json({ error: "Access denied." });
    }

    const pdfBuffer = await PDFReportGenerator.generateReportBuffer({
      scoring: {
        overallScore: doc.overallScore,
        grade: doc.grade,
        rating: doc.rating,
        subscores: doc.subscores,
        criticalIssues: doc.criticalIssues,
        warnings: doc.warnings
      },
      jdMatch: doc.jdMatch
    }, doc.filename);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="ATS_Report_${doc.filename}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/resumes/generate-bullet
// Generates a suggested bullet point for a missing skill.
router.post("/generate-bullet", protect, async (req, res) => {
  try {
    const { skill, resumeText, jdText } = req.body;
    if (!skill) {
      return res.status(400).json({ error: "Skill name is required." });
    }

    // API key comes from .env only
    const result = await OpenAIService.generateBulletForSkill({
      skill,
      resumeText,
      jdText,
      apiKey: process.env.OPENAI_API_KEY
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
