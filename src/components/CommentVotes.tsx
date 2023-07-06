"use client";

import { Button } from "@/components/ui/Button";
import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { CommentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { CommentVote, VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { FC, useState } from "react";

interface CommentVoteProps {
  commentId: string;
  initialVotesAmt: number;
  initialVote?: Pick<CommentVote, 'type'>;
}

const CommentVote: FC<CommentVoteProps> = ({
  commentId,
  initialVotesAmt,
  initialVote,
}) => {
  const { loginToast } = useCustomToasts();
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currVote, setCurrVote] = useState(initialVote);
  const prevVote = usePrevious(currVote);

//   useEffect(() => {
//     setCurrVote(initialVote);
//   }, [initialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: CommentVoteRequest = {
        commentId,
        voteType,
      };
      await axios.patch("/api/subredit/post/comment/vote", payload);
    },

    onError: (err, voteType) => {
      if (voteType === "UP") setVotesAmt((prev) => prev - 1);
      else setVotesAmt((prev) => prev + 1);

      setCurrVote(prevVote);

      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "Something went wrong",
        description: "Your vote was not registered, please try again",
        variant: "destructive",
      });
    },

    onMutate: (type: VoteType) => {
      if (type === currVote?.type) {
        setCurrVote(undefined);
        if (type === "UP") setVotesAmt((prev) => prev - 1);
        else setVotesAmt((prev) => prev + 1);
      } else {
        setCurrVote({type});
        if (type === "UP") setVotesAmt((prev) => prev + (currVote ? 2 : 1));
        else setVotesAmt((prev) => prev - (currVote ? 2 : 1));
      }
    },
  });

  return (
    <div className=" flex gap-1">
      <Button
        onClick={() => vote("UP")}
        size="sm"
        variant={"ghost"}
        aria-label="upvote"
      >
        <ArrowBigUp
          className={cn(" h-5 w-5 text-zinc-700", {
            " text-emerald-500 fill-emerald-500": currVote?.type === "UP",
          })}
        />
      </Button>

      <p className=" text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>

      <Button
        onClick={() => vote("DOWN")}
        size="sm"
        variant={"ghost"}
        aria-label="downvote"
      >
        <ArrowBigDown
          className={cn(" h-5 w-5 text-zinc-700", {
            " text-red-500 fill-red-500": currVote?.type === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVote;
