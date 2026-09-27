import { getCurrentUser } from "@/lib/session";
import { displayTitle } from "@/lib/roles";
import { getClubBySlug } from "@/app/actions/unifiedActions";
import { getMyPendingMembershipClubIds } from "@/app/actions/clubActions";
import { notFound } from "next/navigation";
import Script from "next/script";
import { Navbar } from "@/components/Navbar";
import ClubProfileHeader, {
  type ClubHeaderData,
} from "@/components/clubs/ClubProfileHeader";
import PublicRoster from "@/components/clubs/PublicRoster";
import {
  Users,
  Crown,
  Building2,
  Globe,
  Github,
  Instagram,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Compute a live status badge for an event based on the current time.
 * Used to derive the "upcoming events" count in the header.
 */
function getEventStatus(event: {
  startTime: Date | string;
  endTime: Date | string | null;
}) {
  const now = new Date();
  const start = new Date(event.startTime);
  const end = event.endTime
    ? new Date(event.endTime)
    : new Date(start.getTime() + 1000 * 60 * 60 * 2);

  if (now < start) return "UPCOMING";
  if (now >= start && now <= end) return "LIVE NOW";
  return "ENDED";
}

export default async function ClubPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { slug } = await params;
  const { from } = await searchParams;
  const user = await getCurrentUser();
  const club = await getClubBySlug(slug);

  if (!club) {
    notFound();
  }

  // Draft / suspended clubs are not public. Only the club's own account or a
  // site admin may preview them directly.
  const canViewUnpublished =
    user?.role === "SUPER_ADMIN" ||
    (user?.role === "CLUB" && user.clubId === club.id);
  if (club.status !== "PUBLISHED" && !canViewUnpublished) {
    notFound();
  }

  // ── Team composition ──
  const executives = club.members.filter(
    (m) => m.isExecutive || (m.roleTitle && m.roleTitle !== "Member")
  );

  const upcomingCount = club.events.filter((e) => getEventStatus(e) !== "ENDED")
    .length;

  const isOpenForMembers =
    (club as any).recruitmentStatus === "OPEN_FOR_MEMBERS";
  const isMember = user
    ? club.members.some((m) => m.userId === user.id)
    : false;
  const pendingMembership = user
    ? await getMyPendingMembershipClubIds()
    : new Set<string>();
  const hasPendingApplication = pendingMembership.has(club.id);

  const isOnboardingPreview = from === "onboarding";

  const headerClub: ClubHeaderData = {
    ...club,
    coverUrl: club.coverUrl,
    category: club.category,
    customFormFields: (club as any).customFormFields ?? null,
    members: club.members.map((m) => ({ userId: m.userId })),
  };

  return (
    <div className="min-h-screen relative">
      {/* During onboarding, keep the student inside the flow — no app nav */}
      {!isOnboardingPreview && (
        <Navbar
          userRole={user ? (user.role as any) : null}
          userName={user?.name ?? undefined}
        />
      )}

      <ClubProfileHeader
        club={headerClub}
        isMember={isMember}
        isOpenForMembers={isOpenForMembers}
        hasPendingApplication={hasPendingApplication}
        upcomingCount={upcomingCount}
        activeTab="about"
        isOnboardingPreview={isOnboardingPreview}
      />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 mb-20 mt-6">
        {/* ══════ Tab: About ══════ */}
        <div className="tab-content animate-in active" id="tab-about">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left — About + Executive Board */}
            <div className="lg:col-span-2 space-y-8">
              {/* About / Mission */}
              <div className="bg-white rounded-2xl border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_#1e293b]">
                <h3 className="text-3xl font-marker text-slate-900 mb-4 tracking-tight">
                  About Us
                </h3>
                <div className="text-slate-600 font-medium leading-relaxed whitespace-pre-line text-sm">
                  {(club as any).about || club.description || (
                    <span className="italic text-muted/50">
                      No description provided.
                    </span>
                  )}
                </div>
              </div>

              {/* Executive Board */}
              {executives.length > 0 && (
                <div className="bg-white rounded-2xl border-2 border-slate-900 p-8 shadow-[4px_4px_0px_0px_#1e293b]">
                  <h3 className="font-marker text-2xl text-slate-900 mb-1 flex items-center gap-2">
                    <Crown className="w-6 h-6 text-marker-red" />
                    Leadership &amp; Core Team
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mb-6">
                    The executives steering {club.name}.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {executives.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-surface-container-low border border-border-subtle hover:border-amber-300/60 hover:shadow-sm transition-all"
                      >
                        <div className="w-11 h-11 rounded-full bg-amber-100 border-2 border-amber-200 flex items-center justify-center shrink-0 overflow-hidden">
                          {m.avatarUrl ? (
                            <img
                              src={m.avatarUrl}
                              alt={m.displayName || m.user?.name || "Member"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-amber-700 font-bold text-sm">
                              {(m.displayName || m.user?.name || "M")
                                .charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-on-surface truncate">
                            {m.displayName || m.user?.name || "Member"}
                          </p>
                          <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
                            {displayTitle(m)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right — Stats + Social */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_#1e293b]">
                <h4 className="font-marker text-xl text-slate-900 mb-4">Stats</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Total Members</span>
                    <span className="font-marker text-lg text-slate-900">
                      {club._count.members}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Total Events</span>
                    <span className="font-marker text-lg text-slate-900">
                      {club._count.events}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 font-medium">Executive Board</span>
                    <span className="font-marker text-lg text-slate-900">
                      {executives.length}
                    </span>
                  </div>
                </div>
              </div>

              {(club as any).website ||
              (club as any).github ||
              (club as any).instagram ||
              (club as any).discord ? (
                <div className="bg-white rounded-2xl border-2 border-slate-900 p-6 shadow-[4px_4px_0px_0px_#1e293b]">
                  <h4 className="font-marker text-xl text-slate-900 mb-4">
                    Connect
                  </h4>
                  <div className="space-y-1">
                    {(club as any).website && (
                      <a
                        href={(club as any).website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="w-4 h-4 text-secondary group-hover:text-primary" />
                          <span className="text-sm font-medium">Website</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                    {(club as any).github && (
                      <a
                        href={(club as any).github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Github className="w-4 h-4 text-secondary group-hover:text-primary" />
                          <span className="text-sm font-medium">GitHub</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                    {(club as any).instagram && (
                      <a
                        href={(club as any).instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <Instagram className="w-4 h-4 text-secondary group-hover:text-primary" />
                          <span className="text-sm font-medium">Instagram</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                    {(club as any).discord && (
                      <a
                        href={(club as any).discord}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-container-low transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <MessageCircle className="w-4 h-4 text-secondary group-hover:text-primary" />
                          <span className="text-sm font-medium">Discord</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-muted" />
                      </a>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* ══════ Tab: Members List ══════ */}
        <div className="tab-content animate-in" id="tab-members">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-marker text-slate-900 flex items-center gap-2">
                <Users className="w-6 h-6 text-marker-blue" strokeWidth={2.5} />
                Members
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {club._count.members} student
                {club._count.members !== 1 ? "s" : ""} in {club.name}
              </p>
            </div>
          </div>

          {club.members.length === 0 ? (
            <div className="text-center py-20 bg-surface rounded-2xl border border-border-subtle">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h4 className="text-lg font-bold text-on-surface mb-1">
                No Members Yet
              </h4>
              <p className="text-muted text-sm">
                This club has no members yet.
              </p>
            </div>
          ) : (
            <PublicRoster
              members={club.members as any}
              settings={(club as any).rosterSettings ?? null}
            />
          )}
        </div>
      </main>

      {/* ── Tab Switching Script (About / Members; Events & Feed are pages) ── */}
      <Script
        id="tab-switcher"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function () {
              function activate(id) {
                document.querySelectorAll('.tab-btn').forEach(function (b) {
                  b.classList.remove('active-tab');
                  b.classList.add('text-secondary');
                });
                document.querySelectorAll('.tab-content').forEach(function (c) {
                  c.classList.remove('active');
                });
                var btn = document.querySelector('.tab-btn[data-tab="' + id + '"]');
                if (btn) { btn.classList.add('active-tab'); btn.classList.remove('text-secondary'); }
                var content = document.getElementById('tab-' + id);
                if (content) {
                  content.classList.add('active');
                  content.style.animation = 'none';
                  void content.offsetHeight;
                  content.style.animation = null;
                }
              }
              document.querySelectorAll('.tab-btn').forEach(function (btn) {
                btn.addEventListener('click', function () {
                  activate(this.getAttribute('data-tab'));
                });
              });
              activate((window.location.hash || '').replace('#', '') === 'members' ? 'members' : 'about');
            })();
          `,
        }}
      />
    </div>
  );
}
