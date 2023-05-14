// Any replication code can go in here

// Set up the database and database variabes
firebase.initializeApp(firebaseConfig);
firebase.analytics();

// get the database
const db = firebase.firestore(); 
const real_db = firebase.database();



