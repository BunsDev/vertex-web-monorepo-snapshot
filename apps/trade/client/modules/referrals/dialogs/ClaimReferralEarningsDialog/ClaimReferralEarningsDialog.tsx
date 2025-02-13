import {
  formatNumber,
  PresetNumberFormatSpecifier,
} from '@vertex-protocol/react-client';
import { BaseDialog } from 'client/components/BaseDialog/BaseDialog';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { ClaimReferralEarningsSubmitButton } from 'client/modules/referrals/dialogs/ClaimReferralEarningsDialog/ClaimReferralEarningsSubmitButton';
import { useClaimReferralEarningsDialog } from 'client/modules/referrals/dialogs/ClaimReferralEarningsDialog/hooks/useClaimReferralEarningsDialog';
import Image from 'next/image';

export function ClaimReferralEarningsDialog() {
  const { onSubmit, buttonState, claimableRewardsUsdc, payoutToken } =
    useClaimReferralEarningsDialog();
  const { hide } = useDialog();

  return (
    <BaseAppDialog onClose={hide}>
      <BaseDialog.Title onClose={hide}>Claim Earnings</BaseDialog.Title>
      <BaseDialog.Body className="flex flex-col gap-y-6">
        <div className="flex flex-col items-center gap-y-1.5">
          <div className="text-text-tertiary">Available to claim</div>
          <div className="text-text-primary flex items-center gap-x-1.5 text-4xl">
            <Image
              className="h-7 w-auto"
              src={payoutToken.icon.asset}
              alt={payoutToken.symbol}
            />
            {formatNumber(claimableRewardsUsdc, {
              formatSpecifier: PresetNumberFormatSpecifier.NUMBER_2DP,
            })}
          </div>
        </div>
        <div className="flex flex-col gap-y-1.5">
          <ClaimReferralEarningsSubmitButton
            state={buttonState}
            onSubmit={onSubmit}
          />
          <p className="text-text-tertiary text-center text-sm">
            You will receive rewards in your wallet
          </p>
        </div>
      </BaseDialog.Body>
    </BaseAppDialog>
  );
}
