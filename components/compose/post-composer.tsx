"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, X, CalendarClock, Loader2 } from "lucide-react";

const PLATFORM_LIMITS: Record<string, number> = {
  TWITTER: 280,
  LINKEDIN: 3000,
  INSTAGRAM: 2200,
};

const PLATFORMS: {
  key: string;
  label: string;
  activeClass: string;
  icon: string;
  activeStyle?: React.CSSProperties;
}[] = [
  {
    key: "TWITTER",
    label: "𝕏 Twitter",
    activeClass: "bg-black text-white border-black",
    icon: "𝕏",
  },
  {
    key: "LINKEDIN",
    label: "LinkedIn",
    activeClass: "bg-[#0077b5] text-white border-[#0077b5]",
    icon: "in",
  },
  {
    key: "INSTAGRAM",
    label: "Instagram",
    activeClass: "text-white border-transparent",
    activeStyle: { background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" },
    icon: "📷",
  },
];

export function PostComposer() {
  const router = useRouter();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [content, setContent] = useState("");
  const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const charLimit =
    selectedPlatforms.length === 0
      ? 3000
      : Math.min(...selectedPlatforms.map((p) => PLATFORM_LIMITS[p]));
  const remaining = charLimit - content.length;
  const isOverLimit = remaining < 0;
  const isNearLimit = !isOverLimit && remaining < 20;

  const counterColor = isOverLimit
    ? "text-red-500 font-bold"
    : isNearLimit
    ? "text-amber-500 font-semibold"
    : "text-muted-foreground";

  useEffect(() => {
    const draft = { content, selectedPlatforms, scheduledAt };
    const interval = setInterval(() => {
      localStorage.setItem("compose_draft", JSON.stringify(draft));
    }, 30000);
    return () => clearInterval(interval);
  }, [content, selectedPlatforms, scheduledAt]);

  useEffect(() => {
    const saved = localStorage.getItem("compose_draft");
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        setContent(draft.content ?? "");
        setSelectedPlatforms(draft.selectedPlatforms ?? []);
        setScheduledAt(draft.scheduledAt ?? "");
      } catch { /* ignore */ }
    }
  }, []);

  function togglePlatform(p: string) {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  }

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const slots = 4 - images.length;
    const toAdd = files.slice(0, slots).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...toAdd]);
  }

  function removeImage(i: number) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[i].preview);
      return prev.filter((_, idx) => idx !== i);
    });
  }

  async function handleSaveDraft() {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selectedPlatforms, status: "DRAFT" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to save draft");
      localStorage.removeItem("compose_draft");
      setSuccess("Draft saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  }

  async function handleSchedule() {
    if (!scheduledAt) { setError("Please select a scheduled time"); return; }
    if (selectedPlatforms.length === 0) { setError("Select at least one platform"); return; }
    if (!content.trim()) { setError("Content cannot be empty"); return; }
    setLoading(true); setError("");
    try {
      const createRes = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, platforms: selectedPlatforms, status: "DRAFT" }),
      });
      const created = await createRes.json();
      if (!createRes.ok) throw new Error(created.error ?? "Failed to create post");
      const schedRes = await fetch("/api/posts/schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: created.id, scheduledAt }),
      });
      const scheduled = await schedRes.json();
      if (!schedRes.ok) throw new Error(scheduled.error ?? "Failed to schedule post");
      localStorage.removeItem("compose_draft");
      setSuccess("Post scheduled!");
      setTimeout(() => { setSuccess(""); router.push("/dashboard/queue"); }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  }

  async function handlePostNow() {
    if (selectedPlatforms.length === 0) { setError("Select at least one platform"); return; }
    if (!content.trim()) { setError("Content cannot be empty"); return; }
    setLoading(true); setError("");
    try {
      const imagePayload = await Promise.all(
        images.map(({ file }) =>
          new Promise<{ data: string; mimeType: string }>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = (reader.result as string).split(",")[1];
              resolve({ data: base64, mimeType: file.type });
            };
            reader.readAsDataURL(file);
          })
        )
      );

      const res = await fetch("/api/posts/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platforms: selectedPlatforms,
          status: "PUBLISHED",
          publishedAt: new Date().toISOString(),
          images: imagePayload,
        }),
      });
      const data = await res.json();
      if (!res.ok && res.status !== 207) throw new Error(data.error ?? "Failed to post");
      localStorage.removeItem("compose_draft");
      if (data.warnings?.length) {
        setError(data.warnings.join(" "));
      } else {
        setSuccess("Posted successfully!");
        setTimeout(() => { setSuccess(""); router.push("/dashboard/queue"); }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      {/* Platform selector */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Platforms</p>
        <div className="flex gap-2 flex-wrap">
          {PLATFORMS.map(({ key, label, activeClass, activeStyle }) => {
            const sel = selectedPlatforms.includes(key);
            return (
              <button
                key={key}
                onClick={() => togglePlatform(key)}
                style={sel && activeStyle ? activeStyle : undefined}
                className={`px-4 py-2 rounded-lg border-2 font-medium text-sm transition-all duration-200 active:scale-95 ${
                  sel
                    ? activeClass
                    : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content</p>
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What do you want to share?"
            rows={7}
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-all duration-200"
          />
          <div className={`absolute bottom-3 right-3 text-xs font-mono tabular-nums ${counterColor}`}>
            {remaining}
          </div>
        </div>
        {selectedPlatforms.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {selectedPlatforms.map((p) => {
              const over = content.length > PLATFORM_LIMITS[p];
              return (
                <span
                  key={p}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    over
                      ? "bg-red-500/10 text-red-500 border-red-500/20"
                      : "bg-muted text-muted-foreground border-transparent"
                  }`}
                >
                  {p}: {PLATFORM_LIMITS[p] - content.length}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {/* Media */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Media <span className="font-normal">({images.length}/4)</span>
        </p>
        <div className="flex gap-3 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative group size-20 rounded-xl overflow-hidden border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button
                onClick={() => removeImage(i)}
                className="absolute inset-0 bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="size-4" />
              </button>
            </div>
          ))}
          {images.length < 4 && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="size-20 rounded-xl border-2 border-dashed border-border hover:border-indigo-500 hover:bg-indigo-500/5 flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-indigo-500 transition-all duration-200"
            >
              <ImagePlus className="size-5" />
              <span className="text-xs font-medium">Add</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageChange} />
      </div>

      {/* Schedule */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
          <CalendarClock className="size-3.5" /> Schedule for Later
        </p>
        <input
          type="datetime-local"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
          min={new Date().toISOString().slice(0, 16)}
          className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200"
        />
      </div>

      {/* Feedback */}
      {error && (
        <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-500">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-500 font-medium">
          {success}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 justify-end">
        <button
          onClick={handleSaveDraft}
          disabled={loading || !content.trim()}
          className="px-5 h-11 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-all duration-200 disabled:opacity-40 active:scale-95"
        >
          Save Draft
        </button>
        <button
          onClick={handleSchedule}
          disabled={loading || isOverLimit || !content.trim()}
          className="px-5 h-11 rounded-xl border border-indigo-500 text-indigo-500 text-sm font-semibold hover:bg-indigo-500 hover:text-white transition-all duration-200 disabled:opacity-40 active:scale-95"
        >
          Add to Queue
        </button>
        <button
          onClick={handlePostNow}
          disabled={loading || isOverLimit || !content.trim()}
          className="px-5 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-40 active:scale-95 flex items-center gap-2"
        >
          {loading ? <><Loader2 className="size-4 animate-spin" /> Posting…</> : "Post Now"}
        </button>
      </div>
    </div>
  );
}
