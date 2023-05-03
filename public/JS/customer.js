import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getDatabase, set, ref, update, get, child, onValue } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-database.js";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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


let cart = [
  // {
  //   name: "Trip minimum",
  //   price: 5,
  //   quantity: 1,
  // },
  // {
  //   name: "XX miles",
  //   price: 5,
  //   quantity: 1,
  // },
];

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
const db = getDatabase(app2);
const driversRef = ref(db, 'drivers');
const restaurantsRef = ref(db, 'restaurants');
const ordersRef = ref(db, 'orders');
const firestoreDB = getFirestore(app2);
// const firestoreDB = firebase.firestore();


async function fetchRestaurants() {
  await get(restaurantsRef).then((snapshot) => {
    snapshot.forEach((childSnapshot) => {
      const restaurantID = childSnapshot.key;
      console.log(restaurantID);
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

      console.log(restaurant);

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
        //icon: "/assets/restaurant.png",
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
        // icon: "/assets/driver.png",
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
    displayNearByDrivers(result);
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
        // icon: "/assets/delivery.png",
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
        // icon: "/assets/restaurant.png",
      });
    }
  });
}

function acceptRequest() {
  console.log(bestDriver);
  update(ref(db, `activeOrders/order1`), {
    status: 'accepted',
    driverId: bestDriver.id,
    distance: bestDriver.distance,
    duration: bestDriver.duration,
    cost: bestDriver.cost,
  });
}

// const fetchDriversButton = document.getElementById('fetchDrivers');
// fetchDriversButton.addEventListener('click', fetchDrivers);

// const clearButton = document.getElementById('find');
// clearButton.addEventListener('click', findNearByDrivers);

// const acceptRequestButton = document.getElementById('acceptRequest');
// acceptRequestButton.addEventListener('click', acceptRequest);

// const updateLocationsButton = document.getElementById('updateLocations');
// updateLocationsButton.addEventListener('click', function () {
//   directionsRenderer.setDirections({ routes: [] });
//   updateDeliveryLocation();
//   updateRestaurantLocation();
// });

// const checkActiveOrder = document.getElementById('checkActiveOrder');
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

async function sendOrderAction() {

  console.log("Sending Order");
  // document.getElementById('restaurantLocation').value = '2855 Stevens Creek Blvd, Santa Clara, CA  95050';
  // document.getElementById('deliveryLocation').value = '1419 Keoncrest Ave, San Jose, CA 95110';
  // updateDeliveryLocation();
  // updateRestaurantLocation();
  // fetchDrivers();

  // var loading = document.getElementById("loading");
  // loading.style.display = "block";
  // setTimeout(function () {
  //   findNearByDrivers();
  //   loading.style.display = "none";
  //   document.getElementById('container').style.visibility = "visible";
  // }, 2000);

  let line_items = cart.map(function (item) {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    };
  });

  let stripeRequest = await fetch(
    "https://api.stripe.com/v1/checkout/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer sk_test_51Mvuu4I6ZJcOWwlq0rLtERYLSP8MOAZYNq6dKQdpJfywIpdi8A5LEOgcl2oW5ynvWaidmPQArHvIAizmHX86IeRj009naEPT3c`,
        "Content-type": "application/x-www-form-urlencoded",
      },
      body: buildQuery({
        payment_method_types: ["card"],
        mode: "payment",
        allow_promotion_codes: true,
        payment_intent_data: {
          receipt_email: "handyperson12@gmail.com",
        },
        success_url: `http://${window.location.host}/HTML/success_payment.html`,
        cancel_url: `http://${window.location.host}/cancel_payment.html`,
        line_items,
      }),
    }
  );
  let stripeResponse = await stripeRequest.json();
  window.location.href = stripeResponse.url;
}

const sendOrder = document.getElementById('sendOrder');
sendOrder.addEventListener('click', function () {
  //window.location.href = `http://${window.location.host}/HTML/checkout_detail.html`
  sendOrderAction();
});


function getRestMenu(restID) {
  // const restID = "130B8712-FC53-4A93-9E78-AC44F29B3F2B";
  console.log("loading menu for " + restID);
  // get(ref(db, `restaurants/${restID}/menu`)).then((snapshot) => {
  //   const menu = snapshot.val();
  //   console.log(menu);
  //   for (const item in menu) {
  //     addItem('../assets/foodItemPlaceholder.png', item, menu[item], 0);
  //   }
  // });

  // Get the restaurant name from the ID then go the the restaurant menu 

  const restaurantsCollection = collection(firestoreDB, 'restaurants');
const docRef = doc(restaurantsCollection, restID);

getDoc(docRef).then((doc) => {
  if (doc.exists()) {
    const data = doc.data();
    const rest_name = data.name; 
    console.log(rest_name);
    const formatted_rest_name = rest_name.replace(/ /g, "_") + "_Menu";
    // Use this name to load the menu items
    console.log(formatted_rest_name);
    loadRestaurantMenu(formatted_rest_name);

  } else {
    console.log("This restaurant doesn't exist");
  }
}).catch((error) => {
  console.log("Error getting document:", error);
});

}

function loadRestaurantMenu(rest_name){
  const myCollection = collection(firestoreDB, rest_name);
  document.getElementById("order_RestName").innerHTML = rest_name;
  const querySnapshot = getDocs(myCollection);
  querySnapshot.then((snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      // console.log(data);
      addItem('../assets/foodItemPlaceholder.png', data.item_name, data.item_price, 0);
    });
  });
}


function tableCreate(cart) {
  //body reference
  console.log(cart);
  var body = document.getElementsByClassName("order-quantity")[0];
  // create elements <table> and a <tbody>
  var tbl = document.createElement("div");
  tbl.setAttribute("width", "100%");
  tbl.classList.add("col");

  cart.map((val, index) => {
    var row = document.createElement("div");

    var name = document.createTextNode(val.name);
    var price = document.createTextNode(val.price);
    var quantity = document.createTextNode(val.quantity);

    var text1 = document.createElement("text");
    var text2 = document.createElement("text");
    var text3 = document.createElement("text");

    text1.appendChild(name);
    text2.appendChild(price);
    text3.appendChild(quantity);

    row.appendChild(text1);
    row.appendChild(text2);
    row.appendChild(text3);

    row.setAttribute("padding-bottom", "20px");
    row.classList.add("row");

    tbl.appendChild(row);
  });

  // body.appendChild(tbl);
}

tableCreate(cart);

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
      //   name: "Trip minimum",
      //   price: 5,
      //   quantity: 1,
      const data = {
        id:(Math.random() * 1000).toFixed(0).toString(),
        name: label,
        price: price,
        quantity: quantity,
      };
      cart.push(data);
      updateCart(imageUrl, label, price, quantity, data.id);
      console.log(cart);
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

function updateCart(imageUrl, label, price, quantity, id) {
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
    cart = cart.filter((order) => {return order.id == id});
    updateProcessButton();
  });
  addButtonCell.appendChild(deleteButton);
  newRow.appendChild(addButtonCell);
  // Add the new row to the table body
  tableBody.appendChild(newRow);

  updateProcessButton();
}

function buildQuery(data, prefix) {
  // Determine the data type
  var type = Object.prototype.toString.call(data).slice(8, -1).toLowerCase();

  // Loop through the object and create the query string
  return Object.keys(data)
    .map(function (key, index) {
      // Cache the value of the item
      var value = data[key];

      // Add the correct string if the object item is an array or object
      if (type === "array") {
        key = prefix + "[" + index + "]";
      } else if (type === "object") {
        key = prefix ? prefix + "[" + key + "]" : key;
      }

      // If the value is an array or object, recursively repeat the process
      if (typeof value === "object") {
        return buildQuery(value, key);
      }

      // Join into a query string
      return key + "=" + encodeURIComponent(value);
    })
    .join("&");
}


window.onload = function () {
  // if (window.location.pathname.includes("customer") && window.location.pathname.endsWith(".html")){
  //    window.history.back();
  // }

  const restaurantId = localStorage.getItem('order_restaurantId');
  getRestMenu(restaurantId);
  // const myCollection = collection(firestoreDB, 'Food_Inc_Menu');
  // const querySnapshot = getDocs(myCollection);
  // querySnapshot.then((snapshot) => {
  //   snapshot.forEach((doc) => {
  //     const data = doc.data();
  //     console.log(data);
  //     addItem('../assets/foodItemPlaceholder.png', data.item_name, data.item_price, 0);
  //   });
  // });
  
}

window.initMap = initMap;
