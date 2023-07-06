import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { FC } from "react";
import PostComment from "./comments/PostComment";
import CreateComment from "./CreateComment";

interface CommentsSectionProps {
  postId: string;
}

const CommentsSection: FC<CommentsSectionProps> = async ({ postId }) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },

    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });
  return (
    <div className=" flex flex-col gap-y-4 mt-4">
      <hr className="w-full h-px my-6" />
      <CreateComment postId={postId} />
      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((tlComment) => {
            const tlvotesAmt = tlComment.votes.reduce((acc, vote) => {
              if (vote.type === "UP") return acc + 1;
              if (vote.type === "DOWN") return acc - 1;
              return acc;
            }, 0);

            const topLevelCommentVote = tlComment.votes.find((tlvote) => {
              tlvote.userId === session?.user.id;
            });

            return (
              <div key={tlComment.id} className=" flex flex-col">
                <div className=" mb-2">
                  <PostComment
                    currentVote={topLevelCommentVote}
                    postId={postId}
                    votesAmt={tlvotesAmt}
                    comment={tlComment}
                  />
                </div>
                {tlComment.replies
                  .sort((a, b) => b.votes.length - a.votes.length)
                  .map((reply) => {
                    const replyVotesAmt = reply.votes.reduce((acc, vote) => {
                      if (vote.type === "UP") return acc + 1;
                      if (vote.type === "DOWN") return acc - 1;
                      return acc;
                    }, 0);

                    const replyVote = reply.votes.find(
                      (replyVote) => {
                        replyVote.userId === session?.user.id;
                      }
                    );

                    return (
                      <div
                        className=" ml-2 py-2 pl-4 border-l-2 border-zinc-200"
                        key={reply.id}
                      >
                        <PostComment comment={reply} currentVote={replyVote} postId={postId} votesAmt={replyVotesAmt} />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSection;
