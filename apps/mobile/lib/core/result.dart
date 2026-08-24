import 'failure.dart';

/// Résultat d'une opération de domaine.
///
/// Scellé : le `switch` exhaustif de Dart 3 rend impossible d'oublier le cas
/// d'échec, ce qu'un type nullable ou une exception n'assurent pas.
sealed class Result<T> {
  const Result();

  bool get isSuccess => this is Success<T>;

  T? get valueOrNull => switch (this) {
    Success<T>(:final value) => value,
    Err<T>() => null,
  };

  Failure? get failureOrNull => switch (this) {
    Success<T>() => null,
    Err<T>(:final failure) => failure,
  };
}

final class Success<T> extends Result<T> {
  const Success(this.value);
  final T value;
}

final class Err<T> extends Result<T> {
  const Err(this.failure);
  final Failure failure;
}
