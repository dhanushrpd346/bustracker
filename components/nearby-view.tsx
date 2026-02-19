"use client"

import { useState, useEffect } from "react"
import { BUS_STOPS, BUS_ROUTES, generateBuses, type Bus, type BusStop } from "@/lib/bus-data"
import { Header } from "./header"
import { BusDetailSheet } from "./bus-detail-sheet"
import { cn } from "@/lib/utils"
import { MapPin, Clock, Users, Navigation, ChevronRight, Bus as BusIcon, ArrowUpRight } from "lucide-react"

function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function CrowdDots({ level }: { level: string }) {
  const colors = { low: "bg-success", medium: "bg-warning", high: "bg-destructive" }
  const active = { low: 1, medium: 2, high: 3 }
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map(i => (
        <div
          key={i}
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            i <= (active[level as keyof typeof active] || 1) ? colors[level as keyof typeof colors] || "bg-muted" : "bg-muted"
          )}
        />
      ))}
    </div>
  )
}

interface StopWithDistance extends BusStop {
  distance: number
}

export function NearbyView() {
  const [userLat] = useState(8.7284)
  const [userLng] = useState(77.7066)
  const [buses, setBuses] = useState<Bus[]>([])
  const [selectedStop, setSelectedStop] = useState<StopWithDistance | null>(null)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [busSheetOpen, setBusSheetOpen] = useState(false)

  useEffect(() => {
    setBuses(generateBuses())
    const interval = setInterval(() => setBuses(generateBuses()), 10000)
    return () => clearInterval(interval)
  }, [])

  const stopsWithDistance: StopWithDistance[] = BUS_STOPS
    .map(stop => ({
      ...stop,
      distance: getDistance(userLat, userLng, stop.lat, stop.lng),
    }))
    .sort((a, b) => a.distance - b.distance)

  const nearbyStops = stopsWithDistance.slice(0, 8)

  const getBusesForStop = (stop: BusStop) => {
    return buses.filter(bus => {
      const route = BUS_ROUTES.find(r => r.id === bus.routeId)
      return route?.stops.includes(stop.id)
    })
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Nearby Stops" subtitle="Stops close to your location" />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg p-4">
          {/* User location card */}
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 p-3">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <Navigation className="h-5 w-5 text-primary" />
              </div>
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Tirunelveli Junction</p>
              <p className="text-xs text-muted-foreground">Your current location</p>
            </div>
          </div>

          {/* ETA Dashboard */}
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Upcoming Arrivals
          </h3>
          <div className="mb-6 space-y-2">
            {buses
              .sort((a, b) => a.eta - b.eta)
              .slice(0, 4)
              .map(bus => {
                const route = BUS_ROUTES.find(r => r.id === bus.routeId)
                return (
                  <button
                    key={bus.id}
                    onClick={() => { setSelectedBus(bus); setBusSheetOpen(true) }}
                    className="flex w-full items-center gap-3 rounded-xl bg-card p-3 border border-border transition-all hover:shadow-md hover:border-primary/20"
                  >
                    <div
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold text-primary-foreground"
                      style={{ backgroundColor: route?.color || "#2563eb" }}
                    >
                      {bus.routeNumber}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium text-foreground truncate">{bus.nextStop}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <CrowdDots level={bus.crowdLevel} />
                        <span className="text-[10px] text-muted-foreground capitalize">{bus.crowdLevel} crowd</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-lg font-bold text-primary">{bus.eta}</span>
                      <span className="text-[10px] text-muted-foreground">min</span>
                    </div>
                  </button>
                )
              })}
          </div>

          {/* Nearby stops */}
          <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Nearest Bus Stops
          </h3>
          <div className="space-y-3">
            {nearbyStops.map((stop) => {
              const stopBuses = getBusesForStop(stop)
              const isSelected = selectedStop?.id === stop.id

              return (
                <div key={stop.id}>
                  <button
                    onClick={() => setSelectedStop(isSelected ? null : stop)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left border transition-all",
                      isSelected ? "border-primary shadow-md" : "border-border hover:shadow-sm hover:border-primary/20"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                      isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                    )}>
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{stop.name}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {stop.distance < 1 ? `${Math.round(stop.distance * 1000)}m` : `${stop.distance.toFixed(1)}km`}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {stop.routes.length} routes
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={cn(
                      "h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform",
                      isSelected && "rotate-90"
                    )} />
                  </button>

                  {/* Expanded bus list */}
                  {isSelected && stopBuses.length > 0 && (
                    <div className="mt-2 ml-6 space-y-2 animate-slide-up">
                      {stopBuses.map(bus => {
                        const route = BUS_ROUTES.find(r => r.id === bus.routeId)
                        return (
                          <button
                            key={bus.id}
                            onClick={() => { setSelectedBus(bus); setBusSheetOpen(true) }}
                            className="flex w-full items-center gap-3 rounded-lg bg-secondary/60 p-3 text-left transition-colors hover:bg-secondary"
                          >
                            <div
                              className="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold text-primary-foreground"
                              style={{ backgroundColor: route?.color || "#2563eb" }}
                            >
                              {bus.routeNumber}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-foreground">{route?.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <CrowdDots level={bus.crowdLevel} />
                                <span className="text-[10px] text-muted-foreground">{bus.speed} km/h</span>
                              </div>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-sm font-bold text-primary">{bus.eta} min</span>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {isSelected && stopBuses.length === 0 && (
                    <div className="mt-2 ml-6 rounded-lg bg-secondary/60 p-3 text-center animate-slide-up">
                      <p className="text-xs text-muted-foreground">No buses currently approaching this stop</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <BusDetailSheet bus={selectedBus} open={busSheetOpen} onOpenChange={setBusSheetOpen} />
    </div>
  )
}
