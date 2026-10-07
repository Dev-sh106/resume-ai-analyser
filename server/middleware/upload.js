// Multer middleware for accepting resume file uploads.
// Files are kept in memory (not written to disk) since we parse them immediately.
const multer = require("multer");

const ALLOWED_EXTENSIONS = [".pdf", ".docx", ".doc", ".txt"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max
  fileFilter(req, file, cb) {
    const name = file.originalname.toLowerCase();
    const ok = ALLOWED_EXTENSIONS.some(ext => name.endsWith(ext));
    if (ok) {
      cb(null, true);
    } else {
      cb(new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file."), false);
    }
  }
});

module.exports = upload;
