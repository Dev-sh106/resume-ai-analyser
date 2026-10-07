/**
 * Formatting and Readability Checker for Node.js ATS Engine.
 * Evaluates length, density, bullet structure, action verbs, and quantifiable metrics.
 */

const POWER_ACTION_VERBS = new Set([
  "accelerated", "accomplished", "achieved", "acquired", "adapted", "administered",
  "advised", "allocated", "analyzed", "architected", "audited", "automated",
  "budgeted", "built", "calculated", "centralized", "championed", "collaborated",
  "conceptualized", "consolidated", "constructed", "converted", "coordinated",
  "created", "cultivated", "customized", "debugged", "decreased", "delivered",
  "deployed", "designed", "developed", "devised", "diagnosed", "directed",
  "discovered", "dispatched", "diversified", "documented", "doubled", "drafted",
  "drove", "earned", "eliminated", "enabled", "enforced", "engineered",
  "enhanced", "established", "estimated", "evaluated", "exceeded", "executed",
  "expanded", "expedited", "fabricated", "facilitated", "forecasted", "formulated",
  "fostered", "founded", "generated", "guided", "halted", "headed", "identified",
  "implemented", "improved", "improvised", "increased", "initiated", "innovated",
  "inspected", "installed", "instituted", "instructed", "integrated", "intensified",
  "introduced", "invented", "investigated", "launched", "lead", "led", "leveraged",
  "maximized", "mentored", "migrated", "minimized", "modernized", "negotiated",
  "obtained", "operated", "optimized", "orchestrated", "organized", "overhauled",
  "oversaw", "partnered", "performed", "pioneered", "planned", "prepared",
  "presented", "prioritized", "produced", "programmed", "promoted", "proposed",
  "published", "rebuilt", "recommended", "reconciled", "redesigned", "reduced",
  "refactored", "refined", "reformed", "remodeled", "reorganized", "repaired",
  "replaced", "represented", "researched", "resolved", "restructured", "revamped",
  "reviewed", "revitalized", "saved", "scaled", "scheduled", "screened",
  "secured", "selected", "separated", "simplified", "simulated", "slashed",
  "solved", "spearheaded", "standardized", "stimulated", "streamlined", "strengthened",
  "structured", "succeeded", "supervised", "surpassed", "synthesized", "systematized",
  "targeted", "tested", "tracked", "trained", "transferred", "transformed",
  "translated", "tripled", "troubleshot", "unified", "upgraded", "utilized",
  "validated", "visualized", "won", "yielded"
]);

const WEAK_PHRASES = [
  "responsible for", "duties included", "worked on", "helped with",
  "assisted in", "assisted with", "tasks included", "part of a team that",
  "handled day to day", "involved in"
];

class FormattingChecker {
  static check(extractionData) {
    const text = extractionData.text || "";
    const wordCount = extractionData.wordCount || 0;
    const pageCount = extractionData.pageCount || 1;
    const lines = extractionData.lines || [];
    const isScanned = extractionData.isScannedWarning || false;

    const problems = [];
    const positivePoints = [];

    // 1. Scanned / Empty Check
    if (isScanned || wordCount < 50) {
      problems.push({
        severity: "CRITICAL",
        category: "Formatting",
        issue: "Resume text could not be read or is extremely short.",
        suggestion: "Ensure the resume is not an image scan. ATS scanners cannot read flat images without OCR."
      });
    }

    // 2. Word Count Check
    if (wordCount < 250 && !isScanned) {
      problems.push({
        severity: "WARNING",
        category: "Formatting",
        issue: `Resume is brief (${wordCount} words). Typical length is 400-800 words.`,
        suggestion: "Add more detailed bullet points detailing your achievements and responsibilities."
      });
    } else if (wordCount > 1200) {
      problems.push({
        severity: "WARNING",
        category: "Formatting",
        issue: `Resume is quite lengthy (${wordCount} words).`,
        suggestion: "Consider condensing to 1-2 pages (around 500-900 words) to prevent recruiter fatigue."
      });
    } else if (wordCount >= 350 && wordCount <= 1000) {
      positivePoints.push(`Ideal resume length (${wordCount} words).`);
    }

    // 3. Page Count Check
    if (pageCount > 2) {
      problems.push({
        severity: "WARNING",
        category: "Formatting",
        issue: `Document spans ${pageCount} pages.`,
        suggestion: "Unless you have 10+ years of experience or an academic CV, stick to 1 or 2 pages."
      });
    } else {
      positivePoints.push(`Standard page count (${pageCount} page${pageCount > 1 ? "s" : ""}).`);
    }

    // 4. Bullet Point Analysis
    const bulletRegex = /^[•\-*▪▫–—\d+\.]\s+/u;
    const bulletLines = lines.filter(l => bulletRegex.test(l.trim()));
    const bulletCount = bulletLines.length;

    if (bulletCount < 4 && lines.length > 10) {
      problems.push({
        severity: "WARNING",
        category: "Formatting",
        issue: "Few or no bullet points detected.",
        suggestion: "Use bullet points to format achievements. Dense paragraphs are difficult for ATS parsers to extract."
      });
    } else if (bulletCount >= 6) {
      positivePoints.push(`Good use of bullet points (${bulletCount} bullets detected).`);
    }

    // 5. Measurable Impact / Quantified Metrics
    const metricRegex = /(\b\d+%\b|\$\d+[\d,]*|\b\d+\+?\s*(?:users|clients|projects|million|billion|thousand|k|m|team members|hours|days|weeks|months)\b|\b(?:increased|decreased|reduced|saved|grew|scaled|improved|boosted)\s+\b(?:by\s+)?\d+%)/gi;
    const foundMetrics = text.match(metricRegex) || [];
    const quantifiedCount = foundMetrics.length;

    if (quantifiedCount === 0) {
      problems.push({
        severity: "WARNING",
        category: "Impact",
        issue: "No quantified metrics or measurable results detected (e.g., %, $, numbers).",
        suggestion: "Incorporate numerical results in bullet points (e.g. 'Improved query latency by 45%', 'Led team of 8 engineers', 'Managed $50k budget')."
      });
    } else if (quantifiedCount < 3) {
      problems.push({
        severity: "INFO",
        category: "Impact",
        issue: `Only ${quantifiedCount} quantified result(s) found.`,
        suggestion: "Add more numerical impact (e.g., percentages, cost savings, user growth) to validate your results."
      });
    } else {
      positivePoints.push(`Strong quantified impact (${quantifiedCount} metrics found).`);
    }

    // 6. Action Verbs & Weak Phrasing
    const textLower = text.toLowerCase();
    const words = textLower.match(/\b[a-z]{3,}\b/g) || [];
    const foundActionVerbs = new Set();
    for (const w of words) {
      if (POWER_ACTION_VERBS.has(w)) {
        foundActionVerbs.add(w);
      }
    }

    const foundWeakPhrases = [];
    for (const wp of WEAK_PHRASES) {
      if (textLower.includes(wp)) {
        foundWeakPhrases.push(wp);
      }
    }

    if (foundWeakPhrases.length > 0) {
      problems.push({
        severity: "INFO",
        category: "Language",
        issue: `Passive/weak phrasing detected: '${foundWeakPhrases.slice(0, 3).join(", ")}'.`,
        suggestion: "Replace passive phrases like 'responsible for' with assertive power verbs like 'Led', 'Spearheaded', 'Delivered', or 'Engineered'."
      });
    }

    if (foundActionVerbs.size < 5) {
      problems.push({
        severity: "INFO",
        category: "Language",
        issue: `Low count of strong action verbs (${foundActionVerbs.size} unique action verbs found).`,
        suggestion: "Start experience bullets with strong action verbs (e.g. Architected, Automated, Deployed, Streamlined)."
      });
    } else {
      positivePoints.push(`Diverse action verbs used (${foundActionVerbs.size} action verbs detected).`);
    }

    // Score calculation (out of 20)
    let score = 20;
    if (isScanned || wordCount < 50) {
      score = 2;
    } else {
      if (wordCount < 250 || wordCount > 1200) score -= 3;
      if (pageCount > 2) score -= 2;
      if (bulletCount < 4) score -= 3;
      if (quantifiedCount === 0) score -= 4;
      else if (quantifiedCount < 3) score -= 2;
      if (foundWeakPhrases.length > 1) score -= 2;
      if (foundActionVerbs.size < 5) score -= 2;
    }

    score = Math.max(2, Math.min(20, score));

    return {
      score,
      maxScore: 20,
      wordCount,
      pageCount,
      bulletCount,
      quantifiedMetricsCount: quantifiedCount,
      sampleMetrics: foundMetrics.slice(0, 5),
      actionVerbsCount: foundActionVerbs.size,
      sampleActionVerbs: Array.from(foundActionVerbs).slice(0, 8),
      weakPhrasesFound: foundWeakPhrases,
      problems,
      positivePoints
    };
  }
}

module.exports = FormattingChecker;
