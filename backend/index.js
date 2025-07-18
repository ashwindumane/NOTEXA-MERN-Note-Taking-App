require("dotenv").config();
const config = require("./config.json");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");

mongoose.connect(config.connectionString);

const User = require("./models/user.model");
const Note = require("./models/note.model");

const express = require("express");
const cors = require("cors");
const app = express();

const jwt = require("jsonwebtoken");
const { authenticateToken } = require("./utilities");

app.use(express.json());
app.use(cors({ origin: "*" }));

app.post("/create-account", async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName) return res.status(400).json({ error: true, message: "Full Name is required" });
  if (!email) return res.status(400).json({ error: true, message: "Email is required" });
  if (!password) return res.status(400).json({ error: true, message: "Password is required" });

  const isUser = await User.findOne({ email });
  if (isUser) return res.json({ error: true, message: "User already exists" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ fullName, email, password: hashedPassword });
  await user.save();

  const accessToken = jwt.sign({ user }, process.env.ACCESS_TOKEN_SECRET);
  return res.json({ error: false, user, accessToken, message: "Registration Successful" });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: true, message: "Email and password are required" });

  try {
    const userInfo = await User.findOne({ email });
    if (!userInfo || !(await bcrypt.compare(password, userInfo.password))) {
      return res.status(401).json({ error: true, message: "Invalid credentials" });
    }

    const accessToken = jwt.sign({ user: userInfo }, process.env.ACCESS_TOKEN_SECRET);
    return res.json({ error: false, message: "Login successful", email, accessToken });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
});

app.get("/get-user", authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.user?._id || req.user?._id;
    if (!userId) return res.status(400).json({ message: "Invalid token: user ID not found." });

    const isUser = await User.findById(userId);
    if (!isUser) return res.status(401).json({ message: "Unauthorized: User not found." });

    return res.status(200).json({
      user: { fullName: isUser.fullName, email: isUser.email, _id: isUser._id, createdOn: isUser.createdOn },
      message: "User fetched successfully"
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

app.post("/add-note", authenticateToken, async (req, res) => {
  const { title, content, tags } = req.body;
  const { user } = req.user;
  
  if (!title) return res.status(400).json({ error: true, message: "Title is required" });
  if (!content) return res.status(400).json({ error: true, message: "Content is required" });

  try {
    const note = new Note({ title, content, tags: tags || [], userId: user._id });
    await note.save();
    return res.json({ error: false, note, message: "Note added successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
});

app.put("/edit-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { title, content, tags, isPinned } = req.body;
  const { user } = req.user;

  if (!title && !content && !tags) return res.status(400).json({ error: true, message: "No Changes provided" });

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) return res.status(404).json({ error: true, message: "Note not found" });

    if (title) note.title = title;
    if (content) note.content = content;
    if (tags) note.tags = tags;
    if (isPinned) note.isPinned = isPinned;

    await note.save();
    return res.json({ error: false, note, message: "Note updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server error" });
  }
});

app.get("/get-all-notes", authenticateToken, async (req, res) => {
  const { user } = req.user;
  try {
    const notes = await Note.find({ userId: user._id }).sort({ isPinned: -1 });
    return res.json({ error: false, notes, message: "All notes retrieved successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
});

app.delete("/delete-note/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { user } = req.user;
  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) return res.status(404).json({ error: true, message: "Note not found" });

    await Note.deleteOne({ _id: noteId, userId: user._id });
    return res.json({ error: false, message: "Note deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal server error" });
  }
});

app.put("/update-note-pinned/:noteId", authenticateToken, async (req, res) => {
  const noteId = req.params.noteId;
  const { isPinned } = req.body;
  const { user } = req.user;

  try {
    const note = await Note.findOne({ _id: noteId, userId: user._id });
    if (!note) return res.status(404).json({ error: true, message: "Note not found" });

    note.isPinned = isPinned;
    await note.save();
    return res.json({ error: false, note, message: "Note updated successfully" });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server error" });
  }
});

app.get("/search-notes", authenticateToken, async (req, res) => {
  const user = req.user;
  const { query } = req.query;

  if (!query) return res.status(400).json({ error: true, message: "Search query is required" });

  try {
    const matchingNotes = await Note.find({
      userId: user._id,
      $or: [
        { title: { $regex: new RegExp(query, "i") } },
        { content: { $regex: new RegExp(query, "i") } },
      ],
    });

    return res.json({
      error: false,
      notes: matchingNotes,
      message: "Notes matching the search query retrieved successfully",
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: "Internal Server Error" });
  }
});

app.listen(process.env.PORT || 8000, () => {
  console.log(`Server is listening at port no: ${process.env.PORT || 8000}`);
});

module.exports = app;