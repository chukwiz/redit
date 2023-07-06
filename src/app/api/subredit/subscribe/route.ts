import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { SubreditSubscriptionValidator } from "@/lib/validators/subredit";
import { z } from "zod";

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()
        if(!session?.user) {
            return new Response("Unauthorized", {status: 401})
        }

        const body = await req.json()
        const {subreditId} = SubreditSubscriptionValidator.parse(body)

        const isSubscribed = await db.subscription.findFirst({
            where: {
                subreditId,
                userId: session.user.id
            }
        })

        if (isSubscribed) {
            return new Response("You are already subscribed to this subredit", {status: 400})
        }

        await db.subscription.create({
            data: {
                subreditId,
                userId: session.user.id
            }
        })

        return new Response(subreditId, {status: 200})

    } catch (error) {
        if(error instanceof z.ZodError) {
            return new Response("Invalid Request data", {status: 422})
        }
    
        return new Response("could not subscribe", {status: 500})
    }
}
