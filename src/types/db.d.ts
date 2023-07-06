import type { Comment, Post, Subredit, User, Vote } from "@prisma/client";

export type ExtendedPost = Post & {
    subredit: Subredit,
    votes: Vote[],
    author:User,
    comments:Comment[]
}