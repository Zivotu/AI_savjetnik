import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BlogCard from "@/components/BlogCard";
import RichTextEditor from "@/components/RichTextEditor";
import { toast } from "@/use-toast";

interface Article {
  id: string;
  slug: string;
  title: { hr: string; en: string };
  content: { hr: string; en: string };
  excerpt: { hr: string; en: string };
  category: { hr: string; en: string };
  featured: boolean;
  thumbnail?: string;
  createdAt: string;
}

interface Props {
  pass: string;
}

export default function Articles({ pass }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const initialForm = {
    slug: "",
    titleHr: "",
    titleEn: "",
    contentHr: "",
    contentEn: "",
    categoryHr: "",
    categoryEn: "",
    featured: false,
  };
  const [form, setForm] = useState<typeof initialForm & { id?: string; thumbnail?: string }>(initialForm);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetch("/api/articles")
      .then(r => r.json())
      .then(setArticles)
      .catch(() => setArticles([]));
  }, [pass]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = form.id ? "PUT" : "POST";
    const url = form.id ? `/api/articles/${form.id}` : "/api/articles";
    const body = {
      slug: form.slug,
      titleHr: form.titleHr,
      titleEn: form.titleEn,
      contentHr: form.contentHr,
      contentEn: form.contentEn,
      categoryHr: form.categoryHr,
      categoryEn: form.categoryEn,
      featured: form.featured,
      thumbnail: form.thumbnail,
    };
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-pass": pass,
      },
      body: JSON.stringify(body),
    })
      .then(r => r.json())
      .then((a: Article) => {
        setArticles(prev =>
          prev.some(x => x.id === a.id)
            ? prev.map(x => (x.id === a.id ? a : x))
            : [...prev, a]
        );
        setForm(initialForm);
        setShowForm(false);
        toast({ description: "Članak uspješno dodan" });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  }

  function handleEdit(a: Article) {
    setForm({
      id: a.id,
      slug: a.slug,
      titleHr: a.title.hr,
      titleEn: a.title.en,
      contentHr: a.content.hr,
      contentEn: a.content.en,
      categoryHr: a.category.hr,
      categoryEn: a.category.en,
      featured: a.featured,
      thumbnail: a.thumbnail,
    });
    setShowForm(true);
  }

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev =>
      setForm(f => ({ ...f, thumbnail: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  function handleDelete(id: string) {
    if (!confirm("Delete article?")) return;
    fetch(`/api/articles/${id}`, {
      method: "DELETE",
      headers: { "x-admin-pass": pass },
    }).then(() => setArticles(arts => arts.filter(a => a.id !== id)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Članci</h1>

      {!showForm && (
        <>
          <Button className="mb-4" onClick={() => { setForm(initialForm); setShowForm(true); }}>
            Novi članak
          </Button>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.map(a => (
              <div key={a.id} className="relative">
                <BlogCard
                  title={a.title.hr}
                  excerpt={a.excerpt.hr}
                  slug={a.slug}
                  featured={a.featured}
                  thumbnail={a.thumbnail}
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  <Button size="sm" variant="secondary" onClick={e => { e.stopPropagation(); handleEdit(a); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={e => { e.stopPropagation(); handleDelete(a.id); }}>
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {showForm && (
      <form onSubmit={handleSubmit} className="mt-6 space-y-2">
        <Input
          placeholder="Slug"
          value={form.slug}
          onChange={e => setForm({ ...form, slug: e.target.value })}
        />
        <Input
          placeholder="Naslov HR"
          value={form.titleHr}
          onChange={e => setForm({ ...form, titleHr: e.target.value })}
        />
        <Input
          placeholder="Naslov EN"
          value={form.titleEn}
          onChange={e => setForm({ ...form, titleEn: e.target.value })}
        />
        <RichTextEditor
          value={form.contentHr}
          onChange={val => setForm({ ...form, contentHr: val })}
        />
        <RichTextEditor
          value={form.contentEn}
          onChange={val => setForm({ ...form, contentEn: val })}
        />
        <Input
          placeholder="Kategorija HR"
          value={form.categoryHr}
          onChange={e => setForm({ ...form, categoryHr: e.target.value })}
        />
        <Input
          placeholder="Kategorija EN"
          value={form.categoryEn}
          onChange={e => setForm({ ...form, categoryEn: e.target.value })}
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={e => setForm({ ...form, featured: e.target.checked })}
          />
          <span>Featured</span>
        </div>
        <Input type="file" accept="image/*" onChange={handleFile} />
        <Button type="submit">{form.id ? "Spremi" : "Dodaj"}</Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => { setForm(initialForm); setShowForm(false); }}
        >
          Odustani
        </Button>
      </form>
      )}
    </div>
  );
}
