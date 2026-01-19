"use client";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { useSidebarStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, Car } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  return (
    <div className="bg-background flex min-h-screen transition-colors duration-300">
      <DashboardSidebar />
      <motion.main
        animate={{
          paddingLeft:
            mounted && typeof window !== "undefined" && window.innerWidth >= 768
              ? isCollapsed
                ? 80
                : 280
              : 0,
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="bg-surface/30 flex w-full min-w-0 flex-1 flex-col dark:bg-transparent"
      >
        {/* Mobile Header */}
        <header className="bg-background/60 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 shadow-sm backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3">
            <div className="bg-primary shadow-primary/20 flex h-9 w-9 items-center justify-center rounded-xl shadow-lg">
              <Car className="text-primary-foreground h-5.5 w-5.5" />
            </div>
            <span className="text-lg font-bold tracking-tight">Miyi Ðekae</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(!isOpen)}
            className="hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
      </motion.main>
    </div>
  );
}
