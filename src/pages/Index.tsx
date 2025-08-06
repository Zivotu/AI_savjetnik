import { useState, useEffect } from 'react';
import { X, Headphones } from 'lucide-react';
import Header from '@/components/Header';
import AgentPanel from '@/components/AgentPanel';
import QuestionModal from '@/components/QuestionModal';
import BlogCard from '@/components/BlogCard';
import introAudio from '@/assets/Intro.mp3';

interface Article {
  id: string;
  slug: string;
  title: { hr: string; en: string };
  excerpt: { hr: string; en: string };
  content: { hr: string; en: string };
  category: { hr: string; en: string };
  featured: boolean;
  thumbnail?: string;
  createdAt: string;
}

// TypeWriter komponenta s bržim efektom
function TypeWriter({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      setShown(text.slice(0, ++i));
      if (i >= text.length) clearInterval(id);
    }, 15); // Brži od originalnih 20ms
    return () => clearInterval(id);
  }, [text]);
  
  return <span>{shown}</span>;
}

// Headphones Notification Modal komponenta
const HeadphonesNotification = ({ language, isVisible, onClose }: { 
  language: 'hr' | 'en'; 
  isVisible: boolean; 
  onClose: () => void; 
}) => {
  const [showTypewriter, setShowTypewriter] = useState(false);

  const texts = {
    hr: {
      mainText: "Kako bismo vam osigurali vrhunsko korisničko iskustvo, preporučujemo korištenje slušalica.",
      subText: "Na taj će način naš sustav besprijekorno prepoznati vaš glas, bez ometanja zbog povratnog zvuka iz zvučnika.",
      closeButton: "ZATVORI"
    },
    en: {
      mainText: "For the best user experience, we recommend using headphones.",
      subText: "This way our system will flawlessly recognize your voice, without interference from feedback sound from the speakers.",
      closeButton: "CLOSE"
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    if (isVisible) {
      // Pokretanje zvuka Intro.mp3
      const audio = new Audio(introAudio);
      audio.play().catch(err => {
        console.log('Audio autoplay blocked:', err);
      });

      // Delay za typewriter efekt
      const timer = setTimeout(() => {
        setShowTypewriter(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4" 
      style={{
        background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
        backdropFilter: 'blur(8px)'
      }}
    >
      <div 
        className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1) inset',
          animation: 'fadeInScale 0.5s ease-out'
        }}
      >
        <div className="p-8 text-center">
          {/* Close Button */}
          <div className="flex justify-end mb-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-all duration-300 hover:scale-110"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Text with TypeWriter */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight min-h-[120px]" style={{ color: '#ffffff' }}>
              {showTypewriter && <TypeWriter text={currentTexts.mainText} />}
            </h2>
            <p className="text-lg mb-8 leading-relaxed max-w-md mx-auto min-h-[96px]" style={{ color: 'rgba(255,255,255,0.8)' }}>
              {showTypewriter && <TypeWriter text={currentTexts.subText} />}
            </p>
          </div>

          {/* Animated Headphones Icon */}
          <div className="mb-8">
            <div 
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                boxShadow: '0 10px 30px rgba(59,130,246,0.3)',
                animation: 'bounce 2s infinite'
              }}
            >
              <Headphones className="w-12 h-12 text-white" />
            </div>
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: 'rgba(255,255,255,0.6)',
                    animation: `pulse 1.5s infinite ${i * 0.2}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl text-lg"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              boxShadow: '0 10px 30px rgba(59,130,246,0.3)'
            }}
          >
            {currentTexts.closeButton}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }
      `}</style>
    </div>
  );
};

const Index = () => {
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isHeadphonesModalOpen, setIsHeadphonesModalOpen] = useState(true); // Prikazuje se na početku
  const [selectedCategory, setSelectedCategory] = useState(0);

  // Listen for header question button click
  useEffect(() => {
    const handleOpenModal = () => setIsQuestionModalOpen(true);
    window.addEventListener('openQuestionModal', handleOpenModal);
    return () => window.removeEventListener('openQuestionModal', handleOpenModal);
  }, []);

  const texts = {
    hr: {
      blogSectionTitle: 'AI RJEŠENJA ZA VAŠU BRANŠU',
      blogSectionSubtitle: 'Konkretni primjeri implementacije AI-ja u različitim industrijama',
      additionalArticles: 'Dodatni članci',
      filterBy: 'Filtriraj po kategoriji:',
      allCategories: 'Sve kategorije'
    },
    en: {
      blogSectionTitle: 'AI SOLUTIONS FOR YOUR INDUSTRY',
      blogSectionSubtitle: 'Concrete examples of AI implementation in different industries',
      additionalArticles: 'Additional Articles',
      filterBy: 'Filter by category:',
      allCategories: 'All categories'
    }
  };

  const currentTexts = texts[language];
  const [posts, setPosts] = useState<Article[]>([]);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then(setPosts);
  }, []);

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);
  const dynamicCategories = Array.from(new Set(posts.map(p => p.category[language])));
  const currentCategories = [language === 'hr' ? 'Sve kategorije' : 'All categories', ...dynamicCategories];

  const filteredPosts = selectedCategory === 0 
    ? regularPosts 
    : regularPosts.filter(post => post.category[language] === currentCategories[selectedCategory]);

  const handleCloseHeadphonesModal = () => {
    setIsHeadphonesModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header language={language} onLanguageChange={setLanguage} />
      
      {/* Hero Section - Expanded Agent Panel */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <AgentPanel language={language} />
        </div>
      </section>

      {/* Articles Section - Directly below agent */}
      <section className="container mx-auto px-4 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {posts.map(post => (
              <BlogCard
                key={post.id}
                title={post.title[language]}
                excerpt={post.excerpt[language]}
                slug={post.slug}
                featured={post.featured}
                thumbnail={post.thumbnail}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/20 border-t border-white/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                © 2024 Neurobiz. {language === 'hr' ? 'Sva prava pridržana.' : 'All rights reserved.'}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <a
                href="mailto:info@neurobiz.me"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                info@neurobiz.me
              </a>
              <a 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {language === 'hr' ? 'Privatnost' : 'Privacy'}
              </a>
              <a 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {language === 'hr' ? 'Uvjeti' : 'Terms'}
              </a>
              <a 
                href="/admin" 
                className="text-xs text-muted-foreground/50 hover:text-primary transition-colors"
              >
                admin
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Headphones Notification Modal - Prikazuje se prvo */}
      <HeadphonesNotification
        language={language}
        isVisible={isHeadphonesModalOpen}
        onClose={handleCloseHeadphonesModal}
      />

      {/* Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => setIsQuestionModalOpen(false)}
        language={language}
      />
    </div>
  );
};

export default Index;