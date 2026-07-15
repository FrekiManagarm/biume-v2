# Client and Patient List Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ajouter, au bout de chaque ligne des listes clients et patients, un menu compact permettant de consulter, modifier et supprimer l'entité avec des confirmations explicites et des mutations sécurisées par organisation.

**Architecture:** Les mutations restent dans les fonctions serveur propres à chaque domaine et sont exposées par les wrappers d'actions existants. Un composant partagé porte le menu de ligne et le dialogue destructif, tandis que chaque route conserve ses formulaires, ses données sélectionnées et ses invalidations TanStack Query. Les fonctions pures de préremplissage et de pagination sont extraites pour être testées sans monter les routes complètes.

**Tech Stack:** Bun, TypeScript, React 19, TanStack Start, TanStack Router, TanStack Query, TanStack Form, Drizzle ORM, Zod, Tailwind CSS v4, composants Shadcn-style/Base UI, Lucide React, Vitest et Testing Library.

---

## Structure des fichiers

- Créer `apps/web/src/components/dashboard/lists/entity-row-actions.tsx` : menu contextuel réutilisable et dialogue de confirmation destructif.
- Créer `apps/web/src/components/dashboard/lists/entity-row-actions.test.tsx` : comportement accessible du menu et du dialogue.
- Créer `apps/web/src/components/dashboard/lists/entity-list.helpers.ts` : valeurs initiales client/patient, date de formulaire et correction de pagination.
- Créer `apps/web/src/components/dashboard/lists/entity-list.helpers.test.ts` : tests unitaires des helpers de présentation.
- Créer `apps/web/src/functions/clients.function.test.ts` : validation des mutations client et invariants de portée organisationnelle.
- Créer `apps/web/src/functions/patients.function.test.ts` : validation des mutations patient, propriétaire autorisé et portée organisationnelle.
- Créer `apps/web/src/functions/clients.schema.ts` : schémas Zod purs et types d'entrée client, sans initialisation serveur.
- Créer `apps/web/src/functions/patients.schema.ts` : schémas Zod purs et types d'entrée patient, sans initialisation serveur.
- Créer `apps/web/src/routes/dashboard/-clients.actions.test.ts` : invariants d'intégration des actions dans la route clients, avec le préfixe d'exclusion TanStack Router.
- Créer `apps/web/src/routes/dashboard/-patients.actions.test.ts` : invariants d'intégration des actions dans la route patients, avec le préfixe d'exclusion TanStack Router.
- Modifier `apps/web/src/functions/clients.function.ts` : schémas et fonctions serveur de modification/suppression client.
- Modifier `apps/web/src/functions/patients.function.ts` : schémas et fonctions serveur de modification/suppression patient.
- Modifier `apps/web/src/lib/api/actions/clients.action.ts` : wrappers client.
- Modifier `apps/web/src/lib/api/actions/patients.action.ts` : wrappers patient.
- Modifier `apps/web/src/routes/dashboard/clients.tsx` : menu, consultation, édition, suppression et invalidations.
- Modifier `apps/web/src/routes/dashboard/patients.tsx` : menu, édition, suppression et invalidations.

### Task 1: Primitives partagées des actions de ligne

**Files:**

- Create: `apps/web/src/components/dashboard/lists/entity-row-actions.tsx`
- Create: `apps/web/src/components/dashboard/lists/entity-row-actions.test.tsx`
- Create: `apps/web/src/components/dashboard/lists/entity-list.helpers.ts`
- Create: `apps/web/src/components/dashboard/lists/entity-list.helpers.test.ts`

- [ ] **Step 1: Écrire les tests en échec du menu et du dialogue**

Créer `entity-row-actions.test.tsx` avec un environnement jsdom. Le premier test ouvre le bouton nommé `Actions pour Nala`, puis vérifie les trois entrées dans l'ordre et déclenche `Modifier`. Le second monte le dialogue ouvert, vérifie le texte de cascade fourni et confirme la suppression.

```tsx
// @vitest-environment jsdom

import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";

import { DeleteEntityDialog, EntityRowActions } from "./entity-row-actions";

describe("EntityRowActions", () => {
  test("exposes view, edit and destructive delete actions in order", async () => {
    const onEdit = vi.fn();
    render(
      <EntityRowActions
        entityName="Nala"
        onDelete={vi.fn()}
        onEdit={onEdit}
        onView={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Actions pour Nala" }));
    const menu = await screen.findByRole("menu");
    expect(
      within(menu)
        .getAllByRole("menuitem")
        .map((item) => item.textContent),
    ).toEqual(["Consulter", "Modifier", "Supprimer"]);
    fireEvent.click(within(menu).getByRole("menuitem", { name: "Modifier" }));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});

describe("DeleteEntityDialog", () => {
  test("requires explicit confirmation and displays cascade consequences", () => {
    const onConfirm = vi.fn();
    render(
      <DeleteEntityDialog
        confirmLabel="Supprimer le client"
        description="Ses 2 patients, leurs dossiers et leurs données associées seront également supprimés."
        isPending={false}
        onConfirm={onConfirm}
        onOpenChange={vi.fn()}
        open
        title="Supprimer Marie Dupont ?"
      />,
    );

    expect(screen.getByText(/Ses 2 patients/)).not.toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Supprimer le client" }),
    );
    expect(onConfirm).toHaveBeenCalledOnce();
  });
});
```

- [ ] **Step 2: Écrire les tests en échec des helpers de formulaire et pagination**

Créer `entity-list.helpers.test.ts` pour figer les valeurs nulles, la conversion de date et le retour à la page précédente après la suppression de la dernière ligne.

```ts
import { describe, expect, test } from "vitest";

import {
  getClientFormValues,
  getPageAfterDeletion,
  getPatientFormValues,
  isStaleEntityError,
} from "./entity-list.helpers";

describe("entity list form values", () => {
  test("prefills a client edit form without leaking null values", () => {
    expect(
      getClientFormValues({
        name: "Marie Dupont",
        email: null,
        phone: "0600000000",
        address: null,
        city: "Lyon",
        zip: null,
        country: "France",
      }),
    ).toEqual({
      name: "Marie Dupont",
      email: "",
      phone: "0600000000",
      address: "",
      city: "Lyon",
      zip: "",
      country: "France",
    });
  });

  test("prefills a patient edit form with a date input value", () => {
    expect(
      getPatientFormValues({
        name: "Nala",
        ownerId: "client-1",
        type: "animal-1",
        breed: "Labrador",
        gender: "Female",
        birthDate: new Date("2022-04-03T12:00:00Z"),
        weight: 24,
        height: 52,
        description: null,
      }),
    ).toMatchObject({
      name: "Nala",
      ownerId: "client-1",
      type: "animal-1",
      gender: "Female",
      birthDate: "2022-04-03",
      description: "",
    });
  });
});

describe("getPageAfterDeletion", () => {
  test("returns the previous page when the deleted row was the last visible row", () => {
    expect(getPageAfterDeletion(3, 1)).toBe(2);
    expect(getPageAfterDeletion(3, 2)).toBe(3);
    expect(getPageAfterDeletion(1, 1)).toBe(1);
  });
});

test("recognizes an entity removed by another request", () => {
  expect(
    isStaleEntityError(new Error("Client introuvable ou inaccessible.")),
  ).toBe(true);
  expect(isStaleEntityError(new Error("Erreur réseau"))).toBe(false);
});
```

- [ ] **Step 3: Lancer les tests et vérifier l'échec RED**

Run: `bun --filter @biume/web test --run src/components/dashboard/lists/entity-row-actions.test.tsx src/components/dashboard/lists/entity-list.helpers.test.ts`

Expected: FAIL car les deux modules n'existent pas encore.

- [ ] **Step 4: Implémenter les helpers purs**

Créer `entity-list.helpers.ts` avec des entrées structurelles minimales afin de ne pas coupler ce module aux relations Drizzle complètes.

```ts
type ClientFormSource = {
  name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  zip: string | null;
  country: string | null;
};

type PatientFormSource = {
  name: string;
  ownerId: string | null;
  type: string | null;
  breed: string;
  gender: "Male" | "Female";
  birthDate: Date;
  weight: number;
  height: number;
  description: string | null;
};

export const emptyClientFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  zip: "",
  country: "France",
};

export function getClientFormValues(client?: ClientFormSource | null) {
  if (!client) return { ...emptyClientFormValues };
  return {
    name: client.name ?? "",
    email: client.email ?? "",
    phone: client.phone ?? "",
    address: client.address ?? "",
    city: client.city ?? "",
    zip: client.zip ?? "",
    country: client.country ?? "",
  };
}

export function getPatientFormValues(patient: PatientFormSource) {
  const year = patient.birthDate.getFullYear();
  const month = String(patient.birthDate.getMonth() + 1).padStart(2, "0");
  const day = String(patient.birthDate.getDate()).padStart(2, "0");
  return {
    name: patient.name,
    ownerId: patient.ownerId ?? "",
    type: patient.type ?? "",
    breed: patient.breed,
    gender: patient.gender,
    birthDate: `${year}-${month}-${day}`,
    weight: patient.weight,
    height: patient.height,
    description: patient.description ?? "",
  };
}

export function getPageAfterDeletion(
  currentPage: number,
  visibleItemCount: number,
) {
  return currentPage > 1 && visibleItemCount === 1
    ? currentPage - 1
    : currentPage;
}

export function isStaleEntityError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("introuvable ou inaccessible")
  );
}
```

- [ ] **Step 5: Implémenter le menu et le dialogue partagés**

Créer `entity-row-actions.tsx` en utilisant uniquement les primitives UI déjà présentes.

```tsx
import { Ellipsis, Eye, Pencil, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "#/components/ui/alert-dialog";
import { Button } from "#/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";

export function EntityRowActions({
  entityName,
  onDelete,
  onEdit,
  onView,
}: {
  entityName: string;
  onDelete: () => void;
  onEdit: () => void;
  onView: () => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="size-9">
            <Ellipsis className="size-4" />
            <span className="sr-only">Actions pour {entityName}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onView}>
            <Eye className="size-4" />
            Consulter
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Pencil className="size-4" />
            Modifier
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-destructive" onClick={onDelete}>
            <Trash2 className="size-4" />
            Supprimer
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DeleteEntityDialog({
  confirmLabel,
  description,
  isPending,
  onConfirm,
  onOpenChange,
  open,
  title,
}: {
  confirmLabel: string;
  description: React.ReactNode;
  isPending: boolean;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  title: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="size-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {isPending ? "Suppression…" : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

- [ ] **Step 6: Relancer les tests et vérifier GREEN**

Run: `bun --filter @biume/web test --run src/components/dashboard/lists/entity-row-actions.test.tsx src/components/dashboard/lists/entity-list.helpers.test.ts`

Expected: 6 tests PASS sans avertissement React.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/components/dashboard/lists/entity-row-actions.tsx apps/web/src/components/dashboard/lists/entity-row-actions.test.tsx apps/web/src/components/dashboard/lists/entity-list.helpers.ts apps/web/src/components/dashboard/lists/entity-list.helpers.test.ts
git commit -m "feat(web): add reusable entity row actions"
```

### Task 2: Mutations serveur des clients

**Files:**

- Create: `apps/web/src/functions/clients.schema.ts`
- Create: `apps/web/src/functions/clients.function.test.ts`
- Modify: `apps/web/src/functions/clients.function.ts`
- Modify: `apps/web/src/lib/api/actions/clients.action.ts`

- [ ] **Step 1: Écrire les tests RED des entrées et de la portée organisationnelle**

Le test valide les schémas exportés et protège la présence des deux conditions d'autorisation dans la source, suivant le modèle d'invariants statiques déjà utilisé dans le dépôt.

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { deleteClientSchema, updateClientSchema } from "./clients.schema";

const source = readFileSync(
  new URL("./clients.function.ts", import.meta.url),
  "utf8",
);

describe("client mutations", () => {
  test("validates update and delete inputs", () => {
    expect(
      updateClientSchema.safeParse({ id: "client-1", name: "Marie", email: "" })
        .success,
    ).toBe(true);
    expect(updateClientSchema.safeParse({ id: "", name: "" }).success).toBe(
      false,
    );
    expect(deleteClientSchema.safeParse({ id: "client-1" }).success).toBe(true);
    expect(deleteClientSchema.safeParse({ id: "" }).success).toBe(false);
  });

  test("scopes updates and deletes to the active organization", () => {
    expect(
      source.match(/eq\(clients\.organizationId, organization\.id\)/g)?.length,
    ).toBeGreaterThanOrEqual(3);
    expect(source).toContain("Client introuvable ou inaccessible.");
  });
});
```

- [ ] **Step 2: Vérifier RED**

Run: `bun --filter @biume/web test --run src/functions/clients.function.test.ts`

Expected: FAIL car le module pur `clients.schema.ts` n'existe pas.

- [ ] **Step 3: Créer les schémas purs puis ajouter les fonctions serveur client**

Créer `clients.schema.ts` afin que Vitest puisse valider les entrées sans charger la base ni les variables d'environnement :

```ts
import { z } from "zod";

const optionalText = z.string().trim().optional();

export const createClientSchema = z.object({
  name: z.string().trim().min(1),
  email: optionalText,
  phone: optionalText,
  address: optionalText,
  city: optionalText,
  zip: optionalText,
  country: optionalText,
});

export const updateClientSchema = createClientSchema.extend({
  id: z.string().trim().min(1),
});

export const deleteClientSchema = z.object({
  id: z.string().trim().min(1),
});

export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type DeleteClientInput = z.infer<typeof deleteClientSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
```

Dans `clients.function.ts`, retirer `optionalText` et la définition locale de `createClientSchema`, importer `and`, puis importer et réexporter les schémas/types purs :

```ts
export {
  createClientSchema,
  deleteClientSchema,
  updateClientSchema,
  type CreateClientInput,
  type DeleteClientInput,
  type UpdateClientInput,
} from "./clients.schema";
import {
  createClientSchema,
  deleteClientSchema,
  updateClientSchema,
} from "./clients.schema";
```

Ajouter ensuite les fonctions serveur :

```ts
export const updateClient = createServerFn({ method: "POST" })
  .validator(updateClientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const [updatedClient] = await db
      .update(clients)
      .set({
        name: data.name,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        zip: data.zip || null,
        country: data.country || null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clients.id, data.id),
          eq(clients.organizationId, organization.id),
        ),
      )
      .returning();

    if (!updatedClient) {
      throw new Error("Client introuvable ou inaccessible.");
    }
    return updatedClient;
  });

export const deleteClient = createServerFn({ method: "POST" })
  .validator(deleteClientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const [deletedClient] = await db
      .delete(clients)
      .where(
        and(
          eq(clients.id, data.id),
          eq(clients.organizationId, organization.id),
        ),
      )
      .returning({ id: clients.id });

    if (!deletedClient) {
      throw new Error("Client introuvable ou inaccessible.");
    }
    return deletedClient;
  });
```

- [ ] **Step 4: Exposer les wrappers client**

Dans `clients.action.ts`, importer/réexporter les deux types et fonctions, puis ajouter :

```ts
export function updateClient(input: UpdateClientInput) {
  return updateClientFn({ data: input });
}

export function deleteClient(input: DeleteClientInput) {
  return deleteClientFn({ data: input });
}
```

Utiliser les alias d'import `updateClientFn` et `deleteClientFn` pour éviter le conflit avec les wrappers.

- [ ] **Step 5: Vérifier GREEN et les types**

Run: `bun --filter @biume/web test --run src/functions/clients.function.test.ts`

Expected: 2 tests PASS.

Run: `bun run check-types`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/functions/clients.schema.ts apps/web/src/functions/clients.function.ts apps/web/src/functions/clients.function.test.ts apps/web/src/lib/api/actions/clients.action.ts
git commit -m "feat(web): add authorized client mutations"
```

### Task 3: Mutations serveur des patients

**Files:**

- Create: `apps/web/src/functions/patients.schema.ts`
- Create: `apps/web/src/functions/patients.function.test.ts`
- Modify: `apps/web/src/functions/patients.function.ts`
- Modify: `apps/web/src/lib/api/actions/patients.action.ts`

- [ ] **Step 1: Écrire les tests RED**

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

import { deletePatientSchema, updatePatientSchema } from "./patients.schema";

const source = readFileSync(
  new URL("./patients.function.ts", import.meta.url),
  "utf8",
);

describe("patient mutations", () => {
  test("validates update and delete inputs", () => {
    const valid = {
      id: "patient-1",
      name: "Nala",
      ownerId: "client-1",
      type: "animal-1",
      breed: "Labrador",
      gender: "Female",
      birthDate: new Date("2022-04-03"),
      weight: 24,
      height: 52,
    };
    expect(updatePatientSchema.safeParse(valid).success).toBe(true);
    expect(
      updatePatientSchema.safeParse({ ...valid, id: "", ownerId: "" }).success,
    ).toBe(false);
    expect(deletePatientSchema.safeParse({ id: "patient-1" }).success).toBe(
      true,
    );
    expect(deletePatientSchema.safeParse({ id: "" }).success).toBe(false);
  });

  test("scopes patient mutations and the replacement owner to the organization", () => {
    expect(
      source.match(/eq\(pets\.organizationId, organization\.id\)/g)?.length,
    ).toBeGreaterThanOrEqual(3);
    expect(source).toContain("eq(clients.organizationId, organization.id)");
    expect(source).toContain("Propriétaire introuvable ou inaccessible.");
    expect(source).toContain("Patient introuvable ou inaccessible.");
  });
});
```

- [ ] **Step 2: Vérifier RED**

Run: `bun --filter @biume/web test --run src/functions/patients.function.test.ts`

Expected: FAIL car le module pur `patients.schema.ts` n'existe pas.

- [ ] **Step 3: Créer les schémas purs et ajouter les mutations patient autorisées**

Créer `patients.schema.ts` :

```ts
import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().trim().min(1),
  ownerId: z.string().trim().min(1),
  type: z.string().trim().min(1),
  breed: z.string().trim().min(1),
  gender: z.enum(["Male", "Female"]).default("Male"),
  birthDate: z.coerce.date(),
  weight: z.coerce.number().int().min(0),
  height: z.coerce.number().int().min(0),
  description: z.string().trim().optional(),
  chippedNumber: z.coerce.number().int().positive().optional(),
});

export const updatePatientSchema = createPatientSchema.extend({
  id: z.string().trim().min(1),
});

export const deletePatientSchema = z.object({
  id: z.string().trim().min(1),
});

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;
export type DeletePatientInput = z.infer<typeof deletePatientSchema>;
export type CreatePatientInput = z.infer<typeof createPatientSchema>;
```

Dans `patients.function.ts`, retirer la définition locale de `createPatientSchema`, importer `clients` depuis le schéma, puis importer et réexporter les schémas/types purs :

```ts
export {
  createPatientSchema,
  deletePatientSchema,
  updatePatientSchema,
  type CreatePatientInput,
  type DeletePatientInput,
  type UpdatePatientInput,
} from "./patients.schema";
import {
  createPatientSchema,
  deletePatientSchema,
  updatePatientSchema,
} from "./patients.schema";
```

Ajouter ensuite les mutations :

```ts
export const updatePatient = createServerFn({ method: "POST" })
  .validator(updatePatientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const owner = await db.query.clients.findFirst({
      where: and(
        eq(clients.id, data.ownerId),
        eq(clients.organizationId, organization.id),
      ),
      columns: { id: true },
    });
    if (!owner) {
      throw new Error("Propriétaire introuvable ou inaccessible.");
    }

    const [updatedPatient] = await db
      .update(pets)
      .set({
        name: data.name,
        ownerId: data.ownerId,
        type: data.type,
        breed: data.breed,
        gender: data.gender,
        birthDate: data.birthDate,
        weight: data.weight,
        height: data.height,
        description: data.description || null,
        chippedNumber: data.chippedNumber,
        updatedAt: new Date(),
      })
      .where(
        and(eq(pets.id, data.id), eq(pets.organizationId, organization.id)),
      )
      .returning();
    if (!updatedPatient) {
      throw new Error("Patient introuvable ou inaccessible.");
    }
    return updatedPatient;
  });

export const deletePatient = createServerFn({ method: "POST" })
  .validator(deletePatientSchema)
  .handler(async ({ data }) => {
    const organization = await getCurrentOrganization();
    if (!organization) throw new Error("Organization not found");

    const [deletedPatient] = await db
      .delete(pets)
      .where(
        and(eq(pets.id, data.id), eq(pets.organizationId, organization.id)),
      )
      .returning({ id: pets.id });
    if (!deletedPatient) {
      throw new Error("Patient introuvable ou inaccessible.");
    }
    return deletedPatient;
  });
```

- [ ] **Step 4: Exposer les wrappers patient**

Importer/réexporter `UpdatePatientInput` et `DeletePatientInput`, importer les fonctions sous les alias `updatePatientFn` et `deletePatientFn`, puis ajouter :

```ts
export function updatePatient(input: UpdatePatientInput) {
  return updatePatientFn({ data: input });
}

export function deletePatient(input: DeletePatientInput) {
  return deletePatientFn({ data: input });
}
```

- [ ] **Step 5: Vérifier GREEN et les types**

Run: `bun --filter @biume/web test --run src/functions/patients.function.test.ts`

Expected: 2 tests PASS.

Run: `bun run check-types`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/functions/patients.schema.ts apps/web/src/functions/patients.function.ts apps/web/src/functions/patients.function.test.ts apps/web/src/lib/api/actions/patients.action.ts
git commit -m "feat(web): add authorized patient mutations"
```

### Task 4: Actions complètes dans la liste clients

**Files:**

- Modify: `apps/web/src/routes/dashboard/clients.tsx`
- Modify: `apps/web/src/components/dashboard/lists/entity-list.helpers.test.ts`
- Create: `apps/web/src/routes/dashboard/-clients.actions.test.ts`

- [ ] **Step 1: Ajouter un test RED pour le texte de cascade client**

Ajouter au fichier de helpers un formateur pur `getClientDeletionDescription` et son test de singularisation :

```ts
import { getClientDeletionDescription } from "./entity-list.helpers";

test("describes every patient removed with a client", () => {
  expect(getClientDeletionDescription(0)).toContain("aucun patient");
  expect(getClientDeletionDescription(1)).toContain("1 patient");
  expect(getClientDeletionDescription(3)).toContain("3 patients");
  expect(getClientDeletionDescription(3)).toContain("données associées");
});
```

Créer aussi `-clients.actions.test.ts` avant de modifier la route :

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./clients.tsx", import.meta.url), "utf8");

describe("clients list actions", () => {
  test("wires view, edit and delete through the row menu", () => {
    expect(source).toContain("<EntityRowActions");
    expect(source).toContain("<ClientDetailsDialog");
    expect(source).toContain(
      "await updateClient({ id: client.id, ...parsed })",
    );
    expect(source).toContain(
      "deleteClientMutation.mutate({ id: clientToDelete.id })",
    );
    expect(source).toContain("getClientDeletionDescription");
  });
});
```

- [ ] **Step 2: Vérifier RED puis implémenter le texte**

Run: `bun --filter @biume/web test --run src/components/dashboard/lists/entity-list.helpers.test.ts src/routes/dashboard/-clients.actions.test.ts`

Expected: FAIL car `getClientDeletionDescription` n'existe pas et la route n'utilise pas encore les nouveaux composants.

Ajouter :

```ts
export function getClientDeletionDescription(patientCount: number) {
  const patientLabel =
    patientCount === 0
      ? "aucun patient"
      : `${patientCount} patient${patientCount > 1 ? "s" : ""}`;
  return `Ce client possède ${patientLabel}. Sa suppression est irréversible et supprimera également les patients concernés, leurs dossiers et leurs données associées.`;
}
```

Relancer uniquement `entity-list.helpers.test.ts` ; Expected: PASS. Le test de route reste RED jusqu'au branchement des actions dans les étapes suivantes.

- [ ] **Step 3: Ajouter l'état et le menu de chaque ligne client**

Dans `ClientsPage`, conserver trois sélections distinctes :

```ts
const [clientToView, setClientToView] = useState<Client | null>(null);
const [clientToEdit, setClientToEdit] = useState<Client | null>(null);
const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
```

Ajouter les imports `useMutation`, `EntityRowActions`, `DeleteEntityDialog`, `deleteClient`, `updateClient`, `getClientDeletionDescription`, `getClientFormValues`, `getPageAfterDeletion` et `isStaleEntityError`. Retirer l'import `Eye` devenu inutilisé.

Remplacer le bouton `Eye` dans la cellule Actions par :

```tsx
<EntityRowActions
  entityName={client.name ?? "Client sans nom"}
  onDelete={() => setClientToDelete(client)}
  onEdit={() => setClientToEdit(client)}
  onView={() => setClientToView(client)}
/>
```

- [ ] **Step 4: Généraliser le formulaire client pour création et modification**

Renommer `CreateClientDialog` en `ClientFormDialog`, accepter `client?: Client | null`, utiliser `getClientFormValues(client)` comme valeurs initiales et sélectionner la mutation à la soumission :

```ts
const parsed = clientFormSchema.parse(value);
try {
  if (client) {
    await updateClient({ id: client.id, ...parsed });
  } else {
    await createClient(parsed);
  }
  await queryClient.invalidateQueries({ queryKey: ["clients"] });
  toast.success(client ? "Client modifié." : "Client créé.");
  form.reset();
  onOpenChange(false);
} catch (error) {
  if (isStaleEntityError(error)) {
    await queryClient.invalidateQueries({ queryKey: ["clients"] });
    onOpenChange(false);
  }
  toast.error(
    error instanceof Error
      ? error.message
      : client
        ? "Impossible de modifier ce client."
        : "Impossible de créer ce client.",
  );
}
```

Adapter le titre, la description et le bouton :

```tsx
<CredenzaTitle>
  {client ? "Modifier le client" : "Nouveau client"}
</CredenzaTitle>
<CredenzaDescription>
  {client
    ? "Mettez à jour les coordonnées et l'adresse du propriétaire."
    : "Créez une fiche propriétaire avec les coordonnées utiles au suivi."}
</CredenzaDescription>
```

```tsx
{
  isSubmitting
    ? client
      ? "Enregistrement…"
      : "Création…"
    : client
      ? "Enregistrer les modifications"
      : "Créer le client";
}
```

Monter séparément les modes création et édition avec une `key` liée à l'identifiant afin que TanStack Form reconstruise les valeurs préremplies :

```tsx
{
  isCreateOpen ? (
    <ClientFormDialog key="create-client" open onOpenChange={setIsCreateOpen} />
  ) : null;
}
{
  clientToEdit ? (
    <ClientFormDialog
      key={clientToEdit.id}
      client={clientToEdit}
      open
      onOpenChange={(open) => {
        if (!open) setClientToEdit(null);
      }}
    />
  ) : null;
}
```

- [ ] **Step 5: Ajouter la consultation client en lecture seule**

Ajouter ce `ClientDetailsDialog` local réutilisant `Credenza` :

```tsx
function ClientDetailsDialog({
  client,
  onOpenChange,
  open,
}: {
  client: Client;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}) {
  const address = [client.address, client.zip, client.city, client.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Credenza open={open} onOpenChange={onOpenChange}>
      <CredenzaContent className="overflow-hidden p-0 sm:max-w-xl">
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
          <CredenzaHeader className="gap-1 text-left">
            <CredenzaTitle>{client.name ?? "Client sans nom"}</CredenzaTitle>
            <CredenzaDescription>
              Coordonnées et patients rattachés.
            </CredenzaDescription>
          </CredenzaHeader>
        </div>
        <div className="grid gap-5 px-6 py-5 text-sm">
          <dl className="grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="font-semibold text-slate-800">Email</dt>
              <dd className="mt-1 text-slate-600">
                {client.email || "Email manquant"}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-slate-800">Téléphone</dt>
              <dd className="mt-1 text-slate-600">
                {client.phone || "Téléphone manquant"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="font-semibold text-slate-800">Adresse</dt>
              <dd className="mt-1 text-slate-600">
                {address || "Adresse non renseignée"}
              </dd>
            </div>
          </dl>
          <div>
            <h3 className="font-semibold text-slate-800">Patients</h3>
            {client.pets?.length ? (
              <ul className="mt-2 grid gap-2">
                {client.pets.map((pet) => (
                  <li
                    key={pet.id}
                    className="rounded-xl border border-slate-200 px-3 py-2"
                  >
                    {pet.name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-slate-500">Aucun patient rattaché.</p>
            )}
          </div>
        </div>
        <CredenzaFooter className="mb-0 border-t border-slate-200 px-6 pb-6 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Fermer
          </Button>
        </CredenzaFooter>
      </CredenzaContent>
    </Credenza>
  );
}
```

Brancher le composant ainsi :

```tsx
{
  clientToView ? (
    <ClientDetailsDialog
      client={clientToView}
      open
      onOpenChange={(open) => {
        if (!open) setClientToView(null);
      }}
    />
  ) : null;
}
```

- [ ] **Step 6: Ajouter la suppression client et la correction de page**

Créer une mutation TanStack Query dans `ClientsPage` :

```ts
const queryClient = useQueryClient();
const deleteClientMutation = useMutation({
  mutationFn: deleteClient,
  onSuccess: async () => {
    const nextPage = getPageAfterDeletion(currentPage, currentClients.length);
    setClientToDelete(null);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["clients"] }),
      queryClient.invalidateQueries({ queryKey: ["patients"] }),
    ]);
    if (nextPage !== currentPage) updateSearch({ page: nextPage });
    toast.success("Client supprimé.");
  },
  onError: async (error) => {
    if (isStaleEntityError(error)) {
      setClientToDelete(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["clients"] }),
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
      ]);
    }
    toast.error(
      error instanceof Error
        ? error.message
        : "Impossible de supprimer ce client.",
    );
  },
});
```

Monter le dialogue :

```tsx
<DeleteEntityDialog
  confirmLabel="Supprimer le client"
  description={getClientDeletionDescription(clientToDelete?.pets?.length ?? 0)}
  isPending={deleteClientMutation.isPending}
  onConfirm={() => {
    if (clientToDelete) deleteClientMutation.mutate({ id: clientToDelete.id });
  }}
  onOpenChange={(open) => {
    if (!open && !deleteClientMutation.isPending) setClientToDelete(null);
  }}
  open={clientToDelete !== null}
  title={`Supprimer ${clientToDelete?.name ?? "ce client"} ?`}
/>
```

- [ ] **Step 7: Vérifier la liste clients**

Run: `bun --filter @biume/web test --run src/components/dashboard/lists/entity-row-actions.test.tsx src/components/dashboard/lists/entity-list.helpers.test.ts src/functions/clients.function.test.ts src/routes/dashboard/-clients.actions.test.ts`

Expected: tous les tests PASS.

Run: `bun run check-types`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add apps/web/src/routes/dashboard/clients.tsx apps/web/src/routes/dashboard/-clients.actions.test.ts apps/web/src/components/dashboard/lists/entity-list.helpers.ts apps/web/src/components/dashboard/lists/entity-list.helpers.test.ts
git commit -m "feat(web): add client list action menu"
```

### Task 5: Actions complètes dans la liste patients

**Files:**

- Modify: `apps/web/src/routes/dashboard/patients.tsx`
- Modify: `apps/web/src/components/dashboard/lists/entity-list.helpers.ts`
- Modify: `apps/web/src/components/dashboard/lists/entity-list.helpers.test.ts`
- Create: `apps/web/src/routes/dashboard/-patients.actions.test.ts`

- [ ] **Step 1: Ajouter le test RED du texte de suppression patient**

```ts
import { getPatientDeletionDescription } from "./entity-list.helpers";

test("describes permanent patient record deletion", () => {
  expect(getPatientDeletionDescription()).toBe(
    "Cette suppression est irréversible. Le dossier du patient et toutes ses données associées seront définitivement supprimés.",
  );
});
```

Créer aussi `-patients.actions.test.ts` avant de modifier la route :

```ts
import { readFileSync } from "node:fs";
import { describe, expect, test } from "vitest";

const source = readFileSync(new URL("./patients.tsx", import.meta.url), "utf8");

describe("patients list actions", () => {
  test("wires view, edit and delete through the row menu", () => {
    expect(source).toContain("<EntityRowActions");
    expect(source).toContain("setSelectedPatientId(patient.id)");
    expect(source).toContain(
      "await updatePatient({ id: patient.id, ...input })",
    );
    expect(source).toContain(
      "deletePatientMutation.mutate({ id: patientToDelete.id })",
    );
    expect(source).toContain("getPatientDeletionDescription");
  });
});
```

- [ ] **Step 2: Vérifier RED puis implémenter**

Run: `bun --filter @biume/web test --run src/components/dashboard/lists/entity-list.helpers.test.ts src/routes/dashboard/-patients.actions.test.ts`

Expected: FAIL car le helper n'existe pas et la route n'utilise pas encore les nouveaux composants.

```ts
export function getPatientDeletionDescription() {
  return "Cette suppression est irréversible. Le dossier du patient et toutes ses données associées seront définitivement supprimés.";
}
```

Relancer uniquement `entity-list.helpers.test.ts` ; Expected: PASS. Le test de route reste RED jusqu'au branchement des actions dans les étapes suivantes.

- [ ] **Step 3: Ajouter les sélections et le menu patient**

Conserver `selectedPatientId` pour `AnimalCredenza`, puis ajouter :

```ts
const [patientToEdit, setPatientToEdit] = useState<Pet | null>(null);
const [patientToDelete, setPatientToDelete] = useState<Pet | null>(null);
```

Ajouter les imports `useMutation`, `EntityRowActions`, `DeleteEntityDialog`, `deletePatient`, `updatePatient`, `getPatientDeletionDescription`, `getPatientFormValues`, `getPageAfterDeletion` et `isStaleEntityError`. Retirer l'import `Eye` devenu inutilisé.

Remplacer le bouton Eye par :

```tsx
<EntityRowActions
  entityName={patient.name}
  onDelete={() => setPatientToDelete(patient)}
  onEdit={() => setPatientToEdit(patient)}
  onView={() => setSelectedPatientId(patient.id)}
/>
```

- [ ] **Step 4: Généraliser le formulaire patient**

Renommer `CreatePatientDialog` en `PatientFormDialog`, accepter `patient?: Pet | null` et utiliser `getPatientFormValues(patient)` en édition. En création, conserver les valeurs actuelles basées sur le premier client et la première espèce.

La soumission choisit la mutation :

```ts
const parsed = patientFormSchema.parse(value);
const input = {
  ...parsed,
  birthDate: new Date(`${parsed.birthDate}T12:00:00`),
  description: parsed.description || undefined,
};
try {
  if (patient) {
    await updatePatient({ id: patient.id, ...input });
  } else {
    await createPatient(input);
  }
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["patients"] }),
    queryClient.invalidateQueries({ queryKey: ["clients"] }),
  ]);
  toast.success(patient ? "Patient modifié." : "Patient créé.");
  form.reset();
  onOpenChange(false);
} catch (error) {
  if (isStaleEntityError(error)) {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["patients"] }),
      queryClient.invalidateQueries({ queryKey: ["clients"] }),
    ]);
    onOpenChange(false);
  }
  toast.error(
    error instanceof Error
      ? error.message
      : patient
        ? "Impossible de modifier ce patient."
        : "Impossible de créer ce patient.",
  );
}
```

Adapter exactement le titre et la description :

```tsx
<CredenzaTitle>
  {patient ? "Modifier le patient" : "Nouveau patient"}
</CredenzaTitle>
<CredenzaDescription>
  {patient
    ? "Mettez à jour l'identité, le propriétaire et les données de suivi du patient."
    : "Ajoutez un animal et rattachez-le à un propriétaire existant."}
</CredenzaDescription>
```

Adapter le bouton principal :

```tsx
{
  isSubmitting
    ? patient
      ? "Enregistrement…"
      : "Création…"
    : patient
      ? "Enregistrer les modifications"
      : "Créer le patient";
}
```

Monter les modes création et édition séparément :

```tsx
{
  isCreateOpen ? (
    <PatientFormDialog
      key="create-patient"
      animals={animals}
      clients={clients}
      open
      onOpenChange={setIsCreateOpen}
    />
  ) : null;
}
{
  patientToEdit ? (
    <PatientFormDialog
      key={patientToEdit.id}
      animals={animals}
      clients={clients}
      patient={patientToEdit}
      open
      onOpenChange={(open) => {
        if (!open) setPatientToEdit(null);
      }}
    />
  ) : null;
}
```

- [ ] **Step 5: Ajouter la suppression patient**

Dans `PatientsPage`, ajouter :

```ts
const queryClient = useQueryClient();
const deletePatientMutation = useMutation({
  mutationFn: deletePatient,
  onSuccess: async () => {
    const nextPage = getPageAfterDeletion(currentPage, currentPatients.length);
    setPatientToDelete(null);
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["patients"] }),
      queryClient.invalidateQueries({ queryKey: ["clients"] }),
    ]);
    if (nextPage !== currentPage) updateSearch({ page: nextPage });
    toast.success("Patient supprimé.");
  },
  onError: async (error) => {
    if (isStaleEntityError(error)) {
      setPatientToDelete(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["patients"] }),
        queryClient.invalidateQueries({ queryKey: ["clients"] }),
      ]);
    }
    toast.error(
      error instanceof Error
        ? error.message
        : "Impossible de supprimer ce patient.",
    );
  },
});
```

Monter :

```tsx
<DeleteEntityDialog
  confirmLabel="Supprimer le patient"
  description={getPatientDeletionDescription()}
  isPending={deletePatientMutation.isPending}
  onConfirm={() => {
    if (patientToDelete)
      deletePatientMutation.mutate({ id: patientToDelete.id });
  }}
  onOpenChange={(open) => {
    if (!open && !deletePatientMutation.isPending) setPatientToDelete(null);
  }}
  open={patientToDelete !== null}
  title={`Supprimer ${patientToDelete?.name ?? "ce patient"} ?`}
/>
```

- [ ] **Step 6: Vérifier la liste patients**

Run: `bun --filter @biume/web test --run src/components/dashboard/lists/entity-row-actions.test.tsx src/components/dashboard/lists/entity-list.helpers.test.ts src/functions/patients.function.test.ts src/routes/dashboard/-patients.actions.test.ts`

Expected: tous les tests PASS.

Run: `bun run check-types`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add apps/web/src/routes/dashboard/patients.tsx apps/web/src/routes/dashboard/-patients.actions.test.ts apps/web/src/components/dashboard/lists/entity-list.helpers.ts apps/web/src/components/dashboard/lists/entity-list.helpers.test.ts
git commit -m "feat(web): add patient list action menu"
```

### Task 6: Vérification fonctionnelle et qualité finale

**Files:**

- Modify only if a verification failure identifies a defect in a file already listed above.

- [ ] **Step 1: Lancer toute la suite web**

Run: `bun --filter @biume/web test`

Expected: tous les tests PASS, sans erreur jsdom ni avertissement React introduit par les nouveaux composants.

- [ ] **Step 2: Vérifier les types du monorepo**

Run: `bun run check-types`

Expected: PASS pour tous les workspaces.

- [ ] **Step 3: Vérifier le build produit**

Run: `bun --filter @biume/web build`

Expected: build Vite/TanStack Start terminé avec un code de sortie 0.

- [ ] **Step 4: Inspection manuelle dans le navigateur**

Run: `bun run dev:web`

Vérifier sur `/dashboard/clients` puis `/dashboard/patients` :

- ouverture et navigation clavier du menu `…` ;
- consultation client et patient ;
- préremplissage, validation, succès et erreur de modification ;
- avertissement exact pour un client sans patient puis avec plusieurs patients ;
- avertissement exact pour un patient ;
- boutons désactivés pendant la suppression ;
- actualisation des métriques et des deux listes ;
- retour à la page précédente après suppression de la dernière ligne ;
- alignement du menu sur la dernière ligne, sur mobile et sur desktop.

- [ ] **Step 5: Contrôler le diff**

Run: `git diff --check && git status --short`

Expected: aucun problème d'espaces ; seules les modifications de cette fonctionnalité restent non commitées.

- [ ] **Step 6: Commit de correction éventuelle**

Si une correction a été nécessaire pendant la vérification :

```bash
git add apps/web/src/components/dashboard/lists apps/web/src/functions/clients.function.ts apps/web/src/functions/patients.function.ts apps/web/src/lib/api/actions/clients.action.ts apps/web/src/lib/api/actions/patients.action.ts apps/web/src/routes/dashboard/clients.tsx apps/web/src/routes/dashboard/patients.tsx
git commit -m "fix(web): polish client and patient list actions"
```
