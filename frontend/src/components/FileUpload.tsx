"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, CheckCircle, AlertCircle } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import type { UploadResponse } from "@/types/meeting";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  });

  return (
    <div className="w-full max-w-3xl mx-auto mt-2">
      <div 
        {...getRootProps()} 
        className={cn(
          "panel-strong relative overflow-hidden flex flex-col items-center justify-center w-full rounded-[2rem] cursor-pointer transition-all duration-300 ease-out px-8 py-14",
          isDragActive ? "border-[color:var(--accent)] bg-[color:var(--accent-soft)]" : "hover:-translate-y-0.5 hover:border-[color:var(--accent-soft-line)]",
          isDragReject ? "border-rose-400 bg-rose-50" : "",
          status === "uploading" ? "opacity-50 pointer-events-none" : ""
        )}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[color:var(--accent-soft)] to-transparent opacity-80" />
        <input {...getInputProps()} />
        
        {status === "idle" || status === "uploading" ? (
          <>
            <span className="section-title mb-4">Transcript Intake</span>
            <UploadCloud className={cn("w-12 h-12 mb-5", isDragActive ? "text-[color:var(--accent)] delay-75 animate-bounce" : "text-[color:var(--accent-warm)]")} />
            <h3 className="text-2xl font-semibold text-center text-slate-900">
              {status === "uploading" ? "AI Analyzing Transcript..." : isDragActive ? "Drop the transcript here" : "Drag & drop a transcript"}
            </h3>
            <p className="mt-3 max-w-xl text-center text-sm ink-muted">
              Upload realistic meeting notes in `.vtt` or `.txt` format to generate actions, decisions, sentiment signals, and cited answers.
            </p>
            <p className="mt-6 inline-flex rounded-full border border-[color:var(--line)] bg-white/80 px-4 py-2 text-xs tracking-[0.16em] uppercase ink-muted shadow-sm">
              Supported formats: .vtt and .txt
            </p>
          </>
        ) : status === "success" ? (
          <>
            <span className="section-title mb-4">Processing Complete</span>
            <CheckCircle className="w-12 h-12 mb-4 text-emerald-600" />
            <h3 className="text-2xl font-semibold text-emerald-700">Analysis Complete</h3>
            <p className="mt-3 max-w-xl text-sm ink-muted whitespace-pre-line text-center">{message}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}
              className="mt-6 rounded-full border border-[color:var(--accent)] bg-[color:var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Upload Another
            </button>
          </>
        ) : (
          <>
            <span className="section-title mb-4">Processing Error</span>
            <AlertCircle className="w-12 h-12 mb-4 text-rose-600" />
            <h3 className="text-2xl font-semibold text-rose-700">Upload Failed</h3>
            <p className="mt-3 max-w-xl text-sm text-rose-600 text-center">{message}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}
              className="mt-6 rounded-full border border-slate-800 bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
