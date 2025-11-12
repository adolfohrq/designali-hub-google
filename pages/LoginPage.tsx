import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
// @ts-ignore
import { toast } from 'react-hot-toast';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const [formMode, setFormMode] = useState<'login' | 'signup' | 'forgot-password'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formMode === 'signup') {
        const { error } = await signUp(email, password);
        if (error) {
          toast.error(`Erro ao criar conta: ${error.message}`);
        } else {
          toast.success('Conta criada! Verifique seu email para confirmar.');
          setFormMode('login');
        }
      } else if (formMode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(`Erro ao fazer login: ${error.message}`);
        } else {
          toast.success('Login realizado com sucesso!');
          // AuthContext will handle user state, App.tsx will redirect
        }
      } else if (formMode === 'forgot-password') {
        const { error } = await resetPassword(email);
        if (error) {
          toast.error(`Erro ao enviar email: ${error.message}`);
        } else {
          toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
          setFormMode('login');
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast.error(`Erro ao fazer login com Google: ${error.message}`);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Erro ao fazer login com Google.');
    } finally {
      setLoading(false);
    }
  };
  
  const activeBtnClasses = "font-semibold text-indigo-600 transition";
  const inactiveBtnClasses = "font-medium text-brand-dark hover:text-indigo-600 transition";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
        <div className="absolute top-6 right-6 space-x-4">
            <button onClick={() => setFormMode('login')} className={formMode === 'login' ? activeBtnClasses : inactiveBtnClasses}>Entrar</button>
            <button onClick={() => setFormMode('signup')} className={formMode === 'signup' ? activeBtnClasses : inactiveBtnClasses}>Criar Conta</button>
        </div>
      
        <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                Designali Hub
            </h1>
            <p className="text-lg text-brand-gray mt-2">Sua plataforma de gerenciamento criativo</p>
        </div>

        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            {formMode === 'login' ? (
                <>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-brand-dark">Entrar</h2>
                        <p className="text-brand-gray mt-1">Digite seu email e senha para acessar sua conta</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="email">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-1">
                                <label className="block text-sm font-medium text-brand-gray" htmlFor="password">
                                    Senha
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setFormMode('forgot-password')}
                                    className="text-xs text-indigo-600 hover:underline"
                                >
                                    Esqueceu a senha?
                                </button>
                            </div>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-dark text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </button>
                    </form>

                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="font-medium text-gray-700">Google</span>
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                           Não tem uma conta?{' '}
                           <button onClick={() => setFormMode('signup')} className="font-semibold text-indigo-600 hover:underline">
                                Crie uma
                           </button>
                        </p>
                    </div>
                </>
            ) : formMode === 'signup' ? (
                 <>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-brand-dark">Criar Conta</h2>
                        <p className="text-brand-gray mt-1">Crie sua conta para começar a organizar</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="name">
                                Nome
                            </label>
                            <input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Seu nome completo"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="signup-email">
                                Email
                            </label>
                            <input
                                id="signup-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                required
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="signup-password">
                                Senha
                            </label>
                            <input
                                id="signup-password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-dark text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Criando...' : 'Criar Conta'}
                        </button>
                    </form>

                    <div className="mt-4">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Ou continue com</span>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="mt-4 w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <span className="font-medium text-gray-700">Google</span>
                        </button>
                    </div>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                           Já tem uma conta?{' '}
                           <button onClick={() => setFormMode('login')} className="font-semibold text-indigo-600 hover:underline">
                                Entre
                           </button>
                        </p>
                    </div>
                </>
            ) : formMode === 'forgot-password' ? (
                <>
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-brand-dark">Recuperar Senha</h2>
                        <p className="text-brand-gray mt-1">Digite seu email para receber o link de recuperação</p>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="reset-email">
                                Email
                            </label>
                            <input
                                id="reset-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="seu@email.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-brand-dark text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                        </button>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                           Lembrou sua senha?{' '}
                           <button onClick={() => setFormMode('login')} className="font-semibold text-indigo-600 hover:underline">
                                Voltar ao Login
                           </button>
                        </p>
                    </div>
                </>
            ) : null}
             <div className="text-center mt-6">
                <p className="text-xs text-gray-500">
                    Ao continuar, você concorda com nossos <a href="#" className="text-indigo-600 hover:underline">Termos de Serviço</a>
                </p>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;