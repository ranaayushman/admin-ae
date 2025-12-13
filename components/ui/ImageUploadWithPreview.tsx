// components/ui/ImageUploadWithPreview.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "./button";
import { convertImageToBase64, validateImageFile, formatFileSize } from "@/lib/utils/imageUtils";

interface ImageUploadWithPreviewProps {
  onImageChange: (base64: string) => void;
  label?: string;
  description?: string;
  currentImage?: string;
  maxSizeMB?: number;
  error?: string;
}

export function ImageUploadWithPreview({
  onImageChange,
  label = "Upload Image",
  description = "Click to upload or drag and drop",
  currentImage,
  maxSizeMB = 5,
  error,
}: ImageUploadWithPreviewProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [fileName, setFileName] = useState<string>("");
  const [fileSize, setFileSize] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (file: File) => {
    setUploadError("");
    
    // Validate file
    const validation = validateImageFile(file, maxSizeMB);
    if (!validation.isValid) {
      setUploadError(validation.error || "Invalid file");
      return;
    }

    try {
      // Convert to base64
      const base64 = await convertImageToBase64(file);
      
      // Update preview and parent component
      setPreview(base64);
      setFileName(file.name);
      setFileSize(formatFileSize(file.size));
      onImageChange(base64);
    } catch (err) {
      setUploadError("Failed to process image. Please try again.");
      console.error("Image conversion error:", err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleClear = () => {
    setPreview(null);
    setFileName("");
    setFileSize("");
    setUploadError("");
    onImageChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium leading-none">
          {label}
        </label>
      )}

      {!preview ? (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all
            ${isDragging 
              ? "border-blue-500 bg-blue-50" 
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
            }
            ${error || uploadError ? "border-red-300" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
              <Upload className="w-6 h-6 text-gray-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                {description}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP or GIF (max {maxSizeMB}MB)
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-white border">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {fileName || "Uploaded image"}
                  </p>
                  {fileSize && (
                    <p className="text-xs text-gray-500 mt-1">{fileSize}</p>
                  )}
                </div>
                
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="flex-shrink-0 ml-2"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClick}
                className="mt-3"
              >
                Replace Image
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>
          </div>
        </div>
      )}

      {(error || uploadError) && (
        <p className="text-sm text-red-600">{error || uploadError}</p>
      )}
    </div>
  );
}
