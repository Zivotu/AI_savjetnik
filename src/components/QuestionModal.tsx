import { useState } from 'react';
import { X, Send, CheckCircle } from 'lucide-react';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'hr' | 'en';
}

const QuestionModal = ({ isOpen, onClose, language }: QuestionModalProps) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    industry: '',
    teamSize: '',
    repetitiveTask: '',
    aiUsage: '',
    question: '',
    wantResponse: false,
    newsletter: false
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [step, setStep] = useState(1);

  const texts = {
    hr: {
      title: 'Postavite pitanje',
      subtitle: 'Odgovoramo u roku od 24 sata',
      firstName: 'Ime',
      lastName: 'Prezime',
      email: 'E-mail adresa',
      company: 'Tvrtka (opcionalno)',
      industry: 'Djelatnost',
      teamSize: 'Veličina tima',
      repetitiveTask: 'Najveći repetitivni zadatak',
      aiUsage: 'Trenutna razina AI korištenja',
      question: 'Vaše pitanje',
      wantResponse: 'Želim povratni e-mail s odgovorom',
      newsletter: 'Želim primati newsletter',
      submit: 'Pošaljite pitanje',
      next: 'Dalje',
      back: 'Nazad',
      step: 'Korak',
      submitting: 'Šalje se...',
      successTitle: 'Hvala na pitanju!',
      successMessage: 'Odgovor ćete dobiti u roku od 24 sata na navedenu e-mail adresu.',
      close: 'Zatvori',
      required: 'Obavezno polje',
      industries: [
        'Odaberite djelatnost',
        'Trgovina',
        'Usluge',
        'Proizvodnja',
        'IT/Tehnologija',
        'Zdravstvo',
        'Obrazovanje',
        'Finance',
        'Drugo'
      ],
      teamSizes: [
        'Odaberite veličinu',
        '1-3 osobe',
        '4-10 osoba',
        '11-50 osoba',
        '50+ osoba'
      ],
      aiUsageLevels: [
        'Ne koristimo AI',
        'Oko 10% poslova',
        '25% i više',
        '50% i više'
      ]
    },
    en: {
      title: 'Ask a Question',
      subtitle: 'We respond within 24 hours',
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email Address',
      company: 'Company (optional)',
      industry: 'Industry',
      teamSize: 'Team Size',
      repetitiveTask: 'Biggest Repetitive Task',
      aiUsage: 'Current AI Usage Level',
      question: 'Your Question',
      wantResponse: 'I want an email response',
      newsletter: 'I want to receive newsletter',
      submit: 'Send Question',
      next: 'Next',
      back: 'Back',
      step: 'Step',
      submitting: 'Sending...',
      successTitle: 'Thank you for your question!',
      successMessage: 'You will receive a response within 24 hours at the provided email address.',
      close: 'Close',
      required: 'Required field',
      industries: [
        'Select industry',
        'Retail',
        'Services',
        'Manufacturing',
        'IT/Technology',
        'Healthcare',
        'Education',
        'Finance',
        'Other'
      ],
      teamSizes: [
        'Select size',
        '1-3 people',
        '4-10 people',
        '11-50 people',
        '50+ people'
      ],
      aiUsageLevels: [
        'No AI usage',
        'Around 10% of work',
        '25% and more',
        '50% and more'
      ]
    }
  };

  const currentTexts = texts[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.question) {
      return;
    }

    try {
      const res = await fetch('/api/question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, language })
      });

      if (res.ok) {
        setIsSubmitted(true);
      } else {
        console.error('Question submission failed');
      }
    } catch (err) {
      console.error('Question submission error:', err);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) return;
    setStep(2);
  };

  const handleBack = () => setStep(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="glass-strong rounded-3xl p-8 w-full max-w-2xl shadow-strong">
        {!isSubmitted ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">
                  {currentTexts.title}
                </h2>
                <p className="text-white">{currentTexts.subtitle}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-smooth"
                aria-label={currentTexts.close}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white font-bold">
                  {currentTexts.step} {step}/2
                </span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-2">
                <div
                  className="bg-gradient-primary h-2 rounded-full"
                  style={{ width: step === 1 ? '50%' : '100%' }}
                />
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  {/* Name fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-bold text-foreground mb-2">
                        {currentTexts.firstName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                      />
                    </div>
                    <div>
                      <label className="block text-base font-bold text-foreground mb-2">
                        {currentTexts.lastName} *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-base font-bold text-foreground mb-2">
                      {currentTexts.email} *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    />
                  </div>

                  {/* Company */}
                  <div>
                    <label className="block text-base font-bold text-foreground mb-2">
                      {currentTexts.company}
                    </label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                    />
                  </div>

                  {/* Industry and Team Size */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base font-bold text-foreground mb-2">
                        {currentTexts.industry}
                      </label>
                      <select
                        value={formData.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                      >
                        {currentTexts.industries.map((industry, index) => (
                          <option key={index} value={index === 0 ? '' : industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-base font-bold text-foreground mb-2">
                        {currentTexts.teamSize}
                      </label>
                      <select
                        value={formData.teamSize}
                        onChange={(e) => handleInputChange('teamSize', e.target.value)}
                        className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                      >
                        {currentTexts.teamSizes.map((size, index) => (
                          <option key={index} value={index === 0 ? '' : size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gradient-primary text-white py-4 rounded-xl font-semibold shadow-medium hover:shadow-strong transition-smooth hover:scale-[1.02]"
                  >
                    {currentTexts.next}
                  </button>
                </>
              ) : (
                <>
                  {/* Repetitive Task */}
                  <div>
                    <label className="block text-base font-bold text-foreground mb-2">
                      {currentTexts.repetitiveTask}
                    </label>
                    <input
                      type="text"
                      value={formData.repetitiveTask}
                      onChange={(e) => handleInputChange('repetitiveTask', e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                      placeholder="npr. kreiranje ponuda, unos računa..."
                    />
                  </div>

                  {/* AI Usage */}
                  <div>
                    <label className="block text-base font-bold text-foreground mb-2">
                      {currentTexts.aiUsage}
                    </label>
                    <div className="space-y-2">
                      {currentTexts.aiUsageLevels.map((level, index) => (
                        <label key={index} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="radio"
                            name="aiUsage"
                            value={level}
                            checked={formData.aiUsage === level}
                            onChange={(e) => handleInputChange('aiUsage', e.target.value)}
                            className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary"
                          />
                          <span className="text-base font-bold text-foreground">{level}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <label className="block text-base font-bold text-foreground mb-2">
                      {currentTexts.question} *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={formData.question}
                      onChange={(e) => handleInputChange('question', e.target.value)}
                      className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth resize-none"
                      placeholder="Opišite svoj izazov ili pitanje..."
                    />
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-3">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.wantResponse}
                        onChange={(e) => handleInputChange('wantResponse', e.target.checked)}
                        className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary rounded"
                      />
                      <span className="text-base font-bold text-foreground">{currentTexts.wantResponse}</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.newsletter}
                        onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                        className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary rounded"
                      />
                      <span className="text-base font-bold text-foreground">{currentTexts.newsletter}</span>
                    </label>
                  </div>

                  <div className="flex items-center justify-between space-x-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-4 rounded-xl font-semibold text-foreground bg-white/50 hover:bg-white/70 transition-smooth"
                    >
                      {currentTexts.back}
                    </button>
                    <button
                      type="submit"
                      data-evt="question_submit"
                      className="flex-1 bg-gradient-primary text-white py-4 rounded-xl font-semibold shadow-medium hover:shadow-strong transition-smooth hover:scale-[1.02] flex items-center justify-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>{currentTexts.submit}</span>
                    </button>
                  </div>
                </>
              )}
            </form>
          </>
        ) : (
          /* Success Message */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-4">
              {currentTexts.successTitle}
            </h3>
            <p className="text-white mb-8 max-w-md mx-auto">
              {currentTexts.successMessage}
            </p>
            <button
              onClick={onClose}
              className="bg-gradient-primary text-white px-8 py-3 rounded-xl font-medium shadow-medium hover:shadow-strong transition-smooth"
            >
              {currentTexts.close}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionModal;