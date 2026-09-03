// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'app_database.dart';

// ignore_for_file: type=lint
class $LocalCapturesTable extends LocalCaptures
    with TableInfo<$LocalCapturesTable, LocalCapture> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $LocalCapturesTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _appointmentIdMeta = const VerificationMeta(
    'appointmentId',
  );
  @override
  late final GeneratedColumn<String> appointmentId = GeneratedColumn<String>(
    'appointment_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  late final GeneratedColumnWithTypeConverter<LocalCaptureStatus, int> status =
      GeneratedColumn<int>(
        'status',
        aliasedName,
        false,
        type: DriftSqlType.int,
        requiredDuringInsert: true,
      ).withConverter<LocalCaptureStatus>($LocalCapturesTable.$converterstatus);
  static const VerificationMeta _durationMsMeta = const VerificationMeta(
    'durationMs',
  );
  @override
  late final GeneratedColumn<int> durationMs = GeneratedColumn<int>(
    'duration_ms',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _byteSizeMeta = const VerificationMeta(
    'byteSize',
  );
  @override
  late final GeneratedColumn<int> byteSize = GeneratedColumn<int>(
    'byte_size',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _sha256Meta = const VerificationMeta('sha256');
  @override
  late final GeneratedColumn<String> sha256 = GeneratedColumn<String>(
    'sha256',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _filePathMeta = const VerificationMeta(
    'filePath',
  );
  @override
  late final GeneratedColumn<String> filePath = GeneratedColumn<String>(
    'file_path',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _attemptCountMeta = const VerificationMeta(
    'attemptCount',
  );
  @override
  late final GeneratedColumn<int> attemptCount = GeneratedColumn<int>(
    'attempt_count',
    aliasedName,
    false,
    type: DriftSqlType.int,
    requiredDuringInsert: false,
    defaultValue: const Constant(0),
  );
  static const VerificationMeta _lastErrorCodeMeta = const VerificationMeta(
    'lastErrorCode',
  );
  @override
  late final GeneratedColumn<String> lastErrorCode = GeneratedColumn<String>(
    'last_error_code',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _nextAttemptAtMeta = const VerificationMeta(
    'nextAttemptAt',
  );
  @override
  late final GeneratedColumn<DateTime> nextAttemptAt =
      GeneratedColumn<DateTime>(
        'next_attempt_at',
        aliasedName,
        true,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: false,
      );
  static const VerificationMeta _createdAtMeta = const VerificationMeta(
    'createdAt',
  );
  @override
  late final GeneratedColumn<DateTime> createdAt = GeneratedColumn<DateTime>(
    'created_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _expiresAtMeta = const VerificationMeta(
    'expiresAt',
  );
  @override
  late final GeneratedColumn<DateTime> expiresAt = GeneratedColumn<DateTime>(
    'expires_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _patientIdMeta = const VerificationMeta(
    'patientId',
  );
  @override
  late final GeneratedColumn<String> patientId = GeneratedColumn<String>(
    'patient_id',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _extractionRequestedAtMeta =
      const VerificationMeta('extractionRequestedAt');
  @override
  late final GeneratedColumn<DateTime> extractionRequestedAt =
      GeneratedColumn<DateTime>(
        'extraction_requested_at',
        aliasedName,
        true,
        type: DriftSqlType.dateTime,
        requiredDuringInsert: false,
      );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    appointmentId,
    status,
    durationMs,
    byteSize,
    sha256,
    filePath,
    attemptCount,
    lastErrorCode,
    nextAttemptAt,
    createdAt,
    expiresAt,
    patientId,
    extractionRequestedAt,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'local_captures';
  @override
  VerificationContext validateIntegrity(
    Insertable<LocalCapture> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('appointment_id')) {
      context.handle(
        _appointmentIdMeta,
        appointmentId.isAcceptableOrUnknown(
          data['appointment_id']!,
          _appointmentIdMeta,
        ),
      );
    }
    if (data.containsKey('duration_ms')) {
      context.handle(
        _durationMsMeta,
        durationMs.isAcceptableOrUnknown(data['duration_ms']!, _durationMsMeta),
      );
    } else if (isInserting) {
      context.missing(_durationMsMeta);
    }
    if (data.containsKey('byte_size')) {
      context.handle(
        _byteSizeMeta,
        byteSize.isAcceptableOrUnknown(data['byte_size']!, _byteSizeMeta),
      );
    } else if (isInserting) {
      context.missing(_byteSizeMeta);
    }
    if (data.containsKey('sha256')) {
      context.handle(
        _sha256Meta,
        sha256.isAcceptableOrUnknown(data['sha256']!, _sha256Meta),
      );
    } else if (isInserting) {
      context.missing(_sha256Meta);
    }
    if (data.containsKey('file_path')) {
      context.handle(
        _filePathMeta,
        filePath.isAcceptableOrUnknown(data['file_path']!, _filePathMeta),
      );
    }
    if (data.containsKey('attempt_count')) {
      context.handle(
        _attemptCountMeta,
        attemptCount.isAcceptableOrUnknown(
          data['attempt_count']!,
          _attemptCountMeta,
        ),
      );
    }
    if (data.containsKey('last_error_code')) {
      context.handle(
        _lastErrorCodeMeta,
        lastErrorCode.isAcceptableOrUnknown(
          data['last_error_code']!,
          _lastErrorCodeMeta,
        ),
      );
    }
    if (data.containsKey('next_attempt_at')) {
      context.handle(
        _nextAttemptAtMeta,
        nextAttemptAt.isAcceptableOrUnknown(
          data['next_attempt_at']!,
          _nextAttemptAtMeta,
        ),
      );
    }
    if (data.containsKey('created_at')) {
      context.handle(
        _createdAtMeta,
        createdAt.isAcceptableOrUnknown(data['created_at']!, _createdAtMeta),
      );
    } else if (isInserting) {
      context.missing(_createdAtMeta);
    }
    if (data.containsKey('expires_at')) {
      context.handle(
        _expiresAtMeta,
        expiresAt.isAcceptableOrUnknown(data['expires_at']!, _expiresAtMeta),
      );
    } else if (isInserting) {
      context.missing(_expiresAtMeta);
    }
    if (data.containsKey('patient_id')) {
      context.handle(
        _patientIdMeta,
        patientId.isAcceptableOrUnknown(data['patient_id']!, _patientIdMeta),
      );
    }
    if (data.containsKey('extraction_requested_at')) {
      context.handle(
        _extractionRequestedAtMeta,
        extractionRequestedAt.isAcceptableOrUnknown(
          data['extraction_requested_at']!,
          _extractionRequestedAtMeta,
        ),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  LocalCapture map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return LocalCapture(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      appointmentId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}appointment_id'],
      ),
      status: $LocalCapturesTable.$converterstatus.fromSql(
        attachedDatabase.typeMapping.read(
          DriftSqlType.int,
          data['${effectivePrefix}status'],
        )!,
      ),
      durationMs: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}duration_ms'],
      )!,
      byteSize: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}byte_size'],
      )!,
      sha256: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}sha256'],
      )!,
      filePath: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}file_path'],
      ),
      attemptCount: attachedDatabase.typeMapping.read(
        DriftSqlType.int,
        data['${effectivePrefix}attempt_count'],
      )!,
      lastErrorCode: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}last_error_code'],
      ),
      nextAttemptAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}next_attempt_at'],
      ),
      createdAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}created_at'],
      )!,
      expiresAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}expires_at'],
      )!,
      patientId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}patient_id'],
      ),
      extractionRequestedAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}extraction_requested_at'],
      ),
    );
  }

  @override
  $LocalCapturesTable createAlias(String alias) {
    return $LocalCapturesTable(attachedDatabase, alias);
  }

  static JsonTypeConverter2<LocalCaptureStatus, int, int> $converterstatus =
      const EnumIndexConverter<LocalCaptureStatus>(LocalCaptureStatus.values);
}

class LocalCapture extends DataClass implements Insertable<LocalCapture> {
  final String id;
  final String? appointmentId;
  final LocalCaptureStatus status;
  final int durationMs;
  final int byteSize;
  final String sha256;
  final String? filePath;
  final int attemptCount;
  final String? lastErrorCode;
  final DateTime? nextAttemptAt;
  final DateTime createdAt;
  final DateTime expiresAt;

  /// Animal choisi pour une capture libre. Écrit localement, envoyé au
  /// serveur juste après la déclaration : c'est la seule « écriture » hors
  /// ligne, et elle appartient à la dictée en file, pas au cache.
  final String? patientId;

  /// Le moment où « Valider la transcription » a été pressé. Sert à afficher
  /// « Biume prépare le compte rendu » sans que le serveur ait à le savoir.
  final DateTime? extractionRequestedAt;
  const LocalCapture({
    required this.id,
    this.appointmentId,
    required this.status,
    required this.durationMs,
    required this.byteSize,
    required this.sha256,
    this.filePath,
    required this.attemptCount,
    this.lastErrorCode,
    this.nextAttemptAt,
    required this.createdAt,
    required this.expiresAt,
    this.patientId,
    this.extractionRequestedAt,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    if (!nullToAbsent || appointmentId != null) {
      map['appointment_id'] = Variable<String>(appointmentId);
    }
    {
      map['status'] = Variable<int>(
        $LocalCapturesTable.$converterstatus.toSql(status),
      );
    }
    map['duration_ms'] = Variable<int>(durationMs);
    map['byte_size'] = Variable<int>(byteSize);
    map['sha256'] = Variable<String>(sha256);
    if (!nullToAbsent || filePath != null) {
      map['file_path'] = Variable<String>(filePath);
    }
    map['attempt_count'] = Variable<int>(attemptCount);
    if (!nullToAbsent || lastErrorCode != null) {
      map['last_error_code'] = Variable<String>(lastErrorCode);
    }
    if (!nullToAbsent || nextAttemptAt != null) {
      map['next_attempt_at'] = Variable<DateTime>(nextAttemptAt);
    }
    map['created_at'] = Variable<DateTime>(createdAt);
    map['expires_at'] = Variable<DateTime>(expiresAt);
    if (!nullToAbsent || patientId != null) {
      map['patient_id'] = Variable<String>(patientId);
    }
    if (!nullToAbsent || extractionRequestedAt != null) {
      map['extraction_requested_at'] = Variable<DateTime>(
        extractionRequestedAt,
      );
    }
    return map;
  }

  LocalCapturesCompanion toCompanion(bool nullToAbsent) {
    return LocalCapturesCompanion(
      id: Value(id),
      appointmentId: appointmentId == null && nullToAbsent
          ? const Value.absent()
          : Value(appointmentId),
      status: Value(status),
      durationMs: Value(durationMs),
      byteSize: Value(byteSize),
      sha256: Value(sha256),
      filePath: filePath == null && nullToAbsent
          ? const Value.absent()
          : Value(filePath),
      attemptCount: Value(attemptCount),
      lastErrorCode: lastErrorCode == null && nullToAbsent
          ? const Value.absent()
          : Value(lastErrorCode),
      nextAttemptAt: nextAttemptAt == null && nullToAbsent
          ? const Value.absent()
          : Value(nextAttemptAt),
      createdAt: Value(createdAt),
      expiresAt: Value(expiresAt),
      patientId: patientId == null && nullToAbsent
          ? const Value.absent()
          : Value(patientId),
      extractionRequestedAt: extractionRequestedAt == null && nullToAbsent
          ? const Value.absent()
          : Value(extractionRequestedAt),
    );
  }

  factory LocalCapture.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return LocalCapture(
      id: serializer.fromJson<String>(json['id']),
      appointmentId: serializer.fromJson<String?>(json['appointmentId']),
      status: $LocalCapturesTable.$converterstatus.fromJson(
        serializer.fromJson<int>(json['status']),
      ),
      durationMs: serializer.fromJson<int>(json['durationMs']),
      byteSize: serializer.fromJson<int>(json['byteSize']),
      sha256: serializer.fromJson<String>(json['sha256']),
      filePath: serializer.fromJson<String?>(json['filePath']),
      attemptCount: serializer.fromJson<int>(json['attemptCount']),
      lastErrorCode: serializer.fromJson<String?>(json['lastErrorCode']),
      nextAttemptAt: serializer.fromJson<DateTime?>(json['nextAttemptAt']),
      createdAt: serializer.fromJson<DateTime>(json['createdAt']),
      expiresAt: serializer.fromJson<DateTime>(json['expiresAt']),
      patientId: serializer.fromJson<String?>(json['patientId']),
      extractionRequestedAt: serializer.fromJson<DateTime?>(
        json['extractionRequestedAt'],
      ),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'appointmentId': serializer.toJson<String?>(appointmentId),
      'status': serializer.toJson<int>(
        $LocalCapturesTable.$converterstatus.toJson(status),
      ),
      'durationMs': serializer.toJson<int>(durationMs),
      'byteSize': serializer.toJson<int>(byteSize),
      'sha256': serializer.toJson<String>(sha256),
      'filePath': serializer.toJson<String?>(filePath),
      'attemptCount': serializer.toJson<int>(attemptCount),
      'lastErrorCode': serializer.toJson<String?>(lastErrorCode),
      'nextAttemptAt': serializer.toJson<DateTime?>(nextAttemptAt),
      'createdAt': serializer.toJson<DateTime>(createdAt),
      'expiresAt': serializer.toJson<DateTime>(expiresAt),
      'patientId': serializer.toJson<String?>(patientId),
      'extractionRequestedAt': serializer.toJson<DateTime?>(
        extractionRequestedAt,
      ),
    };
  }

  LocalCapture copyWith({
    String? id,
    Value<String?> appointmentId = const Value.absent(),
    LocalCaptureStatus? status,
    int? durationMs,
    int? byteSize,
    String? sha256,
    Value<String?> filePath = const Value.absent(),
    int? attemptCount,
    Value<String?> lastErrorCode = const Value.absent(),
    Value<DateTime?> nextAttemptAt = const Value.absent(),
    DateTime? createdAt,
    DateTime? expiresAt,
    Value<String?> patientId = const Value.absent(),
    Value<DateTime?> extractionRequestedAt = const Value.absent(),
  }) => LocalCapture(
    id: id ?? this.id,
    appointmentId: appointmentId.present
        ? appointmentId.value
        : this.appointmentId,
    status: status ?? this.status,
    durationMs: durationMs ?? this.durationMs,
    byteSize: byteSize ?? this.byteSize,
    sha256: sha256 ?? this.sha256,
    filePath: filePath.present ? filePath.value : this.filePath,
    attemptCount: attemptCount ?? this.attemptCount,
    lastErrorCode: lastErrorCode.present
        ? lastErrorCode.value
        : this.lastErrorCode,
    nextAttemptAt: nextAttemptAt.present
        ? nextAttemptAt.value
        : this.nextAttemptAt,
    createdAt: createdAt ?? this.createdAt,
    expiresAt: expiresAt ?? this.expiresAt,
    patientId: patientId.present ? patientId.value : this.patientId,
    extractionRequestedAt: extractionRequestedAt.present
        ? extractionRequestedAt.value
        : this.extractionRequestedAt,
  );
  LocalCapture copyWithCompanion(LocalCapturesCompanion data) {
    return LocalCapture(
      id: data.id.present ? data.id.value : this.id,
      appointmentId: data.appointmentId.present
          ? data.appointmentId.value
          : this.appointmentId,
      status: data.status.present ? data.status.value : this.status,
      durationMs: data.durationMs.present
          ? data.durationMs.value
          : this.durationMs,
      byteSize: data.byteSize.present ? data.byteSize.value : this.byteSize,
      sha256: data.sha256.present ? data.sha256.value : this.sha256,
      filePath: data.filePath.present ? data.filePath.value : this.filePath,
      attemptCount: data.attemptCount.present
          ? data.attemptCount.value
          : this.attemptCount,
      lastErrorCode: data.lastErrorCode.present
          ? data.lastErrorCode.value
          : this.lastErrorCode,
      nextAttemptAt: data.nextAttemptAt.present
          ? data.nextAttemptAt.value
          : this.nextAttemptAt,
      createdAt: data.createdAt.present ? data.createdAt.value : this.createdAt,
      expiresAt: data.expiresAt.present ? data.expiresAt.value : this.expiresAt,
      patientId: data.patientId.present ? data.patientId.value : this.patientId,
      extractionRequestedAt: data.extractionRequestedAt.present
          ? data.extractionRequestedAt.value
          : this.extractionRequestedAt,
    );
  }

  @override
  String toString() {
    return (StringBuffer('LocalCapture(')
          ..write('id: $id, ')
          ..write('appointmentId: $appointmentId, ')
          ..write('status: $status, ')
          ..write('durationMs: $durationMs, ')
          ..write('byteSize: $byteSize, ')
          ..write('sha256: $sha256, ')
          ..write('filePath: $filePath, ')
          ..write('attemptCount: $attemptCount, ')
          ..write('lastErrorCode: $lastErrorCode, ')
          ..write('nextAttemptAt: $nextAttemptAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('expiresAt: $expiresAt, ')
          ..write('patientId: $patientId, ')
          ..write('extractionRequestedAt: $extractionRequestedAt')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(
    id,
    appointmentId,
    status,
    durationMs,
    byteSize,
    sha256,
    filePath,
    attemptCount,
    lastErrorCode,
    nextAttemptAt,
    createdAt,
    expiresAt,
    patientId,
    extractionRequestedAt,
  );
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is LocalCapture &&
          other.id == this.id &&
          other.appointmentId == this.appointmentId &&
          other.status == this.status &&
          other.durationMs == this.durationMs &&
          other.byteSize == this.byteSize &&
          other.sha256 == this.sha256 &&
          other.filePath == this.filePath &&
          other.attemptCount == this.attemptCount &&
          other.lastErrorCode == this.lastErrorCode &&
          other.nextAttemptAt == this.nextAttemptAt &&
          other.createdAt == this.createdAt &&
          other.expiresAt == this.expiresAt &&
          other.patientId == this.patientId &&
          other.extractionRequestedAt == this.extractionRequestedAt);
}

class LocalCapturesCompanion extends UpdateCompanion<LocalCapture> {
  final Value<String> id;
  final Value<String?> appointmentId;
  final Value<LocalCaptureStatus> status;
  final Value<int> durationMs;
  final Value<int> byteSize;
  final Value<String> sha256;
  final Value<String?> filePath;
  final Value<int> attemptCount;
  final Value<String?> lastErrorCode;
  final Value<DateTime?> nextAttemptAt;
  final Value<DateTime> createdAt;
  final Value<DateTime> expiresAt;
  final Value<String?> patientId;
  final Value<DateTime?> extractionRequestedAt;
  final Value<int> rowid;
  const LocalCapturesCompanion({
    this.id = const Value.absent(),
    this.appointmentId = const Value.absent(),
    this.status = const Value.absent(),
    this.durationMs = const Value.absent(),
    this.byteSize = const Value.absent(),
    this.sha256 = const Value.absent(),
    this.filePath = const Value.absent(),
    this.attemptCount = const Value.absent(),
    this.lastErrorCode = const Value.absent(),
    this.nextAttemptAt = const Value.absent(),
    this.createdAt = const Value.absent(),
    this.expiresAt = const Value.absent(),
    this.patientId = const Value.absent(),
    this.extractionRequestedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  LocalCapturesCompanion.insert({
    required String id,
    this.appointmentId = const Value.absent(),
    required LocalCaptureStatus status,
    required int durationMs,
    required int byteSize,
    required String sha256,
    this.filePath = const Value.absent(),
    this.attemptCount = const Value.absent(),
    this.lastErrorCode = const Value.absent(),
    this.nextAttemptAt = const Value.absent(),
    required DateTime createdAt,
    required DateTime expiresAt,
    this.patientId = const Value.absent(),
    this.extractionRequestedAt = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       status = Value(status),
       durationMs = Value(durationMs),
       byteSize = Value(byteSize),
       sha256 = Value(sha256),
       createdAt = Value(createdAt),
       expiresAt = Value(expiresAt);
  static Insertable<LocalCapture> custom({
    Expression<String>? id,
    Expression<String>? appointmentId,
    Expression<int>? status,
    Expression<int>? durationMs,
    Expression<int>? byteSize,
    Expression<String>? sha256,
    Expression<String>? filePath,
    Expression<int>? attemptCount,
    Expression<String>? lastErrorCode,
    Expression<DateTime>? nextAttemptAt,
    Expression<DateTime>? createdAt,
    Expression<DateTime>? expiresAt,
    Expression<String>? patientId,
    Expression<DateTime>? extractionRequestedAt,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (appointmentId != null) 'appointment_id': appointmentId,
      if (status != null) 'status': status,
      if (durationMs != null) 'duration_ms': durationMs,
      if (byteSize != null) 'byte_size': byteSize,
      if (sha256 != null) 'sha256': sha256,
      if (filePath != null) 'file_path': filePath,
      if (attemptCount != null) 'attempt_count': attemptCount,
      if (lastErrorCode != null) 'last_error_code': lastErrorCode,
      if (nextAttemptAt != null) 'next_attempt_at': nextAttemptAt,
      if (createdAt != null) 'created_at': createdAt,
      if (expiresAt != null) 'expires_at': expiresAt,
      if (patientId != null) 'patient_id': patientId,
      if (extractionRequestedAt != null)
        'extraction_requested_at': extractionRequestedAt,
      if (rowid != null) 'rowid': rowid,
    });
  }

  LocalCapturesCompanion copyWith({
    Value<String>? id,
    Value<String?>? appointmentId,
    Value<LocalCaptureStatus>? status,
    Value<int>? durationMs,
    Value<int>? byteSize,
    Value<String>? sha256,
    Value<String?>? filePath,
    Value<int>? attemptCount,
    Value<String?>? lastErrorCode,
    Value<DateTime?>? nextAttemptAt,
    Value<DateTime>? createdAt,
    Value<DateTime>? expiresAt,
    Value<String?>? patientId,
    Value<DateTime?>? extractionRequestedAt,
    Value<int>? rowid,
  }) {
    return LocalCapturesCompanion(
      id: id ?? this.id,
      appointmentId: appointmentId ?? this.appointmentId,
      status: status ?? this.status,
      durationMs: durationMs ?? this.durationMs,
      byteSize: byteSize ?? this.byteSize,
      sha256: sha256 ?? this.sha256,
      filePath: filePath ?? this.filePath,
      attemptCount: attemptCount ?? this.attemptCount,
      lastErrorCode: lastErrorCode ?? this.lastErrorCode,
      nextAttemptAt: nextAttemptAt ?? this.nextAttemptAt,
      createdAt: createdAt ?? this.createdAt,
      expiresAt: expiresAt ?? this.expiresAt,
      patientId: patientId ?? this.patientId,
      extractionRequestedAt:
          extractionRequestedAt ?? this.extractionRequestedAt,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (appointmentId.present) {
      map['appointment_id'] = Variable<String>(appointmentId.value);
    }
    if (status.present) {
      map['status'] = Variable<int>(
        $LocalCapturesTable.$converterstatus.toSql(status.value),
      );
    }
    if (durationMs.present) {
      map['duration_ms'] = Variable<int>(durationMs.value);
    }
    if (byteSize.present) {
      map['byte_size'] = Variable<int>(byteSize.value);
    }
    if (sha256.present) {
      map['sha256'] = Variable<String>(sha256.value);
    }
    if (filePath.present) {
      map['file_path'] = Variable<String>(filePath.value);
    }
    if (attemptCount.present) {
      map['attempt_count'] = Variable<int>(attemptCount.value);
    }
    if (lastErrorCode.present) {
      map['last_error_code'] = Variable<String>(lastErrorCode.value);
    }
    if (nextAttemptAt.present) {
      map['next_attempt_at'] = Variable<DateTime>(nextAttemptAt.value);
    }
    if (createdAt.present) {
      map['created_at'] = Variable<DateTime>(createdAt.value);
    }
    if (expiresAt.present) {
      map['expires_at'] = Variable<DateTime>(expiresAt.value);
    }
    if (patientId.present) {
      map['patient_id'] = Variable<String>(patientId.value);
    }
    if (extractionRequestedAt.present) {
      map['extraction_requested_at'] = Variable<DateTime>(
        extractionRequestedAt.value,
      );
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('LocalCapturesCompanion(')
          ..write('id: $id, ')
          ..write('appointmentId: $appointmentId, ')
          ..write('status: $status, ')
          ..write('durationMs: $durationMs, ')
          ..write('byteSize: $byteSize, ')
          ..write('sha256: $sha256, ')
          ..write('filePath: $filePath, ')
          ..write('attemptCount: $attemptCount, ')
          ..write('lastErrorCode: $lastErrorCode, ')
          ..write('nextAttemptAt: $nextAttemptAt, ')
          ..write('createdAt: $createdAt, ')
          ..write('expiresAt: $expiresAt, ')
          ..write('patientId: $patientId, ')
          ..write('extractionRequestedAt: $extractionRequestedAt, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CachedAppointmentsTable extends CachedAppointments
    with TableInfo<$CachedAppointmentsTable, CachedAppointment> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedAppointmentsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _patientIdMeta = const VerificationMeta(
    'patientId',
  );
  @override
  late final GeneratedColumn<String> patientId = GeneratedColumn<String>(
    'patient_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _patientNameMeta = const VerificationMeta(
    'patientName',
  );
  @override
  late final GeneratedColumn<String> patientName = GeneratedColumn<String>(
    'patient_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _speciesMeta = const VerificationMeta(
    'species',
  );
  @override
  late final GeneratedColumn<String> species = GeneratedColumn<String>(
    'species',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _beginAtMeta = const VerificationMeta(
    'beginAt',
  );
  @override
  late final GeneratedColumn<DateTime> beginAt = GeneratedColumn<DateTime>(
    'begin_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _endAtMeta = const VerificationMeta('endAt');
  @override
  late final GeneratedColumn<DateTime> endAt = GeneratedColumn<DateTime>(
    'end_at',
    aliasedName,
    false,
    type: DriftSqlType.dateTime,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _statusMeta = const VerificationMeta('status');
  @override
  late final GeneratedColumn<String> status = GeneratedColumn<String>(
    'status',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    patientId,
    patientName,
    species,
    beginAt,
    endAt,
    status,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_appointments';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedAppointment> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('patient_id')) {
      context.handle(
        _patientIdMeta,
        patientId.isAcceptableOrUnknown(data['patient_id']!, _patientIdMeta),
      );
    } else if (isInserting) {
      context.missing(_patientIdMeta);
    }
    if (data.containsKey('patient_name')) {
      context.handle(
        _patientNameMeta,
        patientName.isAcceptableOrUnknown(
          data['patient_name']!,
          _patientNameMeta,
        ),
      );
    } else if (isInserting) {
      context.missing(_patientNameMeta);
    }
    if (data.containsKey('species')) {
      context.handle(
        _speciesMeta,
        species.isAcceptableOrUnknown(data['species']!, _speciesMeta),
      );
    } else if (isInserting) {
      context.missing(_speciesMeta);
    }
    if (data.containsKey('begin_at')) {
      context.handle(
        _beginAtMeta,
        beginAt.isAcceptableOrUnknown(data['begin_at']!, _beginAtMeta),
      );
    } else if (isInserting) {
      context.missing(_beginAtMeta);
    }
    if (data.containsKey('end_at')) {
      context.handle(
        _endAtMeta,
        endAt.isAcceptableOrUnknown(data['end_at']!, _endAtMeta),
      );
    } else if (isInserting) {
      context.missing(_endAtMeta);
    }
    if (data.containsKey('status')) {
      context.handle(
        _statusMeta,
        status.isAcceptableOrUnknown(data['status']!, _statusMeta),
      );
    } else if (isInserting) {
      context.missing(_statusMeta);
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedAppointment map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedAppointment(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      patientId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}patient_id'],
      )!,
      patientName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}patient_name'],
      )!,
      species: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}species'],
      )!,
      beginAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}begin_at'],
      )!,
      endAt: attachedDatabase.typeMapping.read(
        DriftSqlType.dateTime,
        data['${effectivePrefix}end_at'],
      )!,
      status: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}status'],
      )!,
    );
  }

  @override
  $CachedAppointmentsTable createAlias(String alias) {
    return $CachedAppointmentsTable(attachedDatabase, alias);
  }
}

class CachedAppointment extends DataClass
    implements Insertable<CachedAppointment> {
  final String id;
  final String patientId;
  final String patientName;
  final String species;
  final DateTime beginAt;
  final DateTime endAt;
  final String status;
  const CachedAppointment({
    required this.id,
    required this.patientId,
    required this.patientName,
    required this.species,
    required this.beginAt,
    required this.endAt,
    required this.status,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['patient_id'] = Variable<String>(patientId);
    map['patient_name'] = Variable<String>(patientName);
    map['species'] = Variable<String>(species);
    map['begin_at'] = Variable<DateTime>(beginAt);
    map['end_at'] = Variable<DateTime>(endAt);
    map['status'] = Variable<String>(status);
    return map;
  }

  CachedAppointmentsCompanion toCompanion(bool nullToAbsent) {
    return CachedAppointmentsCompanion(
      id: Value(id),
      patientId: Value(patientId),
      patientName: Value(patientName),
      species: Value(species),
      beginAt: Value(beginAt),
      endAt: Value(endAt),
      status: Value(status),
    );
  }

  factory CachedAppointment.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedAppointment(
      id: serializer.fromJson<String>(json['id']),
      patientId: serializer.fromJson<String>(json['patientId']),
      patientName: serializer.fromJson<String>(json['patientName']),
      species: serializer.fromJson<String>(json['species']),
      beginAt: serializer.fromJson<DateTime>(json['beginAt']),
      endAt: serializer.fromJson<DateTime>(json['endAt']),
      status: serializer.fromJson<String>(json['status']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'patientId': serializer.toJson<String>(patientId),
      'patientName': serializer.toJson<String>(patientName),
      'species': serializer.toJson<String>(species),
      'beginAt': serializer.toJson<DateTime>(beginAt),
      'endAt': serializer.toJson<DateTime>(endAt),
      'status': serializer.toJson<String>(status),
    };
  }

  CachedAppointment copyWith({
    String? id,
    String? patientId,
    String? patientName,
    String? species,
    DateTime? beginAt,
    DateTime? endAt,
    String? status,
  }) => CachedAppointment(
    id: id ?? this.id,
    patientId: patientId ?? this.patientId,
    patientName: patientName ?? this.patientName,
    species: species ?? this.species,
    beginAt: beginAt ?? this.beginAt,
    endAt: endAt ?? this.endAt,
    status: status ?? this.status,
  );
  CachedAppointment copyWithCompanion(CachedAppointmentsCompanion data) {
    return CachedAppointment(
      id: data.id.present ? data.id.value : this.id,
      patientId: data.patientId.present ? data.patientId.value : this.patientId,
      patientName: data.patientName.present
          ? data.patientName.value
          : this.patientName,
      species: data.species.present ? data.species.value : this.species,
      beginAt: data.beginAt.present ? data.beginAt.value : this.beginAt,
      endAt: data.endAt.present ? data.endAt.value : this.endAt,
      status: data.status.present ? data.status.value : this.status,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedAppointment(')
          ..write('id: $id, ')
          ..write('patientId: $patientId, ')
          ..write('patientName: $patientName, ')
          ..write('species: $species, ')
          ..write('beginAt: $beginAt, ')
          ..write('endAt: $endAt, ')
          ..write('status: $status')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode =>
      Object.hash(id, patientId, patientName, species, beginAt, endAt, status);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedAppointment &&
          other.id == this.id &&
          other.patientId == this.patientId &&
          other.patientName == this.patientName &&
          other.species == this.species &&
          other.beginAt == this.beginAt &&
          other.endAt == this.endAt &&
          other.status == this.status);
}

class CachedAppointmentsCompanion extends UpdateCompanion<CachedAppointment> {
  final Value<String> id;
  final Value<String> patientId;
  final Value<String> patientName;
  final Value<String> species;
  final Value<DateTime> beginAt;
  final Value<DateTime> endAt;
  final Value<String> status;
  final Value<int> rowid;
  const CachedAppointmentsCompanion({
    this.id = const Value.absent(),
    this.patientId = const Value.absent(),
    this.patientName = const Value.absent(),
    this.species = const Value.absent(),
    this.beginAt = const Value.absent(),
    this.endAt = const Value.absent(),
    this.status = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CachedAppointmentsCompanion.insert({
    required String id,
    required String patientId,
    required String patientName,
    required String species,
    required DateTime beginAt,
    required DateTime endAt,
    required String status,
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       patientId = Value(patientId),
       patientName = Value(patientName),
       species = Value(species),
       beginAt = Value(beginAt),
       endAt = Value(endAt),
       status = Value(status);
  static Insertable<CachedAppointment> custom({
    Expression<String>? id,
    Expression<String>? patientId,
    Expression<String>? patientName,
    Expression<String>? species,
    Expression<DateTime>? beginAt,
    Expression<DateTime>? endAt,
    Expression<String>? status,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (patientId != null) 'patient_id': patientId,
      if (patientName != null) 'patient_name': patientName,
      if (species != null) 'species': species,
      if (beginAt != null) 'begin_at': beginAt,
      if (endAt != null) 'end_at': endAt,
      if (status != null) 'status': status,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CachedAppointmentsCompanion copyWith({
    Value<String>? id,
    Value<String>? patientId,
    Value<String>? patientName,
    Value<String>? species,
    Value<DateTime>? beginAt,
    Value<DateTime>? endAt,
    Value<String>? status,
    Value<int>? rowid,
  }) {
    return CachedAppointmentsCompanion(
      id: id ?? this.id,
      patientId: patientId ?? this.patientId,
      patientName: patientName ?? this.patientName,
      species: species ?? this.species,
      beginAt: beginAt ?? this.beginAt,
      endAt: endAt ?? this.endAt,
      status: status ?? this.status,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (patientId.present) {
      map['patient_id'] = Variable<String>(patientId.value);
    }
    if (patientName.present) {
      map['patient_name'] = Variable<String>(patientName.value);
    }
    if (species.present) {
      map['species'] = Variable<String>(species.value);
    }
    if (beginAt.present) {
      map['begin_at'] = Variable<DateTime>(beginAt.value);
    }
    if (endAt.present) {
      map['end_at'] = Variable<DateTime>(endAt.value);
    }
    if (status.present) {
      map['status'] = Variable<String>(status.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedAppointmentsCompanion(')
          ..write('id: $id, ')
          ..write('patientId: $patientId, ')
          ..write('patientName: $patientName, ')
          ..write('species: $species, ')
          ..write('beginAt: $beginAt, ')
          ..write('endAt: $endAt, ')
          ..write('status: $status, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CachedOwnersTable extends CachedOwners
    with TableInfo<$CachedOwnersTable, CachedOwner> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedOwnersTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _emailMeta = const VerificationMeta('email');
  @override
  late final GeneratedColumn<String> email = GeneratedColumn<String>(
    'email',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _phoneMeta = const VerificationMeta('phone');
  @override
  late final GeneratedColumn<String> phone = GeneratedColumn<String>(
    'phone',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  static const VerificationMeta _cityMeta = const VerificationMeta('city');
  @override
  late final GeneratedColumn<String> city = GeneratedColumn<String>(
    'city',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [id, name, email, phone, city];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_owners';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedOwner> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('email')) {
      context.handle(
        _emailMeta,
        email.isAcceptableOrUnknown(data['email']!, _emailMeta),
      );
    }
    if (data.containsKey('phone')) {
      context.handle(
        _phoneMeta,
        phone.isAcceptableOrUnknown(data['phone']!, _phoneMeta),
      );
    }
    if (data.containsKey('city')) {
      context.handle(
        _cityMeta,
        city.isAcceptableOrUnknown(data['city']!, _cityMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedOwner map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedOwner(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      email: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}email'],
      ),
      phone: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}phone'],
      ),
      city: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}city'],
      ),
    );
  }

  @override
  $CachedOwnersTable createAlias(String alias) {
    return $CachedOwnersTable(attachedDatabase, alias);
  }
}

class CachedOwner extends DataClass implements Insertable<CachedOwner> {
  final String id;
  final String name;
  final String? email;
  final String? phone;
  final String? city;
  const CachedOwner({
    required this.id,
    required this.name,
    this.email,
    this.phone,
    this.city,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['name'] = Variable<String>(name);
    if (!nullToAbsent || email != null) {
      map['email'] = Variable<String>(email);
    }
    if (!nullToAbsent || phone != null) {
      map['phone'] = Variable<String>(phone);
    }
    if (!nullToAbsent || city != null) {
      map['city'] = Variable<String>(city);
    }
    return map;
  }

  CachedOwnersCompanion toCompanion(bool nullToAbsent) {
    return CachedOwnersCompanion(
      id: Value(id),
      name: Value(name),
      email: email == null && nullToAbsent
          ? const Value.absent()
          : Value(email),
      phone: phone == null && nullToAbsent
          ? const Value.absent()
          : Value(phone),
      city: city == null && nullToAbsent ? const Value.absent() : Value(city),
    );
  }

  factory CachedOwner.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedOwner(
      id: serializer.fromJson<String>(json['id']),
      name: serializer.fromJson<String>(json['name']),
      email: serializer.fromJson<String?>(json['email']),
      phone: serializer.fromJson<String?>(json['phone']),
      city: serializer.fromJson<String?>(json['city']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'name': serializer.toJson<String>(name),
      'email': serializer.toJson<String?>(email),
      'phone': serializer.toJson<String?>(phone),
      'city': serializer.toJson<String?>(city),
    };
  }

  CachedOwner copyWith({
    String? id,
    String? name,
    Value<String?> email = const Value.absent(),
    Value<String?> phone = const Value.absent(),
    Value<String?> city = const Value.absent(),
  }) => CachedOwner(
    id: id ?? this.id,
    name: name ?? this.name,
    email: email.present ? email.value : this.email,
    phone: phone.present ? phone.value : this.phone,
    city: city.present ? city.value : this.city,
  );
  CachedOwner copyWithCompanion(CachedOwnersCompanion data) {
    return CachedOwner(
      id: data.id.present ? data.id.value : this.id,
      name: data.name.present ? data.name.value : this.name,
      email: data.email.present ? data.email.value : this.email,
      phone: data.phone.present ? data.phone.value : this.phone,
      city: data.city.present ? data.city.value : this.city,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedOwner(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('email: $email, ')
          ..write('phone: $phone, ')
          ..write('city: $city')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, name, email, phone, city);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedOwner &&
          other.id == this.id &&
          other.name == this.name &&
          other.email == this.email &&
          other.phone == this.phone &&
          other.city == this.city);
}

class CachedOwnersCompanion extends UpdateCompanion<CachedOwner> {
  final Value<String> id;
  final Value<String> name;
  final Value<String?> email;
  final Value<String?> phone;
  final Value<String?> city;
  final Value<int> rowid;
  const CachedOwnersCompanion({
    this.id = const Value.absent(),
    this.name = const Value.absent(),
    this.email = const Value.absent(),
    this.phone = const Value.absent(),
    this.city = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CachedOwnersCompanion.insert({
    required String id,
    required String name,
    this.email = const Value.absent(),
    this.phone = const Value.absent(),
    this.city = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       name = Value(name);
  static Insertable<CachedOwner> custom({
    Expression<String>? id,
    Expression<String>? name,
    Expression<String>? email,
    Expression<String>? phone,
    Expression<String>? city,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (name != null) 'name': name,
      if (email != null) 'email': email,
      if (phone != null) 'phone': phone,
      if (city != null) 'city': city,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CachedOwnersCompanion copyWith({
    Value<String>? id,
    Value<String>? name,
    Value<String?>? email,
    Value<String?>? phone,
    Value<String?>? city,
    Value<int>? rowid,
  }) {
    return CachedOwnersCompanion(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      city: city ?? this.city,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (email.present) {
      map['email'] = Variable<String>(email.value);
    }
    if (phone.present) {
      map['phone'] = Variable<String>(phone.value);
    }
    if (city.present) {
      map['city'] = Variable<String>(city.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedOwnersCompanion(')
          ..write('id: $id, ')
          ..write('name: $name, ')
          ..write('email: $email, ')
          ..write('phone: $phone, ')
          ..write('city: $city, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

class $CachedPatientsTable extends CachedPatients
    with TableInfo<$CachedPatientsTable, CachedPatient> {
  @override
  final GeneratedDatabase attachedDatabase;
  final String? _alias;
  $CachedPatientsTable(this.attachedDatabase, [this._alias]);
  static const VerificationMeta _idMeta = const VerificationMeta('id');
  @override
  late final GeneratedColumn<String> id = GeneratedColumn<String>(
    'id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _ownerIdMeta = const VerificationMeta(
    'ownerId',
  );
  @override
  late final GeneratedColumn<String> ownerId = GeneratedColumn<String>(
    'owner_id',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _ownerNameMeta = const VerificationMeta(
    'ownerName',
  );
  @override
  late final GeneratedColumn<String> ownerName = GeneratedColumn<String>(
    'owner_name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _nameMeta = const VerificationMeta('name');
  @override
  late final GeneratedColumn<String> name = GeneratedColumn<String>(
    'name',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _speciesMeta = const VerificationMeta(
    'species',
  );
  @override
  late final GeneratedColumn<String> species = GeneratedColumn<String>(
    'species',
    aliasedName,
    false,
    type: DriftSqlType.string,
    requiredDuringInsert: true,
  );
  static const VerificationMeta _breedMeta = const VerificationMeta('breed');
  @override
  late final GeneratedColumn<String> breed = GeneratedColumn<String>(
    'breed',
    aliasedName,
    true,
    type: DriftSqlType.string,
    requiredDuringInsert: false,
  );
  @override
  List<GeneratedColumn> get $columns => [
    id,
    ownerId,
    ownerName,
    name,
    species,
    breed,
  ];
  @override
  String get aliasedName => _alias ?? actualTableName;
  @override
  String get actualTableName => $name;
  static const String $name = 'cached_patients';
  @override
  VerificationContext validateIntegrity(
    Insertable<CachedPatient> instance, {
    bool isInserting = false,
  }) {
    final context = VerificationContext();
    final data = instance.toColumns(true);
    if (data.containsKey('id')) {
      context.handle(_idMeta, id.isAcceptableOrUnknown(data['id']!, _idMeta));
    } else if (isInserting) {
      context.missing(_idMeta);
    }
    if (data.containsKey('owner_id')) {
      context.handle(
        _ownerIdMeta,
        ownerId.isAcceptableOrUnknown(data['owner_id']!, _ownerIdMeta),
      );
    } else if (isInserting) {
      context.missing(_ownerIdMeta);
    }
    if (data.containsKey('owner_name')) {
      context.handle(
        _ownerNameMeta,
        ownerName.isAcceptableOrUnknown(data['owner_name']!, _ownerNameMeta),
      );
    } else if (isInserting) {
      context.missing(_ownerNameMeta);
    }
    if (data.containsKey('name')) {
      context.handle(
        _nameMeta,
        name.isAcceptableOrUnknown(data['name']!, _nameMeta),
      );
    } else if (isInserting) {
      context.missing(_nameMeta);
    }
    if (data.containsKey('species')) {
      context.handle(
        _speciesMeta,
        species.isAcceptableOrUnknown(data['species']!, _speciesMeta),
      );
    } else if (isInserting) {
      context.missing(_speciesMeta);
    }
    if (data.containsKey('breed')) {
      context.handle(
        _breedMeta,
        breed.isAcceptableOrUnknown(data['breed']!, _breedMeta),
      );
    }
    return context;
  }

  @override
  Set<GeneratedColumn> get $primaryKey => {id};
  @override
  CachedPatient map(Map<String, dynamic> data, {String? tablePrefix}) {
    final effectivePrefix = tablePrefix != null ? '$tablePrefix.' : '';
    return CachedPatient(
      id: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}id'],
      )!,
      ownerId: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}owner_id'],
      )!,
      ownerName: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}owner_name'],
      )!,
      name: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}name'],
      )!,
      species: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}species'],
      )!,
      breed: attachedDatabase.typeMapping.read(
        DriftSqlType.string,
        data['${effectivePrefix}breed'],
      ),
    );
  }

  @override
  $CachedPatientsTable createAlias(String alias) {
    return $CachedPatientsTable(attachedDatabase, alias);
  }
}

class CachedPatient extends DataClass implements Insertable<CachedPatient> {
  final String id;
  final String ownerId;
  final String ownerName;
  final String name;
  final String species;
  final String? breed;
  const CachedPatient({
    required this.id,
    required this.ownerId,
    required this.ownerName,
    required this.name,
    required this.species,
    this.breed,
  });
  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    map['id'] = Variable<String>(id);
    map['owner_id'] = Variable<String>(ownerId);
    map['owner_name'] = Variable<String>(ownerName);
    map['name'] = Variable<String>(name);
    map['species'] = Variable<String>(species);
    if (!nullToAbsent || breed != null) {
      map['breed'] = Variable<String>(breed);
    }
    return map;
  }

  CachedPatientsCompanion toCompanion(bool nullToAbsent) {
    return CachedPatientsCompanion(
      id: Value(id),
      ownerId: Value(ownerId),
      ownerName: Value(ownerName),
      name: Value(name),
      species: Value(species),
      breed: breed == null && nullToAbsent
          ? const Value.absent()
          : Value(breed),
    );
  }

  factory CachedPatient.fromJson(
    Map<String, dynamic> json, {
    ValueSerializer? serializer,
  }) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return CachedPatient(
      id: serializer.fromJson<String>(json['id']),
      ownerId: serializer.fromJson<String>(json['ownerId']),
      ownerName: serializer.fromJson<String>(json['ownerName']),
      name: serializer.fromJson<String>(json['name']),
      species: serializer.fromJson<String>(json['species']),
      breed: serializer.fromJson<String?>(json['breed']),
    );
  }
  @override
  Map<String, dynamic> toJson({ValueSerializer? serializer}) {
    serializer ??= driftRuntimeOptions.defaultSerializer;
    return <String, dynamic>{
      'id': serializer.toJson<String>(id),
      'ownerId': serializer.toJson<String>(ownerId),
      'ownerName': serializer.toJson<String>(ownerName),
      'name': serializer.toJson<String>(name),
      'species': serializer.toJson<String>(species),
      'breed': serializer.toJson<String?>(breed),
    };
  }

  CachedPatient copyWith({
    String? id,
    String? ownerId,
    String? ownerName,
    String? name,
    String? species,
    Value<String?> breed = const Value.absent(),
  }) => CachedPatient(
    id: id ?? this.id,
    ownerId: ownerId ?? this.ownerId,
    ownerName: ownerName ?? this.ownerName,
    name: name ?? this.name,
    species: species ?? this.species,
    breed: breed.present ? breed.value : this.breed,
  );
  CachedPatient copyWithCompanion(CachedPatientsCompanion data) {
    return CachedPatient(
      id: data.id.present ? data.id.value : this.id,
      ownerId: data.ownerId.present ? data.ownerId.value : this.ownerId,
      ownerName: data.ownerName.present ? data.ownerName.value : this.ownerName,
      name: data.name.present ? data.name.value : this.name,
      species: data.species.present ? data.species.value : this.species,
      breed: data.breed.present ? data.breed.value : this.breed,
    );
  }

  @override
  String toString() {
    return (StringBuffer('CachedPatient(')
          ..write('id: $id, ')
          ..write('ownerId: $ownerId, ')
          ..write('ownerName: $ownerName, ')
          ..write('name: $name, ')
          ..write('species: $species, ')
          ..write('breed: $breed')
          ..write(')'))
        .toString();
  }

  @override
  int get hashCode => Object.hash(id, ownerId, ownerName, name, species, breed);
  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      (other is CachedPatient &&
          other.id == this.id &&
          other.ownerId == this.ownerId &&
          other.ownerName == this.ownerName &&
          other.name == this.name &&
          other.species == this.species &&
          other.breed == this.breed);
}

class CachedPatientsCompanion extends UpdateCompanion<CachedPatient> {
  final Value<String> id;
  final Value<String> ownerId;
  final Value<String> ownerName;
  final Value<String> name;
  final Value<String> species;
  final Value<String?> breed;
  final Value<int> rowid;
  const CachedPatientsCompanion({
    this.id = const Value.absent(),
    this.ownerId = const Value.absent(),
    this.ownerName = const Value.absent(),
    this.name = const Value.absent(),
    this.species = const Value.absent(),
    this.breed = const Value.absent(),
    this.rowid = const Value.absent(),
  });
  CachedPatientsCompanion.insert({
    required String id,
    required String ownerId,
    required String ownerName,
    required String name,
    required String species,
    this.breed = const Value.absent(),
    this.rowid = const Value.absent(),
  }) : id = Value(id),
       ownerId = Value(ownerId),
       ownerName = Value(ownerName),
       name = Value(name),
       species = Value(species);
  static Insertable<CachedPatient> custom({
    Expression<String>? id,
    Expression<String>? ownerId,
    Expression<String>? ownerName,
    Expression<String>? name,
    Expression<String>? species,
    Expression<String>? breed,
    Expression<int>? rowid,
  }) {
    return RawValuesInsertable({
      if (id != null) 'id': id,
      if (ownerId != null) 'owner_id': ownerId,
      if (ownerName != null) 'owner_name': ownerName,
      if (name != null) 'name': name,
      if (species != null) 'species': species,
      if (breed != null) 'breed': breed,
      if (rowid != null) 'rowid': rowid,
    });
  }

  CachedPatientsCompanion copyWith({
    Value<String>? id,
    Value<String>? ownerId,
    Value<String>? ownerName,
    Value<String>? name,
    Value<String>? species,
    Value<String?>? breed,
    Value<int>? rowid,
  }) {
    return CachedPatientsCompanion(
      id: id ?? this.id,
      ownerId: ownerId ?? this.ownerId,
      ownerName: ownerName ?? this.ownerName,
      name: name ?? this.name,
      species: species ?? this.species,
      breed: breed ?? this.breed,
      rowid: rowid ?? this.rowid,
    );
  }

  @override
  Map<String, Expression> toColumns(bool nullToAbsent) {
    final map = <String, Expression>{};
    if (id.present) {
      map['id'] = Variable<String>(id.value);
    }
    if (ownerId.present) {
      map['owner_id'] = Variable<String>(ownerId.value);
    }
    if (ownerName.present) {
      map['owner_name'] = Variable<String>(ownerName.value);
    }
    if (name.present) {
      map['name'] = Variable<String>(name.value);
    }
    if (species.present) {
      map['species'] = Variable<String>(species.value);
    }
    if (breed.present) {
      map['breed'] = Variable<String>(breed.value);
    }
    if (rowid.present) {
      map['rowid'] = Variable<int>(rowid.value);
    }
    return map;
  }

  @override
  String toString() {
    return (StringBuffer('CachedPatientsCompanion(')
          ..write('id: $id, ')
          ..write('ownerId: $ownerId, ')
          ..write('ownerName: $ownerName, ')
          ..write('name: $name, ')
          ..write('species: $species, ')
          ..write('breed: $breed, ')
          ..write('rowid: $rowid')
          ..write(')'))
        .toString();
  }
}

abstract class _$AppDatabase extends GeneratedDatabase {
  _$AppDatabase(QueryExecutor e) : super(e);
  $AppDatabaseManager get managers => $AppDatabaseManager(this);
  late final $LocalCapturesTable localCaptures = $LocalCapturesTable(this);
  late final $CachedAppointmentsTable cachedAppointments =
      $CachedAppointmentsTable(this);
  late final $CachedOwnersTable cachedOwners = $CachedOwnersTable(this);
  late final $CachedPatientsTable cachedPatients = $CachedPatientsTable(this);
  @override
  Iterable<TableInfo<Table, Object?>> get allTables =>
      allSchemaEntities.whereType<TableInfo<Table, Object?>>();
  @override
  List<DatabaseSchemaEntity> get allSchemaEntities => [
    localCaptures,
    cachedAppointments,
    cachedOwners,
    cachedPatients,
  ];
}

typedef $$LocalCapturesTableCreateCompanionBuilder =
    LocalCapturesCompanion Function({
      required String id,
      Value<String?> appointmentId,
      required LocalCaptureStatus status,
      required int durationMs,
      required int byteSize,
      required String sha256,
      Value<String?> filePath,
      Value<int> attemptCount,
      Value<String?> lastErrorCode,
      Value<DateTime?> nextAttemptAt,
      required DateTime createdAt,
      required DateTime expiresAt,
      Value<String?> patientId,
      Value<DateTime?> extractionRequestedAt,
      Value<int> rowid,
    });
typedef $$LocalCapturesTableUpdateCompanionBuilder =
    LocalCapturesCompanion Function({
      Value<String> id,
      Value<String?> appointmentId,
      Value<LocalCaptureStatus> status,
      Value<int> durationMs,
      Value<int> byteSize,
      Value<String> sha256,
      Value<String?> filePath,
      Value<int> attemptCount,
      Value<String?> lastErrorCode,
      Value<DateTime?> nextAttemptAt,
      Value<DateTime> createdAt,
      Value<DateTime> expiresAt,
      Value<String?> patientId,
      Value<DateTime?> extractionRequestedAt,
      Value<int> rowid,
    });

class $$LocalCapturesTableFilterComposer
    extends Composer<_$AppDatabase, $LocalCapturesTable> {
  $$LocalCapturesTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get appointmentId => $composableBuilder(
    column: $table.appointmentId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnWithTypeConverterFilters<LocalCaptureStatus, LocalCaptureStatus, int>
  get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnWithTypeConverterFilters(column),
  );

  ColumnFilters<int> get durationMs => $composableBuilder(
    column: $table.durationMs,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get byteSize => $composableBuilder(
    column: $table.byteSize,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get sha256 => $composableBuilder(
    column: $table.sha256,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get filePath => $composableBuilder(
    column: $table.filePath,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<int> get attemptCount => $composableBuilder(
    column: $table.attemptCount,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get lastErrorCode => $composableBuilder(
    column: $table.lastErrorCode,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get nextAttemptAt => $composableBuilder(
    column: $table.nextAttemptAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get expiresAt => $composableBuilder(
    column: $table.expiresAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get patientId => $composableBuilder(
    column: $table.patientId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get extractionRequestedAt => $composableBuilder(
    column: $table.extractionRequestedAt,
    builder: (column) => ColumnFilters(column),
  );
}

class $$LocalCapturesTableOrderingComposer
    extends Composer<_$AppDatabase, $LocalCapturesTable> {
  $$LocalCapturesTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get appointmentId => $composableBuilder(
    column: $table.appointmentId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get durationMs => $composableBuilder(
    column: $table.durationMs,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get byteSize => $composableBuilder(
    column: $table.byteSize,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get sha256 => $composableBuilder(
    column: $table.sha256,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get filePath => $composableBuilder(
    column: $table.filePath,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<int> get attemptCount => $composableBuilder(
    column: $table.attemptCount,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get lastErrorCode => $composableBuilder(
    column: $table.lastErrorCode,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get nextAttemptAt => $composableBuilder(
    column: $table.nextAttemptAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get createdAt => $composableBuilder(
    column: $table.createdAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get expiresAt => $composableBuilder(
    column: $table.expiresAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get patientId => $composableBuilder(
    column: $table.patientId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get extractionRequestedAt => $composableBuilder(
    column: $table.extractionRequestedAt,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$LocalCapturesTableAnnotationComposer
    extends Composer<_$AppDatabase, $LocalCapturesTable> {
  $$LocalCapturesTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get appointmentId => $composableBuilder(
    column: $table.appointmentId,
    builder: (column) => column,
  );

  GeneratedColumnWithTypeConverter<LocalCaptureStatus, int> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);

  GeneratedColumn<int> get durationMs => $composableBuilder(
    column: $table.durationMs,
    builder: (column) => column,
  );

  GeneratedColumn<int> get byteSize =>
      $composableBuilder(column: $table.byteSize, builder: (column) => column);

  GeneratedColumn<String> get sha256 =>
      $composableBuilder(column: $table.sha256, builder: (column) => column);

  GeneratedColumn<String> get filePath =>
      $composableBuilder(column: $table.filePath, builder: (column) => column);

  GeneratedColumn<int> get attemptCount => $composableBuilder(
    column: $table.attemptCount,
    builder: (column) => column,
  );

  GeneratedColumn<String> get lastErrorCode => $composableBuilder(
    column: $table.lastErrorCode,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get nextAttemptAt => $composableBuilder(
    column: $table.nextAttemptAt,
    builder: (column) => column,
  );

  GeneratedColumn<DateTime> get createdAt =>
      $composableBuilder(column: $table.createdAt, builder: (column) => column);

  GeneratedColumn<DateTime> get expiresAt =>
      $composableBuilder(column: $table.expiresAt, builder: (column) => column);

  GeneratedColumn<String> get patientId =>
      $composableBuilder(column: $table.patientId, builder: (column) => column);

  GeneratedColumn<DateTime> get extractionRequestedAt => $composableBuilder(
    column: $table.extractionRequestedAt,
    builder: (column) => column,
  );
}

class $$LocalCapturesTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $LocalCapturesTable,
          LocalCapture,
          $$LocalCapturesTableFilterComposer,
          $$LocalCapturesTableOrderingComposer,
          $$LocalCapturesTableAnnotationComposer,
          $$LocalCapturesTableCreateCompanionBuilder,
          $$LocalCapturesTableUpdateCompanionBuilder,
          (
            LocalCapture,
            BaseReferences<_$AppDatabase, $LocalCapturesTable, LocalCapture>,
          ),
          LocalCapture,
          PrefetchHooks Function()
        > {
  $$LocalCapturesTableTableManager(_$AppDatabase db, $LocalCapturesTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$LocalCapturesTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$LocalCapturesTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$LocalCapturesTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String?> appointmentId = const Value.absent(),
                Value<LocalCaptureStatus> status = const Value.absent(),
                Value<int> durationMs = const Value.absent(),
                Value<int> byteSize = const Value.absent(),
                Value<String> sha256 = const Value.absent(),
                Value<String?> filePath = const Value.absent(),
                Value<int> attemptCount = const Value.absent(),
                Value<String?> lastErrorCode = const Value.absent(),
                Value<DateTime?> nextAttemptAt = const Value.absent(),
                Value<DateTime> createdAt = const Value.absent(),
                Value<DateTime> expiresAt = const Value.absent(),
                Value<String?> patientId = const Value.absent(),
                Value<DateTime?> extractionRequestedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalCapturesCompanion(
                id: id,
                appointmentId: appointmentId,
                status: status,
                durationMs: durationMs,
                byteSize: byteSize,
                sha256: sha256,
                filePath: filePath,
                attemptCount: attemptCount,
                lastErrorCode: lastErrorCode,
                nextAttemptAt: nextAttemptAt,
                createdAt: createdAt,
                expiresAt: expiresAt,
                patientId: patientId,
                extractionRequestedAt: extractionRequestedAt,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                Value<String?> appointmentId = const Value.absent(),
                required LocalCaptureStatus status,
                required int durationMs,
                required int byteSize,
                required String sha256,
                Value<String?> filePath = const Value.absent(),
                Value<int> attemptCount = const Value.absent(),
                Value<String?> lastErrorCode = const Value.absent(),
                Value<DateTime?> nextAttemptAt = const Value.absent(),
                required DateTime createdAt,
                required DateTime expiresAt,
                Value<String?> patientId = const Value.absent(),
                Value<DateTime?> extractionRequestedAt = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => LocalCapturesCompanion.insert(
                id: id,
                appointmentId: appointmentId,
                status: status,
                durationMs: durationMs,
                byteSize: byteSize,
                sha256: sha256,
                filePath: filePath,
                attemptCount: attemptCount,
                lastErrorCode: lastErrorCode,
                nextAttemptAt: nextAttemptAt,
                createdAt: createdAt,
                expiresAt: expiresAt,
                patientId: patientId,
                extractionRequestedAt: extractionRequestedAt,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$LocalCapturesTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $LocalCapturesTable,
      LocalCapture,
      $$LocalCapturesTableFilterComposer,
      $$LocalCapturesTableOrderingComposer,
      $$LocalCapturesTableAnnotationComposer,
      $$LocalCapturesTableCreateCompanionBuilder,
      $$LocalCapturesTableUpdateCompanionBuilder,
      (
        LocalCapture,
        BaseReferences<_$AppDatabase, $LocalCapturesTable, LocalCapture>,
      ),
      LocalCapture,
      PrefetchHooks Function()
    >;
typedef $$CachedAppointmentsTableCreateCompanionBuilder =
    CachedAppointmentsCompanion Function({
      required String id,
      required String patientId,
      required String patientName,
      required String species,
      required DateTime beginAt,
      required DateTime endAt,
      required String status,
      Value<int> rowid,
    });
typedef $$CachedAppointmentsTableUpdateCompanionBuilder =
    CachedAppointmentsCompanion Function({
      Value<String> id,
      Value<String> patientId,
      Value<String> patientName,
      Value<String> species,
      Value<DateTime> beginAt,
      Value<DateTime> endAt,
      Value<String> status,
      Value<int> rowid,
    });

class $$CachedAppointmentsTableFilterComposer
    extends Composer<_$AppDatabase, $CachedAppointmentsTable> {
  $$CachedAppointmentsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get patientId => $composableBuilder(
    column: $table.patientId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get patientName => $composableBuilder(
    column: $table.patientName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get species => $composableBuilder(
    column: $table.species,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get beginAt => $composableBuilder(
    column: $table.beginAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<DateTime> get endAt => $composableBuilder(
    column: $table.endAt,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CachedAppointmentsTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedAppointmentsTable> {
  $$CachedAppointmentsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get patientId => $composableBuilder(
    column: $table.patientId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get patientName => $composableBuilder(
    column: $table.patientName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get species => $composableBuilder(
    column: $table.species,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get beginAt => $composableBuilder(
    column: $table.beginAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<DateTime> get endAt => $composableBuilder(
    column: $table.endAt,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get status => $composableBuilder(
    column: $table.status,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CachedAppointmentsTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedAppointmentsTable> {
  $$CachedAppointmentsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get patientId =>
      $composableBuilder(column: $table.patientId, builder: (column) => column);

  GeneratedColumn<String> get patientName => $composableBuilder(
    column: $table.patientName,
    builder: (column) => column,
  );

  GeneratedColumn<String> get species =>
      $composableBuilder(column: $table.species, builder: (column) => column);

  GeneratedColumn<DateTime> get beginAt =>
      $composableBuilder(column: $table.beginAt, builder: (column) => column);

  GeneratedColumn<DateTime> get endAt =>
      $composableBuilder(column: $table.endAt, builder: (column) => column);

  GeneratedColumn<String> get status =>
      $composableBuilder(column: $table.status, builder: (column) => column);
}

class $$CachedAppointmentsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CachedAppointmentsTable,
          CachedAppointment,
          $$CachedAppointmentsTableFilterComposer,
          $$CachedAppointmentsTableOrderingComposer,
          $$CachedAppointmentsTableAnnotationComposer,
          $$CachedAppointmentsTableCreateCompanionBuilder,
          $$CachedAppointmentsTableUpdateCompanionBuilder,
          (
            CachedAppointment,
            BaseReferences<
              _$AppDatabase,
              $CachedAppointmentsTable,
              CachedAppointment
            >,
          ),
          CachedAppointment,
          PrefetchHooks Function()
        > {
  $$CachedAppointmentsTableTableManager(
    _$AppDatabase db,
    $CachedAppointmentsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CachedAppointmentsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CachedAppointmentsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CachedAppointmentsTableAnnotationComposer(
                $db: db,
                $table: table,
              ),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> patientId = const Value.absent(),
                Value<String> patientName = const Value.absent(),
                Value<String> species = const Value.absent(),
                Value<DateTime> beginAt = const Value.absent(),
                Value<DateTime> endAt = const Value.absent(),
                Value<String> status = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CachedAppointmentsCompanion(
                id: id,
                patientId: patientId,
                patientName: patientName,
                species: species,
                beginAt: beginAt,
                endAt: endAt,
                status: status,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String patientId,
                required String patientName,
                required String species,
                required DateTime beginAt,
                required DateTime endAt,
                required String status,
                Value<int> rowid = const Value.absent(),
              }) => CachedAppointmentsCompanion.insert(
                id: id,
                patientId: patientId,
                patientName: patientName,
                species: species,
                beginAt: beginAt,
                endAt: endAt,
                status: status,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CachedAppointmentsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CachedAppointmentsTable,
      CachedAppointment,
      $$CachedAppointmentsTableFilterComposer,
      $$CachedAppointmentsTableOrderingComposer,
      $$CachedAppointmentsTableAnnotationComposer,
      $$CachedAppointmentsTableCreateCompanionBuilder,
      $$CachedAppointmentsTableUpdateCompanionBuilder,
      (
        CachedAppointment,
        BaseReferences<
          _$AppDatabase,
          $CachedAppointmentsTable,
          CachedAppointment
        >,
      ),
      CachedAppointment,
      PrefetchHooks Function()
    >;
typedef $$CachedOwnersTableCreateCompanionBuilder =
    CachedOwnersCompanion Function({
      required String id,
      required String name,
      Value<String?> email,
      Value<String?> phone,
      Value<String?> city,
      Value<int> rowid,
    });
typedef $$CachedOwnersTableUpdateCompanionBuilder =
    CachedOwnersCompanion Function({
      Value<String> id,
      Value<String> name,
      Value<String?> email,
      Value<String?> phone,
      Value<String?> city,
      Value<int> rowid,
    });

class $$CachedOwnersTableFilterComposer
    extends Composer<_$AppDatabase, $CachedOwnersTable> {
  $$CachedOwnersTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get email => $composableBuilder(
    column: $table.email,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get phone => $composableBuilder(
    column: $table.phone,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get city => $composableBuilder(
    column: $table.city,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CachedOwnersTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedOwnersTable> {
  $$CachedOwnersTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get email => $composableBuilder(
    column: $table.email,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get phone => $composableBuilder(
    column: $table.phone,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get city => $composableBuilder(
    column: $table.city,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CachedOwnersTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedOwnersTable> {
  $$CachedOwnersTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get email =>
      $composableBuilder(column: $table.email, builder: (column) => column);

  GeneratedColumn<String> get phone =>
      $composableBuilder(column: $table.phone, builder: (column) => column);

  GeneratedColumn<String> get city =>
      $composableBuilder(column: $table.city, builder: (column) => column);
}

class $$CachedOwnersTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CachedOwnersTable,
          CachedOwner,
          $$CachedOwnersTableFilterComposer,
          $$CachedOwnersTableOrderingComposer,
          $$CachedOwnersTableAnnotationComposer,
          $$CachedOwnersTableCreateCompanionBuilder,
          $$CachedOwnersTableUpdateCompanionBuilder,
          (
            CachedOwner,
            BaseReferences<_$AppDatabase, $CachedOwnersTable, CachedOwner>,
          ),
          CachedOwner,
          PrefetchHooks Function()
        > {
  $$CachedOwnersTableTableManager(_$AppDatabase db, $CachedOwnersTable table)
    : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CachedOwnersTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CachedOwnersTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CachedOwnersTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String?> email = const Value.absent(),
                Value<String?> phone = const Value.absent(),
                Value<String?> city = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CachedOwnersCompanion(
                id: id,
                name: name,
                email: email,
                phone: phone,
                city: city,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String name,
                Value<String?> email = const Value.absent(),
                Value<String?> phone = const Value.absent(),
                Value<String?> city = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CachedOwnersCompanion.insert(
                id: id,
                name: name,
                email: email,
                phone: phone,
                city: city,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CachedOwnersTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CachedOwnersTable,
      CachedOwner,
      $$CachedOwnersTableFilterComposer,
      $$CachedOwnersTableOrderingComposer,
      $$CachedOwnersTableAnnotationComposer,
      $$CachedOwnersTableCreateCompanionBuilder,
      $$CachedOwnersTableUpdateCompanionBuilder,
      (
        CachedOwner,
        BaseReferences<_$AppDatabase, $CachedOwnersTable, CachedOwner>,
      ),
      CachedOwner,
      PrefetchHooks Function()
    >;
typedef $$CachedPatientsTableCreateCompanionBuilder =
    CachedPatientsCompanion Function({
      required String id,
      required String ownerId,
      required String ownerName,
      required String name,
      required String species,
      Value<String?> breed,
      Value<int> rowid,
    });
typedef $$CachedPatientsTableUpdateCompanionBuilder =
    CachedPatientsCompanion Function({
      Value<String> id,
      Value<String> ownerId,
      Value<String> ownerName,
      Value<String> name,
      Value<String> species,
      Value<String?> breed,
      Value<int> rowid,
    });

class $$CachedPatientsTableFilterComposer
    extends Composer<_$AppDatabase, $CachedPatientsTable> {
  $$CachedPatientsTableFilterComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnFilters<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get ownerId => $composableBuilder(
    column: $table.ownerId,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get ownerName => $composableBuilder(
    column: $table.ownerName,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get species => $composableBuilder(
    column: $table.species,
    builder: (column) => ColumnFilters(column),
  );

  ColumnFilters<String> get breed => $composableBuilder(
    column: $table.breed,
    builder: (column) => ColumnFilters(column),
  );
}

class $$CachedPatientsTableOrderingComposer
    extends Composer<_$AppDatabase, $CachedPatientsTable> {
  $$CachedPatientsTableOrderingComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  ColumnOrderings<String> get id => $composableBuilder(
    column: $table.id,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get ownerId => $composableBuilder(
    column: $table.ownerId,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get ownerName => $composableBuilder(
    column: $table.ownerName,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get name => $composableBuilder(
    column: $table.name,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get species => $composableBuilder(
    column: $table.species,
    builder: (column) => ColumnOrderings(column),
  );

  ColumnOrderings<String> get breed => $composableBuilder(
    column: $table.breed,
    builder: (column) => ColumnOrderings(column),
  );
}

class $$CachedPatientsTableAnnotationComposer
    extends Composer<_$AppDatabase, $CachedPatientsTable> {
  $$CachedPatientsTableAnnotationComposer({
    required super.$db,
    required super.$table,
    super.joinBuilder,
    super.$addJoinBuilderToRootComposer,
    super.$removeJoinBuilderFromRootComposer,
  });
  GeneratedColumn<String> get id =>
      $composableBuilder(column: $table.id, builder: (column) => column);

  GeneratedColumn<String> get ownerId =>
      $composableBuilder(column: $table.ownerId, builder: (column) => column);

  GeneratedColumn<String> get ownerName =>
      $composableBuilder(column: $table.ownerName, builder: (column) => column);

  GeneratedColumn<String> get name =>
      $composableBuilder(column: $table.name, builder: (column) => column);

  GeneratedColumn<String> get species =>
      $composableBuilder(column: $table.species, builder: (column) => column);

  GeneratedColumn<String> get breed =>
      $composableBuilder(column: $table.breed, builder: (column) => column);
}

class $$CachedPatientsTableTableManager
    extends
        RootTableManager<
          _$AppDatabase,
          $CachedPatientsTable,
          CachedPatient,
          $$CachedPatientsTableFilterComposer,
          $$CachedPatientsTableOrderingComposer,
          $$CachedPatientsTableAnnotationComposer,
          $$CachedPatientsTableCreateCompanionBuilder,
          $$CachedPatientsTableUpdateCompanionBuilder,
          (
            CachedPatient,
            BaseReferences<_$AppDatabase, $CachedPatientsTable, CachedPatient>,
          ),
          CachedPatient,
          PrefetchHooks Function()
        > {
  $$CachedPatientsTableTableManager(
    _$AppDatabase db,
    $CachedPatientsTable table,
  ) : super(
        TableManagerState(
          db: db,
          table: table,
          createFilteringComposer: () =>
              $$CachedPatientsTableFilterComposer($db: db, $table: table),
          createOrderingComposer: () =>
              $$CachedPatientsTableOrderingComposer($db: db, $table: table),
          createComputedFieldComposer: () =>
              $$CachedPatientsTableAnnotationComposer($db: db, $table: table),
          updateCompanionCallback:
              ({
                Value<String> id = const Value.absent(),
                Value<String> ownerId = const Value.absent(),
                Value<String> ownerName = const Value.absent(),
                Value<String> name = const Value.absent(),
                Value<String> species = const Value.absent(),
                Value<String?> breed = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CachedPatientsCompanion(
                id: id,
                ownerId: ownerId,
                ownerName: ownerName,
                name: name,
                species: species,
                breed: breed,
                rowid: rowid,
              ),
          createCompanionCallback:
              ({
                required String id,
                required String ownerId,
                required String ownerName,
                required String name,
                required String species,
                Value<String?> breed = const Value.absent(),
                Value<int> rowid = const Value.absent(),
              }) => CachedPatientsCompanion.insert(
                id: id,
                ownerId: ownerId,
                ownerName: ownerName,
                name: name,
                species: species,
                breed: breed,
                rowid: rowid,
              ),
          withReferenceMapper: (p0) => p0
              .map((e) => (e.readTable(table), BaseReferences(db, table, e)))
              .toList(),
          prefetchHooksCallback: null,
        ),
      );
}

typedef $$CachedPatientsTableProcessedTableManager =
    ProcessedTableManager<
      _$AppDatabase,
      $CachedPatientsTable,
      CachedPatient,
      $$CachedPatientsTableFilterComposer,
      $$CachedPatientsTableOrderingComposer,
      $$CachedPatientsTableAnnotationComposer,
      $$CachedPatientsTableCreateCompanionBuilder,
      $$CachedPatientsTableUpdateCompanionBuilder,
      (
        CachedPatient,
        BaseReferences<_$AppDatabase, $CachedPatientsTable, CachedPatient>,
      ),
      CachedPatient,
      PrefetchHooks Function()
    >;

class $AppDatabaseManager {
  final _$AppDatabase _db;
  $AppDatabaseManager(this._db);
  $$LocalCapturesTableTableManager get localCaptures =>
      $$LocalCapturesTableTableManager(_db, _db.localCaptures);
  $$CachedAppointmentsTableTableManager get cachedAppointments =>
      $$CachedAppointmentsTableTableManager(_db, _db.cachedAppointments);
  $$CachedOwnersTableTableManager get cachedOwners =>
      $$CachedOwnersTableTableManager(_db, _db.cachedOwners);
  $$CachedPatientsTableTableManager get cachedPatients =>
      $$CachedPatientsTableTableManager(_db, _db.cachedPatients);
}
