import { describe, expect, it } from "vitest";
import { friendlyAuthError, isValidUsername, normalizeUsername, usernameToEmail } from "@/lib/auth";

describe("username auth (must match mobile/src/services/firebase.ts)", () => {
  it("maps usernames to the same synthetic email the mobile app uses", () => {
    expect(usernameToEmail("rahul_k", "mpscdaily.local")).toBe("rahul_k@mpscdaily.local");
    expect(usernameToEmail("  Rahul_K  ", "mpscdaily.local")).toBe("rahul_k@mpscdaily.local");
    expect(normalizeUsername(" ABC ")).toBe("abc");
  });
  it("uses the same username rule as the mobile app and the API", () => {
    for (const ok of ["abc", "rahul_k", "a_1", "a".repeat(20), "Rahul_K"]) expect(isValidUsername(ok)).toBe(true);
    for (const bad of ["ab", "1abc", "_abc", "a".repeat(21), "ra hul", "rahul-k", "राहुल", ""]) {
      expect(isValidUsername(bad)).toBe(false);
    }
  });
  it("translates Firebase error codes to plain language", () => {
    expect(friendlyAuthError({ code: "auth/invalid-credential" }).message).toBe("Incorrect username or password.");
    expect(friendlyAuthError({ code: "auth/email-already-in-use" }).message).toBe("That username is already taken.");
    expect(friendlyAuthError({ code: "weird" }).message).toBe("Something went wrong. Try again.");
  });
});
