import * as firebase from "firebase/app";
import "firebase/auth";

const app = firebase.initializeApp({
  apiKey: "AIzaSyA6kUhKc8cJQm8za9GKk1RWU18K9TRCeqc",
  authDomain: "lucky7-engine.firebaseapp.com",
  databaseURL: "https://lucky7-engine.firebaseio.com",
  projectId: "lucky7-engine",
  storageBucket: "lucky7-engine.appspot.com",
  messagingSenderId: "740700148933",
  appId: "1:740700148933:web:6e420f2b85d007e64dccac",
  measurementId: "G-KYSM9GW1ZD",
});

export default app;
