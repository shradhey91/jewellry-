import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGO_URI!;
const dbName = process.env.MONGODB_DB_NAME || "jewellery_store";

if (!uri) {
  throw new Error("Please define MONGO_URI in environment variables");
}

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export async function getMongoDB(): Promise<Db> {
  const client = await clientPromise;
  return client.db(dbName);
}
