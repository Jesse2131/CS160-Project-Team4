let allInfo = document.getElementsByClassName("accInfoContainer");
let but1 = document.getElementById("accInfoButton1");
let but2 = document.getElementById("accInfoButton2");
let but3 = document.getElementById("accInfoButton3");
let but4 = document.getElementById("accInfoButton4");
const db = firebase.firestore();

function viewAccDet() {
    let newView = document.getElementById("accountDetails");
    for (var i = 0; i < allInfo.length; i++) {
        allInfo[i].style.display = "none";
    }
    newView.style.display = "block";

    but2.classList.add('deselectedButton');
    but2.classList.remove('selectedButton');
    but3.classList.add('deselectedButton');
    but3.classList.remove('selectedButton');
    but4.classList.add('deselectedButton');
    but4.classList.remove('selectedButton');

    but1.classList.add('selectedButton');
    but1.classList.remove('deselectedButton');
}

function viewAddrInfo() {
    let newView = document.getElementById("addressInformation");
    for (var i = 0; i < allInfo.length; i++) {
        allInfo[i].style.display = "none";
    }
    newView.style.display = "block";

    but1.classList.add('deselectedButton');
    but1.classList.remove('selectedButton');
    but3.classList.add('deselectedButton');
    but3.classList.remove('selectedButton');
    but4.classList.add('deselectedButton');
    but4.classList.remove('selectedButton');

    but2.classList.add('selectedButton');
    but2.classList.remove('deselectedButton');
}

function viewPayInfo() {
    let newView = document.getElementById("paymentInformation");
    for (var i = 0; i < allInfo.length; i++) {
        allInfo[i].style.display = "none";
    }
    newView.style.display = "block";

    but1.classList.add('deselectedButton');
    but1.classList.remove('selectedButton');
    but2.classList.add('deselectedButton');
    but2.classList.remove('selectedButton');
    but4.classList.add('deselectedButton');
    but4.classList.remove('selectedButton');

    but3.classList.add('selectedButton');
    but3.classList.remove('deselectedButton');
}

function viewOrdrHist() {
    let newView = document.getElementById("orderHistory");
    for (var i = 0; i < allInfo.length; i++) {
        allInfo[i].style.display = "none";
    }
    newView.style.display = "block";

    but1.classList.add('deselectedButton');
    but1.classList.remove('selectedButton');
    but2.classList.add('deselectedButton');
    but2.classList.remove('selectedButton');
    but3.classList.add('deselectedButton');
    but3.classList.remove('selectedButton');

    but4.classList.add('selectedButton');
    but4.classList.remove('deselectedButton');
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Set session storage
        sessionStorage.setItem("currentUser", user.uid);
        // Display account page info 
        display_acc_info(user);
    } else {
      // No user is signed in.
      console.log('User is not signed in');
    }
});

function display_acc_info(user) {
    // Email is given
    document.getElementById("email").placeholder = user.email;
    // Query db for additional data
    const checkUserType = db.collection('users').doc(user.uid);
    let retrievedUserType = "";
    checkUserType.get().then((doc) => {
        retrievedUserType = doc.data().type;
        document.getElementById("acc_type").placeholder = retrievedUserType;

        const curr_user = db.collection(retrievedUserType).doc(user.uid);
        curr_user.get().then((doc) => {
            const retrievedName = doc.data().name;
            const retrievedAddress = doc.data().address;
            document.getElementById("username").placeholder = retrievedName;
            document.getElementById("address").placeholder = retrievedAddress;
            // Update account button to show currently logged in user        
            document.getElementById("nav-logged-in-user").innerHTML = retrievedName + " - Account";
        });
    }).catch((error) => {
        console.log("Error getting user data:", error);
    });
}

function updateInfo() {
    const curr_user = firebase.auth().currentUser;
    const curr_user_id = curr_user.uid;
    // Text fields
    const usernameField = document.getElementById("username").value;
    const emailField = document.getElementById("email").value;

    if (emailField !== "") {
        curr_user.updateEmail(emailField)
        .then(() => {
            document.getElementById("errormsg").innerHTML = "Changes saved successfully";
        }).catch((error) => {
            document.getElementById("errormsg").innerHTML = error;
        });
    }
    else if(usernameField !== ""){
        getUserType(curr_user.uid)
        .then(userType => {
            const userRef = db.collection(userType).doc(curr_user.uid);
            updateAttribute(userRef, "name", usernameField);
        });
    }
    // TODO: 
    // Add code for address update 
}

// For email reset
document.getElementById("reset-password-link").addEventListener("click", function(event) {
    // Prevent the link from navigating to a new page
    event.preventDefault(); 
    resetPassword();
});

function resetPassword() {
    const curr_user_email = firebase.auth().currentUser.email;
    firebase.auth().sendPasswordResetEmail(curr_user_email).then(function() {
      // Password reset email sent.
      document.getElementById("errormsg").innerHTML = "An email as been sent to you to reset your password";
    }).catch(function(error) {
      document.getElementById("errormsg").innerHTML = error;
    });
}

// Function to query the DB
function updateAttribute(userRef, attribute, updatedValue) {
    const updateObject = {};
    updateObject[attribute] = updatedValue;
  
    userRef.update(updateObject)
    .then(() => {
        document.getElementById("errormsg").innerHTML = "Changes saved successfully";
    })
    .catch((error) => {
        document.getElementById("errormsg").innerHTML = error;
    });
}
