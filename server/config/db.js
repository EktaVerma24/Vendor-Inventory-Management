const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try{
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/airport_vendor_system';
        await mongoose.connect(mongoUri);
        console.log('MongoDB connected successfully');
    }
    catch (err){
        console.error('MongoDB connection error:', err.message);
        process.exit(1); // Exit process with failure
    }
};
module.exports = connectDB;