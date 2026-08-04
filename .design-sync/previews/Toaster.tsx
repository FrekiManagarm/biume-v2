import { useEffect } from "react"
import { toast } from "sonner"
import { Toaster } from "@biume/ui/components/sonner"

// sonner's Toaster only renders a fixed-position viewport that is empty
// until a toast is imperatively triggered — there is no declarative "open"
// prop like Dialog's `defaultOpen`. To get a meaningful static capture, each
// story fires its toast(s) on mount with `duration: Infinity` so they stay
// on screen for the screenshot instead of auto-dismissing.

export function Default() {
  useEffect(() => {
    toast.success("Appointment saved", {
      description: "Milo's checkup was added to the calendar.",
      duration: Number.POSITIVE_INFINITY,
    })
  }, [])

  return <Toaster position="bottom-right" />
}

export function Variants() {
  useEffect(() => {
    toast.success("Changes saved", { duration: Number.POSITIVE_INFINITY })
    toast.info("New message from the front desk", {
      duration: Number.POSITIVE_INFINITY,
    })
    toast.warning("Storage almost full", { duration: Number.POSITIVE_INFINITY })
    toast.error("Unable to reach the server", {
      duration: Number.POSITIVE_INFINITY,
    })
  }, [])

  return <Toaster position="bottom-right" />
}

export function WithAction() {
  useEffect(() => {
    toast("Invoice INV004 is overdue", {
      description: "Remind the client or mark it as paid.",
      duration: Number.POSITIVE_INFINITY,
      action: {
        label: "Remind",
        onClick: () => {},
      },
    })
  }, [])

  return <Toaster position="bottom-right" />
}
