/// Depuis combien de temps une chose attend, dite comme on la dirait à voix
/// haute : « il y a 40 min », « hier ». Un horodatage absolu obligerait le
/// praticien à faire la soustraction lui-même, entre deux séances.
String timeAgo(DateTime moment, {DateTime? now}) {
  final reference = (now ?? DateTime.now()).toLocal();
  final local = moment.toLocal();
  final elapsed = reference.difference(local);

  // Le jour de calendrier passe avant les heures écoulées : à 14 h, une
  // chose dite hier à 16 h se dit « hier », jamais « il y a 22 h ».
  final today = DateTime(reference.year, reference.month, reference.day);
  final day = DateTime(local.year, local.month, local.day);
  final days = today.difference(day).inDays;

  if (days <= 0) {
    // Une horloge de téléphone en avance sur le serveur produit un écart
    // négatif : le dire « dans 3 minutes » n'aiderait personne.
    if (elapsed.inMinutes < 1) return "à l'instant";
    if (elapsed.inMinutes < 60) return 'il y a ${elapsed.inMinutes} min';
    return 'il y a ${elapsed.inHours} h';
  }
  if (days == 1) return 'hier';
  if (days < 7) return 'il y a $days jours';
  if (days < 14) return 'la semaine dernière';
  return 'il y a ${days ~/ 7} semaines';
}
