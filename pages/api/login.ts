import type { NextApiRequest, NextApiResponse } from "next";
import { findUserByEmail } from "../../lib/user";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email, password } = req.body;
  const user = await findUserByEmail(email);

  if (!user) return res.status(401).json({ error: "Uo Panie, nie ten email!" });

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return res.status(401).json({ error: "Uo Panie, bez hasła nie da rady!" });

  const token = jwt.sign(
    { sub: user._id, email: user.email },
    process.env.JWT_SECRET as string,
    { expiresIn: "1h" }
  );

  res.status(200).json({ token });
}
