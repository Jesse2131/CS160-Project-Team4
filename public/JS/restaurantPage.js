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



window.onload = function(){
    console.log(localStorage.getItem("current_order_id"));
}

window.initMap = initMap;