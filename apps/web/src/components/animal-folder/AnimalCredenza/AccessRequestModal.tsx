
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { LockKeyhole } from "lucide-react"

interface AccessRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (justification: string) => void
  petName: string
  isLoading?: boolean
}

export function AccessRequestModal({
  isOpen,
  onClose,
  onConfirm,
  petName,
  isLoading = false,
}: AccessRequestModalProps) {
  const [justification, setJustification] = useState("")

  const handleSubmit = () => {
    if (justification.trim()) {
      onConfirm(justification.trim())
      setJustification("")
    }
  }

  const handleCancel = () => {
    setJustification("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="rounded-full bg-blue-100 p-2">
              <LockKeyhole className="h-4 w-4 text-blue-600" />
            </div>
            <DialogTitle>Demande d&apos;accès au dossier médical</DialogTitle>
          </div>
          <DialogDescription>
            Vous êtes sur le point de demander l&apos;accès au dossier médical de{" "}
            <span className="font-medium text-blue-600">{petName}</span>. Veuillez justifier cette demande pour le
            propriétaire.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="justification" className="text-sm font-medium">
              Motif de la demande d&apos;accès *
            </Label>
            <Textarea
              id="justification"
              placeholder="Ex: Suivi post-opératoire, consultation d'urgence, analyse des antécédents..."
              value={justification}
              onChange={e => setJustification(e.target.value)}
              rows={4}
              className="mt-2"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Cette justification sera visible par le propriétaire de l&apos;animal.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={!justification.trim() || isLoading}>
            {isLoading ? "Envoi en cours..." : "Envoyer la demande"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
