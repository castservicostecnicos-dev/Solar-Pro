import React, { useState, useEffect } from 'react';
import { AppUser } from '../types';
import { 
  getStoredUsers, 
  saveUser, 
  deleteUser, 
  resetUserPassword,
  toggleUserStatus,
  initFirestoreSync 
} from '../utils/storage';
import { 
  ShieldCheck, 
  Users, 
  UserPlus, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Trash2, 
  Edit3, 
  Share2, 
  Lock, 
  Unlock, 
  Phone, 
  Building, 
  Search, 
  MessageSquare, 
  Sparkles, 
  AlertTriangle, 
  Mail, 
  CheckCircle2, 
  RefreshCw,
  LogOut 
} from 'lucide-react';

interface DevDashboardProps {
  currentUser: AppUser;
  onLogout?: () => void;
}

export const DevDashboard: React.FC<DevDashboardProps> = ({ currentUser, onLogout }) => {
  const [users, setUsers] = useState<AppUser[]>(getStoredUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'bloqueado'>('todos');
  
  // Password visibility map { [userId]: boolean }
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: string]: boolean }>({});
  
  // Copied alert states
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State for New/Edit User
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    document: '',
    company: '',
    phone: '',
    status: 'ativo' as 'ativo' | 'bloqueado',
    notes: '',
  });

  // Modal State for Password Recovery
  const [passwordRecoveryModal, setPasswordRecoveryModal] = useState<AppUser | null>(null);
  const [recoveryNewPassword, setRecoveryNewPassword] = useState('');
  const [copiedRecoveryText, setCopiedRecoveryText] = useState(false);
  const [recoverySuccessMsg, setRecoverySuccessMsg] = useState('');

  // Modal for Delete Confirmation
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<AppUser | null>(null);

  // Modal for Share Credentials
  const [shareUserModal, setShareUserModal] = useState<AppUser | null>(null);
  const [copiedShareText, setCopiedShareText] = useState(false);

  const refreshData = () => {
    setUsers(getStoredUsers());
  };

  useEffect(() => {
    initFirestoreSync({
      onUsersChange: (updatedUsers) => {
        setUsers(updatedUsers);
      },
    });
  }, []);

  const generateRandomPassword = () => {
    const chars = 'abcdefghijkmnpqrstuvwxyz23456789';
    let pwd = 'solar';
    for (let i = 0; i < 4; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleOpenCreateUser = () => {
    setEditingUser(null);
    setUserFormData({
      name: '',
      username: '',
      email: '',
      password: generateRandomPassword(),
      document: '',
      company: '',
      phone: '',
      status: 'ativo',
      notes: '',
    });
    setIsUserModalOpen(true);
  };

  const handleOpenEditUser = (user: AppUser) => {
    setEditingUser(user);
    setUserFormData({
      name: user.name,
      username: user.username,
      email: user.email || '',
      password: user.password,
      document: user.document || '',
      company: user.company || '',
      phone: user.phone || '',
      status: user.status,
      notes: user.notes || '',
    });
    setIsUserModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name.trim() || !userFormData.username.trim() || !userFormData.password.trim()) {
      alert('Por favor preencha nome, login e senha do cliente.');
      return;
    }

    const newUser: AppUser = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      name: userFormData.name.trim(),
      username: userFormData.username.trim().toLowerCase(),
      email: userFormData.email.trim(),
      document: userFormData.document.trim(),
      password: userFormData.password.trim(),
      role: editingUser ? editingUser.role : 'cliente',
      company: userFormData.company.trim(),
      phone: userFormData.phone.trim(),
      status: userFormData.status,
      createdAt: editingUser ? editingUser.createdAt : new Date().toISOString(),
      lastLogin: editingUser ? editingUser.lastLogin : undefined,
      passwordResetAt: editingUser ? editingUser.passwordResetAt : undefined,
      notes: userFormData.notes.trim(),
    };

    saveUser(newUser);
    refreshData();
    setIsUserModalOpen(false);

    if (!editingUser) {
      setShareUserModal(newUser);
    }
  };

  const handleToggleStatus = (user: AppUser) => {
    if (user.role === 'dev') return;
    toggleUserStatus(user.id);
    refreshData();
  };

  const handleOpenDelete = (user: AppUser) => {
    if (user.role === 'dev') {
      alert('O usuário Desenvolvedor Master é protegido e não pode ser excluído.');
      return;
    }
    setDeleteConfirmModal(user);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmModal) return;
    deleteUser(deleteConfirmModal.id);
    refreshData();
    setDeleteConfirmModal(null);
  };

  const handleOpenPasswordRecovery = (user: AppUser) => {
    setPasswordRecoveryModal(user);
    setRecoveryNewPassword(generateRandomPassword());
    setCopiedRecoveryText(false);
    setRecoverySuccessMsg('');
  };

  const handleSaveRecoveredPassword = () => {
    if (!passwordRecoveryModal) return;
    if (!recoveryNewPassword.trim()) {
      alert('Informe a nova senha.');
      return;
    }
    const res = resetUserPassword(passwordRecoveryModal.id, recoveryNewPassword.trim());
    if (res.success && res.user) {
      setPasswordRecoveryModal(res.user);
      refreshData();
      setRecoverySuccessMsg(`Nova senha definida com sucesso para ${res.user.name}!`);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getShareMessage = (user: AppUser) => {
    const appUrl = window.location.origin;
    return `Olá ${user.name}! ☀️\nSeu acesso ao sistema CAST SolarPro está liberado:\n\n🌐 Link: ${appUrl}\n👤 Login: ${user.username}\n🔑 Senha: ${user.password}\n\nQualquer dúvida estamos à disposição!`;
  };

  const getRecoveryMessage = (user: AppUser, pass: string) => {
    const appUrl = window.location.origin;
    return `Olá ${user.name}! ☀️\nSua senha de acesso ao CAST SolarPro foi redefinida pelo administrador:\n\n🌐 Link: ${appUrl}\n👤 Login: ${user.username}\n🔑 Nova Senha: ${pass}\n\nRecomendamos guardar suas credenciais com segurança. Estamos à disposição!`;
  };

  const filteredUsers = users.filter(u => {
    if (statusFilter !== 'todos' && u.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim() === '') return true;
    const query = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      (u.email && u.email.toLowerCase().includes(query)) ||
      (u.document && u.document.toLowerCase().includes(query)) ||
      (u.company && u.company.toLowerCase().includes(query)) ||
      (u.phone && u.phone.includes(query))
    );
  });

  const totalClients = users.filter(u => u.role === 'cliente').length;
  const activeClients = users.filter(u => u.role === 'cliente' && u.status === 'ativo').length;
  const blockedClients = users.filter(u => u.role === 'cliente' && u.status === 'bloqueado').length;

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* DEV Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Painel do Desenvolvedor (DEV Master)
              </span>
              <span className="text-xs text-slate-400">
                Logado como: <strong className="text-white">{currentUser.name}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight font-display">
              Cadastro & Gestão de Clientes
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Módulo exclusivo de administração para cadastrar novos clientes, ativar ou desativar acessos, editar informações, excluir cadastros e recuperar senhas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <button
              id="btn-dev-new-client"
              type="button"
              onClick={handleOpenCreateUser}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastrar Novo Cliente</span>
            </button>
            <button
              type="button"
              onClick={refreshData}
              title="Atualizar lista"
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {onLogout && (
              <button
                id="btn-dev-banner-logout"
                type="button"
                onClick={onLogout}
                title="Sair do painel DEV (Deslogar)"
                className="flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white border border-rose-500/50 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
              >
                <LogOut className="w-4 h-4 text-white" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards: Focus solely on Client Management */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total de Clientes</span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalClients}</span>
            <span className="text-xs text-slate-400">cadastrados</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes Ativos</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400">{activeClients}</span>
            <span className="text-xs text-slate-400">acesso liberado</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes Desativados</span>
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-400">{blockedClients}</span>
            <span className="text-xs text-slate-400">bloqueados</span>
          </div>
        </div>
      </div>

      {/* Client List Section with Search & Filters */}
      <div className="space-y-4">
        
        {/* Search bar & Filter tabs */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/70 p-3.5 rounded-2xl border border-slate-800">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nome, login, documento, empresa ou telefone..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-between md:justify-end">
            <div className="inline-flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setStatusFilter('todos')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'todos' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                }`}
              >
                Todos ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('ativo')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'ativo' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                Ativos ({activeClients})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('bloqueado')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  statusFilter === 'bloqueado' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-rose-400'
                }`}
              >
                Desativados ({blockedClients})
              </button>
            </div>

            <span className="text-xs text-slate-400 hidden lg:inline-block">
              Mostrando <strong>{filteredUsers.length}</strong> de <strong>{users.length}</strong>
            </span>
          </div>
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden md:block bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">
                  <th className="py-3 px-4">Cliente / Cadastro</th>
                  <th className="py-3 px-4">Perfil</th>
                  <th className="py-3 px-4">Login / E-mail</th>
                  <th className="py-3 px-4">Senha</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Último Acesso</th>
                  <th className="py-3 px-4 text-right">Ações de Gestão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => {
                  const isDev = user.role === 'dev';
                  const isVisible = visiblePasswords[user.id] || false;
                  const isCopied = copiedId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name, Company & Document */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isDev 
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          }`}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isDev && (
                                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-mono">
                                  DEV Master
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 flex-wrap">
                              {user.company && (
                                <span className="flex items-center gap-1">
                                  <Building className="w-3 h-3 text-slate-500" />
                                  {user.company}
                                </span>
                              )}
                              {user.document && (
                                <span className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                                  Doc: {user.document}
                                </span>
                              )}
                              {user.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-500" />
                                  {user.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
                          isDev
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-slate-800 text-sky-400 border-slate-700'
                        }`}>
                          {isDev ? 'Administrador DEV' : 'Cliente / Integrador'}
                        </span>
                      </td>

                      {/* Username */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-200">
                          {user.username}
                        </div>
                        {user.email && (
                          <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-500" />
                            <span>{user.email}</span>
                          </div>
                        )}
                      </td>

                      {/* Password with Eye and Copy */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800 w-fit">
                          <span className="font-mono text-amber-300 select-all text-xs">
                            {isVisible ? user.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(user.id)}
                            className="text-slate-400 hover:text-slate-200 p-0.5"
                            title={isVisible ? 'Ocultar senha' : 'Ver senha'}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(user.password, user.id)}
                            className="text-slate-400 hover:text-amber-400 p-0.5"
                            title="Copiar senha"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isDev ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                            <Check className="w-3 h-3" />
                            Sempre Ativo
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(user)}
                            title={user.status === 'ativo' ? 'Clique para desativar acesso deste cliente' : 'Clique para reativar acesso deste cliente'}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border cursor-pointer transition-all ${
                              user.status === 'ativo'
                                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                                : 'bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/60'
                            }`}
                          >
                            {user.status === 'ativo' ? (
                              <>
                                <Unlock className="w-3 h-3" />
                                <span>Ativo</span>
                              </>
                            ) : (
                              <>
                                <Lock className="w-3 h-3" />
                                <span>Desativado</span>
                              </>
                            )}
                          </button>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-slate-400 text-xs">
                        {user.lastLogin ? (
                          <div title={new Date(user.lastLogin).toLocaleString('pt-BR')}>
                            {new Date(user.lastLogin).toLocaleDateString('pt-BR')} às {new Date(user.lastLogin).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        ) : (
                          <div className="text-slate-600 italic">Nunca logou</div>
                        )}
                        {user.passwordResetAt && (
                          <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                            Redefinida: {new Date(user.passwordResetAt).toLocaleDateString('pt-BR')}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isDev && (
                            <>
                              {/* Recuperar Senha */}
                              <button
                                type="button"
                                onClick={() => handleOpenPasswordRecovery(user)}
                                title="Recuperar / Redefinir senha do cliente"
                                className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 transition-colors"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>

                              {/* Compartilhar WhatsApp / Copiar */}
                              <button
                                type="button"
                                onClick={() => setShareUserModal(user)}
                                title="Enviar dados de acesso para WhatsApp"
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-colors"
                              >
                                <Share2 className="w-4 h-4" />
                              </button>

                              {/* Editar Dados do Cliente */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditUser(user)}
                                title="Editar dados cadastrais do cliente"
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>

                              {/* Excluir Cliente */}
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(user)}
                                title="Excluir este cliente"
                                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS VIEW */}
        <div className="block md:hidden space-y-3">
          {filteredUsers.map((user) => {
            const isDev = user.role === 'dev';
            const isVisible = visiblePasswords[user.id] || false;
            const isCopied = copiedId === user.id;

            return (
              <div 
                key={user.id} 
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3 w-full max-w-full box-border"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isDev 
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' 
                        : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                    }`}>
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {isDev && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                            DEV Master
                          </span>
                        )}
                      </h4>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {user.company || (isDev ? 'Administração Geral' : 'Cliente Particular')}
                      </div>
                    </div>
                  </div>

                  {!isDev ? (
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(user)}
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-xl border min-h-[36px] cursor-pointer transition-all ${
                        user.status === 'ativo'
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                          : 'bg-rose-950/60 text-rose-300 border-rose-500/40 hover:bg-rose-900/60'
                      }`}
                    >
                      {user.status === 'ativo' ? (
                        <>
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Ativo</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-3.5 h-3.5" />
                          <span>Desativado</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                      Ativo
                    </span>
                  )}
                </div>

                {/* Credentials */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Login:</span>
                    <span className="font-mono font-bold text-white">{user.username}</span>
                  </div>

                  {user.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">E-mail:</span>
                      <span className="text-slate-200">{user.email}</span>
                    </div>
                  )}

                  {user.document && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Documento:</span>
                      <span className="font-mono text-slate-200">{user.document}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <span className="text-slate-400">Senha:</span>
                    <div className="flex items-center gap-1.5 font-mono text-amber-300">
                      <span>{isVisible ? user.password : '••••••••'}</span>
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(user.id)}
                        className="text-slate-400 hover:text-white p-1"
                        title="Ver senha"
                      >
                        {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(user.password, user.id)}
                        className="text-slate-400 hover:text-amber-400 p-1"
                        title="Copiar senha"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span className="text-slate-400">Telefone:</span>
                      <a 
                        href={`https://wa.me/${user.phone.replace(/\D/g, '')}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-mono"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{user.phone}</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* Actions Grid */}
                {!isDev && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenPasswordRecovery(user)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4 text-amber-400" />
                      <span>Recuperar Senha</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditUser(user)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4 text-slate-400" />
                      <span>Editar Dados</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareUserModal(user)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4 text-emerald-400" />
                      <span>Enviar WhatsApp</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDelete(user)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Excluir</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* MODAL 1: CREATE / EDIT CLIENT */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-lg max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn my-auto">
            
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>{editingUser ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}</span>
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Preencha os dados cadastrais e as credenciais de acesso
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-white p-2 rounded-lg -mr-1"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex flex-col flex-1 overflow-hidden min-h-0">
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nome Completo do Cliente *
                  </label>
                  <input
                    type="text"
                    value={userFormData.name}
                    onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                    placeholder="Ex: João Ferreira da Silva"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Login / Usuário de Acesso *
                    </label>
                    <input
                      type="text"
                      value={userFormData.username}
                      onChange={(e) => setUserFormData({ ...userFormData, username: e.target.value })}
                      placeholder="Ex: joao ou joao.solar"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        Senha de Acesso *
                      </label>
                      <button
                        type="button"
                        onClick={() => setUserFormData({ ...userFormData, password: generateRandomPassword() })}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-medium"
                      >
                        Gerar aleatória
                      </button>
                    </div>
                    <input
                      type="text"
                      value={userFormData.password}
                      onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                      placeholder="Senha do cliente"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono text-amber-300"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      E-mail de Contato
                    </label>
                    <input
                      type="email"
                      value={userFormData.email}
                      onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                      placeholder="Ex: cliente@empresa.com"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      CPF ou CNPJ
                    </label>
                    <input
                      type="text"
                      value={userFormData.document}
                      onChange={(e) => setUserFormData({ ...userFormData, document: e.target.value })}
                      placeholder="000.000.000-00 ou CNPJ"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Empresa / Razão Social
                    </label>
                    <input
                      type="text"
                      value={userFormData.company}
                      onChange={(e) => setUserFormData({ ...userFormData, company: e.target.value })}
                      placeholder="Ex: Silva Comércio ME"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Telefone / WhatsApp (com DDD)
                    </label>
                    <input
                      type="text"
                      value={userFormData.phone}
                      onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                      placeholder="(11) 99999-9999"
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status de Acesso
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUserFormData({ ...userFormData, status: 'ativo' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        userFormData.status === 'ativo'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-sm shadow-emerald-500/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Unlock className="w-3.5 h-3.5" />
                      <span>Ativo (Liberado)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserFormData({ ...userFormData, status: 'bloqueado' })}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        userFormData.status === 'bloqueado'
                          ? 'bg-rose-950 text-rose-300 border-rose-500/60 shadow-sm shadow-rose-500/20'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Desativado</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Observações Internas (opcional)
                  </label>
                  <textarea
                    value={userFormData.notes}
                    onChange={(e) => setUserFormData({ ...userFormData, notes: e.target.value })}
                    placeholder="Anotações comerciais ou operacionais sobre o cliente..."
                    rows={2}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 resize-none"
                  />
                </div>
              </div>

              <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-950/80 shrink-0 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  {editingUser ? 'Salvar Alterações' : 'Cadastrar e Liberar Acesso'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: RECUPERAR / REDEFINIR SENHA DO CLIENTE */}
      {passwordRecoveryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-slate-900 border border-amber-500/30 rounded-2xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn my-auto">
            
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-amber-950/20">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">
                    Recuperar & Redefinir Senha
                  </h3>
                  <p className="text-[11px] sm:text-xs text-amber-300">
                    Cliente: <strong>{passwordRecoveryModal.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPasswordRecoveryModal(null)}
                className="text-slate-400 hover:text-white p-1"
                aria-label="Fechar"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              
              {recoverySuccessMsg && (
                <div className="p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{recoverySuccessMsg}</span>
                </div>
              )}

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Usuário/Login:</span>
                  <span className="font-mono font-bold text-white">{passwordRecoveryModal.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Senha Atual:</span>
                  <span className="font-mono text-amber-400 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800 select-all">
                    {passwordRecoveryModal.password}
                  </span>
                </div>
                {passwordRecoveryModal.phone && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">WhatsApp:</span>
                    <span className="text-slate-300 font-mono">{passwordRecoveryModal.phone}</span>
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Definir Nova Senha:
                  </label>
                  <button
                    type="button"
                    onClick={() => setRecoveryNewPassword(generateRandomPassword())}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Gerar Nova Senha</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={recoveryNewPassword}
                  onChange={(e) => setRecoveryNewPassword(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-amber-500/50 rounded-xl text-sm text-white font-mono text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveRecoveredPassword}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Salvar e Aplicar Nova Senha</span>
                </button>

                {passwordRecoveryModal.phone ? (
                  <a
                    href={`https://wa.me/${passwordRecoveryModal.phone.replace(/\D/g, '')}?text=${encodeURIComponent(getRecoveryMessage(passwordRecoveryModal, recoveryNewPassword || passwordRecoveryModal.password))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 text-center cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enviar Nova Senha pelo WhatsApp</span>
                  </a>
                ) : (
                  <div className="text-[11px] text-slate-500 text-center">
                    (Sem telefone cadastrado para envio automático via WhatsApp)
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    const msg = getRecoveryMessage(passwordRecoveryModal, recoveryNewPassword || passwordRecoveryModal.password);
                    navigator.clipboard.writeText(msg);
                    setCopiedRecoveryText(true);
                    setTimeout(() => setCopiedRecoveryText(false), 2500);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer"
                >
                  {copiedRecoveryText ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Mensagem copiada para a área de transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>Copiar Mensagem com Nova Senha</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            <div className="p-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setPasswordRecoveryModal(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
              >
                Concluir & Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM DELETE CLIENT */}
      {deleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md p-5 shadow-2xl animate-fadeIn space-y-4 my-auto">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Excluir Cliente?
                </h3>
                <p className="text-xs text-rose-300">
                  Esta ação removerá o acesso permanentemente
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Tem certeza que deseja excluir o cliente <strong>{deleteConfirmModal.name}</strong> (login: <code className="text-amber-300 font-mono">{deleteConfirmModal.username}</code>)?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-all cursor-pointer"
              >
                Sim, Excluir Cliente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SHARE CREDENTIALS VIA WHATSAPP / COPY */}
      {shareUserModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto overscroll-contain">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl w-full max-w-[calc(100vw-1.5rem)] sm:max-w-md max-h-[92dvh] flex flex-col overflow-hidden shadow-2xl animate-fadeIn my-auto">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-emerald-950/30">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Enviar Acesso ao Cliente
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Cliente: <strong>{shareUserModal.name}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShareUserModal(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-slate-300">
                Copie os dados de acesso abaixo ou envie diretamente pelo WhatsApp para <strong>{shareUserModal.name}</strong>:
              </p>

              <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                {getShareMessage(shareUserModal)}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(getShareMessage(shareUserModal));
                    setCopiedShareText(true);
                    setTimeout(() => setCopiedShareText(false), 2500);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {copiedShareText ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>Mensagem copiada para a área de transferência!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Mensagem de Acesso</span>
                    </>
                  )}
                </button>

                {shareUserModal.phone && (
                  <a
                    href={`https://wa.me/${shareUserModal.phone.replace(/\D/g, '')}?text=${encodeURIComponent(getShareMessage(shareUserModal))}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20 text-center cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Enviar direto no WhatsApp ({shareUserModal.phone})</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setShareUserModal(null)}
                  className="w-full py-2 px-4 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  Fechar
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
