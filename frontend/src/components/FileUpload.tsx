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
    if (acceptedFiles.length === 0) return;

    const selectedFile = acceptedFiles[0];
    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("http://localhost:8000/api/v1/meetings/upload", {
        method: "POST",
        body: formData,
      });

      const data: UploadResponse = await response.json();

      if (response.ok && data.status === "completed") {
        setStatus("success");
        setMessage(data.message);
        onUploadSuccess?.(data);
      } else {
        setStatus("error");
        setMessage("Failed to process file.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Is the backend running?");
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "text/vtt": [".vtt"],
    },
    maxFiles: 1,
    disabled: status === "uploading",
  });

  const zoneClass = isDragReject
    ? "upload-drag"
    : isDragActive
      ? "upload-drag"
      : status === "idle"
        ? "upload-idle"
        : "";

  return (
    <div className="w-full max-w-3xl mx-auto mt-2">
      <div
        {...getRootProps()}
        className={`relative overflow-hidden flex flex-col items-center justify-center w-full rounded-[2rem] cursor-pointer transition-all duration-300 px-8 py-14 panel ${zoneClass} ${
          isDragReject ? "border-red-500" : ""
        } ${status === "uploading" ? "pointer-events-none opacity-75" : ""}`}
        style={{
          minHeight: "240px",
        }}
      >
        {/* Subtle top gradient overlay */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background: "linear-gradient(to bottom, rgba(99,102,241,0.08), transparent)",
          }}
        />

        <input {...getInputProps()} />

        {/* ── IDLE / UPLOADING ── */}
        {(status === "idle" || status === "uploading") && (
          <div className="relative z-10 flex flex-col items-center content-fade-up">
            <p className="section-title mb-5">Transcript Intake</p>

            {status === "uploading" ? (
              <Loader2
                className="w-12 h-12 mb-5 text-[color:var(--accent)]"
                style={{ animation: "spin 1s linear infinite" }}
              />
            ) : (
              <div
                className="mb-5 flex items-center justify-center rounded-2xl"
                style={{
                  width: "3.5rem",
                  height: "3.5rem",
                  background: "rgba(99,102,241,0.15)",
                  border: "1px solid rgba(99,102,241,0.3)",
                }}
              >
                <UploadCloud
                  className={`w-7 h-7 ${
                    isDragActive ? "text-[color:var(--accent)] icon-bounce" : "text-[color:var(--accent-warm)]"
                  }`}
                />
              </div>
            )}

            <h3
              className="text-2xl text-center"
              style={{
                fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                fontWeight: 700,
                color: "var(--foreground)",
              }}
            >
              {status === "uploading"
                ? "AI Analyzing Transcript…"
                : isDragActive
                  ? "Drop the transcript here"
                  : "Drag & drop a transcript"}
            </h3>
            <p className="mt-3 max-w-sm text-center text-sm ink-muted leading-6">
              {status === "uploading"
                ? "Extracting actions, decisions, and sentiment from your meeting."
                : "Upload in .vtt or .txt format to generate actions, decisions, sentiment signals, and cited answers."}
            </p>

            {status === "idle" && (
              <div
                className="mt-6 inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-widest uppercase"
                style={{
                  background: "var(--surface-strong)",
                  border: "1px solid var(--line)",
                  color: "var(--muted)",
                }}
              >
                <span
                  className="inline-block w-2 h-2 rounded-full"
                  style={{ background: "var(--accent-warm)" }}
                />
                Supported: .vtt and .txt
              </div>
            )}
          </div>
        )}

        {/* ── SUCCESS ── */}
        {status === "success" && (
          <div className="relative z-10 flex flex-col items-center content-fade-up">
            <p className="section-title mb-5">Processing Complete</p>
            <div
              className="mb-5 flex items-center justify-center rounded-2xl"
              style={{
                width: "3.5rem",
                height: "3.5rem",
                background: "rgba(16,185,129,0.15)",
                border: "1px solid rgba(16,185,129,0.3)",
              }}
            >
              <CheckCircle className="w-7 h-7" style={{ color: "var(--success)" }} />
            </div>
            <h3
              className="text-2xl text-center"
              style={{
                fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                fontWeight: 700,
                color: "#34d399",
              }}
            >
              Analysis Complete
            </h3>
            <p className="mt-3 max-w-sm text-sm ink-muted whitespace-pre-line text-center leading-6">
              {message}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}
              className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                boxShadow: "0 4px 20px rgba(99,102,241,0.4)",
              }}
            >
              Upload Another
            </button>
          </div>
        )}

        {/* ── ERROR ── */}
        {status === "error" && (
          <div className="relative z-10 flex flex-col items-center content-fade-up">
            <p className="section-title mb-5">Processing Error</p>
            <div
              className="mb-5 flex items-center justify-center rounded-2xl"
              style={{
                width: "3.5rem",
                height: "3.5rem",
                background: "rgba(244,63,94,0.15)",
                border: "1px solid rgba(244,63,94,0.3)",
              }}
            >
              <AlertCircle className="w-7 h-7" style={{ color: "var(--danger)" }} />
            </div>
            <h3
              className="text-2xl text-center"
              style={{
                fontFamily: "var(--font-heading, 'Plus Jakarta Sans', sans-serif)",
                fontWeight: 700,
                color: "#fb7185",
              }}
            >
              Upload Failed
            </h3>
            <p className="mt-3 max-w-sm text-sm text-center leading-6" style={{ color: "#fb7185" }}>
              {message}
            </p>
            <button
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}
              className="mt-6 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              style={{
                background: "var(--surface-strong)",
                border: "1px solid var(--line-strong)",
              }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
