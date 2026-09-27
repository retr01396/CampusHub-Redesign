"use client"

import { ArrowRight, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ClubLogoMarquee, ClubNameMarquee } from "@/components/clubboard/marquees"
import { ScatteredHeroBackground } from "@/components/clubboard/scattered-hero-background"
import type { Club } from "@/generated/prisma/client"

interface HeroProps {
  clubs: Club[]
  onGetStarted: () => void
  onViewLeaderboard: () => void
}

export function Hero({ clubs, onGetStarted, onViewLeaderboard }: HeroProps) {
  return (
    <section className="relative dot-grid border-b-[3px] border-slate-900">
      <ScatteredHeroBackground clubs={clubs} />

      <div className="pointer-events-none relative z-10 mx-auto max-w-5xl px-4 pt-28 pb-24 text-center sm:px-6 sm:pt-40 sm:pb-32">

        <h1 className="pointer-events-none font-marker text-4xl font-bold leading-[1.15] text-slate-900 text-balance sm:text-6xl md:text-7xl">
          The Campus Whiteboard for <span className="text-marker-blue">Innovation</span> &{" "}
          <span className="text-marker-red">Events</span>
        </h1>

        <p className="pointer-events-none mx-auto mt-8 max-w-xl text-pretty text-lg text-slate-700 sm:text-xl">
          <span className="circle-highlight">Register for events, rack up club points, and lead the board.</span>
        </p>

        <div className="pointer-events-auto relative z-10 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            onClick={onGetStarted}
            className="group h-auto rounded-full border-2 border-slate-900 bg-marker-blue px-7 py-3 font-marker text-xl font-bold text-white shadow-[3px_3px_0px_0px_#1e293b] transition-transform hover:-translate-y-0.5 hover:bg-blue-600"
          >
            Explore Events
            <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            onClick={onViewLeaderboard}
            variant="outline"
            className="h-auto rounded-full border-2 border-slate-900 bg-white px-7 py-3 font-marker text-xl font-bold text-slate-900 shadow-[3px_3px_0px_0px_#1e293b] transition-transform hover:-translate-y-0.5 hover:bg-slate-100"
          >
            <Trophy className="mr-2 h-5 w-5 text-marker-green" strokeWidth={2.5} />
            View Leaderboard
          </Button>
        </div>
      </div>

      <div className="border-t-2 border-slate-900/10 bg-white/60 py-2">
        <ClubLogoMarquee clubs={clubs} />
      </div>
      <ClubNameMarquee clubs={clubs} />
    </section>
  )
}
