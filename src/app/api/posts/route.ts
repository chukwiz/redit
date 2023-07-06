import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunitiesIds: string[] = [];

  if (session) {
    const followedCommunities = await db.subscription.findMany({
      where: {
        userId: session.user.id,
      },

      include: {
        subredit: true,
      },
    });

    followedCommunitiesIds = followedCommunities.map(
      ({ subredit }) => subredit.id
    );
  }

  try {
    const { limit, page, subreditName } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subreditName: z.string().nullish().optional(),
      })
      .parse({
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
        subreditName: url.searchParams.get("subreditName"),
      });

    let whereClause = {};

    if (subreditName) {
      whereClause = {
        subredit: {
          name: subreditName,
        },
      };
    } else if (session) {
      whereClause = {
        subredit: {
          id: {
            in: followedCommunitiesIds,
          },
        },
      };
    }

    const posts = await db.post.findMany({
        take: parseInt(limit),
        skip: (parseInt(page) - 1) * parseInt(limit),
        orderBy: {
            createdAt: "desc"
        },
        include: {
            author: true,
            comments: true,
            subredit: true,
            votes: true
        },
        where: whereClause
    })

    return new Response(JSON.stringify(posts))
  } catch (error) {
    if(error instanceof z.ZodError) {
      return new Response("Invalid Request data passed", {status: 422})
  }

  return new Response("could not fetch more posts", {status: 500})
  }
}
