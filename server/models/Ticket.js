const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
    },
    urgency: {
      type: String,
      required: true,
      enum: ["High", "Medium", "Low"],
    },
    priority: {
      type: String,
      required: true,
      enum: ["P1", "P2", "P3"],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["Open", "Pending", "Resolved"],
      default: "Open",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ticket", ticketSchema);