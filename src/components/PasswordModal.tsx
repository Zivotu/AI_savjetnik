import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Props {
  open: boolean;
  onSubmit: (pass: string) => void;
}

export default function PasswordModal({ open, onSubmit }: Props) {
  const [value, setValue] = useState("");
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Admin lozinka</DialogTitle>
        </DialogHeader>
        <Input placeholder="Lozinka" value={value} onChange={e=>setValue(e.target.value)} />
        <DialogFooter>
          <Button onClick={()=>onSubmit(value)} disabled={!value.trim()}>Potvrdi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
