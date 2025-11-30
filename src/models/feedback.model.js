import mongoose from 'mongoose'

const feedSchema=new Schema({
    verification:{
        type:String,
        required:true,
    },
    comment:{
        type:String,
        trim:true
    },
    room_no:{
        type:Schema.Types.ObjectId,
        ref:"Room"
    },
    worker_id:{
        type:Schema.Types.ObjectId,
        ref:"Worker"
    },
    rating:{
        type:Number,
    }
},{timestamps:true});

export const Feed=mongoose.model("Feed",feedSchema);
