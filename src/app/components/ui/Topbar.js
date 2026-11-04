"use client";

import { useAuth } from "@/context/AuthProvider";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  LogOut,
  Menu,
  User,
  Settings,
} from "lucide-react";

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth();

  const initial =
    user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-5 lg:px-6">
      
      {/* Left */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open sidebar"
          className="
            rounded-md p-2
            text-muted-foreground
            hover:bg-accent hover:text-foreground
            lg:hidden
          "
        >
          <Menu size={22} />
        </button>

        <h1 className="truncate text-lg font-semibold sm:text-xl">
          Admin Panel
        </h1>
      </div>

      {/* Right */}
      <DropdownMenu>
        <DropdownMenuTrigger
          className="
            flex items-center gap-2
            rounded-lg px-1.5 py-1
            outline-none
            hover:bg-accent
            sm:gap-3 sm:px-2
          "
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-medium text-white sm:h-10 sm:w-10">
            {initial}
          </div>

          <div className="hidden max-w-[180px] text-left sm:block">
            <p className="truncate text-sm font-medium">
              {user?.name || "Admin"}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {user?.email || ""}
            </p>
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56"
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>
              My Account
            </DropdownMenuLabel>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}