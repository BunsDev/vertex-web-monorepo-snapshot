import {
  TriggerListOrdersResponse,
  TriggerOrderInfo,
} from '@vertex-protocol/trigger-client';
import { TriggerOrderStatus } from '@vertex-protocol/trigger-client/src/types/clientTypes';
import { BigDecimal, toBigDecimal } from '@vertex-protocol/utils';
import { removeDecimals } from '@vertex-protocol/utils';
import { useDataTablePagination } from 'client/components/DataTable/hooks/useDataTablePagination';
import { useAllMarketsStaticData } from 'client/hooks/markets/useAllMarketsStaticData';
import { useSubaccountPaginatedHistoricalTriggerOrders } from 'client/hooks/query/subaccount/useSubaccountPaginatedHistoricalTriggerOrders';
import { MarketInfoCellData } from 'client/modules/tables/types/MarketInfoCellData';
import { getBaseProductMetadata } from 'client/utils/getBaseProductMetadata';
import { nonNullFilter } from 'client/utils/nonNullFilter';
import { secondsToMilliseconds } from 'date-fns';
import { useMemo } from 'react';

export interface HistoricalTriggerOrder {
  timestampMillis: number;
  status: TriggerOrderStatus;
  marketInfo: MarketInfoCellData;
  price: BigDecimal;
  totalSize: BigDecimal;
}

/**
 * Use a larger page size for now because pagination currently operates on update time
 * However, it is likely that the update time could be the same for 10+ orders (for example, TP/SL on 5 positions
 * and you turn 1CT off).
 *
 * Backend will add pagination on order digest, but this is okay for the time being.
 */
const PAGE_SIZE = 20;

function extractItems(data: TriggerListOrdersResponse) {
  return data.orders;
}

export function useHistoricalTriggerOrdersTable() {
  const { data: marketsStaticData, isLoading: marketsDataLoading } =
    useAllMarketsStaticData();

  const {
    data: historicalTriggerOrders,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useSubaccountPaginatedHistoricalTriggerOrders({
    pageSize: PAGE_SIZE,
  });

  const { pageCount, paginationState, setPaginationState, getPageData } =
    useDataTablePagination<TriggerListOrdersResponse, TriggerOrderInfo>({
      pageSize: PAGE_SIZE,
      numPagesFromQuery: historicalTriggerOrders?.pages.length,
      hasNextPage,
      fetchNextPage,
      extractItems,
    });

  const mappedData: HistoricalTriggerOrder[] | undefined = useMemo(() => {
    if (!historicalTriggerOrders || !marketsStaticData) {
      return;
    }
    return getPageData(historicalTriggerOrders)
      .map((triggerOrderInfo): HistoricalTriggerOrder | undefined => {
        const marketData =
          marketsStaticData.all[triggerOrderInfo.order.productId];
        const quoteData =
          marketsStaticData.quotes[triggerOrderInfo.order.productId];

        if (!marketData || !quoteData) {
          return;
        }

        const { icon, symbol } = getBaseProductMetadata(marketData.metadata);
        const totalAmount = removeDecimals(triggerOrderInfo.order.amount);
        const triggerPrice = toBigDecimal(
          triggerOrderInfo.order.triggerCriteria.triggerPrice,
        );

        return {
          timestampMillis: secondsToMilliseconds(triggerOrderInfo.updatedAt),
          status: triggerOrderInfo.status,
          marketInfo: {
            marketName: marketData.metadata.marketName,
            icon,
            symbol,
            quoteSymbol: quoteData.symbol,
            isPrimaryQuote: quoteData.isPrimaryQuote,
            amountForSide: totalAmount,
            productType: marketData.type,
            sizeIncrement: marketData.sizeIncrement,
            priceIncrement: marketData.priceIncrement,
          },
          price: triggerPrice,
          totalSize: totalAmount.abs(),
        };
      })
      .filter(nonNullFilter);
  }, [historicalTriggerOrders, marketsStaticData, getPageData]);

  return {
    isLoading: isLoading || isFetchingNextPage || marketsDataLoading,
    mappedData,
    pageCount,
    paginationState,
    setPaginationState,
  };
}
