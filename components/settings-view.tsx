"use client"

import { useState } from "react"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import {
  User, MapPin, Globe, Moon, Sun, Smartphone, Info,
  Shield, Star, MessageSquare, ChevronRight, Bus, Heart
} from "lucide-react"

interface SettingItem {
  icon: React.ElementType
  label: string
  description: string
  action?: "toggle" | "navigate"
  value?: boolean
}

export function SettingsView() {
  const [darkMode, setDarkMode] = useState(false)
  const [language, setLanguage] = useState("English")
  const [units, setUnits] = useState("km")

  const profileSettings: SettingItem[] = [
    { icon: User, label: "Profile", description: "Manage your account details", action: "navigate" },
    { icon: MapPin, label: "Saved Stops", description: "Your favorite bus stops", action: "navigate" },
    { icon: Star, label: "Favorite Routes", description: "Quick access to your routes", action: "navigate" },
  ]

  const appSettings = [
    { icon: darkMode ? Moon : Sun, label: "Dark Mode", description: "Switch between light and dark themes", action: "toggle" as const, value: darkMode },
    { icon: Globe, label: "Language", description: language, action: "navigate" as const },
    { icon: Smartphone, label: "Distance Units", description: units === "km" ? "Kilometers" : "Miles", action: "navigate" as const },
  ]

  const aboutSettings: SettingItem[] = [
    { icon: Info, label: "About", description: "Version 1.0.0", action: "navigate" },
    { icon: Shield, label: "Privacy Policy", description: "How we handle your data", action: "navigate" },
    { icon: MessageSquare, label: "Send Feedback", description: "Help us improve the app", action: "navigate" },
  ]

  const handleToggle = (label: string) => {
    if (label === "Dark Mode") {
      setDarkMode(!darkMode)
      document.documentElement.classList.toggle("dark")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Settings" subtitle="App preferences" />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg p-4">
          {/* App identity card */}
          <div className="mb-6 flex flex-col items-center rounded-2xl bg-primary/5 border border-primary/10 p-6">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary">
              <Bus className="h-8 w-8 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Tirunelveli Smart Bus</h2>
            <p className="text-sm text-muted-foreground">Your city, your commute, simplified</p>
            <div className="mt-3 flex items-center gap-4">
              <div className="text-center">
                <p className="text-lg font-bold text-primary">8</p>
                <p className="text-[10px] text-muted-foreground">Routes</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-primary">15</p>
                <p className="text-[10px] text-muted-foreground">Stops</p>
              </div>
              <div className="h-6 w-px bg-border" />
              <div className="text-center">
                <p className="text-lg font-bold text-primary">24/7</p>
                <p className="text-[10px] text-muted-foreground">Tracking</p>
              </div>
            </div>
          </div>

          {/* Profile section */}
          <SettingSection title="Account" items={profileSettings} onToggle={handleToggle} />

          {/* App settings */}
          <SettingSection title="App Settings" items={appSettings} onToggle={handleToggle} />

          {/* About */}
          <SettingSection title="About" items={aboutSettings} onToggle={handleToggle} />

          {/* Footer */}
          <div className="mt-6 flex flex-col items-center text-center pb-4">
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              Made with <Heart className="h-3 w-3 text-destructive" /> in Tirunelveli
            </p>
            <p className="mt-1 text-[10px] text-muted-foreground">v1.0.0</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingSection({ title, items, onToggle }: { title: string; items: SettingItem[]; onToggle: (label: string) => void }) {
  return (
    <div className="mb-5">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {items.map((item, i) => {
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => item.action === "toggle" ? onToggle(item.label) : undefined}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/50",
                i < items.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-secondary">
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              {item.action === "toggle" ? (
                <div className={cn(
                  "h-6 w-11 rounded-full flex items-center px-0.5 transition-colors",
                  item.value ? "bg-primary" : "bg-muted"
                )}>
                  <div className={cn(
                    "h-5 w-5 rounded-full bg-card shadow transition-transform",
                    item.value ? "translate-x-5" : "translate-x-0"
                  )} />
                </div>
              ) : (
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
