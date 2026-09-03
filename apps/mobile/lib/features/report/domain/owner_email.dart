/// Une adresse plausible : quelque chose, une arobase, un domaine à point.
///
/// Volontairement large. Le serveur reste l'autorité ; ce contrôle n'est là
/// que pour éviter au praticien un aller-retour réseau qui reviendrait en
/// message générique alors qu'il lui manque un caractère.
final _shape = RegExp(r'^[^@\s]+@[^@\s.]+(\.[^@\s.]+)+$');

/// Ce qu'il faut corriger, ou `null` si l'adresse peut partir.
String? ownerEmailError(String raw) {
  final value = raw.trim();
  if (value.isEmpty) return "Indiquez l'adresse e-mail du propriétaire.";
  if (!_shape.hasMatch(value)) {
    return 'Cette adresse est incomplète : il faut un @ et un domaine, '
        'comme camille@exemple.fr.';
  }
  return null;
}

/// Ce qui part vers le serveur : sans espaces autour, en minuscules.
String normalizeOwnerEmail(String raw) => raw.trim().toLowerCase();
