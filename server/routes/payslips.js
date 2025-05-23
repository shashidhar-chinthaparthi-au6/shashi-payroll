const Payslip = require("../models/Payslip");

// Get employee's payslips
router.get('/employee', verifyToken, checkRole(['employee']), async (req, res) => {
  try {
    const employeeId = req.userId;
    console.log('Fetching payslips for employee:', employeeId);

    const payslips = await Payslip.find({ employeeId: employeeId })
      .sort({ year: -1, month: -1 })
      .lean();

    console.log('Found payslips:', payslips.length);

    // Transform the data to match the frontend interface
    const formattedPayslips = payslips.map(payslip => ({
      _id: payslip._id,
      date: payslip.date,
      basicSalary: payslip.basicSalary,
      allowances: payslip.allowances,
      deductions: payslip.deductions,
      netSalary: payslip.netSalary,
      status: payslip.status,
      month: payslip.month,
      year: payslip.year
    }));

    res.json(formattedPayslips);
  } catch (error) {
    console.error('Error fetching employee payslips:', error);
    res.status(500).json({ error: error.message });
  }
}); 