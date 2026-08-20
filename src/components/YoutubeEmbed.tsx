import { resolveWorkoutVideo, youtubeSearchUrl } from "../lib/youtube";

export function YoutubeEmbed({
  youtubeUrl,
  youtubeId,
  searchQuery,
  title,
}: {
  youtubeUrl?: string | null;
  youtubeId?: string | null;
  searchQuery: string;
  title: string;
}) {
  const video = resolveWorkoutVideo({ youtubeUrl, youtubeId, searchQuery });

  if (video.embedUrl) {
    return (
      <div className="overflow-hidden rounded-xl border border-line bg-ink">
        <div className="aspect-video">
          <iframe
            src={video.embedUrl}
            title={title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-3 py-2">
          <a
            href={video.url}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-accent hover:text-accent-2"
          >
            Open on YouTube
          </a>
          {/* Clips get deleted, go private, or have embedding turned off, and an
              iframe cannot tell us cross-origin when that happens. This keeps a
              dead video one tap from a working search instead of a dead end. */}
          <a
            href={youtubeSearchUrl(searchQuery)}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-mist hover:text-foam"
          >
            Not playing? Search YouTube
          </a>
        </div>
      </div>
    );
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink px-4 py-3 hover:border-accent/50"
    >
      <div>
        <p className="text-sm font-semibold">Watch form video</p>
        <p className="text-xs text-mist">Opens a YouTube search for {title}</p>
      </div>
      <span className="text-accent">▶</span>
    </a>
  );
}
