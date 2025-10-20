const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/payroll', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get the Super Admin user
      const superAdmin = await User.findOne({ role: 'admin' });
      if (!superAdmin) {
        console.log('No Super Admin user found');
        return;
      }

      console.log('Creating Super Admin activities for user:', superAdmin.email);

      // Create Super Admin activities (no organizationId)
      const activities = [
        {
          actor: superAdmin._id,
          type: 'system',
          action: 'System maintenance completed successfully',
          meta: {
            maintenanceType: 'Database Optimization',
            duration: '2 hours',
            status: 'completed'
          }
        },
        {
          actor: superAdmin._id,
          type: 'settings',
          action: 'Global system settings updated',
          meta: {
            setting: 'Default Currency',
            oldValue: 'USD',
            newValue: 'INR'
          }
        },
        {
          actor: superAdmin._id,
          type: 'user',
          action: 'New organization manager created',
          meta: {
            managerName: 'John Smith',
            organizationName: 'Tech Corp',
            email: 'john@techcorp.com'
          }
        },
        {
          actor: superAdmin._id,
          type: 'organization',
          action: 'New organization registered',
          meta: {
            organizationName: 'Tech Corp',
            type: 'Technology',
            employeeCount: 0
          }
        },
        {
          actor: superAdmin._id,
          type: 'system',
          action: 'Security audit completed',
          meta: {
            auditType: 'Full Security Scan',
            vulnerabilities: 0,
            status: 'passed'
          }
        },
        {
          actor: superAdmin._id,
          type: 'settings',
          action: 'System backup completed',
          meta: {
            backupType: 'Full Database Backup',
            size: '2.5 GB',
            status: 'success'
          }
        }
      ];

      // Clear existing Super Admin activities (no organizationId)
      await Activity.deleteMany({ 
        $or: [
          { 'meta.organizationId': { $exists: false } },
          { 'meta.organizationId': null }
        ]
      });
      console.log('Cleared existing Super Admin activities');

      // Create new Super Admin activities
      for (const activityData of activities) {
        const activity = new Activity(activityData);
        await activity.save();
        console.log(`Created Super Admin activity: ${activity.action}`);
      }

      console.log(`✅ Created ${activities.length} Super Admin activities`);
      
    } catch (error) {
      console.error('Error creating Super Admin activities:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Connection error:', err));
