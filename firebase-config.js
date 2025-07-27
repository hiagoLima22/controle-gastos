import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDYm97mMo_5LL1iHaIlqaPEkzl79TQBDmA",
  authDomain: "controle-gastos-9fab2.firebaseapp.com",
  projectId: "controle-gastos-9fab2",
  storageBucket: "controle-gastos-9fab2.firebasestorage.app",
  messagingSenderId: "535575893848",
  appId: "1:535575893848:web:4612a02e2bfb4f4362b72d"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);