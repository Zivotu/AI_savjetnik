import { useState } from 'react';
import { Mail, Globe } from 'lucide-react';

interface HeaderProps {
  language: 'hr' | 'en';
  onLanguageChange: (lang: 'hr' | 'en') => void;
}

const Header = ({ language, onLanguageChange }: HeaderProps) => {
  const texts = {
    hr: {
      logo: 'Neurobiz',
      support: 'info@neurobiz.me'
    },
    en: {
      logo: 'Neurobiz',
      support: 'info@neurobiz.me'
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full glass border-b border-white/20 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src="/assets/NeuroBiz_Logo_1%20copy.png"
            alt="Neurobiz logo"
            className="h-8 w-auto"
          />
        </div>

        {/* Right side - Question, Language switch and contact */}
        <div className="flex items-center space-x-4">
          {/* Question Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openQuestionModal'))}
            className="bg-primary/20 hover:bg-primary/30 text-primary px-3 py-2 rounded-lg text-sm font-medium transition-smooth flex items-center space-x-2"
          >
            <span>{language === 'hr' ? 'Imate pitanje?' : 'Have a question?'}</span>
          </button>

          {/* Language Switch */}
          <div className="flex items-center space-x-1 bg-white/20 rounded-full p-1">
            <button
              onClick={() => onLanguageChange('hr')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-smooth ${
                language === 'hr'
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="Hrvatski jezik"
            >
              HR
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-smooth ${
                language === 'en'
                  ? 'bg-primary text-primary-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              aria-label="English language"
            >
              EN
            </button>
          </div>

          {/* Contact Email */}
          <a
            href={`mailto:${texts[language].support}`}
            className="flex items-center space-x-2 text-muted-foreground hover:text-primary transition-smooth group"
            aria-label={`Pošaljite email na ${texts[language].support}`}
          >
            <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline text-sm font-medium">
              {texts[language].support}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
