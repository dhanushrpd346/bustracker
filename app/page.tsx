"use client"

import { useState } from "react"
import { AppShell } from "@/components/app-shell"
import { MapView } from "@/components/map-view"
import { RoutesView } from "@/components/routes-view"
import { NearbyView } from "@/components/nearby-view"
import { AlertsView } from "@/components/alerts-view"
import { SettingsView } from "@/components/settings-view"
import { ProfileView } from "@/components/profile-view"

type Tab = "map" | "routes" | "nearby" | "alerts" | "settings"

export default function Page() {
  const [activeTab, setActiveTab] = useState<Tab>("map")
  const [showProfile, setShowProfile] = useState(false)

  return (
    <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "map" && <MapView onProfileClick={() => setShowProfile(true)} />}
      {activeTab === "routes" && <RoutesView />}
      {activeTab === "nearby" && <NearbyView />}
      {activeTab === "alerts" && <AlertsView />}
      {activeTab === "settings" && <SettingsView />}
      {showProfile && <ProfileView onClose={() => setShowProfile(false)} />}
    </AppShell>
  )
}
