/**
 * Helpers for parsing, formatting and embedding match video URLs
 * Supports YouTube (standard, youtu.be, shorts), Google Drive, TikTok, Instagram, direct video files, etc.
 */

export interface ParsedVideoInfo {
  type: 'youtube' | 'drive' | 'direct' | 'embed_other' | 'external';
  embedUrl?: string;
  originalUrl: string;
  platformName: string;
  icon: string;
}

export function parseVideoUrl(rawUrl?: string | null): ParsedVideoInfo | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();
  if (!url) return null;

  try {
    // 1. YouTube formats: youtube.com/watch?v=..., youtu.be/..., youtube.com/shorts/...
    const ytRegex = /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const ytMatch = url.match(ytRegex);
    if (ytMatch && ytMatch[1]) {
      const videoId = ytMatch[1];
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`,
        originalUrl: url,
        platformName: 'YouTube',
        icon: 'smart_display'
      };
    }

    // 2. Google Drive formats: drive.google.com/file/d/FILE_ID/view...
    const driveRegex = /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
    const driveMatch = url.match(driveRegex);
    if (driveMatch && driveMatch[1]) {
      const fileId = driveMatch[1];
      return {
        type: 'drive',
        embedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
        originalUrl: url,
        platformName: 'Google Drive',
        icon: 'cloud_download'
      };
    }

    // 3. Direct video files (.mp4, .webm, .ogg, .mov)
    if (/\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url)) {
      return {
        type: 'direct',
        embedUrl: url,
        originalUrl: url,
        platformName: 'Video Directo (MP4)',
        icon: 'movie'
      };
    }

    // 4. TikTok
    if (/tiktok\.com/i.test(url)) {
      return {
        type: 'external',
        originalUrl: url,
        platformName: 'TikTok',
        icon: 'music_note'
      };
    }

    // 5. Instagram
    if (/instagram\.com/i.test(url)) {
      return {
        type: 'external',
        originalUrl: url,
        platformName: 'Instagram Reels',
        icon: 'camera_alt'
      };
    }

    // 6. Generic web link
    return {
      type: 'external',
      originalUrl: url,
      platformName: 'Video Web',
      icon: 'link'
    };
  } catch {
    return {
      type: 'external',
      originalUrl: url,
      platformName: 'Video Enlace',
      icon: 'link'
    };
  }
}
