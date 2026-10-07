/**
 * Main Deterministic ATS Engine for Node.js backend.
 */

const FormattingChecker = require("./formattingChecker");
const SectionChecker = require("./sectionChecker");
const ContactChecker = require("./contactChecker");
const KeywordChecker = require("./keywordChecker");
const JDMatcher = require("./jdMatcher");
const ATSScorer = require("./scoring");

class DeterministicATSEngine {
  static analyze(extractionData, jobDescription = null) {
    const resumeText = extractionData.text || "";

    const formatting = FormattingChecker.check(extractionData);
    const sections = SectionChecker.check(extractionData);
    const contact = ContactChecker.check(extractionData);
    const keywords = KeywordChecker.check(extractionData, sections);
    const jdMatch = JDMatcher.match(resumeText, jobDescription);

    const scoring = ATSScorer.compute({
      formattingRes: formatting,
      sectionRes: sections,
      contactRes: contact,
      keywordRes: keywords,
      jdRes: jdMatch
    });

    return {
      extraction: extractionData,
      formatting,
      sections,
      contact,
      keywords,
      jdMatch,
      scoring
    };
  }
}

module.exports = DeterministicATSEngine;
