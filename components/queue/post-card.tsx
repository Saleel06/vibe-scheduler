"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  DRAFT:     { label: "Draft",     className: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20" },
  SCHEDULED: { label: "Scheduled", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  PUBLISHED: { label: "Published", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  FAILED:    { label: "Failed",    className: "bg-red-500/10 text-red-500 border-red-500/20" },
};

const PLATFORM_CONFIG: Record<string, { label: string; borderColor: string; dotColor: string }> = {
  TWITTER:   { label: "Twitter",   borderColor: "border-l-zinc-800",   dotColor: "bg-zinc-800" },
  LINKEDIN:  { label: "LinkedIn",  borderColor: "border-l-[#0077b5]",  dotColor: "bg-[#0077b5]" },
  INSTAGRAM: { label: "Instagram", borderColor: "border-l-pink-500",   dotColor: "bg-pink-500" },
};

export interface Post {
  id: string;
  content: string;
  status: string;
  platforms: string[];
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  mediaUrls: string[];
}

interface PostCardProps {
  post: Post;
  onDelete: (id: string) => void;
  onEdit: (post: Post) => void;
}

function getPrimaryPlatformBorder(platforms: string[]): string {
  if (!platforms?.length) return "";
  const first = platforms[0];
  return PLATFORM_CONFIG[first]?.borderColor ?? "";
}

export function PostCard({ post, onDelete, onEdit }: PostCardProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      if (res.ok) onDelete(post.id);
    } finally {
      setDeleting(false);
    }
  }

  const statusCfg = STATUS_CONFIG[post.status] ?? { label: post.status, className: "bg-muted text-muted-foreground border-border" };
  const borderClass = getPrimaryPlatformBorder(post.platforms);

  return (
    <div
      className={`group bg-card border border-border border-l-4 ${borderClass} rounded-2xl p-5 space-y-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm leading-relaxed text-foreground line-clamp-3 flex-1">{post.content}</p>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCfg.className}`}>
          {statusCfg.label}
        </span>
      </div>

      {/* Platform badges */}
      {post.platforms?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {post.platforms.map((p) => {
            const cfg = PLATFORM_CONFIG[p];
            return (
              <span key={p} className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <span className={`size-2 rounded-full ${cfg?.dotColor ?? "bg-muted-foreground"}`} />
                {cfg?.label ?? p}
              </span>
            );
          })}
        </div>
      )}

      {/* Media thumbnails */}
      {post.mediaUrls.length > 0 && (
        <div className="flex gap-2">
          {post.mediaUrls.map((url, i) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={i} src={url} alt="" className="size-12 rounded-lg object-cover border border-border" />
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {post.scheduledAt ? (
            <>
              <Calendar className="size-3.5" />
              <span>{format(new Date(post.scheduledAt), "MMM d, yyyy 'at' h:mm a")}</span>
              <span className="opacity-40">·</span>
              <span>{formatDistanceToNow(new Date(post.scheduledAt), { addSuffix: true })}</span>
            </>
          ) : post.publishedAt ? (
            <>
              <Clock className="size-3.5" />
              <span>Published {formatDistanceToNow(new Date(post.publishedAt), { addSuffix: true })}</span>
            </>
          ) : (
            <>
              <Clock className="size-3.5" />
              <span>Created {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            </>
          )}
        </div>

        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(post)}
            className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 active:scale-95"
          >
            <Pencil className="size-3" /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-1.5 px-3 h-7 rounded-lg border border-red-500/20 text-xs font-medium text-red-500 hover:bg-red-500/10 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <Trash2 className="size-3" /> {deleting ? "…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
