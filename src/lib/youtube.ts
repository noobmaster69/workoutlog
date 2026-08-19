const WATCH = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/;
const BARE_ID = /^[A-Za-z0-9_-]{11}$/;

export function youtubeSearchUrl(query: string): string {
  const q = query.trim() || "workout form";
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${q} proper form`)}`;
}

export function extractYoutubeId(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (BARE_ID.test(trimmed)) return trimmed;
  const match = trimmed.match(WATCH);
  return match?.[1] ?? null;
}

export function youtubeWatchUrl(idOrUrl: string): string {
  const id = extractYoutubeId(idOrUrl);
  if (id) return `https://www.youtube.com/watch?v=${id}`;
  if (idOrUrl.startsWith("http")) return idOrUrl;
  return youtubeSearchUrl(idOrUrl);
}

export function youtubeEmbedUrl(idOrUrl: string): string | null {
  const id = extractYoutubeId(idOrUrl);
  return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
}

export function youtubeThumbUrl(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export function resolveWorkoutVideo(options: {
  youtubeUrl?: string | null;
  youtubeId?: string | null;
  searchQuery: string;
}): { url: string; embedUrl: string | null; thumbUrl: string | null } {
  const fromUser = options.youtubeUrl?.trim();
  const id = extractYoutubeId(fromUser) ?? options.youtubeId ?? null;
  if (id) {
    return {
      url: `https://www.youtube.com/watch?v=${id}`,
      embedUrl: youtubeEmbedUrl(id),
      thumbUrl: youtubeThumbUrl(id),
    };
  }
  if (fromUser?.startsWith("http")) {
    return { url: fromUser, embedUrl: null, thumbUrl: null };
  }
  return {
    url: youtubeSearchUrl(options.searchQuery),
    embedUrl: null,
    thumbUrl: null,
  };
}
