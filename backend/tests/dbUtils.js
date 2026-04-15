import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const connectDB = async () => {
    // If there is no URI present, tests will fail quickly with a clear error
    if (!process.env.MONGO_URI) throw new Error("Missing MONGO_URI in .env");
    
    if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
    }
    
    // Connect to the REAL cluster but forcefully isolate to a "clippy_test" database
    await mongoose.connect(process.env.MONGO_URI, {
        dbName: 'clippy_test',
        serverSelectionTimeoutMS: 5000
    });
};

export const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        // Option: Drop the test database entirely after tests finish to keep cluster clean
        await mongoose.connection.db.dropDatabase();
        await mongoose.disconnect();
    }
};

export const clearDB = async () => {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany({});
    }
};
