import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // Adicione esta linha

const firebaseConfig = {
  apiKey: "AIzaSyAoKBj3nhNDVwWTGEVlBx2jsJA6_aZDdQ4",
  authDomain: "caminhoes-93c04.firebaseapp.com",
  projectId: "caminhoes-93c04",
  storageBucket: "caminhoes-93c04.firebasestorage.app",
  messagingSenderId: "698071916962",
  appId: "1:698071916962:web:068a59ca5dff8fa2ab92fb"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Inicializa o Firestore
const db = getFirestore(app);

export { db };