"use client";

import { useQuery } from "@tanstack/react-query";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "./ui/Command";
import axios from "axios";
import { Prisma, Subredit } from "@prisma/client";
import { usePathname, useRouter } from "next/navigation";
import { Users } from "lucide-react";
import debounce from "lodash.debounce";
import { useOnClickOutside } from "@/hooks/use-on-click-outside";

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
  const [input, setInput] = useState<string>("");
  const router = useRouter();

  const {
    data: queryResults,
    refetch,
    isFetching,
    isFetched,
  } = useQuery({
    queryFn: async () => {
      if (!input) return [];
      const { data } = await axios.get(`/api/search?q=${input}`);
      return data as (Subredit & {
        _count: Prisma.SubreditCountOutputType;
      })[];
    },
    queryKey: ["search-query"],
    enabled: false,
  });

  const commandRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  const request = debounce(() => {
    refetch();
  }, 500);

  const debounceRequest = useCallback(() => {
    request();
  }, []);
  
  useOnClickOutside(commandRef, () => {
    setInput("")
  })

  useEffect(() => {
    setInput("")
  }, [pathname])

  return (
    <Command ref={commandRef} className=" relative rounded-lg border max-w-lg z-50 overflow-visible">
      <CommandInput
        value={input}
        onValueChange={(text) => {
          setInput(text);
          debounceRequest();
        }}
        className="outline-none border-none focus:border-none focus:outline-none ring-0"
        placeholder="Search Communities..."
      />

      {input.length > 0 ? (
        <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
          {isFetched && <CommandEmpty>No results found</CommandEmpty>}
          {(queryResults?.length ?? 0) > 0 ? (
            <CommandGroup heading="Communities">
              {queryResults?.map((subredit) => (
                <CommandItem
                  onSelect={(e) => {
                    router.push(`/r/${e}`);
                    router.refresh();
                  }}
                  key={subredit.id}
                  value={subredit.name}
                >
                  <Users className=" mr-2 w-4 h-4" />
                  <a href={`/r/${subredit.name}`}>r/{subredit.name}</a>
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
        </CommandList>
      ) : null}
    </Command>
  );
};

export default SearchBar;
