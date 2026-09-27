"use client"

import Image from "next/image"
import type { Club } from "@/generated/prisma/client"
import { markerBgSoft } from "@/lib/marker-colors"
import { cn } from "@/lib/utils"

type MarkerColor = "blue" | "red" | "green"

const colorCycle: MarkerColor[] = ["blue", "green", "red"]

function getShortName(name: string): string {
  const words = name.split(/\s+/)
  if (words.length > 1) return words.map(w => w[0]).join("").toUpperCase().slice(0, 4)
  return name.slice(0, 4).toUpperCase()
}

function getColor(index: number): MarkerColor {
  return colorCycle[index % colorCycle.length]
}

function ClubStamp({ club, index }: { club: Club; index: number }) {
  const shortName = getShortName(club.name)
  const color = getColor(index)
  return (
    <div
      className={cn(
        "group mx-4 flex shrink-0 items-center gap-3 rounded-full border-2 border-slate-900 px-4 py-2.5 shadow-[2px_2px_0px_0px_#1e293b] transition-transform hover:-translate-y-1 hover:rotate-1",
        markerBgSoft[color],
      )}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        <Image
          src={club.logoUrl || "/placeholder.svg"}
          alt={`${club.name} logo`}
          fill
          sizes="40px"
          className="object-contain p-1"
          crossOrigin="anonymous"
        />
      </span>
      <div className="pr-1">
        <p className="font-marker text-base leading-none text-slate-800">{shortName}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{club.category}</p>
      </div>
    </div>
  )
}

export function ClubLogoMarquee({ clubs }: { clubs: Club[] }) {
  if (!clubs.length) return null
  const doubled = [...clubs, ...clubs]
  return (
    <div className="relative overflow-hidden py-4" role="presentation">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent" />
      <div className="marquee-track" style={{ animationDuration: "38s" }}>
        {doubled.map((club, i) => (
          <ClubStamp key={`${club.id}-${i}`} club={club} index={i % clubs.length} />
        ))}
      </div>
    </div>
  )
}

function ClubNameTile({ club, index }: { club: Club; index: number }) {
  const color = getColor(index)
  return (
    <div
      className={cn(
        "group mx-4 flex shrink-0 items-center gap-3 rounded-full border-2 border-slate-900 px-4 py-2.5 shadow-[2px_2px_0px_0px_#1e293b] transition-transform hover:-translate-y-1 hover:rotate-1",
        markerBgSoft[color],
      )}
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-slate-900 bg-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
        <Image
          src={club.logoUrl || "/placeholder.svg"}
          alt={`${club.name} logo`}
          fill
          sizes="40px"
          className="object-contain p-1"
          crossOrigin="anonymous"
        />
      </span>
      <div className="pr-1">
        <p className="font-marker text-base leading-none text-slate-800">{club.name}</p>
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500">{club.category}</p>
      </div>
    </div>
  )
}

export function ClubNameMarquee({ clubs }: { clubs: Club[] }) {
  if (!clubs.length) return null
  const doubled = [...clubs, ...clubs]
  return (
    <div className="relative overflow-hidden py-4" role="presentation">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-slate-50 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-slate-50 to-transparent" />
      <div className="marquee-track-reverse" style={{ animationDuration: "32s" }}>
        {doubled.map((club, i) => (
          <ClubNameTile key={`${club.id}-${i}`} club={club} index={i % clubs.length} />
        ))}
      </div>
    </div>
  )
}
