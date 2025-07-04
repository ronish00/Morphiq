import mongoose, { Mongoose} from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
}

//next JS is serverless so each of our transaction into the data base lasts only for that operation
//benefit= all transactions are independent and more scalable
//this causes issues of traffic and having to establish conn, complete transaction and end conn
//so we use cache to speed up the process

//caching for optimization

let cached: MongooseConnection =(global as any).mongoose;

if(!cached){
    cached = (global as any).mongoose = {
        conn: null, promise:null
    }
}

export const connectToDatabase = async () => {
    
    //if already a cached connection, return immediately. thus, optimized
    if(cached.conn) return cached.conn;

    //if not cached. have to create connection
    if(!MONGODB_URL) throw new Error('Missing MONGODB_URL');

    cached.promise = cached.promise || mongoose.connect(MONGODB_URL, {
        dbName: 'morphiq', bufferCommands: false
    })

    cached.conn = await cached.promise;

    return cached.conn;
}

