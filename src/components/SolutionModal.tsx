import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SolutionModalProps {
  open: boolean;
  solution: string;
  language: "hr" | "en";
  onClose: () => void;
}

export default function SolutionModal({ open, solution, language, onClose }: SolutionModalProps) {
  const texts = {
    hr: { title: "AI rješenje", print: "Ispiši", share: "Dijeli" },
    en: { title: "AI Solution", print: "Print", share: "Share" }
  } as const;

  const current = texts[language];

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: current.title, text: solution }).catch(() => {});
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{current.title}</DialogTitle>
        </DialogHeader>
        <p className="whitespace-pre-line text-sm">{solution}</p>
        <DialogFooter>
          <Button type="button" onClick={() => window.print()}>{current.print}</Button>
          <Button type="button" variant="secondary" onClick={handleShare} disabled={!navigator.share}>{current.share}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
