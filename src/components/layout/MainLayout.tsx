import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import { SideBar } from "./SideBar";

const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

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
    </div>
  );
};

export default MainLayout;
