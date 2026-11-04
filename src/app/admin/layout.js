"use client";

import { useState } from "react";
import Sidebar from "@/app/components/ui/Sidebar";
import Topbar from "@/app/components/ui/Topbar";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-5 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}