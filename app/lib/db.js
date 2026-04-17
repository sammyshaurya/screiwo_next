import mongoose from 'mongoose';

let ConnectionEstablished = null

export const connectDB = async () => {
    if (ConnectionEstablished) {
        console.log('Using existing database connection');
        return ConnectionEstablished
    }
    
    try {
        if (!process.env.DB_URL) {
            throw new Error('DB_URL environment variable is not set');
        }
        
        console.log('Database URL configured:', process.env.DB_URL.substring(0, 50) + '...');
        
        await mongoose.connect(process.env.DB_URL, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        
        ConnectionEstablished = mongoose.connection;
        console.log('Database connected successfully');
        return ConnectionEstablished
    } catch (error) {
        console.error("Error connecting to database:", {
            message: error.message,
            code: error.code,
            name: error.name
        });
        throw error;
    }
};

export const connectdb = connectDB;

export const disconnectdb = async () => {
    if (!ConnectionEstablished) {
        return
    }
    try {
        await mongoose.disconnect();
        ConnectionEstablished = null
        console.log("Database disconnected")
    } catch (error) {
        console.error("Error disconnecting database:", error);
        throw error;
    }
}