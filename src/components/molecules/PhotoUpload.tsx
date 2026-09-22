import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../atoms/Button';
import { Camera, X, Upload, Trash2, Edit3 } from 'lucide-react';
import { cn } from '../../utils/cn';

type ExistingPhoto = { id: string; url: string; filename: string; photo_name?: string };
type PhotoItem = File | ExistingPhoto;

interface PhotoUploadProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  maxPhotos?: number;
  label?: string;
  onDeleteExistingPhoto?: (photoId: string) => Promise<void>;
  onPhotoNameChange?: (photoId: string, newName: string) => Promise<void>;
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|bmp|heic|heif)$/i;
const UNSUPPORTED_SAVE_EXT = /\.(heic|heif)$/i;

const isFilePhoto = (photo: PhotoItem): photo is File =>
  typeof File !== 'undefined' && photo instanceof File;

const isExistingPhoto = (photo: PhotoItem): photo is ExistingPhoto =>
  !isFilePhoto(photo) && typeof photo === 'object' && photo !== null && 'id' in photo;

const isAcceptableImageFile = (file: File): boolean => {
  const type = (file.type || '').toLowerCase();
  // Accept any image/* including image/jpeg, image/jpg, image/pjpeg, etc.
  if (type.startsWith('image/')) return true;
  // Some devices send empty MIME or application/octet-stream for JPG/PNG
  if (IMAGE_EXT.test(file.name)) return true;
  return false;
};

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 20,
  label = 'Photos',
  onDeleteExistingPhoto,
  onPhotoNameChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | null>(null);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Stable preview URLs for File objects; revoke only on unmount / photo removal.
  const filePreviewUrls = useMemo(() => {
    const map = new Map<number, string>();
    photos.forEach((photo, index) => {
      if (isFilePhoto(photo)) {
        map.set(index, URL.createObjectURL(photo));
      }
    });
    return map;
  }, [photos]);

  useEffect(() => {
    return () => {
      filePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviewUrls]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setLocalError(null);

    const remainingSlots = maxPhotos - photos.length;
    if (remainingSlots <= 0) {
      setLocalError(`Maximum of ${maxPhotos} photos reached for this component.`);
      return;
    }

    const selected = Array.from(files);
    const imageFiles = selected.filter(isAcceptableImageFile);
    const rejectedCount = selected.length - imageFiles.length;
    const heicCount = imageFiles.filter((f) =>
      f.type.includes('heic') || f.type.includes('heif') || UNSUPPORTED_SAVE_EXT.test(f.name)
    ).length;

    const filesToAdd = imageFiles.slice(0, remainingSlots);
    if (filesToAdd.length > 0) {
      onPhotosChange([...photos, ...filesToAdd]);
    }

    const messages: string[] = [];
    if (rejectedCount > 0) {
      messages.push(`${rejectedCount} file(s) were skipped (not a supported image).`);
    }
    if (imageFiles.length > remainingSlots) {
      messages.push(`Only ${remainingSlots} more photo(s) can be added (limit ${maxPhotos}).`);
    }
    if (heicCount > 0) {
      messages.push(
        'HEIC/HEIF photos from iPhone may fail on save. Prefer JPEG or PNG, or convert before uploading.'
      );
    }
    if (messages.length > 0) {
      setLocalError(messages.join(' '));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removePhoto = async (index: number) => {
    const photo = photos[index];
    setLocalError(null);

    if (isExistingPhoto(photo) && onDeleteExistingPhoto) {
      try {
        setDeletingPhotoId(photo.id);
        await onDeleteExistingPhoto(photo.id);
        onPhotosChange(photos.filter((_, i) => i !== index));
      } catch (error) {
        console.error('Error deleting photo:', error);
        setLocalError('Could not delete the existing photo. Please try again.');
      } finally {
        setDeletingPhotoId(null);
      }
      return;
    }

    onPhotosChange(photos.filter((_, i) => i !== index));
  };

  const startEditingName = (photo: ExistingPhoto) => {
    setEditingPhotoId(photo.id);
    setEditingName(photo.photo_name || photo.filename);
  };

  const savePhotoName = async (photoId: string) => {
    if (onPhotoNameChange) {
      try {
        await onPhotoNameChange(photoId, editingName);
        onPhotosChange(
          photos.map((photo) =>
            isExistingPhoto(photo) && photo.id === photoId
              ? { ...photo, photo_name: editingName }
              : photo
          )
        );
      } catch (error) {
        console.error('Error updating photo name:', error);
        setLocalError('Could not update the photo name.');
      }
    }
    setEditingPhotoId(null);
    setEditingName('');
  };

  const cancelEditing = () => {
    setEditingPhotoId(null);
    setEditingName('');
  };

  const getPhotoSrc = (photo: PhotoItem, index: number): string => {
    if (isFilePhoto(photo)) {
      return filePreviewUrls.get(index) || '';
    }
    return photo.url;
  };

  const getPhotoName = (photo: PhotoItem): string => {
    if (isFilePhoto(photo)) return photo.name;
    return photo.photo_name || photo.filename;
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        {label}
        <span className="text-slate-400 ml-1">
          ({photos.length}/{maxPhotos})
        </span>
        {photos.length >= maxPhotos && (
          <span className="text-orange-600 ml-2 text-xs">Maximum photos reached</span>
        )}
      </label>

      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-colors',
          isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-300 hover:border-slate-400',
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
          onClick={() => fileInputRef.current?.click()}
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
        accept="image/*,.jpg,.jpeg,.jpe,.png,.gif,.webp,.bmp,.heic,.heif,image/jpeg,image/jpg,image/pjpeg,image/png,image/gif,image/webp"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {localError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {localError}
        </p>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo, index) => {
            const src = getPhotoSrc(photo, index);
            const existing = isExistingPhoto(photo);
            const isDeleting = existing && deletingPhotoId === photo.id;
            const isEditing = existing && editingPhotoId === photo.id;
            const key = existing ? photo.id : `new-${index}-${isFilePhoto(photo) ? photo.name : index}`;

            return (
              <div key={key} className="relative group w-32 h-24">
                {src ? (
                  <img
                    src={src}
                    alt={`Photo ${index + 1}`}
                    className={cn(
                      'w-full h-full object-cover rounded-lg border border-slate-200',
                      isDeleting && 'opacity-50',
                      isEditing && 'border-blue-500'
                    )}
                  />
                ) : (
                  <div className="w-full h-full rounded-lg border border-slate-200 bg-slate-100" />
                )}
                {existing && (
                  <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                    Existing
                  </div>
                )}
                {isEditing && (
                  <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
                    Editing
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  disabled={!!isDeleting}
                  className={cn(
                    'absolute -top-2 -right-2 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity',
                    existing ? 'bg-orange-500 hover:bg-orange-600' : 'bg-red-500 hover:bg-red-600',
                    isDeleting && 'opacity-50 cursor-not-allowed'
                  )}
                  title={existing ? 'Remove existing photo' : 'Remove new photo'}
                >
                  {isDeleting ? (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : existing ? (
                    <Trash2 className="w-3 h-3" />
                  ) : (
                    <X className="w-3 h-3" />
                  )}
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-white bg-opacity-90 p-1 rounded-b-lg">
                  {isEditing && existing ? (
                    <input
                      type="text"
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={() => savePhotoName(photo.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') savePhotoName(photo.id);
                        else if (e.key === 'Escape') cancelEditing();
                      }}
                      className="w-full text-xs text-slate-700 border border-slate-300 rounded-sm px-1 py-0.5 focus:outline-none focus:border-blue-500"
                      placeholder="Enter photo name..."
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-700 truncate px-1">
                        {getPhotoName(photo)}
                      </span>
                      {existing && (
                        <button
                          type="button"
                          onClick={() => startEditingName(photo)}
                          className="text-blue-500 hover:text-blue-700 p-1"
                          title="Edit photo name"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
