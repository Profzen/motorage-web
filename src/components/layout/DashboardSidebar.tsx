"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MapPin,
  Car,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Search,
  Moon,
  Sun,
  Monitor,
  User as UserIcon,
  ChevronDown,
  CreditCard,
  Users,
  BarChart3,
  ShieldAlert,
  ClipboardCheck,
  ArrowRightLeft,
  Activity,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAuthStore, useSidebarStore } from "@/lib/store";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

// Navigation pour les ADMINISTRATEURS
const ADMIN_NAV_GROUPS = [
  {
    label: "Général",
    items: [
      {
        title: "Vue d'ensemble",
        icon: LayoutDashboard,
        href: "/dashboard",
        badge: null,
      },
      {
        title: "Statistiques",
        icon: BarChart3,
        href: "/dashboard/stats",
        badge: null,
      },
    ],
  },
  {
    label: "Gestion Profils",
    items: [
      {
        title: "Utilisateurs",
        icon: Users,
        href: "/dashboard/users",
        badge: null,
      },
      {
        title: "Validation Conducteurs",
        icon: ClipboardCheck,
        href: "/dashboard/drivers",
        badge: null,
      },
      {
        title: "Véhicules",
        icon: Car,
        href: "/dashboard/vehicules",
        badge: null,
      },
    ],
  },
  {
    label: "Activité & Flux",
    items: [
      {
        title: "Flux de Trajets",
        icon: ArrowRightLeft,
        href: "/dashboard/flux",
        badge: null,
      },
      {
        title: "Activité",
        icon: Activity,
        href: "/dashboard/activity",
        badge: null,
      },
      {
        title: "Signalements",
        icon: ShieldAlert,
        href: "/dashboard/reports",
        badge: null,
      },
    ],
  },
  {
    label: "Configuration",
    items: [
      {
        title: "Zones",
        icon: MapPin,
        href: "/dashboard/zones",
        badge: null,
      },
    ],
  },
];

// Fonction pour récupérer les items de navigation selon le rôle
const getNavItems = (
  role: string | undefined,
  counters: {
    reports: number;
    onboarding: number;
    activeTrajets: number;
    vehicules: number;
  }
) => {
  if (role === "administrateur") {
    return ADMIN_NAV_GROUPS.map((group) => ({
      ...group,
      items: group.items.map((item) => {
        if (item.title === "Validation Conducteurs") {
          return {
            ...item,
            badge:
              counters.onboarding > 0 ? counters.onboarding.toString() : null,
          };
        }
        if (item.title === "Véhicules") {
          return {
            ...item,
            badge:
              counters.vehicules > 0 ? counters.vehicules.toString() : null,
          };
        }
        if (item.title === "Signalements") {
          return {
            ...item,
            badge: counters.reports > 0 ? counters.reports.toString() : null,
          };
        }
        if (item.title === "Flux de Trajets") {
          return {
            ...item,
            badge:
              counters.activeTrajets > 0
                ? `Live (${counters.activeTrajets})`
                : "Live",
          };
        }
        return item;
      }),
    }));
  }
  return []; // La plateforme web est réservée à l'administration
};

export function DashboardSidebar() {
  const { user, logout } = useAuthStore();
  const { isCollapsed, isOpen, setCollapsed, setOpen } = useSidebarStore();
  const { setTheme } = useTheme();
  const pathname = usePathname();
  const [searchFocused, setSearchFocused] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [counters, setCounters] = React.useState<{
    reports: number;
    onboarding: number;
    activeTrajets: number;
    vehicules: number;
  }>({
    reports: 0,
    onboarding: 0,
    activeTrajets: 0,
    vehicules: 0,
  });

  const fetchCounters = React.useCallback(async () => {
    if (user?.role !== "administrateur") return;
    try {
      const res = await fetch("/api/admin/sidebar-counters");
      const result = await res.json();
      if (result.success) {
        setCounters(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch sidebar counters", error);
    }
  }, [user?.role]);

  React.useEffect(() => {
    setMounted(true);
    fetchCounters();

    // Refresh counters every 2 minutes
    const interval = setInterval(fetchCounters, 120000);
    return () => clearInterval(interval);
  }, [fetchCounters]);

  // Handle mobile resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false);
      } else {
        setOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setCollapsed, setOpen]);

  if (!mounted) return null;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="bg-background/80 fixed inset-0 z-40 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <motion.aside
        initial={false}
        animate={{
          width: mounted && isCollapsed ? 80 : 280,
          x:
            mounted &&
            (isOpen ||
              (typeof window !== "undefined" && window.innerWidth >= 768))
              ? 0
              : mounted
                ? -280
                : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "bg-card/70 fixed top-0 left-0 z-50 flex h-screen flex-col border-r transition-all duration-500 ease-in-out",
          "shadow-primary/5 shadow-2xl backdrop-blur-xl",
          "before:from-primary/5 before:pointer-events-none before:absolute before:inset-0 before:bg-linear-to-b before:to-transparent",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex h-16 shrink-0 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="bg-primary shadow-primary/20 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg">
              <Car className="text-primary-foreground h-6 w-6" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold tracking-tight whitespace-nowrap"
              >
                Miyi Ðekae
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!isCollapsed)}
            className="hover:bg-primary/10 hover:text-primary hidden h-8 w-8 rounded-lg transition-all md:flex"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-4">
          <div
            className={cn(
              "relative transition-all duration-300",
              isCollapsed ? "w-10 overflow-hidden" : "w-full"
            )}
          >
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder={isCollapsed ? "" : "Rechercher..."}
              className={cn(
                "bg-muted/40 border-transparent pl-10 transition-all duration-300",
                "hover:bg-muted/60 focus:bg-background focus:border-primary/50 focus:ring-primary/10 shadow-none focus:ring-4",
                searchFocused && "bg-background border-primary/50 shadow-sm"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-6 py-4">
            {getNavItems(user?.role, counters).map((group) => (
              <div key={group.label} className="space-y-1.5">
                {!isCollapsed && (
                  <h3 className="text-muted-foreground/50 px-3 pb-1 text-[10px] font-black tracking-widest uppercase">
                    {group.label}
                  </h3>
                )}
                {group.items.map((item) => (
                  <SidebarItem
                    key={item.title}
                    item={item}
                    isCollapsed={mounted ? isCollapsed : false}
                    isActive={pathname === item.href}
                  />
                ))}
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* User Section */}
        <div className="bg-muted/10 mt-auto border-t p-3">
          {mounted && !isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hover:bg-muted/50 h-auto w-full justify-start gap-3 rounded-xl p-2"
                >
                  <Avatar className="border-background h-10 w-10 border-2 shadow-sm">
                    <AvatarImage src={user?.avatar || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.prenom?.[0]}
                      {user?.nom?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col items-start text-left">
                    <span className="w-full truncate text-sm font-semibold">
                      {user?.prenom} {user?.nom}
                    </span>
                    <span className="text-muted-foreground w-full truncate text-[10px]">
                      {user?.email}
                    </span>
                  </div>
                  <ChevronDown className="text-muted-foreground h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" side="top" align="start">
                <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <UserIcon className="mr-2 h-4 w-4" /> Profil
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="mr-2 h-4 w-4" /> Paiements
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" /> Paramètres
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" /> Mode Clair
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" /> Mode Sombre
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Monitor className="mr-2 h-4 w-4" /> Système
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive font-medium"
                  onClick={logout}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mx-auto block h-12 w-12 overflow-hidden rounded-xl p-0"
                      >
                        <Avatar className="h-12 w-12 rounded-xl">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user?.prenom?.[0]}
                            {user?.nom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      side="right"
                      align="end"
                      className="w-56"
                    >
                      <DropdownMenuItem onClick={logout}>
                        Déconnexion
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TooltipTrigger>
                <TooltipContent side="right">Mon Profil</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </motion.aside>
    </>
  );
}

interface NavItem {
  title: string;
  icon: React.ElementType;
  href: string;
  badge: string | number | null;
  children?: {
    title: string;
    href: string;
  }[];
}

function SidebarItem({
  item,
  isCollapsed,
  isActive,
}: {
  item: NavItem;
  isCollapsed: boolean;
  isActive: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren && !isCollapsed) {
    return (
      <div className="space-y-1">
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-10 w-full justify-start gap-3 rounded-xl px-3 transition-all",
            "hover:bg-primary/5 hover:text-primary",
            isActive && "bg-primary/10 text-primary"
          )}
        >
          <item.icon
            className={cn(
              "h-5 w-5 shrink-0 transition-all duration-300",
              isActive
                ? "text-primary scale-110"
                : "text-muted-foreground group-hover:text-primary"
            )}
          />
          <span className="flex-1 text-sm font-semibold">{item.title}</span>
          <ChevronDown
            className={cn(
              "text-muted-foreground h-4 w-4 transition-transform duration-300",
              isOpen && "text-primary rotate-180"
            )}
          />
        </Button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-1 overflow-hidden pl-11"
            >
              {item.children?.map((child) => (
                <Link
                  key={child.title}
                  href={child.href}
                  className="text-muted-foreground hover:text-primary block py-2 text-sm transition-colors"
                >
                  {child.title}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "group relative flex h-10 items-center gap-3 rounded-xl px-3 transition-all",
              isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className="bg-primary absolute left-0 h-6 w-1 rounded-r-full"
              />
            )}
            <item.icon
              className={cn(
                "h-5 w-5 shrink-0 transition-transform duration-300",
                isActive ? "scale-110" : "group-hover:scale-110"
              )}
            />
            {!isCollapsed && (
              <span className="flex-1 truncate text-sm font-medium">
                {item.title}
              </span>
            )}
            {!isCollapsed && item.badge && (
              <Badge
                variant={item.badge === "Nouveau" ? "default" : "secondary"}
                className="h-5 px-1.5 text-[10px] font-bold"
              >
                {item.badge}
              </Badge>
            )}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-3">
            {item.title}
            {item.badge && (
              <Badge className="h-4 px-1 text-[8px]">{item.badge}</Badge>
            )}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
