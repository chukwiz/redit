import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubreditValidator } from "@/lib/validators/subredit";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = SubreditValidator.parse(body);

    const subreditExists = await db.subredit.findFirst({
      where: {
        name,
      },
    });

    if (subreditExists) {
      return new Response("Subredit already exists", { status: 409 });
    }

    const subredit = await db.subredit.create({
        data: {
            name,
            creatorId: session.user.id
        }
    })

    db.subscription.create({
        data: {
            userId: session.user.id,
            subreditId: subredit.id
        }
    })

    return new Response(subredit.name)

  } catch (error) {
    if(error instanceof z.ZodError) {
        return new Response(error.message, {status: 422})
    }

    return new Response("could not create subredit", {status: 500})
  }
}
