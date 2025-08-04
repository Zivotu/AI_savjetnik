import { useState } from 'react';
import Header from '@/components/Header';

const Privacy = () => {
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');
  const texts = {
    hr: {
      title: 'Detalji o obradi podataka',
      p1: 'Vaš razgovor i kontakt podaci koriste se isključivo za pružanje traženog AI savjetovanja i odgovora na upite.',
      p2: 'Podatke čuvamo šifrirane najviše 30 dana i ne dijelimo ih s trećim stranama.',
      p3: 'Svoja prava na pristup, ispravak ili brisanje podataka možete ostvariti slanjem zahtjeva na info@neurobiz.me.'
    },
    en: {
      title: 'Data processing details',
      p1: 'Your conversation and contact information are used solely to provide the requested AI consulting and reply to inquiries.',
      p2: 'Data is stored encrypted for up to 30 days and is never shared with third parties.',
      p3: 'You may exercise your rights to access, rectify or erase data by contacting info@neurobiz.me.'
    }
  } as const;
  const t = texts[language];

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header language={language} onLanguageChange={setLanguage} />
      <main className="container mx-auto px-4 py-8 prose">
        <h1>{t.title}</h1>
        <p>{t.p1}</p>
        <p>{t.p2}</p>
        <p>{t.p3}</p>
      </main>
    </div>
  );
};

export default Privacy;
