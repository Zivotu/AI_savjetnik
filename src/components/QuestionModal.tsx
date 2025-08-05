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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setIsSubmitting(true);

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
    } finally {
      setIsSubmitting(false);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
      background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)',
      backdropFilter: 'blur(8px)'
    }}>
      <div 
        className="w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.1) inset'
        }}
      >
        <div className="p-8">
          {!isSubmitted ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold mb-2" style={{ color: '#ffffff' }}>
                    {currentTexts.title}
                  </h2>
                  <p className="text-lg" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    {currentTexts.subtitle}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 rounded-full transition-all duration-300 hover:scale-110"
                  style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  }}
                  aria-label={currentTexts.close}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Progress */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>
                    {currentTexts.step} {step}/2
                  </span>
                </div>
                <div 
                  className="w-full h-2 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.1)' }}
                >
                  <div
                    className="h-2 rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: step === 1 ? '50%' : '100%',
                      background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)'
                    }}
                  />
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 1 ? (
                  <>
                    {/* Name fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                          {currentTexts.firstName} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02]"
                          style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(10px)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                          {currentTexts.lastName} *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02]"
                          style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(10px)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                        {currentTexts.email} *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02]"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#ffffff',
                          backdropFilter: 'blur(10px)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Company */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                        {currentTexts.company}
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02]"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#ffffff',
                          backdropFilter: 'blur(10px)'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Industry and Team Size */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                          {currentTexts.industry}
                        </label>
                        <select
                          value={formData.industry}
                          onChange={(e) => handleInputChange('industry', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02]"
                          style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(10px)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {currentTexts.industries.map((industry, index) => (
                            <option 
                              key={index} 
                              value={index === 0 ? '' : industry}
                              style={{ background: '#1f2937', color: '#ffffff' }}
                            >
                              {industry}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                          {currentTexts.teamSize}
                        </label>
                        <select
                          value={formData.teamSize}
                          onChange={(e) => handleInputChange('teamSize', e.target.value)}
                          className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02]"
                          style={{
                            background: 'rgba(255,255,255,0.15)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            color: '#ffffff',
                            backdropFilter: 'blur(10px)'
                          }}
                          onFocus={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                            e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {currentTexts.teamSizes.map((size, index) => (
                            <option 
                              key={index} 
                              value={index === 0 ? '' : size}
                              style={{ background: '#1f2937', color: '#ffffff' }}
                            >
                              {size}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                      style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                        boxShadow: '0 10px 30px rgba(59,130,246,0.3)'
                      }}
                    >
                      {currentTexts.next}
                    </button>
                  </>
                ) : (
                  <>
                    {/* Repetitive Task */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                        {currentTexts.repetitiveTask}
                      </label>
                      <input
                        type="text"
                        value={formData.repetitiveTask}
                        onChange={(e) => handleInputChange('repetitiveTask', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02]"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#ffffff',
                          backdropFilter: 'blur(10px)'
                        }}
                        placeholder="npr. kreiranje ponuda, unos računa..."
                        onFocus={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* AI Usage */}
                    <div>
                      <label className="block text-sm font-semibold mb-3" style={{ color: '#ffffff' }}>
                        {currentTexts.aiUsage}
                      </label>
                      <div className="space-y-3">
                        {currentTexts.aiUsageLevels.map((level, index) => (
                          <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{
                            background: formData.aiUsage === level ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${formData.aiUsage === level ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)'}`
                          }}>
                            <input
                              type="radio"
                              name="aiUsage"
                              value={level}
                              checked={formData.aiUsage === level}
                              onChange={(e) => handleInputChange('aiUsage', e.target.value)}
                              className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{level}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Question */}
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#ffffff' }}>
                        {currentTexts.question} *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.question}
                        onChange={(e) => handleInputChange('question', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl transition-all duration-300 focus:scale-[1.02] resize-none"
                        style={{
                          background: 'rgba(255,255,255,0.15)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#ffffff',
                          backdropFilter: 'blur(10px)'
                        }}
                        placeholder="Opišite svoj izazov ili pitanje..."
                        onFocus={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                          e.currentTarget.style.borderColor = 'rgba(59,130,246,0.5)';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Checkboxes */}
                    <div className="space-y-4">
                      <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{
                        background: formData.wantResponse ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${formData.wantResponse ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.wantResponse}
                          onChange={(e) => handleInputChange('wantResponse', e.target.checked)}
                          className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{currentTexts.wantResponse}</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer p-3 rounded-xl transition-all duration-300 hover:scale-[1.02]" style={{
                        background: formData.newsletter ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${formData.newsletter ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.1)'}`
                      }}>
                        <input
                          type="checkbox"
                          checked={formData.newsletter}
                          onChange={(e) => handleInputChange('newsletter', e.target.checked)}
                          className="w-4 h-4 text-blue-500 focus:ring-2 focus:ring-blue-500 rounded"
                        />
                        <span className="text-sm font-medium" style={{ color: '#ffffff' }}>{currentTexts.newsletter}</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-between space-x-4 pt-4">
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#ffffff'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                        }}
                      >
                        {currentTexts.back}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        data-evt="question_submit"
                        className="flex-1 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        style={{
                          background: isSubmitting ? 'rgba(107,114,128,0.8)' : 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                          boxShadow: '0 10px 30px rgba(59,130,246,0.3)'
                        }}
                      >
                        <Send className="w-5 h-5" />
                        <span>{isSubmitting ? currentTexts.submitting : currentTexts.submit}</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </>
          ) : (
            /* Success Message */
            <div className="text-center py-12">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)',
                  boxShadow: '0 10px 30px rgba(16,185,129,0.3)'
                }}
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4" style={{ color: '#ffffff' }}>
                {currentTexts.successTitle}
              </h3>
              <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.8)' }}>
                {currentTexts.successMessage}
              </p>
              <button
                onClick={onClose}
                className="px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  boxShadow: '0 10px 30px rgba(59,130,246,0.3)'
                }}
              >
                {currentTexts.close}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionModal;