import mongoose from "mongoose";

// const MONGODB_URI = "mongodb://localhost:27017/results-analyzer";
const MONGODB_URI = process.env.MONGODB_URI || "";

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache:
    | {
      conn: typeof mongoose | null;
      promise: Promise<typeof mongoose> | null;
    }
    | undefined;
}

const cache = global._mongooseCache ?? { conn: null, promise: null };
global._mongooseCache = cache;

export async function connectDB(): Promise<typeof mongoose> {
  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}
