const userSchema=new Schema({
    username:{
        type:String,
        trim:true
    },
    room_name:{
        type:String,
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
    refreshtoken:{ type:String },
},{timestamps:true});
