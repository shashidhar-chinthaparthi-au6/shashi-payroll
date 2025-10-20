const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');
// Shops removed for simplified setup
const config = require('../config/config');

const MONGODB_URI = config[process.env.NODE_ENV || 'development'].mongodb.uri;

async function seedDefaultUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop obsolete indexes if present
    try {
      const employeesCol = mongoose.connection.db.collection('employees');
      const indexes = await employeesCol.indexes();
      const hasEmployeeIdIndex = indexes.find(ix => ix.name === 'employeeId_1');
      if (hasEmployeeIdIndex) {
        console.log('Dropping obsolete index employees.employeeId_1');
        await employeesCol.dropIndex('employeeId_1');
      }
    } catch (e) {
      console.log('Index cleanup note:', e.message);
    }

    // Clear existing data
    console.log('Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Employee.deleteMany({})
    ]);

    // Create default users
    const defaultUsers = [
      {
        name: 'Super Admin',
        email: 'admin@payroll.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'John Smith (Org Manager)',
        email: 'john@company1.com',
        password: 'manager123',
        role: 'client'
      },
      {
        name: 'Sarah Johnson (Org Manager)',
        email: 'sarah@company2.com',
        password: 'manager123',
        role: 'client'
      },
      {
        name: 'Mike Wilson (Employee)',
        email: 'mike@company1.com',
        password: 'employee123',
        role: 'employee'
      },
      {
        name: 'Lisa Brown (Employee)',
        email: 'lisa@company1.com',
        password: 'employee123',
        role: 'employee'
      },
      {
        name: 'Alex Davis (Contractor)',
        email: 'alex@contractor.com',
        password: 'contractor123',
        role: 'employee'
      }
    ];

    console.log('Creating default users...');
    const createdUsers = [];
    
    for (const userData of defaultUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        role: userData.role
      });
      await user.save();
      createdUsers.push(user);
      console.log(`Created user: ${userData.name} (${userData.email})`);
    }

    // Create sample shops (mapped as organizations/companies for now)
    // Skipping shop creation

    // Create sample employees
    console.log('Creating sample employees...');
    const mikeUser = createdUsers.find(u => u.email === 'mike@company1.com');
    const lisaUser = createdUsers.find(u => u.email === 'lisa@company1.com');
    const alexUser = createdUsers.find(u => u.email === 'alex@contractor.com');

    const mikeEmployee = new Employee({
      name: 'Mike Wilson',
      email: 'mike@company1.com',
      phone: '+1-555-0001',
      position: 'HR Manager',
      department: 'Human Resources',
      salary: 75000,
      userId: mikeUser._id,
      hireDate: new Date('2023-01-15'),
      status: 'active',
      employmentType: 'full_time',
      bankDetails: {
        accountNumber: '1234567890',
        bankName: 'First National Bank',
        ifscCode: 'FNB0001234'
      }
    });
    await mikeEmployee.save();

    const lisaEmployee = new Employee({
      name: 'Lisa Brown',
      email: 'lisa@company1.com',
      phone: '+1-555-0002',
      position: 'Sales Representative',
      department: 'Sales',
      salary: 60000,
      userId: lisaUser._id,
      hireDate: new Date('2023-03-01'),
      status: 'active',
      employmentType: 'full_time',
      bankDetails: {
        accountNumber: '0987654321',
        bankName: 'Second National Bank',
        ifscCode: 'SNB0005678'
      }
    });
    await lisaEmployee.save();

    const alexEmployee = new Employee({
      name: 'Alex Davis',
      email: 'alex@contractor.com',
      phone: '+1-555-0003',
      position: 'Software Developer',
      department: 'IT',
      salary: 0,
      userId: alexUser._id,
      hireDate: new Date('2023-06-01'),
      status: 'active',
      employmentType: 'contract',
      bankDetails: {
        accountNumber: '1122334455',
        bankName: 'Contractor Bank',
        ifscCode: 'CB0009999'
      }
    });
    await alexEmployee.save();

    console.log('\n=== SEEDING COMPLETED ===');
    console.log('Default users created:');
    defaultUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Password: ${user.password} - Role: ${user.role}`);
    });
    
    console.log('\nShops creation skipped');
    
    console.log('\nEmployees created:');
    console.log('- Mike Wilson (HR Manager)');
    console.log('- Lisa Brown (Sales Representative)');
    console.log('- Alex Davis (Contractor)');

    console.log('\nYou can now use these credentials to test the application!');
    
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding function
seedDefaultUsers();
