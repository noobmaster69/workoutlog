import { describe, expect, it } from "vitest";
import { EXERCISE_CATALOG, exercisesForBodyPart, exercisesForCardio, findExercise } from "./exercises";
import { defaultYoutubeUrl } from "./api";

describe("exercise catalog", () => {
  it("covers weights body parts and cardio types", () => {
    expect(exercisesForBodyPart("legs").length).toBeGreaterThan(0);
    expect(exercisesForBodyPart("upper_body").length).toBeGreaterThan(0);
    expect(exercisesForBodyPart("core").length).toBeGreaterThan(0);
    expect(exercisesForCardio("running").length).toBeGreaterThan(0);
    expect(EXERCISE_CATALOG.every((ex) => Boolean(ex.searchQuery))).toBe(true);
  });

  it("resolves a youtube url for catalog and custom names", () => {
    const squat = findExercise("Barbell back squat");
    expect(squat).toBeTruthy();
    expect(defaultYoutubeUrl("Barbell back squat")).toContain("youtube.com");
    expect(defaultYoutubeUrl("Jefferson curl")).toContain("search_query=");
  });
});
