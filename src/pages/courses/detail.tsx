import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { useGetCourse } from "../../services/course.service";
import { useDeleteModule, useReorderModules } from "../../services/module.service";
import { useDeleteVideo, useReorderVideos, useSyncVideo, useVideoPlayback } from "../../services/video.service";
import { SortableList } from "../../components/shared/SortableList";
import { ModuleAccordionItem } from "../../components/courses/ModuleAccordionItem";
import { ModuleFormInline } from "../../components/courses/ModuleFormInline";
import { VideoFormInline } from "../../components/courses/VideoFormInline";
import { VideoUploadDialog } from "../../components/courses/VideoUploadDialog";
import { VideoPreviewModal } from "../../components/courses/VideoPreviewModal";
import { CourseSheet } from "../../components/courses/CourseSheet";
import { DeleteConfirmModal } from "../../components/shared/DeleteConfirmModal";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { MainLayoutShimmer } from "../../components/shared/Shimmer";
import { toastMessage } from "../../utils/toast.util";
import { formatCurrency } from "../../utils/format.util";
import type { CourseModule, CourseVideo } from "../../types/course.type";

type ModuleFormState = { open: false } | { open: true; module: CourseModule | null };
type VideoUploadState = { open: false } | { open: true; moduleId: string };
type PreviewState = { open: false } | { open: true; title: string; embedUrl: string };

const CourseDetailPage = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useGetCourse(courseId);

  const [courseSheetOpen, setCourseSheetOpen] = useState(false);
  const [moduleFormState, setModuleFormState] = useState<ModuleFormState>({ open: false });
  const [moduleToDelete, setModuleToDelete] = useState<CourseModule | null>(null);
  const [videoUploadState, setVideoUploadState] = useState<VideoUploadState>({ open: false });
  const [videoToEdit, setVideoToEdit] = useState<CourseVideo | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<CourseVideo | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState>({ open: false });
  const [syncingVideoId, setSyncingVideoId] = useState<string | null>(null);

  const reorderModules = useReorderModules(courseId ?? "");
  const deleteModule = useDeleteModule(courseId ?? "");
  const reorderVideos = useReorderVideos(courseId ?? "");
  const syncVideo = useSyncVideo(courseId ?? "");
  const deleteVideo = useDeleteVideo(courseId ?? "");
  const videoPlayback = useVideoPlayback();

  if (isLoading || !course) {
    return <MainLayoutShimmer />;
  }

  const handleReorderModules = (newOrder: CourseModule[]) => {
    reorderModules.mutate(newOrder.map((m, index) => ({ id: m.id, displayOrder: index })));
  };

  const handleReorderVideos = (moduleId: string, newOrder: CourseVideo[]) => {
    reorderVideos.mutate({
      moduleId,
      order: newOrder.map((v, index) => ({ id: v.id, displayOrder: index })),
    });
  };

  const handlePlayVideo = (video: CourseVideo) => {
    videoPlayback.mutate(video.id, {
      onSuccess: (result) => setPreviewState({ open: true, title: result.title, embedUrl: result.embedUrl }),
      onError: (err) => toastMessage.apiError(err),
    });
  };

  const handleSyncVideo = (video: CourseVideo) => {
    setSyncingVideoId(video.id);
    syncVideo.mutate(video.id, {
      onSuccess: (result) => {
        if (result.synced) {
          toastMessage.success({ message: "Video synced successfully" });
        } else {
          toastMessage.info({ message: "Still processing on Bunny — try again shortly" });
        }
      },
      onError: (err) => toastMessage.apiError(err),
      onSettled: () => setSyncingVideoId(null),
    });
  };

  const handleDeleteModule = () => {
    if (!moduleToDelete) return;
    deleteModule.mutate(moduleToDelete.id, {
      onSuccess: () => {
        toastMessage.success({ message: "Module deleted successfully" });
        setModuleToDelete(null);
      },
      onError: (err) => toastMessage.apiError(err),
    });
  };

  const handleDeleteVideo = () => {
    if (!videoToDelete) return;
    deleteVideo.mutate(videoToDelete.id, {
      onSuccess: () => {
        toastMessage.success({ message: "Video deleted successfully" });
        setVideoToDelete(null);
      },
      onError: (err) => toastMessage.apiError(err),
    });
  };

  return (
    <div className="flex flex-col gap-5">
      <button
        type="button"
        onClick={() => navigate("/courses")}
        className="flex w-fit items-center gap-1.5 text-[13px] font-medium"
        style={{ color: "rgba(0,0,0,0.5)" }}
      >
        <ArrowLeft size={15} />
        Back to courses
      </button>

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl bg-white p-5" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
        <div className="flex items-center gap-4">
          {course.primaryImageUrl ? (
            <img src={course.primaryImageUrl} alt="" className="h-16 w-16 rounded-xl object-cover" />
          ) : (
            <div className="h-16 w-16 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.06)" }} />
          )}
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[18px] font-semibold" style={{ color: "#191919" }}>
                {course.name}
              </h1>
              <StatusBadge
                label={course.isPublished ? "Published" : "Draft"}
                variant={course.isPublished ? "success" : "neutral"}
              />
            </div>
            <p className="mt-1 font-mono text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
              {formatCurrency(course.price)} · {course.modules.length} module
              {course.modules.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCourseSheetOpen(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold"
          style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
        >
          <Pencil size={14} />
          Edit course
        </button>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold" style={{ color: "#191919" }}>
          Modules
        </h2>
        <button
          type="button"
          onClick={() => setModuleFormState({ open: true, module: null })}
          className="flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-white"
          style={{ backgroundColor: "#7e14ff" }}
        >
          <Plus size={15} />
          Add module
        </button>
      </div>

      {course.modules.length === 0 ? (
        <div
          className="rounded-2xl bg-white py-10 text-center text-[13px]"
          style={{ border: "1px solid rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.4)" }}
        >
          No modules yet — add one to start building this course.
        </div>
      ) : (
        <SortableList
          items={course.modules}
          onReorder={handleReorderModules}
          renderItem={(module, dragHandle) => (
            <ModuleAccordionItem
              module={module}
              dragHandle={dragHandle}
              onRename={() => setModuleFormState({ open: true, module })}
              onDeleteModule={() => setModuleToDelete(module)}
              onAddVideo={() => setVideoUploadState({ open: true, moduleId: module.id })}
              onReorderVideos={(newOrder) => handleReorderVideos(module.id, newOrder)}
              onPlayVideo={handlePlayVideo}
              onSyncVideo={handleSyncVideo}
              syncingVideoId={syncingVideoId}
              onEditVideo={setVideoToEdit}
              onDeleteVideo={setVideoToDelete}
            />
          )}
        />
      )}

      <CourseSheet open={courseSheetOpen} onClose={() => setCourseSheetOpen(false)} course={course} />

      <ModuleFormInline
        open={moduleFormState.open}
        onClose={() => setModuleFormState({ open: false })}
        courseId={courseId ?? ""}
        module={moduleFormState.open ? moduleFormState.module : null}
      />

      {videoUploadState.open && (
        <VideoUploadDialog
          open={videoUploadState.open}
          onClose={() => setVideoUploadState({ open: false })}
          courseId={courseId ?? ""}
          moduleId={videoUploadState.moduleId}
        />
      )}

      <VideoFormInline
        open={!!videoToEdit}
        onClose={() => setVideoToEdit(null)}
        courseId={courseId ?? ""}
        video={videoToEdit}
      />

      <VideoPreviewModal
        open={previewState.open}
        onClose={() => setPreviewState({ open: false })}
        title={previewState.open ? previewState.title : undefined}
        embedUrl={previewState.open ? previewState.embedUrl : null}
      />

      <DeleteConfirmModal
        isOpen={!!moduleToDelete}
        onClose={() => setModuleToDelete(null)}
        onConfirm={handleDeleteModule}
        isDeleting={deleteModule.isPending}
        title="Delete this module?"
        description="Its videos will be removed from Bunny too. This cannot be undone."
      />

      <DeleteConfirmModal
        isOpen={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={handleDeleteVideo}
        isDeleting={deleteVideo.isPending}
        title="Delete this video?"
        description="It will be removed from Bunny too. This cannot be undone."
      />
    </div>
  );
};

export default CourseDetailPage;
