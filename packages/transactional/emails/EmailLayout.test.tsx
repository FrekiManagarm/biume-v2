import { describe, expect, test } from "bun:test";
import { render } from "@react-email/components";

import { EmailLayout } from "./EmailLayout";
import TrialEndingReminderEmail from "./TrialEndingReminderEmail";
import { TrialEndingOrg } from "./TrialEndingOrg";
import TrialReminderEmail from "./TrialReminderEmail";

describe("EmailLayout", () => {
  test("renders the approved Biume logo, colour and preview", async () => {
    const html = await render(
      <EmailLayout preview="Prévisualisation Biume">
        <p>Contenu</p>
      </EmailLayout>,
    );

    expect(html).toContain("https://biume.com/brand/biume-logo.png");
    expect(html).toContain('width="56"');
    expect(html).toContain("#8E82E8");
    expect(html).toContain("Prévisualisation Biume");
  });
});

describe("trial email migration", () => {
  test("uses the shared editorial treatment for every remaining trial reminder", async () => {
    const props = {
      organizationName: "Clinique Biume",
      trialEndDate: new Date("2026-07-25T00:00:00Z"),
      daysRemaining: 3,
      contactEmail: "bonjour@biume.com",
      upgradeUrl: "https://biume.com/billing",
    };

    const html = await Promise.all([
      render(<TrialEndingOrg {...props} />),
      render(<TrialEndingReminderEmail {...props} cancelUrl="https://biume.com/cancel" />),
      render(<TrialReminderEmail {...props} />),
    ]);

    for (const email of html) {
      expect(email).toContain("Votre espace Biume");
      expect(email).toContain("#F3F0FC");
    }
  });
});
