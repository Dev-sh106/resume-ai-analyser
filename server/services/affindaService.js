// Sends the resume to the Affinda API for parsing.
// Falls back to our local extractor if no API key is configured.
const axios = require("axios");
const FormData = require("form-data");
const { extract } = require("./documentExtractor");

async function parseResume(fileBuffer, filename, apiKeyOverride = null) {
  const apiKey = apiKeyOverride || process.env.AFFINDA_API_KEY;

  if (!apiKey) {
    // No API key: use the built-in extractor
    const local = await extract(fileBuffer, filename);
    return {
      source: "Local parser (pdf-parse / mammoth)",
      isAffindaLive: false,
      text: local.text,
      metadata: local,
      parsedData: null
    };
  }

  try {
    const form = new FormData();
    form.append("file", fileBuffer, { filename });
    form.append("wait", "true");

    const response = await axios.post("https://api.affinda.com/v3/documents", form, {
      headers: { ...form.getHeaders(), Authorization: `Bearer ${apiKey}` },
      timeout: 25000
    });

    const data = response.data?.data || response.data;
    const rawText = data?.rawText || (await extract(fileBuffer, filename)).text;
    const metaFilename = filename.replace(/\.(pdf|docx?)$/i, ".txt");
    const metadata = await extract(Buffer.from(rawText, "utf-8"), metaFilename);

    return {
      source: "Affinda API",
      isAffindaLive: true,
      text: rawText,
      metadata,
      parsedData: {
        name: data?.name?.raw || null,
        email: data?.emails?.[0] || null,
        phone: data?.phoneNumbers?.[0] || null,
        location: data?.location?.formatted || null,
        skills: (data?.skills || []).map(s => s.name),
        workExperience: data?.workExperience || [],
        education: data?.education || []
      }
    };
  } catch (err) {
    console.warn("[affindaService] Affinda API failed, using local extractor:", err.message);
    const local = await extract(fileBuffer, filename);
    return {
      source: "Local parser (fallback after Affinda error)",
      isAffindaLive: false,
      text: local.text,
      metadata: local,
      parsedData: null
    };
  }
}

module.exports = { parseResume };
