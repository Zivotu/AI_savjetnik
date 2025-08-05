import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import BlogCard from '@/components/BlogCard';
import { ArrowLeft, User, Share2 } from 'lucide-react';
import DOMPurify from 'dompurify';

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
  author?: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');
  const [currentPost, setCurrentPost] = useState<Article | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<Article[]>([]);

  const sanitizedContent = useMemo(() => {
    if (!currentPost) return '';

    const parser = new DOMParser();
    const doc = parser.parseFromString(currentPost.content[language], 'text/html');

    doc.querySelectorAll('custom-tag').forEach(el => {
      const div = doc.createElement('div');
      div.className = 'custom-tag';
      div.innerHTML = el.innerHTML;
      el.replaceWith(div);
    });

    doc
      .querySelectorAll('argument[name="citation_id"]')
      .forEach(el => {
        const span = doc.createElement('span');
        span.setAttribute(
          'data-citation-id',
          el.getAttribute('value') || el.textContent || ''
        );
        span.innerHTML = el.innerHTML;
        el.replaceWith(span);
      });

    const html = doc.body.innerHTML.replace(/&nbsp;|&amp;nbsp;/g, ' ');

    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['iframe', 'div', 'span'],
      ADD_ATTR: [
        'class',
        'allow',
        'allowfullscreen',
        'frameborder',
        'scrolling',
        'data-citation-id'
      ]
    });
  }, [currentPost, language]);

  useEffect(() => {
    fetch('/api/articles')
      .then(r => r.json())
      .then((posts: Article[]) => {
        const post = posts.find(p => p.slug === slug);
        if (post) {
          setCurrentPost(post);
          const related = posts
            .filter(p => p.id !== post.id && p.category[language] === post.category[language])
            .slice(0, 3);
          setRelatedPosts(related);
        }
      });
  }, [slug, language]);

  if (!currentPost) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {language === 'hr' ? 'Članak nije pronađen' : 'Article not found'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-primary text-white px-6 py-3 rounded-xl font-medium"
          >
            {language === 'hr' ? 'Nazad na početnu' : 'Back to home'}
          </button>
        </div>
      </div>
    );
  }

  const texts = {
    hr: {
      backToHome: 'Nazad na početnu',
      relatedArticles: 'Povezani članci',
      shareArticle: 'Podijeli članak',
      author: 'Autor'
    },
    en: {
      backToHome: 'Back to home',
      relatedArticles: 'Related Articles',
      shareArticle: 'Share article',
      author: 'Author'
    }
  };

  const currentTexts = texts[language];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header language={language} onLanguageChange={setLanguage} />

      <article className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 text-lg font-bold text-primary hover:underline mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{currentTexts.backToHome}</span>
          </button>

          <div className="mb-8">
            <div className="flex items-center text-sm text-muted-foreground mb-4">
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{currentPost.author ?? ''}</span>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-foreground leading-tight mb-4">
              {currentPost.title[language]}
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed">
              {currentPost.excerpt[language]}
            </p>
          </div>

          {currentPost.thumbnail && (
            <div className="mb-12 rounded-3xl overflow-hidden shadow-medium">
              <img
                src={currentPost.thumbnail}
                alt={currentPost.title[language]}
                className="w-full h-96 object-cover"
              />
            </div>
          )}

          <div className="glass-strong rounded-3xl p-8 mb-12">
            <div
              className="prose prose-lg max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizedContent }}
            />

            <div className="flex justify-end mt-8 pt-6 border-t border-white/20">
              <button
                onClick={() =>
                  navigator.share?.({
                    title: currentPost.title[language],
                    url: window.location.href
                  })
                }
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <Share2 className="w-4 h-4" />
                <span>{currentTexts.shareArticle}</span>
              </button>
            </div>
          </div>
        </div>
      </article>
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
                    slug={post.slug}
                    featured={post.featured}
                    thumbnail={post.thumbnail}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

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

export default BlogPost;
