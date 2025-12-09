import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Make sure this folder exists in your project root!
      cb(null, "./public/temp") 
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })
  
export const upload = multer({ 
    storage, 
})

