import {
  CustomNumberFormatSpecifier,
  PresetNumberFormatSpecifier,
  formatNumber,
  getMarketPriceFormatSpecifier,
} from '@vertex-protocol/react-client';
import { BigDecimal } from '@vertex-protocol/utils';
import { NextImageSrc, WithClassnames } from '@vertex-protocol/web-common';
import { Summary } from 'client/components/Summary';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import Image from 'next/image';
import { PairMetadata } from '../types';

interface Props extends WithClassnames {
  metadata: PairMetadata;
  priceIncrement: BigDecimal | undefined;
  estimatedBaseAmount: BigDecimal | undefined;
  estimatedQuoteAmount: BigDecimal | undefined;
  estimatedBaseValueUsd: BigDecimal | undefined;
  estimatedQuoteValueUsd: BigDecimal | undefined;
  baseOraclePrice: BigDecimal | undefined;
  // Allowing null because we want to display the fee when data is fetching,
  // but don't always want the fee to be displayed.
  feeAmount: BigDecimal | undefined | null;
  quoteSymbol: string;
}

export function WithdrawLiquiditySummary({
  className,
  metadata,
  priceIncrement,
  feeAmount,
  estimatedBaseAmount,
  estimatedQuoteAmount,
  estimatedBaseValueUsd,
  estimatedQuoteValueUsd,
  baseOraclePrice,
  quoteSymbol,
}: Props) {
  return (
    <Summary.Container className={className}>
      <div className="text-text-tertiary flex flex-col gap-y-1.5 text-xs">
        <p className="text-text-secondary">Est. Receive</p>
        <TokenSummaryItem
          symbol={metadata.base.symbol}
          iconSrc={metadata.base.icon.asset}
          amount={estimatedBaseAmount}
          valueUsd={estimatedBaseValueUsd}
        />
        <TokenSummaryItem
          symbol={metadata.quote.symbol}
          iconSrc={metadata.quote.icon.asset}
          amount={estimatedQuoteAmount}
          valueUsd={estimatedQuoteValueUsd}
        />
        {feeAmount !== null && (
          <Summary.Item
            label="Fee:"
            valueEndElement={quoteSymbol}
            numberFormatSpecifier={CustomNumberFormatSpecifier.NUMBER_PRECISE}
            value={feeAmount}
          />
        )}
        <DefinitionTooltip
          definitionId="lpEstimatedConversionPrice"
          contentWrapperClassName="text-xs text-text-secondary"
        >
          1 {metadata.base.symbol} ≈{' '}
          {formatNumber(baseOraclePrice, {
            formatSpecifier: getMarketPriceFormatSpecifier(priceIncrement),
          })}{' '}
          {metadata.quote.symbol}
        </DefinitionTooltip>
      </div>
    </Summary.Container>
  );
}

interface TokenSummaryItemProps {
  amount: BigDecimal | undefined;
  valueUsd: BigDecimal | undefined;
  symbol: string | undefined;
  iconSrc: NextImageSrc | undefined;
}

function TokenSummaryItem({
  amount,
  valueUsd,
  symbol,
  iconSrc,
}: TokenSummaryItemProps) {
  const amountWithSymbolContent = (
    <span className="text-text-primary">
      {formatNumber(amount, {
        formatSpecifier: CustomNumberFormatSpecifier.NUMBER_AUTO,
      })}{' '}
      <span className="text-text-tertiary">{symbol}</span>
    </span>
  );

  const dollarValueContent = (() => {
    if (!valueUsd) {
      return null;
    }
    return (
      <span className="text-text-tertiary">
        (
        {formatNumber(valueUsd, {
          formatSpecifier: PresetNumberFormatSpecifier.CURRENCY_2DP,
        })}
        )
      </span>
    );
  })();

  return (
    <ValueWithLabel.Horizontal
      fitWidth
      sizeVariant="xs"
      label={
        iconSrc && <Image src={iconSrc} alt={symbol ?? ''} className="size-5" />
      }
      valueContent={
        <>
          {amountWithSymbolContent}
          {dollarValueContent}
        </>
      }
    />
  );
}
