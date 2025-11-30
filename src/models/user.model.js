import mongoose, { Schema } from 'mongoose'

const userSchema=new Schema({
    username:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        trim:true
    },
    room_no:{
        type:Schema.Types.ObjectId,
        ref:"Room"
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN'],
      required: true,
    },

},{timestamps:true});

export const User=mongoose.model("User",userSchema);