"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  ArrowLeft,
  File,
  Grid,
  MapPin,
  Lock,
  AlertCircle,
  Clipboard,
  Table,
  Star,
  Sliders,
  ChartBarStacked,
  Newspaper,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuData = [
  {
    section: "Home",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        href: "/admin/dashboard",
        // active: true,
      },
    ],
  },
  {
    section: "Pages",
    items: [
      {
        label: "Manage Sliders",
        icon: <Sliders size={18} />,
        subMenu: [
          { label: "List Sliders", href: "/admin/slider/list-sliders" },
          { label: "Add Slider", href: "/admin/slider/add-slider" },
        ],
      },
      {
        label: "Category",
        icon: <ChartBarStacked size={18} />,
        href: "/admin/category",
      },
      {
        label: "Subcategory",
        icon: <ChartBarStacked size={18} />,
        href: "/admin/subcategory",
      },
      {
        label: "Attributes",
        icon: <Newspaper size={18} />,
        subMenu: [
          { label: "List Atrribute", href: "/admin/attributes/list-attribute" },
          {
            label: "Add Atrribute Values",
            href: "/admin/attributes/list-attribute-value",
          },
        ],
      },
      {
        label: "Manage Blogs",
        icon: <Newspaper size={18} />,
        subMenu: [
          { label: "List Blogs", href: "/admin/blog/list-blogs" },
          { label: "Add Blog", href: "/admin/blog/add-blog" },
        ],
      },
      {
        label: "Manage Admin",
        icon: <Sliders size={18} />,
        href: "/admin/list-admin",
      },
    ],
  },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => pathname === path;

  return (
    <div className="w-72 min-h-screen bg-white shadow-md flex flex-col text-sm md:border-r-[1px] border-b-slate-100 h-full">
      {/* Sidebar Header */}
      <div className="p-3 flex items-center justify-between border-b h-16">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="text-blue-600" size={22} />
          <h1 className="text-base font-semibold text-gray-700">Kauthuk </h1>
        </div>
      </div>

      {/* Menu Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {menuData.map((section) => (
          <div key={section.section}>
            <h3 className="text-gray-400 text-xs uppercase tracking-wide mb-1">
              {section.section}
            </h3>
            {section.items.map((menu) => {
              const hasSubMenu = menu.subMenu?.length > 0;
              return (
                <div key={menu.label}>
                  <div
                    className={`flex items-center justify-between p-2 rounded-md ${
                      isActive(menu.href) || menu.active
                        ? "bg-blue-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    } cursor-pointer`}
                    onClick={() => hasSubMenu && toggleMenu(menu.label)}
                  >
                    {hasSubMenu ? (
                      <button className="flex items-center gap-2 flex-grow">
                        <div
                          className={cn(
                            "p-1.5 bg-gray-200 rounded-md ",
                            isActive ? "text-blue-600" : "text-black"
                          )}
                        >
                          {menu.icon}
                        </div>
                        <span className="text-sm font-medium">
                          {menu.label}
                        </span>
                      </button>
                    ) : (
                      <Link
                        href={menu.href || "#"}
                        className="flex items-center gap-2 flex-grow"
                      >
                        <div
                          className={cn(
                            "p-1.5 bg-gray-200 rounded-md ",
                            isActive ? "text-blue-600" : "text-black"
                          )}
                        >
                          {menu.icon}
                        </div>
                        <span className="text-sm font-medium">
                          {menu.label}
                        </span>
                      </Link>
                    )}
                    {hasSubMenu && (
                      <div>
                        {openMenus[menu.label] ? (
                          <ChevronDown size={16} />
                        ) : (
                          <ChevronRight size={16} />
                        )}
                      </div>
                    )}
                  </div>
                  {hasSubMenu && openMenus[menu.label] && (
                    <div className="pl-10 space-y-1">
                      {menu.subMenu.map((sub) => (
                        <Link
                          key={sub.label}
                          href={sub.href}
                          className={`block py-1 rounded-md text-xs ${
                            isActive(sub.href)
                              ? "text-blue-600 font-semibold"
                              : "text-gray-500 hover:text-gray-700"
                          }`}
                        >
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Settings Section */}
      <div className="p-3 border-t">
        <Link
          href="/admin/settings"
          className={`flex items-center gap-2 p-2 rounded-md ${
            pathname.startsWith("/admin/settings")
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <div className="p-1.5 bg-gray-200 rounded-md">
            <Settings size={18} />
          </div>
          <span className="text-sm font-medium">Settings</span>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
