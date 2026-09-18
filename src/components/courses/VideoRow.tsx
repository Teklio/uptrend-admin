import type { ReactNode } from "react";
import { Film, Play, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { formatDuration } from "../../utils/format.util";
import type { CourseVideo } from "../../types/course.type";

interface VideoRowProps {
  video: CourseVideo;
  index: number;
  dragHandle: ReactNode;
  onPlay: () => void;
  onSync: () => void;
  isSyncing: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export const VideoRow = ({ video, index, dragHandle, onPlay, onSync, isSyncing, onEdit, onDelete }: VideoRowProps) => (
  <div className="group flex items-center gap-3 rounded-xl px-2.5 py-2 transition-colors hover:bg-black/3">
    {dragHandle}
    <span className="w-4 shrink-0 text-center text-[12px] tabular-nums" style={{ color: "rgba(0,0,0,0.32)" }}>
      {index + 1}
    </span>
    {video.thumbnailUrl ? (
      <img src={video.thumbnailUrl} alt="" className="h-10 w-16 shrink-0 rounded-lg object-cover" />
    ) : (
      <div
        className="flex h-10 w-16 shrink-0 items-center justify-center rounded-lg"
        style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
      >
        <Film size={14} style={{ color: "rgba(0,0,0,0.3)" }} />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="truncate text-[13px] font-medium" style={{ color: "#191919" }}>
        {video.title}
      </p>
      {video.description && (
        <p className="mt-0.5 truncate text-[12px]" style={{ color: "rgba(0,0,0,0.65)" }}>
          {video.description}
        </p>
      )}
    </div>
    <span className="shrink-0 text-[12px] tabular-nums" style={{ color: "rgba(0,0,0,0.4)" }}>
      {video.durationSeconds === null ? "Processing…" : formatDuration(video.durationSeconds)}
    </span>
    <div className="flex items-center gap-0.5 opacity-80 transition-opacity group-hover:opacity-100">
      <button
        type="button"
        title="Preview"
        onClick={onPlay}
        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
        style={{ color: "#002b7f" }}
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
        style={{ color: "rgba(0,0,0,0.5)" }}
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
