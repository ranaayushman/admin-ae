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
  ChevronDown,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  LogOut,
  MessageSquare,
  PanelLeftClose,
  PanelRightClose,
  Sparkles,
  UserCheck,
  UserPlus,
  Users,
  UsersRound,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useState } from "react";

type NavItem = {
  name: string;
  icon: any;
  path?: string;
  items?: { name: string; path: string; icon: any }[];
};

const navItems: NavItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "All Users", icon: UsersRound, path: "/users" },
  { name: "Question Bank", icon: HelpCircle, path: "/questions" },
  { name: "Test Series", icon: ListChecks, path: "/test-series" },
  { name: "Manual Enrollment", icon: Users, path: "/enrollments/manual" },
  { name: "Team Members", icon: UserPlus, path: "/team-members" },
  
  // Counselling Group
  {
    name: "Counselling",
    icon: HeartHandshake,
    items: [
      {
        name: "Counselling Packages",
        icon: FileText,
        path: "/counselling/packages",
      },
      {
        name: "Manage Counselling",
        icon: ListChecks,
        path: "/counselling/sessions",
      },
      {
        name: "Counsellors",
        icon: UserCheck,
        path: "/counselling/counsellors",
      },
      {
        name: "Admission Guidance",
        icon: GraduationCap,
        path: "/counselling/admission-guidance",
      },
    ],
  },

  // PYQ Group
  {
    name: "PYQ & Study Material",
    icon: BookOpen,
    items: [
      { name: "Add Question", icon: BookOpen, path: "/pyq" },
      {
        name: "PYQ Home (Solution)",
        icon: ImageIcon,
        path: "/pyq-home/with-solution",
      },
      {
        name: "PYQ Home (No Sol)",
        icon: ImageIcon,
        path: "/pyq-home/without-solution",
      },
      { name: "Boards PYQ", icon: GraduationCap, path: "/boards-pyq" },
      { name: "Sample Papers", icon: Sparkles, path: "/sample-papers" },
    ],
  },
  
  // Internships Group
  {
    name: "Internships",
    icon: GraduationCap,
    items: [
      {
        name: "Applications",
        icon: UserCheck,
        path: "/internships/applications",
      },
    ],
  },
  
  // Support Group
  {
    name: "Support",
    icon: HelpCircle,
    items: [
      {
        name: "Contact Inquiries",
        icon: MessageSquare,
        path: "/support/contact-inquiries",
      },
    ],
  },
  
  { name: "Packages", icon: FileText, path: "/packages" }, // Kept separate as it might be general packages? Or should it be under something? Leaving as is per request scope.
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleGroup = (groupName: string) => {
    if (collapsed) {
      setCollapsed(false);
      setExpandedGroups([groupName]);
      return;
    }
    
    setExpandedGroups((prev) =>
      prev.includes(groupName)
        ? prev.filter((name) => name !== groupName)
        : [...prev, groupName]
    );
  };

  const isGroupActive = (item: NavItem) => {
    return item.items?.some((subItem) => pathname === subItem.path);
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
      <nav className="flex-1 px-3 py-4 overflow-y-auto overflow-x-hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
        <ul className="space-y-1">
          {navItems.map((item) => {
            if (item.items) {
              // Render Group
              const isActive = isGroupActive(item);
              const isExpanded = expandedGroups.includes(item.name) || isActive; // Auto expand if active child? explicit expand might be better UX, but let's see. Let's make it explicit toggle for now, but auto-open if path matches initially could be added. 
              // Actually, simpler: toggle only controls generic expansion. 
              // Let's rely on state. 
              const expanded = expandedGroups.includes(item.name);

              return (
                <li key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleGroup(item.name)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all group select-none
                      ${
                        isActive
                          ? "bg-white/10 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                      }`}
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="shrink-0"
                    >
                      <item.icon className="w-5 h-5" />
                    </motion.div>

                    <AnimatePresence>
                      {!collapsed && (
                        <>
                          <motion.span
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            className="font-medium flex-1 text-left"
                          >
                            {item.name}
                          </motion.span>
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                             {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </button>

                  {/* Nested Items */}
                  <AnimatePresence>
                    {!collapsed && expanded && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden pl-4 space-y-1"
                      >
                        {item.items.map((subItem) => {
                          const isSubActive = pathname === subItem.path;
                          return (
                            <li key={subItem.path}>
                              <Link
                                href={subItem.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-sm
                                  ${
                                    isSubActive
                                      ? "text-blue-400 bg-blue-500/10"
                                      : "text-gray-400 hover:text-white hover:bg-white/5"
                                  }`}
                              >
                                <subItem.icon className="w-4 h-4" />
                                <span>{subItem.name}</span>
                              </Link>
                            </li>
                          );
                        })}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </li>
              );
            }

            // Render Single Layout
            const active = pathname === item.path;
            const linkHref = item.path || "#"; // Should always have path if no items

            return (
              <li key={item.name}>
                <Link
                  href={linkHref}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all group
                    ${
                      active
                        ? "bg-white/10 text-white"
                        : "text-gray-300 hover:bg-white/5 hover:text-white"
                    }`}
                >
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="shrink-0"
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
          <motion.div whileHover={{ scale: 1.05 }} className="shrink-0">
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
