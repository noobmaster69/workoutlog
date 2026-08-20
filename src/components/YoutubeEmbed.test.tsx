import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { YoutubeEmbed } from "./YoutubeEmbed";
import { youtubeSearchUrl } from "../lib/youtube";

describe("YoutubeEmbed", () => {
  // vitest is not configured with globals, so RTL's auto-cleanup never runs.
  afterEach(cleanup);

  it("always offers a search escape hatch beside an embedded clip", () => {
    render(<YoutubeEmbed youtubeId="lKLYvNGz6mk" searchQuery="romanian deadlift" title="Romanian deadlift" />);

    // The clip itself...
    expect(screen.getByTitle("Romanian deadlift")).toBeTruthy();
    // ...and a way out when the clip is dead, which an iframe cannot report.
    const fallback = screen.getByRole("link", { name: /Search YouTube/i });
    expect(fallback.getAttribute("href")).toBe(youtubeSearchUrl("romanian deadlift"));
  });

  it("falls back to a search link when no clip is known", () => {
    render(<YoutubeEmbed searchQuery="jefferson curl" title="Jefferson curl" />);
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe(youtubeSearchUrl("jefferson curl"));
  });
});
