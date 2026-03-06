import mongoose, { type ConnectOptions } from "mongoose";

type ConnectionConfig = {
    uri: string;
    options: ConnectOptions;
};

const connectWithRetry = async ({ uri, options }: ConnectionConfig): Promise<void> => {
        console.log("🚀wait.");
    try {
        await mongoose.connect(uri, options);
        console.log("🚀 System online. Connected to MongoDB Shards directly.");
    } catch (err: any) {
        // Now that you use a Standard String, you shouldn't see querySrv errors,
        // but it's great defensive programming to keep the check.
        if (err.code === 'ECONNREFUSED') {
            console.error("💡 Connection Refused: Check if your IP is whitelisted in Atlas.");
        } else {
            console.error("❌ Database Error:", err.message);
        }
        process.exit(1);
    }
};

// Top-level await is natively supported in Bun!
await connectWithRetry({
    uri: "mongodb://albay:albay@cluster0-shard-00-00.vsgjiog.mongodb.net:27017,cluster0-shard-00-01.vsgjiog.mongodb.net:27017,cluster0-shard-00-02.vsgjiog.mongodb.net:27017/test?ssl=true&replicaSet=atlas-vsgjiog-shard-0&authSource=admin&retryWrites=true&w=majority",
    options: {
        serverApi: {
            version: "1",
            strict: true,
            deprecationErrors: true,
        },
    }
});