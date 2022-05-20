import firebase from "firebase";
import "firebase/database";

var firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID, 
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
 
  };

export default function firebaseClient() {
    if(!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig)
    }
}

export const firebaseDatabase = firebase.database;