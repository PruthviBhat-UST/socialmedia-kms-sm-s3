import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import crypto from "crypto";
import path from "path";

export const uploadToS3 = async (file, folder = "posts") => {
    try {
        const s3Client = new S3Client({
            region: process.env.AWS_REGION
        });

        const timestamp = Date.now();
        const random = crypto.randomBytes(8).toString("hex");
        const extension = path.extname(file.originalname);
        const fileName = `${folder}/${timestamp}-${random}${extension}`;

        const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: fileName,
            Body: file.buffer,
            ContentType: file.mimetype,
            ServerSideEncryption: "aws:kms"
        });

        await s3Client.send(command);

        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
        
        console.log("✅ File uploaded to S3:", fileName);
        return { url, key: fileName };

    } catch (error) {
        console.error("❌ S3 Upload failed:", error.message);
        throw error;
    }
};

