import firebase from "firebase/compat/app";
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
const firebaseConfig = {
    apiKey: "AIzaSyDfOFDSRIZPg8jJpZi38YOcrhi7cwPIouk",
    authDomain: "otoparkoneri.firebaseapp.com",
    projectId: "otoparkoneri",
    storageBucket: "otoparkoneri.appspot.com",
    messagingSenderId: "288828839232",
    appId: "1:288828839232:web:3d8501d658ed2e8c5716a5",
    measurementId: "G-WMYRHJPHM9"
  };

  const firebaseApp= firebase.initializeApp(firebaseConfig);

  const db=firebaseApp.firestore();

  const auth=firebase.auth();

  const provider=new firebase.auth.GoogleAuthProvider();

  export default db;
  export {auth,provider};