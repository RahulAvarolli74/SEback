import mongoose, { Schema } from "mongoose";

const issueSchema = new Schema(
  {
    room_no: {
      type: String,
      required: true,
      index: true // Helps search faster when Admin filters by room
    },
    room_id:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    issueType: {
      type: String,
      required: true,
      // Based on your UI tags
      enum: [
        "Poor Cleaning Quality", 
        "Missed Cleaning Schedule", 
        "Worker Behavior", 
        "Equipment/Supplies Issue",
        "Other"
      ] 
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    image: {
      type: String, 
      default: ""
    },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open"
    },
    adminResponse: {
      type: String,
      default: "Progress" // Initially empty; Admin fills this later
    }
  },
  {
    timestamps: true,
  }
);

export const Issue = mongoose.model("Issue", issueSchema);