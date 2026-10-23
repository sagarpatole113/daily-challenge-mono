import { describe, expect, it } from "vitest";
import { loginSchema, signupSchema } from "@/lib/auth-schemas";

describe("auth form schemas", () => {
  it("accepts a valid signup and normalises the username", () => {
    const r = signupSchema.safeParse({ name: "  Sagar P ", username: "Sagar_P", password: "secret1", confirmPassword: "secret1" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data).toMatchObject({ name: "Sagar P", username: "sagar_p" });
  });
  it("rejects mismatched passwords, short passwords and bad usernames", () => {
    const base = { name: "Sagar", username: "sagar", password: "secret1", confirmPassword: "secret1" };
    expect(signupSchema.safeParse({ ...base, confirmPassword: "nope" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, password: "123", confirmPassword: "123" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, username: "1sagar" }).success).toBe(false);
    expect(signupSchema.safeParse({ ...base, name: "S" }).success).toBe(false);
  });
  it("login only requires both fields", () => {
    expect(loginSchema.safeParse({ username: "a", password: "b" }).success).toBe(true);
    expect(loginSchema.safeParse({ username: "", password: "b" }).success).toBe(false);
  });
});
