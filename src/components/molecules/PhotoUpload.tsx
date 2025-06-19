import React, { useRef, useState } from 'react';
import { Button } from '../atoms/Button';
import { Camera, X, Upload } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PhotoUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  label?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  label = 'Photos',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const remainingSlots = maxPhotos - photos.length;
    
    const filesToProcess = newFiles.slice(0, remainingSlots);

    const imageFiles = filesToProcess.filter(file => file.type.startsWith('image/'));

    if (imageFiles.length > 0) {
      onPhotosChange([...photos, ...imageFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        <span className="text-slate-400 ml-1">({photos.length}/{maxPhotos})</span>
      </label>

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-slate-300 hover:border-slate-400',
          photos.length >= maxPhotos && 'opacity-50 pointer-events-none'
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
        <p className="text-sm text-slate-600 mb-2">
          Drag and drop photos here, or click to select
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={openFileDialog}
          disabled={photos.length >= maxPhotos}
        >
          <Camera className="w-4 h-4 mr-2" />
          Select Photos
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => {
            const objectUrl = URL.createObjectURL(photo);
            return (
              <div key={index} className="relative group">
                <img
                  src={objectUrl}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  onLoad={() => URL.revokeObjectURL(objectUrl)}
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};