import { useAppState } from '@/app-state/app-state';
import { SelectOrganizationScreen } from '@/screens/select-organization-screen';

export default function SelectOrganizationRoute() {
  const { organizations, chooseOrganization, online } = useAppState();
  return (
    <SelectOrganizationScreen
      onSelect={chooseOrganization}
      online={online}
      organizations={organizations}
    />
  );
}
