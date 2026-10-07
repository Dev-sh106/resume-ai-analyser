// Extracts text from PDF, DOCX, or TXT file buffers.
// Returns an object with the text, word count, page count, and lines.
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

// Normalises common encoding quirks found in PDF/DOCX exports
function normalizeText(text) {
  if (!text) return "";

  const replacements = {
    "ﬁ": "fi", "ﬂ": "fl", "ﬀ": "ff", "ﬃ": "ffi", "ﬄ": "ffl",
    "\u2018": "'", "\u2019": "'", "\u201c": '"', "\u201d": '"',
    "\u2013": "-", "\u2014": "-",
    "\xa0": " ",   // non-breaking space
    "\u200b": ""   // zero-width space
  };

  let result = text;
  for (const [from, to] of Object.entries(replacements)) {
    result = result.split(from).join(to);
  }

  return result
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// Shared: turn normalized text into the metadata object every checker expects
function buildMeta(text, pageCount, fileType) {
  const normalized = normalizeText(text);
  const lines = normalized.split("\n").map(l => l.trim()).filter(Boolean);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  return {
    text: normalized,
    pageCount,
    wordCount,
    charCount: normalized.length,
    lineCount: lines.length,
    lines,
    isScannedWarning: normalized.length < 100 && pageCount > 0,
    fileType
  };
}

async function extractFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return buildMeta(data.text, data.numpages || 1, "PDF");
  } catch (err) {
    console.warn("[documentExtractor] pdf-parse failed, trying raw extraction:", err.message);
    // Last-resort fallback: pull text segments from raw PDF bytes
    const raw = buffer.toString("binary");
    const segments = raw.match(/\(([^()]+)\)[\s]*Tj/g) || [];
    const fallbackText = segments.map(s => s.replace(/^\(|\)[\s]*Tj$/g, "")).join(" ");
    return buildMeta(fallbackText, 1, "PDF");
  }
}

async function extractFromDocx(buffer) {
  const result = await mammoth.extractRawText({ buffer });
  const text = result.value;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return buildMeta(text, Math.max(1, Math.round(wordCount / 450)), "DOCX");
}

function extractFromTxt(buffer) {
  const text = Buffer.isBuffer(buffer) ? buffer.toString("utf-8") : buffer;
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return buildMeta(text, Math.max(1, Math.round(wordCount / 450)), "TXT");
}

// Main entry: pick the right extractor based on file extension
async function extract(fileBuffer, filename = "") {
  const name = filename.toLowerCase();
  if (name.endsWith(".pdf")) return extractFromPdf(fileBuffer);
  if (name.endsWith(".docx") || name.endsWith(".doc")) return extractFromDocx(fileBuffer);
  return extractFromTxt(fileBuffer);
}

module.exports = { extract };
