import { resolveWorkoutVideo } from "../lib/youtube";

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
        <a
          href={video.url}
          target="_blank"
          rel="noreferrer"
          className="block px-3 py-2 text-xs text-gold hover:text-gold-2"
        >
          Open on YouTube
        </a>
      </div>
    );
  }

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center justify-between gap-3 rounded-xl border border-line bg-ink px-4 py-3 hover:border-gold/50"
    >
      <div>
        <p className="text-sm font-semibold">Watch form video</p>
        <p className="text-xs text-mist">Opens a YouTube search for {title}</p>
      </div>
      <span className="text-gold">▶</span>
    </a>
  );
}
