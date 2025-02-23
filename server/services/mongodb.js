const mongoose = require("mongoose");

const connectMongoDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_DB_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}: ${conn.connection.port}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectMongoDb;