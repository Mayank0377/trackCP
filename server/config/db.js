const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const dbName = process.env.DB_NAME || process.env.db_name;
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, dbName ? { dbName } : {})
        console.log(`\n✅ MongoDB Connected ✅ DB Host: ${connectionInstance.connection.host}`)
    } catch (error) {
        console.error(`❌ MongoDB Connection Failed: ${error.message}`);
        console.warn('⚠️  Running without database connection');
    }
}


module.exports = connectDB;
