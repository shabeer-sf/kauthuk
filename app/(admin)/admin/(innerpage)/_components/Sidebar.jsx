"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  Layers,
  ShoppingBag,
  Tag,
  PanelRight,
  FileText,
  Package,
  Palette,
  Activity,
  Box,
  Star,
  Phone
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

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
    section: "Content",
    items: [
      {
        label: "Sliders",
        icon: <Layers size={18} />,
        subMenu: [
          { label: "View All", href: "/admin/slider/list-sliders" },
          { label: "Add New", href: "/admin/slider/add-slider" },
        ],
      },
      {
        label: "Blog Posts",
        icon: <FileText size={18} />,
        subMenu: [
          { label: "All Posts", href: "/admin/blog/list-blogs" },
          { label: "Create Post", href: "/admin/blog/add-blog" },
        ],
      },
      {
        label: "Testimonials",
        icon: <Star size={18} />,
        subMenu: [
          { label: "All Testimonials", href: "/admin/testimonials/list-testimonials" },
          { label: "Create Testimonial", href: "/admin/testimonials/add-testimonial" },
        ],
      },
      {
        label: "Enquiries",
        icon: <Phone size={18} />,
        href: "/admin/enquiries",
      },
      {
        label: "Pages",
        icon: <FileText size={18} />,
        subMenu: [
          { label: "All Pages", href: "/admin/site-content/list-site-content" },
          { label: "Create Pages", href: "/admin/site-content/add-site-content" },
        ],
      },
    ],
  },
  {
    section: "Catalog",
    items: [
      {
        label: "Categories",
        icon: <Tag size={18} />,
        href: "/admin/category",
      },
      {
        label: "Subcategories",
        icon: <PanelRight size={18} />,
        href: "/admin/subcategory",
      },
      {
        label: "Attributes",
        icon: <Palette size={18} />,
        subMenu: [
          { label: "Attribute List", href: "/admin/attributes/list-attribute" },
          { label: "Attribute Values", href: "/admin/attributes/list-attribute-value" },
        ],
      },
      {
        label: "Products",
        icon: <Package size={18} />,
        subMenu: [
          { label: "All Products", href: "/admin/product/list-products" },
          { label: "Create Products", href: "/admin/product/add-product" },
        ],
      },
    ],
  },
  {
    section: "Management",
    items: [
      {
        label: "Orders",
        icon: <ShoppingBag size={18} />,
        href: "/admin/orders/list-orders",
        // badge: "12",
        badgeColor: "bg-green-500"
      },
      {
        label: "Customers",
        icon: <Users size={18} />,
        href: "/admin/user/list-users",
      },
      {
        label: "Administrators",
        icon: <Users size={18} />,
        href: "/admin/list-admin",
      },
      
    ],
  },
];

const MenuIcon = ({ icon, isActive }) => (
  <div
    className={cn(
      "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
      isActive
        ? "bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400"
        : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/40"
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
  const pathname = usePathname();

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
                isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-300",
                isOpen && "bg-blue-50/50 dark:bg-blue-900/20"
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
                    "transition-transform duration-200 text-slate-400",
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
                    "block py-1.5 px-3 rounded-md text-sm transition-colors",
                    sub.href === pathname
                      ? "text-blue-600 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/30"
                      : "text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
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
          "flex items-center justify-between p-2 rounded-lg group transition-colors",
          isActive
            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
            : "text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-900/20"
        )}
      >
        <div className="flex items-center gap-3">
          <MenuIcon icon={item.icon} isActive={isActive} />
          {!isCollapsed && (
            <span className="text-sm font-medium">{item.label}</span>
          )}
        </div>
        {!isCollapsed && item.badge && (
          <Badge className={cn("text-white text-xs", item.badgeColor || "bg-blue-500")}>
            {item.badge}
          </Badge>
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
  const router = useRouter();

  // Initialize open menus based on current route
  useEffect(() => {
    const initOpenMenus = {};
    
    menuData.forEach(section => {
      section.items.forEach(item => {
        if (item.subMenu) {
          const isInSubmenu = item.subMenu.some(subItem => 
            pathname === subItem.href || pathname.startsWith(subItem.href)
          );
          if (isInSubmenu) {
            initOpenMenus[item.label] = true;
          }
        }
      });
    });
    
    setOpenMenus(initOpenMenus);
  }, []);

  // Close mobile sidebar when navigating
  useEffect(() => {
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

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-white dark:bg-slate-900 border-r border-blue-100 dark:border-blue-900 transition-all duration-300 shadow-sm",
        isCollapsed ? "w-16" : "md:w-64 w-72",
        isDesktop ? "translate-x-0" : "md:translate-x-full",
        className
      )}
    >
      {/* Sidebar Header */}
      <div className="p-4 flex items-center justify-between border-b border-blue-100 dark:border-blue-900 h-16">
        {!isCollapsed ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Box size={20} />
            </div>
            <h1 className="text-base font-semibold text-blue-700 dark:text-blue-400 truncate">
              Kauthuk Admin
            </h1>
          </div>
        ) : (
          <div className="mx-auto w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
            <Box size={20} />
          </div>
        )}

        {/* {isDesktop && !isCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(true)}
            className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <ChevronLeft size={16} />
          </Button>
        )} */}
      </div>

      {/* Menu Sections */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {menuData.map((section) => (
          <div key={section.section} className="space-y-2">
            {!isCollapsed && (
              <h3 className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider px-3">
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
                        <TooltipContent side="right" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-blue-100 dark:border-blue-900">
                          <div className="flex items-center gap-2">
                            {item.label}
                            {item.badge && (
                              <Badge className={cn("text-white text-xs", item.badgeColor || "bg-blue-500")}>
                                {item.badge}
                              </Badge>
                            )}
                          </div>
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
      <div className="border-t border-blue-100 dark:border-blue-900 p-4">
        {!isCollapsed ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 p-2 bg-blue-50/70 dark:bg-blue-900/30 rounded-lg">
              <Avatar className="h-9 w-9 border-2 border-blue-200 dark:border-blue-800">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {admin?.username?.slice(0, 2).toUpperCase() || "AD"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-400 truncate">
                  {admin?.username || "Admin"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {admin?.email || "admin@example.com"}
                </span>
              </div>
            </div>

            <div className="flex gap-2 mt-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-slate-600 dark:text-slate-300 border-blue-100 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-700 dark:hover:text-blue-400 hover:border-blue-200 dark:hover:border-blue-800"
                onClick={() => router.push("/admin/settings")}
              >
                <Settings className="mr-2 h-4 w-4 text-blue-500 dark:text-blue-400" />
                Settings
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-200 dark:hover:border-red-800/50"
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
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-blue-200 dark:border-blue-800">
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {admin?.username?.slice(0, 2).toUpperCase() || "AD"}
                    </AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-blue-100 dark:border-blue-900">
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
                      className="h-9 w-9 border-blue-100 dark:border-blue-900 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-500 dark:text-blue-400"
                      onClick={() => router.push("/admin/settings")}
                    >
                      <Settings size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-blue-100 dark:border-blue-900">
                    Settings
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 border-red-100 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400"
                      onClick={logout}
                    >
                      <LogOut size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-blue-100 dark:border-blue-900">
                    Logout
                  </TooltipContent>
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
            className="mt-4 h-8 w-8 mx-auto text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <ChevronRight size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;