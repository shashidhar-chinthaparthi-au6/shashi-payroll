const mongoose = require('mongoose');
require('dotenv').config();

async function dropDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Drop the database
        await mongoose.connection.dropDatabase();
        console.log('Database dropped successfully');

        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    } catch (error) {
        console.error('Error dropping database:', error);
        process.exit(1);
    }
}

dropDatabase(); 