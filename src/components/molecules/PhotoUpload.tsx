import React, { useRef, useState } from 'react';
import { Button } from '../atoms/Button';
import { Camera, X, Upload, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PhotoUploadProps {
  photos: Array<File | { id: string; url: string; filename: string }>;
  onPhotosChange: (photos: Array<File | { id: string; url: string; filename: string }>) => void;
  maxPhotos?: number;
  label?: string;
  onDeleteExistingPhoto?: (photoId: string) => Promise<void>;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 10,
  label = 'Photos',
  onDeleteExistingPhoto,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);

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

  const removePhoto = async (index: number) => {
    const photo = photos[index];
    
    // Si es una foto existente (tiene id), llamar a la API para eliminarla
    if (typeof photo === 'object' && 'id' in photo && onDeleteExistingPhoto) {
      try {
        setDeletingPhotoId(photo.id);
        await onDeleteExistingPhoto(photo.id);
        // La foto se eliminará del servidor, pero mantenemos la UI actualizada
        const newPhotos = photos.filter((_, i) => i !== index);
        onPhotosChange(newPhotos);
      } catch (error) {
        console.error('Error deleting photo:', error);
        // Si falla la eliminación, no actualizamos la UI
      } finally {
        setDeletingPhotoId(null);
      }
    } else {
      // Si es una nueva foto (File), solo la removemos de la UI
      const newPhotos = photos.filter((_, i) => i !== index);
      onPhotosChange(newPhotos);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const isExistingPhoto = (photo: File | { id: string; url: string; filename: string }): boolean => {
    return typeof photo === 'object' && 'id' in photo;
  };

  const getPhotoSrc = (photo: File | { id: string; url: string; filename: string }): string => {
    if (photo instanceof File) {
      return URL.createObjectURL(photo);
    }
    return photo.url;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        <span className="text-slate-400 ml-1">({photos.length}/{maxPhotos})</span>
        {photos.length >= maxPhotos && (
          <span className="text-orange-600 ml-2 text-xs">Maximum photos reached</span>
        )}
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
            const src = getPhotoSrc(photo);
            const isExisting = isExistingPhoto(photo);
            const isDeleting = isExisting && deletingPhotoId === (photo as any).id;
            
            return (
              <div key={index} className="relative group w-32 h-24">
                <img
                  src={src}
                  alt={`Photo ${index + 1}`}
                  className={cn(
                    "w-full h-full object-cover rounded-lg border border-slate-200",
                    isDeleting && "opacity-50"
                  )}
                  onLoad={() => {
                    if (photo instanceof File) URL.revokeObjectURL(src);
                  }}
                />
                {/* Badge para fotos existentes */}
                {isExisting && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                    Existing
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  disabled={isDeleting}
                  className={cn(
                    "absolute -top-2 -right-2 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity",
                    isExisting 
                      ? "bg-orange-500 hover:bg-orange-600" 
                      : "bg-red-500 hover:bg-red-600",
                    isDeleting && "opacity-50 cursor-not-allowed"
                  )}
                  title={isExisting ? "Remove existing photo" : "Remove new photo"}
                >
                  {isDeleting ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : isExisting ? (
                    <Trash2 className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};