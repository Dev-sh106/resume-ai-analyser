/**
 * Resume Analysis Mongoose Model
 * Stores parsed resumes, scores, detected issues, matched skills, and AI suggestions.
 */

const mongoose = require("mongoose");

const ResumeAnalysisSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  filename: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    default: "PDF"
  },
  overallScore: {
    type: Number,
    required: true
  },
  grade: {
    type: String,
    default: "C"
  },
  rating: {
    type: String,
    default: "Needs Improvement"
  },
  subscores: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  criticalIssues: {
    type: Array,
    default: []
  },
  warnings: {
    type: Array,
    default: []
  },
  recommendations: {
    type: Array,
    default: []
  },
  strengths: {
    type: Array,
    default: []
  },
  contact: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  skillsDetected: {
    type: Array,
    default: []
  },
  skillsByCategory: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  jobDescription: {
    type: String,
    default: ""
  },
  jdMatch: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  aiSuggestions: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  affindaData: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  rawText: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("ResumeAnalysis", ResumeAnalysisSchema);
