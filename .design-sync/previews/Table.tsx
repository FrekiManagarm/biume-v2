import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@biume/ui/components/table"
import { Badge } from "@biume/ui/components/badge"

const invoices = [
  { id: "INV001", status: "Paid", method: "Credit Card", amount: "$250.00" },
  { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV003", status: "Overdue", method: "Bank Transfer", amount: "$350.00" },
  { id: "INV004", status: "Paid", method: "Credit Card", amount: "$450.00" },
]

const statusVariant = {
  Paid: "secondary",
  Pending: "outline",
  Overdue: "destructive",
} as const

export function Default() {
  return (
    <Table>
      <TableCaption>A list of your recent invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((invoice) => (
          <TableRow key={invoice.id}>
            <TableCell className="font-medium">{invoice.id}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[invoice.status as keyof typeof statusVariant]}>
                {invoice.status}
              </Badge>
            </TableCell>
            <TableCell>{invoice.method}</TableCell>
            <TableCell className="text-right">{invoice.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3}>Total</TableCell>
          <TableCell className="text-right">$1,200.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}
