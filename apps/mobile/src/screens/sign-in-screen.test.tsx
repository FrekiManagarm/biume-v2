import { render, screen, userEvent } from '@testing-library/react-native';
import { SignInScreen } from './sign-in-screen';

describe('sign in', () => {
  it('offers email and password only', async () => {
    await render(<SignInScreen onSignIn={jest.fn()} />);

    expect(screen.getByLabelText('Adresse e-mail')).toBeOnTheScreen();
    expect(screen.getByLabelText('Mot de passe')).toBeOnTheScreen();
    expect(screen.queryByText(/google/i)).toBeNull();
  });

  it('submits the credentials the practitioner typed', async () => {
    const onSignIn = jest.fn(async () => {});
    const user = userEvent.setup();
    await render(<SignInScreen onSignIn={onSignIn} />);

    await user.type(screen.getByLabelText('Adresse e-mail'), 'a@biume.test');
    await user.type(screen.getByLabelText('Mot de passe'), 'secret');
    await user.press(screen.getByRole('button', { name: 'Se connecter' }));

    expect(onSignIn).toHaveBeenCalledWith({
      email: 'a@biume.test',
      password: 'secret',
    });
  });

  it('shows why a sign-in failed', async () => {
    await render(
      <SignInScreen onSignIn={jest.fn()} error="Identifiants invalides" />,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Identifiants invalides',
    );
  });

  it('disables the button while the request is in flight', async () => {
    await render(<SignInScreen onSignIn={jest.fn()} pending />);

    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  });

  it('states that signing in needs a connection when offline', async () => {
    await render(<SignInScreen onSignIn={jest.fn()} online={false} />);

    expect(
      screen.getByText('Reconnectez-vous à Internet pour vous connecter.'),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Se connecter' })).toBeDisabled();
  });
});
