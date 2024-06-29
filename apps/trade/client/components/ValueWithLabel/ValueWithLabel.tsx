import { formatNumber } from '@vertex-protocol/react-client';
import { joinClassNames, mergeClassNames } from '@vertex-protocol/web-common';
import { Label, Value, ValueWithChange } from '@vertex-protocol/web-ui';
import { DefinitionTooltip } from 'client/modules/tooltips/DefinitionTooltip/DefinitionTooltip';
import {
  HorizontalValueWithLabelProps,
  ValueContentProps,
  ValueWithLabelProps,
  ValueWithLabelSizeVariants,
} from './types';

/**
 * Base value with label component to be used in `ValueWithLabel`.
 *
 */
function Base({
  className,
  sizeVariant = 'base',
  label,
  labelClassName,
  sizeVariantOverrides,
  labelStartIcon,
  labelEndIcon,
  tooltip,
  ...valueContentProps
}: ValueWithLabelProps) {
  const gapClassName = {
    xs: 'gap-1',
    sm: 'gap-1',
    base: 'gap-1.5',
    lg: 'gap-1.5',
  }[sizeVariant];

  return (
    <div className={joinClassNames('flex', gapClassName, className)}>
      <DefinitionTooltip
        definitionId={tooltip?.id}
        decoration={tooltip?.infoIcon ? { icon: true } : undefined}
        asChild
      >
        <Label
          className={labelClassName}
          sizeVariant={sizeVariantOverrides?.label ?? sizeVariant}
          startIcon={labelStartIcon}
          endIcon={labelEndIcon}
        >
          {label}
        </Label>
      </DefinitionTooltip>
      <ValueContent
        {...valueContentProps}
        sizeVariant={sizeVariant}
        sizeVariantOverrides={sizeVariantOverrides}
      />
    </div>
  );
}

/**
 * Renders the value content for the `ValueWithLabel` component using mutually exclusive `value` and `valueContent`.
 *
 * If `valueContent` is provided, return the `Value` component with the provided content. Formatting of the content is to be supplied by the consumer.
 *
 * Else, format the `value` with `numberFormatSpecifier` and return a `ValueWithChange` component which internally wraps the content with `Value`.
 * If `newValue` is provided, the `ValueWithChange` component will render the change arrow alongside the `newValueContent`.
 */
function ValueContent({
  sizeVariant,
  sizeVariantOverrides,
  valueClassName,
  valueEndElement,
  ...unionProps
}: ValueContentProps) {
  const valueSizeVariant = sizeVariantOverrides?.value ?? sizeVariant;

  if ('valueContent' in unionProps) {
    const { valueContent: content } = unionProps;

    return (
      <Value
        sizeVariant={valueSizeVariant}
        className={valueClassName}
        endElement={valueEndElement}
      >
        {content}
      </Value>
    );
  }

  const {
    value,
    newValue,
    numberFormatSpecifier,
    changeArrowClassName,
    defaultValue,
    outerValueClassName,
  } = unionProps;

  const newValueContent = (() => {
    if (newValue == null) {
      return;
    }

    return formatNumber(newValue, {
      formatSpecifier: numberFormatSpecifier,
      defaultValue,
    });
  })();

  return (
    <ValueWithChange
      className={outerValueClassName}
      valueClassName={valueClassName}
      sizeVariant={valueSizeVariant}
      currentValue={formatNumber(value, {
        formatSpecifier: numberFormatSpecifier,
        defaultValue,
      })}
      newValue={newValueContent}
      endElement={valueEndElement}
      arrowClassName={changeArrowClassName}
    />
  );
}

function Horizontal({
  className,
  fitWidth,
  ...rest
}: HorizontalValueWithLabelProps) {
  return (
    <Base
      className={mergeClassNames(!fitWidth && 'justify-between', className)}
      {...rest}
    />
  );
}

function Vertical({
  className,
  sizeVariant = 'base',
  sizeVariantOverrides,
  ...rest
}: ValueWithLabelProps) {
  const sizeVariants = {
    xs: {
      label: 'xs',
      value: 'xs',
    },
    sm: {
      label: 'xs',
      value: 'sm',
    },
    base: {
      label: 'sm',
      value: 'base',
    },
    lg: {
      label: 'sm',
      value: 'lg',
    },
  }[sizeVariant] as ValueWithLabelSizeVariants;

  return (
    <Base
      className={mergeClassNames('flex-col', className)}
      sizeVariant={sizeVariant}
      sizeVariantOverrides={sizeVariantOverrides ?? sizeVariants}
      {...rest}
    />
  );
}

export const ValueWithLabel = {
  Horizontal,
  Vertical,
};
