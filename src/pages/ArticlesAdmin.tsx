import { useState } from "react";
import PasswordModal from "@/components/PasswordModal";
import { Button } from "@/components/ui/button";
import { blogPosts, BlogPost } from "@/data/blogPosts";

export default function ArticlesAdmin() {
  const [pass, setPass] = useState(() => sessionStorage.getItem("adminPass") || "");
  const [posts, setPosts] = useState<BlogPost[]>(blogPosts);

  const handleUpload = async (id: string, file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "x-admin-pass": pass },
      body: fd
    });
    if (!res.ok) return;
    const data = await res.json();
    setPosts(ps => ps.map(p => p.id === id ? { ...p, thumbnail: data.url } : p));
  };

  const removeThumb = (id: string) =>
    setPosts(ps => ps.map(p => p.id === id ? { ...p, thumbnail: undefined } : p));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Articles</h1>
      {posts.map(p => (
        <div key={p.id} className="mb-6 border p-4 rounded">
          <div className="flex gap-4 items-center">
            {p.thumbnail ? (
              <img src={p.thumbnail} alt="" className="w-32 h-20 object-cover" />
            ) : (
              <div className="w-32 h-20 bg-muted flex items-center justify-center text-sm text-muted-foreground">
                no image
              </div>
            )}
            <div className="flex-1">
              <div className="font-semibold mb-2">{p.title.hr}</div>
              <div className="flex gap-2">
                <input
                  id={`file-${p.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) handleUpload(p.id, file);
                    e.target.value = "";
                  }}
                />
                <label htmlFor={`file-${p.id}`}>
                  <Button type="button" variant="secondary">
                    {p.thumbnail ? "Replace" : "Upload"}
                  </Button>
                </label>
                {p.thumbnail && (
                  <Button type="button" variant="destructive" onClick={() => removeThumb(p.id)}>
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
      <PasswordModal
        open={!pass}
        onSubmit={p => {
          sessionStorage.setItem("adminPass", p);
          setPass(p);
        }}
      />
    </div>
  );
}
