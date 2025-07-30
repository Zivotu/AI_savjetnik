import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";

interface Props {
  open: boolean;
  onAccept: () => void;
  onClose: () => void;
}

export default function GdprModal({ open, onAccept, onClose }: Props) {
  const [checked, setChecked] = useState(false);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Privola za snimanje razgovora</DialogTitle>
        </DialogHeader>

        <p className="text-sm leading-relaxed">
          Razgovor se snima i pohranjuje isključivo radi pružanja AI savjetovanja.
          Više detalja možete pronaći u našoj{" "}
          <a href="#privatnost" className="underline text-primary">
            politici privatnosti
          </a>.
        </p>

        <div className="flex items-center space-x-2 pt-4">
          <Checkbox id="consent" checked={checked} onCheckedChange={v => setChecked(!!v)} />
          <label htmlFor="consent" className="text-sm select-none">
            Prihvaćam snimanje razgovora
          </label>
        </div>

        <DialogFooter>
          <Button onClick={onAccept} disabled={!checked}>
            Prihvaćam
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
