import { mergeClassNames } from '@vertex-protocol/web-common';
import Link from 'next/link';
import { forwardRef, Ref } from 'react';
import { Spinner } from '../Spinner';
import {
  ButtonAsDivProps,
  ButtonAsHTMLButtonProps,
  ButtonAsLinkProps,
  ButtonProps,
} from './types';

export const Button = forwardRef(function Button(
  props: ButtonProps,
  ref: Ref<any>,
) {
  const {
    as: Component,
    className: baseClassName,
    iconClassName,
    startIcon: baseStartIcon = null,
    endIcon = null,
    disabled = false,
    isLoading = false,
    children: baseChildren,
    loadingIconSize = '1.15em',
    ...rest
  } = props;
  const startIcon = isLoading ? (
    <Spinner size={loadingIconSize} className="text-inherit" />
  ) : (
    baseStartIcon
  );

  const hasGap = startIcon || endIcon;
  const disableInteraction = disabled || isLoading;

  const children = (
    <>
      {startIcon}
      {baseChildren}
      {endIcon}
    </>
  );

  const className = mergeClassNames(
    'inline-flex items-center justify-center whitespace-nowrap',
    hasGap && 'gap-x-2',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    isLoading && 'cursor-wait',
    baseClassName,
  );

  if (Component === Link) {
    const { external, ...passthroughLinkProps } = rest as Omit<
      ButtonAsLinkProps,
      'as'
    >;

    // We can't easily disable link elements, so return a div with the same styling
    if (disableInteraction) {
      return (
        <div className={className} style={rest.style} ref={ref}>
          {children}
        </div>
      );
    }

    // Passing in `external = true` will automatically add `target="_blank"` and `rel="noopener noreferrer"`
    const target = external ? '_blank' : undefined;
    const rel = external ? 'noopener noreferrer' : undefined;

    return (
      <Link
        target={target}
        rel={rel}
        className={className}
        ref={ref}
        {...passthroughLinkProps}
      >
        {children}
      </Link>
    );
  }

  if (Component === 'div') {
    const { onClick, ...passthroughDivProps } = rest as ButtonAsDivProps;
    return (
      <div
        className={className}
        onClick={disableInteraction ? undefined : onClick}
        ref={ref}
        {...passthroughDivProps}
      >
        {children}
      </div>
    );
  }

  const { onClick, type, ...passThroughButtonProps } =
    rest as ButtonAsHTMLButtonProps;

  return (
    <button
      ref={ref}
      className={className}
      onClick={disableInteraction ? undefined : onClick}
      disabled={disableInteraction}
      type={type ?? 'button'}
      {...passThroughButtonProps}
    >
      {children}
    </button>
  );
});
