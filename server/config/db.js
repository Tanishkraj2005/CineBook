const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/cinebook';
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.error('👉 Ensure MongoDB is running (e.g. on 127.0.0.1:27017). Retrying connection in 5s...');
    setTimeout(connectDB, 5000);
  }
};

module.exports = connectDB;
