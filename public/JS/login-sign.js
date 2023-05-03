function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {

      // Get logged in user and their type
      const curr_user = firebase.auth().currentUser.uid;
      getUserType(curr_user).then((user_type) => {

        // Store user type in local storage
        localStorage.setItem("userType", user_type);

        // Redirect to correct dashboard
        if (user_type === 'customers') {
          console.log('customer');
          window.location.href = 'customerDash.html';
        }
        else if (user_type === 'drivers') {
          console.log('driver');
          window.location.href = "welcomeDashboardDriver.html";
          // sessionStorage.setItem("currentUser", curr_user);
        }
        else {
          console.log('restaurants');
          window.location.href = "restaurantDash.html";
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
  if (user_type != "") {
    const email = document.getElementById('email').value.toLowerCase();
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;

    // Create user 
    var creation = firebase.auth().createUserWithEmailAndPassword(email, password);

    // Check for errors 
    creation.catch(function (error) {
      var errorCode = error.code;
      document.getElementById("errormsg").innerHTML = error.message;
    });

    // Continue if no errors
    creation.then(function () {
      addToDB(user_type, email, name, address);
    });
  }
  else {
    document.getElementById("errormsg").innerHTML = "Please select a user type";
  }
}


function logout() {
  const curr_user = firebase.auth().currentUser;
  firebase.auth().signOut().then(() => {
    // Set status to offline
    getUserType(curr_user.uid)
      .then(userType => {
        const userRef = db.collection(userType).doc(curr_user.uid);
        const updateObject = {};
        updateObject["status"] = "offline";
        if (userType === "drivers") {
          userRef.get().then((doc) => {
            const retrievedAddress = doc.data().address;
            const retrievedOrder1 = doc.data().order1;
            if (retrievedOrder1 === "none") {
              updateObject["currentLocation"] = retrievedAddress;
            }
          });
        }
        setTimeout(function () {
          userRef.update(updateObject)
            .then(() => {
              document.getElementById("errormsg").innerHTML = "Changes saved successfully";
            })
            .catch((error) => {
              document.getElementById("errormsg").innerHTML = error;
            });
        }, 300)

        setTimeout(function () {
          window.location.href = "index.html";
        }, 600);
      });
  }).catch((error) => {
    // Handle errors here
    console.error(error);
  });
}

function addToDB(...params) {
  // Get current user and their type 
  var userUid = firebase.auth().currentUser.uid;
  // unpack params 
  const [user_type, email, name, address] = params
  // Add to users collection and corresponding collecion
  var col = db.collection(user_type);

  // Add to realtime if user is a driver 
  if (user_type === "drivers") {
    console.log("ADDING TO REALTIME");
    real_db.ref(`drivers/${userUid}`).set({
      email: email,
      name: name,
      address: address,
      status: "offline"
    })
  }

  Promise.all([
    db.collection("users").doc(userUid).set({
      id: userUid,
      type: user_type
    }),
    col.doc(userUid).set({
        email: email,
        name: name,
        address: address,
        status: "offline",
        ...(user_type === "drivers" && {
          currentLocation: address,
          order1: "none",
          order2: "none"
      }),
    })
  ])
    .then(() => {
      console.log("Success");

      // Redirect to appropriate dashboard
      if (user_type === 'customers') {
        console.log('customer');
        window.location.href = 'customerDash.html';
      }
      else if (user_type === 'drivers') {
        console.log('driver');
        window.location.href = "welcomeDashboardDriver.html";
        // sessionStorage.setItem("currentUser", curr_user);
      }
      else {
        console.log('restaurants');
        window.location.href = "restaurantDash.html";
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function getUserType(id) {
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

// When a user clicks on dashboard from the account page it will go to the correct on
function goToDash(){
  const curr_user = firebase.auth().currentUser.uid; 
  getUserType(curr_user).then((user_type) => {
    // Redirect to correct dashboard
    if(user_type === 'customers'){
      window.location.href = 'customerDash.html';
    }
    else if(user_type === 'drivers'){
      // Check offline or online status 
      const docRef = db.collection('drivers').doc(curr_user);
      docRef.get().then((doc) => {
        if (doc.exists) {
          const status = doc.data().status;
          if(status === "online"){
            window.location.href = "deliveryDashboardDriver.html";
          }
          else{
            window.location.href = "welcomeDashboardDriver.html";
          }
        } else {
          console.log('No such document!');
        }
      }).catch((error) => {
        console.log('Error getting document:', error);
      });
    }
    else{
      window.location.href = "restaurantDash.html";
    }
  }).catch((error) => {
    console.log("Error getting user type:", error);
  });
}


// function disablePages(){
//   const curr_user = firebase.auth().currentUser;
//   getUserType(curr_user.uid)
//     .then(userType => {
//       console.log(userType); 
//       if(userType === "driver"){
//         // disable others
//       }
//       else if()
//   });
// }

