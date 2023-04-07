firebase.initializeApp(firebaseConfig);
firebase.analytics();

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Redirect to the correct dashboard 
      var user_type = document.getElementById('user-type').value;
      console.log(user_type);
      if(user_type === 'customers'){
        window.location.href = 'index.html';
      }
      else if(user_type === 'driver'){
        window.location.href = "../../driver/driver-user-interface/driver-dashboard.html";
      }
      else{
        window.location.href = "../../restaurantDash.html";
      }
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
        addToDB();
    });
}

function addToDB() {
  // get the database
  const db = firebase.firestore(); 
  // Get current user and their type 
  var userUid = firebase.auth().currentUser.uid;
  var user_type = document.getElementById('user-type').value;
  // Add to correct collection
  var col = db.collection(user_type);

  col.doc(userUid).set({
    first_name: "test",
    last_name: "test last", 
    address: "tesst addy"
  }).then((docRef) => {
    console.log("Success");
    // Redirect to main page 
    window.location.href = "index.html"; 
  }).catch((error) => {
    console.error(error);
  });
}

