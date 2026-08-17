import { render, screen, userEvent } from '@testing-library/react-native';
import { ReviewScreen } from './review-screen';

const baseProps = {
  contextLabel: 'Nala',
  durationMs: 125_000,
  playing: false,
  onTogglePlayback: jest.fn(),
  onRedo: jest.fn(),
  onValidate: jest.fn(),
  onConfirmRedo: jest.fn(async () => true),
};

describe('review screen', () => {
  it('offers exactly the two decisions the practitioner has', async () => {
    await render(<ReviewScreen {...baseProps} />);

    expect(
      screen.getByRole('button', { name: 'Recommencer' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Valider la dictée' }),
    ).toBeOnTheScreen();
  });

  it('shows the recorded duration', async () => {
    await render(<ReviewScreen {...baseProps} />);

    expect(screen.getByText('02:05')).toBeOnTheScreen();
  });

  it('plays and pauses the decrypted audio', async () => {
    const onTogglePlayback = jest.fn();
    const user = userEvent.setup();
    await render(
      <ReviewScreen {...baseProps} onTogglePlayback={onTogglePlayback} />,
    );

    await user.press(screen.getByRole('button', { name: 'Écouter' }));

    expect(onTogglePlayback).toHaveBeenCalled();
  });

  it('labels the control by what it will do next', async () => {
    await render(<ReviewScreen {...baseProps} playing />);

    expect(screen.getByRole('button', { name: 'Pause' })).toBeOnTheScreen();
  });

  it('validates without asking and without a network', async () => {
    const onValidate = jest.fn();
    const onConfirmRedo = jest.fn(async () => true);
    const user = userEvent.setup();
    await render(
      <ReviewScreen
        {...baseProps}
        online={false}
        onConfirmRedo={onConfirmRedo}
        onValidate={onValidate}
      />,
    );

    const button = screen.getByRole('button', { name: 'Valider la dictée' });
    expect(button).not.toBeDisabled();
    await user.press(button);

    expect(onConfirmRedo).not.toHaveBeenCalled();
    expect(onValidate).toHaveBeenCalled();
  });

  it('asks before discarding the take', async () => {
    const onRedo = jest.fn();
    const onConfirmRedo = jest.fn(async () => true);
    const user = userEvent.setup();
    await render(
      <ReviewScreen
        {...baseProps}
        onConfirmRedo={onConfirmRedo}
        onRedo={onRedo}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Recommencer' }));

    expect(onConfirmRedo).toHaveBeenCalled();
    expect(onRedo).toHaveBeenCalled();
  });

  it('keeps the take when the practitioner declines', async () => {
    const onRedo = jest.fn();
    const user = userEvent.setup();
    await render(
      <ReviewScreen
        {...baseProps}
        onConfirmRedo={jest.fn(async () => false)}
        onRedo={onRedo}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Recommencer' }));

    expect(onRedo).not.toHaveBeenCalled();
  });

  it('says the dictation will be sent later when offline', async () => {
    await render(<ReviewScreen {...baseProps} online={false} />);

    expect(
      screen.getByText('Hors ligne : la dictée partira dès le retour du réseau.'),
    ).toBeOnTheScreen();
  });
});
