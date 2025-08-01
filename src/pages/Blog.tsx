import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BlogCard from '@/components/BlogCard';
import { blogPosts, categories } from '@/data/blogPosts';
import { Search, Filter, ArrowLeft } from 'lucide-react';

const Blog = () => {
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const texts = {
    hr: {
      title: 'AI Blog',
      subtitle: 'Praktični vodiči i savjeti za implementaciju AI-ja u vašoj tvrtki',
      searchPlaceholder: 'Pretražite članke...',
      filterBy: 'Filtriraj po kategoriji:',
      noResults: 'Nema rezultata za vašu pretragu.',
      backToHome: 'Natrag na početnu',
      resultsCount: (count: number) => `Pronađeno ${count} ${count === 1 ? 'članak' : count < 5 ? 'članka' : 'članaka'}`
    },
    en: {
      title: 'AI Blog',
      subtitle: 'Practical guides and tips for implementing AI in your company',
      searchPlaceholder: 'Search articles...',
      filterBy: 'Filter by category:',
      noResults: 'No results for your search.',
      backToHome: 'Back to home',
      resultsCount: (count: number) => `Found ${count} ${count === 1 ? 'article' : 'articles'}`
    }
  };

  const currentTexts = texts[language];
  const currentCategories = categories[language];

  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 0 || post.category[language] === currentCategories[selectedCategory];
    const matchesSearch = searchTerm === '' || 
      post.title[language].toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt[language].toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'hr' 
      ? date.toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header language={language} onLanguageChange={setLanguage} />
      
      {/* Header Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentTexts.backToHome}</span>
          </button>
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {currentTexts.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {currentTexts.subtitle}
          </p>
        </div>

        {/* Search and Filter */}
        <div className="max-w-4xl mx-auto mb-8">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              placeholder={currentTexts.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-white/30 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth text-foreground placeholder-muted-foreground"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2 w-full justify-center">
              <Filter className="w-4 h-4" />
              <span>{currentTexts.filterBy}</span>
            </div>
            {currentCategories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(index)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-smooth ${
                  selectedCategory === index
                    ? 'bg-gradient-primary text-white shadow-medium'
                    : 'bg-white/50 text-foreground hover:bg-white/70 border border-white/30'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Results Count */}
        {(searchTerm || selectedCategory > 0) && (
          <div className="text-center mb-6">
            <p className="text-muted-foreground">
              {currentTexts.resultsCount(filteredPosts.length)}
            </p>
          </div>
        )}
      </section>

      {/* Articles Grid */}
      <section className="container mx-auto px-4 pb-16">
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {filteredPosts.map(post => (
              <BlogCard
                key={post.id}
                title={post.title[language]}
                excerpt={post.excerpt[language]}
                category={post.category[language]}
                date={formatDate(post.date)}
                slug={post.slug}
                featured={post.featured}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">
              {currentTexts.noResults}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'hr' 
                ? 'Pokušajte s drugačijim pojmovima ili odaberite drugu kategoriju.'
                : 'Try different terms or select another category.'
              }
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory(0);
              }}
              className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-medium shadow-medium hover:shadow-strong transition-smooth"
            >
              {language === 'hr' ? 'Očisti pretragu' : 'Clear search'}
            </button>
          </div>
        )}
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Blog;