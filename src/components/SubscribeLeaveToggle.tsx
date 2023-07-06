"use client";

import { FC, startTransition } from "react";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { SubscribeToSubreditPayload } from "@/lib/validators/subredit";
import axios, { AxiosError } from "axios";
import { useCustomToasts } from "@/hooks/use-custom-toasts";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SubscribeLeaveToggleProps {
  subreditId: string;
  subreditName: string;
  isSubscribed: boolean;
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({
  subreditId,
  subreditName,
  isSubscribed,
}) => {
  const { loginToast } = useCustomToasts();
  const router = useRouter();
  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubreditPayload = {
        subreditId,
      };

      const { data } = await axios.post("/api/subredit/subscribe", payload);
      return data as string;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      toast({
        title: "Subscribed",
        description: `You are now subscribed to r/${subreditName}`,
      });
    },
  });

  const { mutate: unsubscribe, isLoading: isunSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscribeToSubreditPayload = {
        subreditId,
      };

      const { data } = await axios.post("/api/subredit/unsubscribe", payload);
      return data as string;
    },

    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        }
      }

      return toast({
        title: "There was a problem",
        description: "Something went wrong, please try again.",
        variant: "destructive",
      });
    },

    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });

      toast({
        title: "unsubscribed",
        description: `You are now unsubscribed from r/${subreditName}`,
      });
    },
  });

  return isSubscribed ? (
    <Button className="w-full mt-1 mb-4" onClick={() => unsubscribe() } isLoading = {isunSubLoading}>Leave community</Button>
  ) : (
    <Button className="w-full mt-1 mb-4" onClick={() => subscribe()} isLoading = {isSubLoading}>
      Join to post
    </Button>
  );
};

export default SubscribeLeaveToggle;
