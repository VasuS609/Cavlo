import firebase from "firebase/app";

import 'firebase/firestore';

// Import the functions you need from the SDKs you need

import { initializeApp } from "firebase/app";

import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {

apiKey: "AIzaSyDFh8D5mrZfwFSTngUWGcb99n0boswG1J4",
authDomain: "cavlo20.firebaseapp.com",
databaseURL: "https://cavlo20-default-rtdb.firebaseio.com",
projectId: "cavlo20",
storageBucket: "cavlo20.firebasestorage.app",
messagingSenderId: "976457677778",
appId: "1:976457677778:web:cd8d797675454357c8260b",
measurementId: "G-Q6N8VT129S"

};

// Initialize Firebase

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);