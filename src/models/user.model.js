import mongoose, { Schema } from 'mongoose'
import bcrypt from 'bcrypt'

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
    refreshtoken:{
        type:String,
    },
},{timestamps:true});


userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.ispasswaordCorrect=async function(password){
    return  await bcrypt.compare(password,this.password)
}


userSchema.methods.generateAccessToken= function(){
    return jwt.sign(
        {
            _id:this._id,
            username:this.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken= function(){
    return jwt.sign(
        {
            _id:this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User=mongoose.model("User",userSchema);