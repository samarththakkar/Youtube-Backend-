import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

export const upload = multer( { 
        storage,
})

// import multer from "multer";

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, "./public/temp");
//     },
//     filename: function (req, file, cb) {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     }
// });

// //  VIDEO MIME TYPES
// const allowedVideoTypes = [
//     "video/mp4",
//     "video/mkv",
//     "video/webm",
//     "video/avi",
//     "video/mov"
// ];

// //  IMAGE TYPES (for thumbnail)
// const allowedImageTypes = [
//     "image/jpeg",
//     "image/png",
//     "image/jpg",
//     "image/webp"
// ];

// const fileFilter = (req, file, cb) => {
//     if (file.fieldname === "videoFile") {
//         if (!allowedVideoTypes.includes(file.mimetype)) {
//             return cb(
//                 new Error("Only video files are allowed"),
//                 false
//             );
//         }
//     }

//     if (file.fieldname === "thumbnail") {
//         if (!allowedImageTypes.includes(file.mimetype)) {
//             return cb(
//                 new Error("Only image files are allowed for thumbnail"),
//                 false
//             );
//         }
//     }

//     cb(null, true);
// };

// export const upload = multer({
//     storage,
//     fileFilter,
//     limits: {
//         fileSize: 500 * 1024 * 1024 // 500MB
//     }
// });
