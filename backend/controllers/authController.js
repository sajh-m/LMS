import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/userModel.js";
import { config } from "../config/index.js";

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, phone: user.phone };
}

function signToken(user) {
  return jwt.sign({ id: user.id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
}

export async function register(req, res) {
  const { name, email, phone, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(409).json({ error: "An account with this email already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, phone, passwordHash });

  const token = signToken(user);
  res.status(201).json({ token, user: toPublicUser(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  const token = signToken(user);
  res.json({ token, user: toPublicUser(user) });
}

export async function getMe(req, res) {
  const user = await User.findByPk(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(toPublicUser(user));
}
