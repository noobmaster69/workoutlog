import { describe, expect, it } from "vitest";
import { ApiError, describeError, isClockSkewError } from "./errors";

describe("clock skew detection", () => {
  it("recognises PGRST303 by code", () => {
    expect(isClockSkewError(new ApiError("JWT issued at future", "PGRST303"))).toBe(true);
  });

  it("recognises it by message when the code is lost in transit", () => {
    expect(isClockSkewError(new Error("JWT issued at future"))).toBe(true);
    expect(isClockSkewError(new Error("jwt issued at future"))).toBe(true);
  });

  it("does not swallow real failures", () => {
    expect(isClockSkewError(new ApiError("permission denied for table goals", "42501"))).toBe(false);
    expect(isClockSkewError(new Error("Could not load workouts."))).toBe(false);
    expect(isClockSkewError(null)).toBe(false);
  });

  it("explains skew in plain language, and passes other errors through", () => {
    expect(describeError(new ApiError("JWT issued at future", "PGRST303"))).toMatch(/clocks disagree/);
    expect(describeError(new Error("Could not load workouts."))).toBe("Could not load workouts.");
    expect(describeError(null)).toBe("Something went wrong.");
  });
});
