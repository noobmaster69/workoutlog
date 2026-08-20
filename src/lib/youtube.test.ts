import { describe, expect, it } from "vitest";
import {
  extractYoutubeId,
  resolveWorkoutVideo,
  youtubeEmbedUrl,
  youtubeSearchUrl,
} from "../lib/youtube";

describe("youtube helpers", () => {
  it("extracts ids from common url shapes", () => {
    expect(extractYoutubeId("dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYoutubeId("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYoutubeId("https://youtu.be/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
    expect(extractYoutubeId("https://www.youtube.com/embed/dQw4w9WgXcQ")).toBe("dQw4w9WgXcQ");
  });

  it("ignores the tracking parameters on a copied share link", () => {
    // Exactly what the YouTube share button hands you.
    expect(extractYoutubeId("https://youtu.be/7j-2w4-P14I?is=UdXoQlnMVVeRnVXC")).toBe("7j-2w4-P14I");
    expect(extractYoutubeId("https://www.youtube.com/watch?v=7j-2w4-P14I&t=42s")).toBe("7j-2w4-P14I");
  });

  it("builds a form-video search url when no clip is known", () => {
    const video = resolveWorkoutVideo({ searchQuery: "goblet squat" });
    expect(video.url).toBe(youtubeSearchUrl("goblet squat"));
    expect(video.embedUrl).toBeNull();
  });

  it("prefers an explicit youtube link for embeds", () => {
    const video = resolveWorkoutVideo({
      youtubeUrl: "https://youtu.be/rT7DgCr-3pg",
      searchQuery: "bench press",
    });
    expect(video.embedUrl).toBe(youtubeEmbedUrl("rT7DgCr-3pg"));
  });
});
