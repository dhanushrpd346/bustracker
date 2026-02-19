"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Bus as BusType, BUS_ROUTES, generateBuses, getRouteByNumber } from "@/lib/bus-data"
import { Header } from "./header"
import { BusDetailSheet } from "./bus-detail-sheet"
import { cn } from "@/lib/utils"
import { Users, Clock, RefreshCw, Layers, Loader2, Navigation } from "lucide-react"

const LeafletMap = dynamic(() => import("./leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-secondary/30">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Loading map...</span>
      </div>
    </div>
  ),
})

function CrowdBadge({ level }: { level: string }) {
  const config = {
    low: { label: "Low", dot: "bg-emerald-500" },
    medium: { label: "Med", dot: "bg-amber-500" },
    high: { label: "Full", dot: "bg-red-500" },
  }
  const c = config[level as keyof typeof config] || config.low
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground">
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  )
}

interface MapViewProps {
  onProfileClick?: () => void
}

export function MapView({ onProfileClick }: MapViewProps) {
  const [buses, setBuses] = useState<BusType[]>([])
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [filterRoute, setFilterRoute] = useState<string>("all")
  const [showStops, setShowStops] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshBuses = useCallback(() => {
    setIsRefreshing(true)
    const newBuses = generateBuses()
    setBuses(newBuses)
    setTimeout(() => setIsRefreshing(false), 500)
  }, [])

  useEffect(() => {
    refreshBuses()
    const interval = setInterval(refreshBuses, 8000)
    return () => clearInterval(interval)
  }, [refreshBuses])

  const filteredBuses = filterRoute === "all" ? buses : buses.filter(b => b.routeNumber === filterRoute)

  const handleBusClick = (bus: BusType) => {
    setSelectedBus(bus)
    setSheetOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Live Map" subtitle="Real-time tracking" onProfileClick={onProfileClick} />

      {/* Route filter chips */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-2">
        <div className="mx-auto max-w-lg">
          <div className="scrollbar-hide flex gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterRoute("all")}
              className={cn(
                "flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
                filterRoute === "all"
                  ? "bg-foreground text-background shadow-sm"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              All
            </button>
            {BUS_ROUTES.map(route => (
              <button
                key={route.id}
                onClick={() => setFilterRoute(route.number)}
                className={cn(
                  "flex-shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all flex items-center gap-1.5",
                  filterRoute === route.number
                    ? "bg-foreground text-background shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: route.color }}
                />
                {route.number}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="relative flex-1 overflow-hidden">
        <LeafletMap buses={filteredBuses} showStops={showStops} onBusClick={handleBusClick} />

        {/* Map controls */}
        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
          <button
            onClick={refreshBuses}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-md border border-border transition-all hover:shadow-lg",
              isRefreshing && "animate-spin"
            )}
            aria-label="Refresh bus locations"
          >
            <RefreshCw className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={() => setShowStops(!showStops)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full shadow-md border border-border transition-all hover:shadow-lg",
              showStops ? "bg-primary text-primary-foreground border-primary" : "bg-card text-foreground"
            )}
            aria-label="Toggle stops"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>

        {/* Live indicator */}
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-full bg-card px-3 py-1.5 shadow-md border border-border">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-semibold text-foreground">{filteredBuses.length} live</span>
        </div>

        {/* Bottom bus cards */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000]">
          <div className="mx-auto max-w-lg px-3 pb-3">
            <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
              {filteredBuses.slice(0, 8).map((bus) => {
                const route = getRouteByNumber(bus.routeNumber)
                return (
                  <button
                    key={bus.id}
                    onClick={() => handleBusClick(bus)}
                    className="flex flex-shrink-0 items-center gap-2.5 rounded-2xl bg-card/95 backdrop-blur-md px-3 py-2.5 shadow-lg border border-border/50 transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                      style={{ backgroundColor: route?.color || "#2563eb" }}
                    >
                      {bus.routeNumber}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground leading-tight">{bus.nextStop}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> {bus.eta}m
                        </span>
                        <span className="text-border">|</span>
                        <CrowdBadge level={bus.crowdLevel} />
                      </div>
                    </div>
                    <Navigation className="h-3.5 w-3.5 text-muted-foreground/50 ml-1" />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <BusDetailSheet bus={selectedBus} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
