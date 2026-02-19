"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Bus as BusType, BUS_ROUTES, generateBuses, getRouteByNumber } from "@/lib/bus-data"
import { Header } from "./header"
import { BusDetailSheet } from "./bus-detail-sheet"
import { cn } from "@/lib/utils"
import { Users, Clock, RefreshCw, Layers, Loader2 } from "lucide-react"

const LeafletMap = dynamic(() => import("./leaflet-map").then((m) => m.LeafletMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-secondary/50">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  ),
})

function CrowdBadge({ level }: { level: string }) {
  const config = {
    low: { label: "Low", className: "bg-success text-success-foreground" },
    medium: { label: "Med", className: "bg-warning text-warning-foreground" },
    high: { label: "Full", className: "bg-destructive text-primary-foreground" },
  }
  const c = config[level as keyof typeof config] || config.low
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold", c.className)}>
      <Users className="h-2.5 w-2.5" />
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
      <Header title="Live Tracking" subtitle="Real-time bus locations" onProfileClick={onProfileClick} />

      {/* Route filter chips */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-2.5">
        <div className="mx-auto max-w-lg">
          <div className="scrollbar-hide flex gap-2 overflow-x-auto">
            <button
              onClick={() => setFilterRoute("all")}
              className={cn(
                "flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                filterRoute === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              All Buses
            </button>
            {BUS_ROUTES.map(route => (
              <button
                key={route.id}
                onClick={() => setFilterRoute(route.number)}
                className={cn(
                  "flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  filterRoute === route.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                Route {route.number}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="relative flex-1 overflow-hidden bg-secondary/50">
        <LeafletMap buses={filteredBuses} showStops={showStops} onBusClick={handleBusClick} />

        {/* Map controls */}
        <div className="absolute right-3 top-3 z-[1000] flex flex-col gap-2">
          <button
            onClick={refreshBuses}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-lg transition-transform",
              isRefreshing && "animate-spin"
            )}
            aria-label="Refresh bus locations"
          >
            <RefreshCw className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={() => setShowStops(!showStops)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl shadow-lg transition-colors",
              showStops ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
            )}
            aria-label="Toggle stops"
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>

        {/* Live indicator */}
        <div className="absolute left-3 top-3 z-[1000] flex items-center gap-2 rounded-xl bg-card px-3 py-2 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-xs font-semibold text-foreground">{filteredBuses.length} buses live</span>
        </div>

        {/* Quick bus list at bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-card/95 backdrop-blur-lg border-t border-border">
          <div className="mx-auto max-w-lg">
            <div className="scrollbar-hide flex gap-3 overflow-x-auto p-3">
              {filteredBuses.slice(0, 8).map((bus) => {
                const route = getRouteByNumber(bus.routeNumber)
                return (
                  <button
                    key={bus.id}
                    onClick={() => handleBusClick(bus)}
                    className="flex flex-shrink-0 items-center gap-3 rounded-xl bg-secondary/80 px-3 py-2.5 transition-colors hover:bg-secondary"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
                      style={{ backgroundColor: route?.color || "#2563eb" }}
                    >
                      {bus.routeNumber}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold text-foreground">{bus.nextStop}</p>
                      <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-2.5 w-2.5" /> {bus.eta} min
                        </span>
                        <CrowdBadge level={bus.crowdLevel} />
                      </div>
                    </div>
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
