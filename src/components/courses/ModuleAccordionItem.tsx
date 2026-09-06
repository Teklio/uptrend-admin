import { useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { SortableList } from "../shared/SortableList";
import { VideoRow } from "./VideoRow";
import type { CourseModule, CourseVideo } from "../../types/course.type";

interface ModuleAccordionItemProps {
  module: CourseModule;
  dragHandle: ReactNode;
  onRename: () => void;
  onDeleteModule: () => void;
  onAddVideo: () => void;
  onReorderVideos: (newOrder: CourseVideo[]) => void;
  onPlayVideo: (video: CourseVideo) => void;
  onSyncVideo: (video: CourseVideo) => void;
  syncingVideoId: string | null;
  onEditVideo: (video: CourseVideo) => void;
  onDeleteVideo: (video: CourseVideo) => void;
}

export const ModuleAccordionItem = ({
  module,
  dragHandle,
  onRename,
  onDeleteModule,
  onAddVideo,
  onReorderVideos,
  onPlayVideo,
  onSyncVideo,
  syncingVideoId,
  onEditVideo,
  onDeleteVideo,
}: ModuleAccordionItemProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl bg-white" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {dragHandle}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="flex flex-1 items-center gap-2 text-left"
        >
          <ChevronDown
            size={16}
            className="transition-transform"
            style={{ color: "rgba(0,0,0,0.4)", transform: expanded ? undefined : "rotate(-90deg)" }}
          />
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold" style={{ color: "#191919" }}>
              {module.title}
            </p>
            <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
              {module.videos.length} video{module.videos.length === 1 ? "" : "s"}
            </p>
          </div>
        </button>
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

      {expanded && (
        <div className="flex flex-col gap-2 px-4 pb-4" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <div className="pt-3">
            {module.videos.length > 0 && (
              <SortableList
                items={module.videos}
                onReorder={onReorderVideos}
                renderItem={(video, dragHandleProp) => (
                  <VideoRow
                    video={video}
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
          <button
            type="button"
            onClick={onAddVideo}
            className="mt-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(126,20,255,0.08)", color: "#7e14ff" }}
          >
            <Plus size={15} />
            Add video
          </button>
        </div>
      )}
    </div>
  );
};
