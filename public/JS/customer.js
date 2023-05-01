import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, set, ref, update, get, child, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  }
];

// Init Map
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
      styles: myStyles,
    }
  );

  directionsRenderer.setMap(map);

}

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAymRncUXOTI_Mx2d61Hm4SYvRegy-0nqs",
  authDomain: "odfds-e747a.firebaseapp.com",
  projectId: "odfds-e747a",
  storageBucket: "odfds-e747a.appspot.com",
  messagingSenderId: "576921754903",
  appId: "1:576921754903:web:0687f1211357a003782b52"
};

const firebaseConfig2 = {
  apiKey: "AIzaSyCnK0wvRERHCX991OnlnjiQO1FBD5B0szk",
  authDomain: "odfds-4bee9.firebaseapp.com",
  databaseURL: "https://odfds-4bee9-default-rtdb.firebaseio.com",
  projectId: "odfds-4bee9",
  storageBucket: "odfds-4bee9.appspot.com",
  messagingSenderId: "659148068949",
  appId: "1:659148068949:web:e9bac363e7afdc758b1cdc",
  measurementId: "G-90TQ3NJ5BH"
};

const app = initializeApp(firebaseConfig);
const app2 = initializeApp(firebaseConfig2, "secondary");
const db = getDatabase(app);
const driversRef = ref(db, 'drivers');
const restaurantsRef = ref(db, 'restaurants');
const ordersRef = ref(db, 'orders');
const firestoreDB = getFirestore(app2);



function fetchRestaurants() {
  get(restaurantsRef).then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const restaurantID = childSnapshot.key;
      const restaurantData = childSnapshot.val();
      const restaurantName = restaurantData.name;
      const restaurantLocation = restaurantData.location;
      const lat = parseFloat(restaurantData.lat);
      const lng = parseFloat(restaurantData.lng);
      const restaurantLatLng = { lat, lng };
      const restaurant = {
        id: restaurantID,
        name: restaurantName,
        location: restaurantLocation,
        lat: lat,
        lng: lng,
      };

      if (!restaurants.some(r => r.id === restaurantID)) {
        restaurants.push(restaurant);
      }

      onValue(ref(db, 'pickedRestaurant'), (pickedRestaurantSnapshot) => {
        if (pickedRestaurantSnapshot.val().id === restaurantID) {
          restaurantMarker.setMap(map);
          pickedRestaurant = restaurants.find(r => r.id === pickedRestaurantSnapshot.val().id);
          findNearByDrivers();
        } else {
          restaurantMarker.setMap(null);
        }
      });

      const restaurantMarker = new google.maps.Marker({
        position: restaurantLatLng,
        map,
        icon: "/assets/restaurant.png",
      });

    });
  }).catch((error) => {
    console.error(error);
  });
}

function fetchDrivers() {
  drivers = [];
  get(driversRef).then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const driverID = childSnapshot.key;
      const driverData = childSnapshot.val();
      const isActive = driverData.isActive;
      const driverName = driverData.name;
      const driverLocation = driverData.location;
      const lat = parseFloat(driverData.lat);
      const lng = parseFloat(driverData.lng);
      const driverLatLng = { lat, lng };
      const driver = {
        id: driverID,
        name: driverName,
        location: driverLocation,
        lat: lat,
        lng: lng,
        isActive: isActive,
      };

      if (!drivers.some(d => d.id === driverID)) {
        drivers.push(driver);
        onValue(ref(db, `drivers/${driverID}`), (driverSnapshot) => {
          if (driverSnapshot.val().isActive) {
            driverMarker.setMap(map);
          } else {
            driverMarker.setMap(null);
          }
        });
      }

      const driverMarker = new google.maps.Marker({
        position: driverLatLng,
        map,
        icon: "/assets/driver.png",
      });

    });

  }).catch((error) => {
    console.error(error);
  });
}



function displayNearByDrivers(result) {
  result = result.sort((a, b) => a.cost - b.cost);
  const driversTable = document.querySelector('#driversTable tbody');
  let tableContent = '';

  result.forEach((driver) => {
    tableContent += `<tr>
      <td>${driver.name}</td>
      <td>${driver.duration} min</td>
      <td>${driver.distance} miles</td>
      <td>$${driver.cost}</td>
    </tr>`;
  });

  driversTable.innerHTML = tableContent;

  const rows = document.querySelectorAll('#driversTable tbody tr');
  rows.forEach((row) => {
    row.addEventListener('click', () => {
      rowClick(row);
    });
  });

  function rowClick(row) {
    const driver = drivers.find(d => d.name === row.cells[0].innerHTML);
    drawRouteForADriver(driver);
  }
}

function findNearByDrivers() {
  result = [];

  drivers.forEach((driver) => {

    if (driver.isActive) {

      const driverLocationLatLng = new google.maps.LatLng(driver.lat, driver.lng);
      const restaurantLocationLatLng = new google.maps.LatLng(restaurantLocation.lat, restaurantLocation.lng);
      const deliveryLocationLatLng = new google.maps.LatLng(deliveryLocation.lat, deliveryLocation.lng);

      var totalDistance = 0;
      var totalDuration = 0;
      var deliveryCost = 0;
      var totalDistanceInMiles = 0;

      distanceService.getDistanceMatrix(
        {
          origins: [driverLocationLatLng],
          destinations: [restaurantLocationLatLng],
          travelMode: 'DRIVING',
          unitSystem: google.maps.UnitSystem.METRIC,
          avoidHighways: false,
          avoidTolls: false,
          drivingOptions: {
            departureTime: new Date(Date.now()),
            trafficModel: 'optimistic',
          }
        }, fromDriverToRestaurant);

      function fromDriverToRestaurant(response, status) {
        const distance = response.rows[0].elements[0].distance.text;
        const duration = response.rows[0].elements[0].duration.text;
        totalDistance += parseFloat(distance);
        totalDuration += parseFloat(duration);

        distanceService.getDistanceMatrix(
          {
            origins: [restaurantLocationLatLng],
            destinations: [deliveryLocationLatLng],
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false,
            drivingOptions: {
              departureTime: new Date(Date.now()),
              trafficModel: 'optimistic',
            }
          }, fromRestaurantToDelivery);

        function fromRestaurantToDelivery(response, status) {
          const distance = response.rows[0].elements[0].distance.text;
          const duration = response.rows[0].elements[0].duration.text;
          totalDistance += parseFloat(distance);
          totalDistanceInMiles = Number((totalDistance * 0.621371).toFixed(1));
          totalDuration += parseFloat(duration);
          deliveryCost = 5 + (totalDistanceInMiles - 1) * 2;
          const res = `${driver.name}, ${totalDuration} min, ${totalDistanceInMiles} miles, $${deliveryCost}`;

          const calculatedDriver = {
            id: driver.id,
            name: driver.name,
            duration: totalDuration,
            distance: totalDistanceInMiles,
            cost: deliveryCost,
          };
          result.push(calculatedDriver);
        }
      }
    }
  });

  setTimeout(() => {
    // displayNearByDrivers(result);
    showRouteForBestDriver();
  }, 2000);

}

function showRouteForBestDriver() {
  bestDriver = result.reduce((prev, current) => (prev.cost < current.cost) ? prev : current);
  const bestDriverInformation = drivers.find((driver) => driver.id === bestDriver.id);
  const bestDriverLocation = new google.maps.LatLng(bestDriverInformation.lat, bestDriverInformation.lng);
  var waypoints = [
    { location: new google.maps.LatLng(restaurantLocation.lat, restaurantLocation.lng), stopover: true },
  ]
  var request = {
    origin: bestDriverLocation,
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
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
    }
  });

}

function drawRouteForADriver(driver) {
  // console.log(driver);
  directionsRenderer.setDirections({ routes: [] });
  const bestDriverLocation = new google.maps.LatLng(driver.lat, driver.lng);
  var waypoints = [
    { location: new google.maps.LatLng(restaurantLocation.lat, restaurantLocation.lng), stopover: true },
  ]
  var request = {
    origin: bestDriverLocation,
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
    if (status == 'OK') {
      directionsRenderer.setDirections(response);
    }
  });
}

function updateDeliveryLocation() {
  // const address = document.getElementById('deliveryLocation').value;
  const address = '1419 Keoncrest Ave, San Jose, CA 95110';
  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status == 'OK') {
      deliveryLocation.lat = results[0].geometry.location.lat();
      deliveryLocation.lng = results[0].geometry.location.lng();
      if (deliveryMarker) {
        deliveryMarker.setMap(null);
      }
      deliveryMarker = new google.maps.Marker({
        position: deliveryLocation,
        map,
        icon: "/assets/delivery.png",
      });
    }
  });
}

function updateRestaurantLocation() {
  // const address = document.getElementById('restaurantLocation').value;
  const address = '2855 Stevens Creek Blvd, Santa Clara, CA  95050';
  geocoder.geocode({ 'address': address }, function (results, status) {
    if (status == 'OK') {
      restaurantLocation.lat = results[0].geometry.location.lat();
      restaurantLocation.lng = results[0].geometry.location.lng();
      if (restaurantMarker) {
        restaurantMarker.setMap(null);
      }
      restaurantMarker = new google.maps.Marker({
        position: restaurantLocation,
        map,
        icon: "/assets/restaurant.png",
      });
    }
  });
}

// function acceptRequest() {
//   console.log(bestDriver);
//   update(ref(db, `activeOrders/order1`), {
//     status: 'accepted',
//     driverId: bestDriver.id,
//     distance: bestDriver.distance,
//     duration: bestDriver.duration,
//     cost: bestDriver.cost,
//   });
// }

const fetchDriversButton = document.getElementById('fetchDrivers');
// fetchDriversButton.addEventListener('click', fetchDrivers);

const clearButton = document.getElementById('find');
// clearButton.addEventListener('click', findNearByDrivers);

const acceptRequestButton = document.getElementById('acceptRequest');
// acceptRequestButton.addEventListener('click', acceptRequest);

const updateLocationsButton = document.getElementById('updateLocations');
// updateLocationsButton.addEventListener('click', function () {
//   directionsRenderer.setDirections({ routes: [] });
//   updateDeliveryLocation();
//   updateRestaurantLocation();
// });

const checkActiveOrder = document.getElementById('checkActiveOrder');
// checkActiveOrder.addEventListener('click', function () {
//   onValue(ref(db, 'activeOrders'), (snapshot) => {

//     const data = snapshot.val();

//     const activeOrder = Object.values(data)[0];
//     if (activeOrder.status == "pending") {git
//       window.alert('Incoming Order');
//     } else if (activeOrder.status == "accepted") {
//       window.alert('Sending Order to Driver');
//     }

//     document.getElementById('activeOrderResponse').innerHTML = JSON.stringify(data, null, 2);

//     const restaurantId = activeOrder.restaurantID;
//     const customerId = activeOrder.customerId;

//     get(ref(db, `restaurants/${restaurantId}`)).then((snapshot) => {
//       const data = snapshot.val();
//       document.getElementById('restaurantLocation').value = data.location;
//     });

//     get(ref(db, `customers/${"7AC05221-B29D-42E9-BF34-F91FFC3F5CBC"}`)).then((snapshot) => {
//       const data = snapshot.val();
//       document.getElementById('deliveryLocation').value = data.location;
//     });

//     updateRestaurantLocation();
//     updateDeliveryLocation();
//   });
// });

function sendOrderAction() {

  console.log("Sending Order");
  // document.getElementById('restaurantLocation').value = '2855 Stevens Creek Blvd, Santa Clara, CA  95050';
  // document.getElementById('deliveryLocation').value = '1419 Keoncrest Ave, San Jose, CA 95110';
  updateDeliveryLocation();
  updateRestaurantLocation();
  fetchDrivers();

  var loading = document.getElementById("loading");
  loading.style.display = "block";
  setTimeout(function () {
    findNearByDrivers();
    loading.style.display = "none";
    document.getElementById('container').style.visibility = "visible";
  }, 2000);


}

const sendOrder = document.getElementById('sendOrder');
sendOrder.addEventListener('click', function () {
  sendOrderAction()
});


function loadRestaurantMenu() {
  const restID = "130B8712-FC53-4A93-9E78-AC44F29B3F2B";
  get(ref(db, `restaurants/${restID}/menu`)).then((snapshot) => {
    const menu = snapshot.val();
    // console.log(menu);
    for (const item in menu) {
      addItem('assets/foodItemPlaceholder.png', item, menu[item], 0);
    }
  });
}




function addItem(imageUrl, label, price, quantity) {
  // Get the table body element
  const tableBody = document.getElementById('table-body');

  // Create a new row element
  const newRow = document.createElement('tr');

  // Create image element and set the source attribute
  const imageCell = document.createElement('td');
  const image = document.createElement('img');
  image.src = imageUrl;
  imageCell.appendChild(image);
  newRow.appendChild(imageCell);

  // Create label cell and set the text content
  const labelCell = document.createElement('td');
  labelCell.textContent = label;
  newRow.appendChild(labelCell);

  // Create price cell and set the text content
  const priceCell = document.createElement('td');
  priceCell.textContent = '$' + price + '';
  newRow.appendChild(priceCell);

  // Create quantity cell and input field
  const quantityCell = document.createElement('td');
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.min = 0;
  quantityInput.max = 10;
  quantityInput.value = quantity;
  quantityCell.appendChild(quantityInput);
  newRow.appendChild(quantityCell);

  // Create add button cell and set the click event listener
  const addButtonCell = document.createElement('td');
  const addButton = document.createElement('button');
  addButton.textContent = 'Add';
  addButton.addEventListener('click', () => {
    const quantity = quantityInput.value;
    // TODO: Add logic to add item to cart
    if (quantity > 0) {
      updateCart(imageUrl, label, price, quantity);
    }
  });
  addButtonCell.appendChild(addButton);
  newRow.appendChild(addButtonCell);

  // Add the new row to the table body
  tableBody.appendChild(newRow);

  
}

function updateProcessButton() {
  // Get sum prices from cart-items 
  const cartItems = document.getElementById('cart-items');
  const cartItemsRows = cartItems.getElementsByTagName('tr');
  let sum = 0;
  for (let i = 0; i < cartItemsRows.length; i++) {
    const row = cartItemsRows[i];
    const price = row.getElementsByTagName('td')[2].textContent;
    sum += parseFloat(price.substring(1));
  }
  sendOrder.textContent = "Process Order: " + "$" + sum.toFixed(2) + "";
};

function updateCart(imageUrl, label, price, quantity) {
  // Get the table body element
  const tableBody = document.getElementById('cart-items');

  // Create a new row element
  const newRow = document.createElement('tr');

  // Create image element and set the source attribute
  const imageCell = document.createElement('td');
  const image = document.createElement('img');
  image.src = imageUrl;
  imageCell.appendChild(image);
  newRow.appendChild(imageCell);

  // Create label cell and set the text content
  const labelCell = document.createElement('td');
  labelCell.textContent = label;
  newRow.appendChild(labelCell);

  // Create price cell and set the text content
  const priceCell = document.createElement('td');
  priceCell.textContent = '$' + (price * quantity).toFixed(2) + '';
  newRow.appendChild(priceCell);

  // Create quantity cell and input field
  const quantityCell = document.createElement('td');
  quantityCell.textContent = quantity;
  newRow.appendChild(quantityCell);

  // Create add button cell and set the click event listener
  const addButtonCell = document.createElement('td');
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.style.backgroundColor = 'red';
  deleteButton.addEventListener('click', () => {
    newRow.remove();
    updateProcessButton();
  });
  addButtonCell.appendChild(deleteButton);
  newRow.appendChild(addButtonCell);

  // Add the new row to the table body
  tableBody.appendChild(newRow);

  updateProcessButton();
}

window.onload = function () {
  // loadRestaurantMenu();
  const myCollection = collection(firestoreDB, 'Food_Inc_Menu');
  const querySnapshot = getDocs(myCollection);
  querySnapshot.then((snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      addItem('assets/foodItemPlaceholder.png', data.item_name, data.item_price, 0);
    });
  });
}

window.initMap = initMap;
