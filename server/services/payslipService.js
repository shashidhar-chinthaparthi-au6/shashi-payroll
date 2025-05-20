const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const Payroll = require('../models/Payroll');
const nodemailer = require('nodemailer');

class PayslipService {
  constructor() {
    // Create uploads directory if it doesn't exist
    this.uploadsDir = path.join(__dirname, '../uploads/payslips');
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async generatePayslip(employeeId, month, year) {
    try {
      // Get employee details
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Get attendance for the month
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0);
      const attendance = await Attendance.find({
        employee: employeeId,
        date: { $gte: startDate, $lte: endDate }
      });

      // Calculate attendance stats
      const attendanceStats = {
        present: attendance.filter(a => a.status === 'present').length,
        absent: attendance.filter(a => a.status === 'absent').length,
        late: attendance.filter(a => a.status === 'late').length,
        halfDay: attendance.filter(a => a.status === 'half-day').length
      };

      // Get payroll information
      const payroll = await Payroll.findOne({ 
        employee: employeeId,
        month,
        year
      });
      if (!payroll) {
        throw new Error('Payroll information not found');
      }

      // Debug log payroll object
      console.log('DEBUG: payroll object before PDF generation:', JSON.stringify(payroll));

      // Fallback for missing fields
      payroll.allowances = payroll.allowances || [];
      payroll.deductions = payroll.deductions || [];

      // Generate PDF
      const pdfPath = await this.generatePDF(employee, payroll, attendanceStats, month, year);

      // Create payslip record
      const payslip = new Payslip({
        employee: employeeId,
        month,
        year,
        basicSalary: payroll.dailySalary * attendanceStats.present,
        allowances: payroll.allowances || [],
        deductions: payroll.deductions || [],
        netSalary: payroll.totalAmount,
        attendance: attendanceStats,
        pdfUrl: pdfPath
      });

      await payslip.save();
      return payslip;
    } catch (error) {
      throw error;
    }
  }

  async generatePDF(employee, payroll, attendance, month, year) {
    // Debug log for allowances and deductions
    console.log('DEBUG: payroll.allowances:', payroll.allowances);
    console.log('DEBUG: payroll.deductions:', payroll.deductions);
    const doc = new PDFDocument();
    const fileName = `payslip_${employee._id}_${year}_${month}.pdf`;
    const filePath = path.join(this.uploadsDir, fileName);
    
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Add company header
    doc.fontSize(20).text('PAYSLIP', { align: 'center' });
    doc.moveDown();

    // Employee details
    doc.fontSize(12);
    doc.text(`Employee Name: ${employee.firstName} ${employee.lastName}`);
    doc.text(`Employee ID: ${employee._id}`);
    doc.text(`Position: ${employee.position}`);
    doc.text(`Month: ${this.getMonthName(month)} ${year}`);
    doc.moveDown();

    // Salary details
    doc.text('Salary Details', { underline: true });
    doc.text(`Daily Salary: ${payroll.dailySalary}`);
    doc.text(`Days Worked: ${attendance.present}`);
    doc.text(`Total Amount: ${payroll.totalAmount}`);
    doc.moveDown();

    // Allowances
    doc.text('Allowances:');
    const allowances = payroll.allowances || [];
    allowances.forEach(allowance => {
      doc.text(`  ${allowance.name}: ${allowance.amount}`);
    });

    // Deductions
    doc.text('Deductions:');
    const deductions = payroll.deductions || [];
    deductions.forEach(deduction => {
      doc.text(`  ${deduction.name}: ${deduction.amount}`);
    });
    doc.moveDown();

    // Attendance details
    doc.text('Attendance Summary', { underline: true });
    doc.text(`Present Days: ${attendance.present}`);
    doc.text(`Absent Days: ${attendance.absent}`);
    doc.text(`Late Days: ${attendance.late}`);
    doc.text(`Half Days: ${attendance.halfDay}`);

    // Footer
    doc.moveDown(2);
    doc.fontSize(10).text('This is a computer generated document and does not require signature.', { align: 'center' });

    doc.end();

    return new Promise((resolve, reject) => {
      stream.on('finish', () => resolve(`/uploads/payslips/${fileName}`));
      stream.on('error', reject);
    });
  }

  getMonthName(month) {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return months[month - 1];
  }

  async sendPayslipEmail(payslipId) {
    const payslip = await Payslip.findById(payslipId)
      .populate('employee')
      .populate('approvedBy');

    if (!payslip) {
      throw new Error('Payslip not found');
    }

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      // Configure your email service here
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const pdfPath = path.join(__dirname, '..', payslip.pdfUrl);

    // Send email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: payslip.employee.email,
      subject: `Payslip for ${this.getMonthName(payslip.month)} ${payslip.year}`,
      text: `Dear ${payslip.employee.name},\n\nPlease find attached your payslip for ${this.getMonthName(payslip.month)} ${payslip.year}.\n\nBest regards,\nHR Department`,
      attachments: [{
        filename: `payslip_${payslip.month}_${payslip.year}.pdf`,
        path: pdfPath
      }]
    });
  }
}

module.exports = new PayslipService(); 