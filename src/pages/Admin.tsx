import { useEffect, useState } from "react";
import PasswordModal from "@/components/PasswordModal";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody as Tbody,
  TableHead as Th,
  TableHeader as Thead,
  TableRow as Tr,
  TableCell as Td,
} from "@/components/ui/table";

interface Row {
  id: string;
  created: string;
  finished: string | null;
  turns: number;
  hasContact: boolean;
}

export default function Admin() {
  const [pass, setPass] = useState(() => sessionStorage.getItem("adminPass") || "");
  const [rows, setRows] = useState<Row[]>([]);
  const [selected, setSelected] = useState<any | null>(null);

  useEffect(() => {
    if (!pass) return;
    fetch("/api/transcripts", { headers: { "x-admin-pass": pass } })
      .then(r => r.json())
      .then(setRows)
      .catch(() => { setPass(""); sessionStorage.removeItem("adminPass"); });
  }, [pass]);

  function handleDelete(id: string) {
    if (!confirm("Delete transcript?")) return;
    fetch(`/api/transcripts/${id}`, { method:"DELETE",headers:{ "x-admin-pass": pass } })
      .then(()=> setRows(rows.filter(r=>r.id!==id)));
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Transkripti</h1>

      <Table>
        <Thead>
          <Tr><Th>ID</Th><Th>Start</Th><Th>Turns</Th><Th>Kontakt</Th><Th></Th></Tr>
        </Thead>
        <Tbody>
          {rows.map(r=>(
            <Tr key={r.id} className="hover:bg-muted" onClick={()=>fetch(`/api/transcripts/${r.id}`,{headers:{ "x-admin-pass":pass }})
                                     .then(r=>r.json()).then(setSelected)}>
              <Td className="font-mono text-xs">{r.id.slice(0,8)}</Td>
              <Td>{new Date(r.created).toLocaleString()}</Td>
              <Td>{r.turns}</Td>
              <Td>{r.hasContact ? "✔️" : ""}</Td>
              <Td><Button size="xs" variant="ghost" onClick={(e)=>{e.stopPropagation();handleDelete(r.id);}}>🗑️</Button></Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {selected && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Detalji</h2>
          <textarea className="w-full h-80 text-xs bg-muted p-2 rounded"
            readOnly value={JSON.stringify(selected,null,2)} />
        </div>
      )}

      <PasswordModal
        open={!pass}
        onSubmit={(p)=>{
          sessionStorage.setItem("adminPass", p);
          setPass(p);
        }}
      />
    </div>
  );
}
