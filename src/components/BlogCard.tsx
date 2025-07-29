import { Calendar, Tag, ArrowRight } from 'lucide-react';

interface BlogCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  slug: string;
  thumbnail?: string;
  featured?: boolean;
}

const BlogCard = ({ title, excerpt, category, date, slug, thumbnail, featured = false }: BlogCardProps) => {
  const handleClick = () => {
    // Navigate to blog post (demo only)
    window.location.href = `/blog/${slug}`;
  };

  return (
    <article
      onClick={handleClick}
      data-evt="article_click"
      className={`glass rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-smooth cursor-pointer group ${
        featured ? 'border-2 border-primary/30' : ''
      }`}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden h-48 bg-gradient-subtle">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-primary flex items-center justify-center">
            <div className="text-white text-4xl font-bold opacity-20">AI</div>
          </div>
        )}
        
        {/* Category badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center space-x-1 bg-white/90 backdrop-blur-sm text-xs font-medium px-3 py-1 rounded-full">
            <Tag className="w-3 h-3" />
            <span>{category}</span>
          </span>
        </div>

        {featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              FEATURED
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <div className="flex items-center space-x-2 text-muted-foreground text-xs mb-3">
          <Calendar className="w-3 h-3" />
          <span>{date}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
          {excerpt}
        </p>

        {/* Read more */}
        <div className="flex items-center justify-between">
          <span className="text-primary text-sm font-medium group-hover:underline">
            Čitaj više
          </span>
          <ArrowRight className="w-4 h-4 text-primary group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </article>
  );
};

export default BlogCard;