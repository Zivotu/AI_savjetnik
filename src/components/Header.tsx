import { Mail } from 'lucide-react';
import logo from '@/assets/neurobiz_logo.png';

interface HeaderProps {
  language: 'hr' | 'en';
  onLanguageChange: (lang: 'hr' | 'en') => void;
}

const Header = ({ language, onLanguageChange }: HeaderProps) => {
  const texts = {
    hr: {
      support: 'info@neurobiz.me',
      contact: 'Dodaj svoje kontakt informacije',
      question: 'Imate pitanje?'
    },
    en: {
      support: 'info@neurobiz.me',
      contact: 'Add your contact information',
      question: 'Have a question?'
    }
  } as const;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-lg bg-gray-900/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center group">
          <img
            src={logo}
            alt="Neurobiz logo"
            className="h-10 w-auto transition-transform group-hover:scale-105"
          />
        </a>

        {/* Right side - Contact, Question, Language switch and email */}
        <div className="flex items-center space-x-6">
          {/* Contact Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
            className="bg-blue-600/90 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            {texts[language].contact}
          </button>

          {/* Question Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openQuestionModal'))}
            className="bg-purple-600/90 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md"
          >
            {texts[language].question}
          </button>

          {/* Language Switch */}
          <div className="flex items-center space-x-1 bg-gray-800/80 rounded-full p-1 shadow-inner">
            <button
              onClick={() => onLanguageChange('hr')}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                language === 'hr'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-200 hover:text-white hover:bg-gray-700/50'
              }`}
              aria-label="Hrvatski jezik"
            >
              HR
            </button>
            <button
              onClick={() => onLanguageChange('en')}
              className={`px-4 py-1 rounded-full text-sm font-semibold transition-all duration-200 ${
                language === 'en'
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-200 hover:text-white hover:bg-gray-700/50'
              }`}
              aria-label="English language"
            >
              EN
            </button>
          </div>

          {/* Contact Email */}
          <a
            href={`mailto:${texts[language].support}`}
            className="flex items-center space-x-2 text-gray-100 hover:text-blue-300 transition-all duration-300 group"
            aria-label={`Pošaljite email na ${texts[language].support}`}
          >
            <Mail className="w-5 h-5 group-hover:scale-110 group-hover:text-blue-300 transition-transform duration-300" />
            <span className="hidden lg:inline text-sm font-medium">
              {texts[language].support}
            </span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;