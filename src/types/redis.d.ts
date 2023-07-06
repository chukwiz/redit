import { VoteType } from "@prisma/client"

export type CachedPost = {
    id: string
    title: string
    authorUsername: string
    content: any
    currentVote: VoteType | null
    createdAt: Date
}