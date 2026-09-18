import { useState } from "react";
import { Link, Outlet, useBlocker, useLocation } from "react-router-dom";
import { Menu, UploadCloud, XCircle } from "lucide-react";
import { SideBar } from "./SideBar";
import { Modal } from "../shared/Modal";
import { useVideoUploadTask } from "../../hooks/useVideoUploadTask";
import { videoUploadManager } from "../../utils/videoUploadManager";

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const task = useVideoUploadTask();

  // Only fires when actually leaving the course page the upload is
  // anchored to — once the admin has already left it (confirmed or
  // otherwise), hopping between any other pages isn't "leaving the upload"
  // again, so it must not keep re-blocking every subsequent navigation.
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (!videoUploadManager.isUploading()) return false;
    const activeTask = videoUploadManager.getSnapshot();
    if (!activeTask) return false;
    const uploadPagePath = `/courses/${activeTask.courseId}`;
    return currentLocation.pathname === uploadPagePath && nextLocation.pathname !== uploadPagePath;
  });

  const showGlobalIndicator = !!task && location.pathname !== `/courses/${task.courseId}`;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ backgroundColor: "#f4f4f4" }}>
      <SideBar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <div
          className="flex h-14 items-center gap-3 px-4 bg-white md:hidden"
          style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}
        >
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ color: "rgba(0,0,0,0.6)" }}
          >
            <Menu size={20} />
          </button>
          <img src="/logo.png" alt="Uptrend" className="h-6 w-auto object-contain" />
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>

      {showGlobalIndicator && (
        <Link
          to={`/courses/${task.courseId}`}
          className="fixed bottom-5 right-5 z-40 flex w-72 flex-col gap-2 rounded-2xl bg-white p-4 shadow-xl"
          style={{ border: "1px solid rgba(0,0,0,0.08)" }}
        >
          {task.phase === "error" ? (
            <div className="flex items-center gap-2">
              <XCircle size={16} color="#dc2626" className="shrink-0" />
              <span className="min-w-0 truncate text-[12.5px] font-medium" style={{ color: "#191919" }}>
                Upload failed — tap to view
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <UploadCloud size={16} style={{ color: "#002b7f" }} className="shrink-0" />
                <span className="min-w-0 truncate text-[12.5px] font-medium" style={{ color: "#191919" }}>
                  Uploading "{task.title}"
                </span>
                <span className="ml-auto shrink-0 font-mono text-[11.5px] tabular-nums" style={{ color: "rgba(0,0,0,0.5)" }}>
                  {task.progress}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: "rgba(0,0,0,0.08)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${task.progress}%`, backgroundColor: "#002b7f" }}
                />
              </div>
            </>
          )}
        </Link>
      )}

      <Modal open={blocker.state === "blocked"} onClose={() => blocker.reset?.()} title="Upload in progress">
        <div className="flex flex-col gap-4">
          <p className="text-[13.5px]" style={{ color: "rgba(0,0,0,0.6)" }}>
            A video is still uploading. If you leave this page now, the upload will keep running in the background —
            you can check its progress from anywhere in the admin panel.
          </p>
          <div className="flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => blocker.reset?.()}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
              style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
            >
              Stay on this page
            </button>
            <button
              type="button"
              onClick={() => blocker.proceed?.()}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a]"
              style={{ backgroundColor: "#f5a300" }}
            >
              Leave anyway
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MainLayout;
