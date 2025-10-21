const express = require('express');
const router = express.Router();
const { verifyToken, populateUser, checkRole } = require('../middleware/auth');
const PDFGenerator = require('../utils/pdfGenerator');
const STATUS = require('../utils/constants/statusCodes');
const MSG = require('../utils/constants/messages');

// Apply middleware to all PDF routes
router.use(verifyToken);
router.use(populateUser);

// Generate payslip PDF
router.post('/payslip', async (req, res) => {
  try {
    const { payslipData } = req.body;
    
    if (!payslipData) {
      return res.status(STATUS.BAD_REQUEST).json({ message: MSG.BAD_REQUEST || 'Payslip data is required' });
    }
    
    const filename = `payslip_${payslipData.employeeId}_${payslipData.month}_${payslipData.year}.pdf`;
    const { pdfData, filePath } = await PDFGenerator.generateAndSavePayslip(payslipData, filename);
    
    return res.status(STATUS.OK).json({
      data: {
        filename,
        filePath,
        url: `/uploads/${filename}`
      },
      message: MSG.SUCCESS || 'Payslip PDF generated successfully'
    });
  } catch (error) {
    console.error('Generate payslip PDF error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Generate invoice PDF
router.post('/invoice', async (req, res) => {
  try {
    const { invoiceData } = req.body;
    
    if (!invoiceData) {
      return res.status(STATUS.BAD_REQUEST).json({ message: MSG.BAD_REQUEST || 'Invoice data is required' });
    }
    
    const filename = `invoice_${invoiceData.invoiceNumber}.pdf`;
    const { pdfData, filePath } = await PDFGenerator.generateAndSaveInvoice(invoiceData, filename);
    
    return res.status(STATUS.OK).json({
      data: {
        filename,
        filePath,
        url: `/uploads/${filename}`
      },
      message: MSG.SUCCESS || 'Invoice PDF generated successfully'
    });
  } catch (error) {
    console.error('Generate invoice PDF error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Generate attendance report PDF
router.post('/attendance-report', async (req, res) => {
  try {
    const { reportData } = req.body;
    
    if (!reportData) {
      return res.status(STATUS.BAD_REQUEST).json({ message: MSG.BAD_REQUEST || 'Report data is required' });
    }
    
    const filename = `attendance_report_${reportData.employeeId}_${Date.now()}.pdf`;
    const { pdfData, filePath } = await PDFGenerator.generateAndSaveAttendanceReport(reportData, filename);
    
    return res.status(STATUS.OK).json({
      data: {
        filename,
        filePath,
        url: `/uploads/${filename}`
      },
      message: MSG.SUCCESS || 'Attendance report PDF generated successfully'
    });
  } catch (error) {
    console.error('Generate attendance report PDF error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

// Download PDF
router.get('/download/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = require('path').join(__dirname, '../uploads', filename);
    
    if (!require('fs').existsSync(filePath)) {
      return res.status(STATUS.NOT_FOUND).json({ message: MSG.NOT_FOUND || 'File not found' });
    }
    
    res.download(filePath, filename);
  } catch (error) {
    console.error('Download PDF error:', error);
    return res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: MSG.SERVER_ERROR });
  }
});

module.exports = router;
