"use client"

import { useState } from "react"
import { BUS_ROUTES, BUS_STOPS, getStopsForRoute, type BusRoute } from "@/lib/bus-data"
import { Header } from "./header"
import { cn } from "@/lib/utils"
import { ChevronRight, Clock, MapPin, ArrowRight, X, Bus } from "lucide-react"

function RouteDetail({ route, onClose }: { route: BusRoute; onClose: () => void }) {
  const stops = getStopsForRoute(route.id)

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative z-10 w-full max-w-lg animate-slide-up rounded-t-2xl bg-card pb-[env(safe-area-inset-bottom)] shadow-2xl">
        <div className="flex justify-center pt-3 pb-2">
          <div className="h-1 w-10 rounded-full bg-muted" />
        </div>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-xl p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          aria-label="Close route detail"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="max-h-[70vh] overflow-y-auto px-4 pb-4">
          {/* Route header */}
          <div className="flex items-start gap-4 mb-5">
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-primary-foreground"
              style={{ backgroundColor: route.color }}
            >
              {route.number}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">{route.name}</h2>
              <p className="text-sm text-muted-foreground">{route.from} → {route.to}</p>
            </div>
          </div>

          {/* Route info cards */}
          <div className="mb-5 grid grid-cols-3 gap-2">
            <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/80 p-3">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-foreground">{route.frequency}</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/80 p-3">
              <Bus className="h-4 w-4 text-accent" />
              <span className="text-xs font-bold text-foreground">{route.firstBus}</span>
              <span className="text-[10px] text-muted-foreground">First Bus</span>
            </div>
            <div className="flex flex-col items-center gap-1 rounded-xl bg-secondary/80 p-3">
              <Bus className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-bold text-foreground">{route.lastBus}</span>
              <span className="text-[10px] text-muted-foreground">Last Bus</span>
            </div>
          </div>

          {/* Stops list */}
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {stops.length} Stops on this route
            </h3>
            <div className="relative pl-4">
              <div
                className="absolute left-[7px] top-2 bottom-2 w-0.5 rounded-full"
                style={{ backgroundColor: route.color }}
              />
              {stops.map((stop, i) => (
                <div key={stop.id} className="relative flex items-center gap-3 pb-5 last:pb-0">
                  <div
                    className={cn(
                      "relative z-10 flex h-4 w-4 items-center justify-center rounded-full border-2 bg-card",
                    )}
                    style={{ borderColor: route.color }}
                  >
                    {(i === 0 || i === stops.length - 1) && (
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: route.color }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={cn(
                      "text-sm",
                      (i === 0 || i === stops.length - 1) ? "font-semibold text-foreground" : "text-foreground"
                    )}>
                      {stop.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {stop.routes.length} routes available
                    </p>
                  </div>
                  {i === 0 && (
                    <span className="rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">Start</span>
                  )}
                  {i === stops.length - 1 && (
                    <span className="rounded-md bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">End</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RoutesView() {
  const [search, setSearch] = useState("")
  const [selectedRoute, setSelectedRoute] = useState<BusRoute | null>(null)

  const filtered = BUS_ROUTES.filter(route =>
    route.name.toLowerCase().includes(search.toLowerCase()) ||
    route.number.includes(search) ||
    route.from.toLowerCase().includes(search.toLowerCase()) ||
    route.to.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-full flex-col">
      <Header
        title="Routes"
        subtitle={`${BUS_ROUTES.length} routes available`}
        showSearch
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Search routes, stops..."
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-lg p-4">
          {/* Quick route summary */}
          <div className="mb-4 flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Bus className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{BUS_ROUTES.length} Active Routes</p>
              <p className="text-xs text-muted-foreground">Covering {BUS_STOPS.length} stops across Tirunelveli</p>
            </div>
          </div>

          {/* Route cards */}
          <div className="space-y-3">
            {filtered.map(route => (
              <button
                key={route.id}
                onClick={() => setSelectedRoute(route)}
                className="flex w-full items-center gap-3 rounded-xl bg-card p-4 text-left shadow-sm border border-border transition-all hover:shadow-md hover:border-primary/20"
              >
                <div
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl text-lg font-bold text-primary-foreground"
                  style={{ backgroundColor: route.color }}
                >
                  {route.number}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{route.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="truncate">{route.from}</span>
                    <ArrowRight className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{route.to}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" /> {route.frequency}
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5" /> {route.stops.length} stops
                    </span>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary">
                  <Bus className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No routes found</p>
                <p className="text-xs text-muted-foreground">Try a different search term</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRoute && (
        <RouteDetail route={selectedRoute} onClose={() => setSelectedRoute(null)} />
      )}
    </div>
  )
}
