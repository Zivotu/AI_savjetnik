import { useState, useEffect } from "react";
import { X } from "lucide-react";

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

  useEffect(() => {
    if (open) {
      setEmail(defaultEmail);
      setPhone(defaultPhone);
      setDirty(false);
    }
  }, [open, defaultEmail, defaultPhone]);

  function validEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  function validPhone(p: string) {
    return /^[0-9+()\- ]{6,}$/.test(p);
  }

  const ok = validEmail(email) && validPhone(phone);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-strong rounded-3xl p-8 w-full max-w-md shadow-strong">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Uredi svoje kontakt podatke
            </h2>
            <p className="text-white text-sm">Odgovoramo u roku od 24 sata</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-smooth"
            aria-label="Zatvori"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form
          onSubmit={e => {
            e.preventDefault();
            if (!ok) return;
            onSave(email.trim(), phone.trim());
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              E-mail
            </label>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                setDirty(true);
              }}
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Telefon
            </label>
            <input
              type="tel"
              placeholder="Telefon"
              value={phone}
              onChange={e => {
                setPhone(e.target.value);
                setDirty(true);
              }}
              className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
            />
          </div>

          {dirty && !ok && (
            <p className="text-xs text-red-400">
              Unesite valjanu e-mail adresu i broj telefona.
            </p>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onDecline}
              className="w-full bg-white/20 hover:bg-white/30 text-white py-3 rounded-xl font-semibold transition-smooth"
            >
              Ne želim ponudu
            </button>
            <button
              type="submit"
              disabled={!ok}
              className="w-full bg-gradient-primary text-white py-3 rounded-xl font-semibold shadow-medium hover:shadow-strong transition-smooth hover:scale-[1.02] disabled:opacity-50"
            >
              Spremi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

