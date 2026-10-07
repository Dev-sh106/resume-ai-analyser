/**
 * Composite ATS Scoring and Problem Categorization for Node.js ATS Engine.
 */

class ATSScorer {
  static compute({ formattingRes, sectionRes, contactRes, keywordRes, jdRes }) {
    const fmtScore = formattingRes.score || 0;
    const secScore = sectionRes.score || 0;
    const cntScore = contactRes.score || 0;
    const kwScore = keywordRes.score || 0;
    const jdScore = jdRes.score || 0;
    const hasJd = jdRes.hasJd || false;

    let totalScore = 0;
    if (hasJd) {
      totalScore = fmtScore + secScore + cntScore + kwScore + jdScore;
    } else {
      const standalone = fmtScore + secScore + cntScore + kwScore;
      totalScore = Math.round((standalone / 75.0) * 100);
    }
    totalScore = Math.max(0, Math.min(100, totalScore));

    let grade = "D";
    let rating = "High Risk / Parser Failure";
    let summaryDesc = "Critical formatting or missing section issues detected that may cause the ATS parser to fail or reject the application.";
    let color = "red";

    if (totalScore >= 85) {
      grade = "A";
      rating = "ATS Ready";
      summaryDesc = "Excellent! Your resume adheres strictly to ATS formatting conventions, strong keyword distribution, and clear structure.";
      color = "green";
    } else if (totalScore >= 70) {
      grade = "B";
      rating = "Competitive";
      summaryDesc = "Good foundation with high readability. Resolving a few minor gaps will elevate you into the top applicant tier.";
      color = "blue";
    } else if (totalScore >= 50) {
      grade = "C";
      rating = "Needs Improvement";
      summaryDesc = "Multiple ATS compatibility gaps or missing sections detected. High chance of being ranked lower by applicant tracking systems.";
      color = "orange";
    }

    const allProblems = [
      ...(formattingRes.problems || []),
      ...(sectionRes.problems || []),
      ...(contactRes.problems || []),
      ...(keywordRes.problems || []),
      ...(jdRes.problems || [])
    ];

    const allStrengths = [
      ...(formattingRes.positivePoints || []),
      ...(sectionRes.positivePoints || []),
      ...(contactRes.positivePoints || []),
      ...(keywordRes.positivePoints || []),
      ...(jdRes.positivePoints || [])
    ];

    const criticalIssues = allProblems.filter(p => p.severity === "CRITICAL");
    const warnings = allProblems.filter(p => p.severity === "WARNING");
    const recommendations = allProblems.filter(p => p.severity === "INFO");

    return {
      overallScore: totalScore,
      grade,
      rating,
      summaryDesc,
      color,
      subscores: {
        formatting: { score: fmtScore, max: 20, label: "Formatting & Density" },
        sections: { score: secScore, max: 20, label: "Section Completeness" },
        contact: { score: cntScore, max: 15, label: "Contact Information" },
        keywords: { score: kwScore, max: 20, label: "Skills & Action Verbs" },
        jdMatch: { score: jdScore, max: 25, label: "Job Description Alignment" }
      },
      issueCounts: {
        critical: criticalIssues.length,
        warnings: warnings.length,
        recommendations: recommendations.length,
        total: allProblems.length
      },
      criticalIssues,
      warnings,
      recommendations,
      allProblems,
      strengths: allStrengths
    };
  }
}

module.exports = ATSScorer;
