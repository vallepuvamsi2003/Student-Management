const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ 
    storage,
    limits: { 
        fileSize: 200 * 1024 * 1024, // 200MB total limit
        files: 2000,                // Allow up to 2000 files in a folder
        parts: 4000                 // Allow more parts for large folder structures
    } 
});

module.exports = upload;
