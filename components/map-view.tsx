"use client"

import { useState, useEffect, useCallback } from "react"
import { Bus as BusType, BUS_STOPS, BUS_ROUTES, generateBuses, getRouteByNumber } from "@/lib/bus-data"
import { Header } from "./header"
import { BusDetailSheet } from "./bus-detail-sheet"
import { cn } from "@/lib/utils"
import {
  Bus, MapPin, Navigation, Minus, Plus, Users, Clock,
  ChevronDown, Locate, RefreshCw, Layers
} from "lucide-react"

const MAP_CENTER = { lat: 8.7284, lng: 77.7066 }
const MAP_BOUNDS = { latMin: 8.700, latMax: 8.750, lngMin: 77.690, lngMax: 77.740 }

function latLngToXY(lat: number, lng: number, width: number, height: number) {
  const x = ((lng - MAP_BOUNDS.lngMin) / (MAP_BOUNDS.lngMax - MAP_BOUNDS.lngMin)) * width
  const y = ((MAP_BOUNDS.latMax - lat) / (MAP_BOUNDS.latMax - MAP_BOUNDS.latMin)) * height
  return { x, y }
}

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

export function MapView() {
  const [buses, setBuses] = useState<BusType[]>([])
  const [selectedBus, setSelectedBus] = useState<BusType | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [zoom, setZoom] = useState(1)
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
  const mapWidth = 800 * zoom
  const mapHeight = 600 * zoom

  const handleBusClick = (bus: BusType) => {
    setSelectedBus(bus)
    setSheetOpen(true)
  }

  return (
    <div className="flex h-full flex-col">
      <Header title="Live Tracking" subtitle="Real-time bus locations" />

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
        <div className="h-full w-full overflow-auto">
          <svg
            width={mapWidth}
            height={mapHeight}
            viewBox={`0 0 ${mapWidth} ${mapHeight}`}
            className="min-h-full min-w-full"
            role="img"
            aria-label="Bus tracking map of Tirunelveli"
          >
            {/* Background grid */}
            <defs>
              <pattern id="grid" width={40 * zoom} height={40 * zoom} patternUnits="userSpaceOnUse">
                <path d={`M ${40 * zoom} 0 L 0 0 0 ${40 * zoom}`} fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
              </pattern>
              <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.15" />
              </filter>
            </defs>
            <rect width={mapWidth} height={mapHeight} fill="url(#grid)" />

            {/* Road lines between connected stops */}
            {BUS_ROUTES.map((route) => {
              const points = route.stops.map(sid => {
                const stop = BUS_STOPS.find(s => s.id === sid)!
                return latLngToXY(stop.lat, stop.lng, mapWidth, mapHeight)
              })
              return (
                <g key={route.id}>
                  <polyline
                    points={points.map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={3 * zoom}
                    strokeOpacity={0.2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <polyline
                    points={points.map(p => `${p.x},${p.y}`).join(" ")}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={1.5 * zoom}
                    strokeOpacity={0.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={`${8 * zoom} ${4 * zoom}`}
                  />
                </g>
              )
            })}

            {/* Bus stops */}
            {showStops && BUS_STOPS.map((stop) => {
              const { x, y } = latLngToXY(stop.lat, stop.lng, mapWidth, mapHeight)
              return (
                <g key={stop.id}>
                  <circle cx={x} cy={y} r={6 * zoom} className="fill-card stroke-primary" strokeWidth={2 * zoom} filter="url(#shadow)" />
                  <circle cx={x} cy={y} r={2.5 * zoom} className="fill-primary" />
                  {zoom >= 1 && (
                    <text
                      x={x}
                      y={y + 14 * zoom}
                      textAnchor="middle"
                      className="fill-foreground text-[9px] font-medium"
                      style={{ fontSize: `${9 * zoom}px` }}
                    >
                      {stop.name.length > 15 ? stop.name.slice(0, 15) + "..." : stop.name}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Buses */}
            {filteredBuses.map((bus) => {
              const { x, y } = latLngToXY(bus.lat, bus.lng, mapWidth, mapHeight)
              const route = getRouteByNumber(bus.routeNumber)
              const color = route?.color || "#2563eb"
              return (
                <g
                  key={bus.id}
                  onClick={() => handleBusClick(bus)}
                  className="cursor-pointer"
                  role="button"
                  tabIndex={0}
                  aria-label={`Bus route ${bus.routeNumber}, next stop ${bus.nextStop}, ETA ${bus.eta} minutes`}
                >
                  {/* Pulse ring */}
                  <circle cx={x} cy={y} r={14 * zoom} fill={color} opacity={0.15} className="animate-pulse-dot" />
                  {/* Bus marker */}
                  <rect
                    x={x - 12 * zoom}
                    y={y - 10 * zoom}
                    width={24 * zoom}
                    height={20 * zoom}
                    rx={6 * zoom}
                    fill={color}
                    filter="url(#shadow)"
                  />
                  <text
                    x={x}
                    y={y + 1 * zoom}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    style={{ fontSize: `${9 * zoom}px`, fontWeight: 700 }}
                  >
                    {bus.routeNumber}
                  </text>
                  {/* ETA label */}
                  <rect
                    x={x + 10 * zoom}
                    y={y - 18 * zoom}
                    width={28 * zoom}
                    height={14 * zoom}
                    rx={4 * zoom}
                    className="fill-card"
                    filter="url(#shadow)"
                  />
                  <text
                    x={x + 24 * zoom}
                    y={y - 11 * zoom}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="fill-foreground"
                    style={{ fontSize: `${7 * zoom}px`, fontWeight: 600 }}
                  >
                    {bus.eta}m
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        {/* Map controls */}
        <div className="absolute right-3 top-3 flex flex-col gap-2">
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
          <button
            onClick={() => setZoom(Math.min(zoom + 0.25, 2))}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-lg"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4 text-foreground" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom - 0.25, 0.5))}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card shadow-lg"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4 text-foreground" />
          </button>
        </div>

        {/* Live indicator */}
        <div className="absolute left-3 top-3 flex items-center gap-2 rounded-xl bg-card px-3 py-2 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
          </span>
          <span className="text-xs font-semibold text-foreground">{filteredBuses.length} buses live</span>
        </div>

        {/* Quick bus list at bottom */}
        <div className="absolute bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border">
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
