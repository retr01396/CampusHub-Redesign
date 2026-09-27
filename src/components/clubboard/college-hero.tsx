"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

export function CollegeHero() {
  const containerRef = useRef<HTMLElement>(null)
  const [opacity, setOpacity] = useState(0)
  const [scale, setScale] = useState(0.97)
  const [translateY, setTranslateY] = useState(10)

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const totalScroll = containerRef.current.offsetHeight - window.innerHeight
      if (totalScroll <= 0) return

      // Scrolled distance within this pinned section (0 to totalScroll)
      const scrolled = Math.max(0, Math.min(totalScroll, -rect.top))
      const progress = scrolled / totalScroll

      // Fade in smoothly from 0 -> 1 between progress 0.02 and 0.55
      const fadeProgress = Math.max(0, Math.min(1, (progress - 0.02) / 0.53))

      setOpacity(fadeProgress)
      setScale(0.97 + 0.03 * fadeProgress)
      setTranslateY(10 * (1 - fadeProgress))
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])

  return (
    <section
      ref={containerRef}
      aria-label="Christ College of Engineering Introduction"
      className="relative h-[160vh] w-full bg-slate-900 m-0 p-0"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* College Building Hero Photograph */}
        <div className="relative h-full w-full">
          <Image
            src="/images/college-hero.jpg"
            alt="Christ College of Engineering Campus Building - St. Mary's Block"
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_top] select-none pointer-events-none"
          />

          {/* Logo revealed in the red-circled sky area */}
          <div
            className="pointer-events-none absolute top-[8vh] sm:top-[10vh] md:top-[11vh] left-0 right-0 z-20 flex items-center justify-center px-4"
            style={{
              opacity,
              transform: `translateY(${translateY}px) scale(${scale})`,
              transition: "transform 0.08s ease-out, opacity 0.08s ease-out",
            }}
          >
            <div className="relative w-[84vw] max-w-[280px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[560px] aspect-[785/220]">
              <Image
                src="/images/christ-college-logo.png"
                alt="Christ College of Engineering (Autonomous) official emblem and logo"
                fill
                priority
                sizes="(max-width: 640px) 280px, (max-width: 768px) 420px, (max-width: 1024px) 500px, 560px"
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
