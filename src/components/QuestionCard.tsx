import { Clock, ArrowRight } from 'lucide-react';

interface QuestionCardProps {
  language: 'hr' | 'en';
  onOpenModal: () => void;
}

const QuestionCard = ({ language, onOpenModal }: QuestionCardProps) => {
  const texts = {
    hr: {
      title: 'Imate pitanje?',
      subtitle: 'Odgovaramo u roku 24 h.',
      description: 'Pošaljite nam svoju situaciju i dobit ćete konkretno AI rješenje prilagođeno vašoj tvrtki.',
      cta: 'Postavi pitanje'
    },
    en: {
      title: 'Have a question?',
      subtitle: 'We respond within 24h.',
      description: 'Send us your situation and get a concrete AI solution tailored to your company.',
      cta: 'Ask a question'
    }
  };

  const currentTexts = texts[language];

  return (
    <div className="glass-strong rounded-2xl p-6 shadow-medium hover:shadow-strong transition-smooth group">
      {/* Header with icon */}
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-10 h-10 bg-gradient-secondary rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
          <Clock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-foreground">
            {currentTexts.title}
          </h3>
          <p className="text-sm text-primary font-medium">
            {currentTexts.subtitle}
          </p>
        </div>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
        {currentTexts.description}
      </p>

      {/* CTA Button */}
      <button
        onClick={onOpenModal}
        data-evt="question_open"
        className="w-full bg-gradient-primary text-white py-3 px-4 rounded-xl font-medium shadow-soft hover:shadow-medium transition-smooth hover:scale-[1.02] flex items-center justify-center space-x-2 group"
      >
        <span>{currentTexts.cta}</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </button>

      {/* Decorative element */}
      <div className="mt-4 flex justify-center space-x-1">
        <div className="w-2 h-2 bg-primary/30 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-secondary/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-2 h-2 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};

export default QuestionCard;