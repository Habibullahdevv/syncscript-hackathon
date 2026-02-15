import { v2 as cloudinary } from 'cloudinary';

/**
 * Cloudinary SDK configuration
 * Initializes Cloudinary with credentials from environment variables
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param fileBuffer - File buffer to upload
 * @param options - Cloudinary upload options
 * @returns Upload result with secure URL and public ID
 */
export async function uploadToCloudinary(
  fileBuffer: Buffer,
  options: {
    folder?: string;
    resource_type?: 'image' | 'video' | 'raw' | 'auto';
    public_id?: string;
  } = {}
) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type || 'raw',
        folder: options.folder,
        public_id: options.public_id,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

/**
 * Delete file from Cloudinary
 * @param publicId - Cloudinary public ID
 * @param resourceType - Resource type (default: 'raw')
 */
export async function deleteFromCloudinary(
  publicId: string,
  resourceType: 'image' | 'video' | 'raw' = 'raw'
) {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;
