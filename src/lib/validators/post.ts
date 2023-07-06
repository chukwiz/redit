import { z } from "zod";

export const PostValidator = z.object({
  title: z
    .string()
    .min(3, { message: "Title must be more than 3 characters" })
    .max(128, { message: "Title must not be more than 128 characters" }),
  subreditId: z.string(),
  content: z.any()
});

export type PostCreationRequest = z.infer<typeof PostValidator>