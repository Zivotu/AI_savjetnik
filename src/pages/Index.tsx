import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AgentPanel from '@/components/AgentPanel';
import QuestionCard from '@/components/QuestionCard';
import QuestionModal from '@/components/QuestionModal';
import BlogCard from '@/components/BlogCard';
import { blogPosts, categories } from '@/data/blogPosts';
import { Filter, Calendar, Tag } from 'lucide-react';

const Index = () => {
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Listen for header question button click
  useEffect(() => {
    const handleOpenModal = () => setIsQuestionModalOpen(true);
    window.addEventListener('openQuestionModal', handleOpenModal);
    return () => window.removeEventListener('openQuestionModal', handleOpenModal);
  }, []);
  const [selectedCategory, setSelectedCategory] = useState(0);

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
  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = blogPosts.filter(post => !post.featured);
  const currentCategories = categories[language];

  const filteredPosts = selectedCategory === 0 
    ? regularPosts 
    : regularPosts.filter(post => post.category[language] === currentCategories[selectedCategory]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'hr' 
      ? date.toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
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
            {blogPosts.map(post => (
              <BlogCard
                key={post.id}
                title={post.title[language]}
                excerpt={post.excerpt[language]}
                category={post.category[language]}
                date={formatDate(post.date)}
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
                © 2024 AI Konzultant. {language === 'hr' ? 'Sva prava pridržana.' : 'All rights reserved.'}
              </p>
            </div>
            
            <div className="flex items-center space-x-6">
              <a 
                href="mailto:podrška@aiknzultant.hr" 
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                podrška@aiknzultant.hr
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