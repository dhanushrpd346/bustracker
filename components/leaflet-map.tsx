"use client"

import { useEffect, useRef, useId } from "react"
import L from "leaflet"
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap,
} from "react-leaflet"
import "leaflet/dist/leaflet.css"
import {
  Bus as BusType,
  BUS_STOPS,
  BUS_ROUTES,
  getRouteByNumber,
} from "@/lib/bus-data"

delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
})

interface LeafletMapProps {
  buses: BusType[]
  showStops: boolean
  onBusClick: (bus: BusType) => void
}

function busSvg(): string {
  return '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>'
}

function createBusIcon(routeNumber: string, color: string) {
  const svg = busSvg()
  return L.divIcon({
    className: "bus-marker-icon",
    html:
      '<div class="bus-marker-wrap">' +
      '<div class="bus-marker-ring" style="border:2.5px solid ' + color + '"></div>' +
      '<div class="bus-marker-body">' +
      '<div class="bus-marker-svg" style="background:' + color + ';border-radius:10px;padding:4px;display:flex;align-items:center;justify-content:center">' + svg + '</div>' +
      '</div>' +
      '<div class="bus-marker-label" style="background:' + color + '">' + routeNumber + '</div>' +
      '</div>',
    iconSize: [48, 48],
    iconAnchor: [24, 24],
    popupAnchor: [0, -26],
  })
}

function createStopIcon() {
  return L.divIcon({
    className: "stop-marker-icon",
    html: '<div class="stop-marker-dot"></div>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10],
  })
}

function BusMarkers({
  buses,
  onBusClick,
}: {
  buses: BusType[]
  onBusClick: (bus: BusType) => void
}) {
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
            eventHandlers={{ click: () => onBusClick(bus) }}
          >
            <Popup>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  minWidth: 140,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      display: "inline-flex",
                      height: 22,
                      width: 22,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      color: "white",
                      backgroundColor: color,
                    }}
                  >
                    {bus.routeNumber}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {route?.name}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {"Next: "}
                  <span style={{ fontWeight: 600, color: "#222" }}>
                    {bus.nextStop}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#888" }}>
                  <span>{"ETA "}{bus.eta}{"m"}</span>
                  <span>{bus.speed}{" km/h"}</span>
                </div>
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
  const icon = createStopIcon()
  return (
    <>
      {BUS_STOPS.map((stop) => (
        <Marker key={stop.id} position={[stop.lat, stop.lng]} icon={icon}>
          <Popup>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 4,
                minWidth: 120,
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700 }}>{stop.name}</span>
              <span style={{ fontSize: 11, color: "#888" }}>
                {"Routes: "}{stop.routes.join(", ")}
              </span>
            </div>
          </Popup>
        </Marker>
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
            return stop ? ([stop.lat, stop.lng] as [number, number]) : null
          })
          .filter(Boolean) as [number, number][]

        return (
          <Polyline
            key={route.id}
            positions={positions}
            pathOptions={{
              color: route.color,
              weight: 4,
              opacity: 0.45,
              dashArray: "10 8",
              lineCap: "round",
              lineJoin: "round",
            }}
          >
            <Popup>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: route.color }}>
                  {"Route "}{route.number}
                </span>
                <span style={{ fontSize: 12 }}>{route.name}</span>
                <span style={{ fontSize: 11, color: "#888" }}>
                  {route.from}{" \u2192 "}{route.to}
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
        map.fitBounds(bounds, { padding: [40, 40] })
      }
    }
  }, [buses, map])

  return null
}

export function LeafletMap({ buses, showStops, onBusClick }: LeafletMapProps) {
  const mapId = useId()

  return (
    <MapContainer
      key={mapId}
      center={[8.7284, 77.7066]}
      zoom={14}
      className="h-full w-full"
      zoomControl={false}
      attributionControl={false}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <RoutePolylines />
      <StopMarkers showStops={showStops} />
      <BusMarkers buses={buses} onBusClick={onBusClick} />
      <FitBounds buses={buses} />
    </MapContainer>
  )
}
