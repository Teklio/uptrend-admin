import type { CourseVideo } from "./course.type";

export interface BunnyTusUploadCredentials {
  uploadEndpoint: string;
  libraryId: string;
  videoId: string;
  authorizationSignature: string;
  authorizationExpire: number;
}

export interface CreateVideoResult {
  video: CourseVideo;
  upload: BunnyTusUploadCredentials;
}

export interface VideoPlaybackResult {
  videoId: string;
  title: string;
  embedUrl: string;
  expiresAt: string;
}

export interface SyncVideoResult extends CourseVideo {
  synced: boolean;
}
