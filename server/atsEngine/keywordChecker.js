/**
 * Keyword & Skill Matching Module for Node.js ATS Engine.
 * Extracts technical and domain skills, computes category distribution,
 * and checks contextual verification within Work Experience.
 */

const SKILL_TAXONOMY = {
  "Programming Languages": [
    "python", "javascript", "typescript", "java", "c\\+\\+", "c#", "golang", "go",
    "rust", "ruby", "php", "swift", "kotlin", "scala", "r", "matlab", "perl",
    "bash", "shell", "powershell", "dart", "solidity", "sql"
  ],
  "Web & Frameworks": [
    "react", "react\\.js", "next\\.js", "angular", "vue", "vue\\.js", "node\\.js",
    "express", "express\\.js", "django", "fastapi", "flask", "spring boot",
    "spring", "asp\\.net", "rails", "ruby on rails", "laravel", "tailwind",
    "tailwind css", "bootstrap", "graphql", "rest api", "restful apis", "html5", "css3"
  ],
  "Cloud & DevOps": [
    "aws", "amazon web services", "azure", "google cloud", "gcp", "docker",
    "kubernetes", "k8s", "terraform", "ci/cd", "continuous integration",
    "github actions", "jenkins", "ansible", "helm", "linux", "nginx", "apache",
    "prometheus", "grafana", "datadog", "cloudformation", "serverless", "lambda"
  ],
  "Databases & Storage": [
    "postgresql", "postgres", "mysql", "mongodb", "redis", "elasticsearch",
    "dynamodb", "sqlite", "cassandra", "snowflake", "bigquery", "redshift",
    "firebase", "supabase", "neo4j", "mariadb", "oracle"
  ],
  "AI, ML & Data": [
    "machine learning", "deep learning", "nlp", "natural language processing",
    "computer vision", "llm", "large language models", "generative ai",
    "pytorch", "tensorflow", "scikit-learn", "sklearn", "pandas", "numpy",
    "opencv", "hugging face", "langchain", "data analysis", "data pipelines",
    "spark", "apache spark", "kafka", "hadoop", "airflow"
  ],
  "Tools & Workflow": [
    "git", "github", "gitlab", "jira", "confluence", "bitbucket", "postman",
    "figma", "docker compose", "vscode", "visual studio", "agile", "scrum",
    "kanban", "unit testing", "pytest", "jest", "cypress"
  ],
  "Soft Skills": [
    "leadership", "communication", "problem solving", "cross-functional collaboration",
    "critical thinking", "teamwork", "time management", "mentorship", "adaptability",
    "stakeholder management", "project management", "negotiation", "analytical skills"
  ]
};

class KeywordChecker {
  static getTaxonomy() {
    return SKILL_TAXONOMY;
  }

  static check(extractionData, sectionData = {}) {
    const text = extractionData.text || "";
    const textLower = text.toLowerCase();
    const expText = (sectionData.sectionText && sectionData.sectionText.experience ? sectionData.sectionText.experience : "").toLowerCase();

    const foundByCategory = {};
    const allFoundSkills = new Set();
    const skillsInExperience = new Set();

    for (const [category, skillList] of Object.entries(SKILL_TAXONOMY)) {
      const matchedInCat = [];
      for (const skillPattern of skillList) {
        let regex;
        if (["c\\+\\+", "c#", "go", "r"].includes(skillPattern)) {
          regex = new RegExp(`(?:^|[\\s,;()\\[\\]\\/])${skillPattern}(?:[\\s,;()\\[\\]\\/]|$)`, "i");
        } else {
          regex = new RegExp(`\\b${skillPattern}\\b`, "i");
        }

        if (regex.test(textLower)) {
          const displayName = skillPattern.replace(/\\\+\\\+/g, "++").replace(/\\\./g, ".");
          matchedInCat.push(displayName);
          allFoundSkills.add(displayName);

          if (expText && regex.test(expText)) {
            skillsInExperience.add(displayName);
          }
        }
      }

      if (matchedInCat.length > 0) {
        foundByCategory[category] = matchedInCat;
      }
    }

    const problems = [];
    const positivePoints = [];
    const totalSkillsCount = allFoundSkills.size;

    if (totalSkillsCount === 0) {
      problems.push({
        severity: "CRITICAL",
        category: "Keywords",
        issue: "No recognized technical or industry skills detected.",
        suggestion: "Add a dedicated 'Skills' section listing your technical proficiencies, tools, and platforms."
      });
    } else if (totalSkillsCount < 6) {
      problems.push({
        severity: "WARNING",
        category: "Keywords",
        issue: `Low skill density (${totalSkillsCount} recognizable skills detected).`,
        suggestion: "Include more explicit tools, languages, and technical keywords relevant to your target role."
      });
    } else {
      positivePoints.push(`Identified ${totalSkillsCount} technical and industry skills across ${Object.keys(foundByCategory).length} categories.`);
    }

    // Contextual verification
    if (totalSkillsCount >= 5 && skillsInExperience.size < 2 && expText) {
      problems.push({
        severity: "INFO",
        category: "Keywords",
        issue: "Skills are listed in the skills section but rarely referenced in your Work Experience bullets.",
        suggestion: "Weave key technologies into your bullet points (e.g., 'Engineered microservices using Python and Docker') to prove hands-on application."
      });
    } else if (skillsInExperience.size >= 4) {
      positivePoints.push(`Strong contextual proof: ${skillsInExperience.size} skills demonstrated within Work Experience bullets.`);
    }

    // Score out of 20
    let score = 20;
    if (totalSkillsCount === 0) {
      score = 2;
    } else if (totalSkillsCount < 5) {
      score -= 8;
    } else if (totalSkillsCount < 10) {
      score -= 4;
    } else if (totalSkillsCount < 14) {
      score -= 2;
    }

    score = Math.max(2, Math.min(20, score));

    return {
      score,
      maxScore: 20,
      totalSkillsCount,
      skillsByCategory: foundByCategory,
      skillsContextualizedInExperience: Array.from(skillsInExperience).sort(),
      allDetectedSkills: Array.from(allFoundSkills).sort(),
      problems,
      positivePoints
    };
  }
}

module.exports = KeywordChecker;
