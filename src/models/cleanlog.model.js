import mongoose from 'mongoose'

const cleanlogSchema = new Schema({
    verification: {
        type: String,
        required: true,
    },
    cleanstatus: {
        type: String,
        required: true,
    },
    room_id: {
        type: Schema.Types.ObjectId,
        ref: "Room"
    },
    worker_id: {
        type: Schema.Types.ObjectId,
        ref: "Worker"
    },
}, { timestamps: true });

export const Log = mongoose.model("Log", cleanlogSchema);
