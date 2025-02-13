import {
  Root as TabsRoot,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@radix-ui/react-tabs';
import { WithClassnames, joinClassNames } from '@vertex-protocol/web-common';
import { useState } from 'react';

import { ColorBorderButton } from 'client/components/Button/ColorBorderButton';
import { ProductData } from '../data';

interface Props extends WithClassnames {
  data: ProductData;
  isSelectedCard: boolean;
  onClick: () => void;
}

export function ExpandableProductCard({
  className,
  data: { variant, icon: Icon, title, subTabs },
  isSelectedCard,
  onClick,
}: Props) {
  const [subTabId, setSubTabId] = useState(subTabs[0].id);

  const backgroundColorMapping = {
    pink: 'bg-pinkGradient',
    purple: 'bg-purpleGradient',
  }[variant];

  return (
    <div
      className={joinClassNames(
        'flex w-full overflow-hidden rounded-xl backdrop-blur-xl',
        'border-white-600 border text-3xl font-bold text-white',
        isSelectedCard ? backgroundColorMapping : 'bg-grayGradient',
        className,
      )}
      onClick={onClick}
    >
      <div
        className={joinClassNames(
          'h-full w-full flex-col justify-start gap-y-4 overflow-hidden',
          'bg-black-700 rounded-xl font-bold text-white backdrop-blur-xl',
        )}
      >
        <div className="xs:text-3xl flex items-center gap-x-3.5 p-5 text-xl leading-7">
          <div className="bg-white-400 text-white-700 rounded-md p-2.5">
            <Icon size={20} />
          </div>
          <span>{title}</span>
        </div>
        <TabsRoot
          value={subTabId}
          onValueChange={setSubTabId}
          className="font-dmSans flex flex-col gap-y-3 p-6 pt-2 font-normal"
        >
          <TabsList className="flex gap-x-2 text-xs">
            {subTabs.map(({ id }) => (
              <TabsTrigger key={id} value={id}>
                <ColorBorderButton
                  as="div"
                  className={joinClassNames(
                    'mask-round overflow-hidden rounded-full px-4 py-1 text-sm capitalize text-white',
                    subTabId === id ? 'opacity-100' : 'opacity-50',
                  )}
                  borderRadiusFull
                >
                  {id}
                </ColorBorderButton>
              </TabsTrigger>
            ))}
          </TabsList>
          {subTabs.map(({ content, id }) => (
            <TabsContent
              key={id}
              value={id}
              className={joinClassNames(
                'text-white-700 whitespace-pre-wrap py-2',
                'text-left text-base',
                'md:text-lg',
              )}
            >
              {content}
            </TabsContent>
          ))}
        </TabsRoot>
      </div>
    </div>
  );
}
