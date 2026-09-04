import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

/// Message lu quand ni un bouton ne fait rien, ni une exception ne remonte
/// nulle part : aucune application de téléphonie, une adresse mal formée, et
/// il ne devait plus rien se passer en silence — le praticien qui tape doit
/// savoir que ça n'a pas marché, pas croire à un écran figé.
const String launchFailedMessage = "Impossible d'ouvrir cette application.";

/// `launchUrl` renvoie `false`, sans lever d'exception, quand aucune
/// application ne sait ouvrir l'adresse — et peut aussi lever une exception de
/// plateforme selon l'échec. Les deux cas doivent se voir.
Future<void> launchContact(BuildContext context, Uri uri) async {
  var succeeded = false;
  try {
    succeeded = await launchUrl(uri);
  } catch (_) {
    succeeded = false;
  }
  if (succeeded || !context.mounted) return;
  ScaffoldMessenger.of(
    context,
  ).showSnackBar(const SnackBar(content: Text(launchFailedMessage)));
}

/// Un numéro saisi avec des espaces, points ou tirets ne doit pas partir tel
/// quel, simplement encodé, dans l'adresse `tel:` : seuls les chiffres et un
/// éventuel `+` international sont retenus.
String? normalizedPhone(String? phone) {
  if (phone == null) return null;
  final digits = phone.replaceAll(RegExp('[^0-9+]'), '');
  return digits.isEmpty ? null : digits;
}
