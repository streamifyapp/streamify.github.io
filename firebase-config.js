// Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR FIREBASE API KEY HERE",
  authDomain: "FIREBASE DOMAIN URL",
  databaseURL: "DATABASE URL",
  projectId: "YOUR PROJECT IT HERE",
  storageBucket: "STORAGE URL HERE",
  messagingSenderId: "37854973622",
  appId: "FIREBASE APP ID HERE",
  measurementId: "G-FRJXCHF320"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
