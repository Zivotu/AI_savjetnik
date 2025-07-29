import { useState, useEffect } from 'react';
import { Mic, MessageCircle, VolumeX, Play } from 'lucide-react';

interface AgentPanelProps {
  language: 'hr' | 'en';
}

const AgentPanel = ({ language }: AgentPanelProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [messages, setMessages] = useState<Array<{ type: 'agent' | 'user'; text: string; time: string }>>([]);

  const texts = {
    hr: {
      title: 'U 90 sekundi do JEDNOG AI rješenja za vašu tvrtku.',
      subtitle: 'Primarno glasom, uz opciju chata. U ovom demou agent je samo vizualni prikaz.',
      startCall: 'Pokreni razgovor',
      switchToChat: 'Prebaci na chat',
      mute: 'Mute',
      privacy: 'Razgovor se snima i transkribira u produkciji. Ovo je demo bez snimanja.',
      learnMore: 'Saznaj više',
      steps: ['Uvod', 'Pitanja', 'Rješenje'],
      demoMessages: [
        'Bok! Primjer 1: AI može automatski izraditi ponudu iz e‑mail upita.',
        'Primjer 2: Sažimanje računa u tablicu bez ručnog pretipkavanja.',
        'Koje su najveće repetitivne zadatke u vašoj tvrtki?',
        'Koristite li već neke automatizacije u poslovanju?'
      ]
    },
    en: {
      title: 'ONE AI solution for your company in 90 seconds.',
      subtitle: 'Primarily voice-based, with chat option. This demo shows only visual representation.',
      startCall: 'Start conversation',
      switchToChat: 'Switch to chat',
      mute: 'Mute',
      privacy: 'Conversation is recorded and transcribed in production. This is a demo without recording.',
      learnMore: 'Learn more',
      steps: ['Intro', 'Questions', 'Solution'],
      demoMessages: [
        'Hello! Example 1: AI can automatically create quotes from email inquiries.',
        'Example 2: Summarizing invoices into tables without manual retyping.',
        'What are the biggest repetitive tasks in your company?',
        'Do you already use any automation in your business?'
      ]
    }
  };

  const currentTexts = texts[language];

  useEffect(() => {
    // Simulate conversation progress
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % 3);
    }, 5000);

    // Add demo messages gradually
    const messageInterval = setInterval(() => {
      setMessages((prev) => {
        if (prev.length >= currentTexts.demoMessages.length) return prev;
        const newMessage = {
          type: 'agent' as const,
          text: currentTexts.demoMessages[prev.length],
          time: new Date().toLocaleTimeString('hr-HR', { hour: '2-digit', minute: '2-digit' })
        };
        return [...prev, newMessage];
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(messageInterval);
    };
  }, [currentTexts.demoMessages]);

  return (
    <div className="glass-strong rounded-3xl p-8 shadow-medium h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        {/* Left Column - Main Content */}
        <div className="flex flex-col justify-center space-y-6">
          {/* Avatar/Orb Section */}
          <div className="flex justify-center mb-6">
            <div className="ai-orb w-24 h-24 shadow-glow relative">
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Title and Subtitle */}
          <div className="text-center lg:text-left space-y-4">
            <h1 className="text-2xl lg:text-3xl font-bold leading-tight">
              {currentTexts.title}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto lg:mx-0">
              {currentTexts.subtitle}
            </p>
          </div>

          {/* Control Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
            <button
              className="flex items-center justify-center space-x-2 bg-gradient-primary text-white px-6 py-3 rounded-xl font-medium shadow-medium hover:shadow-strong transition-smooth hover:scale-105"
              data-evt="agent_start_call"
              disabled
            >
              <Play className="w-4 h-4" />
              <span>{currentTexts.startCall}</span>
            </button>
            <button
              className="flex items-center justify-center space-x-2 bg-white/50 text-foreground px-4 py-3 rounded-xl font-medium border border-white/30 hover:bg-white/70 transition-smooth"
              data-evt="agent_switch_chat"
              disabled
            >
              <MessageCircle className="w-4 h-4" />
              <span>{currentTexts.switchToChat}</span>
            </button>
          </div>
        </div>

        {/* Right Column - Chat Transcript */}
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">
              Transkript
            </h3>
            <button
              className="flex items-center justify-center bg-white/50 text-foreground p-2 rounded-lg border border-white/30 hover:bg-white/70 transition-smooth"
              data-evt="agent_mute"
              disabled
            >
              <VolumeX className="w-4 h-4" />
            </button>
          </div>
          
          {/* Transcript Messages */}
          <div className="flex-1 bg-white/30 rounded-2xl p-4 overflow-y-auto">
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-medium text-primary">Agent</span>
                    <span className="text-xs text-muted-foreground">{message.time}</span>
                  </div>
                  <p className="text-sm text-foreground bg-white/40 rounded-lg p-3 animate-fade-in">
                    {message.text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              {currentTexts.steps.map((step, index) => (
                <span
                  key={index}
                  className={`text-xs font-medium px-3 py-1 rounded-full transition-smooth ${
                    index === currentStep
                      ? 'bg-primary text-primary-foreground'
                      : index < currentStep
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-white/30 text-muted-foreground'
                  }`}
                >
                  {step}
                </span>
              ))}
            </div>
            <div className="w-full bg-white/30 rounded-full h-2">
              <div
                className="h-2 bg-gradient-primary rounded-full transition-all duration-1000 ease-in-out"
                style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="text-xs text-muted-foreground mt-6 text-center">
        <p className="mb-1">{currentTexts.privacy}</p>
        <button className="text-primary hover:underline font-medium">
          {currentTexts.learnMore}
        </button>
      </div>
    </div>
  );
};

export default AgentPanel;