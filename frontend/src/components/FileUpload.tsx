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
    <div className="w-full max-w-2xl mx-auto mt-2">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative flex flex-col items-center justify-center w-full p-12 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out bg-white dark:bg-slate-950",
          isDragActive ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20" : "border-slate-300 hover:border-blue-400 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-blue-500 dark:hover:bg-slate-900",
          isDragReject ? "border-red-500 bg-red-50" : "",
          status === "uploading" ? "opacity-50 pointer-events-none" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {status === "idle" || status === "uploading" ? (
          <>
            <UploadCloud className={cn("w-12 h-12 mb-4", isDragActive ? "text-blue-500 delay-75 animate-bounce" : "text-slate-400")} />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">
              {status === "uploading" ? "AI Analyzing Transcript..." : isDragActive ? "Drop the transcript here" : "Drag & drop a transcript"}
            </h3>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Supported formats: .vtt, .txt
            </p>
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle className="w-12 h-12 mb-4 text-emerald-500" />
            <h3 className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">Analysis Complete</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 whitespace-pre-line text-center">{message}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 dark:bg-slate-800 dark:text-blue-400"
            >
              Upload Another
            </button>
          </>
        ) : (
          <>
            <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Upload Failed</h3>
            <p className="mt-2 text-sm text-red-500 dark:text-red-400 text-center">{message}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setStatus("idle"); }}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
