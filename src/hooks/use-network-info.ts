import { useQuery } from '@tanstack/react-query';
import { getNetworkInfo } from '@/modules/network/network.service';

export function useNetworkInfo(enabled: boolean = true) {
  return useQuery({
    queryKey: ['network-info'],
    queryFn: getNetworkInfo,
    enabled,
    retry: 2,
    staleTime: 60_000,
  });
}
