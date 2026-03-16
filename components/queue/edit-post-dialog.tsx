"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import type { Post } from "./post-card";

const PLATFORM_LIMITS: Record<string, number> = {
  TWITTER: 280,
  LINKEDIN: 3000,
  INSTAGRAM: 2200,
};

const PLATFORM_ACTIVE: Record<string, { className?: string; style?: React.CSSProperties }> = {
  TWITTER:   { className: "bg-black text-white border-black" },
  LINKEDIN:  { className: "bg-[#0077b5] text-white border-[#0077b5]" },
  INSTAGRAM: {
    className: "text-white border-transparent",
    style: { background: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" },
  },
};

interface EditPostDialogProps {
  post: Post | null;
  open: boolean;
  onClose: () => void;
  onSave: (post: Post) => void;
}

export function EditPostDialog({ post, open, onClose, onSave }: EditPostDialogProps) {
  const [content, setContent] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);

  function toLocalDateTimeString(date: Date): string {
    return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  }

  useEffect(() => {
    if (post) {
      setContent(post.content);
      setPlatforms(post.platforms ?? []);
      setScheduledAt(
        post.scheduledAt ? toLocalDateTimeString(new Date(post.scheduledAt)) : ""
      );
    }
  }, [post]);

  function togglePlatform(p: string) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  const charLimit =
    platforms.length === 0 ? 3000 : Math.min(...platforms.map((p) => PLATFORM_LIMITS[p]));
  const remaining = charLimit - content.length;
  const isOverLimit = remaining < 0;

  async function handleSave() {
    if (!post) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          platforms,
          scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          status: scheduledAt ? "SCHEDULED" : "DRAFT",
        }),
      });
      const updated = await res.json();
      if (res.ok) {
        onSave(updated);
        onClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen: boolean) => { if (!isOpen) onClose(); }}>
      <DialogContent className="sm:max-w-lg bg-card border-border rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">Edit Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Platform selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Platforms
            </label>
            <div className="flex gap-2 flex-wrap">
              {(["TWITTER", "LINKEDIN", "INSTAGRAM"] as const).map((p) => {
                const selected = platforms.includes(p);
                const cfg = PLATFORM_ACTIVE[p];
                const comingSoon = p === "TWITTER" || p === "INSTAGRAM";
                return (
                  <div key={p} className="relative">
                    <button
                      type="button"
                      onClick={() => !comingSoon && togglePlatform(p)}
                      disabled={comingSoon}
                      style={selected && cfg.style ? cfg.style : undefined}
                      className={`px-3.5 py-1.5 rounded-lg border-2 font-medium text-xs transition-all duration-200 active:scale-95 ${
                        comingSoon
                          ? "opacity-40 cursor-not-allowed bg-background text-muted-foreground border-border"
                          : selected
                          ? cfg.className ?? ""
                          : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {p === "TWITTER" && "𝕏 Twitter"}
                      {p === "LINKEDIN" && "LinkedIn"}
                      {p === "INSTAGRAM" && "Instagram"}
                    </button>
                    {comingSoon && (
                      <span className="absolute -top-2 -right-2 text-[9px] font-bold bg-amber-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                        Soon
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Content textarea */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Content
            </label>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 resize-none transition-all duration-200"
              />
              <div
                className={`absolute bottom-3 right-3 text-xs font-mono tabular-nums ${
                  isOverLimit ? "text-red-500 font-bold" : remaining < 20 ? "text-amber-500" : "text-muted-foreground"
                }`}
              >
                {remaining}
              </div>
            </div>
          </div>

          {/* Schedule time */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Scheduled Time
            </label>
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
              className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all duration-200"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <button
            onClick={onClose}
            className="px-4 h-10 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !content.trim() || isOverLimit}
            className="px-4 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? <><Loader2 className="size-4 animate-spin" /> Saving…</> : "Save Changes"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
