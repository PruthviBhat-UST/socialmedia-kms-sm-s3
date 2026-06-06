import { 
    SecretsManagerClient, 
    GetSecretValueCommand 
} from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ 
    region: "ap-south-1"
});

export const getSecrets = async () => {
    try {
        console.log("Fetching secrets from AWS Secret Manager...");
        
        const command = new GetSecretValueCommand({
            SecretId: "social-app/production"
        });

        const response = await client.send(command);
        const secrets = JSON.parse(response.SecretString);
        
        process.env.MONGO_DB        = secrets.MONGO_DB;
        process.env.JWT_SECRET      = secrets.JWT_SECRET;
        process.env.JWT_KEY         = secrets.JWT_SECRET; // ← ADD THIS LINE
        process.env.PORT            = secrets.PORT;
        process.env.FRONTEND_URL    = secrets.FRONTEND_URL;
        process.env.AWS_BUCKET_NAME = secrets.AWS_BUCKET_NAME;
        process.env.AWS_REGION      = secrets.AWS_REGION;
        
        // Verify JWT_KEY is set
        console.log("✅ Secrets loaded from Secret Manager");
        console.log("✅ JWT_KEY is set:", !!process.env.JWT_KEY);
        
    } catch (error) {
        console.error("❌ Error fetching secrets:", error.message);
        throw error;
    }
};
