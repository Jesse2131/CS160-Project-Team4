firebase.initializeApp(firebaseConfig);
firebase.analytics();

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Get logged in user and their type
      const curr_user = firebase.auth().currentUser.uid; 
      getUserType(curr_user).then((user_type) => {
        // Redirect to correct dashboard
        if(user_type === 'customers'){
          console.log('customer');
          // window.location.href = 'index.html';
        }
        else if(user_type === 'drivers'){
          console.log('driver');
          // window.location.href = "../../driver/driver-user-interface/driver-dashboard.html";
        }
        else{
          console.log('restaurants');
          // window.location.href = "../../restaurantDash.html";
        }
      }).catch((error) => {
        console.log("Error getting user type:", error);
      });
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
      document.getElementById("errormsg").innerHTML = error.message;
    });
}

function signup() {
    const user_type = document.getElementById("user-type").value
    console.log(user_type)
    if(user_type != ""){
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
          addToDB(user_type, email);
      });
    }
    else{
      document.getElementById("errormsg").innerHTML = "Please select a user type";
    }
}

function addToDB(...params) {
  // get the database
  const db = firebase.firestore(); 
  // Get current user and their type 
  var userUid = firebase.auth().currentUser.uid;
  // unpack params 
  const [user_type, email] = params
  // Add to users collection and corresponding collecion
  var col = db.collection(user_type);
  Promise.all([
    db.collection("users").doc(userUid).set({
        id: userUid,
        type: user_type
    }),
    col.doc(userUid).set({
        email: email,
        name: "test", 
        address: "test"
    })
  ])
  .then(() => {
      console.log("Success");
      // Redirect to main page 
      window.location.href = "index.html"; 
  })
  .catch((error) => {
      console.error(error);
  });
}

function getUserType(id){
  const users = firebase.firestore().collection("users");
  return users.where("id", "==", id).get()
    .then((querySnapshot) => {
      let userType = "";
      querySnapshot.forEach((doc) => {
        userType = doc.data().type;
      });
      return userType;
    })
    .catch((error) => {
      console.log("Error getting user data:", error);
      return "";
    });
}


