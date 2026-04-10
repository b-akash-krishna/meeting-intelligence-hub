"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { UploadResponse } from "@/types/meeting";

interface FileUploadProps {
  onUploadSuccess?: (data: UploadResponse) => void;
}

export default function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    setStatus("uploading");
    const formData = new FormData();
    formData.append("file", acceptedFiles[0]);
    try {
      const res = await fetch("http://localhost:8000/api/v1/meetings/upload", { method: "POST", body: formData });
      const data: UploadResponse = await res.json();
      if (res.ok && data.status === "completed") { setStatus("success"); setMessage(data.message); onUploadSuccess?.(data); }
      else { setStatus("error"); setMessage("Processing failed."); }
    } catch { setStatus("error"); setMessage("Network error. Is the backend running?"); }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: { "text/plain": [".txt"], "text/vtt": [".vtt"] },
    maxFiles: 1,
    disabled: status === "uploading",
  });

  const zoneClass = isDragActive || isDragReject ? "upload-drag" : status === "idle" ? "upload-idle" : "";

  if (status === "success") {
    return (
      <div className="content-fade-up flex flex-col items-center py-8 text-center">
        <CheckCircle className="h-10 w-10 mb-3" style={{ color: "var(--success)" }} />
        <p className="font-semibold text-base" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
          Analysis complete
        </p>
        <p className="text-sm ink-muted mt-1 max-w-sm">{message}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs font-semibold px-4 py-2 rounded-full text-white transition hover:opacity-90"
          style={{ background: "var(--accent)", boxShadow: "0 2px 8px var(--accent-glow)" }}
        >
          Upload another
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="content-fade-up flex flex-col items-center py-8 text-center">
        <AlertCircle className="h-10 w-10 mb-3" style={{ color: "var(--danger)" }} />
        <p className="font-semibold text-base" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>Upload failed</p>
        <p className="text-sm mt-1" style={{ color: "var(--danger)" }}>{message}</p>
        <button onClick={() => setStatus("idle")} className="mt-4 text-xs font-semibold px-4 py-2 rounded-full border transition" style={{ borderColor: "var(--line-strong)", color: "var(--muted)" }}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`relative flex flex-col items-center justify-center rounded-2xl px-6 py-12 cursor-pointer transition-all ${zoneClass} ${status === "uploading" ? "pointer-events-none opacity-70" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="content-fade-up flex flex-col items-center text-center">
        {status === "uploading" ? (
          <Loader2 className="h-9 w-9 mb-4" style={{ color: "var(--accent)", animation: "spin 1s linear infinite" }} />
        ) : (
          <div
            className="flex items-center justify-center rounded-xl mb-4"
            style={{ width: "3rem", height: "3rem", background: "var(--accent-soft)", border: "1px solid var(--accent-soft-line)" }}
          >
            <UploadCloud className={`h-6 w-6 ${isDragActive ? "text-orange-600" : ""}`} style={{ color: "var(--accent)" }} />
          </div>
        )}
        <p className="font-semibold text-base" style={{ fontFamily: "var(--font-heading)", color: "var(--foreground)" }}>
          {status === "uploading" ? "Analyzing transcript…" : isDragActive ? "Drop it here" : "Drop a transcript"}
        </p>
        <p className="text-sm ink-muted mt-1">
          {status === "uploading" ? "Extracting actions, decisions & sentiment" : ".vtt or .txt · max 1 file"}
        </p>
      </div>
    </div>
  );
}
