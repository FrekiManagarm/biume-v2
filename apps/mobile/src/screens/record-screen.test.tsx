import { render, screen, userEvent } from '@testing-library/react-native';
import { RecordScreen } from './record-screen';

const baseProps = {
  contextLabel: 'Nala',
  elapsedMs: 0,
  microphoneReady: true,
  online: true,
  onStop: jest.fn(),
  onCancel: jest.fn(),
  onOpenSettings: jest.fn(),
};

describe('record screen', () => {
  it('shows the context being dictated', async () => {
    await render(<RecordScreen {...baseProps} />);

    expect(screen.getByText('Nala')).toBeOnTheScreen();
  });

  it('names a free dictation when there is no context', async () => {
    await render(<RecordScreen {...baseProps} contextLabel={null} />);

    expect(screen.getByText('Dictée libre')).toBeOnTheScreen();
  });

  it('shows elapsed and remaining time', async () => {
    await render(<RecordScreen {...baseProps} elapsedMs={65_000} />);

    expect(screen.getByText('01:05')).toBeOnTheScreen();
    expect(screen.getByText('Reste 08:55')).toBeOnTheScreen();
  });

  it('offers stop and cancel', async () => {
    await render(<RecordScreen {...baseProps} />);

    expect(screen.getByRole('button', { name: 'Arrêter' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Annuler' })).toBeOnTheScreen();
  });

  it('offers neither pause nor resume', async () => {
    await render(<RecordScreen {...baseProps} />);

    expect(screen.queryByRole('button', { name: /pause/i })).toBeNull();
    expect(screen.queryByRole('button', { name: /reprendre/i })).toBeNull();
  });

  it('stops when asked', async () => {
    const onStop = jest.fn();
    const user = userEvent.setup();
    await render(<RecordScreen {...baseProps} onStop={onStop} />);

    await user.press(screen.getByRole('button', { name: 'Arrêter' }));

    expect(onStop).toHaveBeenCalled();
  });

  it('keeps recording available offline', async () => {
    await render(<RecordScreen {...baseProps} online={false} />);

    expect(screen.getByRole('button', { name: 'Arrêter' })).not.toBeDisabled();
    expect(
      screen.getByText('Hors ligne : la dictée sera envoyée plus tard.'),
    ).toBeOnTheScreen();
  });

  it('explains a refused microphone and offers the system settings', async () => {
    const onOpenSettings = jest.fn();
    const user = userEvent.setup();
    await render(
      <RecordScreen
        {...baseProps}
        microphoneReady={false}
        onOpenSettings={onOpenSettings}
      />,
    );

    expect(
      screen.getByText(
        'Biume a besoin du microphone. Autorisez-le dans les réglages.',
      ),
    ).toBeOnTheScreen();
    await user.press(
      screen.getByRole('button', { name: 'Ouvrir les réglages' }),
    );
    expect(onOpenSettings).toHaveBeenCalled();
  });

  it('announces the remaining time to a screen reader', async () => {
    await render(<RecordScreen {...baseProps} elapsedMs={30_000} />);

    expect(
      screen.getByLabelText('Enregistrement en cours, reste 09:30'),
    ).toBeOnTheScreen();
  });
});
