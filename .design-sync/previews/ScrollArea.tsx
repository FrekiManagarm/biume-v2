import { ScrollArea } from "@biume/ui/components/scroll-area"
import { Separator } from "@biume/ui/components/separator"

const patients = [
  "Milo — Golden retriever",
  "Luna — European shorthair",
  "Rex — German shepherd",
  "Bella — Labrador",
  "Max — Beagle",
  "Coco — Ragdoll",
  "Charlie — Poodle",
  "Nala — Bengal",
  "Rocky — Bulldog",
  "Zoe — Siamese",
  "Buddy — Boxer",
  "Mimi — British shorthair",
]

export function Default() {
  return (
    <ScrollArea
      className="rounded-lg border"
      style={{ height: 224, width: 256 }}
    >
      <div className="flex flex-col" style={{ padding: 12 }}>
        {patients.map((patient, i) => (
          <div key={patient}>
            <p className="py-2 text-sm">{patient}</p>
            {i < patients.length - 1 && <Separator />}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
