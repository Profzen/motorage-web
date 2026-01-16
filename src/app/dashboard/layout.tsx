"use client"

import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { useSidebarStore } from "@/lib/store"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isCollapsed, toggle, setOpen, isOpen } = useSidebarStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="flex min-h-screen bg-background transition-colors duration-300">
      <DashboardSidebar />
      <motion.main
        animate={{
          paddingLeft: mounted && (typeof window !== 'undefined' && window.innerWidth >= 768)
            ? (isCollapsed ? 80 : 280)
            : 0
        }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
        className="flex-1 w-full flex flex-col min-w-0 bg-surface/30 dark:bg-transparent"
      >
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-6 h-16 border-b bg-background/60 backdrop-blur-xl sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-primary h-9 w-9 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Bike className="text-primary-foreground h-5.5 w-5.5" />
            </div>
            <span className="font-bold text-lg tracking-tight">Miyi Ðekae</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen(!isOpen)}
            className="rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </motion.main>
    </div>
  )
}

import { Menu, Bike } from "lucide-react"
import { Button } from "@/components/ui/button"
