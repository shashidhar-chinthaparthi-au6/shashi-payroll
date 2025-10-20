const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/payroll', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Get a client user to associate activities with
      const clientUser = await User.findOne({ role: 'client' });
      if (!clientUser) {
        console.log('No client user found');
        return;
      }

      const organizationId = clientUser.organizationId;
      console.log('Creating activities for organization:', organizationId);

      // Create sample activities
      const activities = [
        {
          actor: clientUser._id,
          type: 'user',
          action: 'New employee John Doe was added to the organization',
          meta: {
            employeeName: 'John Doe',
            position: 'Software Developer',
            organizationId: organizationId
          }
        },
        {
          actor: clientUser._id,
          type: 'organization',
          action: 'Attendance marked for 5 employees today',
          meta: {
            count: 5,
            date: new Date().toISOString().split('T')[0],
            organizationId: organizationId
          }
        },
        {
          actor: clientUser._id,
          type: 'organization',
          action: 'Monthly payroll generated for October 2024',
          meta: {
            month: 'October',
            year: 2024,
            employeeCount: 8,
            organizationId: organizationId
          }
        },
        {
          actor: clientUser._id,
          type: 'user',
          action: 'Leave request approved for Sarah Johnson',
          meta: {
            employeeName: 'Sarah Johnson',
            leaveType: 'Sick Leave',
            days: 2,
            organizationId: organizationId
          }
        },
        {
          actor: clientUser._id,
          type: 'contractor',
          action: 'New contractor Mike Wilson was onboarded',
          meta: {
            contractorName: 'Mike Wilson',
            rate: '$50/hour',
            organizationId: organizationId
          }
        },
        {
          actor: clientUser._id,
          type: 'settings',
          action: 'System settings updated - Currency changed to INR',
          meta: {
            setting: 'Currency',
            oldValue: 'USD',
            newValue: 'INR',
            organizationId: organizationId
          }
        }
      ];

      // Clear existing activities for this organization
      await Activity.deleteMany({ organizationId });
      console.log('Cleared existing activities');

      // Create new activities
      for (const activityData of activities) {
        const activity = new Activity(activityData);
        await activity.save();
        console.log(`Created activity: ${activity.description}`);
      }

      console.log(`✅ Created ${activities.length} sample activities for organization ${organizationId}`);
      
    } catch (error) {
      console.error('Error creating activities:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Connection error:', err));
