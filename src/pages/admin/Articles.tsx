import { useEffect, useState } from "react";
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
  title: string;
  content: string;
}

interface Props {
  pass: string;
}

export default function Articles({ pass }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState<{ id?: string; title: string; content: string }>({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (!pass) return;
    fetch("/api/articles", { headers: { "x-admin-pass": pass } })
      .then(r => r.json())
      .then(setArticles)
      .catch(() => setArticles([]));
  }, [pass]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const method = form.id ? "PUT" : "POST";
    const url = form.id ? `/api/articles/${form.id}` : "/api/articles";
    fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-pass": pass,
      },
      body: JSON.stringify({ title: form.title, content: form.content }),
    })
      .then(r => r.json())
      .then((a: Article) => {
        setArticles(prev =>
          prev.some(x => x.id === a.id)
            ? prev.map(x => (x.id === a.id ? a : x))
            : [...prev, a]
        );
        setForm({ title: "", content: "" });
      });
  }

  function handleEdit(a: Article) {
    setForm(a);
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
              <Td>{a.title}</Td>
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
          placeholder="Naslov"
          value={form.title}
          onChange={e => setForm({ ...form, title: e.target.value })}
        />
        <Textarea
          placeholder="Sadržaj"
          value={form.content}
          onChange={e => setForm({ ...form, content: e.target.value })}
          className="h-40"
        />
        <Button type="submit">{form.id ? "Spremi" : "Dodaj"}</Button>
        {form.id && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => setForm({ title: "", content: "" })}
          >
            Odustani
          </Button>
        )}
      </form>
    </div>
  );
}
