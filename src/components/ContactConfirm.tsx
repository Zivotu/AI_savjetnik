import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface Props {
  open: boolean;
  defaultEmail?: string;
  defaultPhone?: string;
  onSave: (email: string, phone: string) => void;
  onClose: () => void;
  onDecline?: () => void;
}

export default function ContactConfirm({
  open,
  defaultEmail = "",
  defaultPhone = "",
  onSave,
  onClose,
  onDecline,
}: Props) {
  const [email, setEmail] = useState(defaultEmail);
  const [phone, setPhone] = useState(defaultPhone);
  const [dirty, setDirty] = useState(false);

  function validEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }
  function validPhone(p: string) {
    return /^[0-9+()\- ]{6,}$/.test(p);
  }

  const ok = validEmail(email) && validPhone(phone);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Potvrdite svoje kontakt podatke</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Input
            placeholder="E-mail"
            value={email}
            onChange={e => { setEmail(e.target.value); setDirty(true); }}
          />
          <Input
            placeholder="Telefon"
            value={phone}
            onChange={e => { setPhone(e.target.value); setDirty(true); }}
          />
          {dirty && !ok && (
            <p className="text-xs text-red-600">
              Unesite valjanu e-mail adresu i broj telefona.
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onDecline}>
            Ne želim ponudu
          </Button>
          <Button disabled={!ok} onClick={() => onSave(email.trim(), phone.trim())}>
            Spremi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
