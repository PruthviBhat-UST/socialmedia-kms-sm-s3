import express from 'express';
import multer from 'multer';
import { uploadToS3 } from '../config/s3Upload.js';

const router = express.Router();

// Use memory storage - file goes to S3, not local disk
const storage = multer.memoryStorage();

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        if (allowedTypes.test(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files allowed!'), false);
        }
    }
});

// POST /upload
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file provided" });
        }

        // Determine folder based on upload type
        const folder = req.body.type === 'profile' ? 'profiles' :
                       req.body.type === 'cover'   ? 'covers'   : 'posts';

        // Upload to S3 (KMS encrypted)
        const result = await uploadToS3(req.file, folder);

        res.status(200).json({
            message: "File uploaded successfully to S3",
            url: result.url,
            key: result.key
        });

    } catch (error) {
        console.error("Upload error:", error);
        res.status(500).json({ message: "Upload failed", error: error.message });
    }
});

export default router;
