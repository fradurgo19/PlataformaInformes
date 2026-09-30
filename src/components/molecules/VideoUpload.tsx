import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../atoms/Button';
import { Video, X, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

type ExistingVideo = { id: string; url: string; filename: string };
type VideoItem = File | ExistingVideo;

interface VideoUploadProps {
  videos: VideoItem[];
  onVideosChange: (videos: VideoItem[]) => void;
  maxVideos?: number;
  onDeleteExistingVideo?: (videoId: string) => Promise<void>;
}

const VIDEO_EXT = /\.(mp4|webm|mov|m4v)$/i;

const isFileVideo = (item: VideoItem): item is File =>
  typeof File !== 'undefined' && item instanceof File;

const isExistingVideo = (item: VideoItem): item is ExistingVideo =>
  !isFileVideo(item) && typeof item === 'object' && item !== null && 'id' in item;

const isAcceptableVideo = (file: File): boolean => {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('video/')) return true;
  return VIDEO_EXT.test(file.name);
};

export const VideoUpload: React.FC<VideoUploadProps> = ({
  videos,
  onVideosChange,
  maxVideos = 10,
  onDeleteExistingVideo,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filePreviewUrls = useMemo(() => {
    const map = new Map<number, string>();
    videos.forEach((item, index) => {
      if (isFileVideo(item)) map.set(index, URL.createObjectURL(item));
    });
    return map;
  }, [videos]);

  useEffect(() => {
    return () => {
      filePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [filePreviewUrls]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    setLocalError(null);
    const remaining = maxVideos - videos.length;
    if (remaining <= 0) {
      setLocalError(`Maximum of ${maxVideos} videos reached for this component.`);
      return;
    }
    const selected = Array.from(files);
    const accepted = selected.filter(isAcceptableVideo);
    const toAdd = accepted.slice(0, remaining);
    if (toAdd.length > 0) onVideosChange([...videos, ...toAdd]);
    if (selected.length !== accepted.length) {
      setLocalError('Only MP4, WebM or MOV videos are accepted.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeVideo = async (index: number) => {
    const item = videos[index];
    if (isExistingVideo(item) && onDeleteExistingVideo) {
      try {
        setDeletingId(item.id);
        await onDeleteExistingVideo(item.id);
        onVideosChange(videos.filter((_, i) => i !== index));
      } catch (error) {
        console.error('Error deleting video:', error);
        setLocalError('Could not delete the video. Please try again.');
      } finally {
        setDeletingId(null);
      }
      return;
    }
    onVideosChange(videos.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-700">
        Videos
        <span className="text-slate-400 ml-1">({videos.length}/{maxVideos})</span>
      </label>
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center">
        <Video className="mx-auto h-7 w-7 text-slate-400 mb-2" />
        <p className="text-sm text-slate-600 mb-2">
          MP4, WebM or MOV. Max 60 seconds. Compressed before upload.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={videos.length >= maxVideos}
        >
          Select Videos
        </Button>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov,.m4v"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      {localError && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2">
          {localError}
        </p>
      )}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((item, index) => {
            const src = isFileVideo(item) ? filePreviewUrls.get(index) || '' : item.url;
            const existing = isExistingVideo(item);
            const name = isFileVideo(item) ? item.name : item.filename;
            return (
              <div key={existing ? item.id : `new-video-${index}`} className="relative">
                {src ? (
                  <video
                    src={src}
                    controls
                    playsInline
                    className={cn(
                      'w-full h-36 rounded-lg border border-slate-200 bg-black object-contain',
                      existing && deletingId === item.id && 'opacity-50'
                    )}
                  />
                ) : (
                  <div className="w-full h-36 rounded-lg border border-slate-200 bg-slate-100" />
                )}
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="absolute -top-2 -right-2 bg-brand-red text-white rounded-full p-1"
                  title="Remove video"
                >
                  {existing ? <Trash2 className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </button>
                <p className="text-xs text-slate-600 truncate mt-1">{name}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
