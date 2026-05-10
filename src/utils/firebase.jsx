import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDNImTX-E1CGfjnYe7RQce4qmnZZGyh6uo",
  authDomain: "webquiz-6a879.firebaseapp.com",
  projectId: "webquiz-6a879",
  storageBucket: "webquiz-6a879.firebasestorage.app",
  messagingSenderId: "745987209228",
  appId: "1:745987209228:web:6264743a57e9d6536ed629",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
