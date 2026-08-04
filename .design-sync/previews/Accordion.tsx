import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@biume/ui/components/accordion"

export function Default() {
  return (
    <Accordion defaultValue={["item-1"]} style={{ maxWidth: 420 }}>
      <AccordionItem value="item-1">
        <AccordionTrigger>What is included in the Pro plan?</AccordionTrigger>
        <AccordionContent>
          The Pro plan includes unlimited appointments, automated reminders,
          online booking, and priority support for your whole team.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Can I cancel anytime?</AccordionTrigger>
        <AccordionContent>
          Yes. You can cancel your subscription at any time from the billing
          settings — you&apos;ll keep access until the end of your current
          billing period.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Do you offer a free trial?</AccordionTrigger>
        <AccordionContent>
          Every new account starts with a 14-day free trial, no credit card
          required.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function MultipleOpen() {
  return (
    <Accordion defaultValue={["shipping", "returns"]} style={{ maxWidth: 420 }}>
      <AccordionItem value="shipping">
        <AccordionTrigger>Shipping</AccordionTrigger>
        <AccordionContent>
          Orders ship within 2 business days via standard carrier. Tracking
          details are emailed as soon as your package leaves the warehouse.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>Returns</AccordionTrigger>
        <AccordionContent>
          Unused items can be returned within 30 days for a full refund.
          Start a return from your order history page.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="warranty">
        <AccordionTrigger>Warranty</AccordionTrigger>
        <AccordionContent>
          All hardware is covered by a 1-year limited warranty against
          manufacturing defects.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
