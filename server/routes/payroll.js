const express = require('express');
const router = express.Router();
const PayrollService = require('../utils/payrollService');
const { verifyToken } = require('../middleware/auth');

/**
 * Generate monthly payroll for a shop
 *
 * @example
 * curl -X POST http://localhost:3000/api/payroll/generate/123456789 \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN" \
 *   -H "Content-Type: application/json" \
 *   -d '{"month": 5, "year": 2024}'
 */
// Generate monthly payroll (shop removed)
router.post('/generate', verifyToken, async (req, res) => {
    try {
        const { month, year } = req.body;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        const payrollEntries = await PayrollService.generateMonthlyPayroll(null, month, year);
        res.status(201).json(payrollEntries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get payroll summary for a shop
 *
 * @example
 * curl -X GET "http://localhost:3000/api/payroll/summary/123456789?month=5&year=2024" \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 */
// Get payroll summary (shop removed)
router.get('/summary', verifyToken, async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({ error: 'Month and year are required' });
        }

        const summary = await PayrollService.getShopPayrollSummary(null, parseInt(month), parseInt(year));
        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Approve payroll entry
 *
 * @example
 * curl -X POST http://localhost:3000/api/payroll/approve/123456789 \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 */
// Approve payroll entry
router.post('/approve/:payrollId', verifyToken, async (req, res) => {
    try {
        const { payrollId } = req.params;
        const approverId = req.userId; // Updated to match middleware

        const approvedPayroll = await PayrollService.approvePayroll(payrollId, approverId);
        res.json(approvedPayroll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * Get individual payroll entry
 *
 * @example
 * curl -X GET http://localhost:3000/api/payroll/123456789 \
 *   -H "Authorization: Bearer YOUR_JWT_TOKEN"
 */
// Get individual payroll entry
router.get('/:payrollId', verifyToken, async (req, res) => {
    try {
        const { payrollId } = req.params;
        const payroll = await Payroll.findById(payrollId)
            .populate('employee', 'name')
            .populate('approvedBy', 'name');

        if (!payroll) {
            return res.status(404).json({ error: 'Payroll entry not found' });
        }

        res.json(payroll);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 