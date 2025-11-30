import mongoose, { Schema } from 'mongoose'

const roomSchema=new Schema({
   room_no:{
        type:String,
        required:true
    },
    block:{
        type:String,
        required:true,
    },
    block:{
        type:String,
        required:true,
    },
    lockdays:{
        type:Number
    },
},{timestamps:true});

export const Room=mongoose.model("Room",roomSchema);