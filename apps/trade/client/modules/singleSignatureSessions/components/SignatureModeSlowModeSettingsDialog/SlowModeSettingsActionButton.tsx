import { ButtonHelperInfo, PrimaryButton } from '@vertex-protocol/web-ui';
import { ButtonStateContent } from 'client/components/ButtonStateContent';
import {
  SignatureModeSlowModeSettingsAction,
  SignatureModeSlowModeSettingsActionButtonState,
} from 'client/modules/singleSignatureSessions/components/SignatureModeSlowModeSettingsDialog/hooks/types';

interface Props {
  buttonState: SignatureModeSlowModeSettingsActionButtonState;
  userAction: SignatureModeSlowModeSettingsAction;
}

export function SlowModeSettingsActionButton({
  buttonState,
  userAction,
}: Props) {
  const buttonContent = (() => {
    switch (buttonState) {
      case 'success':
        return <ButtonStateContent.Success message="Trading Mode Saved" />;
      case 'approve_success':
        return <ButtonStateContent.Success message="Fee Approved" />;
      case 'idle':
        switch (userAction) {
          case 'approve':
            return `Approve Fee`;
          case 'save_locally':
            return 'Save';
          case 'execute_slow_mode':
            return 'Save & Send Transaction';
        }
        // This shouldn't be a valid case
        return '';
      case 'disabled':
        if (userAction === 'no_action_required') {
          return 'Configure Signature Mode';
        }
        return 'Enter 1CT Private Key';
      case 'loading':
        if (userAction === 'save_locally') {
          return 'Saving';
        }
        return 'Confirm Transaction';
    }
  })();

  return (
    <ButtonHelperInfo.Container>
      <PrimaryButton
        type="submit"
        isLoading={buttonState === 'loading'}
        disabled={buttonState === 'disabled'}
      >
        {buttonContent}
      </PrimaryButton>
      {buttonState === 'success' && (
        <ButtonHelperInfo.Content>
          You may now close this dialog. It may take a minute for your trading
          mode to update.
        </ButtonHelperInfo.Content>
      )}
    </ButtonHelperInfo.Container>
  );
}
