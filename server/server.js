const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const Ticket = require("./models/Ticket");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API working" });
});

// GET all tickets from MongoDB
app.get("/api/tickets", async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tickets" });
  }
});

// POST new ticket to MongoDB
app.post("/api/tickets", async (req, res) => {
  try {
    const { title, category, urgency, description } = req.body;

    let priority;
    if (urgency === "High") priority = "P1";
    else if (urgency === "Medium") priority = "P2";
    else priority = "P3";

    const ticket = await Ticket.create({
      title,
      category,
      urgency,
      priority,
      description,
      status: urgency === "High" ? "Open" : "Pending",
    });

    console.log("New Ticket Saved:", ticket);

    res.status(201).json({
      message: "Ticket created successfully",
      ticket,
    });
  } catch (error) {
    console.error("Error creating ticket:", error.message);
    res.status(500).json({ message: "Failed to create ticket" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.put("/api/tickets/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedTicket = await Ticket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({
      message: "Ticket updated successfully",
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error("Error updating ticket:", error.message);
    res.status(500).json({ message: "Failed to update ticket" });
  }
});