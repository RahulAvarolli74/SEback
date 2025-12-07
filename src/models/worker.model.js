import mongoose, { Schema } from 'mongoose'

const workerSchema=new Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    block:{
        type:String,
        required:true
    },
    rating:{
        type:Number,
    }
},{timestamps:true});

export const Worker=mongoose.model("Worker",workerSchema);
