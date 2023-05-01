let check1 = document.getElementById("checkImg1");
let dot1 = document.getElementById("dotImg1");
let driverImg = document.getElementById("driverImg");
let but1 = document.getElementById("confirmPickupButton");
let check2 = document.getElementById("checkImg2");
let dot2 = document.getElementById("dotImg2");
let completeImg = document.getElementById("completeImg");
let but2 = document.getElementById("confirmDeliveryButton");
let dashLink = document.getElementById("dashboardLink");
let order1 = document.getElementById("order1");
let order1name = document.getElementById("order1name");
let order2 = document.getElementById("order2");
let order2name = document.getElementById("order2name");

let status = "";
let currOrder1 = "";
let currOrder2 = "";

var map;
var directionsService;
var directionsRenderer;
var distanceService;
var geocoder;


const database = firebase.database();

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

        if (currOrder1 !== "none") {
            var ref = firebase.database().ref('Orders/' + currOrder1);
            var updates = {};
            updates['/status'] = "on the way";

            ref.update(updates);
        }
        if (currOrder2 !== "none") {
            var ref2 = firebase.database().ref('Orders/' + currOrder2);
            var updates2 = {};
            updates2['/status'] = "on the way";

            ref2.update(updates2);
        }

        but1.classList.add('disabledButton');
        but2.classList.remove('disabledButton');

        check1.style.filter = "grayscale(0%)";
        dot1.style.filter = "grayscale(0%)";
        driverImg.style.filter = "grayscale(0%)";
    }
}

function confirmDelivery() {
    if (confirm("You have delivered the 1st order to the customer?")) {
        const curr_user = firebase.auth().currentUser;

        getUserType(curr_user.uid)
            .then(userType => {
                const userRef = db.collection(userType).doc(curr_user.uid);
                const updateObject = {};
                if (currOrder2 === "none") {
                    updateObject["status"] = "online";
                    updateObject["order1"] = "none";
                    userRef.update(updateObject);
                    currOrder1 = "none";
                    but2.classList.add('disabledButton');

                    check2.style.filter = "grayscale(0%)";
                    dot2.style.filter = "grayscale(0%)";
                    completeImg.style.filter = "grayscale(0%)";
                } else {
                    updateObject["order1"] = currOrder2;
                    updateObject["order2"] = "none";
                    userRef.update(updateObject);
                    currOrder1 = currOrder2;
                    currOrder2 = "none";
                }
            });

        if (currOrder1 !== "none") {
            var ref = firebase.database().ref('Orders/' + currOrder1);
            var updates = {};
            updates['/status'] = "delivered";

            ref.update(updates);
        }

        setTimeout(function() {
            display_curr_orders();
        }, 500);
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Set session storage
        sessionStorage.setItem("currentUser", user.uid);
        // Display account page info
        display_user_info(user);
        setTimeout(function() {
            link_to_dashboard();
            if (status !== "offline") {
                display_curr_orders();
            }
        }, 800);

    } else {
        // No user is signed in.
        console.log('User is not signed in');
    }
});

function display_user_info(user) {
    // Query db for additional data
    const checkUserType = db.collection('users').doc(user.uid);
    let retrievedUserType = "";
    checkUserType.get().then((doc) => {
        retrievedUserType = doc.data().type;

        const curr_user = db.collection(retrievedUserType).doc(user.uid);
        curr_user.get().then((doc) => {
            const retrievedName = doc.data().name;
            const retrievedStatus = doc.data().status;
            const retrievedOrder1 = doc.data().order1;
            const retrievedOrder2 = doc.data().order2;
            // Update account button to show currently logged in user
            document.getElementById("nav-logged-in-user").innerHTML = "Welcome " + retrievedName;
            if (retrievedStatus === "delivering") {
                but1.classList.add('disabledButton');
                but2.classList.remove('disabledButton');

                check1.style.filter = "grayscale(0%)";
                dot1.style.filter = "grayscale(0%)";
                driverImg.style.filter = "grayscale(0%)";
            }
            status = retrievedStatus;
            currOrder1 = retrievedOrder1;
            currOrder2 = retrievedOrder2;
        });
    }).catch((error) => {
        console.log("Error getting user data:", error);
    });
}

function link_to_dashboard() {
    if (status === "offline") {
        dashLink.href = "welcomeDashboardDriver.html";
    } else {
        dashLink.href = "deliveryDashboardDriver.html";
    }
}

function display_curr_orders() {
    if (currOrder1 !== "none") {
        var ref = firebase.database().ref('Orders/' + currOrder1);
        ref.once('value').then((snapshot) => {
            order1.style.display = 'block';
            var retrievedRestName = (snapshot.val() && snapshot.val().restaurant_name) || 'none';
            var retrievedTime = (snapshot.val() && snapshot.val().total_miles) || 'none';
            order1name.innerHTML = retrievedRestName + " - Order 1" + "<span id='minuteText'>" + retrievedTime + " Min</span>";
        }, {
            onlyOnce: false
        });
    } else {
        order1.style.display = 'block';
        order1.innerHTML = "<h1 id='order1Name'>You have no current orders to fulfill!</h1>";
    }

    if (currOrder2 !== "none") {
        var ref2 = firebase.database().ref('Orders/' + currOrder2);
        ref2.once('value').then((snapshot) => {
            order2.style.display = 'block';
            var retrievedRestName = (snapshot.val() && snapshot.val().restaurant_name) || 'none';
            order2name.innerHTML = retrievedRestName + " - Order 2";
        }, {
            onlyOnce: false
        });
    } else {
        order2.style.display = 'none';
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
                window.location.href = "../deliveryDashboardDriver.html";
            }, 300);
        });
}

var myStyles = [
    {
        featureType: "poi",
        stylers: [{ visibility: "off" }]
    },
    {
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }]
    }
];

function initMap() {
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true,
    });
    distanceService = new google.maps.DistanceMatrixService();
    map = new google.maps.Map(
        document.getElementById("map"),
        {
            zoom: 11,
            center: { lat: 37.33956562562412, lng: -121.89712826599812 },
            style: myStyles,
        }
    );
    directionsRenderer.setMap(map);
}

window.initMap = initMap;