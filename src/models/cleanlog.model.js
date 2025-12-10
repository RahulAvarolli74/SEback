import mongoose, { Schema } from "mongoose";

const cleanlogSchema = new Schema(
  {
    // 1. IDs (Foreign Keys)
    room_id: {
      type: Schema.Types.ObjectId,
      ref: "User", // References the Student/User who owns the room
      required: true,
    },
    worker: {
      type: Schema.Types.ObjectId,
      ref: "Worker", // References the Worker collection
      required: true,
    },

    // 2. REQUIRED FOR DONUT CHART (Task Distribution)
    // This MUST be an Array of Strings to handle multiple checkboxes
    cleaningType: {
      type: [String], 
      required: true, 
      enum: ["Sweeping", "Room Cleaning", "Bathroom Cleaning", "Corridor Cleaning"],
    },

    // 3. REQUIRED FOR LOGS TABLE & UI
    cleanstatus: {
      type: String,
      enum: ["Pending", "Completed", "Verified"], 
      default: "Pending",
      required: true,
    },
    room_no: {
       type: String,
       required: true 
    },
    feedback: {
      type: String,
      trim:true ,
      default: "" 
    },
    rating: {
      type: Number, 
      min: 1, 
      max: 5,
      default: null 
    },
    image: {
      type: String, // Stores Cloudinary URL
      default: ""
    }
  },
  { 
    timestamps: true 
  }
);

export const Log = mongoose.model("Log", cleanlogSchema);