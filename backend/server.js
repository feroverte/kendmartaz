import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import multer from "multer";
import { parse } from "csv-parse/sync";
import { db } from "./lib/db.js";
import { uploadFile } from "./lib/cloudinary.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "kendmart_secure_jwt_secret_token_2026";

// Memory storage for multer — files uploaded to Cloudinary
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 100 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Auth Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.role === "admin") {
      req.admin = decoded;
      return next();
    }
    return res.status(401).json({ error: "Unauthorized" });
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

// ----------------------------------------------------
// Authentication Routes
// ----------------------------------------------------
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password required" });
  }
  try {
    const admin = await db.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
    if (!admin) {
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    // Check lockout
    if (admin.lockoutUntil && new Date(admin.lockoutUntil) > new Date()) {
      const mins = Math.ceil((new Date(admin.lockoutUntil) - new Date()) / 60000);
      return res.status(429).json({ success: false, error: `Account locked. Try again in ${mins} minute(s).` });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      const attempts = (admin.failedAttempts || 0) + 1;
      let lockoutUntil = null;
      if (attempts >= 5) {
        lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min lockout
      }
      await db.admin.update({
        where: { id: admin.id },
        data: { failedAttempts: attempts, lockoutUntil }
      });
      return res.status(400).json({ success: false, error: "Invalid credentials" });
    }

    // Reset failed attempts on success
    await db.admin.update({
      where: { id: admin.id },
      data: { failedAttempts: 0, lockoutUntil: null }
    });

    const token = jwt.sign({ role: "admin", email: admin.email, id: admin.id }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({ success: true, token, admin: { email: admin.email, name: admin.name } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// ----------------------------------------------------
// File Upload Route — uploads to Cloudinary
// ----------------------------------------------------
app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const url = await uploadFile(req.file.buffer);
    return res.json({ success: true, url });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Settings Routes
// ----------------------------------------------------
app.get("/api/settings", async (req, res) => {
  try {
    const settingsList = await db.setting.findMany();
    const settings = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    const keys = ["total_impact_points", "farmers_featured", "purchase_requests", "estimated_climate_impact"];
    const defaults = {
      total_impact_points: "4820",
      farmers_featured: "12",
      purchase_requests: "348",
      estimated_climate_impact: "8.4"
    };

    keys.forEach((k) => {
      if (settings[k] === undefined) {
        settings[k] = defaults[k];
      }
    });

    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/settings", authenticateAdmin, async (req, res) => {
  const { key, value } = req.body;
  try {
    const updated = await db.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) }
    });
    return res.json({ success: true, setting: updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Farmers Routes
// ----------------------------------------------------
app.get("/api/farmers", async (req, res) => {
  try {
    const farmers = await db.farmer.findMany();
    return res.json(farmers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/farmers", authenticateAdmin, async (req, res) => {
  const data = req.body;
  try {
    const newFarmer = await db.farmer.create({
      data: {
        name: data.name,
        region: data.region,
        products: data.products,
        story: data.story,
        practices: data.practices,
        photoUrl: data.photoUrl || "/images/aytan.png",
        phone: data.phone || null
      }
    });

    // Auto-update stats count
    const farmers = await db.farmer.findMany();
    await db.setting.upsert({
      where: { key: "farmers_featured" },
      update: { value: String(farmers.length) },
      create: { key: "farmers_featured", value: String(farmers.length) }
    });

    return res.status(201).json(newFarmer);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/farmers/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await db.farmer.update({
      where: { id },
      data: {
        name: data.name,
        region: data.region,
        products: data.products,
        story: data.story,
        practices: data.practices,
        photoUrl: data.photoUrl,
        phone: data.phone || null
      }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/farmers/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.farmer.delete({
      where: { id }
    });

    // Recalculate featured farmers count
    const farmers = await db.farmer.findMany();
    await db.setting.upsert({
      where: { key: "farmers_featured" },
      update: { value: String(farmers.length) },
      create: { key: "farmers_featured", value: String(farmers.length) }
    });

    return res.json(deleted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Requests Routes
// ----------------------------------------------------
app.get("/api/requests", async (req, res) => {
  try {
    const reqs = await db.request.findMany();
    const farmers = await db.farmer.findMany();
    const result = reqs.map((r) => {
      const f = farmers.find((farm) => farm.id === r.farmerId);
      return {
        ...r,
        farmerName: f ? f.name : "Unknown Farmer"
      };
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/requests", async (req, res) => {
  const data = req.body;
  try {
    const mappings = await db.impactMap.findMany();
    const productKey = data.product.trim();
    const matched = mappings.find(
      (m) => m.product.toLowerCase() === productKey.toLowerCase()
    );
    const pointsPerUnit = matched ? matched.points : 5;
    const totalPoints = pointsPerUnit * parseInt(data.quantity || 1);

    const newRequest = await db.request.create({
      data: {
        customerName: data.customerName,
        email: data.email,
        phone: data.phone,
        product: data.product,
        quantity: parseInt(data.quantity || 1),
        points: totalPoints,
        farmerId: data.farmerId,
        status: "Pending"
      }
    });

    // Update settings stats
    const settingsList = await db.setting.findMany();
    const settings = {};
    settingsList.forEach((s) => {
      settings[s.key] = s.value;
    });

    const currentPoints = parseInt(settings["total_impact_points"] || "0");
    const currentRequests = parseInt(settings["purchase_requests"] || "0");
    const currentImpact = parseFloat(settings["estimated_climate_impact"] || "0.0");

    const updatedPoints = currentPoints + totalPoints;
    const updatedRequests = currentRequests + 1;
    const updatedImpact = parseFloat(
      (currentImpact + totalPoints * 0.002).toFixed(2)
    );

    await db.setting.upsert({
      where: { key: "total_impact_points" },
      update: { value: String(updatedPoints) },
      create: { key: "total_impact_points", value: String(updatedPoints) }
    });

    await db.setting.upsert({
      where: { key: "purchase_requests" },
      update: { value: String(updatedRequests) },
      create: { key: "purchase_requests", value: String(updatedRequests) }
    });

    await db.setting.upsert({
      where: { key: "estimated_climate_impact" },
      update: { value: String(updatedImpact) },
      create: { key: "estimated_climate_impact", value: String(updatedImpact) }
    });

    return res.json({ success: true, request: newRequest, pointsEarned: totalPoints });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/requests/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updated = await db.request.update({
      where: { id },
      data: { status }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/requests/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.request.delete({
      where: { id }
    });
    return res.json(deleted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Articles Routes
// ----------------------------------------------------
app.get("/api/articles", async (req, res) => {
  try {
    const articles = await db.article.findMany();
    return res.json(articles);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const article = await db.article.findUnique({
      where: { id }
    });
    if (article) {
      return res.json(article);
    }
    return res.status(404).json({ error: "Article not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/articles", authenticateAdmin, async (req, res) => {
  const data = req.body;
  try {
    const newArticle = await db.article.create({
      data: {
        title: data.title,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl || "/images/blog-soil.png"
      }
    });
    return res.status(201).json(newArticle);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/articles/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await db.article.update({
      where: { id },
      data: {
        title: data.title,
        summary: data.summary,
        content: data.content,
        imageUrl: data.imageUrl
      }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/articles/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.article.delete({
      where: { id }
    });
    return res.json(deleted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Page Content Routes
// ----------------------------------------------------
app.get("/api/page-content/:key", async (req, res) => {
  const { key } = req.params;
  try {
    const record = await db.pageContent.findUnique({
      where: { key }
    });
    if (record) {
      return res.json(JSON.parse(record.content));
    }
    return res.status(404).json({ error: "Page content not found" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/page-content/:key", authenticateAdmin, async (req, res) => {
  const { key } = req.params;
  const contentObj = req.body;
  try {
    const updated = await db.pageContent.upsert({
      where: { key },
      update: { content: JSON.stringify(contentObj) },
      create: { key, content: JSON.stringify(contentObj) }
    });
    return res.json({ success: true, pageContent: updated });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Impact Map Routes
// ----------------------------------------------------
app.get("/api/impact-maps", async (req, res) => {
  try {
    const maps = await db.impactMap.findMany();
    return res.json(maps);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/impact-maps", authenticateAdmin, async (req, res) => {
  const { product, points } = req.body;
  try {
    const updated = await db.impactMap.upsert({
      where: { product },
      update: { points: parseInt(points) },
      create: { product, points: parseInt(points) }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/impact-maps/:product", authenticateAdmin, async (req, res) => {
  const { product } = req.params;
  try {
    const deleted = await db.impactMap.delete({
      where: { product }
    });
    return res.json(deleted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// User Authentication Routes
// ----------------------------------------------------
app.post("/api/user/register", async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const existingEmail = await db.user.findUnique({ where: { email } });
    if (existingEmail) return res.status(400).json({ success: false, error: "Email already registered" });
    const existingPhone = await db.user.findFirst({ where: { phone } });
    if (existingPhone) return res.status(400).json({ success: false, error: "Phone number already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: { name, email, phone, password: hashedPassword, impactPoints: 0 }
    });
    const token = jwt.sign({ id: newUser.id, email: newUser.email, role: "user" }, JWT_SECRET, { expiresIn: "30d" });
    return res.json({ success: true, token, user: { id: newUser.id, name: newUser.name, email: newUser.email, phone: newUser.phone, impactPoints: 0 } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/user/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ success: false, error: "Invalid email or password" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ success: false, error: "Invalid email or password" });
    const token = jwt.sign({ id: user.id, email: user.email, role: "user" }, JWT_SECRET, { expiresIn: "30d" });
    return res.json({ success: true, token, user: { id: user.id, name: user.name, email: user.email, phone: user.phone, impactPoints: user.impactPoints } });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

// In-memory store for password reset tokens (email -> { token, expiry })
const resetTokens = new Map();

app.post("/api/user/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ success: false, error: "Email is required" });
  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) return res.json({ success: true, message: "If that email exists, a reset link has been generated." });
    const { randomBytes } = await import("crypto");
    const token = randomBytes(32).toString("hex");
    resetTokens.set(email, { token, expiry: Date.now() + 3600000 }); // 1 hour expiry
    const resetLink = `${req.protocol}://${req.get("host")}/reset-password/${token}?email=${encodeURIComponent(email)}`;
    console.log("Password reset link:", resetLink);
    return res.json({ success: true, message: "Reset link generated.", resetLink });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/user/reset-password", async (req, res) => {
  const { token, email, password } = req.body;
  if (!token || !email || !password) return res.status(400).json({ success: false, error: "Missing required fields" });
  try {
    const stored = resetTokens.get(email);
    if (!stored || stored.token !== token || Date.now() > stored.expiry) {
      return res.status(400).json({ success: false, error: "Invalid or expired reset token" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.user.update({ where: { email }, data: { password: hashedPassword } });
    resetTokens.delete(email);
    return res.json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && decoded.role === "user") {
      req.user = decoded;
      return next();
    }
    return res.status(401).json({ error: "Unauthorized" });
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/api/user/profile", authenticateUser, async (req, res) => {
  try {
    const user = await db.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password, ...userData } = user;
    return res.json({ success: true, user: userData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/user/profile", authenticateUser, async (req, res) => {
  const { name, phone } = req.body;
  try {
    const updated = await db.user.update({
      where: { id: req.user.id },
      data: { name, phone }
    });
    const { password, ...userData } = updated;
    return res.json({ success: true, user: userData });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// User dashboard stats (impact points, farmers supported, products requested)
app.get("/api/user/dashboard-stats", authenticateUser, async (req, res) => {
  try {
    const user = await db.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const answers = await db.listingAnswer.findMany({
      where: { userId: req.user.id },
      include: { listing: { select: { farmerName: true } } }
    });

    const productsRequested = answers.length;
    const uniqueFarmers = [...new Set(answers.map(a => a.listing?.farmerName).filter(Boolean))].length;
    const impactPoints = user.impactPoints || 0;

    return res.json({ impactPoints, farmersSupported: uniqueFarmers, productsRequested });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Public user count
app.get("/api/users/count", async (req, res) => {
  try {
    const count = await db.user.count();
    return res.json({ count });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", authenticateAdmin, async (req, res) => {
  try {
    const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
    const safe = users.map(({ password, ...u }) => u);
    return res.json({ success: true, users: safe });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Listing Routes
// ----------------------------------------------------
app.get("/api/listings", async (req, res) => {
  try {
    const { status } = req.query;
    let listings;
    if (status) {
      listings = await db.listing.findMany({ where: { status } });
    } else {
      listings = await db.listing.findMany();
    }
    return res.json(listings);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/listings/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await db.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });
    return res.json(listing);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/listings", authenticateAdmin, async (req, res) => {
  const data = req.body;
  try {
    const newListing = await db.listing.create({
      data: {
        name: data.name,
        description: data.description,
        farmerName: data.farmerName,
        farmerPhone: data.farmerPhone,
        location: data.location,
        availableWeight: data.availableWeight,
        qualityDesc: data.qualityDesc,
        impactPoints: parseInt(data.impactPoints) || 5,
        sustainability: data.sustainability,
        question1: data.question1 || undefined,
        question2: data.question2 || undefined,
        photoMain: data.photoMain || "/images/placeholder-veg.jpg",
        photos: data.photos || "[]",
        status: data.status || "Active"
      }
    });
    return res.status(201).json(newListing);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/listings/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await db.listing.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        farmerName: data.farmerName,
        farmerPhone: data.farmerPhone,
        location: data.location,
        availableWeight: data.availableWeight,
        qualityDesc: data.qualityDesc,
        impactPoints: parseInt(data.impactPoints) || 5,
        sustainability: data.sustainability,
        question1: data.question1 || null,
        question2: data.question2 || null,
        photoMain: data.photoMain,
        photos: data.photos,
        status: data.status
      }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/listings/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.savedListing.deleteMany({ where: { listingId: id } });
    await db.listingAnswer.deleteMany({ where: { listingId: id } });
    const deleted = await db.listing.delete({ where: { id } });
    return res.json(deleted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Always show questions when contacting a farmer (only 1 question)
app.post("/api/listings/:id/contact", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const listing = await db.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    const hasCustomQuestions = listing.question1;
    return res.json({
      completed: false,
      questions: hasCustomQuestions ? [
        { id: "q1", label: listing.question1, options: [] }
      ] : [
        {
          id: "usage",
          label: "How do you plan to use this product?",
          options: ["Personal consumption", "Family & household", "Gift / sharing", "Resale", "Other"]
        }
      ]
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Submit answers and earn points (2 per selected answer)
app.post("/api/listings/:id/answer", authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { answers } = req.body;
  try {
    const listing = await db.listing.findUnique({ where: { id } });
    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // Count selected answers across all questions
    let selectedCount = 0;
    if (answers && typeof answers === "object") {
      for (const val of Object.values(answers)) {
        if (Array.isArray(val)) {
          selectedCount += val.length;
        } else if (typeof val === "string" && val.trim()) {
          selectedCount += 1;
        }
      }
    }
    const points = (listing.impactPoints || 5) + selectedCount * 2;

    await db.listingAnswer.create({
      data: { userId: req.user.id, listingId: id, answers: answers || {}, points }
    });

    await db.user.update({
      where: { id: req.user.id },
      data: { impactPoints: { increment: points } }
    });

    return res.json({ success: true, phone: listing.farmerPhone, pointsAwarded: points });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Admin: get all answers for a listing
app.get("/api/listings/:id/answers", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const answers = await db.listingAnswer.findMany({
      where: { listingId: id },
      include: { user: { select: { id: true, name: true, email: true, impactPoints: true } } },
      orderBy: { createdAt: 'desc' }
    });
    return res.json(answers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Saved Listing Routes
// ----------------------------------------------------
app.get("/api/saved-listings", authenticateUser, async (req, res) => {
  try {
    const saved = await db.savedListing.findMany({ where: { userId: req.user.id } });
    const listings = await db.listing.findMany();
    const result = saved.map(s => {
      const listing = listings.find(l => l.id === s.listingId);
      return { ...s, listing };
    });
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/saved-listings", authenticateUser, async (req, res) => {
  const { listingId } = req.body;
  try {
    const saved = await db.savedListing.create({
      data: { userId: req.user.id, listingId }
    });
    return res.json({ success: true, saved });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/saved-listings/:id", authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    await db.savedListing.delete({ where: { id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Dataset Routes (Research Analytics)
// ----------------------------------------------------
app.get("/api/datasets", async (req, res) => {
  try {
    const { public: onlyPublic } = req.query;
    const datasets = await db.dataset.findMany(onlyPublic === "true" ? { where: { public: true } } : {});
    return res.json(datasets);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/datasets/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const dataset = await db.dataset.findUnique({ where: { id } });
    if (!dataset) return res.status(404).json({ error: "Dataset not found" });
    return res.json(dataset);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/datasets", authenticateAdmin, async (req, res) => {
  const data = req.body;
  try {
    const newDataset = await db.dataset.create({
      data: {
        name: data.name,
        description: data.description || "",
        columns: data.columns || [],
        rows: data.rows || [],
        public: data.public || false,
        insights: []
      }
    });
    return res.status(201).json(newDataset);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/datasets/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await db.dataset.update({
      where: { id },
      data
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/datasets/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deleted = await db.dataset.delete({ where: { id } });
    return res.json(deleted);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// CSV Upload Route
app.post("/api/datasets/upload-csv", authenticateAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No CSV file uploaded" });
    const csvContent = req.file.buffer.toString("utf-8");
    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    });

    if (records.length === 0) return res.status(400).json({ error: "CSV file is empty" });

    // Detect column types
    const columnNames = Object.keys(records[0]);
    const columns = columnNames.map(name => {
      const values = records.map(r => r[name]).filter(v => v !== undefined && v !== "");
      let type = "categorical";
      // Check if numeric
      const numValues = values.map(v => parseFloat(v.replace(/[,%$€£]/g, "")));
      if (numValues.every(v => !isNaN(v)) && numValues.length > 0) {
        type = "numeric";
      } else {
        // Check if date
        const dateValues = values.map(v => new Date(v));
        if (dateValues.every(d => !isNaN(d.getTime())) && values.length > 0) {
          type = "date";
        } else {
          // Check if boolean
          const boolVals = values.map(v => v.toLowerCase());
          if (boolVals.every(v => ["true", "false", "yes", "no", "0", "1"].includes(v))) {
            type = "boolean";
          }
        }
      }
      return { name, type };
    });

    // Generate automatic insights
    const insights = [];
    const totalResponses = records.length;
    insights.push({
      type: "observation",
      label: "Total Responses",
      value: `${totalResponses} Records`,
      icon: "database"
    });

    columns.forEach(col => {
      const values = records.map(r => r[col.name]).filter(v => v !== undefined && v !== "");
      if (col.type === "numeric") {
        const nums = values.map(v => parseFloat(v.replace(/[,%$€£]/g, "")));
        const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
        const highest = Math.max(...nums);
        const lowest = Math.min(...nums);
        insights.push({ type: "observation", label: `Avg ${col.name}`, value: `${avg}`, icon: "bar-chart" });
        insights.push({ type: "important", label: `Highest ${col.name}`, value: `${highest}`, icon: "trending-up" });
        insights.push({ type: "observation", label: `Lowest ${col.name}`, value: `${lowest}`, icon: "trending-down" });
      } else if (col.type === "categorical") {
        const frequency = {};
        values.forEach(v => { frequency[v] = (frequency[v] || 0) + 1; });
        const mostCommon = Object.entries(frequency).sort((a, b) => b[1] - a[1])[0];
        if (mostCommon) {
          const pct = ((mostCommon[1] / totalResponses) * 100).toFixed(0);
          insights.push({ type: "opportunity", label: `Most Common ${col.name}`, value: `${mostCommon[0]} (${pct}%)`, icon: "users" });
        }
        // Regional comparison
        if (col.name.toLowerCase().includes("region") || col.name.toLowerCase().includes("location")) {
          Object.entries(frequency).sort((a, b) => b[1] - a[1]).forEach(([key, count]) => {
            insights.push({ type: "observation", label: `Region: ${key}`, value: `${count} responses`, icon: "map-pin" });
          });
        }
      } else if (col.type === "date") {
        const dates = values.map(v => new Date(v));
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        insights.push({ type: "observation", label: "Date Range", value: `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`, icon: "calendar" });
      }
    });

    // Auto-generate recommendations
    const numericCols = columns.filter(c => c.type === "numeric");
    if (numericCols.length > 0) {
      insights.push({ type: "recommendation", label: "Data-Driven Decision", value: "Use these metrics to track progress over time and identify improvement areas.", icon: "target" });
    }
    const categoricalCols = columns.filter(c => c.type === "categorical");
    if (categoricalCols.some(c => c.name.toLowerCase().includes("satisfaction") || c.name.toLowerCase().includes("rating"))) {
      insights.push({ type: "important", label: "Satisfaction Insight", value: "Analyze satisfaction scores to identify service gaps and improve farmer experience.", icon: "star" });
    }
    insights.push({ type: "recommendation", label: "Next Steps", value: "Collect more data points to strengthen statistical significance and identify long-term trends.", icon: "lightbulb" });

    // Store dataset
    const newDataset = await db.dataset.create({
      data: {
        name: req.body.name || req.file.originalname.replace(".csv", ""),
        description: req.body.description || `Uploaded CSV with ${totalResponses} records and ${columns.length} columns`,
        columns,
        rows: records,
        public: req.body.public === "true",
        insights
      }
    });

    return res.status(201).json(newDataset);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Generate insights for a dataset
app.post("/api/datasets/:id/generate-insights", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const dataset = await db.dataset.findUnique({ where: { id } });
    if (!dataset) return res.status(404).json({ error: "Dataset not found" });

    const { rows, columns } = dataset;
    const insights = [];
    insights.push({ type: "observation", label: "Total Records", value: `${rows.length} entries`, icon: "database" });

    columns.forEach(col => {
      const values = rows.map(r => r[col.name]).filter(v => v !== undefined && v !== "");
      if (col.type === "numeric") {
        const nums = values.map(v => parseFloat(String(v).replace(/[,%$€£]/g, "")));
        const avg = (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
        insights.push({ type: "observation", label: `Average ${col.name}`, value: avg, icon: "bar-chart" });
        insights.push({ type: "important", label: `Highest ${col.name}`, value: `${Math.max(...nums)}`, icon: "trending-up" });
      } else if (col.type === "categorical") {
        const freq = {};
        values.forEach(v => { freq[v] = (freq[v] || 0) + 1; });
        const top = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
        if (top) insights.push({ type: "opportunity", label: `Top ${col.name}`, value: `${top[0]} (${((top[1]/rows.length)*100).toFixed(0)}%)`, icon: "users" });
      }
    });

    const updated = await db.dataset.update({
      where: { id },
      data: { insights }
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Get public datasets (no auth required)
app.get("/api/public/research", async (req, res) => {
  try {
    const datasets = await db.dataset.findMany({ where: { public: true } });
    const settingsList = await db.setting.findMany();
    const settings = {};
    settingsList.forEach(s => { settings[s.key] = s.value; });
    return res.json({ datasets, settings });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Credits API
app.get("/api/credits", async (req, res) => {
  try {
    const credits = await db.credit.findMany();
    return res.json(credits);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/credits", authenticateAdmin, async (req, res) => {
  try {
    const { role, name, platform, url } = req.body;
    if (!role || !name) return res.status(400).json({ error: "Role and name required" });
    const credit = await db.credit.create({ data: { role, name, platform: platform || "", url: url || "" } });
    return res.json(credit);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/credits/:id", authenticateAdmin, async (req, res) => {
  try {
    const credit = await db.credit.update({ where: { id: req.params.id }, data: req.body });
    return res.json(credit);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/credits/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.credit.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// FAQ Routes
// ----------------------------------------------------
app.get("/api/faq", async (req, res) => {
  try {
    const categories = await db.faqCategory.findMany({
      include: { questions: true }
    });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/faq/categories", authenticateAdmin, async (req, res) => {
  try {
    const { name, order } = req.body;
    if (!name) return res.status(400).json({ error: "Category name required" });
    const category = await db.faqCategory.create({ data: { name, order: order || 0 } });
    return res.json(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/faq/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    const category = await db.faqCategory.update({ where: { id: req.params.id }, data: req.body });
    return res.json(category);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/faq/categories/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.faqQuestion.deleteMany({ where: { categoryId: req.params.id } });
    await db.faqCategory.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/faq/questions", authenticateAdmin, async (req, res) => {
  try {
    const { categoryId, question, answer, order } = req.body;
    if (!categoryId || !question) return res.status(400).json({ error: "CategoryId and question required" });
    const q = await db.faqQuestion.create({ data: { categoryId, question, answer: answer || "", order: order || 0 } });
    return res.json(q);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/faq/questions/:id", authenticateAdmin, async (req, res) => {
  try {
    const q = await db.faqQuestion.update({ where: { id: req.params.id }, data: req.body });
    return res.json(q);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/faq/questions/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.faqQuestion.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ----------------------------------------------------
// Review Routes
// ----------------------------------------------------
app.get("/api/reviews", async (req, res) => {
  try {
    const { page = 1, limit = 10, rating, search, all } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const where = {};
    if (!all) where.hidden = false;
    if (rating) where.rating = parseInt(rating);
    if (search) where.userName = { contains: search, mode: "insensitive" };

    const [reviews, total] = await Promise.all([
      db.review.findMany({ where, skip, take: limitNum }),
      db.review.count({ where })
    ]);

    return res.json({ reviews, total, page: pageNum, totalPages: Math.ceil(total / limitNum) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/reviews", authenticateUser, async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: "Rating must be 1-5" });
    if (!text || text.length > 400) return res.status(400).json({ error: "Review text required (max 400 chars)" });

    const user = await db.user.findUnique({ where: { id: req.user.id } });
    if (!user) return res.status(404).json({ error: "User not found" });

    const review = await db.review.create({
      data: { userId: user.id, userName: user.name, rating, text }
    });
    return res.json(review);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/api/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    const review = await db.review.update({ where: { id: req.params.id }, data: req.body });
    return res.json(review);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/reviews/:id", authenticateAdmin, async (req, res) => {
  try {
    await db.review.delete({ where: { id: req.params.id } });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// Seed default admin on startup if ADMIN_PASSWORD is set
async function seedAdmin() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@kendmart.az").toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) {
    console.error("ERROR: ADMIN_PASSWORD environment variable is required. Set it in backend/.env");
    console.error("Example: ADMIN_PASSWORD=yourStrongPassword123");
    console.error("Admin login will not be available until ADMIN_PASSWORD is set.");
    return;
  }
  try {
    const existing = await db.admin.findUnique({ where: { email: adminEmail } });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.admin.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          name: "Admin"
        }
      });
      console.log(`Default admin created: ${adminEmail}`);
    } else {
      // Update password if ADMIN_PASSWORD changed
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await db.admin.update({
        where: { id: existing.id },
        data: { password: hashedPassword }
      });
    }
  } catch (error) {
    console.error("Admin seed error (will retry on next startup):", error.message);
  }
}

seedAdmin();

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`);
});
