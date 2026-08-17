import { render, screen, userEvent } from '@testing-library/react-native';
import type { CaptureRowView } from '../capture/capture-list-view';
import { CaptureListScreen } from './capture-list-screen';

function row(overrides: Partial<CaptureRowView> = {}): CaptureRowView {
  return {
    id: 'capture-1',
    label: 'À envoyer',
    status: 'queued',
    actions: ['delete'],
    expiresInHours: 20,
    createdAt: '2026-07-19T10:00:00.000Z',
    accessibilityLabel: 'Dictée À envoyer',
    ...overrides,
  };
}

describe('capture list', () => {
  it.each([
    ['queued', 'À envoyer'],
    ['uploading', 'Envoi en cours'],
    ['uploaded', 'Envoyée'],
    ['needs_action', 'Action requise'],
    ['expired', 'Expirée'],
  ] as const)('labels a %s capture as "%s"', async (status, label) => {
    await render(
      <CaptureListScreen
        rows={[row({ status, label, accessibilityLabel: `Dictée ${label}` })]}
        onAction={jest.fn()}
        onConfirm={jest.fn(async () => true)}
      />,
    );

    expect(screen.getByText(label)).toBeOnTheScreen();
  });

  it('announces each row to a screen reader without naming a patient', async () => {
    await render(
      <CaptureListScreen
        rows={[row()]}
        onAction={jest.fn()}
        onConfirm={jest.fn(async () => true)}
      />,
    );

    const item = screen.getByLabelText('Dictée À envoyer');
    expect(item).toBeOnTheScreen();
  });

  it('shows how long an unsent capture has left', async () => {
    await render(
      <CaptureListScreen
        rows={[row({ expiresInHours: 5 })]}
        onAction={jest.fn()}
        onConfirm={jest.fn(async () => true)}
      />,
    );

    expect(screen.getByText('Expire dans 5 h')).toBeOnTheScreen();
  });

  it('offers only the actions the row allows', async () => {
    await render(
      <CaptureListScreen
        rows={[
          row({
            status: 'needs_action',
            label: 'Action requise',
            actions: ['reconnect', 'delete'],
          }),
        ]}
        onAction={jest.fn()}
        onConfirm={jest.fn(async () => true)}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Se reconnecter' }),
    ).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Réessayer' })).toBeNull();
  });

  it('retries without asking for confirmation', async () => {
    const onAction = jest.fn();
    const onConfirm = jest.fn(async () => true);
    const user = userEvent.setup();
    await render(
      <CaptureListScreen
        rows={[row({ status: 'needs_action', actions: ['retry', 'delete'] })]}
        onAction={onAction}
        onConfirm={onConfirm}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Réessayer' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onAction).toHaveBeenCalledWith('capture-1', 'retry');
  });

  it('asks before deleting a dictation', async () => {
    const onAction = jest.fn();
    const onConfirm = jest.fn(async () => true);
    const user = userEvent.setup();
    await render(
      <CaptureListScreen
        rows={[row()]}
        onAction={onAction}
        onConfirm={onConfirm}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Supprimer' }));

    expect(onConfirm).toHaveBeenCalledWith('delete');
    expect(onAction).toHaveBeenCalledWith('capture-1', 'delete');
  });

  it('does nothing when the practitioner declines the confirmation', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    await render(
      <CaptureListScreen
        rows={[row()]}
        onAction={onAction}
        onConfirm={jest.fn(async () => false)}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Supprimer' }));

    expect(onAction).not.toHaveBeenCalled();
  });

  it('asks before replacing a dictation with a new recording', async () => {
    const onConfirm = jest.fn(async () => true);
    const user = userEvent.setup();
    await render(
      <CaptureListScreen
        rows={[row({ status: 'needs_action', actions: ['redo', 'delete'] })]}
        onAction={jest.fn()}
        onConfirm={onConfirm}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Refaire' }));

    expect(onConfirm).toHaveBeenCalledWith('redo');
  });

  it('explains an empty list', async () => {
    await render(
      <CaptureListScreen
        rows={[]}
        onAction={jest.fn()}
        onConfirm={jest.fn(async () => true)}
      />,
    );

    expect(screen.getByText('Aucune dictée pour le moment.')).toBeOnTheScreen();
  });
});
