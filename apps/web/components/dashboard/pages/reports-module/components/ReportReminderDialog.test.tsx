// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { ReportReminderDialog } from "./ReportReminderDialog";

const { toastSuccess, toastError } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: toastSuccess,
    error: toastError,
  },
}));

vi.mock("@/components/ui/date-picker", () => ({
  DatePicker: () => null,
}));

vi.mock("@/lib/api/actions/report-reminder.action", () => ({
  scheduleReportReminder: vi.fn(),
}));

beforeEach(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("ReportReminderDialog finalization", () => {
  test("keeps the dialog open without a success toast when finalization is blocked", async () => {
    const onOpenChange = vi.fn();
    const onFinalize = vi.fn().mockResolvedValue(false);

    render(
      <ReportReminderDialog
        isOpen
        onOpenChange={onOpenChange}
        reportId="report-1"
        onFinalize={onFinalize}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Finaliser sans rappel" }),
    );

    await waitFor(() => expect(onFinalize).toHaveBeenCalledOnce());
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  test("closes with a success toast when finalization succeeds", async () => {
    const onOpenChange = vi.fn();
    const onFinalize = vi.fn().mockResolvedValue(true);

    render(
      <ReportReminderDialog
        isOpen
        onOpenChange={onOpenChange}
        reportId="report-1"
        onFinalize={onFinalize}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: "Finaliser sans rappel" }),
    );

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(toastSuccess).toHaveBeenCalledWith("Rapport finalisé avec succès");
  });
});
