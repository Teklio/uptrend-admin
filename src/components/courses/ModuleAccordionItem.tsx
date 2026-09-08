import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { SortableList } from "../shared/SortableList";
import { VideoRow } from "./VideoRow";
import { InlineVideoUpload } from "./InlineVideoUpload";
import { formatTotalDuration } from "../../utils/format.util";
import type { CourseModule, CourseVideo } from "../../types/course.type";

interface ModuleAccordionItemProps {
  module: CourseModule;
  index: number;
  courseId: string;
  dragHandle: ReactNode;
  onRename: () => void;
  onDeleteModule: () => void;
  onReorderVideos: (newOrder: CourseVideo[]) => void;
  onPlayVideo: (video: CourseVideo) => void;
  onSyncVideo: (video: CourseVideo) => void;
  syncingVideoId: string | null;
  onEditVideo: (video: CourseVideo) => void;
  onDeleteVideo: (video: CourseVideo) => void;
}

export const ModuleAccordionItem = ({
  module,
  index,
  courseId,
  dragHandle,
  onRename,
  onDeleteModule,
  onReorderVideos,
  onPlayVideo,
  onSyncVideo,
  syncingVideoId,
  onEditVideo,
  onDeleteVideo,
}: ModuleAccordionItemProps) => {
  const [expanded, setExpanded] = useState(true);

  const totalSeconds = module.videos.reduce((sum, v) => sum + (v.durationSeconds ?? 0), 0);
  const videoCountLabel = `${module.videos.length} video${module.videos.length === 1 ? "" : "s"}`;
  const metaLabel = totalSeconds > 0 ? `${videoCountLabel} · ${formatTotalDuration(totalSeconds)} total` : videoCountLabel;

  return (
    <div className="group rounded-2xl bg-white transition-colors" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
      <div
        className={`flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-black/3 ${expanded ? "rounded-t-2xl" : "rounded-2xl"}`}
      >
        {dragHandle}
        <span className="w-5 shrink-0 text-center text-[12px] tabular-nums" style={{ color: "rgba(0,0,0,0.32)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex flex-1 items-center gap-2.5 text-left"
        >
          <ChevronDown
            size={16}
            className="shrink-0 transition-transform"
            style={{ color: "rgba(0,0,0,0.4)", transform: expanded ? undefined : "rotate(-90deg)" }}
          />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold" style={{ color: "#191919" }}>
              {module.title}
            </p>
            {module.description && (
              <p className="mt-0.5 truncate text-[12.5px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                {module.description}
              </p>
            )}
            <p className="mt-1 text-[11px] tabular-nums" style={{ color: "rgba(0,0,0,0.38)" }}>
              {metaLabel}
            </p>
          </div>
        </button>
        <div className="flex items-center gap-1 opacity-80 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            title="Rename"
            onClick={onRename}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
            style={{ color: "rgba(0,0,0,0.55)" }}
          >
            <Pencil size={14} />
          </button>
          <button
            type="button"
            title="Delete module"
            onClick={onDeleteModule}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
            style={{ color: "#dc2626" }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="flex flex-col gap-1 px-3 pb-4" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <div className="pt-2.5">
            {module.videos.length > 0 && (
              <SortableList
                items={module.videos}
                onReorder={onReorderVideos}
                className="gap-0.5"
                renderItem={(video, dragHandleProp, videoIndex) => (
                  <VideoRow
                    video={video}
                    index={videoIndex}
                    dragHandle={dragHandleProp}
                    onPlay={() => onPlayVideo(video)}
                    onSync={() => onSyncVideo(video)}
                    isSyncing={syncingVideoId === video.id}
                    onEdit={() => onEditVideo(video)}
                    onDelete={() => onDeleteVideo(video)}
                  />
                )}
              />
            )}
          </div>
          <InlineVideoUpload courseId={courseId} moduleId={module.id} />
        </div>
      )}
    </div>
  );
};
