"use client";

import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { useSidebarStore, useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Menu, Car, Bell } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed } = useSidebarStore();
  const { isLoggedIn } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Protection réactive : si l'utilisateur se déconnecte, on le sort du dashboard
  useEffect(() => {
    if (mounted && !isLoggedIn) {
      router.push("/login");
    }
  }, [mounted, isLoggedIn, router]);

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "Vue d'ensemble";
    if (pathname.includes("/users")) return "Gestion des Utilisateurs";
    if (pathname.includes("/drivers")) return "Validation Conducteurs";
    if (pathname.includes("/vehicules")) return "Gestion des Véhicules";
    if (pathname.includes("/reports")) return "Signalements & Litiges";
    if (pathname.includes("/stats")) return "Statistiques & Performances";
    if (pathname.includes("/flux")) return "Flux de Trajets";
    if (pathname.includes("/activity")) return "Journal d'Activité";
    if (pathname.includes("/zones")) return "Gestion des Zones";
    return "Tableau de Bord";
  };

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
        {/* Top Navbar */}
        <header className="bg-background/60 sticky top-0 z-30 flex h-16 items-center justify-between border-b px-6 shadow-sm backdrop-blur-xl">
          <div className="flex items-center gap-4">
            {/* Logo Mobile */}
            <div className="flex items-center gap-3 md:hidden">
              <div className="bg-primary shadow-primary/20 flex h-9 w-9 items-center justify-center rounded-xl shadow-lg">
                <Car className="text-primary-foreground h-5.5 w-5.5" />
              </div>
              <span className="text-lg font-bold tracking-tight">Miyi Ðekae</span>
            </div>

            {/* Titre Page Desktop */}
            <div className="hidden md:block">
              <h2 className="text-sm font-black tracking-widest text-muted-foreground uppercase opacity-80">
                Administration
              </h2>
              <p className="text-lg font-bold tracking-tight">
                {mounted ? getPageTitle() : "Chargement..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 border-r pr-2 md:pr-4">
              {mounted && <NotificationBell />}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="hover:bg-primary/10 hover:text-primary rounded-xl transition-all md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
      </motion.main>
    </div>
  );
}
