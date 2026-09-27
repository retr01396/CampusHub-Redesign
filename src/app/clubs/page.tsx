import { Navbar } from "@/components/Navbar";
import { getCurrentUser } from "@/lib/session";
import { getMyMembershipClubIds } from "@/app/actions/clubActions";
import ClubCard from "@/components/ClubCard";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  Search,
  Grid3X3,
  List,
  SlidersHorizontal,
} from "lucide-react";

export default async function PublicClubsPage() {
  const user = await getCurrentUser();
  
  const [professionalBodies, generalClubs, joinedIds] = await Promise.all([
    prisma.club.findMany({
      where: { category: 'PROFESSIONAL_BODY', status: 'PUBLISHED', suspended: false },
      include: {
        members: { where: { status: "APPROVED" }, include: { user: true } },
        _count: { select: { members: { where: { status: "APPROVED" } } } },
      },
      orderBy: { members: { _count: 'desc' } }
    }),
    prisma.club.findMany({
      where: { category: 'GENERAL', status: 'PUBLISHED', suspended: false },
      include: {
        members: { where: { status: "APPROVED" }, include: { user: true } },
        _count: { select: { members: { where: { status: "APPROVED" } } } },
      },
      orderBy: { members: { _count: 'desc' } }
    }),
    getMyMembershipClubIds(),
  ]);

  return (
    <div className="min-h-screen relative">
      <Navbar
        userRole={
          user
            ? (user.role as any)
            : null
        }
        userName={user?.name ?? undefined}
      />

      <main className="max-w-container-max mx-auto px-4 md:px-margin-page pt-28 pb-20">
        {/* ── Header ── */}
        <section className="mb-10">
          <h1 className="font-marker text-5xl sm:text-6xl text-slate-900 mb-4 tracking-tight">
            Browse Clubs
          </h1>
          <p className="text-slate-600 font-medium text-lg max-w-2xl mb-8">
            Discover communities that match your passion, from technical
            engineering guilds to creative arts collectives.
          </p>

          {/* Search & Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-xl">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                placeholder="Search by name, category, or interest..."
                className="w-full pl-12 pr-4 py-4 rounded-full border-2 border-slate-900 focus:outline-none focus:ring-4 focus:ring-marker-blue/20 bg-white shadow-[4px_4px_0px_0px_#1e293b] transition-all text-lg font-medium text-slate-900 placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
              {/* View Switcher */}
              <div className="bg-surface-container-high p-1 rounded-xl flex items-center shadow-inner border border-outline-variant">
                <button className="p-2 rounded-lg transition-all bg-white shadow-sm flex items-center justify-center">
                  <Grid3X3 size={18} className="text-on-surface-variant" />
                </button>
                <button className="p-2 rounded-lg transition-all flex items-center justify-center">
                  <List size={18} className="text-on-surface-variant" />
                </button>
              </div>
              <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-3 rounded-2xl shadow-sm hover:bg-surface-container-low transition-colors font-body-md">
                <SlidersHorizontal size={20} />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </section>

        {/* ── Category Quick Chips ── */}
        <div className="flex flex-wrap gap-3 mb-12">
          <span className="bg-marker-blue text-white px-5 py-2 rounded-full font-marker text-sm border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b]">
            All Clubs
          </span>
          <span className="bg-white text-slate-700 hover:-translate-y-0.5 px-5 py-2 rounded-full font-marker text-sm border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b] transition-transform cursor-pointer">
            Design
          </span>
          <span className="bg-white text-slate-700 hover:-translate-y-0.5 px-5 py-2 rounded-full font-marker text-sm border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b] transition-transform cursor-pointer">
            AI &amp; ML
          </span>
          <span className="bg-white text-slate-700 hover:-translate-y-0.5 px-5 py-2 rounded-full font-marker text-sm border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b] transition-transform cursor-pointer">
            Entrepreneurship
          </span>
          <span className="bg-white text-slate-700 hover:-translate-y-0.5 px-5 py-2 rounded-full font-marker text-sm border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b] transition-transform cursor-pointer">
            Robotics
          </span>
          <span className="bg-white text-slate-700 hover:-translate-y-0.5 px-5 py-2 rounded-full font-marker text-sm border-2 border-slate-900 shadow-[2px_2px_0px_0px_#1e293b] transition-transform cursor-pointer">
            Music
          </span>
        </div>

        {/* ── Professional Bodies Section ── */}
        <section className="mb-16">
          <h2 className="font-marker text-3xl text-slate-900 mb-8 flex items-center gap-3">
            <Building2 className="text-marker-blue w-8 h-8" strokeWidth={2.5} />
            Professional Bodies & Technical Chapters
          </h2>
          
          {professionalBodies.length === 0 ? (
            <div className="text-center py-12 bg-surface-container-low rounded-2xl">
              <p className="text-muted">No professional bodies have been established yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {professionalBodies.map((club) => (
                <ClubCard
                  key={club.id}
                  club={{
                    id: club.id,
                    name: club.name,
                    tagline: club.tagline,
                    description: club.description,
                    logoUrl: club.logoUrl,
                    slug: club.slug ?? club.id,
                    memberCount: club._count.members,
                    leaderName: club.members[0]?.user?.name ?? null,
                    recruitmentOpen: club.recruitmentStatus === "OPEN_FOR_MEMBERS",
                    requiresApproval: club.membershipRequiresApproval,
                  }}
                  isJoined={joinedIds.has(club.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── General Clubs Section ── */}
        <section>
          <h2 className="font-marker text-3xl text-slate-900 mb-8">
            Student Interest Clubs
          </h2>

          {generalClubs.length === 0 ? (
            <div className="text-center py-24">
              <Building2 size={64} className="mx-auto text-muted mb-4" />
              <h2 className="text-xl font-bold text-on-surface mb-2">No clubs yet</h2>
              <p className="text-sm text-muted">
                Clubs will appear here once they&apos;re created by the admin.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all">
                {generalClubs.map((club) => (
                  <ClubCard
                    key={club.id}
                    club={{
                      id: club.id,
                      name: club.name,
                      tagline: club.tagline,
                      description: club.description,
                      logoUrl: club.logoUrl,
                      slug: club.slug ?? club.id,
                      memberCount: club._count.members,
                      leaderName: club.members[0]?.user?.name ?? null,
                      recruitmentOpen: club.recruitmentStatus === "OPEN_FOR_MEMBERS",
                      requiresApproval: club.membershipRequiresApproval,
                    }}
                    isJoined={joinedIds.has(club.id)}
                  />
                ))}
              </div>

              {/* Load More */}
              <div className="mt-12 flex justify-center">
                <Link
                  href="/clubs"
                  className="bg-white border border-slate-200 text-on-surface font-bold px-8 py-3 rounded-2xl shadow-sm hover:shadow-md hover:bg-surface-container-low transition-all"
                >
                  Load More Clubs
                </Link>
              </div>
            </>
          )}
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="w-full py-12 px-margin-page mt-20 flex flex-col md:flex-row justify-between items-center gap-4 border-t-4 border-slate-900 bg-white">
        <div className="flex flex-col items-center md:items-start gap-2">
          <span className="font-marker text-3xl font-black text-slate-900">
            campushub
          </span>
          <p className="text-slate-600 font-medium">
            &copy; 2026 campushub. Built for builders.
          </p>
        </div>
        <div className="flex gap-8">
          {["Privacy", "Terms", "Support", "Twitter", "GitHub"].map((link) => (
            <a
              key={link}
              href="#"
              className="text-slate-600 hover:text-marker-blue font-bold transition-colors font-marker"
            >
              {link}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
