import { beforeEach, describe, expect, it } from "vitest";
import { api } from "./api";
import { newLocalUser, saveLocalUsers } from "./localStore";

describe("local demo sign in", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("explains that no account exists in this browser yet", async () => {
    await expect(api.signInLocal("athlete@example.com", "secret123")).rejects.toThrow(
      /No account exists in this browser yet/,
    );
  });

  it("explains per-device storage when another account exists here", async () => {
    saveLocalUsers([newLocalUser("someone@example.com", "Someone", "hash")]);
    await expect(api.signInLocal("athlete@example.com", "secret123")).rejects.toThrow(
      /keeps accounts on the device that created them/,
    );
  });
});
