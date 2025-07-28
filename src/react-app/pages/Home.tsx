import { useState, useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { useNavigate } from 'react-router';
import { TicketIcon, Users, Wrench, BarChart3, ArrowRight, Eye, EyeOff } from 'lucide-react';
import LoadingSpinner from '@/react-app/components/LoadingSpinner';

export default function Home() {
  const { user, loading, login, register } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'korisnik'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return null; // Will redirect to dashboard
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.email, formData.password, formData.fullName, formData.role);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Greška u procesu');
    } finally {
      setFormLoading(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <TicketIcon className="w-12 h-12 text-white" />
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                FavBet
              </span>
            </h1>
            <h2 className="text-3xl md:text-4xl font-semibold text-gray-200 mb-6">
              ServiDesk
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Sustav za upravljanje servisnim zahtjevima u automat klubovima FavBet
            </p>
            
            <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
              Efikasno upravljanje prijavama kvara, praćenje statusa popravaka i komunikacija između osoblja, tehničara i administracije u automat klubovima.
            </p>

            {/* Auth Form */}
            <div className="max-w-md mx-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-blue-800/30 p-8">
              <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
                <button
                  type="button"
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    isLogin 
                      ? 'bg-white text-blue-800 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Prijava
                </button>
                <button
                  type="button"
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
                    !isLogin 
                      ? 'bg-white text-blue-800 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Registracija
                </button>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ime i prezime
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                      placeholder="Unesite ime i prezime"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-mail adresa
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lozinka
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Uloga
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-800 focus:border-transparent"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                    >
                      <option value="korisnik">Korisnik</option>
                      <option value="tehnicar">Tehničar</option>
                      <option value="administracija">Administracija</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full flex items-center justify-center space-x-3 bg-gradient-to-r from-blue-800 to-indigo-800 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  <span>{formLoading ? 'Procesiranje...' : (isLogin ? 'Prijavi se' : 'Registriraj se')}</span>
                  {!formLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ključne funkcionalnosti
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Sve što trebate za uspješno upravljanje servisnim zahtjevima u automat klubovima FavBet
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-800/30">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Višestruke uloge</h3>
              <p className="text-gray-300 leading-relaxed">
                Zasebne funkcionalnosti za osoblje klubova, tehničare i administraciju s prilagođenim dozvolama i sučeljem.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-800/30">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Wrench className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Praćenje u realnom vremenu</h3>
              <p className="text-gray-300 leading-relaxed">
                Pratite status svih prijava kvara automata u realnom vremenu s automatskim obavijestima o promjenama.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-800/30">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Izvještaji i analitika</h3>
              <p className="text-gray-300 leading-relaxed">
                Detaljni izvještaji o produktivnosti tehničara, zastojima automata i trendovima kvara u svim FavBet klubovima.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 border-t border-blue-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p>&copy; 2024 FavBet ServiDesk. Sva prava zadržana.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
