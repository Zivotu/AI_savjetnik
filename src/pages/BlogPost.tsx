import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BlogCard from '@/components/BlogCard';
import { blogPosts } from '@/data/blogPosts';
import { ArrowLeft, Calendar, User, Tag, Share2 } from 'lucide-react';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');
  const [currentPost, setCurrentPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);

  useEffect(() => {
    const post = blogPosts.find(p => p.slug === slug);
    if (post) {
      setCurrentPost(post);
      
      // Find related posts (same category, excluding current)
      const related = blogPosts
        .filter(p => p.id !== post.id && p.category[language] === post.category[language])
        .slice(0, 3);
      setRelatedPosts(related);
    }
  }, [slug, language]);

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === 'hr' ? 'Članak nije pronađen' : 'Article not found'}
          </h1>
          <button
            onClick={() => navigate('/blog')}
            className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-medium"
          >
            {language === 'hr' ? 'Nazad na blog' : 'Back to blog'}
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return language === 'hr' 
      ? date.toLocaleDateString('hr-HR', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const texts = {
    hr: {
      backToBlog: 'Nazad na blog',
      relatedArticles: 'Povezani članci',
      shareArticle: 'Podijeli članak',
      readingTime: 'min čitanja',
      author: 'Autor'
    },
    en: {
      backToBlog: 'Back to blog',
      relatedArticles: 'Related Articles',
      shareArticle: 'Share article',
      readingTime: 'min read',
      author: 'Author'
    }
  };

  const currentTexts = texts[language];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header language={language} onLanguageChange={setLanguage} />
      
      {/* Article Header */}
      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <button
            onClick={() => navigate('/blog')}
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentTexts.backToBlog}</span>
          </button>

          {/* Article Meta */}
          <div className="mb-8">
            <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
              <span className="inline-flex items-center space-x-1 bg-primary/10 text-primary px-3 py-1 rounded-full">
                <Tag className="w-3 h-3" />
                <span>{currentPost.category[language]}</span>
              </span>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(currentPost.date)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{currentPost.author}</span>
              </div>
              <span>5 {currentTexts.readingTime}</span>
            </div>
            
            <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
              {currentPost.title[language]}
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              {currentPost.excerpt[language]}
            </p>
          </div>

          {/* Featured Image */}
          <div className="mb-12 rounded-3xl overflow-hidden shadow-medium">
            <div className="h-96 bg-gradient-primary flex items-center justify-center">
              <div className="text-white text-6xl font-bold opacity-20">AI</div>
            </div>
          </div>

          {/* Article Content */}
          <div className="glass-strong rounded-3xl p-8 mb-12">
            <div className="prose prose-lg max-w-none text-foreground">
              <div className="space-y-6 text-base leading-relaxed">
                <p>
                  {language === 'hr' 
                    ? 'Automatizacija ponuda predstavlja jedan od najkonkretnijih načina kako AI može odmah utjecati na vaš bottom line. Umjesto da vaš tim troši sate na kreiranje ponuda, AI može analizirati customer upit i generirati profesionalnu ponudu u manje od 5 minuta.'
                    : 'Quote automation represents one of the most concrete ways AI can immediately impact your bottom line. Instead of your team spending hours creating quotes, AI can analyze customer inquiries and generate professional quotes in less than 5 minutes.'
                  }
                </p>
                
                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                  {language === 'hr' ? 'Korak 1: Analiza postojećeg procesa' : 'Step 1: Analyzing the existing process'}
                </h2>
                
                <p>
                  {language === 'hr'
                    ? 'Prije implementacije AI-ja, važno je mapirati trenutni proces kreiranja ponuda. Tipični proces uključuje: primanje upita putem e-maila, analizu zahtjeva, provjeru dostupnosti proizvoda/usluga, kalkulaciju cijena, kreiranje dokumenta i slanje customerima.'
                    : 'Before implementing AI, it\'s important to map the current quote creation process. A typical process includes: receiving inquiries via email, analyzing requirements, checking product/service availability, calculating prices, creating documents and sending to customers.'
                  }
                </p>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                  {language === 'hr' ? 'Korak 2: Priprema podataka' : 'Step 2: Data preparation'}
                </h2>
                
                <p>
                  {language === 'hr'
                    ? 'AI sustav treba strukturirane podatke za generiranje kvalitetnih ponuda. To uključuje katalog proizvoda/usluga s cijenama, template ponuda, povijesne podatke o uspješnim ponudama, i jasno definirane pricing strategije.'
                    : 'AI system needs structured data to generate quality quotes. This includes product/service catalog with prices, quote templates, historical data on successful quotes, and clearly defined pricing strategies.'
                  }
                </p>

                <div className="bg-primary/5 border-l-4 border-primary p-6 rounded-r-lg my-8">
                  <h3 className="text-lg font-semibold text-primary mb-2">
                    {language === 'hr' ? 'Praktični savjet:' : 'Practical tip:'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'hr'
                      ? 'Počnite s jednostavnijim proizvodima i uslugama. AI lakše automatizira standardizirane ponude nego one s puno varijabli.'
                      : 'Start with simpler products and services. AI more easily automates standardized quotes than those with many variables.'
                    }
                  </p>
                </div>

                <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">
                  {language === 'hr' ? 'Korak 3: Implementacija AI rješenja' : 'Step 3: AI solution implementation'}
                </h2>
                
                <p>
                  {language === 'hr'
                    ? 'Moderan AI sustav može parsirati e-mail upite, ekstraktirati ključne informacije (proizvodi, količine, lokacija, rokovi), provjeriti ih s vašom bazom podataka i generirati personaliziranu ponudu koristeći vaše template-ove i pricing logiku.'
                    : 'Modern AI system can parse email inquiries, extract key information (products, quantities, location, deadlines), check them against your database and generate personalized quotes using your templates and pricing logic.'
                  }
                </p>

                <p>
                  {language === 'hr'
                    ? 'Implementacija obično traje 2-4 tjedna, ovisno o složenosti vašeg pricing modela i broju integracija potrebnih s postojećim sustavima.'
                    : 'Implementation typically takes 2-4 weeks, depending on the complexity of your pricing model and number of integrations needed with existing systems.'
                  }
                </p>
              </div>
            </div>
            
            {/* Share Button */}
            <div className="flex justify-end mt-8 pt-6 border-t border-white/20">
              <button 
                onClick={() => navigator.share?.({ 
                  title: currentPost.title[language], 
                  url: window.location.href 
                })}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{currentTexts.shareArticle}</span>
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Articles */}
      {relatedPosts.length > 0 && (
        <section className="bg-white/20 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                {currentTexts.relatedArticles}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map(post => (
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
            </div>
          </div>
        </section>
      )}

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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPost;