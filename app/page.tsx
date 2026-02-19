"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { MapView } from "@/components/map-view"
import { RoutesView } from "@/components/routes-view"
import { NearbyView } from "@/components/nearby-view"
import { AlertsView } from "@/components/alerts-view"
import { SettingsView } from "@/components/settings-view"

type Tab = "map" | "routes" | "nearby" | "alerts" | "settings"

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>("map")

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "map" && <MapView />}
      {activeTab === "routes" && <RoutesView />}
      {activeTab === "nearby" && <NearbyView />}
      {activeTab === "alerts" && <AlertsView />}
      {activeTab === "settings" && <SettingsView />}
    </AppShell>
  )
}
