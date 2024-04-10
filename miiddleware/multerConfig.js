const { S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 
  }
});

const uploadToS3 = async (file) => {
    try {
        const id = uuidv4();
        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `${id}-${file.originalname}`,
            Body: file.buffer,
            ContentType: file.mimetype
        };
        await s3Client.send(new PutObjectCommand(uploadParams));
        const url = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
        return url;
      } catch (error) {
        console.error('Error uploading file to S3:', error);
        throw error;
      }
    };
   
const mulUpload = upload.fields([{ name: 'thumbnail' }, { name: 'images', maxCount: 5 }]);

module.exports = { uploadToS3, mulUpload};
