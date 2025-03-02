"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu,
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  ChevronDown,
  Mail,
  Moon,
  Sun,
  MessageSquare
} from "lucide-react";
import Sidebar from "./Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useAuth } from "@/providers/AuthProvier";
import { Badge } from "@/components/ui/badge";

const Header = () => {
  const pathname = usePathname();
  const { logout, admin } = useAuth();
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
    // Implementation would depend on your theme setup
  };

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split("/").filter(Boolean);
    if (path.length === 1) return "Dashboard";
    
    // Format the last segment for display
    const lastSegment = path[path.length - 1];
    return lastSegment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="w-full border-b bg-background flex justify-between items-center h-16 px-4">
      <div className="flex items-center gap-4">
        {/* This space is for the sidebar on desktop */}
        <div className="md:block hidden">
          <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
        </div>

        {/* Visible only on mobile */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <Sidebar />
            </SheetContent>
          </Sheet>
          <h1 className="text-lg font-medium">Kauthuk</h1>
        </div>
      </div>

      

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        

        <div className="ml-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 h-9 pl-1">
                <Avatar className="h-7 w-7">
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>
                    {admin?.username?.slice(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col items-start text-sm">
                  <span className="font-medium leading-none">
                    {admin?.username || "Admin"}
                  </span>
                  <span className="text-xs text-muted-foreground leading-none mt-1">
                    Administrator
                  </span>
                </div>
                <ChevronDown size={14} className="ml-1 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Mail className="mr-2 h-4 w-4" />
                  <span>Messages</span>
                  <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;