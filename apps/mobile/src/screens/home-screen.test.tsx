import type { MobileAppointment } from '@biume/contracts/capture';
import { render, screen, userEvent } from '@testing-library/react-native';
import { HomeScreen } from './home-screen';

function appointment(
  overrides: Partial<MobileAppointment> & { id: string },
): MobileAppointment {
  return {
    patientId: 'pet-1',
    patientName: 'Nala',
    animalType: 'DOG',
    beginAt: '2026-07-19T09:00:00.000Z',
    endAt: '2026-07-19T09:45:00.000Z',
    status: 'COMPLETED',
    ...overrides,
  };
}

const primary = appointment({ id: 'primary' });
const upcoming = [
  appointment({ id: 'next-1', patientName: 'Pixel', status: 'CONFIRMED' }),
  appointment({ id: 'next-2', patientName: 'Ruby', status: 'CONFIRMED' }),
];

describe('home', () => {
  it('offers the selected appointment as the primary action', async () => {
    await render(
      <HomeScreen
        primary={primary}
        upcoming={upcoming}
        onStartCapture={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Dicter pour Nala' }),
    ).toBeOnTheScreen();
  });

  it('always offers a free dictation', async () => {
    await render(
      <HomeScreen primary={null} upcoming={[]} onStartCapture={jest.fn()} />,
    );

    expect(
      screen.getByRole('button', { name: 'Dictée libre' }),
    ).toBeOnTheScreen();
  });

  it('starts a capture attached to the primary appointment', async () => {
    const onStartCapture = jest.fn();
    const user = userEvent.setup();
    await render(
      <HomeScreen
        primary={primary}
        upcoming={upcoming}
        onStartCapture={onStartCapture}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Dicter pour Nala' }));

    expect(onStartCapture).toHaveBeenCalledWith('primary');
  });

  it('starts a capture attached to nothing', async () => {
    const onStartCapture = jest.fn();
    const user = userEvent.setup();
    await render(
      <HomeScreen primary={primary} upcoming={[]} onStartCapture={onStartCapture} />,
    );

    await user.press(screen.getByRole('button', { name: 'Dictée libre' }));

    expect(onStartCapture).toHaveBeenCalledWith(null);
  });

  it('lists the next appointments compactly', async () => {
    await render(
      <HomeScreen
        primary={primary}
        upcoming={upcoming}
        onStartCapture={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Dicter pour Pixel' }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole('button', { name: 'Dicter pour Ruby' }),
    ).toBeOnTheScreen();
  });

  it('keeps cached appointments visible offline', async () => {
    await render(
      <HomeScreen
        primary={primary}
        upcoming={upcoming}
        onStartCapture={jest.fn()}
        online={false}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Dicter pour Nala' }),
    ).toBeOnTheScreen();
  });

  it('says a reconnection is needed to refresh the agenda', async () => {
    await render(
      <HomeScreen
        primary={primary}
        upcoming={upcoming}
        onStartCapture={jest.fn()}
        online={false}
      />,
    );

    expect(
      screen.getByText(
        'Hors ligne : agenda en cache. Reconnectez-vous pour l’actualiser.',
      ),
    ).toBeOnTheScreen();
  });

  it('lets a dictation start while offline', async () => {
    await render(
      <HomeScreen
        primary={primary}
        upcoming={[]}
        onStartCapture={jest.fn()}
        online={false}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Dictée libre' }),
    ).not.toBeDisabled();
  });

  it('explains an empty agenda', async () => {
    await render(
      <HomeScreen primary={null} upcoming={[]} onStartCapture={jest.fn()} />,
    );

    expect(
      screen.getByText('Aucun rendez-vous dans la période affichée.'),
    ).toBeOnTheScreen();
  });
});
