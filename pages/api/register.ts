import type { NextApiRequest, NextApiResponse } from "next";
import { createUser } from "../../lib/user";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  try {
    const userId = await createUser(email, password);
    res.status(201).json({ userId });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
