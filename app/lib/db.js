import mongoose from 'mongoose';

let ConnectionEstablished = null
export const connectdb = async () => {
    if (ConnectionEstablished) {
        return ConnectionEstablished
    }
    try {
        await mongoose.connect(process.env.DB_URL);
        ConnectionEstablished = mongoose.connection
        console.log("Database Connected");
        return ConnectionEstablished
    } catch (error) {
        console.error("Error connecting to database:", error);
        throw error;
    }
};

export const disconnectdb = async ()=> {
    if (!ConnectionEstablished){
        return
    }
    await mongoose.disconnect();
    ConnectionEstablished = null
    console.log("Database disconnected")
}