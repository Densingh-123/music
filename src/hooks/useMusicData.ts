import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { fetchTrending, searchMusic } from '../services/api';

export const useTrendingMusic = () => {
  return useQuery({
    queryKey: ['trending'],
    queryFn: fetchTrending,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

const PAGE_SIZE = 25;

export const useSearchMusic = (query: string) => {
  return useInfiniteQuery({
    queryKey: ['search', query],
    // pageParam is the offset (0, 25, 50, ...)
    queryFn: ({ pageParam }) => searchMusic(query, pageParam as number),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < PAGE_SIZE) return undefined;
      return allPages.length * PAGE_SIZE;
    },
    initialPageParam: 0,
    enabled: !!query && query.trim().length >= 2,
    staleTime: 1000 * 60 * 10, // 10 minutes cache — faster repeat visits
    gcTime: 1000 * 60 * 15,   // Keep in memory for 15 min after unmount
  });
};
