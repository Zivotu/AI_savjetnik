import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { ArrowLeft, Calendar, Clock, Video, MessageCircle } from 'lucide-react';

const Book = () => {
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');
  const navigate = useNavigate();

  const texts = {
    hr: {
      backToHome: 'Natrag na početnu',
      title: 'Zakazivanje poziva',
      subtitle: 'Razgovarajte s našim AI ekspertom i dobijte personalizirane preporuke za vašu tvrtku',
      description: 'Tijekom 30-minutnog poziva analizirat ćemo vaše poslovne procese i predložiti konkretna AI rješenja koja će odmah utjecati na vašu produktivnost.',
      whatYouGet: 'Što dobivate:',
      benefits: [
        'Detaljnu analizu vaših trenutnih procesa',
        'Konkretne preporuke za AI implementaciju', 
        'Procjenu ROI-ja za predložena rješenja',
        'Korak-po-korak plan implementacije',
        'Follow-up e-mail s resursima'
      ],
      duration: '30 minuta',
      format: 'Video poziv (Google Meet)',
      price: 'Besplatno',
      openCalendar: 'Otvori kalendar',
      calendarNote: 'Kalendar će se otvoriti u novom prozoru',
      whyChooseUs: 'Zašto odabrati nas?',
      reasons: [
        'Specijalizirani smo za mala i srednja poduzeća',
        'Fokusiramo se na brze rezultate, ne na složene sustave',
        'Više od 50 uspješno implementiranih AI rješenja',
        'Pratimo vas kroz cijeli proces implementacije'
      ]
    },
    en: {
      backToHome: 'Back to home',
      title: 'Schedule a Call',
      subtitle: 'Talk with our AI expert and get personalized recommendations for your company',
      description: 'During a 30-minute call, we will analyze your business processes and suggest concrete AI solutions that will immediately impact your productivity.',
      whatYouGet: 'What you get:',
      benefits: [
        'Detailed analysis of your current processes',
        'Concrete recommendations for AI implementation',
        'ROI assessment for proposed solutions', 
        'Step-by-step implementation plan',
        'Follow-up email with resources'
      ],
      duration: '30 minutes',
      format: 'Video call (Google Meet)',
      price: 'Free',
      openCalendar: 'Open calendar',
      calendarNote: 'Calendar will open in a new window',
      whyChooseUs: 'Why choose us?',
      reasons: [
        'We specialize in small and medium businesses',
        'We focus on quick results, not complex systems',
        'More than 50 successfully implemented AI solutions',
        'We guide you through the entire implementation process'
      ]
    }
  };

  const currentTexts = texts[language];

  const handleBookCall = () => {
    // In a real implementation, this would open a calendar booking system
    window.open('https://calendly.com/ai-consultant-demo', '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header language={language} onLanguageChange={setLanguage} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{currentTexts.backToHome}</span>
          </button>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Info */}
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4">
                {currentTexts.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                {currentTexts.subtitle}
              </p>
              
              <div className="glass rounded-2xl p-6 mb-8">
                <p className="text-foreground leading-relaxed">
                  {currentTexts.description}
                </p>
              </div>

              {/* Call Details */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">{currentTexts.duration}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Video className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">{currentTexts.format}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <span className="text-foreground font-medium">{currentTexts.price}</span>
                </div>
              </div>

              {/* What You Get */}
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-bold text-foreground mb-4">
                  {currentTexts.whatYouGet}
                </h3>
                <ul className="space-y-3">
                  {currentTexts.benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right Column - Booking */}
            <div>
              <div className="glass-strong rounded-3xl p-8 shadow-medium sticky top-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    {language === 'hr' ? 'Besplatni razgovor' : 'Free consultation'}
                  </h2>
                  <p className="text-muted-foreground">
                    {language === 'hr' 
                      ? 'Odaberite termin koji vam odgovara'
                      : 'Choose a time that works for you'
                    }
                  </p>
                </div>

                {/* CTA Button */}
                <button
                  onClick={handleBookCall}
                  data-evt="book_call_click"
                  className="w-full bg-gradient-primary text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-medium hover:shadow-strong transition-smooth hover:scale-[1.02] mb-4"
                >
                  {currentTexts.openCalendar}
                </button>
                
                <p className="text-xs text-muted-foreground text-center">
                  {currentTexts.calendarNote}
                </p>

                {/* Why Choose Us */}
                <div className="mt-8 pt-6 border-t border-white/20">
                  <h4 className="text-sm font-semibold text-foreground mb-4">
                    {currentTexts.whyChooseUs}
                  </h4>
                  <ul className="space-y-2">
                    {currentTexts.reasons.map((reason, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-xs text-muted-foreground leading-relaxed">
                          {reason}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trust Indicators */}
                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-primary">50+</div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'hr' ? 'Projekata' : 'Projects'}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">4.9</div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'hr' ? 'Ocjena' : 'Rating'}
                      </div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-primary">24h</div>
                      <div className="text-xs text-muted-foreground">
                        {language === 'hr' ? 'Odgovor' : 'Response'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white/20 border-t border-white/20 py-8 mt-16">
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
export default Book;