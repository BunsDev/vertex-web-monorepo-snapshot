import { createColumnHelper, Row } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/table-core';
import { WithClassnames } from '@vertex-protocol/web-common';
import {
  PresetNumberFormatSpecifier,
  useEVMContext,
} from '@vertex-protocol/react-client';
import {
  IconButton,
  Icons,
  LabelTooltip,
  SecondaryButton,
} from '@vertex-protocol/web-ui';
import { HeaderCell } from 'client/components/DataTable/cells/HeaderCell';
import { TableCell } from 'client/components/DataTable/cells/TableCell';
import { DataTable } from 'client/components/DataTable/DataTable';
import {
  bigDecimalSortFn,
  getKeyedBigDecimalSortFn,
} from 'client/components/DataTable/utils/sortingFns';
import { useUserActionState } from 'client/hooks/subaccount/useUserActionState';
import { useIsDesktop } from 'client/hooks/ui/breakpoints';
import { usePushTradePage } from 'client/hooks/ui/navigation/usePushTradePage';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { AmountWithSymbolCell } from 'client/modules/tables/cells/AmountWithSymbolCell';
import { CloseAllPositionsHeaderCell } from 'client/modules/tables/cells/CloseAllPositionsHeaderCell';
import { CurrencyCell } from 'client/modules/tables/cells/CurrencyCell';
import { MarketInfoWithSideCell } from 'client/modules/tables/cells/MarketInfoWithSideCell';
import { NumberCell } from 'client/modules/tables/cells/NumberCell';
import { EmptyTablePlaceholder } from 'client/modules/tables/EmptyTablePlaceholder';
import { MarketFilter } from 'client/types/MarketFilter';
import { useMemo } from 'react';
import { PerpStackedPnlCell } from './cells/PerpStackedPnlCell';
import { PerpTpSlCell } from './cells/PerpTpSlCell';
import { StackedAmountValueCell } from './cells/StackedAmountValueCell';
import {
  PerpPositionsTableItem,
  usePerpPositionsTable,
} from './hooks/usePerpPositionsTable';
import { getTableButtonOnClickHandler } from './utils/getTableButtonOnClickHandler';

const columnHelper = createColumnHelper<PerpPositionsTableItem>();

interface Props {
  hasBackground?: boolean;
  marketFilter?: MarketFilter;
}

export function PerpPositionsTable({
  className,
  marketFilter,
  hasBackground,
}: WithClassnames<Props>) {
  const { connectionStatus } = useEVMContext();

  const { positions, isLoading } = usePerpPositionsTable({
    marketFilter,
  });

  const { show } = useDialog();
  const pushTradePage = usePushTradePage();

  const userActionState = useUserActionState();
  const disableClosePosition = userActionState !== 'allow_all';

  const isDesktop = useIsDesktop();
  const isConnected = connectionStatus.type === 'connected';

  const columns: ColumnDef<PerpPositionsTableItem, any>[] = useMemo(() => {
    return [
      columnHelper.accessor('marketInfo', {
        header: ({ header }) => (
          <HeaderCell header={header}>Market / Side</HeaderCell>
        ),
        cell: (context) => (
          <MarketInfoWithSideCell
            marketInfo={context.getValue()}
            alwaysShowOrderDirection={false}
          />
        ),
        enableSorting: false,
        meta: {
          cellContainerClassName: 'w-36',
          withLeftPadding: true,
        },
      }),
      columnHelper.accessor('amountInfo', {
        header: ({ header }) => (
          <HeaderCell header={header}>Position Size</HeaderCell>
        ),
        cell: (context) => {
          const { position, notionalValueUsd, symbol } =
            context.getValue<PerpPositionsTableItem['amountInfo']>();
          return (
            <StackedAmountValueCell
              symbol={symbol}
              size={position}
              sizeFormatSpecifier={context.row.original.sizeFormatSpecifier}
              valueUsd={notionalValueUsd}
            />
          );
        },
        sortingFn: getKeyedBigDecimalSortFn('notionalValueUsd'),
        meta: {
          cellContainerClassName: 'w-28',
        },
      }),
      columnHelper.accessor('marginUsedUsd', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="perpPositionsMargin" header={header}>
            Margin
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <CurrencyCell
              value={context.getValue()}
              formatSpecifier={PresetNumberFormatSpecifier.CURRENCY_2DP}
            />
          );
        },
        sortingFn: bigDecimalSortFn,
        meta: {
          cellContainerClassName: 'w-24',
        },
      }),
      columnHelper.accessor('averageEntryPrice', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="averageEntryPrice" header={header}>
            Entry Price
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={context.row.original.priceFormatSpecifier}
            />
          );
        },
        sortingFn: bigDecimalSortFn,
        meta: {
          cellContainerClassName: 'w-24',
        },
      }),
      columnHelper.accessor('oraclePrice', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="oraclePrice" header={header}>
            Oracle Price
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              value={context.getValue()}
              formatSpecifier={context.row.original.priceFormatSpecifier}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: 'w-24',
        },
      }),
      columnHelper.accessor('estimatedLiquidationPrice', {
        header: ({ header }) => (
          <HeaderCell
            header={header}
            definitionTooltipId="perpPositionsEstimatedLiqPrice"
          >
            Est. Liq. Price
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <NumberCell
              formatSpecifier={context.row.original.priceFormatSpecifier}
              value={context.getValue()}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: 'w-28',
        },
      }),
      columnHelper.accessor('pnlInfo', {
        header: ({ header }) => (
          <HeaderCell
            definitionTooltipId="estimatedPositionPnL"
            header={header}
          >
            Est. PnL
          </HeaderCell>
        ),
        cell: (context) => {
          const { estimatedPnlUsd, estimatedPnlFrac } =
            context.getValue<PerpPositionsTableItem['pnlInfo']>();
          return (
            <PerpStackedPnlCell
              pnlFrac={estimatedPnlFrac}
              pnl={estimatedPnlUsd}
            />
          );
        },
        sortingFn: getKeyedBigDecimalSortFn('estimatedPnlUsd'),
        meta: {
          cellContainerClassName: 'w-28',
        },
      }),
      columnHelper.accessor('reduceOnlyOrders', {
        header: ({ header }) => (
          <HeaderCell definitionTooltipId="perpPositionsTpSl" header={header}>
            TP/SL
          </HeaderCell>
        ),
        cell: (context) => {
          return (
            <PerpTpSlCell
              productId={context.row.original.productId}
              reduceOnlyOrders={context.getValue()}
              formatSpecifier={context.row.original.priceFormatSpecifier}
            />
          );
        },
        enableSorting: false,
        meta: {
          cellContainerClassName: 'w-28',
        },
      }),
      columnHelper.accessor('netFunding', {
        header: ({ header }) => (
          <HeaderCell
            definitionTooltipId="perpPositionsFundingPayments"
            header={header}
          >
            Funding
          </HeaderCell>
        ),
        cell: (context) => {
          const netFunding =
            context.getValue<PerpPositionsTableItem['netFunding']>();
          return (
            <AmountWithSymbolCell
              amount={netFunding}
              symbol={context.row.original.marketInfo.quoteSymbol}
              formatSpecifier={PresetNumberFormatSpecifier.SIGNED_NUMBER_2DP}
            />
          );
        },
        sortingFn: bigDecimalSortFn,
        meta: {
          cellContainerClassName: 'grow w-36',
        },
      }),
      columnHelper.display({
        id: 'actions',
        header: ({ header }) => <CloseAllPositionsHeaderCell header={header} />,
        cell: (context) => {
          const { productId, marketInfo, price, pnlInfo } =
            context.row.original;

          const { estimatedPnlFrac } = pnlInfo;

          const { fastOraclePrice, averageEntryPrice } = price;

          return (
            <TableCell className="pointer-events-auto px-4">
              <div className="flex w-full items-center gap-x-3">
                <LabelTooltip label="Share Position" asChild noHelpCursor>
                  <IconButton
                    size="xs"
                    onClick={getTableButtonOnClickHandler(() => {
                      show({
                        type: 'perp_pnl_social_sharing',
                        params: {
                          marketInfo,
                          pnlFrac: estimatedPnlFrac,
                          entryPrice: averageEntryPrice,
                          referencePrice: fastOraclePrice,
                          isRealized: false,
                        },
                      });
                    })}
                    icon={Icons.RiShareForwardFill}
                  />
                </LabelTooltip>
                <SecondaryButton
                  destructive
                  className="flex-1"
                  size="xs"
                  title="Close Position"
                  onClick={getTableButtonOnClickHandler(() => {
                    show({
                      type: 'close_position',
                      params: {
                        productId,
                      },
                    });
                  })}
                  disabled={disableClosePosition}
                >
                  Close
                </SecondaryButton>
              </div>
            </TableCell>
          );
        },
        meta: {
          cellContainerClassName: 'w-44',
        },
      }),
    ];
  }, [disableClosePosition, show]);

  const onRowClicked = (row: Row<PerpPositionsTableItem>) => {
    if (isDesktop || !isConnected) {
      pushTradePage({
        productId: row.original.productId,
      });
    } else {
      show({
        type: 'perp_position_details',
        params: row.original,
      });
    }
  };

  return (
    <DataTable
      columns={columns}
      data={positions}
      isLoading={isLoading}
      emptyState={<EmptyTablePlaceholder type="perp_positions" />}
      hasBackground={hasBackground}
      tableContainerClassName={className}
      onRowClicked={onRowClicked}
    />
  );
}
