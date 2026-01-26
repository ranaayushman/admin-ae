"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Image as ImageIcon,
  ListChecks,
  HelpCircle,
  Settings,
  PanelLeftClose,
  PanelRightClose,
  Users,
  LogOut,
  UserPlus,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Question Bank", icon: HelpCircle, path: "/questions" },
  { name: "Add Question", icon: BookOpen, path: "/pyq" },
  { name: "Test Series", icon: ListChecks, path: "/test-series" },
  { name: "Packages", icon: FileText, path: "/packages" },
  { name: "Manual Enrollment", icon: Users, path: "/enrollments/manual" },
  { name: "Team Members", icon: UserPlus, path: "/team-members" },
  {
    name: "PYQ Home (With Solution)",
    icon: ImageIcon,
    path: "/pyq-home/with-solution",
  },
  {
    name: "PYQ Home (No Solution)",
    icon: ImageIcon,
    path: "/pyq-home/without-solution",
  },
  { name: "Footer Links", icon: Settings, path: "/settings/footer" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
}: {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const pathname = usePathname();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <aside
      className={`h-screen bg-[#0f172a] text-white border-r border-white/10 fixed left-0 top-0 transition-all duration-300 flex flex-col
      ${collapsed ? "w-20" : "w-72"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-center px-4 py-6 border-b border-white/10">
        <AnimatePresence mode="wait">
          <motion.div
            key={collapsed ? "AE" : "Aspiring Engineer Admin"}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            className="text-xl font-semibold whitespace-nowrap"
          >
            {collapsed ? "AE" : "Aspiring Engineer Admin"}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.path;

            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group
                    ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="flex-shrink-0"
                  >
                    <item.icon className="w-5 h-5" />
                  </motion.div>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        className="font-medium"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      {user && !collapsed && (
        <div className="px-4 py-3 border-t border-white/10">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm"
          >
            <p className="text-white font-medium truncate">{user.name}</p>
            <p className="text-gray-400 text-xs truncate">{user.email}</p>
          </motion.div>
        </div>
      )}

      {/* Logout Button */}
      <div className="px-3 py-2 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-gray-300 hover:bg-red-500/10 hover:text-red-400 transition-all group"
          title="Logout"
        >
          <motion.div whileHover={{ scale: 1.05 }} className="flex-shrink-0">
            <LogOut className="w-5 h-5" />
          </motion.div>

          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                className="font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Footer + Collapse Button */}
      <div className="px-4 py-4 border-t border-white/10 flex items-center justify-between">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-gray-400 text-xs"
          >
            © Aspiring Engineer Admin Panel
          </motion.div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-white/10 transition ml-auto"
        >
          {collapsed ? (
            <PanelRightClose className="w-5 h-5" />
          ) : (
            <PanelLeftClose className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
