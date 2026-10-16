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
    // In Node.js, Buffer is often a slice of an internal ArrayBuffer pool (Buffer.poolSize = 8192).
    // PDF.js in pdf-parse accesses buffer.buffer directly and ignores byteOffset,
    // which causes 'bad XRef entry' errors when byteOffset > 0.
    // Creating a standalone Uint8Array copy guarantees byteOffset = 0.
    const standaloneBuffer = Buffer.isBuffer(buffer)
      ? new Uint8Array(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
      : buffer;

    const data = await pdfParse(standaloneBuffer);
    return buildMeta(data.text, data.numpages || 1, "PDF");
  } catch (err) {
    console.warn("[documentExtractor] pdf-parse failed, trying raw extraction:", err.message);
    // Fallback 1: pull text segments from raw PDF bytes
    const raw = buffer.toString("binary");
    const segments = raw.match(/\(([^()]+)\)[\s]*Tj/g) || [];
    const fallbackText = segments.map(s => s.replace(/^\(|\)[\s]*Tj$/g, "")).join(" ");
    if (fallbackText.trim().length > 30) {
      return buildMeta(fallbackText, 1, "PDF");
    }

    // Fallback 2: check if buffer is actually plain text (e.g. rescan with .pdf name)
    const textFallback = buffer.toString("utf-8");
    if (textFallback.trim().length > 30) {
      return buildMeta(textFallback, 1, "TXT");
    }

    return buildMeta(fallbackText, 1, "PDF");
  }
}

async function extractFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value;
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return buildMeta(text, Math.max(1, Math.round(wordCount / 450)), "DOCX");
  } catch (err) {
    console.warn("[documentExtractor] docx extraction failed, trying text fallback:", err.message);
    const textFallback = buffer.toString("utf-8");
    if (textFallback.trim().length > 30) {
      return buildMeta(textFallback, 1, "TXT");
    }
    return buildMeta("", 1, "DOCX");
  }
}

function extractFromTxt(buffer) {
  const text = Buffer.isBuffer(buffer) ? buffer.toString("utf-8") : (typeof buffer === "string" ? buffer : "");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return buildMeta(text, Math.max(1, Math.round(wordCount / 450)), "TXT");
}

// Main entry: pick the right extractor based on file extension and magic bytes
async function extract(fileBuffer, filename = "") {
  const name = filename.toLowerCase();

  // If claimed to be PDF, verify it actually contains PDF magic bytes (%PDF-)
  if (name.endsWith(".pdf")) {
    const isRealPdf = Buffer.isBuffer(fileBuffer) &&
      fileBuffer.slice(0, Math.min(fileBuffer.length, 1024))
        .toString("binary").includes("%PDF-");
    if (isRealPdf) {
      return extractFromPdf(fileBuffer);
    }
    // Buffer contains plain text (e.g. extracted resume text resent with .pdf filename on re-scan)
    return extractFromTxt(fileBuffer);
  }

  // If claimed to be DOCX, verify it contains ZIP magic bytes ('PK', 0x50 0x4B)
  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    const isRealZip = Buffer.isBuffer(fileBuffer) &&
      fileBuffer.length >= 2 &&
      fileBuffer[0] === 0x50 &&
      fileBuffer[1] === 0x4B;
    if (isRealZip) {
      return extractFromDocx(fileBuffer);
    }
    return extractFromTxt(fileBuffer);
  }

  return extractFromTxt(fileBuffer);
}

module.exports = { extract, extractFromPdf, extractFromDocx, extractFromTxt, buildMeta };
