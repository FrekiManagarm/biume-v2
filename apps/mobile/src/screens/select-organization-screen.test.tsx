import { render, screen, userEvent } from '@testing-library/react-native';
import { SelectOrganizationScreen } from './select-organization-screen';

const organizations = [
  { id: 'org-1', name: 'Cabinet Nord' },
  { id: 'org-2', name: 'Cabinet Sud' },
];

describe('organization selection', () => {
  it('asks before showing any agenda', async () => {
    await render(
      <SelectOrganizationScreen
        organizations={organizations}
        onSelect={jest.fn()}
      />,
    );

    expect(
      screen.getByRole('header', { name: 'Choisissez votre entreprise' }),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cabinet Nord' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cabinet Sud' })).toBeOnTheScreen();
  });

  it('activates the organization the practitioner picked', async () => {
    const onSelect = jest.fn(async () => {});
    const user = userEvent.setup();
    await render(
      <SelectOrganizationScreen
        organizations={organizations}
        onSelect={onSelect}
      />,
    );

    await user.press(screen.getByRole('button', { name: 'Cabinet Sud' }));

    expect(onSelect).toHaveBeenCalledWith('org-2');
  });

  it('explains an empty list rather than showing nothing', async () => {
    await render(
      <SelectOrganizationScreen organizations={[]} onSelect={jest.fn()} />,
    );

    expect(
      screen.getByText('Aucune entreprise n’est associée à ce compte.'),
    ).toBeOnTheScreen();
  });

  it('needs a connection to change the active organization', async () => {
    await render(
      <SelectOrganizationScreen
        organizations={organizations}
        onSelect={jest.fn()}
        online={false}
      />,
    );

    expect(
      screen.getByText(
        'Reconnectez-vous à Internet pour choisir une entreprise.',
      ),
    ).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cabinet Nord' })).toBeDisabled();
  });
});
