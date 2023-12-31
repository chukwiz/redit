import MiniCreatePost from "@/components/MiniCreatePost";
import PostFeed from "@/components/PostFeed";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";

interface pageProps {
  params: {
    slug: string;
  };
}

const page = async ({ params }: pageProps) => {
  const { slug } = params;
  const session = await getAuthSession();

  const subredit = await db.subredit.findFirst({
    where: {
      name: slug,
    },
    include: {
      posts: {
        include: {
          author: true,
          comments: true,
          votes: true,
          subredit: true,
        },
        orderBy: {
          createdAt: "desc"
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  if (!subredit) {
    return notFound();
  }

  return (
    <>
      <h1 className=" font-bold text-3xl md:text-4xl h-14">
        r/{subredit.name}
      </h1>
      <MiniCreatePost session={session} />
      <PostFeed initialPosts={subredit.posts} subreditName={subredit.name} />
    </>
  );
};

export default page;
