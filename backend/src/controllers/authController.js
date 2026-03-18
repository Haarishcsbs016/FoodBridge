const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
      name: user.name,
    },
    secret,
    { expiresIn: "7d" }
  );
}

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, address } = req.body;

    if (!name || typeof name !== "string") return res.status(400).json({ message: "Name is required" });
    if (!email || typeof email !== "string") return res.status(400).json({ message: "Email is required" });
    if (!password || typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    if (role !== "restaurant" && role !== "ngo") return res.status(400).json({ message: "Role is invalid" });

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: "Email already in use" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      address: typeof address === "string" ? address.trim() : "",
      passwordHash,
    });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, address: user.address },
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || typeof email !== "string") return res.status(400).json({ message: "Email is required" });
    if (!password || typeof password !== "string") return res.status(400).json({ message: "Password is required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+passwordHash");
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ message: "Invalid email or password" });

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id.toString(), name: user.name, email: user.email, role: user.role, address: user.address },
    });
  } catch (err) {
    next(err);
  }
};

const me = async (req, res) => {
  res.json({
    user: {
      id: req.user._id.toString(),
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      address: req.user.address,
    },
  });
};

module.exports = { register, login, me };

