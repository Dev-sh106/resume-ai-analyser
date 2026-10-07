/**
 * OpenAI integration and rule-based fallback for resume coaching and bullet suggestions.
 */

const { OpenAI } = require("openai");

class OpenAIService {
  static async generateSuggestions({
    resumeText,
    scoreData,
    jdData,
    apiKey = process.env.OPENAI_API_KEY,
    model = "gpt-4o-mini"
  }) {
    const key = apiKey || process.env.OPENAI_API_KEY;

    if (key && key.trim()) {
      try {
        return await this.callOpenAI({ resumeText, scoreData, jdData, apiKey: key.trim(), model });
      } catch (err) {
        console.warn("OpenAI API call failed, using rule-based fallback:", err.message);
        const fallback = this.generateFallbackSuggestions({ resumeText, scoreData, jdData });
        fallback.llmNote = `OpenAI unavailable (${err.message}). Showing rule-based advice instead.`;
        return fallback;
      }
    } else {
      const fallback = this.generateFallbackSuggestions({ resumeText, scoreData, jdData });
      fallback.llmNote = "No OPENAI_API_KEY configured. Showing rule-based advice.";
      return fallback;
    }
  }

  static async generateBulletForSkill({ skill, resumeText = "", jdText = "", apiKey = process.env.OPENAI_API_KEY }) {
    const key = apiKey || process.env.OPENAI_API_KEY;

    if (key && key.trim()) {
      try {
        const openai = new OpenAI({ apiKey: key.trim() });
        const prompt = `You are a resume writing coach helping a candidate add a missing skill to their resume.
The candidate's resume does not mention "${skill}", which is required in the target job.

Write a single resume bullet point demonstrating experience with "${skill}".
- Use a strong action verb.
- Base it on what the candidate's resume already shows about their background.
- If you don't have enough context to include a real metric, use a placeholder like [add your metric here].
- Do NOT invent specific numbers, percentages, or dollar amounts.

Resume context:
"""
${resumeText.slice(0, 2000)}
"""

Respond with a JSON object:
{ "bullet": "...", "skill": "${skill}" }`;

        const res = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
          temperature: 0.4
        });
        const parsed = JSON.parse(res.choices[0]?.message?.content || "{}");
        if (parsed.bullet) {
          return { bullet: parsed.bullet, skill, source: "OpenAI GPT-4o-mini" };
        }
      } catch (err) {
        console.warn("Bullet generation fallback:", err.message);
      }
    }

    // Rule-based fallback: generic templates with metric placeholders
    const skillLower = (skill || "").toLowerCase();
    let template;

    if (["docker", "kubernetes", "k8s", "terraform", "ci/cd", "jenkins", "helm"].some(k => skillLower.includes(k))) {
      template = `Improved deployment reliability using ${skill} by automating infrastructure workflows and reducing manual steps — add a metric (e.g. deployment time, error rate) if you have one.`;
    } else if (["aws", "azure", "gcp", "cloud", "lambda"].some(k => skillLower.includes(k))) {
      template = `Migrated services to ${skill}, reducing infrastructure management overhead — include a specific metric (cost, latency, or uptime) if you have one.`;
    } else if (["sql", "postgresql", "postgres", "redis", "mongodb", "database"].some(k => skillLower.includes(k))) {
      template = `Optimized data access using ${skill}, improving query performance — add a specific improvement metric if you have one.`;
    } else if (["communication", "leadership", "mentorship", "management", "collaboration"].some(k => skillLower.includes(k))) {
      template = `Applied ${skill} skills while working with cross-functional teams to deliver project goals on schedule.`;
    } else {
      template = `Used ${skill} to improve team workflows and project outcomes — add a specific metric or example if you have one.`;
    }

    return {
      bullet: template,
      skill,
      source: "Rule-based suggestion (edit before using)"
    };
  }

  static async callOpenAI({ resumeText, scoreData, jdData, apiKey, model }) {
    const openai = new OpenAI({ apiKey });

    const criticalList = (scoreData.criticalIssues || []).map(c => `- ${c.issue}: ${c.suggestion}`).join("\n");
    const warningList = (scoreData.warnings || []).map(w => `- ${w.issue}: ${w.suggestion}`).join("\n");
    const missingSkills = (jdData.missingSkills || []).slice(0, 10).join(", ") || "None identified";

    const prompt = `You are a resume coach helping a candidate improve their resume.
ATS Score: ${scoreData.overallScore}/100 (${scoreData.rating})

Issues detected:
${criticalList || "None"}

Warnings:
${warningList || "None"}

Skills missing from the job description:
${missingSkills}

Resume excerpt:
"""
${resumeText.slice(0, 3500)}
"""

Please provide feedback in the following sections:

### 1. Overview
Write 2-3 sentences explaining why the resume scored this way and what the main gaps are.

### 2. Bullet Point Improvements (STAR Method)
Pick up to 3 weak or vague bullets from the resume and suggest stronger rewrites.
For each:
- **Original:** ...
- **Suggested:** ...
- **Why:** ...

Important: only rewrite bullets that exist in the resume. Do not invent experience or metrics the candidate did not mention. If a bullet already has a metric, keep it. If it doesn't, you can suggest adding one with a placeholder like [add your metric].

### 3. Missing Keywords
Explain how the candidate could naturally incorporate the missing skills listed above into their resume.

### 4. Priority Fixes
List the top 3-5 changes to make first, in order of importance.`;

    const response = await openai.chat.completions.create({
      model: model || "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1500
    });

    return {
      source: "OpenAI API",
      model: model || "gpt-4o-mini",
      markdownFeedback: response.choices[0]?.message?.content || "",
      isLiveLLM: true
    };
  }

  static generateFallbackSuggestions({ resumeText, scoreData, jdData }) {
    const score = scoreData.overallScore || 0;
    const rating = scoreData.rating || "Needs Improvement";
    const missingSkills = jdData.missingSkills || [];
    const critical = scoreData.criticalIssues || [];
    const warnings = scoreData.warnings || [];

    // Find actual bullet points from the resume to show as examples
    const lines = (resumeText || "").split("\n").map(l => l.trim()).filter(l => l.length > 30);
    const sampleBullets = [];

    for (const line of lines) {
      if (/^[•\-*▪▫\d+\.]/.test(line) || /^(responsible for|worked on|helped|assisted|developed|created)/i.test(line)) {
        const clean = line.replace(/^[•\-*▪▫\d+\.\s]+/, "");
        sampleBullets.push(clean);
        if (sampleBullets.length >= 3) break;
      }
    }

    // Generic examples used only when no bullets found in the resume
    const usedPlaceholders = sampleBullets.length === 0;
    if (usedPlaceholders) {
      sampleBullets.push(
        "Responsible for developing backend features and fixing bugs.",
        "Worked with team members on database performance tasks.",
        "Helped implement new user interfaces with the design team."
      );
    }

    // Rewrite suggestions that show the pattern without inventing specific metrics
    const rewrites = [
      {
        opt: "Built and deployed backend microservices, improving response times — add a specific metric if you have one (e.g. 'reduced latency by X ms' or 'handled Y requests/day').",
        why: "Replaces vague 'responsible for' with an active verb and shows the impact. Add a real metric from your work."
      },
      {
        opt: "Optimized database queries and indexing strategy, reducing query execution time — include the actual improvement if you measured it.",
        why: "Shows technical ownership. If you tracked query performance, include the numbers."
      },
      {
        opt: "Redesigned core UI components, improving user experience and cross-device compatibility — add a metric (e.g. session duration, error rate) if you have one.",
        why: "Shows initiative. If you ran A/B tests or tracked engagement, mention the result."
      }
    ];

    const md = [];

    md.push("### 1. Overview\n");
    md.push(`Your resume scored **${score}/100 (${rating})**. The parser found **${critical.length} critical issue(s)** and **${warnings.length} warning(s)** affecting how ATS systems will read it.\n`);

    md.push("### 2. Bullet Point Improvements (STAR Method)\n");
    if (usedPlaceholders) {
      md.push("*No clear bullet points were found in the resume. The suggestions below use generic examples — once you have actual bullets, this section will show rewrites of your real content.*\n");
    }
    sampleBullets.slice(0, 3).forEach((orig, i) => {
      const r = rewrites[i % rewrites.length];
      md.push(`**Bullet #${i + 1}**`);
      md.push(`- **Original:** *"${orig}"*`);
      md.push(`- **Suggested pattern:** "${r.opt}"`);
      md.push(`- **Why:** ${r.why}\n`);
    });

    md.push("### 3. Missing Keywords\n");
    if (missingSkills.length > 0) {
      md.push(`The job description mentions these skills that weren't found in your resume: **${missingSkills.slice(0, 8).join(", ")}**.\n\nSuggestions:\n- Add them to your **Skills** section if you genuinely have experience with them.\n- If you've used them in a project or role, mention that in the relevant bullet point.\n- Don't add skills you haven't worked with — it won't hold up in an interview.\n`);
    } else {
      md.push("Your resume covers the key skills well. Make sure your skills section is organized into clear categories (Languages, Frameworks, Tools, etc.) to help the ATS parse them correctly.\n");
    }

    md.push("### 4. Priority Fixes\n");
    let num = 1;
    for (const c of critical) {
      md.push(`${num}. ${c.suggestion}`);
      num++;
    }
    for (const w of warnings.slice(0, 3)) {
      md.push(`${num}. ${w.suggestion}`);
      num++;
    }
    if (num <= 3) {
      md.push(`${num}. If any of your bullets describe a measurable result you remember (time saved, scale, user count), add that number — real metrics make a strong impression.`);
    }

    return {
      source: "Rule-based advisor",
      markdownFeedback: md.join("\n"),
      isLiveLLM: false
    };
  }
}

module.exports = OpenAIService;
