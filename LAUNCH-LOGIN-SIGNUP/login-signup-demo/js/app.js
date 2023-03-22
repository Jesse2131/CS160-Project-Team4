firebase.initializeApp(firebaseConfig);
firebase.analytics();
// get the database
const db = firebase.firestore(); 
// get the 3 collections
const drivers = db.collection('drivers'); 

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);
      // Redirect to dashboard or home page
      window.location.href = 'index.html';
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
      document.getElementById("errormsg").innerHTML = error.message;
    });
}

function signup() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        // User signed up successfully
        console.log(userCredential);
        // Add user to DB 
        addToDB(); 
        // Redirect to login page or do other actions
        window.location.href = 'index.html';
      })
      .catch(error => {
        // Handle errors here
        document.getElementById("errormsg").innerHTML = error.message;
    });
}

function addToDB() {
  // Add user to correct database collection
  var userId = firebase.auth().currentUser.uid;
  drivers.add({
    first_name: "test",
    last_name: "test last", 
    address: "tesst addy"
  }).then((docRef) => {
    console.log("Success");
  }).catch((error) => {
    console.error("error");
  });
}

