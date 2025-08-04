import { useEffect, useState, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody as Tbody,
  TableHead as Th,
  TableHeader as Thead,
  TableRow as Tr,
  TableCell as Td,
} from "@/components/ui/table";

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
  const [form, setForm] = useState<{
    id?: string;
    slug: string;
    titleHr: string;
    titleEn: string;
    contentHr: string;
    contentEn: string;
    categoryHr: string;
    categoryEn: string;
    featured: boolean;
    thumbnail?: string;
  }>({
    slug: "",
    titleHr: "",
    titleEn: "",
    contentHr: "",
    contentEn: "",
    categoryHr: "",
    categoryEn: "",
    featured: false,
  });

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
        setForm({
          slug: "",
          titleHr: "",
          titleEn: "",
          contentHr: "",
          contentEn: "",
          categoryHr: "",
          categoryEn: "",
          featured: false,
        });
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
      <Table>
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>Naslov</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {articles.map(a => (
            <Tr key={a.id}>
              <Td className="font-mono text-xs">{a.id.slice(0, 8)}</Td>
              <Td>{a.title.hr}</Td>
              <Td className="text-right space-x-2">
                <Button size="sm" variant="ghost" onClick={() => handleEdit(a)}>
                  ✏️
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(a.id)}
                >
                  🗑️
                </Button>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

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
        <Textarea
          placeholder="Sadržaj HR"
          value={form.contentHr}
          onChange={e => setForm({ ...form, contentHr: e.target.value })}
          className="h-40"
        />
        <Textarea
          placeholder="Sadržaj EN"
          value={form.contentEn}
          onChange={e => setForm({ ...form, contentEn: e.target.value })}
          className="h-40"
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
        {form.id && (
          <Button
            type="button"
            variant="ghost"
            onClick={() =>
              setForm({
                slug: "",
                titleHr: "",
                titleEn: "",
                contentHr: "",
                contentEn: "",
                categoryHr: "",
                categoryEn: "",
                featured: false,
              })
            }
          >
            Odustani
          </Button>
        )}
      </form>
    </div>
  );
}
