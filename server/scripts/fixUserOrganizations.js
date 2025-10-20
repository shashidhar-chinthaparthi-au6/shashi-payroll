const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');

mongoose.connect('mongodb://localhost:27017/payroll', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB');
    
    try {
      // Create organizations for client users
      const clientUsers = await User.find({ role: 'client' });
      console.log('Found client users:', clientUsers.length);
      
      for (const user of clientUsers) {
        if (!user.organizationId) {
          // Create organization for this client
          const org = new Organization({
            name: `${user.name}'s Organization`,
            manager: user._id,
            settings: {
              timezone: 'Asia/Kolkata',
              currency: 'INR'
            },
            contact: {
              email: user.email,
              phone: '+91-9999999999'
            }
          });
          
          await org.save();
          console.log(`Created organization for ${user.name}: ${org._id}`);
          
          // Update user with organizationId
          user.organizationId = org._id;
          await user.save();
          console.log(`Updated user ${user.name} with organizationId: ${org._id}`);
        }
      }
      
      // Update employee users to belong to the first organization
      const firstOrg = await Organization.findOne({});
      if (firstOrg) {
        const employeeUsers = await User.find({ role: 'employee' });
        for (const user of employeeUsers) {
          if (!user.organizationId) {
            user.organizationId = firstOrg._id;
            await user.save();
            console.log(`Updated employee ${user.name} with organizationId: ${firstOrg._id}`);
          }
        }
      }
      
      console.log('✅ All users updated with organizationId');
      
      // Verify the updates
      const updatedUsers = await User.find({});
      console.log('Updated users:');
      updatedUsers.forEach(user => {
        console.log(`- ${user.name} (${user.role}): ${user.organizationId || 'No org'}`);
      });
      
    } catch (error) {
      console.error('Error updating users:', error);
    } finally {
      mongoose.disconnect();
    }
  })
  .catch(err => console.error('Connection error:', err));
