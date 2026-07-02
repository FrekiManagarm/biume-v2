import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  Bell,
  CheckCircle2,
  ImageIcon,
  Languages,
  Mail,
  Phone,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { updateUser } from "@/lib/auth-client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@biume/ui/components/avatar";
import { Badge } from "@biume/ui/components/badge";
import { Button } from "@biume/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@biume/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@biume/ui/components/field";
import { Input } from "@biume/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@biume/ui/components/select";
import { Switch } from "@biume/ui/components/switch";
import type { User } from "@biume/db/schema/index";

const userProfileSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(120),
  phoneNumber: z.string().max(40).optional().nullable(),
  lang: z.enum(["fr", "en"]).default("fr").optional(),
  image: z.url().optional().or(z.literal("")).or(z.null()),
  emailNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional(),
});

type UserProfileFormValues = z.infer<typeof userProfileSchema>;
type FieldErrorValue = { message?: string } | string | undefined;

interface UserProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

function getUserProfileDefaultValues(user: User): UserProfileFormValues {
  return {
    name: user.name ?? "",
    phoneNumber: user.phoneNumber ?? "",
    lang: user.lang === "en" ? "en" : "fr",
    image: user.image ?? "",
    emailNotifications: user.emailNotifications ?? false,
    smsNotifications: user.smsNotifications ?? false,
  };
}

function getFieldErrors(errors: FieldErrorValue[]) {
  return errors.map((error) =>
    typeof error === "string" ? { message: error } : error,
  );
}

function getInitials(name?: string | null) {
  return (
    name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("") || "U"
  );
}

export function UserProfileDialog({
  open,
  onOpenChange,
  user,
}: UserProfileDialogProps) {
  const { mutateAsync, isPending } = useMutation({
    mutationFn: async (values: UserProfileFormValues) => {
      const response = await updateUser({
        name: values.name,
        phoneNumber: values.phoneNumber ?? "",
        lang: values.lang ?? "fr",
        image: values.image || null,
        emailNotifications: values.emailNotifications ?? false,
        smsNotifications: values.smsNotifications ?? false,
      });

      if (response.error) {
        throw new Error(
          response.error.message ?? "Erreur lors de la mise à jour du profil",
        );
      }

      return response.data;
    },
    onSuccess: () => {
      toast.success("Profil mis à jour avec succès");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message ?? "Erreur lors de la mise à jour du profil");
    },
  });

  const form = useForm({
    defaultValues: getUserProfileDefaultValues(user),
    validators: {
      onSubmit: userProfileSchema,
    },
    onSubmit: async ({ value }) => {
      await mutateAsync(userProfileSchema.parse(value));
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-xl">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="flex max-h-[calc(100dvh-4rem)] flex-col"
        >
          <div className="border-b bg-muted/20 px-6 py-5">
            <div className="flex items-start gap-4 pr-8">
              <Avatar className="size-14 rounded-2xl ring-1 ring-border">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "Profil"}
                />
                <AvatarFallback className="rounded-2xl bg-background text-base font-semibold text-foreground">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <DialogHeader className="min-w-0 flex-1 gap-1 text-left">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Mon profil
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed">
                  Mettez à jour vos coordonnées et vos préférences.
                </DialogDescription>
                <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium text-foreground">
                    {user.name}
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="truncate text-sm text-muted-foreground">
                    {user.email}
                  </span>
                </div>
              </DialogHeader>
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-5">
            <FieldGroup className="gap-5">
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">
                    Informations
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Ces éléments apparaissent dans votre espace Biume.
                  </p>
                </div>
                <form.Field
                  name="name"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          <UserRound className="size-3.5 text-muted-foreground" />
                          Nom
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          className="h-10 bg-background/70"
                          placeholder="Votre nom"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError
                            errors={getFieldErrors(field.state.meta.errors)}
                          />
                        )}
                      </Field>
                    );
                  }}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field
                    name="phoneNumber"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            <Phone className="size-3.5 text-muted-foreground" />
                            Téléphone
                          </FieldLabel>
                          <Input
                            id={field.name}
                            name={field.name}
                            className="h-10 bg-background/70"
                            placeholder="Votre numéro"
                            value={field.state.value ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && (
                            <FieldError
                              errors={getFieldErrors(field.state.meta.errors)}
                            />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="lang"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field data-invalid={isInvalid}>
                          <FieldLabel htmlFor={field.name}>
                            <Languages className="size-3.5 text-muted-foreground" />
                            Langue
                          </FieldLabel>
                          <Select
                            value={field.state.value}
                            onValueChange={(value) => {
                              if (value) {
                                field.handleChange(value);
                              }
                            }}
                          >
                            <SelectTrigger
                              id={field.name}
                              className="h-10 bg-background/70"
                              aria-invalid={isInvalid}
                              onBlur={field.handleBlur}
                            >
                              <SelectValue placeholder="Choisir la langue" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="en">Anglais</SelectItem>
                            </SelectContent>
                          </Select>
                          {isInvalid && (
                            <FieldError
                              errors={getFieldErrors(field.state.meta.errors)}
                            />
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>
                <form.Field
                  name="image"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          <ImageIcon className="size-3.5 text-muted-foreground" />
                          Photo de profil
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          className="h-10 bg-background/70"
                          placeholder="https://..."
                          value={field.state.value ?? ""}
                          onBlur={field.handleBlur}
                          onChange={(event) =>
                            field.handleChange(event.target.value)
                          }
                          aria-invalid={isInvalid}
                        />
                        {isInvalid && (
                          <FieldError
                            errors={getFieldErrors(field.state.meta.errors)}
                          />
                        )}
                      </Field>
                    );
                  }}
                />
              </section>

              <section className="space-y-3 border-t pt-5">
                <div className="flex items-center gap-2">
                  <Bell className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold tracking-tight">
                    Notifications
                  </h3>
                </div>
                <div className="divide-y rounded-xl border bg-card">
                  <form.Field
                    name="emailNotifications"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field
                          orientation="horizontal"
                          data-invalid={isInvalid}
                          className="items-center justify-between gap-4 p-4"
                        >
                          <FieldContent>
                            <div className="flex items-center gap-2">
                              <Mail className="size-4 text-muted-foreground" />
                              <FieldLabel htmlFor={field.name}>
                                Notifications par email
                              </FieldLabel>
                            </div>
                            <FieldDescription>
                              Recevoir les rappels et mises à jour importantes.
                            </FieldDescription>
                          </FieldContent>
                          <Switch
                            id={field.name}
                            checked={field.state.value ?? false}
                            onBlur={field.handleBlur}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked)
                            }
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && (
                            <FieldError
                              errors={getFieldErrors(field.state.meta.errors)}
                            />
                          )}
                        </Field>
                      );
                    }}
                  />
                  <form.Field
                    name="smsNotifications"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field
                          orientation="horizontal"
                          data-invalid={isInvalid}
                          className="items-center justify-between gap-4 p-4"
                        >
                          <FieldContent>
                            <div className="flex items-center gap-2">
                              <Phone className="size-4 text-muted-foreground" />
                              <FieldLabel htmlFor={field.name}>
                                Notifications par SMS
                              </FieldLabel>
                            </div>
                            <FieldDescription>
                              Recevoir les alertes urgentes par message.
                            </FieldDescription>
                          </FieldContent>
                          <Switch
                            id={field.name}
                            checked={field.state.value ?? false}
                            onBlur={field.handleBlur}
                            onCheckedChange={(checked) =>
                              field.handleChange(checked)
                            }
                            aria-invalid={isInvalid}
                          />
                          {isInvalid && (
                            <FieldError
                              errors={getFieldErrors(field.state.meta.errors)}
                            />
                          )}
                        </Field>
                      );
                    }}
                  />
                </div>
              </section>

              <section className="border-t pt-5">
                <div className="flex flex-col gap-3 rounded-xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-background ring-1 ring-border">
                      <ShieldCheck className="size-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-medium">
                          Sécurité du compte
                        </p>
                        <Badge
                          variant={user.emailVerified ? "outline" : "secondary"}
                          className="bg-background"
                        >
                          {user.emailVerified && (
                            <CheckCircle2 className="size-3" />
                          )}
                          {user.emailVerified ? "Email vérifié" : "À vérifier"}
                        </Badge>
                      </div>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="shrink-0 active:scale-[0.98]"
                    onClick={() =>
                      window.location.assign("/dashboard/settings")
                    }
                  >
                    <Settings className="size-4" />
                    Paramètres
                  </Button>
                </div>
              </section>
            </FieldGroup>
          </div>

          <div className="flex justify-end gap-2 border-t bg-background px-6 py-4">
            <Button
              type="button"
              variant="outline"
              className="active:scale-[0.98]"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isDirty: state.isDirty,
              })}
              children={({ canSubmit, isDirty }) => (
                <Button
                  type="submit"
                  className="min-w-28 active:scale-[0.98]"
                  disabled={isPending || !canSubmit || !isDirty}
                >
                  {isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              )}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default UserProfileDialog;
