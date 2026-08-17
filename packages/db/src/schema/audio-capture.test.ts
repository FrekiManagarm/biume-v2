import { serverCaptureStatuses } from "@biume/contracts/capture";
import { getTableColumns, getTableName } from "drizzle-orm";
import { getTableConfig } from "drizzle-orm/pg-core";
import { describe, expect, it } from "vitest";
import { audioCapture, audioCaptureStatus } from "./audioCapture";

function foreignKeysByColumn(table: typeof audioCapture) {
  return new Map(
    getTableConfig(table).foreignKeys.map((foreignKey) => {
      const reference = foreignKey.reference();
      return [
        reference.columns[0]?.name,
        {
          foreignColumn: reference.foreignColumns[0]?.name,
          foreignTable: getTableConfig(reference.foreignTable).name,
          onDelete: foreignKey.onDelete,
        },
      ];
    }),
  );
}

function indexColumns(name: string) {
  return getTableConfig(audioCapture)
    .indexes.find((index) => index.config.name === name)
    ?.config.columns.map((column) =>
      "name" in column ? column.name : undefined,
    );
}

describe("audio capture schema", () => {
  it("stores captures in their own table", () => {
    expect(getTableName(audioCapture)).toBe("audio_capture");
  });

  it("uses the client generated identifier as the primary key", () => {
    const columns = getTableColumns(audioCapture);
    expect(columns.id.primary).toBe(true);
    expect(columns.id.columnType).toBe("PgUUID");
    expect(columns.id.hasDefault).toBe(false);
  });

  it("requires every column the upload protocol depends on", () => {
    const columns = getTableColumns(audioCapture);
    for (const name of [
      "organizationId",
      "practitionerId",
      "durationMs",
      "mimeType",
      "byteSize",
      "sha256",
      "objectKey",
      "status",
      "attemptCount",
      "createdAt",
      "expiresAt",
    ] as const) {
      expect(columns[name].notNull, `${name} must be not null`).toBe(true);
    }
  });

  it("leaves the optional capture context nullable", () => {
    const columns = getTableColumns(audioCapture);
    for (const name of [
      "appointmentId",
      "patientId",
      "reportId",
      "objectEtag",
      "uploadedAt",
      "purgedAt",
      "lastErrorCode",
    ] as const) {
      expect(columns[name].notNull, `${name} must be nullable`).toBe(false);
    }
  });

  it("keeps a capture when its appointment, patient, or report disappears", () => {
    const references = foreignKeysByColumn(audioCapture);

    expect(references.get("appointment_id")).toEqual({
      foreignColumn: "id",
      foreignTable: "appointments",
      onDelete: "set null",
    });
    expect(references.get("patient_id")).toEqual({
      foreignColumn: "id",
      foreignTable: "pets",
      onDelete: "set null",
    });
    expect(references.get("report_id")).toEqual({
      foreignColumn: "id",
      foreignTable: "advancedReport",
      onDelete: "set null",
    });
  });

  it("removes captures with their organization or practitioner", () => {
    const references = foreignKeysByColumn(audioCapture);

    expect(references.get("organization_id")).toEqual({
      foreignColumn: "id",
      foreignTable: "organizations",
      onDelete: "cascade",
    });
    expect(references.get("practitioner_id")).toEqual({
      foreignColumn: "id",
      foreignTable: "users",
      onDelete: "cascade",
    });
  });

  it("allows exactly one capture per object key", () => {
    const index = getTableConfig(audioCapture).indexes.find(
      (candidate) => candidate.config.name === "audio_capture_object_key_unique",
    );

    expect(index?.config.unique).toBe(true);
    expect(indexColumns("audio_capture_object_key_unique")).toEqual([
      "object_key",
    ]);
  });

  it("indexes the tenant capture listing", () => {
    expect(indexColumns("audio_capture_org_created_idx")).toEqual([
      "organization_id",
      "created_at",
      "id",
    ]);
  });

  it("indexes the expiry sweep", () => {
    expect(indexColumns("audio_capture_status_expires_idx")).toEqual([
      "status",
      "expires_at",
    ]);
  });

  it("declares the server status enum from the shared contract", () => {
    expect(audioCaptureStatus.enumName).toBe("audio_capture_status");
    expect(audioCaptureStatus.enumValues).toEqual([...serverCaptureStatuses]);
  });

  it("defaults a new capture to pending upload with no attempts", () => {
    const columns = getTableColumns(audioCapture);
    expect(columns.status.default).toBe("pending_upload");
    expect(columns.attemptCount.default).toBe(0);
  });

  it("enforces the capture envelope in the database", () => {
    const checkNames = getTableConfig(audioCapture).checks.map(
      (check) => check.name,
    );

    expect(new Set(checkNames)).toEqual(
      new Set([
        "audio_capture_duration_range",
        "audio_capture_byte_size_range",
        "audio_capture_sha256_shape",
        "audio_capture_mime_type",
        "audio_capture_attempt_count_non_negative",
      ]),
    );
  });
});
