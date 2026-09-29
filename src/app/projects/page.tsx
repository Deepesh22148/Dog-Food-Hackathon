import React from "react";
import Link from "next/link";
import globalService from "@/service/globalService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  Filter,
  X,
  ExternalLink,
  Code2 as Github,
  FolderGit2,
  ChevronLeft,
  ChevronRight,
  Tag,
  Users,
  AlertCircle,
  Trophy,
} from "lucide-react";

interface Props {
  searchParams: Promise<{
    q?: string;
    hackathon?: string;
    track?: string;
    page?: string;
  }>;
}

interface HackathonFilter {
  id: string;
  title: string;
}

interface TrackFilter {
  id: string;
  name: string;
}

interface GalleryProject {
  id: string;
  title: string;
  description: string;
  repository_url?: string | null;
  demo_url?: string | null;
  team: {
    id: string;
    name: string;
  };
  hackathon: {
    id: string;
    title: string;
  };
  track?: {
    id: string;
    name: string;
  } | null;
}

interface PaginationData {
  total: number;
  page: number;
  total_pages: number;
  limit?: number;
}

interface GalleryResponseData {
  projects: GalleryProject[];
  pagination: PaginationData;
  filters: {
    hackathons: HackathonFilter[];
    tracks: TrackFilter[];
  };
}

const selectClass =
  "h-9 rounded-md border border-[#282828] bg-[#121212] px-3 py-1 text-xs text-[#EDEDED] outline-none transition-colors focus:border-[#555555]";

export default async function GalleryPage({ searchParams }: Props) {
  const sp = await searchParams;

  const result = await globalService.user.getGallery({
    q: sp.q,
    hackathon_id: sp.hackathon,
    track_id: sp.track,
    page: Number(sp.page) || 1,
  });

  if (!result?.success || !result?.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#121212] p-6 text-[#E0E0E0]">
        <Card className="w-full max-w-md border-[#282828] bg-[#181818] text-center text-[#E0E0E0]">
          <CardContent className="space-y-4 p-8">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-[#EDEDED]">
                Gallery Unavailable
              </h2>
              <p className="text-xs text-[#888888]">
                {result?.error?.message || "Failed to load project gallery data."}
              </p>
            </div>
            <Button
              
              variant="outline"
              size="sm"
              className="border-[#282828] bg-[#121212] text-xs text-[#EDEDED] hover:bg-[#282828]"
            >
              <Link href="/projects">Reload Gallery</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  const { projects = [], pagination = { total: 0, page: 1, total_pages: 1 }, filters = { hackathons: [], tracks: [] } } =
    result.data as GalleryResponseData;

  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (sp.q) params.set("q", sp.q);
    if (sp.hackathon) params.set("hackathon", sp.hackathon);
    if (sp.track) params.set("track", sp.track);
    params.set("page", String(page));
    return `/projects?${params.toString()}`;
  };

  const hasActiveFilters = Boolean(sp.q || sp.hackathon || sp.track);

  return (
    <div className="min-h-screen w-full bg-[#121212] p-4 sm:p-6 text-[#E0E0E0] antialiased">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <header className="border-b border-[#282828] pb-5">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-[#888888]" />
            <h1 className="text-2xl font-bold tracking-tight text-[#EDEDED]">
              Project Gallery
            </h1>
          </div>
          <p className="mt-1 text-xs text-[#888888]">
            Explore submitted projects, repositories, and demos across hackathons.
          </p>
        </header>

        {/* Filter Toolbar */}
        <Card className="border-[#282828] bg-[#181818] p-3.5 text-[#E0E0E0]">
          <form method="GET" className="flex flex-wrap items-center gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 min-w-50">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[#888888]" />
              <input
                name="q"
                defaultValue={sp.q ?? ""}
                placeholder="Search projects by keyword..."
                className="h-9 w-full rounded-md border border-[#282828] bg-[#121212] pl-8 pr-3 text-xs text-[#EDEDED] outline-none transition-colors placeholder:text-[#555555] focus:border-[#555555]"
              />
            </div>

            {/* Hackathon Select Filter */}
            <select
              name="hackathon"
              defaultValue={sp.hackathon ?? ""}
              className={selectClass}
            >
              <option value="">All Hackathons</option>
              {(filters.hackathons || []).map((h) => (
                <option key={h.id} value={h.id}>
                  {h.title}
                </option>
              ))}
            </select>

            {/* Track Select Filter (shown when a hackathon is selected) */}
            {sp.hackathon && (
              <select
                name="track"
                defaultValue={sp.track ?? ""}
                className={selectClass}
              >
                <option value="">All Tracks</option>
                {(filters.tracks || []).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              size="sm"
              className="h-9 bg-[#EDEDED] px-3.5 text-xs font-semibold text-[#121212] hover:bg-[#FFFFFF]"
            >
              <Filter className="mr-1.5 h-3.5 w-3.5" />
              Filter
            </Button>

            {/* Clear Filters Link */}
            {hasActiveFilters && (
              <Button
                
                variant="outline"
                size="sm"
                className="h-9 border-[#282828] bg-[#121212] px-3 text-xs text-[#888888] hover:bg-[#282828] hover:text-[#EDEDED]"
              >
                <Link href="/projects">
                  <X className="mr-1 h-3.5 w-3.5" />
                  Clear
                </Link>
              </Button>
            )}
          </form>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between text-xs text-[#888888]">
          <span>
            Showing <strong className="text-[#EDEDED]">{pagination.total}</strong>{" "}
            {pagination.total === 1 ? "project" : "projects"}
          </span>

          {pagination.total_pages > 1 && (
            <span>
              Page {pagination.page} of {pagination.total_pages}
            </span>
          )}
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card className="border-[#282828] bg-[#181818] text-[#E0E0E0]">
            <CardContent className="p-8 text-center space-y-2">
              <FolderGit2 className="mx-auto h-8 w-8 text-[#282828]" />
              <p className="text-xs font-medium text-[#EDEDED]">No Projects Found</p>
              <p className="text-xs text-[#888888]">
                Try adjusting your search query or clear active filters to discover projects.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <Card
                key={p.id}
                className="flex flex-col justify-between border-[#282828] bg-[#181818] text-[#E0E0E0]"
              >
                <div>
                  <CardHeader className="border-b border-[#282828] pb-3">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold text-[#EDEDED]">
                        {p.title}
                      </CardTitle>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#888888]">
                        {p.team?.name && (
                          <span className="inline-flex items-center gap-1">
                            <Users className="h-3 w-3 text-[#888888]" />
                            {p.team.name}
                          </span>
                        )}

                        {p.hackathon?.title && (
                          <>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1">
                              <Trophy className="h-3 w-3 text-[#888888]" />
                              {p.hackathon.title}
                            </span>
                          </>
                        )}

                        {p.track?.name && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-[#282828] bg-[#121212] px-2 py-0.5 text-[10px] text-[#888888]">
                            <Tag className="h-2.5 w-2.5" />
                            {p.track.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-3">
                    <p className="line-clamp-4 whitespace-pre-wrap text-xs leading-relaxed text-[#EDEDED]/90">
                      {p.description}
                    </p>
                  </CardContent>
                </div>

                {(p.repository_url || p.demo_url) && (
                  <div className="flex flex-wrap items-center gap-2 border-t border-[#282828] p-3.5 text-xs">
                    {p.repository_url && (
                      <a
                        href={p.repository_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#282828] bg-[#121212] px-2.5 py-1 text-[11px] text-[#EDEDED] transition-colors hover:bg-[#282828]"
                      >
                        <Github className="h-3.5 w-3.5" />
                        Repository
                      </a>
                    )}

                    {p.demo_url && (
                      <a
                        href={p.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-md border border-[#282828] bg-[#121212] px-2.5 py-1 text-[11px] text-[#EDEDED] transition-colors hover:bg-[#282828]"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Live Demo
                      </a>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {pagination.total_pages > 1 && (
          <div className="flex items-center justify-between border-t border-[#282828] pt-4 text-xs text-[#888888]">
            {pagination.page > 1 ? (
              <Button
                
                variant="outline"
                size="sm"
                className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] hover:bg-[#282828]"
              >
                <Link href={pageHref(pagination.page - 1)}>
                  <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                  Previous
                </Link>
              </Button>
            ) : (
              <div />
            )}

            <span>
              Page <strong className="text-[#EDEDED]">{pagination.page}</strong> of{" "}
              {pagination.total_pages}
            </span>

            {pagination.page < pagination.total_pages ? (
              <Button
                
                variant="outline"
                size="sm"
                className="border-[#282828] bg-[#181818] text-xs text-[#EDEDED] hover:bg-[#282828]"
              >
                <Link href={pageHref(pagination.page + 1)}>
                  Next
                  <ChevronRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            ) : (
              <div />
            )}
          </div>
        )}
      </div>
    </div>
  );
}