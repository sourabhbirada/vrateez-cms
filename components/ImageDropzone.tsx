"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

type ImageDropzoneProps = {
  onFiles: (files: FileList) => void | Promise<void>;
  multiple?: boolean;
  uploading?: boolean;
  label?: string;
  hint?: string;
};

export function ImageDropzone({
  onFiles,
  multiple = true,
  uploading = false,
  label = "Drop images here or click to upload",
  hint = "PNG, JPG, WebP up to 5MB. Recommended: 800x800px",
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files?.length || uploading) return;
    void onFiles(files);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
        dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
      } ${uploading ? "opacity-60 pointer-events-none" : ""}`}
    >
      <Upload size={32} className="mx-auto text-muted mb-3" />
      <p className="text-sm font-medium text-stone-700">{uploading ? "Uploading to S3..." : label}</p>
      <p className="text-xs text-muted mt-1">{hint}</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}
