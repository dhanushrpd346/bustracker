"use client"

import { useState } from "react"
import { Map, Route, MapPin, Bell, Settings } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = "map" | "routes" | "nearby" | "alerts" | "settings"

interface AppShellProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
  children: React.ReactNode
}

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "map", label: "Map", icon: Map },
  { id: "routes", label: "Routes", icon: Route },
  { id: "nearby", label: "Nearby", icon: MapPin },
  { id: "alerts", label: "Alerts", icon: Bell },
  { id: "settings", label: "Settings", icon: Settings },
]

export function AppShell({ activeTab, onTabChange, children }: AppShellProps) {
  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>

      {/* Bottom navigation */}
      <nav className="flex-shrink-0 border-t border-border bg-card/95 backdrop-blur-lg" role="navigation" aria-label="Main navigation">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  "flex flex-col items-center gap-0.5 rounded-xl px-3 py-2 text-xs font-medium transition-all duration-200",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={tab.label}
              >
                <div className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
                  isActive && "bg-primary/10"
                )}>
                  <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
                </div>
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
        {/* Safe area spacer for mobile */}
        <div className="h-[env(safe-area-inset-bottom)]" />
      </nav>
    </div>
  )
}
