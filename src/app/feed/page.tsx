import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/session"
import PostCard from "@/components/feed/PostCard"
import ClubFilterSelect from "@/components/feed/ClubFilterSelect"
import { Navbar } from "@/components/Navbar"
import { PostType } from "@/generated/prisma/enums"
import Link from "next/link"

export default async function PublicFeedPage(props: {
  searchParams: Promise<{ category?: string; clubId?: string }>
}) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser()
  const currentUserId = user?.id

  const categoryFilter = searchParams.category as PostType | undefined
  const clubFilter = searchParams.clubId

  const buildFilterUrl = (category: string | null) => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (clubFilter) params.set("clubId", clubFilter);
    return `/feed${params.toString() ? `?${params.toString()}` : ""}`;
  };

  // Fetch Clubs for the filter dropdown (published clubs only)
  const clubs = await prisma.club.findMany({
    where: { status: "PUBLISHED", suspended: false },
    select: { id: true, name: true }
  })

  // Fetch Posts based on filters (from published clubs only)
  const posts = await prisma.clubPost.findMany({
    where: {
      ...(categoryFilter ? { postType: categoryFilter } : {}),
      ...(clubFilter ? { clubId: clubFilter } : {}),
      club: { status: "PUBLISHED", suspended: false }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      club: {
        select: { name: true, logoUrl: true }
      },
      event: {
        select: { id: true, title: true, startDate: true }
      },
      likes: {
        select: { id: true }
      },
      taggedUsers: {
        include: {
          user: {
            select: { name: true, department: true }
          }
        }
      }
    }
  })

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md">
      <Navbar
        userRole={user ? (user.role as any) : null}
        userName={user?.name ?? undefined}
        userEmail={user?.email ?? undefined}
      />
      
      <main className="max-w-container-max mx-auto px-4 md:px-margin-page pt-28 pb-20">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-headline-lg font-headline-lg text-on-surface mb-2">Club Feed</h1>
            <p className="text-secondary text-body-lg">Discover updates, events, and highlights from clubs across the campus.</p>
          </div>

          {/* Filters */}
          <div className="bg-surface-container-low p-4 rounded-2xl shadow-sm border border-outline-variant mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex overflow-x-auto pb-2 sm:pb-0 hide-scrollbar space-x-2">
              <Link 
                href={buildFilterUrl(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${!categoryFilter ? 'bg-primary text-white shadow-sm border border-primary' : 'bg-white text-secondary hover:text-on-surface border border-slate-200'}`}
              >
                All Posts
              </Link>
              <Link 
                href={buildFilterUrl("CONGRATULATIONS")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === 'CONGRATULATIONS' ? 'bg-primary text-white shadow-sm border border-primary' : 'bg-white text-secondary hover:text-on-surface border border-slate-200'}`}
              >
                Winner Highlights
              </Link>
              <Link 
                href={buildFilterUrl("EVENT_RECAP")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === 'EVENT_RECAP' ? 'bg-primary text-white shadow-sm border border-primary' : 'bg-white text-secondary hover:text-on-surface border border-slate-200'}`}
              >
                Event Recaps
              </Link>
              <Link 
                href={buildFilterUrl("ANNOUNCEMENT")}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoryFilter === 'ANNOUNCEMENT' ? 'bg-primary text-white shadow-sm border border-primary' : 'bg-white text-secondary hover:text-on-surface border border-slate-200'}`}
              >
                Announcements
              </Link>
            </div>

            <div className="min-w-[200px]">
              <ClubFilterSelect 
                clubs={clubs} 
                categoryFilter={categoryFilter} 
                defaultValue={clubFilter || ''} 
              />
            </div>
          </div>

          {/* Feed List */}
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="text-center py-20 bg-surface-container-low rounded-2xl border border-outline-variant shadow-sm">
                <div className="text-muted mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-on-surface">No posts found</h3>
                <p className="text-muted mt-1">Check back later for new updates.</p>
              </div>
            ) : (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  currentUserId={currentUserId} 
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
