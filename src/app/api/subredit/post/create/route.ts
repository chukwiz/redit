import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { subreditId, title, content } = PostValidator.parse(body);

    const isSubscribed = await db.subscription.findFirst({
      where: {
        userId: session.user.id,
        subreditId,
      },
    });

    if (!isSubscribed) {
      return new Response("Subscribe to make a post", {
        status: 400,
      });
    }

    await db.post.create({
      data: {
        title,
        content,
        subreditId,
        authorId: session.user.id,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid post data passes", { status: 422 });
    }

    return new Response(
      "could not post to subredit at this time, please try again later",
      { status: 500 }
    );
  }
}
