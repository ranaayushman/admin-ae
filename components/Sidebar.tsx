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
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Add PYQ to Bank", icon: BookOpen, path: "/pyq" },
  { name: "Create Test Series", icon: ListChecks, path: "/test-series/create" },
  { name: "PYQ Home (With Solution)", icon: FileText, path: "/pyq-home/with-solution" },
  { name: "PYQ Home (No Solution)", icon: ImageIcon, path: "/pyq-home/without-solution" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  return (
    <aside
      className={`h-screen bg-[#0f172a] text-white border-r border-white/10 fixed left-0 top-0 transition-all duration-300
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
