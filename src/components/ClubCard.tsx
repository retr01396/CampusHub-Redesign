"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, ExternalLink, Lock } from "lucide-react";
import JoinClubButton from "./JoinClubButton";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ClubCardData {
  id: string;
  name: string;
  tagline: string | null;
  description: string;
  logoUrl: string | null;
  slug: string | null;
  memberCount: number;
  leaderName?: string | null;
  /** Whether the club is currently accepting new members. */
  recruitmentOpen?: boolean;
  /** When true, joining requires a reviewed application instead of instant join. */
  requiresApproval?: boolean;
}

interface ClubCardProps {
  club: ClubCardData;
  isJoined: boolean;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function ClubCard({ club, isJoined }: ClubCardProps) {
  // Live count that follows the optimistic join/leave toggle.
  const [memberCount, setMemberCount] = useState(club.memberCount);

  return (
    <div className="group bg-white border-2 border-slate-900 rounded-[15px_225px_15px_255px/255px_15px_225px_15px] p-6 shadow-[4px_4px_0px_0px_#1e293b] hover:-translate-y-1 flex flex-col h-full transition-transform relative">
      {/* Logo + Leader chip */}
      <div className="flex justify-between items-start mb-6">
        <div className="w-16 h-16 rounded-2xl bg-primary-container/10 flex items-center justify-center border border-primary/20 overflow-hidden">
          {club.logoUrl ? (
            <img
              src={club.logoUrl}
              alt={`${club.name} logo`}
              className="w-full h-full object-contain"
            />
          ) : (
            <Building2 size={24} className="text-primary" />
          )}
        </div>
        <span className="bg-surface-container-low text-secondary border border-slate-200 px-3 py-1 rounded-full text-label-mono font-label-mono">
          {club.leaderName
            ? club.leaderName.split(" ")[0].toUpperCase()
            : "CLUB"}
        </span>
      </div>

      {/* Name */}
      <h3 className="text-2xl font-marker text-slate-900 mb-2 group-hover:text-marker-blue transition-colors">
        {club.name}
      </h3>

      {/* Member count (live) */}
      <div className="flex items-center gap-2 mb-4">
        <Users size={16} className="text-muted" />
        <span className="text-body-md text-muted">
          {memberCount.toLocaleString()} Member{memberCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Description */}
      <p className="text-secondary text-body-md flex-grow mb-6">
        {club.tagline || club.description}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t-2 border-slate-900/10 mt-auto">
        <Link
          href={club.slug ? `/clubs/${club.slug}` : "#"}
          className="flex-grow bg-white border-2 border-slate-900 text-slate-900 font-bold py-2 rounded-full shadow-[2px_2px_0px_0px_#1e293b] hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2 font-marker text-sm"
        >
          View Profile
          <ExternalLink size={14} />
        </Link>
        {isJoined ? (
          <JoinClubButton
            clubId={club.id}
            isJoined
            size="sm"
            onToggle={(joined) =>
              setMemberCount((count) =>
                Math.max(0, count + (joined ? 1 : -1))
              )
            }
          />
        ) : club.recruitmentOpen === false ? (
          <button
            type="button"
            disabled
            title="This club is not accepting new members right now"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 text-slate-400 cursor-not-allowed"
          >
            <Lock size={14} />
            Closed
          </button>
        ) : club.requiresApproval ? (
          <Link
            href={club.slug ? `/clubs/${club.slug}` : "#"}
            title="This club reviews applications — apply from the club page"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
          >
            Apply to Join
          </Link>
        ) : (
          <JoinClubButton
            clubId={club.id}
            isJoined={false}
            size="sm"
            onToggle={(joined) =>
              setMemberCount((count) =>
                Math.max(0, count + (joined ? 1 : -1))
              )
            }
          />
        )}
      </div>
    </div>
  );
}
