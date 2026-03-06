import { S3Client, s3 } from "bun";

type BunS3Client = S3Client;

// export const blob: BunS3Client = new S3Client({
//     accessKeyId: process.env.BLOB_USERNAME || "minioadmin",
//     secretAccessKey: process.env.BLOB_PASSWORD || "minioadmin",
//     bucket: process.env.BLOB_BUCKET || "albay-tourist",
//     // sessionToken: "..."
//     acl: "public-read",
//     // endpoint: "https://s3.us-east-1.amazonaws.com",
//     // endpoint: "https://<account-id>.r2.cloudflarestorage.com", // Cloudflare R2
//     // endpoint: "https://<region>.digitaloceanspaces.com", // DigitalOcean Spaces
//     endpoint: "http://localhost:9000", // MinIO
// });


export const blob: BunS3Client = new S3Client({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  bucket: "albay-tourist", // or access point alias
  region: "ap-southeast-1",
  endpoint: "https://s3.ap-southeast-1.amazonaws.com",
  acl: "public-read"
});

// https://albay-tourist.s3.ap-southeast-1.amazonaws.com/albay/hotels/1772518579447_image.jpg/xl.meta