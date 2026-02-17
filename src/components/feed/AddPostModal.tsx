"use client";

import * as React from "react";

type Props = {
  onClose: () => void;
  onSubmit: (payload: { videoUrl: string; caption: string }) => Promise<void>;
  uploadVideo: (file: File) => Promise<string>;
};

export function AddPostModal({ onClose, onSubmit, uploadVideo }: Props) {
  const [caption, setCaption] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [videoPreview, setVideoPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [uploadStep, setUploadStep] = React.useState<"idle" | "uploading" | "posting">("idle");
  const [error, setError] = React.useState("");

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      setError("Please select a video file (e.g. MP4, WebM).");
      return;
    }
    setError("");
    setFile(f);
    setVideoPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a video.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      setUploadStep("uploading");
      const videoUrl = await uploadVideo(file);
      setUploadStep("posting");
      await onSubmit({ videoUrl, caption: caption.trim() });
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to post.";
      setError(msg);
      if (msg.includes("signed in")) {
        setError("Sign in with your @uic.edu account to upload.");
      } else if (msg.includes("uic.edu")) {
        setError("Only @uic.edu accounts can post. Sign in with your UIC email.");
      } else if (msg.includes("permission") || msg.includes("Permission") || msg.includes("403")) {
        setError("Upload denied. Check Firebase Storage rules (feed/ path).");
      }
    } finally {
      setUploading(false);
      setUploadStep("idle");
    }
  };

  React.useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [videoPreview]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div
        className="bg-white w-full max-h-[90vh] overflow-hidden rounded-t-2xl sm:rounded-2xl shadow-xl flex flex-col max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#001E62]/12">
          <h2 className="text-lg font-bold text-[#001E62]">New post</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-[#001E62]/70 hover:bg-[#001E62]/10"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-y-auto touch-scroll">
          <div className="p-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={onFileChange}
              className="hidden"
            />
            {videoPreview ? (
              <div className="relative aspect-[4/5] max-h-[40vh] rounded-xl bg-black overflow-hidden mb-4">
                <video
                  src={videoPreview}
                  className="w-full h-full object-contain"
                  controls
                  muted
                  playsInline
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute top-2 right-2 rounded-lg bg-black/50 text-white px-3 py-1.5 text-sm"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-video rounded-xl border-2 border-dashed border-[#001E62]/30 bg-[#F2F7EB]/50 flex flex-col items-center justify-center gap-2 text-[#001E62]/70 hover:border-[#D50032]/50 hover:bg-[#F2F7EB] transition-colors"
              >
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium">Choose video</span>
              </button>
            )}
            <label className="block text-sm font-medium text-[#001E62] mt-2 mb-1">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              rows={3}
              className="w-full rounded-xl border border-[#001E62]/20 px-3 py-2 text-[#333333] placeholder:text-[#001E62]/40 focus:outline-none focus:ring-2 focus:ring-[#D50032]/30 focus:border-[#D50032]"
            />
            {error ? (
              <p className="mt-2 text-sm text-[#D50032]">{error}</p>
            ) : null}
          </div>
          <div className="p-4 pt-0 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#001E62]/20 text-[#001E62] font-semibold hover:bg-[#001E62]/5"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="flex-1 py-2.5 rounded-xl bg-[#D50032] text-white font-semibold hover:bg-[#b00028] disabled:opacity-50 disabled:pointer-events-none"
            >
              {uploading
                ? uploadStep === "uploading"
                  ? "Uploading video…"
                  : "Posting…"
                : "Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
