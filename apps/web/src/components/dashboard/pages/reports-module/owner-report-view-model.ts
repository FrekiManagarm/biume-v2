import {
  deriveOwnerContentStatus,
  resolveOwnerText,
  type OwnerContentRecord,
  type OwnerSourceItem,
} from "./owner-content";

export function buildOwnerReportViewModel(
  sources: OwnerSourceItem[],
  records: OwnerContentRecord[],
) {
  const byKey = Object.fromEntries(
    sources.map((source) => {
      const record = records.find(
        (item) =>
          item.sourceKind === source.sourceKind &&
          item.sourceId === source.sourceId,
      );

      return [
        source.key,
        {
          ...resolveOwnerText(source, record),
          key: source.key,
          sourceKind: source.sourceKind,
          sourceId: source.sourceId,
          section: source.section,
          professionalText: source.professionalText,
          status: deriveOwnerContentStatus(source, record),
        },
      ];
    }),
  );

  return {
    byKey,
    sections: {
      clinical: sources.filter((source) => source.section === "clinical"),
      anatomical: sources.filter((source) => source.section === "anatomical"),
      recommendations: sources.filter(
        (source) => source.section === "recommendations",
      ),
      notes: sources.filter((source) => source.section === "notes"),
    },
  };
}
