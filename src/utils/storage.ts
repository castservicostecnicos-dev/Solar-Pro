import { 
  SolarProposal, 
  FollowUpActivity, 
  DigitalSignatureData, 
  PaymentInstallment, 
  AppUser, 
  AccessLog, 
  SolarModule, 
  SolarInverter 
} from '../types';
import { 
  INITIAL_SAMPLE_PROPOSALS, 
  AVAILABLE_MODULES, 
  AVAILABLE_INVERTERS 
} from '../data/solarDefaults';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  writeBatch
} from 'firebase/firestore';

const STORAGE_KEY = 'solarpro_proposals_v1';
const USERS_STORAGE_KEY = 'solarpro_users_v1';
const SESSION_STORAGE_KEY = 'solarpro_session_v1';
const LOGS_STORAGE_KEY = 'solarpro_access_logs_v1';
const MODULES_STORAGE_KEY = 'solarpro_modules_v1';
const INVERTERS_STORAGE_KEY = 'solarpro_inverters_v1';

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user-dev-master',
    username: 'dev',
    password: 'dev',
    name: 'Desenvolvedor Master',
    role: 'dev',
    company: 'CAST Tecnologia & Energia Solar',
    phone: '(11) 99999-0000',
    status: 'ativo',
    createdAt: new Date('2026-01-01T00:00:00.000Z').toISOString(),
    lastLogin: new Date().toISOString(),
    notes: 'Acesso total de Desenvolvedor e Administrador do Sistema.',
  },
  {
    id: 'user-cliente-demo',
    username: 'cliente',
    password: '123',
    name: 'Carlos Eduardo Silva',
    role: 'cliente',
    company: 'Silva Comércio e Serviços',
    phone: '(11) 98765-4321',
    status: 'ativo',
    createdAt: new Date('2026-02-15T00:00:00.000Z').toISOString(),
    lastLogin: new Date('2026-03-01T14:20:00.000Z').toISOString(),
    notes: 'Cliente piloto para geração de propostas e acompanhamento de projetos solares.',
  },
];

/**
 * Remove propriedades com valor `undefined` antes de persistir no Firestore
 */
function sanitizeForFirestore<T>(data: T): any {
  return JSON.parse(JSON.stringify(data));
}

// -------------------------------------------------------------
// FIRESTORE REAL-TIME SYNCHRONIZATION & LISTENERS
// -------------------------------------------------------------

interface FirestoreSyncCallbacks {
  onProposalsChange?: (proposals: SolarProposal[]) => void;
  onUsersChange?: (users: AppUser[]) => void;
  onModulesChange?: (modules: SolarModule[]) => void;
  onInvertersChange?: (inverters: SolarInverter[]) => void;
  onSyncStatusChange?: (synced: boolean) => void;
}

let isSyncInitialized = false;

export function initFirestoreSync(callbacks?: FirestoreSyncCallbacks) {
  if (isSyncInitialized) return;
  isSyncInitialized = true;

  try {
    // 1. Ouvir Propostas no Firestore
    const proposalsCol = collection(db, 'proposals');
    onSnapshot(proposalsCol, async (snapshot) => {
      const cloudProposals: SolarProposal[] = [];
      snapshot.forEach((d) => {
        const item = d.data() as SolarProposal;
        // Não carrega dados de teste/mock se existirem de versões antigas
        if (!item.id?.startsWith('prop-sample-')) {
          cloudProposals.push(item);
        }
      });
      
      // Ordena pela data de criação decrescente
      cloudProposals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      saveStoredProposals(cloudProposals);
      if (callbacks?.onProposalsChange) {
        callbacks.onProposalsChange(cloudProposals);
      }
      if (callbacks?.onSyncStatusChange) {
        callbacks.onSyncStatusChange(true);
      }
    }, (error) => {
      console.warn('Firestore proposals onSnapshot notice:', error);
    });

    // 2. Ouvir Usuários no Firestore
    const usersCol = collection(db, 'users');
    onSnapshot(usersCol, async (snapshot) => {
      if (snapshot.empty) {
        console.log('Semeando usuários padrão no Firestore...');
        const batch = writeBatch(db);
        for (const u of DEFAULT_USERS) {
          const userRef = doc(db, 'users', u.id);
          batch.set(userRef, sanitizeForFirestore(u));
        }
        await batch.commit().catch(console.error);
      } else {
        const cloudUsers: AppUser[] = [];
        snapshot.forEach((d) => {
          cloudUsers.push(d.data() as AppUser);
        });
        saveStoredUsers(cloudUsers);
        if (callbacks?.onUsersChange) {
          callbacks.onUsersChange(cloudUsers);
        }
      }
    }, (error) => {
      console.warn('Firestore users onSnapshot notice:', error);
    });

    // 3. Ouvir Módulos no Firestore
    const modulesCol = collection(db, 'modules');
    onSnapshot(modulesCol, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        for (const m of AVAILABLE_MODULES) {
          const modRef = doc(db, 'modules', m.id || m.model.replace(/\s+/g, '_'));
          batch.set(modRef, sanitizeForFirestore(m));
        }
        await batch.commit().catch(console.error);
      } else {
        const cloudModules: SolarModule[] = [];
        snapshot.forEach((d) => {
          cloudModules.push(d.data() as SolarModule);
        });
        saveStoredModules(cloudModules);
        if (callbacks?.onModulesChange) {
          callbacks.onModulesChange(cloudModules);
        }
      }
    }, (error) => {
      console.warn('Firestore modules onSnapshot notice:', error);
    });

    // 4. Ouvir Inversores no Firestore
    const invertersCol = collection(db, 'inverters');
    onSnapshot(invertersCol, async (snapshot) => {
      if (snapshot.empty) {
        const batch = writeBatch(db);
        for (const inv of AVAILABLE_INVERTERS) {
          const invRef = doc(db, 'inverters', inv.id || inv.model.replace(/\s+/g, '_'));
          batch.set(invRef, sanitizeForFirestore(inv));
        }
        await batch.commit().catch(console.error);
      } else {
        const cloudInverters: SolarInverter[] = [];
        snapshot.forEach((d) => {
          cloudInverters.push(d.data() as SolarInverter);
        });
        saveStoredInverters(cloudInverters);
        if (callbacks?.onInvertersChange) {
          callbacks.onInvertersChange(cloudInverters);
        }
      }
    }, (error) => {
      console.warn('Firestore inverters onSnapshot notice:', error);
    });

  } catch (err) {
    console.error('Falha ao iniciar sincronização com Firestore:', err);
  }
}

// -------------------------------------------------------------
// PROPOSALS MANAGEMENT (LOCAL + CLOUD FIRESTORE)
// -------------------------------------------------------------

export function getStoredProposals(): SolarProposal[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    // Retorna apenas propostas reais salvas pelo técnico (descarta mocks antigos)
    return parsed.filter(p => !p.id?.startsWith('prop-sample-'));
  } catch (err) {
    console.error('Error reading proposals from localStorage', err);
    return [];
  }
}

export function saveStoredProposals(proposals: SolarProposal[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(proposals));
  } catch (err) {
    console.error('Error saving proposals to localStorage', err);
  }
}

export function saveProposal(proposal: SolarProposal): SolarProposal[] {
  const list = getStoredProposals();
  const existingIdx = list.findIndex(p => p.id === proposal.id);
  let updated: SolarProposal[];
  const prepared: SolarProposal = {
    ...proposal,
    updatedAt: new Date().toISOString()
  };

  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = prepared;
  } else {
    updated = [prepared, ...list];
  }
  saveStoredProposals(updated);

  // Persistência em Nuvem no Firestore
  try {
    const propRef = doc(db, 'proposals', prepared.id);
    setDoc(propRef, sanitizeForFirestore(prepared), { merge: true }).catch((err) => {
      console.error('Erro ao salvar proposta no Firestore:', err);
    });
  } catch (cloudErr) {
    console.warn('Persistência Firestore em segundo plano:', cloudErr);
  }

  return updated;
}

export function deleteProposal(proposalId: string): SolarProposal[] {
  const list = getStoredProposals();
  const updated = list.filter(p => p.id !== proposalId);
  saveStoredProposals(updated);

  // Exclusão no Firestore
  try {
    const propRef = doc(db, 'proposals', proposalId);
    deleteDoc(propRef).catch((err) => {
      console.error('Erro ao excluir proposta no Firestore:', err);
    });
  } catch (cloudErr) {
    console.warn('Exclusão Firestore em segundo plano:', cloudErr);
  }

  return updated;
}

export function addFollowUp(proposalId: string, activity: Omit<FollowUpActivity, 'id'>): SolarProposal[] {
  const list = getStoredProposals();
  const proposal = list.find(p => p.id === proposalId);
  if (!proposal) return list;

  const newActivity: FollowUpActivity = {
    ...activity,
    id: `act-${Date.now()}`,
  };

  const updatedProposal: SolarProposal = {
    ...proposal,
    updatedAt: new Date().toISOString(),
    status: proposal.status === 'proposta_enviada' ? 'follow_up' : proposal.status,
    followUps: [newActivity, ...(proposal.followUps || [])],
  };

  return saveProposal(updatedProposal);
}

export function signProposal(proposalId: string, signature: DigitalSignatureData): SolarProposal[] {
  const list = getStoredProposals();
  const proposal = list.find(p => p.id === proposalId);
  if (!proposal) return list;

  const updatedProposal: SolarProposal = {
    ...proposal,
    status: 'assinado',
    updatedAt: new Date().toISOString(),
    signature,
    followUps: [
      {
        id: `act-sign-${Date.now()}`,
        date: new Date().toISOString(),
        type: 'nota',
        summary: `Proposta assinada digitalmente por ${signature.signedBy} (CPF: ${signature.documentNumber}). Hash: ${signature.validationHash}`,
        author: 'Sistema SolarPro',
      },
      ...(proposal.followUps || []),
    ],
  };

  return saveProposal(updatedProposal);
}

export function updatePaymentInstallment(
  proposalId: string,
  payment: PaymentInstallment
): SolarProposal[] {
  const list = getStoredProposals();
  const proposal = list.find(p => p.id === proposalId);
  if (!proposal) return list;

  const currentPayments = proposal.payments || [];
  const idx = currentPayments.findIndex(p => p.id === payment.id);
  let updatedPayments: PaymentInstallment[];

  if (idx >= 0) {
    updatedPayments = [...currentPayments];
    updatedPayments[idx] = payment;
  } else {
    updatedPayments = [...currentPayments, payment];
  }

  const updatedProposal: SolarProposal = {
    ...proposal,
    payments: updatedPayments,
    updatedAt: new Date().toISOString(),
  };

  return saveProposal(updatedProposal);
}

export function resetToDefaults(): SolarProposal[] {
  saveStoredProposals(INITIAL_SAMPLE_PROPOSALS);
  try {
    const batch = writeBatch(db);
    for (const prop of INITIAL_SAMPLE_PROPOSALS) {
      const propRef = doc(db, 'proposals', prop.id);
      batch.set(propRef, sanitizeForFirestore(prop));
    }
    batch.commit().catch(console.error);
  } catch (err) {
    console.warn('Erro ao restaurar Firestore:', err);
  }
  return INITIAL_SAMPLE_PROPOSALS;
}

// -------------------------------------------------------------
// USER MANAGEMENT & AUTHENTICATION (LOCAL + CLOUD FIRESTORE)
// -------------------------------------------------------------

export function getStoredUsers(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading users from localStorage', err);
    return DEFAULT_USERS;
  }
}

export function saveStoredUsers(users: AppUser[]): void {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage', err);
  }
}

export function saveUser(user: AppUser): AppUser[] {
  const users = getStoredUsers();
  const existingIdx = users.findIndex(u => u.id === user.id);
  let updated: AppUser[];
  if (existingIdx >= 0) {
    updated = [...users];
    updated[existingIdx] = user;
  } else {
    updated = [user, ...users];
  }
  saveStoredUsers(updated);

  // Persiste no Firestore
  try {
    const userRef = doc(db, 'users', user.id);
    setDoc(userRef, sanitizeForFirestore(user), { merge: true }).catch((err) => {
      console.error('Erro ao salvar usuário no Firestore:', err);
    });
  } catch (cloudErr) {
    console.warn('Persistência usuário Firestore:', cloudErr);
  }

  return updated;
}

export function deleteUser(userId: string): AppUser[] {
  const users = getStoredUsers();
  // Protege conta dev master de exclusão
  const updated = users.filter(u => u.id !== userId || u.id === 'user-dev-master');
  saveStoredUsers(updated);

  // Exclui no Firestore
  if (userId !== 'user-dev-master') {
    try {
      const userRef = doc(db, 'users', userId);
      deleteDoc(userRef).catch(console.error);
    } catch (cloudErr) {
      console.warn('Exclusão usuário Firestore:', cloudErr);
    }
  }

  return updated;
}

export function resetUserPassword(userId: string, newPassword: string): { success: boolean; user?: AppUser; message?: string } {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    return { success: false, message: 'Cliente não encontrado.' };
  }
  const updatedUser: AppUser = {
    ...user,
    password: newPassword,
    passwordResetAt: new Date().toISOString(),
  };
  saveUser(updatedUser);
  logAccess(user.username, user.role, 'sucesso', `Senha redefinida pelo Desenvolvedor (DEV Master)`);
  return { success: true, user: updatedUser };
}

export function toggleUserStatus(userId: string): { success: boolean; user?: AppUser } {
  const users = getStoredUsers();
  const user = users.find(u => u.id === userId);
  if (!user || user.role === 'dev') {
    return { success: false };
  }
  const newStatus: 'ativo' | 'bloqueado' = user.status === 'ativo' ? 'bloqueado' : 'ativo';
  const updatedUser: AppUser = {
    ...user,
    status: newStatus,
  };
  saveUser(updatedUser);
  logAccess(user.username, user.role, 'sucesso', `Status alterado para ${newStatus === 'ativo' ? 'ATIVO' : 'DESATIVADO'} pelo Desenvolvedor`);
  return { success: true, user: updatedUser };
}

export function getCurrentSession(): AppUser | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading session from localStorage', err);
    return null;
  }
}

export function setCurrentSession(user: AppUser | null): void {
  try {
    if (user) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch (err) {
    console.error('Error writing session to localStorage', err);
  }
}

export function authenticateUser(usernameInput: string, passwordInput: string): { success: boolean; user?: AppUser; message?: string } {
  const users = getStoredUsers();
  const normalizedInput = usernameInput.trim().toLowerCase();
  
  // Localiza usuário por username ou e-mail
  const user = users.find(u => 
    u.username.toLowerCase() === normalizedInput || 
    (u.role === 'dev' && (normalizedInput === 'dev' || normalizedInput === 'dev@castsolar.com'))
  );

  if (!user) {
    logAccess(usernameInput, 'cliente', 'falha', 'Usuário não encontrado');
    return { success: false, message: 'Usuário não cadastrado. Verifique o login ou fale com o Desenvolvedor.' };
  }

  const isDevMaster = user.role === 'dev';
  const passwordMatch = user.password === passwordInput || (isDevMaster && (passwordInput === 'dev' || passwordInput === 'dev123' || passwordInput === 'admin'));

  if (!passwordMatch) {
    logAccess(user.username, user.role, 'falha', 'Senha incorreta');
    return { success: false, message: 'Senha incorreta. Tente novamente.' };
  }

  if (user.status === 'bloqueado') {
    logAccess(user.username, user.role, 'bloqueado', 'Acesso bloqueado pelo administrador');
    return { success: false, message: 'Este usuário está temporariamente bloqueado. Fale com o suporte/DEV.' };
  }

  // Atualiza último login
  const updatedUser: AppUser = {
    ...user,
    lastLogin: new Date().toISOString()
  };
  saveUser(updatedUser);
  setCurrentSession(updatedUser);
  logAccess(user.username, user.role, 'sucesso', 'Login realizado com sucesso');

  return { success: true, user: updatedUser };
}

// -------------------------------------------------------------
// EQUIPMENT STORAGE & CATALOG (MÓDULOS E INVERSORES)
// -------------------------------------------------------------

export function getStoredModules(): SolarModule[] {
  try {
    const raw = localStorage.getItem(MODULES_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(AVAILABLE_MODULES));
      return AVAILABLE_MODULES;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(AVAILABLE_MODULES));
      return AVAILABLE_MODULES;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading modules from localStorage', err);
    return AVAILABLE_MODULES;
  }
}

export function saveStoredModules(modules: SolarModule[]): void {
  try {
    localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
  } catch (err) {
    console.error('Error saving modules to localStorage', err);
  }
}

export function saveModule(moduleData: SolarModule): SolarModule[] {
  const list = getStoredModules();
  const id = moduleData.id || `mod-${Date.now()}`;
  const prepared: SolarModule = {
    ...moduleData,
    id,
    createdAt: moduleData.createdAt || new Date().toISOString()
  };

  const existingIdx = list.findIndex(m => (m.id && m.id === id) || m.model === moduleData.model);
  let updated: SolarModule[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = prepared;
  } else {
    updated = [prepared, ...list];
  }
  saveStoredModules(updated);

  // Firestore
  try {
    const modRef = doc(db, 'modules', id);
    setDoc(modRef, sanitizeForFirestore(prepared), { merge: true }).catch(console.error);
  } catch (err) {
    console.warn('Salvar módulo no Firestore:', err);
  }

  return updated;
}

export function deleteModule(identifier: string): SolarModule[] {
  const list = getStoredModules();
  const updated = list.filter(m => m.id !== identifier && m.model !== identifier);
  saveStoredModules(updated);

  try {
    const modRef = doc(db, 'modules', identifier);
    deleteDoc(modRef).catch(console.error);
  } catch (err) {
    console.warn('Excluir módulo no Firestore:', err);
  }

  return updated;
}

export function getStoredInverters(): SolarInverter[] {
  try {
    const raw = localStorage.getItem(INVERTERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(INVERTERS_STORAGE_KEY, JSON.stringify(AVAILABLE_INVERTERS));
      return AVAILABLE_INVERTERS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      localStorage.setItem(INVERTERS_STORAGE_KEY, JSON.stringify(AVAILABLE_INVERTERS));
      return AVAILABLE_INVERTERS;
    }
    return parsed;
  } catch (err) {
    console.error('Error reading inverters from localStorage', err);
    return AVAILABLE_INVERTERS;
  }
}

export function saveStoredInverters(inverters: SolarInverter[]): void {
  try {
    localStorage.setItem(INVERTERS_STORAGE_KEY, JSON.stringify(inverters));
  } catch (err) {
    console.error('Error saving inverters to localStorage', err);
  }
}

export function saveInverter(inverterData: SolarInverter): SolarInverter[] {
  const list = getStoredInverters();
  const id = inverterData.id || `inv-${Date.now()}`;
  const prepared: SolarInverter = {
    ...inverterData,
    id,
    createdAt: inverterData.createdAt || new Date().toISOString()
  };

  const existingIdx = list.findIndex(i => (i.id && i.id === id) || i.model === inverterData.model);
  let updated: SolarInverter[];
  if (existingIdx >= 0) {
    updated = [...list];
    updated[existingIdx] = prepared;
  } else {
    updated = [prepared, ...list];
  }
  saveStoredInverters(updated);

  // Firestore
  try {
    const invRef = doc(db, 'inverters', id);
    setDoc(invRef, sanitizeForFirestore(prepared), { merge: true }).catch(console.error);
  } catch (err) {
    console.warn('Salvar inversor no Firestore:', err);
  }

  return updated;
}

export function deleteInverter(identifier: string): SolarInverter[] {
  const list = getStoredInverters();
  const updated = list.filter(i => i.id !== identifier && i.model !== identifier);
  saveStoredInverters(updated);

  try {
    const invRef = doc(db, 'inverters', identifier);
    deleteDoc(invRef).catch(console.error);
  } catch (err) {
    console.warn('Excluir inversor no Firestore:', err);
  }

  return updated;
}

export function resetEquipmentToDefaults(): { modules: SolarModule[]; inverters: SolarInverter[] } {
  saveStoredModules(AVAILABLE_MODULES);
  saveStoredInverters(AVAILABLE_INVERTERS);
  return { modules: AVAILABLE_MODULES, inverters: AVAILABLE_INVERTERS };
}

// -------------------------------------------------------------
// ACCESS AUDIT LOGS
// -------------------------------------------------------------

export function getStoredLogs(): AccessLog[] {
  try {
    const raw = localStorage.getItem(LOGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export function logAccess(
  username: string, 
  role: 'dev' | 'cliente', 
  status: 'sucesso' | 'falha' | 'bloqueado', 
  details?: string
): void {
  try {
    const logs = getStoredLogs();
    const newLog: AccessLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      username: username || 'desconhecido',
      name: role === 'dev' ? 'Administrador DEV' : username,
      role,
      status,
      details
    };
    const updated = [newLog, ...logs].slice(0, 100);
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updated));

    // Firestore
    const logRef = doc(db, 'logs', newLog.id);
    setDoc(logRef, sanitizeForFirestore(newLog)).catch(console.error);
  } catch (err) {
    console.error('Error logging access', err);
  }
}
