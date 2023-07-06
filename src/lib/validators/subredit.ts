import { z } from "zod";

export const SubreditValidator = z.object({
    name: z.string().min(3).max(21)
})

export const SubreditSubscriptionValidator = z.object({
    subreditId: z.string()
})

export type CreateSubreditPayload = z.infer<typeof SubreditValidator>
export type SubscribeToSubreditPayload = z.infer<typeof SubreditSubscriptionValidator>