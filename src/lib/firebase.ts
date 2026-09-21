import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Conecta ao banco de dados Firestore especificado na configuração
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);
export const auth = getAuth(app);

export default app;
