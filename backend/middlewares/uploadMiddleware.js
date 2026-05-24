const multer = require('multer');

// Almacenamiento en memoria: el buffer se persiste posteriormente en MongoDB
const storage = multer.memoryStorage();

const MAX_SIZE_MB = parseInt(process.env.MAX_PDF_MB) || 5;

const pdfFileFilter = (_req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    return cb(new Error('Solo se permiten archivos PDF'));
  }
  if (!/\.pdf$/i.test(file.originalname)) {
    return cb(new Error('La extensión del archivo debe ser .pdf'));
  }
  cb(null, true);
};

const uploadPdf = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

module.exports = { uploadPdf };
