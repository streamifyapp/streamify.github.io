// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGE29YUks6sp4jZS4MzE2JIMF-RMLwVLg",
  authDomain: "moddy-store.firebaseapp.com",
  databaseURL: "https://moddy-store-default-rtdb.firebaseio.com",
  projectId: "moddy-store",
  storageBucket: "moddy-store.appspot.com",
  messagingSenderId: "37854973622",
  appId: "1:37854973622:web:8f927e0a1d267d099ca017",
  measurementId: "G-FRJXCHF320"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
