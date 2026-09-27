"use client"

import { useState, useEffect } from "react"
import { CollegeHero } from "@/components/clubboard/college-hero"
import { Hero } from "@/components/clubboard/hero"
import { EventsFeed } from "@/components/clubboard/events-feed"
import { Navbar } from "@/components/Navbar"
import type { Club, Event } from "@/generated/prisma/client"

type EventWithClub = Event & { club: Club }

interface HomePageClientProps {
  clubs: Club[]
  events: EventWithClub[]
  registeredEventIds: string[]
  savedEventIds: string[]
}

export function HomePageClient({ clubs, events, registeredEventIds, savedEventIds }: HomePageClientProps) {
  const [activeTab, setActiveTab] = useState<"hero" | "feed">("hero")
  const [user, setUser] = useState<any>(null)
  const [showNavbar, setShowNavbar] = useState(false)

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      // Navbar smoothly appears as user scrolls past the college hero intro
      setShowNavbar(window.scrollY > window.innerHeight * 0.45)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen relative">
      <div
        className={`transition-all duration-500 ${
          showNavbar
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <Navbar
          userRole={user?.role ?? null}
          userName={user?.name}
          userEmail={user?.email}
        />
      </div>

      <CollegeHero />

      <Hero 
        clubs={clubs}
        onGetStarted={() => {
          document.getElementById("events-feed")?.scrollIntoView({ behavior: "smooth" })
        }} 
        onViewLeaderboard={() => {
          window.location.href = "/leaderboard"
        }} 
      />
      <EventsFeed 
        events={events} 
        registeredEventIds={registeredEventIds}
        savedEventIds={savedEventIds}
      />
    </div>
  )
}
