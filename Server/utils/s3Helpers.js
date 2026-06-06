// Server/utils/s3Helpers.js
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create S3 client (reuse your existing config)
const s3Client = new S3Client({
    region: process.env.AWS_REGION || "ap-south-1"
});

/**
 * Generate a pre-signed URL for a private S3 object (works with KMS)
 * @param {string} key - The S3 object key (path in bucket)
 * @param {number} expiresIn - Seconds until URL expires (default 1 hour)
 * @returns {Promise<string>} Pre-signed URL
 */
export async function generatePresignedUrl(key, expiresIn = 3600) {
    try {
        const command = new GetObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: key
        });
        
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
        return signedUrl;
    } catch (error) {
        console.error("Error generating pre-signed URL:", error);
        return null;
    }
}

/**
 * Extract S3 key from full URL or return key if already just the key
 * @param {string} urlOrKey - Full S3 URL or just the key
 * @returns {string} S3 key
 */
export function extractS3Key(urlOrKey) {
    if (!urlOrKey) return null;
    
    // If it's already just a key (no http:// or https://)
    if (!urlOrKey.startsWith('http')) {
        return urlOrKey;
    }
    
    // Parse the URL to get the key
    try {
        const url = new URL(urlOrKey);
        // Remove leading slash from pathname
        return url.pathname.substring(1);
    } catch (error) {
        console.error("Error extracting key from URL:", error);
        return null;
    }
}
