// lib/utils/imageUtils.ts

/**
 * Convert a File object to base64 string
 * @param file - File object to convert
 * @returns Promise resolving to base64 string with data URI prefix (e.g., "data:image/jpeg;base64,...")
 */
export async function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64String = reader.result;
        
        // Validate that it's a proper data URI
        if (!base64String.startsWith('data:image/')) {
          console.error('❌ Invalid base64 format:', base64String.substring(0, 50));
          reject(new Error('Invalid base64 format: missing data URI prefix'));
          return;
        }
        
        // Log success with details
        const sizeKB = Math.round(base64String.length / 1024);
        console.log(`✅ Image converted to base64 successfully:`, {
          fileName: file.name,
          fileType: file.type,
          originalSize: formatFileSize(file.size),
          base64Size: `${sizeKB} KB`,
          dataUriPrefix: base64String.substring(0, 30) + '...',
        });
        
        // Warn if base64 is very large (over 10MB)
        if (base64String.length > 10 * 1024 * 1024) {
          console.warn('⚠️ Base64 string is very large. Consider compressing the image.');
        }
        
        resolve(base64String);
      } else {
        console.error('❌ FileReader result is not a string:', typeof reader.result);
        reject(new Error('Failed to convert image to base64'));
      }
    };
    
    reader.onerror = (error) => {
      console.error('❌ FileReader error:', error);
      reject(new Error('Error reading file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file type and size
 * @param file - File to validate
 * @param maxSizeMB - Maximum file size in megabytes (default: 5MB)
 * @returns Object with isValid flag and error message if invalid
 */
export function validateImageFile(
  file: File,
  maxSizeMB: number = 5
): { isValid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid file type. Please upload JPG, PNG, WebP, or GIF images.',
    };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeMB}MB. Please upload a smaller image.`,
    };
  }
  
  return { isValid: true };
}

/**
 * Format file size in human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
