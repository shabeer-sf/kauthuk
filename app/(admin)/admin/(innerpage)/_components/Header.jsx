"use client";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/providers/AuthProvier";

const Header = () => {
  const {logout,admin} = useAuth() 
  return (
    <div className="w-full p-3 border-b-[1px] flex justify-between items-center h-16">
      <div className="md:hidden">
        <Sheet >
          <SheetTrigger asChild>
            <Menu />
          </SheetTrigger>
          <SheetContent className="w-72 p-0 m-0" side={"left"}>
            <Sidebar />
          </SheetContent>
        </Sheet>
      </div>
      <div className="max-md:hidden" />
      <div className="flex justify-end items-center pr-3 pt-2">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="flex items-center gap-2">
              <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <h6 className="font-semibold">
                {admin?.username || "Admin"}
              </h6>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <button onClick={logout}>
                  Logout
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem>Subscription</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default Header;
