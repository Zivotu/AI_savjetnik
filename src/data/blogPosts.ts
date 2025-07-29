export interface BlogPost {
  id: string;
  slug: string;
  title: {
    hr: string;
    en: string;
  };
  excerpt: {
    hr: string;
    en: string;
  };
  content: {
    hr: string;
    en: string;
  };
  category: {
    hr: string;
    en: string;
  };
  date: string;
  author: string;
  featured: boolean;
  thumbnail?: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    slug: 'automatizacija-ponuda-iz-upita',
    title: {
      hr: 'Automatizacija ponuda iz upita: korak‑po‑korak',
      en: 'Quote Automation from Inquiries: Step-by-Step'
    },
    excerpt: {
      hr: 'Kako AI može automatski kreirati profesionalne ponude iz customer upita u manje od 5 minuta.',
      en: 'How AI can automatically create professional quotes from customer inquiries in less than 5 minutes.'
    },
    content: {
      hr: 'Detaljni vodič kroz implementaciju AI sustava za automatsko kreiranje ponuda...',
      en: 'Detailed guide through implementing AI system for automatic quote creation...'
    },
    category: {
      hr: 'Automatizacija',
      en: 'Automation'
    },
    date: '2024-01-15',
    author: 'Marko Petrović',
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop'
  },
  {
    id: '2',
    slug: 'ai-u-knjigovodstvu',
    title: {
      hr: 'AI u knjigovodstvu: sažeci računa bez greške',
      en: 'AI in Accounting: Error-free Invoice Summaries'
    },
    excerpt: {
      hr: 'Korak‑po‑korak implementacija AI-ja za automatsko sažimanje računa u strukturirane tablice.',
      en: 'Step-by-step AI implementation for automatic invoice summarization into structured tables.'
    },
    content: {
      hr: 'Upravljanje računima može biti zamorno, ali AI mijenja pravila igre...',
      en: 'Managing invoices can be tedious, but AI is changing the game...'
    },
    category: {
      hr: 'Knjigovodstvo',
      en: 'Accounting'
    },
    date: '2024-01-12',
    author: 'Ana Kovač',
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop'
  },
  {
    id: '3',
    slug: 'chatbot-za-leadove',
    title: {
      hr: 'Chatbot za kvalifikaciju leadova u malim timovima',
      en: 'Lead Qualification Chatbot for Small Teams'
    },
    excerpt: {
      hr: 'Kako implementirati chatbot koji automatski kvalificira potencijalne kupce 24/7.',
      en: 'How to implement a chatbot that automatically qualifies potential customers 24/7.'
    },
    content: {
      hr: 'Kvalifikacija leadova je ključna za rast, a chatbot može automatizirati...',
      en: 'Lead qualification is key to growth, and chatbots can automate...'
    },
    category: {
      hr: 'CRM',
      en: 'CRM'
    },
    date: '2024-01-10',
    author: 'Petra Novak',
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop'
  },
  {
    id: '4',
    slug: 'gdpr-i-ai',
    title: {
      hr: 'GDPR i AI: što mala tvrtka mora znati',
      en: 'GDPR and AI: What Small Companies Must Know'
    },
    excerpt: {
      hr: 'Praktični vodič kroz GDPR obveze kada koristite AI u svojoj tvrtki.',
      en: 'Practical guide through GDPR obligations when using AI in your company.'
    },
    content: {
      hr: 'GDPR i AI mogu zvučati komplicirano, ali evo praktičnih koraka...',
      en: 'GDPR and AI may sound complicated, but here are practical steps...'
    },
    category: {
      hr: 'GDPR',
      en: 'GDPR'
    },
    date: '2024-01-08',
    author: 'Tomislav Jurić',
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=400&h=250&fit=crop'
  },
  {
    id: '5',
    slug: 'airtable-make-erp',
    title: {
      hr: 'Airtable + Make: mini "ERP" u tjedan dana',
      en: 'Airtable + Make: Mini "ERP" in a Week'
    },
    excerpt: {
      hr: 'Kako spojiti Airtable i Make.com za kreiranje jednostavnog ERP sustava.',
      en: 'How to connect Airtable and Make.com to create a simple ERP system.'
    },
    content: {
      hr: 'Velike ERP sustave si mogu priuštiti samo velike tvrtke, ali...',
      en: 'Large ERP systems can only be afforded by large companies, but...'
    },
    category: {
      hr: 'Automatizacija',
      en: 'Automation'
    },
    date: '2024-01-05',
    author: 'Ivana Babić',
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=400&h=250&fit=crop'
  },
  {
    id: '6',
    slug: 'priprema-podataka-za-ai',
    title: {
      hr: 'Kako pripremiti podatke da AI daje točne odgovore',
      en: 'How to Prepare Data for Accurate AI Responses'
    },
    excerpt: {
      hr: 'Ključne strategije za strukturiranje podataka prije implementacije AI rješenja.',
      en: 'Key strategies for structuring data before implementing AI solutions.'
    },
    content: {
      hr: 'Kvaliteta AI odgovora ovisi o kvaliteti podataka. Evo kako...',
      en: 'Quality of AI responses depends on data quality. Here\'s how...'
    },
    category: {
      hr: 'Automatizacija',
      en: 'Automation'
    },
    date: '2024-01-03',
    author: 'Matej Horvat',
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=250&fit=crop'
  },
  {
    id: '7',
    slug: 'od-upita-do-pdf-ponude',
    title: {
      hr: 'Od upita do PDF ponude: automatizirani tok',
      en: 'From Inquiry to PDF Quote: Automated Flow'
    },
    excerpt: {
      hr: 'Kompletna automatizacija procesa od customer upita do gotove PDF ponude.',
      en: 'Complete process automation from customer inquiry to finished PDF quote.'
    },
    content: {
      hr: 'Ovaj članak pokazuje kako automatizirati kompletan sales funnel...',
      en: 'This article shows how to automate the complete sales funnel...'
    },
    category: {
      hr: 'Automatizacija',
      en: 'Automation'
    },
    date: '2024-01-01',
    author: 'Kristina Šimić',
    featured: true,
    thumbnail: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=250&fit=crop'
  },
  {
    id: '8',
    slug: 'customer-support-ai',
    title: {
      hr: 'Customer support: prvi odgovori u minuti',
      en: 'Customer Support: First Responses in a Minute'
    },
    excerpt: {
      hr: 'Kako AI može odgovoriti na 80% customer support upita u manje od minute.',
      en: 'How AI can respond to 80% of customer support inquiries in under a minute.'
    },
    content: {
      hr: 'Brz customer support je ključ zadovoljstva kupaca. AI omogućuje...',
      en: 'Fast customer support is key to customer satisfaction. AI enables...'
    },
    category: {
      hr: 'CRM',
      en: 'CRM'
    },
    date: '2023-12-28',
    author: 'Darko Blažević',
    featured: false,
    thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=250&fit=crop'
  }
];

export const categories = {
  hr: ['Sve', 'Automatizacija', 'CRM', 'Knjigovodstvo', 'GDPR', 'E‑commerce'],
  en: ['All', 'Automation', 'CRM', 'Accounting', 'GDPR', 'E-commerce']
};