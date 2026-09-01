import { feature, item, plan } from "atmn";
import { autumnFeatureIds, autumnPlanIds } from "#/lib/constants/autumn-ids";

// Features
export const supportPrioritaire = feature({
  id: autumnFeatureIds.supportPrioritaire,
  name: "Support prioritaire",
  type: "boolean",
});

export const fichesClientsPatientsIllimits = feature({
  id: autumnFeatureIds.fichesClientsPatientsIllimits,
  name: "Fiches clients patients illimités",
  type: "boolean",
});

export const suiviDeSantIntelligent = feature({
  id: autumnFeatureIds.suiviDeSantIntelligent,
  name: "Suivi de santé intelligent",
  type: "boolean",
});

export const exportPdfProfessionnel = feature({
  id: autumnFeatureIds.exportPdfProfessionnel,
  name: "Export PDF Professionnel",
  type: "boolean",
});

export const iaVulgarisation = feature({
  id: autumnFeatureIds.iaVulgarisation,
  name: "IA vulgarisation",
  type: "boolean",
});

export const rapportsIllimits = feature({
  id: autumnFeatureIds.rapportsIllimits,
  name: "Rapports illimités",
  type: "boolean",
});

// Products
export const allInclusiveMonthly = plan({
  id: autumnPlanIds.allInclusiveMonthly,
  name: "All inclusive monthly",
  price: {
    amount: 29.99,
    interval: "month",
  },
  items: [
    item({
      featureId: exportPdfProfessionnel.id,
    }),
    item({
      featureId: fichesClientsPatientsIllimits.id,
    }),
    item({
      featureId: iaVulgarisation.id,
    }),
    item({
      featureId: rapportsIllimits.id,
    }),
    item({
      featureId: suiviDeSantIntelligent.id,
    }),
    item({
      featureId: supportPrioritaire.id,
    }),
  ],
  freeTrial: {
    durationLength: 15,
    durationType: "day",
    cardRequired: false,
  },
});

export const allInclusiveYearly = plan({
  id: autumnPlanIds.allInclusiveYearly,
  name: "All inclusive yearly",
  price: {
    amount: 299.88,
    interval: "year",
  },
  items: [
    item({
      featureId: exportPdfProfessionnel.id,
    }),
    item({
      featureId: fichesClientsPatientsIllimits.id,
    }),
    item({
      featureId: iaVulgarisation.id,
    }),
    item({
      featureId: rapportsIllimits.id,
    }),
    item({
      featureId: suiviDeSantIntelligent.id,
    }),
    item({
      featureId: supportPrioritaire.id,
    }),
  ],
  freeTrial: {
    durationLength: 15,
    durationType: "day",
    cardRequired: false,
  },
});
