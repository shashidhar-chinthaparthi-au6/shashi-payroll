const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {
  // Generate payslip PDF
  static async generatePayslipPDF(payslipData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        
        // Header
        doc.fontSize(20).text('PAYSLIP', { align: 'center' });
        doc.moveDown();
        
        // Company Info
        doc.fontSize(12)
           .text('Company: ' + (payslipData.companyName || 'Payroll System'), 50, 100)
           .text('Employee: ' + payslipData.employeeName, 50, 120)
           .text('Employee ID: ' + payslipData.employeeId, 50, 140)
           .text('Pay Period: ' + payslipData.payPeriod, 50, 160);
        
        // Pay Details
        doc.moveDown();
        doc.fontSize(16).text('Pay Details', 50, 200);
        
        const payDetailsY = 230;
        doc.fontSize(10)
           .text('Basic Salary:', 50, payDetailsY)
           .text('$' + payslipData.basicSalary.toFixed(2), 200, payDetailsY)
           
           .text('Overtime:', 50, payDetailsY + 20)
           .text('$' + (payslipData.overtime || 0).toFixed(2), 200, payDetailsY + 20)
           
           .text('Allowances:', 50, payDetailsY + 40)
           .text('$' + (payslipData.allowances || 0).toFixed(2), 200, payDetailsY + 40)
           
           .text('Deductions:', 50, payDetailsY + 60)
           .text('$' + (payslipData.deductions || 0).toFixed(2), 200, payDetailsY + 60)
           
           .text('Net Pay:', 50, payDetailsY + 80)
           .text('$' + payslipData.netSalary.toFixed(2), 200, payDetailsY + 80);
        
        // Footer
        doc.fontSize(8)
           .text('Generated on: ' + new Date().toLocaleDateString(), 50, 400)
           .text('This is a computer generated document.', 50, 420);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Generate invoice PDF
  static async generateInvoicePDF(invoiceData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        
        // Header
        doc.fontSize(20).text('INVOICE', { align: 'center' });
        doc.moveDown();
        
        // Invoice Info
        doc.fontSize(12)
           .text('Invoice #: ' + invoiceData.invoiceNumber, 50, 100)
           .text('Date: ' + new Date(invoiceData.generatedAt).toLocaleDateString(), 50, 120)
           .text('Contractor: ' + invoiceData.contractorName, 50, 140)
           .text('Organization: ' + invoiceData.organizationName, 50, 160);
        
        // Contract Details
        doc.moveDown();
        doc.fontSize(16).text('Contract Details', 50, 200);
        
        const contractY = 230;
        doc.fontSize(10)
           .text('Contract: ' + invoiceData.contractTitle, 50, contractY)
           .text('Period: ' + new Date(invoiceData.periodStart).toLocaleDateString() + ' - ' + new Date(invoiceData.periodEnd).toLocaleDateString(), 50, contractY + 20)
           .text('Billable Hours: ' + invoiceData.billableHours, 50, contractY + 40)
           .text('Rate: $' + invoiceData.rateAmount + ' per hour', 50, contractY + 60);
        
        // Amount Details
        doc.moveDown();
        doc.fontSize(16).text('Amount Details', 50, 320);
        
        const amountY = 350;
        doc.fontSize(10)
           .text('Gross Amount:', 50, amountY)
           .text('$' + invoiceData.grossAmount.toFixed(2), 200, amountY);
        
        if (invoiceData.deductions && invoiceData.deductions.length > 0) {
          invoiceData.deductions.forEach((deduction, index) => {
            doc.text(deduction.type + ':', 50, amountY + 20 + (index * 20))
               .text('$' + deduction.amount.toFixed(2), 200, amountY + 20 + (index * 20));
          });
        }
        
        doc.text('Net Amount:', 50, amountY + 100)
           .text('$' + invoiceData.netAmount.toFixed(2), 200, amountY + 100);
        
        // Footer
        doc.fontSize(8)
           .text('Generated on: ' + new Date().toLocaleDateString(), 50, 500)
           .text('This is a computer generated document.', 50, 520);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Generate attendance report PDF
  static async generateAttendanceReportPDF(reportData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];
        
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });
        
        // Header
        doc.fontSize(20).text('ATTENDANCE REPORT', { align: 'center' });
        doc.moveDown();
        
        // Report Info
        doc.fontSize(12)
           .text('Employee: ' + reportData.employeeName, 50, 100)
           .text('Period: ' + reportData.startDate + ' to ' + reportData.endDate, 50, 120)
           .text('Total Days: ' + reportData.totalDays, 50, 140)
           .text('Present Days: ' + reportData.presentDays, 50, 160)
           .text('Absent Days: ' + reportData.absentDays, 50, 180);
        
        // Attendance Table
        doc.moveDown();
        doc.fontSize(16).text('Attendance Details', 50, 220);
        
        const tableY = 250;
        doc.fontSize(10);
        
        // Table Header
        doc.text('Date', 50, tableY)
           .text('Check In', 150, tableY)
           .text('Check Out', 250, tableY)
           .text('Hours', 350, tableY)
           .text('Status', 450, tableY);
        
        // Table Rows
        reportData.attendance.forEach((record, index) => {
          const rowY = tableY + 20 + (index * 20);
          doc.text(new Date(record.date).toLocaleDateString(), 50, rowY)
             .text(record.checkIn ? new Date(record.checkIn.time).toLocaleTimeString() : '-', 150, rowY)
             .text(record.checkOut ? new Date(record.checkOut.time).toLocaleTimeString() : '-', 250, rowY)
             .text(record.workingHours ? record.workingHours.toFixed(1) + 'h' : '-', 350, rowY)
             .text(record.status, 450, rowY);
        });
        
        // Footer
        doc.fontSize(8)
           .text('Generated on: ' + new Date().toLocaleDateString(), 50, 500)
           .text('This is a computer generated document.', 50, 520);
        
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }
  
  // Save PDF to file
  static async savePDFToFile(pdfData, filename) {
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, pdfData);
    return filePath;
  }
  
  // Generate PDF and save to file
  static async generateAndSavePayslip(payslipData, filename) {
    const pdfData = await this.generatePayslipPDF(payslipData);
    const filePath = await this.savePDFToFile(pdfData, filename);
    return { pdfData, filePath };
  }
  
  static async generateAndSaveInvoice(invoiceData, filename) {
    const pdfData = await this.generateInvoicePDF(invoiceData);
    const filePath = await this.savePDFToFile(pdfData, filename);
    return { pdfData, filePath };
  }
  
  static async generateAndSaveAttendanceReport(reportData, filename) {
    const pdfData = await this.generateAttendanceReportPDF(reportData);
    const filePath = await this.savePDFToFile(pdfData, filename);
    return { pdfData, filePath };
  }
}

module.exports = PDFGenerator;
