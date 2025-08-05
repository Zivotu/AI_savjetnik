import { useState } from 'react';
import Header from '@/components/Header';

const Privacy = () => {
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');

  const texts = {
    hr: {
      title: 'Obrada podataka i snimanje razgovora',
      intro: 'Kada koristite ovu stranicu i započnete razgovor s našim AI agentom, bilježimo i snimamo vašu komunikaciju u svrhu poboljšanja usluge i pružanja točnih odgovora. Obrada podataka odvija se u skladu s Općom uredbom o zaštiti podataka (GDPR).',
      bullets: [
        'Osnovni pravni temelj: Vaša privola (članak 6. st. 1. točka a) GDPR).',
        'Svrha obrade: pružanje i poboljšanje AI savjetovanja.',
        'Vrsta podataka: snimke razgovora, transkripti, IP adresa i tehnički metapodaci.'
      ],
      retention: 'Podatke pohranjujemo šifrirane maksimalno 30 dana, nakon čega se automatski brišu.',
      rights: 'Imate pravo ostvariti pristup, ispravak, ograničenje obrade, brisanje ili prenosivost podataka, kao i uložiti prigovor na obradu u bilo kojem trenutku.',
      contact: 'Za ostvarivanje svojih prava ili dodatna pitanja obratite nam se na: info@neurobiz.me.',
      effectiveDate: 'Stupanje na snagu: 1. siječnja 2025.'
    },
    en: {
      title: 'Data Processing and Conversation Recording',
      intro: 'When you use this site and initiate a conversation with our AI agent, we record and transcribe your communications for the purpose of improving our service and providing accurate answers. Data processing complies with the EU General Data Protection Regulation (GDPR).',
      bullets: [
        'Legal basis: Your consent (Article 6(1)(a) GDPR).',
        'Purpose: Provision and enhancement of AI consulting services.',
        'Data collected: conversation recordings, transcripts, IP addresses, and technical metadata.'
      ],
      retention: 'Data is stored encrypted for up to 30 days and then automatically deleted.',
      rights: 'You have the right to request access, rectification, restriction of processing, erasure or data portability, and to object to processing at any time.',
      contact: 'To exercise your rights or for any inquiries, please contact us at: info@neurobiz.me.',
      effectiveDate: 'Effective date: January 1, 2025.'
    }
  } as const;

  const t = texts[language];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header language={language} onLanguageChange={setLanguage} />
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-semibold mb-4 text-center">{t.title}</h1>
          <p className="mb-6 leading-relaxed">{t.intro}</p>
          <ul className="list-disc list-inside space-y-2 mb-6">
            {t.bullets.map((item, idx) => (
              <li key={idx} className="text-gray-700">{item}</li>
            ))}
          </ul>
          <p className="mb-4"><strong>{t.retention}</strong></p>
          <p className="mb-4"><strong>{t.rights}</strong></p>
          <p className="mb-4">{t.contact}</p>
          <p className="text-sm text-gray-500 mt-8 text-center">{t.effectiveDate}</p>
        </div>
      </main>
    </div>
  );
};

export default Privacy;
