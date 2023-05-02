import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  getDatabase,
  set,
  ref,
  update,
  get,
  child,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

var map;
var directionsService;
var directionsRenderer;
var distanceService;
var geocoder;
var restaurantLocation = { lat: 37.395016445934225, lng: -121.98360443676356 };
var deliveryLocation = { lat: 37.38574207486066, lng: -122.07183838094353 };

var result = [];
var drivers = [];
var restaurants = [];
var customers = [];
var deliveryMarker;
var restaurantMarker;
var bestDriver;
var activerOrders = [];

var myStyles = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
];

function initMap() {
  geocoder = new google.maps.Geocoder();
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    suppressMarkers: true,
  });
  distanceService = new google.maps.DistanceMatrixService();

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 11,
    center: { lat: 37.33956562562412, lng: -121.89712826599812 },
    styles: myStyles,
  });

  directionsRenderer.setMap(map);
}

function fetchRestaurant(){
  const checkUserType = db.collection("users").doc(sessionStorage.getItem("currentUser"));
  let retrievedUserType = "";
  checkUserType
    .get()
    .then((doc) => {
      retrievedUserType = doc.data().type;

      const curr_user = db
        .collection(retrievedUserType)
        .doc(sessionStorage.getItem("currentUser"));
      curr_user.get().then((doc) => {
        console.log(doc.data());
        // const retrievedName = doc.data().name;
        // const retrievedStatus = doc.data().status;
        // const retrievedOrder1 = doc.data().order1;
        // const retrievedOrder2 = doc.data().order2;
        // // Update account button to show currently logged in user
        // document.getElementById("nav-logged-in-user").innerHTML =
        //   "Welcome " + retrievedName;
        // if (retrievedStatus === "delivering") {
        //   but1.classList.add("disabledButton");
        //   but2.classList.remove("disabledButton");

        //   check1.style.filter = "grayscale(0%)";
        //   dot1.style.filter = "grayscale(0%)";
        //   driverImg.style.filter = "grayscale(0%)";
        // }
        // status = retrievedStatus;
        // currOrder1 = retrievedOrder1;
        // currOrder2 = retrievedOrder2;
      });
    })
    .catch((error) => {
      console.log("Error getting user data:", error);
    });
}


fetchRestaurant();
window.onload = function(){
    console.log(localStorage.getItem("current_order_id"));
    console.log(sessionStorage.getItem("currentUser"));
}

window.initMap = initMap;