import type { FieldErrors, FieldValues, Resolver } from "react-hook-form";
import type { z } from "zod";

/** Minimal Zod -> React Hook Form resolver (avoids an extra dependency). */
export function zodResolver<TValues extends FieldValues>(schema: z.ZodType<TValues>): Resolver<TValues> {
  return async (values) => {
    const parsed = schema.safeParse(values);
    if (parsed.success) return { values: parsed.data, errors: {} };
    const errors: Record<string, { type: string; message: string }> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path.join(".");
      if (key && !errors[key]) errors[key] = { type: issue.code, message: issue.message };
    }
    return { values: {}, errors: errors as unknown as FieldErrors<TValues> };
  };
}
