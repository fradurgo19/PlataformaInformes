/** Match photo optimization: max edge ~800px, lower bitrate, before Supabase upload. */
const MAX_EDGE = 800;
const TARGET_BPS = 700_000;
const MAX_DURATION_SEC = 60;

const isVideoFile = (file: File): boolean => {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('video/')) return true;
  return /\.(mp4|webm|mov|m4v)$/i.test(file.name);
};

const pickRecorderMime = (): string => {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'video/webm;codecs=vp8,opus',
    'video/webm;codecs=vp8',
    'video/webm',
    'video/mp4',
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
};

const captureFromVideo = (video: HTMLVideoElement): MediaStream | null => {
  const withCapture = video as HTMLVideoElement & {
    captureStream?: () => MediaStream;
    mozCaptureStream?: () => MediaStream;
  };
  if (typeof withCapture.captureStream === 'function') return withCapture.captureStream();
  if (typeof withCapture.mozCaptureStream === 'function') return withCapture.mozCaptureStream();
  return null;
};

/**
 * Re-encode a clip in the browser (max 800px, ~700 kbps).
 * Returns the original file when it is already small or the browser cannot re-encode.
 */
export async function compressVideoFile(file: File): Promise<File> {
  if (!isVideoFile(file)) return file;

  const recorderMime = pickRecorderMime();
  if (!recorderMime) {
    if (file.size <= 12_000_000) return file;
    throw new Error('This browser cannot compress video. Use an MP4 under 12MB.');
  }

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = objectUrl;

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error('Could not read the video file'));
    });

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) {
      throw new Error('Invalid video duration');
    }
    if (duration > MAX_DURATION_SEC) {
      throw new Error(`Video is too long. Maximum is ${MAX_DURATION_SEC} seconds per clip.`);
    }

    // Phone clips already fit the upload limit. Re-encoding plays the full clip in real time.
    const FAST_UPLOAD_MAX_BYTES = 3_800_000;
    const type = (file.type || '').toLowerCase();
    const alreadyPlayable = type.startsWith('video/') || /\.(mp4|webm|mov|m4v)$/i.test(file.name);
    if (alreadyPlayable && file.size > 0 && file.size <= FAST_UPLOAD_MAX_BYTES) {
      return file;
    }

    const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth || MAX_EDGE, video.videoHeight || MAX_EDGE));
    const width = Math.max(2, Math.round((video.videoWidth || MAX_EDGE) * scale));
    const height = Math.max(2, Math.round((video.videoHeight || MAX_EDGE) * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width % 2 === 0 ? width : width - 1;
    canvas.height = height % 2 === 0 ? height : height - 1;
    const ctx = canvas.getContext('2d');
    if (!ctx || typeof canvas.captureStream !== 'function') {
      if (file.size <= 12_000_000) return file;
      throw new Error('Video compression is not supported in this browser');
    }

    const canvasStream = canvas.captureStream(20);
    const sourceStream = captureFromVideo(video);
    const output = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...(sourceStream ? sourceStream.getAudioTracks() : []),
    ]);

    const recorder = new MediaRecorder(output, {
      mimeType: recorderMime,
      videoBitsPerSecond: TARGET_BPS,
    });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunks.push(event.data);
    };

    const stopped = new Promise<void>((resolve) => {
      recorder.onstop = () => resolve();
    });

    let frameId = 0;
    const draw = () => {
      if (video.ended || video.paused) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      frameId = window.requestAnimationFrame(draw);
    };

    video.currentTime = 0;
    await video.play();
    recorder.start(250);
    draw();

    await new Promise<void>((resolve) => {
      video.onended = () => resolve();
    });
    window.cancelAnimationFrame(frameId);
    if (recorder.state !== 'inactive') recorder.stop();
    output.getTracks().forEach((track) => track.stop());
    await stopped;

    const blob = new Blob(chunks, { type: recorderMime.split(';')[0] });
    if (blob.size === 0 || blob.size >= file.size * 0.98) {
      return file;
    }

    const baseName = file.name.replace(/\.[^.]+$/, '') || 'video';
    const ext = blob.type.includes('mp4') ? 'mp4' : 'webm';
    return new File([blob], `${baseName}.${ext}`, {
      type: blob.type || 'video/webm',
      lastModified: Date.now(),
    });
  } catch (err) {
    if (file.size <= 12_000_000) return file;
    throw err;
  } finally {
    URL.revokeObjectURL(objectUrl);
    video.removeAttribute('src');
    video.load();
  }
}

export async function compressVideoFiles(files: File[]): Promise<File[]> {
  const result: File[] = [];
  for (const file of files) {
    result.push(await compressVideoFile(file));
  }
  return result;
}
