const Notification = require('../models/Notification');
const STATUS = require('./constants/statusCodes');
const MSG = require('./constants/messages');

class NotificationService {
  // Create a new notification
  static async createNotification({
    recipient,
    sender = null,
    type,
    title,
    message,
    data = {},
    priority = 'medium',
    category = 'info',
    actionUrl = null,
    expiresAt = null
  }) {
    try {
      const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        data,
        priority,
        category,
        actionUrl,
        expiresAt: expiresAt ? new Date(expiresAt) : null
      });
      
      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Create attendance notification
  static async createAttendanceNotification(recipientId, attendanceData) {
    return this.createNotification({
      recipient: recipientId,
      type: 'attendance',
      title: 'Attendance Update',
      message: `Your attendance for ${new Date(attendanceData.date).toLocaleDateString()} has been ${attendanceData.status}`,
      data: attendanceData,
      category: attendanceData.status === 'approved' ? 'success' : 'warning',
      actionUrl: '/employee/attendance'
    });
  }

  // Create leave notification
  static async createLeaveNotification(recipientId, leaveData) {
    return this.createNotification({
      recipient: recipientId,
      type: 'leave',
      title: 'Leave Application Update',
      message: `Your leave application for ${leaveData.type} has been ${leaveData.status}`,
      data: leaveData,
      category: leaveData.status === 'approved' ? 'success' : leaveData.status === 'rejected' ? 'error' : 'info',
      actionUrl: '/employee/apply-leave'
    });
  }

  // Create payroll notification
  static async createPayrollNotification(recipientId, payrollData) {
    return this.createNotification({
      recipient: recipientId,
      type: 'payroll',
      title: 'New Payslip Available',
      message: `Your payslip for ${payrollData.month}/${payrollData.year} is now available`,
      data: payrollData,
      category: 'success',
      actionUrl: '/employee/payslips'
    });
  }

  // Create invoice notification
  static async createInvoiceNotification(recipientId, invoiceData) {
    return this.createNotification({
      recipient: recipientId,
      type: 'invoice',
      title: 'New Invoice Available',
      message: `Your invoice ${invoiceData.invoiceNumber} is now available`,
      data: invoiceData,
      category: 'success',
      actionUrl: '/contractor/invoices'
    });
  }

  // Create contract notification
  static async createContractNotification(recipientId, contractData) {
    return this.createNotification({
      recipient: recipientId,
      type: 'contract',
      title: 'Contract Update',
      message: `Your contract ${contractData.title} has been ${contractData.status}`,
      data: contractData,
      category: contractData.status === 'active' ? 'success' : 'warning',
      actionUrl: '/contractor'
    });
  }

  // Create organization notification
  static async createOrganizationNotification(recipientId, organizationData) {
    return this.createNotification({
      recipient: recipientId,
      type: 'organization',
      title: 'Organization Update',
      message: `Your organization ${organizationData.name} has been updated`,
      data: organizationData,
      category: 'info',
      actionUrl: '/client/dashboard'
    });
  }

  // Create system notification
  static async createSystemNotification(recipientId, systemData) {
    return this.createNotification({
      recipient: recipientId,
      type: 'system',
      title: 'System Notification',
      message: systemData.message,
      data: systemData,
      category: systemData.category || 'info',
      priority: systemData.priority || 'medium'
    });
  }

  // Bulk create notifications
  static async createBulkNotifications(recipients, notificationData) {
    try {
      const notifications = recipients.map(recipientId => ({
        recipient: recipientId,
        ...notificationData
      }));
      
      const createdNotifications = await Notification.insertMany(notifications);
      return createdNotifications;
    } catch (error) {
      console.error('Create bulk notifications error:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        unreadOnly = false,
        type = null,
        priority = null
      } = options;
      
      const query = { recipient: userId };
      
      if (unreadOnly) {
        query.isRead = false;
      }
      
      if (type) {
        query.type = type;
      }
      
      if (priority) {
        query.priority = priority;
      }
      
      const notifications = await Notification.find(query)
        .populate('sender', 'name email')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .lean();
      
      const total = await Notification.countDocuments(query);
      
      return {
        notifications,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { isRead: true, readAt: new Date() },
        { new: true }
      );
      
      return notification;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    try {
      const result = await Notification.updateMany(
        { recipient: userId, isRead: false },
        { isRead: true, readAt: new Date() }
      );
      
      return result;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  // Get unread count
  static async getUnreadCount(userId) {
    try {
      const count = await Notification.countDocuments({
        recipient: userId,
        isRead: false
      });
      
      return count;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId, userId) {
    try {
      const notification = await Notification.findOneAndDelete({
        _id: notificationId,
        recipient: userId
      });
      
      return notification;
    } catch (error) {
      console.error('Delete notification error:', error);
      throw error;
    }
  }

  // Clean up expired notifications
  static async cleanupExpiredNotifications() {
    try {
      const result = await Notification.deleteMany({
        expiresAt: { $lt: new Date() }
      });
      
      console.log(`Cleaned up ${result.deletedCount} expired notifications`);
      return result;
    } catch (error) {
      console.error('Cleanup expired notifications error:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
