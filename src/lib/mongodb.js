import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // อ่านจาก .env.local
const options = {};

let client;
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

if (process.env.NODE_ENV === "development") {
  // เก็บ client ไว้ใน global เพื่อไม่สร้างใหม่ทุก hot reload
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // ใช้แบบปกติใน production
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
