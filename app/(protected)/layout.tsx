"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/Auth/ProtectedRoute";
import Navbar from "@/components/UI/Navbar";
import Sidebar from "@/components/UI/Sidebar";
import Footer from "@/components/UI/Footer";

const SidebarComponent = Sidebar as React.ComponentType<{
  mobileOpen: boolean;
  onClose: () => void;
}>;

const NavbarComponent = Navbar as React.ComponentType<{
  onMenuToggle: () => void;
}>;

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="h-dvh overflow-hidden bg-(--bg-primary) md:grid md:grid-cols-[250px_minmax(0,1fr)]">
        <SidebarComponent
          mobileOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
        />
        <div className="flex h-full min-h-0 min-w-0 flex-col">
          <NavbarComponent
            onMenuToggle={() => setMobileSidebarOpen((open) => !open)}
          />
          <main className="min-h-0 flex-1 overflow-y-auto  ">
            <div className="flex min-h-full flex-col">
              <div className="flex-1 p-4 pb-20 md:p-8">{children}</div>
              <Footer />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
