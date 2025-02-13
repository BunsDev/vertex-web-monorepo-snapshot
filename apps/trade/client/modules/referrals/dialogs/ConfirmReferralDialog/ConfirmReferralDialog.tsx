import { joinClassNames } from '@vertex-protocol/web-common';
import { BaseDialog } from 'client/components/BaseDialog/BaseDialog';
import { CheckmarkIcon } from 'client/components/CheckmarkIcon';
import { IdentityIcon } from 'client/components/Icons/IdentityIcon';
import { BaseAppDialog } from 'client/modules/app/dialogs/BaseAppDialog';
import { useDialog } from 'client/modules/app/dialogs/hooks/useDialog';
import { FUUL_REFERRALS_REWARDS_CONFIG } from 'client/modules/referrals/consts';
import { ConfirmReferralSubmitButton } from 'client/modules/referrals/dialogs/ConfirmReferralDialog/ConfirmReferralSubmitButton';
import { useConfirmReferralDialog } from 'client/modules/referrals/dialogs/ConfirmReferralDialog/hooks/useConfirmReferralDialog';
import { formatReferralCode } from 'client/modules/referrals/utils/formatReferralCode';
import { VertexReferralLinkBar } from 'client/pages/VertexReferrals/components/ReferralsReferTradersCard/VertexReferralLinkBar';

export function ConfirmReferralDialog() {
  const { hide } = useDialog();
  const {
    confirmButtonState,
    onConfirmReferral,
    payoutToken,
    referralCodeForCurrentUser,
    referralCodeForSession,
  } = useConfirmReferralDialog();

  const isReferralConfirmed = confirmButtonState === 'success';

  const confirmReferralContent = (
    <div className="flex flex-col gap-y-3">
      <div
        className={joinClassNames(
          'flex flex-col items-center gap-y-6',
          'text-text-tertiary text-sm',
        )}
      >
        <div className="flex items-center gap-x-1.5">
          <IdentityIcon size={22} identifier={referralCodeForSession} />
          <span className="text-text-primary">
            {formatReferralCode(referralCodeForSession)}
          </span>
          referred you.
        </div>
        <p className="text-text-primary text-center text-lg">
          As a referee, you save{' '}
          {FUUL_REFERRALS_REWARDS_CONFIG.rebatePercentage}% on all fees
        </p>
        <p>To continue, please confirm the referral</p>
      </div>
      <ConfirmReferralSubmitButton
        state={confirmButtonState}
        onClick={onConfirmReferral}
      />
    </div>
  );

  const referralConfirmedContent = (
    <div className="flex flex-col items-center gap-y-5">
      <CheckmarkIcon size={90} />
      <div className="flex flex-col gap-y-1 text-center">
        <p className="text-text-primary text-xl">Referral Confirmed!</p>
        <p className="text-text-secondary text-sm">
          Share the link below to refer other traders and earn more rewards.
        </p>
      </div>
      <VertexReferralLinkBar
        // w-full is required in order for truncate text to work properly
        className="w-full"
        referralCode={referralCodeForCurrentUser}
        payoutToken={payoutToken}
      />
    </div>
  );

  return (
    <BaseAppDialog onClose={hide}>
      <BaseDialog.Title onClose={hide}>Confirm Referral</BaseDialog.Title>
      <BaseDialog.Body>
        {isReferralConfirmed
          ? referralConfirmedContent
          : confirmReferralContent}
      </BaseDialog.Body>
    </BaseAppDialog>
  );
}
