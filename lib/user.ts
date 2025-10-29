import clientPromise from "./mongodb";
import bcrypt from "bcryptjs";

export async function createUser(email: string, password: string) {
  const client = await clientPromise;
  const db = client.db("db-kariera-pabliszera"); // change to your DB name
  const users = db.collection("users");

  const existing = await users.findOne({ email });
  if (existing) throw new Error("User already exists");

  const hashed = await bcrypt.hash(password, 10);
  const result = await users.insertOne({ email, password: hashed });
  return result.insertedId;
}

export async function findUserByEmail(email: string) {
  const client = await clientPromise;
  const db = client.db("db-kariera-pabliszera");
  const users = db.collection("users");
  return users.findOne({ email });
}
