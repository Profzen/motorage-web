"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  MapPin,
  Bike,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  Plus,
  Moon,
  Sun,
  Monitor,
  User as UserIcon,
  ChevronDown,
  Menu,
  X,
  CreditCard,
  Package,
  Users
} from "lucide-react"

import { cn } from "@/lib/utils"
import { useAuthStore, useSidebarStore } from "@/lib/store"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

const NAV_ITEMS = [
  {
    title: "Tableau de Bord",
    icon: LayoutDashboard,
    href: "/dashboard",
    badge: null,
  },
  {
    title: "Trajets",
    icon: MapPin,
    href: "#",
    badge: "12",
    children: [
      { title: "Explorer les trajets", href: "/trajets" },
      { title: "Mes réservations", href: "/dashboard/reservations" },
      { title: "Publier un trajet", href: "/trajets/nouveau" },
      { title: "Historique complet", href: "/historique" },
    ]
  },
  {
    title: "Garage",
    icon: Bike,
    href: "/garage",
    badge: null,
  },
  {
    title: "Historique",
    icon: History,
    href: "/historique",
    badge: null,
  },
  {
    title: "Utilisateurs",
    icon: Users,
    href: "/admin/users",
    role: "administrateur",
    badge: "Nouveau",
  },
  {
    title: "Paramètres",
    icon: Settings,
    href: "/settings",
    badge: null,
  },
]

export function DashboardSidebar() {
  const { user, logout } = useAuthStore()
  const { isCollapsed, isOpen, setCollapsed, setOpen, toggle } = useSidebarStore()
  const { setTheme } = useTheme()
  const pathname = usePathname()
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Handle mobile resize
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(false)
      } else {
        setOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [setCollapsed, setOpen])

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <motion.aside
        initial={false}
        animate={{
          width: mounted && isCollapsed ? 80 : 280,
          x: mounted && (isOpen || (typeof window !== 'undefined' && window.innerWidth >= 768)) ? 0 : (mounted ? -280 : 0)
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed top-0 left-0 h-screen z-50 bg-card/70 border-r flex flex-col transition-all duration-500 ease-in-out",
          "backdrop-blur-xl shadow-2xl shadow-primary/5",
          "before:absolute before:inset-0 before:bg-gradient-to-b before:from-primary/5 before:to-transparent before:pointer-events-none",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center px-4 justify-between shrink-0">
          <Link href="/" className="flex items-center gap-3 overflow-hidden">
            <div className="bg-primary h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
              <Bike className="text-primary-foreground h-6 w-6" />
            </div>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-bold text-xl tracking-tight whitespace-nowrap"
              >
                Miyi Ðekae
              </motion.span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!isCollapsed)}
            className="hidden md:flex h-8 w-8 hover:bg-primary/10 hover:text-primary transition-all rounded-lg"
          >
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-4">
          <div className={cn(
            "relative transition-all duration-300",
            isCollapsed ? "w-10 overflow-hidden" : "w-full"
          )}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={isCollapsed ? "" : "Rechercher..."}
              className={cn(
                "pl-10 bg-muted/40 border-transparent transition-all duration-300",
                "hover:bg-muted/60 focus:bg-background focus:border-primary/50 focus:ring-4 focus:ring-primary/10 shadow-none",
                searchFocused && "bg-background border-primary/50 shadow-sm"
              )}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1.5 py-2">
            {NAV_ITEMS.filter(item => !item.role || (mounted && item.role === user?.role)).map((item) => (
              <SidebarItem
                key={item.title}
                item={item}
                isCollapsed={mounted ? isCollapsed : false}
                isActive={pathname === item.href}
              />
            ))}
          </div>

        </ScrollArea>

        {/* User Section */}
        <div className="p-3 mt-auto border-t bg-muted/10">
          {mounted && !isCollapsed ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-2 h-auto gap-3 hover:bg-muted/50 rounded-xl">
                  <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start text-left flex-1 min-w-0">
                    <span className="text-sm font-semibold truncate w-full">{user?.prenom} {user?.nom}</span>
                    <span className="text-[10px] text-muted-foreground truncate w-full">{user?.email}</span>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
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
                <DropdownMenuItem className="text-destructive font-medium focus:text-destructive" onClick={logout}>
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
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-xl mx-auto block p-0 overflow-hidden">
                        <Avatar className="h-12 w-12 rounded-xl">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {user?.prenom?.[0]}{user?.nom?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="end" className="w-56">
                      <DropdownMenuItem onClick={logout}>Déconnexion</DropdownMenuItem>
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
  )
}

function SidebarItem({ item, isCollapsed, isActive }: any) {
  const [isOpen, setIsOpen] = React.useState(false)
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren && !isCollapsed) {
    return (
      <div className="space-y-1">
        <Button
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full justify-start h-10 gap-3 px-3 transition-all rounded-xl",
            "hover:bg-primary/5 hover:text-primary",
            isActive && "bg-primary/10 text-primary"
          )}
        >
          <item.icon className={cn("h-5 w-5 shrink-0 transition-all duration-300", isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-primary")} />
          <span className="flex-1 text-sm font-semibold">{item.title}</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 text-muted-foreground", isOpen && "rotate-180 text-primary")} />
        </Button>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="pl-11 space-y-1 overflow-hidden"
            >
              {item.children.map((child: any) => (
                <Link
                  key={child.title}
                  href={child.href}
                  className="block py-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {child.title}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <Link
            href={item.href}
            className={cn(
              "flex items-center h-10 gap-3 px-3 rounded-xl transition-all relative group",
              isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground hover:translate-x-1"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="active-indicator"
                className="absolute left-0 w-1 h-6 bg-primary rounded-r-full"
              />
            )}
            <item.icon className={cn(
              "h-5 w-5 shrink-0 transition-transform duration-300",
              isActive ? "scale-110" : "group-hover:scale-110"
            )} />
            {!isCollapsed && (
              <span className="flex-1 text-sm font-medium truncate">{item.title}</span>
            )}
            {!isCollapsed && item.badge && (
              <Badge variant={item.badge === "Nouveau" ? "default" : "secondary"} className="h-5 px-1.5 text-[10px] font-bold">
                {item.badge}
              </Badge>
            )}
          </Link>
        </TooltipTrigger>
        {isCollapsed && (
          <TooltipContent side="right" className="flex items-center gap-3">
            {item.title}
            {item.badge && <Badge className="h-4 px-1 text-[8px]">{item.badge}</Badge>}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
