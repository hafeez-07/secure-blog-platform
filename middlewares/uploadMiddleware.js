import multer from "multer";
import path from "path";




const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, path.resolve("./public/images/uploads"));
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploads = multer({ storage });

export default uploads;
