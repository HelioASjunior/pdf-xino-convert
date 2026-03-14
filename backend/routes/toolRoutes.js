const express = require('express');
const {
  createPdfFromImages,
  convertPdfToImages,
  compressPdf,
} = require('../controllers/toolController');
const { imageUpload, pdfUpload } = require('../utils/fileStorage');

const router = express.Router();

router.post('/image-to-pdf', imageUpload.array('images', 25), createPdfFromImages);
router.post('/pdf-to-images', pdfUpload.single('pdf'), convertPdfToImages);
router.post('/compress-pdf', pdfUpload.single('pdf'), compressPdf);

module.exports = router;
