export type CrowdLevel = "low" | "medium" | "high"

export interface BusStop {
  id: string
  name: string
  lat: number
  lng: number
  routes: string[]
}

export interface BusRoute {
  id: string
  name: string
  number: string
  from: string
  to: string
  stops: string[]
  color: string
  frequency: string
  firstBus: string
  lastBus: string
}

export interface Bus {
  id: string
  routeId: string
  routeNumber: string
  lat: number
  lng: number
  speed: number
  heading: number
  crowdLevel: CrowdLevel
  nextStop: string
  eta: number // minutes
  driver: string
  plateNumber: string
  lastUpdated: Date
}

export const BUS_STOPS: BusStop[] = [
  { id: "s1", name: "Tirunelveli Junction", lat: 8.7284, lng: 77.7066, routes: ["1", "2", "5", "7", "12"] },
  { id: "s2", name: "Palayamkottai Bus Stand", lat: 8.7178, lng: 77.7260, routes: ["1", "3", "5", "8"] },
  { id: "s3", name: "Melapalayam", lat: 8.7380, lng: 77.6939, routes: ["2", "4", "7"] },
  { id: "s4", name: "NGO Colony", lat: 8.7105, lng: 77.7142, routes: ["3", "6", "9"] },
  { id: "s5", name: "Vannarpettai", lat: 8.7320, lng: 77.7155, routes: ["1", "4", "10"] },
  { id: "s6", name: "Thatchanallur", lat: 8.7450, lng: 77.7100, routes: ["2", "5", "8"] },
  { id: "s7", name: "High Ground", lat: 8.7220, lng: 77.7180, routes: ["6", "7", "12"] },
  { id: "s8", name: "Medical College", lat: 8.7150, lng: 77.7300, routes: ["3", "9", "10"] },
  { id: "s9", name: "Town Hall", lat: 8.7260, lng: 77.7100, routes: ["1", "2", "12"] },
  { id: "s10", name: "Maharaja Nagar", lat: 8.7080, lng: 77.7210, routes: ["4", "5", "11"] },
  { id: "s11", name: "Sarah Tucker College", lat: 8.7190, lng: 77.7150, routes: ["1", "6", "8"] },
  { id: "s12", name: "Krishnapuram", lat: 8.7400, lng: 77.7200, routes: ["7", "10", "11"] },
  { id: "s13", name: "Pettai", lat: 8.7350, lng: 77.7050, routes: ["2", "9", "12"] },
  { id: "s14", name: "Perumalpuram", lat: 8.7130, lng: 77.7050, routes: ["3", "4", "11"] },
  { id: "s15", name: "Murugankurichi", lat: 8.7050, lng: 77.7300, routes: ["5", "8", "10"] },
]

export const BUS_ROUTES: BusRoute[] = [
  {
    id: "r1", name: "Junction - Palayamkottai", number: "1",
    from: "Tirunelveli Junction", to: "Palayamkottai Bus Stand",
    stops: ["s1", "s9", "s11", "s5", "s2"],
    color: "#2563eb", frequency: "Every 10 min", firstBus: "5:30 AM", lastBus: "10:30 PM"
  },
  {
    id: "r2", name: "Junction - Melapalayam", number: "2",
    from: "Tirunelveli Junction", to: "Melapalayam",
    stops: ["s1", "s9", "s13", "s6", "s3"],
    color: "#059669", frequency: "Every 12 min", firstBus: "5:45 AM", lastBus: "10:00 PM"
  },
  {
    id: "r3", name: "Palayamkottai - NGO Colony", number: "3",
    from: "Palayamkottai Bus Stand", to: "NGO Colony",
    stops: ["s2", "s8", "s14", "s4"],
    color: "#dc2626", frequency: "Every 15 min", firstBus: "6:00 AM", lastBus: "9:30 PM"
  },
  {
    id: "r4", name: "Vannarpettai - Maharaja Nagar", number: "4",
    from: "Vannarpettai", to: "Maharaja Nagar",
    stops: ["s5", "s3", "s14", "s10"],
    color: "#d97706", frequency: "Every 20 min", firstBus: "6:00 AM", lastBus: "9:00 PM"
  },
  {
    id: "r5", name: "Junction - Murugankurichi", number: "5",
    from: "Tirunelveli Junction", to: "Murugankurichi",
    stops: ["s1", "s2", "s6", "s10", "s15"],
    color: "#7c3aed", frequency: "Every 15 min", firstBus: "5:30 AM", lastBus: "10:00 PM"
  },
  {
    id: "r6", name: "NGO Colony - High Ground", number: "6",
    from: "NGO Colony", to: "High Ground",
    stops: ["s4", "s11", "s7"],
    color: "#0891b2", frequency: "Every 18 min", firstBus: "6:15 AM", lastBus: "9:00 PM"
  },
  {
    id: "r7", name: "Junction - Krishnapuram", number: "7",
    from: "Tirunelveli Junction", to: "Krishnapuram",
    stops: ["s1", "s7", "s3", "s12"],
    color: "#be185d", frequency: "Every 20 min", firstBus: "6:00 AM", lastBus: "9:30 PM"
  },
  {
    id: "r8", name: "Palayamkottai - Thatchanallur", number: "8",
    from: "Palayamkottai Bus Stand", to: "Thatchanallur",
    stops: ["s2", "s11", "s15", "s6"],
    color: "#4f46e5", frequency: "Every 12 min", firstBus: "5:45 AM", lastBus: "10:00 PM"
  },
]

const CROWD_LEVELS: CrowdLevel[] = ["low", "medium", "high"]
const DRIVERS = ["Murugan K.", "Rajesh S.", "Suresh P.", "Kannan R.", "Vijay M.", "Senthil A."]

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export function generateBuses(): Bus[] {
  const buses: Bus[] = []
  BUS_ROUTES.forEach((route) => {
    const busCount = Math.floor(Math.random() * 2) + 2
    for (let i = 0; i < busCount; i++) {
      const stopIdx = Math.floor(Math.random() * route.stops.length)
      const stop = BUS_STOPS.find(s => s.id === route.stops[stopIdx])!
      buses.push({
        id: `b-${route.id}-${i}`,
        routeId: route.id,
        routeNumber: route.number,
        lat: stop.lat + randomBetween(-0.005, 0.005),
        lng: stop.lng + randomBetween(-0.005, 0.005),
        speed: Math.floor(randomBetween(15, 45)),
        heading: Math.floor(randomBetween(0, 360)),
        crowdLevel: CROWD_LEVELS[Math.floor(Math.random() * 3)],
        nextStop: BUS_STOPS.find(s => s.id === route.stops[Math.min(stopIdx + 1, route.stops.length - 1)])?.name || stop.name,
        eta: Math.floor(randomBetween(1, 20)),
        driver: DRIVERS[Math.floor(Math.random() * DRIVERS.length)],
        plateNumber: `TN 72 ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${1000 + Math.floor(Math.random() * 9000)}`,
        lastUpdated: new Date(),
      })
    }
  })
  return buses
}

export function getStopById(id: string): BusStop | undefined {
  return BUS_STOPS.find(s => s.id === id)
}

export function getRouteById(id: string): BusRoute | undefined {
  return BUS_ROUTES.find(r => r.id === id)
}

export function getRouteByNumber(num: string): BusRoute | undefined {
  return BUS_ROUTES.find(r => r.number === num)
}

export function getStopsForRoute(routeId: string): BusStop[] {
  const route = getRouteById(routeId)
  if (!route) return []
  return route.stops.map(sid => BUS_STOPS.find(s => s.id === sid)!).filter(Boolean)
}
