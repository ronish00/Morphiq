import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

if (!MONGODB_URL) {
  throw new Error("Please define the MONGODB_URL environment variable");
}

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}


let cached: MongooseConnection = (globalThis as any).mongoose;

if (!cached) {
  cached = (globalThis as any).mongoose = {
    conn: null,
    promise: null,
  };
}

export async function connectToDatabase(): Promise<Mongoose> {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL!, {
      dbName: "morphiq",
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; 
    throw e;
  }

  return cached.conn;
}
