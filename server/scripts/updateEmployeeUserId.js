const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/Employee');
const config = require('../config/config');

async function updateEmployeeUserIds() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Find all employees
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process each employee
    for (const employee of employees) {
      try {
        // Skip if already has userId
        if (employee.userId) {
          console.log(`Skipping employee ${employee._id} - already has userId`);
          skipped++;
          continue;
        }

        // Find matching user by email
        const user = await User.findOne({ email: employee.email });
        if (!user) {
          console.log(`No matching user found for employee ${employee._id} with email ${employee.email}`);
          errors++;
          continue;
        }

        // Update employee with userId
        employee.userId = user._id;
        await employee.save();
        console.log(`Updated employee ${employee._id} with userId ${user._id}`);
        updated++;
      } catch (error) {
        console.error(`Error processing employee ${employee._id}:`, error);
        errors++;
      }
    }

    console.log('\nMigration Summary:');
    console.log(`Total employees processed: ${employees.length}`);
    console.log(`Successfully updated: ${updated}`);
    console.log(`Skipped (already had userId): ${skipped}`);
    console.log(`Errors: ${errors}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the migration
updateEmployeeUserIds(); 