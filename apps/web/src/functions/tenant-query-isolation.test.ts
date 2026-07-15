import { PgDialect } from "drizzle-orm/pg-core";
import { describe, expect, test } from "vitest";

import { getClientRelationsForOrganization } from "./tenant-query-isolation";

const dialect = new PgDialect();

describe("getClientRelationsForOrganization", () => {
  test("filters nested patients and reports with the current organization id", () => {
    const relations = getClientRelationsForOrganization("org-1");

    expect(dialect.sqlToQuery(relations.pets.where.getSQL()).params).toEqual([
      "org-1",
    ]);
    expect(
      dialect.sqlToQuery(relations.pets.with.advancedReport.where.getSQL())
        .params,
    ).toEqual(["org-1"]);
  });
});
