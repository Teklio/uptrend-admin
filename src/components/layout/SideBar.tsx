import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  CreditCard,
  Users,
  Star,
  ChevronsLeft,
  ChevronsRight,
  LogOut,
} from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { useLogout } from "../../services/auth.service";
import { Modal } from "../shared/Modal";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/courses", label: "Courses", icon: BookOpen, end: false },
  { to: "/payments", label: "Payments", icon: CreditCard, end: false },
  { to: "/users", label: "Users", icon: Users, end: false },
  { to: "/reviews", label: "Reviews", icon: Star, end: false },
];

interface SideBarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const SideBar = ({ mobileOpen, onMobileClose }: SideBarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);
  const admin = useAppSelector((s) => s.auth.admin);
  const navigate = useNavigate();
  const { mutate: logout, isPending } = useLogout();

  const handleLogout = () => {
    logout(undefined, {
      onSettled: () => navigate("/auth/signin", { replace: true }),
    });
  };

  const renderNav = (onNavigate?: () => void) => (
    <nav className="flex flex-col gap-1 px-3">
      <span
        className="px-3 pb-2 pt-4 text-[11px] font-semibold uppercase tracking-wide"
        style={{ color: "rgba(0,0,0,0.35)" }}
      >
        {collapsed ? "" : "Main menu"}
      </span>
      {NAV_ITEMS.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors hover:bg-black/4"
          style={({ isActive }) => ({
            backgroundColor: isActive ? "#7e14ff" : "transparent",
            color: isActive ? "#fff" : "rgba(0,0,0,0.65)",
          })}
        >
          <item.icon size={17} />
          {!collapsed && item.label}
        </NavLink>
      ))}
    </nav>
  );

  const profileRow = (
    <div className="mt-auto flex flex-col gap-2 px-3 pb-4">
      <NavLink
        to="/profile"
        onClick={onMobileClose}
        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-black/4"
      >
        <img
          src={`https://ui-avatars.com/api/?background=7e14ff&color=fff&name=${encodeURIComponent(admin?.name || admin?.email || "Admin")}`}
          alt="Admin avatar"
          className="h-8 w-8 rounded-full"
        />
        {!collapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold" style={{ color: "#191919" }}>
              {admin?.name || "Admin"}
            </p>
            <p className="truncate text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
              {admin?.email}
            </p>
          </div>
        )}
      </NavLink>
      <button
        type="button"
        onClick={() => setSignOutOpen(true)}
        className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold hover:bg-black/4"
        style={{ color: "#dc2626" }}
      >
        <LogOut size={16} />
        {!collapsed && "Sign out"}
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        className="hidden md:flex h-screen flex-shrink-0 flex-col bg-white"
        style={{ borderRight: "1px solid rgba(0,0,0,0.07)" }}
      >
        <div className="flex items-center justify-between px-4 py-5">
          {!collapsed && (
            <span className="font-serif text-[19px]" style={{ color: "#191919" }}>
              Uptrend
            </span>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-black/5"
            style={{ color: "rgba(0,0,0,0.5)" }}
          >
            {collapsed ? <ChevronsRight size={15} /> : <ChevronsLeft size={15} />}
          </button>
        </div>
        {renderNav()}
        {profileRow}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-40 md:hidden"
              style={{ backgroundColor: "rgba(0,0,0,0.4)" }}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.2, ease: "easeInOut" }}
              className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-white md:hidden"
            >
              <div className="flex items-center px-4 py-5">
                <span className="font-serif text-[19px]" style={{ color: "#191919" }}>
                  Uptrend
                </span>
              </div>
              {renderNav(onMobileClose)}
              {profileRow}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <Modal open={signOutOpen} onClose={() => setSignOutOpen(false)} title="Sign out?">
        <p className="mb-5 text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
          You'll need to sign in again to access the admin panel.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setSignOutOpen(false)}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isPending}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white"
            style={{ backgroundColor: "#dc2626" }}
          >
            {isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </Modal>
    </>
  );
};
