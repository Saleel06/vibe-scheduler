"use client";

import { useEffect, useState } from "react";
import { PostCard, type Post } from "./post-card";
import { EditPostDialog } from "./edit-post-dialog";
import Link from "next/link";
import { PenSquare } from "lucide-react";

const STATUS_TABS = ["ALL", "SCHEDULED", "DRAFT", "PUBLISHED", "FAILED"] as const;

const TAB_COLORS: Record<string, string> = {
  ALL: "text-foreground",
  SCHEDULED: "text-amber-500",
  DRAFT: "text-zinc-400",
  PUBLISHED: "text-emerald-500",
  FAILED: "text-red-500",
};

export function PostQueue() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [editPost, setEditPost] = useState<Post | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    setLoading(true);
    const res = await fetch("/api/posts");
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  function handleDelete(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  function handleEdit(post: Post) {
    setEditPost(post);
    setEditOpen(true);
  }

  function handleSaved(updated: Post) {
    setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  const filtered =
    activeTab === "ALL" ? posts : posts.filter((p) => p.status === activeTab);

  const counts = STATUS_TABS.reduce(
    (acc, tab) => {
      acc[tab] = tab === "ALL" ? posts.length : posts.filter((p) => p.status === tab).length;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border overflow-x-auto pb-px">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all duration-200 -mb-px ${
              activeTab === tab
                ? `border-primary ${TAB_COLORS[tab]}`
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
            {counts[tab] > 0 && (
              <span className="ml-1.5 text-xs bg-muted rounded-full px-1.5 py-0.5 tabular-nums">
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="py-20 text-center text-muted-foreground text-sm">Loading posts…</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center">
            <PenSquare className="size-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              {activeTab === "ALL"
                ? "Create your first post to get started."
                : `No ${activeTab.toLowerCase()} posts.`}
            </p>
          </div>
          {activeTab === "ALL" && (
            <Link
              href="/dashboard/compose"
              className="px-5 h-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-semibold hover:opacity-90 transition-all duration-200 shadow-lg shadow-indigo-500/25"
            >
              <PenSquare className="size-4" /> Compose a post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((post) => (
            <PostCard key={post.id} post={post} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <EditPostDialog
        post={editPost}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={handleSaved}
      />
    </div>
  );
}
