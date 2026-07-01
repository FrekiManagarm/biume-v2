import { CheckCircle2, ClipboardList, FileText } from "lucide-react";

import type {
  AgendaTodoGroup,
  AgendaTodoItem,
} from "#/lib/dashboard/day-agenda";

type DayAgendaTodoProps = {
  todo: AgendaTodoGroup;
};

export function DayAgendaTodo({ todo }: DayAgendaTodoProps) {
  return (
    <aside className="grid gap-5 self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.45)]">
      <div>
        <p className="text-sm font-medium text-emerald-700">
          À faire aujourd'hui
        </p>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
          Actions utiles.
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Préparer les prochaines séances, finaliser et envoyer les comptes
          rendus du jour.
        </p>
      </div>

      <TodoSection
        emptyLabel="Aucune préparation en attente."
        icon="prepare"
        items={todo.beforeSession}
        title="Avant séance"
      />
      <TodoSection
        emptyLabel="Aucun compte rendu à traiter."
        icon="report"
        items={todo.afterSession}
        title="Après séance"
      />
    </aside>
  );
}

function TodoSection({
  emptyLabel,
  icon,
  items,
  title,
}: {
  emptyLabel: string;
  icon: "prepare" | "report";
  items: AgendaTodoItem[];
  title: string;
}) {
  return (
    <section className="border-t border-slate-200 pt-5">
      <h3 className="text-sm font-semibold text-slate-950">{title}</h3>
      <div className="mt-3 grid gap-2">
        {items.length > 0 ? (
          items.map((item) => (
            <TodoItem key={item.id} icon={icon} item={item} />
          ))
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-sm text-slate-500">
            {emptyLabel}
          </p>
        )}
      </div>
    </section>
  );
}

function TodoItem({
  icon,
  item,
}: {
  icon: "prepare" | "report";
  item: AgendaTodoItem;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600">
        {icon === "prepare" ? (
          <ClipboardList className="size-4" />
        ) : item.action.kind === "send_report" ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <FileText className="size-4" />
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">
          {item.action.label} · {item.animalName}
        </p>
        <p className="mt-0.5 truncate text-xs text-slate-500">
          {item.timeLabel} · {item.ownerName}
        </p>
      </div>
    </div>
  );
}
