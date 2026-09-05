import { FileIcon, ImageIcon, UploadCloud, X } from "lucide-react";
import { useDropzone, type Accept, type FileRejection } from "react-dropzone";

import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";

export type FileDropzoneProps = {
  accept?: Accept;
  className?: string;
  description?: string;
  disabled?: boolean;
  files: File[];
  id?: string;
  maxFiles?: number;
  maxSize?: number;
  multiple?: boolean;
  onFilesChange: (files: File[]) => void;
  onRejected?: (rejections: FileRejection[]) => void;
  title?: string;
};

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatFileRejection(rejection: FileRejection) {
  const messages = rejection.errors.map((error) => {
    if (error.code === "file-invalid-type") {
      return "Format non accepté.";
    }

    if (error.code === "file-too-large") {
      return "Fichier trop lourd.";
    }

    if (error.code === "too-many-files") {
      return "Trop de fichiers sélectionnés.";
    }

    return error.message;
  });

  return `${rejection.file.name}: ${messages.join(" ")}`;
}

export function FileDropzone({
  accept,
  className,
  description = "Glissez-déposez un fichier ici ou cliquez pour parcourir.",
  disabled = false,
  files,
  id,
  maxFiles = 1,
  maxSize,
  multiple = false,
  onFilesChange,
  onRejected,
  title = "Importer un fichier",
}: FileDropzoneProps) {
  const { getInputProps, getRootProps, isDragActive, isDragReject } =
    useDropzone({
      accept,
      disabled,
      maxFiles,
      maxSize,
      multiple,
      onDrop: (acceptedFiles, fileRejections) => {
        if (fileRejections.length > 0) {
          onRejected?.(fileRejections);
        }

        if (acceptedFiles.length === 0) {
          return;
        }

        onFilesChange(multiple ? acceptedFiles : acceptedFiles.slice(0, 1));
      },
    });

  function removeFile(fileToRemove: File) {
    onFilesChange(files.filter((file) => file !== fileToRemove));
  }

  return (
    <div className={cn("grid gap-3", className)}>
      <div
        {...getRootProps({
          className: cn(
            "flex min-h-36 cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition-colors",
            "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
            isDragActive && "border-emerald-300 bg-emerald-50",
            isDragReject && "border-red-300 bg-red-50",
            disabled && "pointer-events-none cursor-not-allowed opacity-60",
          ),
        })}
      >
        <input id={id} {...getInputProps()} />
        <div className="flex size-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-xs">
          <UploadCloud className="size-5" aria-hidden="true" />
        </div>
        <div className="grid gap-1">
          <p className="text-sm font-medium text-slate-900">{title}</p>
          <p className="max-w-sm text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      {files.length > 0 ? (
        <div className="grid gap-2">
          {files.map((file) => (
            <div
              className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
              key={`${file.name}-${file.lastModified}`}
            >
              <div className="flex size-8 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                {file.type.startsWith("image/") ? (
                  <ImageIcon className="size-4" aria-hidden="true" />
                ) : (
                  <FileIcon className="size-4" aria-hidden="true" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900">
                  {file.name}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <Button
                aria-label={`Retirer ${file.name}`}
                disabled={disabled}
                onClick={(event) => {
                  event.stopPropagation();
                  removeFile(file);
                }}
                size="icon-sm"
                type="button"
                variant="ghost"
              >
                <X className="size-4" aria-hidden="true" />
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
