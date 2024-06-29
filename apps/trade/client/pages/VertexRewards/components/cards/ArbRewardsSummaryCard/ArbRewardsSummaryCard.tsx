import {
  PresetNumberFormatSpecifier,
  formatNumber,
} from '@vertex-protocol/react-client';
import { joinClassNames } from '@vertex-protocol/web-common';
import { Divider, PrimaryButton } from '@vertex-protocol/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import { ValueWithLabel } from 'client/components/ValueWithLabel/ValueWithLabel';
import { useArbRewardsSummaryCard } from 'client/pages/VertexRewards/components/cards/ArbRewardsSummaryCard/useArbRewardsSummaryCard';
import { RewardsSummaryCard } from '../RewardsSummaryCard';

export function ArbRewardsSummaryCard() {
  const {
    totalRealizedRewards,
    estimatedWeekRewards,
    unclaimedRealizedRewards,
    claimedRewards,
    currentWeek,
    currentRound,
    currentWeekEndTimeMillis,
    disableClaimButton,
    onClaimClick,
    isClaimSuccess,
    isClaiming,
    arbToken,
    roundDurationInWeeks,
    isArbRewardsCompleted,
  } = useArbRewardsSummaryCard();

  const claimButtonLabel = (() => {
    if (isClaiming) {
      return 'Confirm Claim';
    }
    if (isClaimSuccess) {
      return <ButtonStateContent.Success message="Claim Successful" />;
    }
    return `Claim ARB Incentives`;
  })();

  const formattedCurrentWeek = formatNumber(currentWeek, {
    formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
  });

  const formattedCurrentRound = formatNumber(currentRound, {
    formatSpecifier: PresetNumberFormatSpecifier.NUMBER_INT,
  });

  const metricItems = (() => {
    return (
      <>
        <ValueWithLabel.Vertical
          label="Total Earned"
          tooltip={{ id: 'rewardsFoundationTotalEarned' }}
          value={totalRealizedRewards}
          valueEndElement={arbToken.symbol}
          numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
        />
        <ValueWithLabel.Vertical
          label="Claimed"
          value={claimedRewards}
          valueEndElement={arbToken.symbol}
          numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
        />
        {!isArbRewardsCompleted && (
          <ValueWithLabel.Vertical
            label="Est. New"
            tooltip={{ id: 'rewardsFoundationEstNew' }}
            value={estimatedWeekRewards}
            valueEndElement={arbToken.symbol}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
          />
        )}
      </>
    );
  })();

  return (
    <RewardsSummaryCard.Container
      className={joinClassNames(
        'to-surface-card bg-gradient-to-r from-[#3A80D2]/30',
        'ring-[#3A80D2]',
      )}
    >
      <RewardsSummaryCard.Content
        header={
          <RewardsSummaryCard.IconHeader
            iconSrc={arbToken.icon.asset}
            title={`${arbToken.symbol} Incentives`}
            iconClassName="aspect-square w-7"
          />
        }
        metricItems={metricItems}
        actionMetric={
          <ValueWithLabel.Vertical
            label="Available to Claim"
            tooltip={{ id: 'rewardsFoundationAvailableToClaim' }}
            value={unclaimedRealizedRewards}
            numberFormatSpecifier={PresetNumberFormatSpecifier.NUMBER_2DP}
            valueEndElement={arbToken.symbol}
          />
        }
        action={
          <RewardsSummaryCard.ActionWithHelperText helperText="Rewards are claimable a few days after each week ends.">
            <PrimaryButton
              onClick={onClaimClick}
              isLoading={isClaiming}
              disabled={disableClaimButton}
            >
              {claimButtonLabel}
            </PrimaryButton>
          </RewardsSummaryCard.ActionWithHelperText>
        }
        footer={
          isArbRewardsCompleted ? (
            <div className="text-sm">Arb Incentives Completed</div>
          ) : (
            <RewardsSummaryCard.FooterCountdown
              label={
                <div className="flex items-center gap-x-2.5">
                  <span className="text-text-primary font-medium">
                    Round {formattedCurrentRound}: Week {formattedCurrentWeek}/
                    {roundDurationInWeeks}
                  </span>
                  <Divider className="h-3" vertical />
                  <span>Week {formattedCurrentWeek} ends in:</span>
                </div>
              }
              countdownTimeMillis={currentWeekEndTimeMillis}
            />
          )
        }
      />
    </RewardsSummaryCard.Container>
  );
}
