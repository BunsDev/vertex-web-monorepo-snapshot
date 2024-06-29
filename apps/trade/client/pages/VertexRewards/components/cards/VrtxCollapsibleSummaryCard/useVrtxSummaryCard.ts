import { sumBigDecimalBy, TimeInSeconds } from '@vertex-protocol/client';
import { useEVMContext } from '@vertex-protocol/react-client';
import { removeDecimals } from '@vertex-protocol/utils';
import { useVertexMetadataContext } from 'client/context/vertexMetadata/VertexMetadataContext';
import { useAccountTokenClaimState } from 'client/hooks/query/vrtxToken/useAccountTokenClaimState';
import { useUserActionState } from 'client/hooks/subaccount/useUserActionState';
import { useLatestRewardsEpochs } from 'client/modules/rewards/hooks/useLatestRewardsEpochs';
import { isBefore, secondsToMilliseconds } from 'date-fns';
import { get, now } from 'lodash';
import { useMemo } from 'react';

export function useVrtxSummaryCard() {
  const { primaryChain, connectionStatus, setPrimaryChainEnv } =
    useEVMContext();
  const userActionState = useUserActionState();
  const { protocolTokenMetadata } = useVertexMetadataContext();
  const { data: latestRewardsEpochs } = useLatestRewardsEpochs();
  const { data: accountTokenClaimState } = useAccountTokenClaimState();

  const isOnProtocolTokenChain =
    primaryChain.id === protocolTokenMetadata.chain.id;

  const mappedData = useMemo(() => {
    const { currentEpoch, lastCompletedEpoch } = latestRewardsEpochs;

    const currentEpochNumber = currentEpoch?.epochNumber;
    const nextEpochNumber = !!currentEpochNumber
      ? currentEpochNumber + 1
      : undefined;

    // Total rewards earned calculation when on-chain data is available
    const totalRewardsEarned = (() => {
      if (!accountTokenClaimState) {
        return;
      }

      const onChainTotalEarned = sumBigDecimalBy(
        accountTokenClaimState.totalClaimablePerEpoch,
        (totalClaimable) =>
          removeDecimals(
            totalClaimable,
            protocolTokenMetadata.token.tokenDecimals,
          ),
      );

      // If the last completed epoch amount isn't on chain yet, add it
      if (
        lastCompletedEpoch &&
        get(
          accountTokenClaimState.totalClaimablePerEpoch,
          lastCompletedEpoch.epochNumber,
        ) == null
      ) {
        return onChainTotalEarned
          .plus(lastCompletedEpoch.subaccountRewards.trading)
          .plus(lastCompletedEpoch.subaccountRewards.referrals);
      }
      return onChainTotalEarned;
    })();

    const unclaimedLastEpochRewards = (() => {
      if (
        !lastCompletedEpoch?.subaccountTokenClaim?.totalEarned ||
        !lastCompletedEpoch.subaccountTokenClaim?.claimed
      ) {
        return;
      }
      return lastCompletedEpoch.subaccountTokenClaim.totalEarned.minus(
        lastCompletedEpoch.subaccountTokenClaim.claimed,
      );
    })();

    // Show claim warning 5 days before claiming ends
    const showClaimWarning =
      !!lastCompletedEpoch?.subaccountTokenClaim.claimDeadlineMillis &&
      isBefore(
        lastCompletedEpoch.subaccountTokenClaim.claimDeadlineMillis -
          secondsToMilliseconds(TimeInSeconds.DAY * 5),
        now(),
      );

    return {
      unclaimedLastEpochRewards,
      epochEndTimeMillis: currentEpoch?.epochIntervalMillis.to,
      currentEpochNumber,
      nextEpochNumber,
      showClaimWarning,
      estimatedNewRewards: currentEpoch?.subaccountRewards.trading,
      totalRewardsEarned,
      lastCompletedEpoch,
    };
  }, [
    accountTokenClaimState,
    latestRewardsEpochs,
    protocolTokenMetadata.token.tokenDecimals,
  ]);

  return {
    ...mappedData,
    isOnProtocolTokenChain,
    protocolTokenMetadata,
    disableSwitchChainButton: connectionStatus.type !== 'connected',
    disableClaimButton:
      !mappedData.unclaimedLastEpochRewards ||
      mappedData.unclaimedLastEpochRewards.isZero() ||
      userActionState === 'block_all',
    vrtxToken: protocolTokenMetadata.token,
    setPrimaryChainEnv,
  };
}
