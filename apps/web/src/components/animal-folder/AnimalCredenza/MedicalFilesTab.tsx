
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Upload,
  X,
  Download,
  Trash2,
  Image as ImageIcon,
  File,
  Video,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileDropzone,
  formatFileRejection,
} from "@/components/file-dropzone";
import type { Pet } from "@/lib/schemas";
import {
  getMedicalDocumentsByPetId,
  createMedicalDocument,
  deleteMedicalDocument,
} from "@/lib/api/actions/medicalDocuments.action";
import { useUploadThing } from "@/lib/utils/uploadthing";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface MedicalFilesTabProps {
  animal: Pet;
  client?: boolean;
}

const documentTypeLabels = {
  radiography: "Radiographie",
  analysis: "Analyse",
  prescription: "Ordonnance",
  vaccination: "Vaccination",
  other: "Autre",
};

const getFileIcon = (fileType: string) => {
  if (fileType.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 text-blue-500" />;
  }
  if (fileType === "application/pdf") {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  if (fileType.startsWith("video/")) {
    return <Video className="h-5 w-5 text-purple-500" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
};

const formatFileSize = (bytes: string | null | undefined) => {
  if (!bytes) return "Taille inconnue";
  const size = parseInt(bytes);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

export const MedicalFilesTab = ({
  animal,
  client = false,
}: MedicalFilesTabProps) => {
  const queryClient = useQueryClient();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{
      url: string;
      name: string;
      size: string;
      type: string;
    }>
  >([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [documentType, setDocumentType] = useState<
    "radiography" | "analysis" | "prescription" | "vaccination" | "other"
  >("other");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data: documents, isLoading } = useQuery({
    queryKey: ["medical-documents", animal.id],
    queryFn: () => getMedicalDocumentsByPetId(animal.id),
  });

  const { startUpload, isUploading } = useUploadThing(
    "medicalDocumentsUploader",
    {
      onUploadProgress: setUploadProgress,
    },
  );

  const deleteMutation = useMutation({
    mutationFn: deleteMedicalDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medical-documents", animal.id],
      });
      toast.success("Document supprimé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du document");
    },
  });

  const createMutation = useMutation({
    mutationFn: createMedicalDocument,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["medical-documents", animal.id],
      });
      toast.success("Document(s) ajouté(s) avec succès");
      setIsUploadDialogOpen(false);
      setUploadedFiles([]);
      setSelectedFiles([]);
      setUploadProgress(0);
      setTitle("");
      setDescription("");
      setDocumentType("other");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du document");
    },
  });

  const handleFileUpload = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Veuillez sélectionner au moins un fichier");
      return;
    }

    try {
      // Créer un document pour chaque fichier uploadé
      const promises = uploadedFiles.map((file) =>
        createMutation.mutateAsync({
          petId: animal.id,
          fileName: file.name,
          fileUrl: file.url,
          fileType: file.type,
          fileSize: file.size,
          title: title || file.name,
          description: description || undefined,
        }),
      );

      await Promise.all(promises);
    } catch (error) {
      console.error("Error creating documents:", error);
    }
  };

  const handleSelectedFilesChange = async (files: File[]) => {
    setSelectedFiles(files);
    setUploadedFiles([]);
    setUploadProgress(0);

    if (files.length === 0) {
      return;
    }

    try {
      const uploaded = await startUpload(files);

      if (!uploaded) {
        toast.error("Erreur lors de l'upload des fichiers");
        return;
      }

      setUploadedFiles(
        uploaded.map((file) => ({
          url: file.ufsUrl || file.url,
          name: file.name,
          size: file.size.toString(),
          type: file.type || "application/octet-stream",
        })),
      );
      setUploadProgress(100);
    } catch (error) {
      console.error("Error uploading documents:", error);
      setSelectedFiles([]);
      setUploadedFiles([]);
      setUploadProgress(0);
      toast.error("Erreur lors de l'upload des fichiers");
    }
  };

  const handleDelete = (documentId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      deleteMutation.mutate(documentId);
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Date inconnue";
    const dateObject = date instanceof Date ? date : new Date(date);
    return formatDistanceToNow(dateObject, {
      addSuffix: true,
      locale: fr,
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Documents médicaux
          </h2>
          <p className="text-sm text-muted-foreground">
            Radios, analyses, ordonnances et autres documents médicaux
          </p>
        </div>
        {!client && (
          <Dialog
            open={isUploadDialogOpen}
            onOpenChange={setIsUploadDialogOpen}
          >
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter un document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Ajouter un document médical</DialogTitle>
                <DialogDescription>
                  Téléchargez des radios, analyses, ordonnances ou autres
                  documents médicaux pour {animal.name}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="document-type">Type de document</Label>
                  <Select
                    value={documentType}
                    onValueChange={(value) =>
                      setDocumentType(
                        value as
                          | "radiography"
                          | "analysis"
                          | "prescription"
                          | "vaccination"
                          | "other",
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="radiography">Radiographie</SelectItem>
                      <SelectItem value="analysis">Analyse</SelectItem>
                      <SelectItem value="prescription">Ordonnance</SelectItem>
                      <SelectItem value="vaccination">Vaccination</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titre (optionnel)</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Radio du genou gauche"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optionnel)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ajoutez une description ou des notes..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fichiers</Label>
                  {uploadedFiles.length === 0 ? (
                    <FileDropzone
                      accept={{
                        "application/pdf": [".pdf"],
                        "image/*": [],
                        "video/*": [],
                      }}
                      description="PDF, images ou vidéos. Les limites exactes sont appliquées par UploadThing."
                      disabled={isUploading}
                      files={selectedFiles}
                      maxFiles={10}
                      multiple
                      onFilesChange={handleSelectedFilesChange}
                      onRejected={(rejections) => {
                        toast.error(
                          rejections.map(formatFileRejection).join(" "),
                        );
                      }}
                      title={
                        isUploading
                          ? `Upload en cours (${uploadProgress}%)`
                          : "Importer des fichiers"
                      }
                    />
                  ) : (
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <Card key={index}>
                          <CardContent className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                {getFileIcon(file.type)}
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {formatFileSize(file.size)}
                                  </p>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUploadedFiles(
                                    uploadedFiles.filter((_, i) => i !== index),
                                  );
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                      <Button
                        variant="outline"
                        onClick={() => {
                          setUploadedFiles([]);
                          setSelectedFiles([]);
                          setUploadProgress(0);
                        }}
                        className="w-full"
                      >
                        Changer les fichiers
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsUploadDialogOpen(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleFileUpload}
                    disabled={
                      uploadedFiles.length === 0 ||
                      createMutation.isPending ||
                      isUploading
                    }
                  >
                    {createMutation.isPending || isUploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Enregistrement...
                      </>
                    ) : (
                      "Enregistrer"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Liste des documents */}
      {isLoading ? (
        <div className="text-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
        </div>
      ) : documents && documents.length > 0 ? (
        <div className="space-y-3">
          {documents.map((document) => (
            <Card
              key={document.id}
              className="hover:shadow-sm transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getFileIcon(document.fileType)}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-foreground truncate">
                          {document.title || document.fileName}
                        </h4>
                        <Badge variant="secondary">
                          {
                            documentTypeLabels[
                              document.fileType as keyof typeof documentTypeLabels
                            ]
                          }
                        </Badge>
                      </div>
                      {document.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {document.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(document.createdAt)}</span>
                        <span>•</span>
                        <span>{formatFileSize(document.fileSize)}</span>
                        {document.uploader && (
                          <>
                            <span>•</span>
                            <span>
                              Par{" "}
                              {document.uploader.name ||
                                document.uploader.email}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(document.fileUrl, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    {!client && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(document.id)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h5 className="font-medium mb-2">Aucun document médical</h5>
            <p className="text-sm text-muted-foreground mb-4">
              Aucun document médical n&apos;a encore été ajouté pour{" "}
              {animal.name}.
            </p>
            {!client && (
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Ajouter le premier document
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
