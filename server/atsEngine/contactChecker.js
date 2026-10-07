/**
 * Contact Information Checker for Node.js ATS Engine.
 * Validates presence and format of email, phone, LinkedIn, GitHub/Portfolio, and location.
 */

class ContactChecker {
  static EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
  static PHONE_REGEX = /(?:(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}(?:[\s-]?\d{1,4})?)/g;
  static LINKEDIN_REGEX = /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/(?:in|profile)\/[a-zA-Z0-9_-]+|linkedin\.com\/in\/[a-zA-Z0-9_-]+/i;
  static GITHUB_REGEX = /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i;
  static PORTFOLIO_REGEX = /(?:https?:\/\/)?(?:www\.)?(?:[a-zA-Z0-9-]+\.(?:dev|io|me|app|design|tech|site|org|co))(?:\/[^\s]*)?/i;

  static check(extractionData) {
    const text = extractionData.text || "";
    const headerText = text.slice(0, 1500);

    const problems = [];
    const positivePoints = [];

    // 1. Email check
    const emailMatch = text.match(this.EMAIL_REGEX);
    const foundEmail = emailMatch ? emailMatch[0] : null;

    if (!foundEmail) {
      problems.push({
        severity: "CRITICAL",
        category: "Contact Info",
        issue: "No email address found.",
        suggestion: "Include a visible, professional email address at the very top of your resume."
      });
    } else {
      positivePoints.push(`Email detected: ${foundEmail}`);
      const handle = foundEmail.split("@")[0].toLowerCase();
      const unpro = ["cool", "sexy", "guy", "gamer", "ninja", "party", "boss", "dude"];
      if (unpro.some(k => handle.includes(k))) {
        problems.push({
          severity: "INFO",
          category: "Contact Info",
          issue: `Email '${foundEmail}' might appear informal.`,
          suggestion: "Use a clean firstname.lastname@domain.com email format for professional applications."
        });
      }
    }

    // 2. Phone check
    const phoneCandidates = text.match(this.PHONE_REGEX) || [];
    const validPhones = phoneCandidates.filter(p => (p.replace(/\D/g, "").length >= 10));
    const foundPhone = validPhones.length > 0 ? validPhones[0].trim() : null;

    if (!foundPhone) {
      problems.push({
        severity: "CRITICAL",
        category: "Contact Info",
        issue: "No valid phone number detected.",
        suggestion: "Include a standard phone number with country/area code."
      });
    } else {
      positivePoints.push(`Phone number detected: ${foundPhone}`);
    }

    // 3. LinkedIn check
    const linkedinMatch = text.match(this.LINKEDIN_REGEX);
    let foundLinkedin = linkedinMatch ? linkedinMatch[0] : null;

    if (!foundLinkedin) {
      if (text.toLowerCase().includes("linkedin")) {
        foundLinkedin = "LinkedIn mentioned";
        positivePoints.push("LinkedIn profile mentioned.");
      } else {
        problems.push({
          severity: "WARNING",
          category: "Contact Info",
          issue: "No LinkedIn profile URL found.",
          suggestion: "Add a customized LinkedIn URL (e.g., linkedin.com/in/yourname) in your contact header."
        });
      }
    } else {
      positivePoints.push(`LinkedIn URL detected: ${foundLinkedin}`);
    }

    // 4. GitHub / Portfolio check
    const githubMatch = text.match(this.GITHUB_REGEX);
    const foundGithub = githubMatch ? githubMatch[0] : null;

    const portfolioMatch = text.match(this.PORTFOLIO_REGEX);
    const foundPortfolio = portfolioMatch ? portfolioMatch[0] : null;

    if (foundGithub) positivePoints.push(`GitHub link detected: ${foundGithub}`);
    if (foundPortfolio) positivePoints.push(`Portfolio link detected: ${foundPortfolio}`);

    // 5. Location check
    const locationKeywords = [
      "remote", "hybrid", "ca", "ny", "tx", "wa", "sf", "london",
      "bangalore", "bengaluru", "delhi", "mumbai", "hyderabad", "pune",
      "new york", "san francisco", "seattle", "austin", "toronto", "berlin",
      "singapore", "sydney", "chicago", "boston"
    ];
    const cityStateRegex = /\b[A-Z][a-zA-Z\s]{2,15},\s*(?:[A-Z]{2}|[A-Z][a-zA-Z]{2,15})\b/;
    const cityStateMatch = headerText.match(cityStateRegex);
    const hasLocationKw = locationKeywords.some(k => headerText.toLowerCase().includes(k));
    const hasLocation = Boolean(cityStateMatch || hasLocationKw);

    if (!hasLocation) {
      problems.push({
        severity: "WARNING",
        category: "Contact Info",
        issue: "Location / City & State not clearly detected in the header.",
        suggestion: "Add your general location (e.g. 'San Francisco, CA' or 'Remote') so location filters don't exclude you."
      });
    } else {
      const locStr = cityStateMatch ? cityStateMatch[0] : "Location keyword detected";
      positivePoints.push(`Location info found: ${locStr}`);
    }

    // Score out of 15
    let score = 15;
    if (!foundEmail) score -= 6;
    if (!foundPhone) score -= 4;
    if (!foundLinkedin) score -= 3;
    if (!hasLocation) score -= 2;

    score = Math.max(0, Math.min(15, score));

    return {
      score,
      maxScore: 15,
      email: foundEmail,
      phone: foundPhone,
      linkedin: foundLinkedin,
      github: foundGithub,
      portfolio: foundPortfolio,
      hasLocation,
      problems,
      positivePoints
    };
  }
}

module.exports = ContactChecker;
