firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Display account page info 
        display_acc_info(user);
    } else {
      // No user is signed in.
      console.log('User is not signed in');
    }
});

function display_acc_info(user) {
    // Email is given
    if(document.getElementById("email") !== null){
        document.getElementById("email").placeholder = user.email;
    }

    // Query db for additional data
    const checkUserType = db.collection('users').doc(user.uid);
    let retrievedUserType = "";
    checkUserType.get().then((doc) => {
        retrievedUserType = doc.data().type;
        if(document.getElementById("acc_type") !== null){
            document.getElementById("acc_type").placeholder = retrievedUserType;
        }

        const curr_user = db.collection(retrievedUserType).doc(user.uid);
        curr_user.get().then((doc) => {
            const retrievedName = doc.data().name;
            const retrievedAddress = doc.data().address;
            // Update account button to show currently logged in user        
            document.getElementById("nav-logged-in-user").innerHTML = "Welcome " + retrievedName;
            localStorage.setItem("userName", retrievedName);
            if(document.getElementById("username") !== null && document.getElementById("address") !== null){
                document.getElementById("username").placeholder = retrievedName;
                document.getElementById("address").placeholder = retrievedAddress;
            }

            const retrievedStatus = doc.data().status;
            if (retrievedUserType === "drivers" && retrievedStatus === "offline") {
                document.getElementById("dashboardLink").href = "welcomeDashboardDriver.html";
            } else if (retrievedUserType === "drivers") {
                document.getElementById("dashboardLink").href = "deliveryDashboardDriver.html";
            }
        });
    }).catch((error) => {
        console.log("Error getting user data:", error);
    });
}