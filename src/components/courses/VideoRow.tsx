import type { ReactNode } from "react";
import { Film, Play, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { formatDuration } from "../../utils/format.util";
import type { CourseVideo } from "../../types/course.type";

interface VideoRowProps {
  video: CourseVideo;
  dragHandle: ReactNode;
  onPlay: () => void;
  onSync: () => void;
  isSyncing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const VideoRow = ({ video, dragHandle, onPlay, onSync, isSyncing, onEdit, onDelete }: VideoRowProps) => (
  <div
    className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5"
    style={{ border: "1px solid rgba(0,0,0,0.07)" }}
  >
    {dragHandle}
    {video.thumbnailUrl ? (
      <img src={video.thumbnailUrl} alt="" className="h-10 w-16 flex-shrink-0 rounded-lg object-cover" />
    ) : (
      <div
        className="flex h-10 w-16 flex-shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
      >
        <Film size={14} style={{ color: "rgba(0,0,0,0.3)" }} />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] font-medium" style={{ color: "#191919" }}>
        {video.title}
      </p>
      <p className="font-mono text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
        {video.durationSeconds === null ? "Processing…" : formatDuration(video.durationSeconds)}
      </p>
    </div>
    <div className="flex items-center gap-1">
      <button
        type="button"
        title="Preview"
        onClick={onPlay}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
        style={{ color: "#7e14ff" }}
      >
        <Play size={14} />
      </button>
      {video.durationSeconds === null && (
        <button
          type="button"
          title="Sync"
          onClick={onSync}
          disabled={isSyncing}
          className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5 disabled:opacity-50"
          style={{ color: "#ca8a04" }}
        >
          <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
        </button>
      )}
      <button
        type="button"
        title="Edit"
        onClick={onEdit}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
        style={{ color: "rgba(0,0,0,0.55)" }}
      >
        <Pencil size={14} />
      </button>
      <button
        type="button"
        title="Delete"
        onClick={onDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
        style={{ color: "#dc2626" }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  </div>
);
