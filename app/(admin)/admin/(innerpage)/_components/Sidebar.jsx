"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
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
  Menu as MenuIcons,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/providers/AuthProvier";

const menuData = [
  {
    section: "Home",
    items: [
      {
        label: "Dashboard",
        icon: <LayoutDashboard size={18} />,
        href: "/admin/dashboard",
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        label: "Sliders",
        icon: <Sliders size={18} />,
        subMenu: [
          { label: "View All", href: "/admin/slider/list-sliders" },
          { label: "Add New", href: "/admin/slider/add-slider" },
        ],
      },
      {
        label: "Categories",
        icon: <ChartBarStacked size={18} />,
        href: "/admin/category",
      },
      {
        label: "Subcategories",
        icon: <ChartBarStacked size={18} />,
        href: "/admin/subcategory",
      },
      {
        label: "Attributes",
        icon: <Table size={18} />,
        subMenu: [
          { label: "Attribute List", href: "/admin/attributes/list-attribute" },
          {
            label: "Attribute Values",
            href: "/admin/attributes/list-attribute-value",
          },
        ],
      },
      {
        label: "Blog Posts",
        icon: <Newspaper size={18} />,
        subMenu: [
          { label: "All Posts", href: "/admin/blog/list-blogs" },
          { label: "Create Post", href: "/admin/blog/add-blog" },
        ],
      },
      {
        label: "Administrators",
        icon: <Users size={18} />,
        href: "/admin/list-admin",
      },
    ],
  },
];

const MenuItemVariants = {
  closed: { opacity: 0, x: -10 },
  open: { opacity: 1, x: 0 },
};

const MenuIcon = ({ icon, isActive }) => (
  <div
    className={cn(
      "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "bg-muted/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
    )}
  >
    {icon}
  </div>
);

const MenuItem = ({
  item,
  isActive,
  isCollapsed,
  onClick,
  openMenus,
  toggleMenu,
}) => {
  const hasSubMenu = item.subMenu?.length > 0;
  const isOpen = openMenus[item.label];

  if (hasSubMenu) {
    return (
      <div className="w-full">
        <Collapsible
          open={isOpen}
          onOpenChange={() => toggleMenu(item.label)}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-between p-2 group",
                isActive && "bg-primary/10 text-primary"
              )}
            >
              <div className="flex items-center gap-3">
                <MenuIcon icon={item.icon} isActive={isActive} />
                {!isCollapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
              </div>
              {!isCollapsed && (
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform duration-200",
                    isOpen && "rotate-180"
                  )}
                />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pl-12 space-y-1 pt-1 pb-2">
            {!isCollapsed &&
              item.subMenu.map((sub) => (
                <Link
                  key={sub.label}
                  href={sub.href}
                  className={cn(
                    "block py-1.5 px-2 rounded-md text-sm transition-colors",
                    isActive && sub.href === window.location.pathname
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  {sub.label}
                </Link>
              ))}
          </CollapsibleContent>
        </Collapsible>
      </div>
    );
  }

  return (
    <Link href={item.href || "#"} className="w-full" onClick={onClick}>
      <div
        className={cn(
          "flex items-center gap-3 p-2 rounded-lg group transition-colors",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:text-primary hover:bg-primary/5"
        )}
      >
        <MenuIcon icon={item.icon} isActive={isActive} />
        {!isCollapsed && (
          <span className="text-sm font-medium">{item.label}</span>
        )}
      </div>
    </Link>
  );
};

const Sidebar = ({ className }) => {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { logout, admin } = useAuth();

  useEffect(() => {
    // Close mobile sidebar when navigating
    setIsMobileOpen(false);
  }, [pathname]);

  const toggleMenu = (label) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (path) => pathname === path;

  const isActiveSection = (menuItem) => {
    if (menuItem.href && isActive(menuItem.href)) {
      return true;
    }

    if (menuItem.subMenu) {
      return menuItem.subMenu.some(
        (subItem) =>
          pathname === subItem.href || pathname.startsWith(subItem.href)
      );
    }

    return false;
  };

  // Sidebar for mobile and desktop with the same component
  return (
    <>
      {/* Mobile Trigger */}
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed left-4 top-3 z-50"
          onClick={() => setIsMobileOpen(true)}
        >
          <MenuIcons size={20} />
        </Button>
      )}

      {/* Sidebar Container */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-background border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64",
          isDesktop
            ? "translate-x-0"
            : isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full",
          className
        )}
      >
        {/* Close button for mobile */}
        {!isDesktop && isMobileOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3"
            onClick={() => setIsMobileOpen(false)}
          >
            <X size={18} />
          </Button>
        )}

        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between border-b h-16">
          {!isCollapsed ? (
            <div className="flex items-center gap-2 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                <LayoutDashboard size={20} />
              </div>
              <h1 className="text-base font-semibold truncate">
                Kauthuk Admin
              </h1>
            </div>
          ) : (
            <div className="mx-auto w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
              <LayoutDashboard size={20} />
            </div>
          )}

          {isDesktop && !isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8"
            >
              <ChevronLeft size={16} />
            </Button>
          )}
        </div>

        {/* Menu Sections */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
          {menuData.map((section) => (
            <div key={section.section} className="space-y-2">
              {!isCollapsed && (
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-2">
                  {section.section}
                </h3>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <div key={item.label}>
                    {isCollapsed ? (
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div>
                              <MenuItem
                                item={item}
                                isActive={isActiveSection(item)}
                                isCollapsed={isCollapsed}
                                toggleMenu={toggleMenu}
                                openMenus={openMenus}
                              />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="text-sm">
                            {item.label}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <MenuItem
                        item={item}
                        isActive={isActiveSection(item)}
                        isCollapsed={isCollapsed}
                        toggleMenu={toggleMenu}
                        openMenus={openMenus}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section with User Profile and Settings */}
        <div className="border-t p-4">
          {!isCollapsed ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-2">
                <Avatar className="h-9 w-9">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    {admin?.username?.slice(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-medium truncate">
                    {admin?.username || "Admin"}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {admin?.email || "admin@example.com"}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => (window.location.href = "/admin/settings")}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-9 w-9 cursor-pointer">
                      <AvatarImage src="https://github.com/shadcn.png" />
                      <AvatarFallback>
                        {admin?.username?.slice(0, 2).toUpperCase() || "AD"}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {admin?.username || "Admin"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex flex-col gap-2">
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() =>
                          (window.location.href = "/admin/settings")
                        }
                      >
                        <Settings size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Settings</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-9 w-9"
                        onClick={logout}
                      >
                        <LogOut size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Logout</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {isDesktop && isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(false)}
              className="mt-4 h-8 w-8 mx-auto"
            >
              <ChevronRight size={16} />
            </Button>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {!isDesktop && isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
