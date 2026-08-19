import { clockType, fontFamily, typography } from './tokens';

// Le mode d'échec de cette tâche est silencieux : une entrée de `typography`
// qui oublie `fontFamily` rend un écran partiellement dans la police système,
// plus difficile à repérer qu'un basculement complet. Ce test fige la
// complétude — il ne peut pas vérifier le chargement réel de la police
// (impossible sans simulateur), seulement que chaque entrée pointe vers la
// même constante que celle importée par `app/_layout.tsx`.
describe('typographie mobile', () => {
  const typographyEntries = Object.entries(typography) as Array<
    [keyof typeof typography, (typeof typography)[keyof typeof typography]]
  >;

  it.each(typographyEntries)(
    'typography.%s porte la famille du web',
    (_name, style) => {
      expect(style.fontFamily).toBe(fontFamily);
    },
  );

  it('clockType porte la famille du web', () => {
    expect(clockType.fontFamily).toBe(fontFamily);
  });
});
