import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Archive, 
  Download, 
  Upload,
  Lock,
  LogOut,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

const Admin = () => {
  const [language, setLanguage] = useState<'hr' | 'en'>('hr');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'articles' | 'questions'>('articles');
  const [questions, setQuestions] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load questions from localStorage
    const storedQuestions = JSON.parse(localStorage.getItem('questionSubmissions') || '[]');
    setQuestions(storedQuestions);
  }, []);

  const texts = {
    hr: {
      backToHome: 'Natrag na početnu',
      adminPanel: 'Admin Panel',
      login: 'Prijava',
      password: 'Lozinka',
      loginButton: 'Prijavite se',
      logout: 'Odjava',
      invalidPassword: 'Neispravna lozinka',
      articles: 'Članci',
      questions: 'Pitanja (24h)',
      addNew: 'Dodaj novi',
      edit: 'Uredi',
      delete: 'Obriši',
      view: 'Prikaži',
      publish: 'Objavi',
      archive: 'Arhiviraj',
      export: 'Export JSON',
      import: 'Import JSON',
      title: 'Naslov',
      category: 'Kategorija',
      status: 'Status',
      date: 'Datum',
      published: 'Objavljeno',
      draft: 'Skica',
      name: 'Ime',
      email: 'E-mail',
      company: 'Tvrtka',
      question: 'Pitanje',
      questionStatus: 'Status',
      new: 'Novo',
      inProgress: 'U tijeku',
      answered: 'Odgovoreno',
      noQuestions: 'Nema pitanja',
      questionDetails: 'Detalji pitanja'
    },
    en: {
      backToHome: 'Back to home',
      adminPanel: 'Admin Panel',
      login: 'Login',
      password: 'Password',
      loginButton: 'Log in',
      logout: 'Logout',
      invalidPassword: 'Invalid password',
      articles: 'Articles',
      questions: 'Questions (24h)',
      addNew: 'Add new',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      publish: 'Publish',
      archive: 'Archive',
      export: 'Export JSON',
      import: 'Import JSON',
      title: 'Title',
      category: 'Category',
      status: 'Status',
      date: 'Date',
      published: 'Published',
      draft: 'Draft',
      name: 'Name',
      email: 'Email',
      company: 'Company',
      question: 'Question',
      questionStatus: 'Status',
      new: 'New',
      inProgress: 'In Progress',
      answered: 'Answered',
      noQuestions: 'No questions',
      questionDetails: 'Question Details'
    }
  };

  const currentTexts = texts[language];

  const mockArticles = [
    {
      id: 1,
      title: 'Automatizacija ponuda iz upita: korak‑po‑korak',
      category: 'Automatizacija',
      status: 'published',
      date: '2024-01-15',
      excerpt: 'Kako AI može automatski kreirati profesionalne ponude iz customer upita...'
    },
    {
      id: 2,
      title: 'AI u knjigovodstvu: sažeci računa bez greške',
      category: 'Knjigovodstvo',
      status: 'published',
      date: '2024-01-12',
      excerpt: 'Korak‑po‑korak implementacija AI-ja za automatsko sažimanje računa...'
    },
    {
      id: 3,
      title: 'Pripremanje podataka za AI analizu',
      category: 'Automatizacija',
      status: 'draft',
      date: '2024-01-10',
      excerpt: 'Ključne strategije za strukturiranje podataka prije implementacije...'
    }
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'demo') {
      setIsLoggedIn(true);
      setPassword('');
    } else {
      alert(currentTexts.invalidPassword);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'new':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'inProgress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'answered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const exportData = () => {
    const data = {
      articles: mockArticles,
      questions: questions,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'admin-data.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header language={language} onLanguageChange={setLanguage} />
        
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-md mx-auto">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentTexts.backToHome}</span>
            </button>

            <div className="glass-strong rounded-3xl p-8 shadow-medium">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  {currentTexts.adminPanel}
                </h1>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {currentTexts.password}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="demo"
                    required
                    className="w-full px-4 py-3 bg-white/50 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary transition-smooth"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-primary text-white py-3 rounded-xl font-medium shadow-medium hover:shadow-strong transition-smooth"
                >
                  {currentTexts.loginButton}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header language={language} onLanguageChange={setLanguage} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center space-x-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{currentTexts.backToHome}</span>
            </button>
            <h1 className="text-3xl font-bold text-foreground">
              {currentTexts.adminPanel}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={exportData}
              className="flex items-center space-x-2 bg-white/50 text-foreground px-4 py-2 rounded-xl border border-white/30 hover:bg-white/70 transition-smooth"
            >
              <Download className="w-4 h-4" />
              <span>{currentTexts.export}</span>
            </button>
            <button
              onClick={handleLogout}
              data-evt="admin_logout"
              className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-xl hover:bg-red-200 transition-smooth"
            >
              <LogOut className="w-4 h-4" />
              <span>{currentTexts.logout}</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-8 bg-white/30 rounded-xl p-1">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-smooth ${
              activeTab === 'articles'
                ? 'bg-white shadow-soft text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentTexts.articles}
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-smooth relative ${
              activeTab === 'questions'
                ? 'bg-white shadow-soft text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {currentTexts.questions}
            {questions.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {questions.length}
              </span>
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === 'articles' ? (
          <div className="glass rounded-2xl p-6">
            {/* Articles Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {currentTexts.articles}
              </h2>
              <button className="flex items-center space-x-2 bg-gradient-primary text-white px-4 py-2 rounded-xl font-medium shadow-medium hover:shadow-strong transition-smooth">
                <Plus className="w-4 h-4" />
                <span>{currentTexts.addNew}</span>
              </button>
            </div>

            {/* Articles Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      {currentTexts.title}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      {currentTexts.category}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      {currentTexts.status}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      {currentTexts.date}
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {mockArticles.map((article) => (
                    <tr key={article.id} className="border-b border-white/10">
                      <td className="py-3 px-4 text-foreground font-medium">
                        {article.title}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {article.category}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          article.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {article.status === 'published' ? currentTexts.published : currentTexts.draft}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {article.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-muted-foreground hover:text-primary transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-muted-foreground hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass rounded-2xl p-6">
            {/* Questions Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">
                {currentTexts.questions}
              </h2>
              <div className="text-sm text-muted-foreground">
                {questions.length} {language === 'hr' ? 'pitanja' : 'questions'}
              </div>
            </div>

            {/* Questions List */}
            {questions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">
                  {currentTexts.noQuestions}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((question, index) => (
                  <div key={index} className="bg-white/30 rounded-xl p-4 border border-white/20">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">
                          {question.firstName} {question.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {question.email} • {question.company || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon('new')}
                        <span className="text-xs font-medium text-muted-foreground">
                          {currentTexts.new}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm text-foreground font-medium mb-1">
                        {currentTexts.question}:
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {question.question}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        {new Date(question.timestamp).toLocaleDateString(language === 'hr' ? 'hr-HR' : 'en-US')}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
                          {currentTexts.inProgress}
                        </button>
                        <button className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {currentTexts.answered}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;