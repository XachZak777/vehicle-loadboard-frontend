import type { ReactNode } from 'react';
import { useGetBidsForLoadQuery } from '../../store/services/hauliusApi';
import type { LoadDto, BidDto } from '../../store/services/hauliusApi';

export type LoadWithBids = LoadDto & { bids: BidDto[] };

interface Props {
  load: LoadDto;
  children: (merged: LoadWithBids) => ReactNode;
}

export function LoadWithBidsLoader({ load, children }: Props) {
  const { data: bids = [] } = useGetBidsForLoadQuery(load.id);
  return <>{children({ ...load, bids })}</>;
}
