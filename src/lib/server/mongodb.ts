import { MongoClient, Db } from "mongodb";

const DB_NAME = process.env.MONGODB_DB_NAME || "jewellery_store";

declare global {
  var _mongoClient: MongoClient | undefined;
}

export async function getMongoDB(): Promise<Db> {
  const uri = process.env.MONGO_URI;
  if (!uri)
    throw new Error("MONGO_URI is not defined in environment variables");

  let client: MongoClient;

  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClient) {
      global._mongoClient = new MongoClient(uri);
    }
    client = global._mongoClient;
  } else {
    client = new MongoClient(uri);
  }

  try {
    await client.connect();
  } catch {
    // Already connected
  }

  return client.db(DB_NAME);
}
