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
let requestText1 = document.getElementById("requestText1");
let requestText2 = document.getElementById("requestText2");

let currStatus = "";
let currOrder1 = "";
let currOrder2 = "";
let currLocation = "";
let currRestLocation = "";
let currCustLocation1 = "";
let currCustLocation2 = "";
let address = "";

var map;
var directionsService;
var directionsRenderer;
var distanceService;
var geocoder;

var currDriverLatLng = { lat:0, lng:0};
var currRestLatLng = { lat:0, lng:0};
var currCustLatLng1 = { lat:0, lng:0};
var currCustLatLng2 = { lat:0, lng:0};
var markers = [];


const database = firebase.database();

function confirmPickup() {
    if (confirm("You have picked up the order from the restaurant?")) {
        const curr_user = firebase.auth().currentUser;

        getUserType(curr_user.uid)
            .then(userType => {
                const userRef = db.collection(userType).doc(curr_user.uid);
                const updateObject = {};
                updateObject["status"] = "delivering";
                currStatus = "delivering";
                markers[0].setMap(null);
                markers[1].setMap(null);
                currLocation = currRestLocation;
                updateObject["currentLocation"] = currRestLocation;
                userRef.update(updateObject);
            });

        if (currOrder1 !== "none") {
            var ref = firebase.database().ref('AcceptedOrders/' + currOrder1);
            var updates = {};
            updates['/status'] = "on the way";

            ref.update(updates);
        }
        if (currOrder2 !== "none") {
            var ref2 = firebase.database().ref('AcceptedOrders/' + currOrder2);
            var updates2 = {};
            updates2['/status'] = "on the way";

            ref2.update(updates2);
        }

        setTimeout(function() {
            displayDriver();
            setTimeout(function() {
                drawRoute();
            }, 800);
        }, 600);

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
                    markers[0].setMap(null);
                    markers[2].setMap(null);
                    if (markers.length === 4) {
                        markers[3].setMap(null);
                        currLocation = currCustLocation2;
                        updateObject["currentLocation"] = currCustLocation2;
                    } else {
                        currLocation = currCustLocation1;
                        updateObject["currentLocation"] = currCustLocation1;
                    }
                    userRef.update(updateObject);

                    setTimeout(function() {
                        displayDriver();
                        directionsRenderer.setMap(null);
                    }, 600);

                    currOrder1 = "none";
                    but2.classList.add('disabledButton');

                    check2.style.filter = "grayscale(0%)";
                    dot2.style.filter = "grayscale(0%)";
                    completeImg.style.filter = "grayscale(0%)";
                } else {
                    updateObject["order1"] = currOrder2;
                    updateObject["order2"] = "none";
                    markers[0].setMap(null);
                    markers[2].setMap(null);
                    currLocation = currCustLocation1;
                    updateObject["currentLocation"] = currCustLocation1;
                    userRef.update(updateObject);
                    currOrder1 = currOrder2;
                    currOrder2 = "none";

                    setTimeout(function() {
                        displayDriver();
                        setTimeout(function() {
                            drawRoute();
                        }, 800);
                    }, 600);
                }
            });

        if (currOrder1 !== "none") {
            var ref = firebase.database().ref('AcceptedOrders/' + currOrder1);
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
            if (currStatus !== "offline") {
                display_curr_orders();
                displayDriver();
                displayRestaurant();
            }
            if (currOrder1 !== "none") {
                displayCustomer(currOrder1);
            }
            if (currOrder2 !== "none") {
                displayCustomer(currOrder2);
            }
            setTimeout(function() {
                if (currStatus === "delivering") {
                    markers[1].setMap(null);
                }
            }, 600);
            setTimeout(function() {
                drawRoute();
            }, 1000);
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
            const retrievedAddress = doc.data().address;
            const retrievedLocation = doc.data().currentLocation;
            // Update account button to show currently logged in user
            document.getElementById("nav-logged-in-user").innerHTML = "Welcome " + retrievedName;
            if (retrievedOrder1 !== "none") {
                but1.classList.remove('disabledButton');
            }
            if (retrievedStatus === "delivering") {
                but1.classList.add('disabledButton');
                but2.classList.remove('disabledButton');

                check1.style.filter = "grayscale(0%)";
                dot1.style.filter = "grayscale(0%)";
                driverImg.style.filter = "grayscale(0%)";
            }

            currStatus = retrievedStatus;
            currOrder1 = retrievedOrder1;
            currOrder2 = retrievedOrder2;
            address = retrievedAddress;
            currLocation = retrievedLocation;
        });
    }).catch((error) => {
        console.log("Error getting user data:", error);
    });
}

function link_to_dashboard() {
    console.log("CHANGING DASHBOARD LINK " + currStatus); 
    if (currStatus === "offline") {
        dashLink.href = "welcomeDashboardDriver.html";
    } else {
        dashLink.href = "deliveryDashboardDriver.html";
    }
}

function display_curr_orders() {
    if (currOrder1 !== "none") {
        var ref = firebase.database().ref('AcceptedOrders/' + currOrder1);
        ref.once('value').then((snapshot) => {
            order1.style.display = 'block';
            var retrievedOrderID = (snapshot.val() && snapshot.val().orderID) || 'none';
            var retrievedTime = (snapshot.val() && snapshot.val().duration) || 'none';
            var orderRef = firebase.database().ref('Orders/' + retrievedOrderID);
            orderRef.once('value').then((snapshot2 => {
                var retrievedRestName = (snapshot2.val() && snapshot2.val().restaurant_name) || 'none';
                var retrievedSpecialReq = (snapshot2.val() && snapshot2.val().special_request) || 'none';
                order1name.innerHTML = retrievedRestName + " - Order 1" + "<span id='minuteText'>" + retrievedTime + " Min</span>";
                requestText1.innerHTML = retrievedSpecialReq;
            }));
        }, {
            onlyOnce: false
        });
    } else {
        order1.style.display = 'block';
        order1.innerHTML = "<h1 id='order1Name'>You have no current orders to fulfill!</h1>";
    }

    if (currOrder2 !== "none") {
        var ref2 = firebase.database().ref('AcceptedOrders/' + currOrder2);
        ref2.once('value').then((snapshot) => {
            order2.style.display = 'block';
            var retrievedOrderID = (snapshot.val() && snapshot.val().orderID) || 'none';
            var orderRef = firebase.database().ref('Orders/' + retrievedOrderID);
            orderRef.once('value').then((snapshot2 => {
                var retrievedRestName = (snapshot2.val() && snapshot2.val().restaurant_name) || 'none';
                var retrievedSpecialReq = (snapshot2.val() && snapshot2.val().special_request) || 'none';
                order2name.innerHTML = retrievedRestName + " - Order 2";
                requestText2.innerHTML = retrievedSpecialReq;
            }));
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

function displayDriver() {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode( { 'address': currLocation}, function(results, status) {
        if (status === google.maps.GeocoderStatus.OK)
        {
            const lat = results[0].geometry.location.lat();
            const lng = results[0].geometry.location.lng();
            currDriverLatLng = { lat:lat, lng:lng };

            const driverMarker = new google.maps.Marker({
                position: currDriverLatLng,
                map,
                icon: "../ASSETS/driver-dashboard/driverMarker.png",
            });
            markers[0] = driverMarker;
            driverMarker.setMap(map);
        }
    });
}

function displayRestaurant() {
    if (currOrder1 !== "none") {
        var ref = firebase.database().ref('AcceptedOrders/' + currOrder1);
        ref.once('value').then((snapshot) => {
            var retrievedRestID = (snapshot.val() && snapshot.val().from) || 'none';
            var restRef = firebase.database().ref('restaurants/' + retrievedRestID);
            restRef.once('value').then((snapshot2 => {
                var retrievedRestAddress = (snapshot2.val() && snapshot2.val().address) || 'none';
                currRestLocation = retrievedRestAddress;

                var geocoder = new google.maps.Geocoder();
                geocoder.geocode( { 'address': retrievedRestAddress}, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK)
                    {
                        const lat = results[0].geometry.location.lat();
                        const lng = results[0].geometry.location.lng();
                        currRestLatLng = { lat:lat, lng:lng };

                        const restaurantMarker = new google.maps.Marker({
                            position: currRestLatLng,
                            map,
                            icon: "../ASSETS/driver-dashboard/restaurantMarker.png",
                        });
                        markers[1] = restaurantMarker;
                        restaurantMarker.setMap(map);
                    }
                });
            }));
        }, {
            onlyOnce: false
        });
    }
}

function displayCustomer(orderID) {
    var ref = firebase.database().ref('AcceptedOrders/' + orderID);
    ref.once('value').then((snapshot) => {
        var retrievedCustID = (snapshot.val() && snapshot.val().to) || 'none';
        var custRef = firebase.database().ref('customers/' + retrievedCustID);
        custRef.once('value').then((snapshot2 => {
            var retrievedCustAddress = (snapshot2.val() && snapshot2.val().address) || 'none';
            var geocoder = new google.maps.Geocoder();
            geocoder.geocode( { 'address': retrievedCustAddress}, function(results, status) {
                if (status === google.maps.GeocoderStatus.OK)
                {
                    const lat = results[0].geometry.location.lat();
                    const lng = results[0].geometry.location.lng();
                    const customerLatLng = { lat:lat, lng:lng };

                    const customerMarker = new google.maps.Marker({
                        position: customerLatLng,
                        map,
                        icon: "../ASSETS/driver-dashboard/customerMarker.png",
                    });

                    if (orderID === currOrder1) {
                        currCustLatLng1 = { lat:lat, lng:lng};
                        currCustLocation1 = retrievedCustAddress;
                        markers[2] = customerMarker;
                    } else {
                        currCustLatLng2 = { lat:lat, lng:lng};
                        currCustLocation2 = retrievedCustAddress
                        markers[3] = customerMarker;
                    }

                    customerMarker.setMap(map);
                }
            });
        }));
    }, {
        onlyOnce: false
    });
}

function drawRoute() {
    directionsRenderer.setDirections({ routes: [] });
    const driverLocation = new google.maps.LatLng(currDriverLatLng.lat, currDriverLatLng.lng);
    var waypoints;
    var deliveryLocation;
    if (currStatus === "delivering" && currOrder2 !== "none") {
        waypoints = [
            { location: new google.maps.LatLng(currCustLatLng1.lat, currCustLatLng1.lng), stopover: true }
        ];
        deliveryLocation = currCustLatLng2;
    } else if (currStatus === "delivering") {
        waypoints = [];
        deliveryLocation = currCustLatLng1;
    } else if (currOrder2 !== "none") {
        waypoints = [
            { location: new google.maps.LatLng(currRestLatLng.lat, currRestLatLng.lng), stopover: true },
            { location: new google.maps.LatLng(currCustLatLng1.lat, currCustLatLng1.lng), stopover: true }
        ];
        deliveryLocation = currCustLatLng2;
    } else {
        waypoints = [
            { location: new google.maps.LatLng(currRestLatLng.lat, currRestLatLng.lng), stopover: true },
        ];
        deliveryLocation = currCustLatLng1;
    }

    var request = {
        origin: driverLocation,
        destination: new google.maps.LatLng(deliveryLocation.lat, deliveryLocation.lng),
        waypoints: waypoints,
        optimizeWaypoints: true,
        travelMode: 'DRIVING',
        drivingOptions: {
            departureTime: new Date(),
            trafficModel: 'pessimistic'
        },
        unitSystem: google.maps.UnitSystem.IMPERIAL,
    };

    directionsService.route(request, function (response, status) {
        if (status === 'OK') {
            directionsRenderer.setDirections(response);
        }
    });
}