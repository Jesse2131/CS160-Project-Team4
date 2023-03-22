firebase.initializeApp(firebaseConfig);
firebase.analytics();

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

    // Create user 
    var creation = firebase.auth().createUserWithEmailAndPassword(email, password); 

    // Check for errors 
    creation.catch(function (error) {
        var errorCode = error.code;
        document.getElementById("errormsg").innerHTML = error.message;
    });

    // Continue if no errors
    creation.then(function () {
        // var userUid = auth.currentUser.uid;
        addToDB();
    });
}

function addToDB() {
  // get the database
  const db = firebase.firestore(); 
  // Get current user 
  var userUid = firebase.auth().currentUser.uid;
  // add to the correct collection 
  var fileName = location.pathname.split("/").slice(-1)
  var col_name = " ";
  if (fileName === "cust_login.html"){
    col_name = "customers";
  }
  else if(fileName === "rest_login.html"){
    col_name = "restaraunts";
  }
  else{
    col_name = "drivers";
  }
  var col = db.collection(col_name);
  console.log(col_name); 

  // col.doc(userUid).set({
  //   first_name: "test",
  //   last_name: "test last", 
  //   address: "tesst addy"
  // }).then((docRef) => {
  //   console.log("Success");
  //   // Redirect to main page 
  //   window.location.href = "index.html"; 
  // }).catch((error) => {
  //   console.error(error);
  // });
}

