/**
 * Section Structure Checker for Node.js ATS Engine.
 * Detects presence of standard sections: Experience, Education, Skills, Summary, Projects, Certifications.
 */

const SECTION_PATTERNS = {
  contact: /^(contact(\s+information)?|personal\s+details|personal\s+info)$/i,
  summary: /^(professional\s+summary|executive\s+summary|career\s+summary|summary|profile|about\s+me|career\s+objective|objective)$/i,
  experience: /^(work\s+experience|professional\s+experience|experience|employment\s+history|work\s+history|relevant\s+experience|career\s+history)$/i,
  education: /^(education|academic\s+background|academic\s+history|qualifications|degrees?|educational\s+qualifications)$/i,
  skills: /^(skills|technical\s+skills|core\s+competencies|technologies|areas\s+of\s+expertise|key\s+skills|technical\s+proficiencies)$/i,
  projects: /^(projects|key\s+projects|notable\s+projects|academic\s+projects|personal\s+projects|portfolio)$/i,
  certifications: /^(certifications?|licenses|credentials|professional\s+certifications|courses\s+&\s+certifications)$/i,
  awards: /^(awards|honors|achievements|honors\s+&\s+awards|recognitions)$/i
};

const CRITICAL_SECTIONS = ["experience", "education", "skills"];
const RECOMMENDED_SECTIONS = ["summary", "projects", "certifications"];

class SectionChecker {
  static check(extractionData) {
    const lines = extractionData.lines || [];
    const detectedSections = {};
    const sectionOrder = [];
    const sectionLines = { header: [] };
    let currentSection = "header";

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx].trim();
      const cleanLine = line.replace(/^[#*_:=\s]+|[#*_:=\s]+$/g, "");

      let matchedSec = null;
      if (cleanLine.length > 2 && cleanLine.length < 45) {
        for (const [secKey, pattern] of Object.entries(SECTION_PATTERNS)) {
          if (pattern.test(cleanLine)) {
            matchedSec = secKey;
            break;
          }
        }
      }

      if (matchedSec) {
        currentSection = matchedSec;
        if (!detectedSections[currentSection]) {
          detectedSections[currentSection] = { headerName: cleanLine, lineIndex: idx };
          sectionOrder.push(currentSection);
        }
        if (!sectionLines[currentSection]) {
          sectionLines[currentSection] = [];
        }
      } else {
        if (!sectionLines[currentSection]) sectionLines[currentSection] = [];
        sectionLines[currentSection].push(line);
      }
    }

    const sectionText = {};
    for (const [k, arr] of Object.entries(sectionLines)) {
      sectionText[k] = arr.join("\n");
    }

    const problems = [];
    const positivePoints = [];

    // Audit critical sections
    for (const crit of CRITICAL_SECTIONS) {
      if (!detectedSections[crit]) {
        problems.push({
          severity: "CRITICAL",
          category: "Sections",
          issue: `Missing critical section: '${crit.charAt(0).toUpperCase() + crit.slice(1)}'.`,
          suggestion: `Add an explicit '${crit.charAt(0).toUpperCase() + crit.slice(1)}' header so ATS can parse your background correctly.`
        });
      } else {
        const contentLen = (sectionText[crit] || "").trim().length;
        if (contentLen < 20) {
          problems.push({
            severity: "CRITICAL",
            category: "Sections",
            issue: `Section '${crit.charAt(0).toUpperCase() + crit.slice(1)}' appears empty or poorly formatted.`,
            suggestion: `Ensure content is placed directly beneath the '${crit.charAt(0).toUpperCase() + crit.slice(1)}' header.`
          });
        } else {
          positivePoints.push(`Section '${crit.charAt(0).toUpperCase() + crit.slice(1)}' detected.`);
        }
      }
    }

    // Audit recommended sections
    if (!detectedSections.summary) {
      problems.push({
        severity: "INFO",
        category: "Sections",
        issue: "Missing 'Professional Summary' or 'Objective' section.",
        suggestion: "A 2-3 line executive summary at the top helps recruiters immediately identify your value proposition."
      });
    } else {
      positivePoints.push("Professional Summary detected.");
    }

    if (!detectedSections.projects && !detectedSections.certifications) {
      problems.push({
        severity: "INFO",
        category: "Sections",
        issue: "Neither 'Projects' nor 'Certifications' sections were found.",
        suggestion: "Adding tangible projects or certifications boosts ATS skill verification."
      });
    }

    // Score out of 20
    let score = 20;
    for (const crit of CRITICAL_SECTIONS) {
      if (!detectedSections[crit]) score -= 5;
    }
    if (!detectedSections.summary) score -= 2;

    score = Math.max(0, Math.min(20, score));

    return {
      score,
      maxScore: 20,
      detectedSections: Object.keys(detectedSections),
      missingCritical: CRITICAL_SECTIONS.filter(c => !detectedSections[c]),
      missingRecommended: RECOMMENDED_SECTIONS.filter(r => !detectedSections[r]),
      sectionOrder,
      sectionText,
      problems,
      positivePoints
    };
  }
}

module.exports = SectionChecker;
