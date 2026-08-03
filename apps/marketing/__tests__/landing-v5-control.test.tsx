import { afterEach, describe, expect, test } from "bun:test";

import { LandingV5Control } from "../components/landing-v5/control";
import { CONTROL_PASSAGES } from "../components/landing-v5/content";
import { renderWithLandingImageConfig, textOnly } from "./landing-test-utils";
import { cleanup, fireEvent, render, within } from "./dom-test-utils";

afterEach(cleanup);

describe("landing-v5 control", () => {
  test("renders the three passages, all pending by default", () => {
    const html = renderWithLandingImageConfig(<LandingV5Control />);
    const text = textOnly(html);

    expect(html).toContain('id="controle"');
    for (const passage of CONTROL_PASSAGES) {
      expect(text).toContain(passage.label);
      expect(text).toContain(passage.text);
    }
    expect(text).toContain("3 passages attendent votre relecture.");
    expect(html.match(/data-state="attente"/g)).toHaveLength(3);
  });

  test("validates passages one by one and unlocks the send button only when all three are validated", () => {
    const { container } = render(<LandingV5Control />);
    const passages = CONTROL_PASSAGES.map(
      (passage) =>
        container.querySelector<HTMLButtonElement>(
          `[data-control-passage="${passage.id}"]`,
        )!,
    );
    const sendButton = within(container).getByRole("button", {
      name: "Envoyer au propriétaire",
    }) as HTMLButtonElement;

    expect(passages.every((p) => p.tagName === "BUTTON")).toBe(true);
    expect(sendButton.disabled).toBe(true);

    fireEvent.click(passages[0]!);
    expect(passages[0]!.dataset.state).toBe("valide");
    expect(within(container).getByText("2 passages attendent votre relecture.")).not.toBeNull();

    fireEvent.click(passages[1]!);
    fireEvent.click(passages[2]!);
    expect(within(container).getByText("Les trois passages sont validés.")).not.toBeNull();
    expect(sendButton.disabled).toBe(false);

    fireEvent.click(passages[0]!);
    expect(passages[0]!.dataset.state).toBe("attente");
    expect(sendButton.disabled).toBe(true);
    expect(within(container).getByText("1 passage attend votre relecture.")).not.toBeNull();
  });
});
