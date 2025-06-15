"use client";
import { useState } from "react";
import { ImageIcon } from "lucide-react";

export default function UploadFileInput({ onFileSelect }) {
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div
      className={`relative w-full rounded px-4 py-3 transition border
        ${dragActive
          ? "border-[#72BAA9] bg-[#eefcf8] dark:bg-[#264b46]"
          : "border-[#7E5CAD] bg-white dark:bg-[#1e1e2e] dark:border-[#72BAA9]"
        }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
      />
      <div className="flex items-center justify-between pointer-events-none">
        <span className="text-[#7E5CAD] dark:text-[#D5E7B5] font-medium flex items-center gap-1">
          <ImageIcon size={16} /> Upload File
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {fileName || "No file chosen"}
        </span>
      </div>
    </div>
  );
}
