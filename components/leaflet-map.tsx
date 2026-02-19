"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import { MapContainer, TileLayer, Polyline, CircleMarker, Marker, Popup, useMap } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import { Bus as BusType, BusStop, BusRoute, BUS_STOPS, BUS_ROUTES, getRouteByNumber } from "@/lib/bus-data"

interface LeafletMapProps {
  buses: BusType[]
  showStops: boolean
  onBusClick: (bus: BusType) => void
}

function createBusIcon(routeNumber: string, color: string) {
  return L.divIcon({
    className: "bus-marker-icon",
    html: `
      <div class="bus-marker-pulse" style="background:${color}"></div>
      <div class="bus-marker-badge" style="background:${color}">
        <span>${routeNumber}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  })
}

function BusMarkers({ buses, onBusClick }: { buses: BusType[]; onBusClick: (bus: BusType) => void }) {
  return (
    <>
      {buses.map((bus) => {
        const route = getRouteByNumber(bus.routeNumber)
        const color = route?.color || "#2563eb"
        const icon = createBusIcon(bus.routeNumber, color)
        return (
          <Marker
            key={bus.id}
            position={[bus.lat, bus.lng]}
            icon={icon}
            eventHandlers={{
              click: () => onBusClick(bus),
            }}
          >
            <Popup className="bus-popup">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold" style={{ color }}>Route {bus.routeNumber}</span>
                <span className="text-xs text-muted-foreground">Next: {bus.nextStop}</span>
                <span className="text-xs text-muted-foreground">ETA: {bus.eta} min</span>
                <span className="text-xs text-muted-foreground">Speed: {bus.speed} km/h</span>
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}

function StopMarkers({ showStops }: { showStops: boolean }) {
  if (!showStops) return null
  return (
    <>
      {BUS_STOPS.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.lat, stop.lng]}
          radius={7}
          pathOptions={{
            color: "hsl(var(--primary))",
            weight: 2.5,
            fillColor: "#ffffff",
            fillOpacity: 1,
          }}
        >
          <Popup className="stop-popup">
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold">{stop.name}</span>
              <span className="text-xs text-muted-foreground">
                Routes: {stop.routes.join(", ")}
              </span>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </>
  )
}

function RoutePolylines() {
  return (
    <>
      {BUS_ROUTES.map((route) => {
        const positions = route.stops
          .map((sid) => {
            const stop = BUS_STOPS.find((s) => s.id === sid)
            return stop ? [stop.lat, stop.lng] as [number, number] : null
          })
          .filter(Boolean) as [number, number][]

        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={{
              color: route.color,
              weight: 4,
              opacity: 0.6,
              dashArray: "8 6",
              lineCap: "round",
              lineJoin: "round",
            }}
          >
            <Popup>
              <div className="flex flex-col gap-1">
                <span className="text-sm font-bold" style={{ color: route.color }}>
                  Route {route.number}
                </span>
                <span className="text-xs">{route.name}</span>
                <span className="text-xs text-muted-foreground">
                  {route.from} → {route.to}
                </span>
              </div>
            </Popup>
          </Polyline>
        )
      })}
    </>
  )
}

function FitBounds({ buses }: { buses: BusType[] }) {
  const map = useMap()
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (!hasInitialized.current && buses.length > 0) {
      hasInitialized.current = true
      const allPoints: [number, number][] = [
        ...BUS_STOPS.map((s) => [s.lat, s.lng] as [number, number]),
        ...buses.map((b) => [b.lat, b.lng] as [number, number]),
      ]
      if (allPoints.length > 0) {
        const bounds = L.latLngBounds(allPoints)
        map.fitBounds(bounds, { padding: [30, 30] })
      }
    }
  }, [buses, map])

  return null
}

export function LeafletMap({ buses, showStops, onBusClick }: LeafletMapProps) {
  return (
    <MapContainer
      center={[8.7284, 77.7066]}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <RoutePolylines />
      <StopMarkers showStops={showStops} />
      <BusMarkers buses={buses} onBusClick={onBusClick} />
      <FitBounds buses={buses} />
    </MapContainer>
  )
}
