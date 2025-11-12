import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabase';
// @ts-ignore
import { toast } from 'react-hot-toast';
import { UserIcon, LockIcon, BellIcon, PaletteIcon } from '../components/Icons';
import { debug } from '../utils/debug';

const Configuracoes: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'preferences'>('profile');

  // Profile states
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Security states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loadingSecurity, setLoadingSecurity] = useState(false);

  // Preferences states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('pt-BR');

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      // Load user profile from database if exists
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        debug.error('Error loading profile:', error);
        return;
      }

      if (data) {
        setDisplayName(data.display_name || '');
        setAvatarUrl(data.avatar_url || '');
        setBio(data.bio || '');
        setEmailNotifications(data.email_notifications ?? true);
        setDarkMode(data.dark_mode ?? false);
        setLanguage(data.language || 'pt-BR');
      }
    } catch (error) {
      debug.error('Error loading user profile:', error);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoadingProfile(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          display_name: displayName,
          avatar_url: avatarUrl,
          bio: bio,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      debug.error('Error updating profile:', error);
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoadingSecurity(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      debug.error('Error changing password:', error);
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setLoadingSecurity(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
          user_id: user.id,
          email_notifications: emailNotifications,
          dark_mode: darkMode,
          language: language,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (error) throw error;
      toast.success('Preferências salvas com sucesso!');
    } catch (error: any) {
      debug.error('Error saving preferences:', error);
      toast.error(error.message || 'Erro ao salvar preferências');
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Imagem muito grande. Máximo 2MB.');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Apenas imagens são permitidas.');
      return;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast.success('Avatar carregado com sucesso!');
    } catch (error: any) {
      debug.error('Error uploading avatar:', error);
      toast.error(error.message || 'Erro ao fazer upload do avatar');
    }
  };

  const getTabClass = (tab: string) => {
    return activeTab === tab
      ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
      : 'text-brand-gray hover:text-brand-dark';
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Configurações</h1>
        <p className="text-brand-gray mt-2">Gerencie suas preferências e informações de conta</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-4 px-1 transition ${getTabClass('profile')}`}
          >
            <div className="flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              <span>Perfil</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`pb-4 px-1 transition ${getTabClass('security')}`}
          >
            <div className="flex items-center gap-2">
              <LockIcon className="w-5 h-5" />
              <span>Segurança</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('preferences')}
            className={`pb-4 px-1 transition ${getTabClass('preferences')}`}
          >
            <div className="flex items-center gap-2">
              <PaletteIcon className="w-5 h-5" />
              <span>Preferências</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Informações do Perfil</h2>

          <form onSubmit={handleSaveProfile}>
            {/* Avatar Section */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-brand-gray mb-2">
                Foto de Perfil
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    user?.email?.substring(0, 2).toUpperCase() || 'U'
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="cursor-pointer inline-block px-4 py-2 bg-gray-100 text-brand-dark rounded-lg hover:bg-gray-200 transition text-sm font-medium"
                  >
                    Alterar Foto
                  </label>
                  <p className="text-xs text-brand-gray mt-1">JPG, PNG ou GIF. Máximo 2MB.</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="display-name">
                Nome de Exibição
              </label>
              <input
                id="display-name"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Seu nome"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Email (readonly) */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-brand-gray mt-1">O email não pode ser alterado no momento.</p>
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="bio">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loadingProfile}
              className="w-full bg-brand-dark text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingProfile ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Segurança da Conta</h2>

          <form onSubmit={handleChangePassword}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="current-password">
                Senha Atual
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="new-password">
                Nova Senha
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-brand-gray mb-1" htmlFor="confirm-password">
                Confirmar Nova Senha
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loadingSecurity}
              className="w-full bg-brand-dark text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingSecurity ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-brand-dark mb-6">Preferências</h2>

          <div className="space-y-6">
            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-dark">Notificações por Email</p>
                <p className="text-sm text-brand-gray">Receba atualizações e novidades por email</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  emailNotifications ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    emailNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-dark">Modo Escuro</p>
                <p className="text-sm text-brand-gray">Ativar tema escuro para toda a aplicação</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  darkMode ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Language */}
            <div>
              <label className="block font-medium text-brand-dark mb-2" htmlFor="language">
                Idioma
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="pt-BR">Português (Brasil)</option>
                <option value="en-US">English (US)</option>
                <option value="es-ES">Español</option>
              </select>
            </div>

            <button
              onClick={handleSavePreferences}
              className="w-full bg-brand-dark text-white font-semibold py-2.5 px-4 rounded-lg hover:bg-gray-800 transition"
            >
              Salvar Preferências
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Configuracoes;
