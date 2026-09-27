import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { HomePageClient } from "@/components/clubboard/home-page-client";
import { getMyUpcomingEvents, getSavedEventIds } from "@/app/actions/unifiedActions";
import { clubs as fallbackClubs, events as fallbackEvents } from "@/lib/types";

export default async function Home() {
  let clubs: any[] = [];
  let events: any[] = [];
  let registeredEventIds: string[] = [];
  let savedIds: string[] = [];

  try {
    const dbClubs = await prisma.club.findMany();
    if (dbClubs && dbClubs.length > 0) {
      clubs = dbClubs;
    } else {
      clubs = fallbackClubs;
    }

    const dbEvents = await prisma.event.findMany({
      where: {
        startDate: {
          gte: new Date(),
        },
      },
      orderBy: {
        startDate: "asc",
      },
      include: {
        club: true,
      },
    });

    const mappedFallbackEvents = fallbackEvents.map((e) => {
      const club = fallbackClubs.find((c) => c.id === e.clubId) || { name: e.clubName, id: e.clubId, slug: e.clubId };
      return {
        ...e,
        club,
        startDate: new Date(),
        startTime: new Date(),
        location: e.venue,
        capacity: e.capacity || 100,
        pointsPerAttender: e.points || 10,
        registrationType: e.registrationType || "INTERNAL",
      };
    });

    if (dbEvents && dbEvents.length > 0) {
      events = dbEvents;
    } else {
      events = mappedFallbackEvents as any;
    }

    const myEvents = await getMyUpcomingEvents();
    savedIds = await getSavedEventIds();
    registeredEventIds = myEvents ? myEvents.map((e: any) => e.id) : [];
  } catch (error) {
    console.warn("[Home Page] Database offline or unseeded, using fallback campus data:", error);
    clubs = fallbackClubs;
    events = fallbackEvents.map((e) => {
      const club = fallbackClubs.find((c) => c.id === e.clubId) || { name: e.clubName, id: e.clubId, slug: e.clubId };
      return {
        ...e,
        club,
        startDate: new Date(),
        startTime: new Date(),
        location: e.venue,
        capacity: e.capacity || 100,
        pointsPerAttender: e.points || 10,
        registrationType: e.registrationType || "INTERNAL",
      };
    }) as any;
  }

  return (
    <Suspense fallback={null}>
      <HomePageClient 
        clubs={clubs} 
        events={events} 
        registeredEventIds={registeredEventIds}
        savedEventIds={savedIds}
      />
    </Suspense>
  );
}
