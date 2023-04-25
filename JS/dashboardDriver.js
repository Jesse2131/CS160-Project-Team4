let check1 = document.getElementById("checkImg1");
let dot1 = document.getElementById("dotImg1");
let driverImg = document.getElementById("driverImg");
let but1 = document.getElementById("confirmPickupButton");
let check2 = document.getElementById("checkImg2");
let dot2 = document.getElementById("dotImg2");
let completeImg = document.getElementById("completeImg");
let but2 = document.getElementById("confirmDeliveryButton");
let dashLink = document.getElementById("dashboardLink");

let status = "";

function confirmPickup() {
    if (confirm("You have picked up the order from the restaurant?")) {
        const curr_user = firebase.auth().currentUser;

        getUserType(curr_user.uid)
            .then(userType => {
                const userRef = db.collection(userType).doc(curr_user.uid);
                const updateObject = {};
                updateObject["status"] = "delivering";
                userRef.update(updateObject);
            });

        but1.classList.add('disabledButton');
        but2.classList.remove('disabledButton');

        check1.style.filter = "grayscale(0%)";
        dot1.style.filter = "grayscale(0%)";
        driverImg.style.filter = "grayscale(0%)";
    }
}

function confirmDelivery() {
    if (confirm("You have delivered the order to the customer?")) {
        const curr_user = firebase.auth().currentUser;

        getUserType(curr_user.uid)
            .then(userType => {
                const userRef = db.collection(userType).doc(curr_user.uid);
                const updateObject = {};
                updateObject["status"] = "online";
                userRef.update(updateObject);
            });

        but2.classList.add('disabledButton');

        check2.style.filter = "grayscale(0%)";
        dot2.style.filter = "grayscale(0%)";
        completeImg.style.filter = "grayscale(0%)";
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Set session storage
        sessionStorage.setItem("currentUser", user.uid);
        // Display account page info
        display_acc_name(user);
        setTimeout(function() {
            link_to_dashboard(user);
        }, 1000);
    } else {
        // No user is signed in.
        console.log('User is not signed in');
    }
});

function display_acc_name(user) {
    // Query db for additional data
    const checkUserType = db.collection('users').doc(user.uid);
    let retrievedUserType = "";
    checkUserType.get().then((doc) => {
        retrievedUserType = doc.data().type;

        const curr_user = db.collection(retrievedUserType).doc(user.uid);
        curr_user.get().then((doc) => {
            const retrievedName = doc.data().name;
            const retrievedStatus = doc.data().status;
            // Update account button to show currently logged in user
            document.getElementById("nav-logged-in-user").innerHTML = "Welcome " + retrievedName;
            status = retrievedStatus;
        });
    }).catch((error) => {
        console.log("Error getting user data:", error);
    });
}

function link_to_dashboard(user) {
    if (status === "offline") {
        document.getElementById("dashboardLink").href = "welcomeDashboardDriver.html";
    } else {
        document.getElementById("dashboardLink").href = "deliveryDashboardDriver.html";
    }
}



function driverOnline() {
    const curr_user = firebase.auth().currentUser;

    getUserType(curr_user.uid)
        .then(userType => {
            const userRef = db.collection(userType).doc(curr_user.uid);
            const updateObject = {};
            updateObject["status"] = "online";
            userRef.update(updateObject);
            setTimeout(function() {
                window.location.href = "../HTML/deliveryDashboardDriver.html";
            }, 300);
        });
}


