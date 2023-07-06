import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { db } from "@/lib/db";
import PostFeed from "../PostFeed";
import { getAuthSession } from "@/lib/auth";

const CustomFeed = async () => {
  const session = await getAuthSession();

  const followedCommunities = await db.subscription.findMany({
    where: {
      userId: session?.user.id,
    },

    include: {
      subredit: true,
    },
  });

  const posts = await db.post.findMany({
    where: {
      subredit: {
        name: {
          in: followedCommunities.map(({ subredit }) => subredit.name),
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      author: true,
      comments: true,
      subredit: true,
      votes: true,
    },
    take: INFINITE_SCROLLING_PAGINATION_RESULTS
  });
  return <PostFeed initialPosts={posts} />;
};

export default CustomFeed;
