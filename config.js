import firebase from 'firebase/compat/app'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
    apiKey: "AIzaSyCZWQZvpna_XIhtTzjTuf-BUwLO4M7BM2E",
    databaseURL: "https://voda-house-10049-default-rtdb.firebaseio.com/",
  };
  
  const app = firebase.initializeApp(firebaseConfig);
  
  const db = getDatabase(app);

  export { db };