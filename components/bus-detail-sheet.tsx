"use client"

import { useState, useEffect } from "react"
import { Bus as BusType, getRouteByNumber, getStopsForRoute } from "@/lib/bus-data"
import { isRouteSaved, saveRoute, removeSavedRoute } from "@/lib/profile-data"
import { cn } from "@/lib/utils"
import { Bus, Clock, MapPin, Users, Gauge, User, Hash, ChevronRight, X, Navigation, Bookmark } from "lucide-react"

interface BusDetailSheetProps {
  bus: BusType | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function CrowdIndicator({ level }: { level: string }) {
  const config = {
    low: { label: "Low Crowd", desc: "Plenty of seats available", color: "text-success", bg: "bg-success/10", bars: 1 },
    medium: { label: "Moderate", desc: "Some seats available", color: "text-warning", bg: "bg-warning/10", bars: 2 },
    high: { label: "Crowded", desc: "Standing room only", color: "text-destructive", bg: "bg-destructive/10", bars: 3 },
  }
  const c = config[level as keyof typeof config] || config.low
  return (
    <div className={cn("flex items-center gap-3 rounded-xl p-3", c.bg)}>
      <div className="flex items-end gap-0.5">
        {[1, 2, 3].map(i => (
          <div
            key={i}
            className={cn(
              "w-1.5 rounded-full transition-all",
              i <= c.bars ? c.color.replace("text-", "bg-") : "bg-muted",
            )}
            style={{ height: `${8 + i * 4}px` }}
          />
        ))}
      </div>
      <div>
        <p className={cn("text-sm font-semibold", c.color)}>{c.label}</p>
        <p className="text-xs text-muted-foreground">{c.desc}</p>
      </div>
    </div>
  )
}

export function BusDetailSheet({ bus, open, onOpenChange }: BusDetailSheetProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (bus && open) {
      const route = getRouteByNumber(bus.routeNumber)
      if (route) setSaved(isRouteSaved(route.id))
    }
  }, [bus, open])

  if (!bus || !open) return null

  const route = getRouteByNumber(bus.routeNumber)
  const stops = route ? getStopsForRoute(route.id) : []

  const handleToggleSave = () => {
    if (!route) return
    if (saved) {
      removeSavedRoute(route.id)
      setSaved(false)
    } else {
      saveRoute(route.id)
      setSaved(true)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-hidden
      />

      {/* Sheet */}
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-t-2xl bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>

        {/* Action buttons */}
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <button
            onClick={handleToggleSave}
            className={cn(
              "rounded-xl p-2 transition-colors",
              saved
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
            aria-label={saved ? "Remove from saved routes" : "Save route"}
          >
            <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            aria-label="Close detail sheet"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
          {/* Bus header */}
          <div className="flex items-start gap-4 mb-5">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-primary-foreground"
              style={{ backgroundColor: route?.color || "#2563eb" }}
            >
              {bus.routeNumber}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-foreground">{route?.name || `Route ${bus.routeNumber}`}</h2>
              <p className="text-sm text-muted-foreground">{route?.from} → {route?.to}</p>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/80 p-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">{bus.eta}</span>
              <span className="text-[10px] text-muted-foreground">min ETA</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/80 p-3">
              <Gauge className="h-4 w-4 text-accent" />
              <span className="text-lg font-bold text-foreground">{bus.speed}</span>
              <span className="text-[10px] text-muted-foreground">km/h</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/80 p-3">
              <Navigation className="h-4 w-4 text-primary" />
              <span className="text-lg font-bold text-foreground">{bus.heading}°</span>
              <span className="text-[10px] text-muted-foreground">heading</span>
            </div>
          </div>

          {/* Crowd level */}
          <div className="mb-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Crowd Level</h3>
            <CrowdIndicator level={bus.crowdLevel} />
          </div>

          {/* Bus info */}
          <div className="mb-5">
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Bus Information</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-secondary/80 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="h-4 w-4" /> Driver
                </span>
                <span className="text-sm font-medium text-foreground">{bus.driver}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/80 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Hash className="h-4 w-4" /> Plate
                </span>
                <span className="text-sm font-medium text-foreground">{bus.plateNumber}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-secondary/80 px-3 py-2.5">
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4" /> Next Stop
                </span>
                <span className="text-sm font-medium text-foreground">{bus.nextStop}</span>
              </div>
            </div>
          </div>

          {/* Route stops */}
          {stops.length > 0 && (
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Route Stops</h3>
              <div className="relative pl-4">
                <div
                  className="absolute left-[7px] top-2 bottom-2 w-0.5 rounded-full"
                  style={{ backgroundColor: route?.color || "#2563eb" }}
                />
                {stops.map((stop, i) => (
                  <div key={stop.id} className="relative flex items-center gap-3 pb-4 last:pb-0">
                    <div
                      className={cn(
                        "relative z-10 h-3.5 w-3.5 rounded-full border-2 bg-card",
                        i === 0 || i === stops.length - 1 ? "border-primary" : "border-muted-foreground/30"
                      )}
                      style={i === 0 || i === stops.length - 1 ? { borderColor: route?.color } : {}}
                    />
                    <span className={cn(
                      "text-sm",
                      i === 0 || i === stops.length - 1 ? "font-semibold text-foreground" : "text-muted-foreground"
                    )}>
                      {stop.name}
                    </span>
                    {stop.name === bus.nextStop && (
                      <span className="ml-auto rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                        Next
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
