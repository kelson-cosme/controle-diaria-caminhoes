import { initializeApp } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxpf2UdUJ6SxjLapIP-LdDK-AkTA7ounE",
  authDomain: "equipamentos-pablo.firebaseapp.com",
  projectId: "equipamentos-pablo",
  storageBucket: "equipamentos-pablo.firebasestorage.app",
  messagingSenderId: "462948688329",
  appId: "1:462948688329:web:31aa6ff08b4d351f3fc818"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };