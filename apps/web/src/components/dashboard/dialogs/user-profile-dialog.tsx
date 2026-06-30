import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import {
  Bell,
  ImageIcon,
  KeyRound,
  Languages,
  Mail,
  Phone,
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
import { Separator } from "@biume/ui/components/separator";
import { Switch } from "@biume/ui/components/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@biume/ui/components/tabs";
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

function getProfileCompletion(user: User) {
  const values = [
    user.name,
    user.email,
    user.phoneNumber,
    user.lang,
    user.image,
  ];
  const completed = values.filter(Boolean).length;

  return Math.round((completed / values.length) * 100);
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
  const profileCompletion = getProfileCompletion(user);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="px-6 pt-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Mon profil
              </DialogTitle>
              <DialogDescription className="text-sm leading-relaxed">
                Gérez vos informations, vos préférences et vos accès sensibles.
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className="hidden bg-background/80 sm:flex"
            >
              {user.lang === "en" ? "EN" : "FR"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="px-6 pt-5">
          <div className="relative overflow-hidden rounded-2xl border bg-card p-4 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)]">
            <div className="absolute inset-x-0 top-0 h-px bg-foreground/10" />
            <div className="grid gap-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <Avatar className="size-16 rounded-2xl ring-1 ring-border">
                <AvatarImage
                  src={user.image || undefined}
                  alt={user.name || "Profil"}
                />
                <AvatarFallback className="rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold tracking-tight">
                    {user.name}
                  </p>
                  <Badge variant="secondary" className="bg-muted/80">
                    {user.emailVerified ? "Email vérifié" : "Email à vérifier"}
                  </Badge>
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {user.email}
                </p>
              </div>
              <div className="space-y-2 sm:w-32">
                <div className="flex items-center justify-between text-[0.7rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  <span>Profil</span>
                  <span>{profileCompletion}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="px-6 pb-6 pt-5"
        >
          <Tabs defaultValue="profil" className="w-full">
            <TabsList className="grid h-10 w-full grid-cols-3 rounded-xl bg-muted/50 p-1">
              <TabsTrigger
                value="profil"
                className="gap-1.5 rounded-lg font-medium transition-all active:scale-[0.98] data-[state=active]:border data-[state=active]:border-border/60 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <UserRound className="size-3.5" />
                Profil
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="gap-1.5 rounded-lg font-medium transition-all active:scale-[0.98] data-[state=active]:border data-[state=active]:border-border/60 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <Bell className="size-3.5" />
                Notifications
              </TabsTrigger>
              <TabsTrigger
                value="securite"
                className="gap-1.5 rounded-lg font-medium transition-all active:scale-[0.98] data-[state=active]:border data-[state=active]:border-border/60 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <ShieldCheck className="size-3.5" />
                Sécurité
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profil" className="mt-5 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold tracking-tight">
                    Informations publiques
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ces informations identifient votre compte dans Biume.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                        <FieldDescription>
                          Nom visible dans les espaces partagés.
                        </FieldDescription>
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
                        <FieldDescription>
                          Utilisé uniquement pour les notifications activées.
                        </FieldDescription>
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
                        <FieldDescription>
                          Langue par défaut de votre interface.
                        </FieldDescription>
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
                  name="image"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid;

                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel htmlFor={field.name}>
                          <ImageIcon className="size-3.5 text-muted-foreground" />
                          Photo de profil (URL)
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
                        <FieldDescription>
                          URL d'image utilisée pour votre avatar.
                        </FieldDescription>
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
            </TabsContent>

            <TabsContent value="notifications" className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  Préférences de notifications
                </p>
                <p className="text-sm text-muted-foreground">
                  Choisissez les canaux qui méritent votre attention.
                </p>
              </div>
              <div className="rounded-2xl border bg-card p-1">
                <FieldGroup className="gap-1">
                  <form.Field
                    name="emailNotifications"
                    children={(field) => {
                      const isInvalid =
                        field.state.meta.isTouched && !field.state.meta.isValid;

                      return (
                        <Field
                          orientation="horizontal"
                          data-invalid={isInvalid}
                          className="items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/45"
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
                          className="items-center justify-between rounded-xl p-3 transition-colors hover:bg-muted/45"
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
                </FieldGroup>
              </div>
            </TabsContent>

            <TabsContent value="securite" className="mt-5 space-y-4">
              <div>
                <p className="text-sm font-semibold tracking-tight">
                  Gestion de sécurité
                </p>
                <p className="text-sm text-muted-foreground">
                  Les changements sensibles s'effectuent depuis les paramètres.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border bg-card p-4">
                  <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-muted">
                    <Mail className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Adresse email</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Modifiez l'adresse utilisée pour vous connecter.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full active:scale-[0.98]"
                    onClick={() =>
                      window.location.assign("/dashboard/settings")
                    }
                  >
                    Changer d&apos;email
                  </Button>
                </div>
                <div className="rounded-2xl border bg-card p-4">
                  <div className="mb-4 flex size-9 items-center justify-center rounded-xl bg-muted">
                    <KeyRound className="size-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">Mot de passe</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Renforcez la sécurité de votre session.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="mt-4 w-full active:scale-[0.98]"
                    onClick={() =>
                      window.location.assign("/dashboard/settings")
                    }
                  >
                    Changer de mot de passe
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator className="my-5" />

          <div className="flex justify-end gap-2">
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
