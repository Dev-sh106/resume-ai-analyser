/**
 * Job Description (JD) Matcher for Node.js ATS Engine.
 * Computes TF-IDF cosine similarity, skill overlap %, and missing required keywords.
 */

const KeywordChecker = require("./keywordChecker");

const STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
  "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
  "can", "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing",
  "don't", "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't",
  "have", "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
  "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
  "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
  "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
  "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should",
  "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
  "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
  "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
  "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
  "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
  "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
  "will", "shall", "work", "team", "years", "role", "looking", "join", "high", "plus", "must", "well"
]);

class JDMatcher {
  static extractJdSkills(jdText) {
    const jdLower = (jdText || "").toLowerCase();
    const taxonomy = KeywordChecker.getTaxonomy();
    const foundSkills = new Set();

    for (const [cat, skillList] of Object.entries(taxonomy)) {
      for (const skillPattern of skillList) {
        let regex;
        if (["c\\+\\+", "c#", "go", "r"].includes(skillPattern)) {
          regex = new RegExp(`(?:^|[\\s,;()\\[\\]\\/])${skillPattern}(?:[\\s,;()\\[\\]\\/]|$)`, "i");
        } else {
          regex = new RegExp(`\\b${skillPattern}\\b`, "i");
        }

        if (regex.test(jdLower)) {
          const displayName = skillPattern.replace(/\\\+\\\+/g, "++").replace(/\\\./g, ".");
          foundSkills.add(displayName);
        }
      }
    }
    return foundSkills;
  }

  static getTermFrequency(text) {
    const tokens = (text || "").toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const tf = {};
    for (const token of tokens) {
      if (!STOP_WORDS.has(token)) {
        tf[token] = (tf[token] || 0) + 1;
      }
    }
    return tf;
  }

  static computeCosineSimilarity(tf1, tf2) {
    const allTokens = new Set([...Object.keys(tf1), ...Object.keys(tf2)]);
    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (const token of allTokens) {
      const v1 = tf1[token] || 0;
      const v2 = tf2[token] || 0;
      dot += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    }

    if (mag1 === 0 || mag2 === 0) return 0;
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  static match(resumeText, jdText) {
    if (!jdText || !jdText.trim()) {
      return {
        hasJd: false,
        score: 25,
        maxScore: 25,
        matchPercentage: null,
        cosineSimilarity: null,
        matchedSkills: [],
        missingSkills: [],
        topJdKeywords: [],
        problems: [],
        positivePoints: ["No job description provided; evaluated against universal industry standards."]
      };
    }

    const jdSkills = this.extractJdSkills(jdText);
    const resumeSkills = this.extractJdSkills(resumeText);
    const resumeSkillsLower = new Set(Array.from(resumeSkills).map(s => s.toLowerCase()));

    const matchedSkills = [];
    const missingSkills = [];

    for (const skill of jdSkills) {
      if (resumeSkillsLower.has(skill.toLowerCase())) {
        matchedSkills.push(skill);
      } else {
        missingSkills.push(skill);
      }
    }

    // TF-IDF style Cosine Similarity
    const tfResume = this.getTermFrequency(resumeText);
    const tfJd = this.getTermFrequency(jdText);
    const cosineSim = this.computeCosineSimilarity(tfResume, tfJd);

    // Skill Overlap Ratio
    const skillOverlapRatio = jdSkills.size > 0 ? (matchedSkills.length / jdSkills.size) : Math.min(1.0, cosineSim * 1.5);

    // Composite Match Percentage (65% skill overlap + 35% cosine similarity scaled)
    const normCosine = Math.min(1.0, cosineSim / 0.55);
    let matchPercentage = Math.round((0.65 * skillOverlapRatio + 0.35 * normCosine) * 100);
    matchPercentage = Math.max(5, Math.min(99, matchPercentage));

    const problems = [];
    const positivePoints = [];

    if (missingSkills.length > 0) {
      const severity = matchPercentage < 50 ? "CRITICAL" : "WARNING";
      problems.push({
        severity,
        category: "JD Match",
        issue: `Missing key requirements from Job Description: ${missingSkills.sort().slice(0, 6).join(", ")}.`,
        suggestion: "Incorporate these missing skills into your Skills and Experience bullet points if you have experience with them."
      });
    }

    if (matchPercentage < 45) {
      problems.push({
        severity: "CRITICAL",
        category: "JD Match",
        issue: `Low overall alignment with job description (${matchPercentage}% match).`,
        suggestion: "Tailor your resume summary and project bullet points to mirror the job title, responsibilities, and technical stack described in the listing."
      });
    } else if (matchPercentage >= 70) {
      positivePoints.push(`Strong alignment with Job Description (${matchPercentage}% match, ${matchedSkills.length} matched core skills).`);
    } else {
      positivePoints.push(`Moderate alignment with Job Description (${matchPercentage}% match).`);
    }

    const score = Math.max(2, Math.min(25, Math.round((matchPercentage / 100) * 25)));

    return {
      hasJd: true,
      score,
      maxScore: 25,
      matchPercentage,
      cosineSimilarity: parseFloat(cosineSim.toFixed(3)),
      matchedSkills: matchedSkills.sort(),
      missingSkills: missingSkills.sort(),
      problems,
      positivePoints
    };
  }
}

module.exports = JDMatcher;
