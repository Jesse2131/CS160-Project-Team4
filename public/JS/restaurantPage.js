import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  initializeFirestore,
  getDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

var map;
var directionsService;
var directionsRenderer;
var distanceService;
var geocoder;
var restaurantLocation = { lat: 37.395016445934225, lng: -121.98360443676356 };
var deliveryLocation = { lat: 37.38574207486066, lng: -122.07183838094353 };
var driverLocation = { lat: 37.38574207486066, lng: -122.07183838094353 };

var result = [];
var drivers = [];
var deliveryMarker;
var driverMarker;
var restaurantMarker;
var bestDriver;
var orders;
var restaurant;
var customer;
var ordersID;
var cusID;

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
firebase.initializeApp(firebaseConfig);
firebase.analytics();
const db2 = firebase.database();

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

async function fetchRestaurant() {
  const checkUserType = await getDoc(
    doc(db, "users", sessionStorage.getItem("currentUser"))
  );
  let retrievedUserType = checkUserType.data().type;

  const curr_user = await getDoc(
    doc(db, retrievedUserType, sessionStorage.getItem("currentUser"))
  );
  restaurant = curr_user.data();
  updateRestaurantLocation(curr_user.data().address);
}

async function fetchOrders(){
  const dbRef = await db2.ref();
  await dbRef
    .child("Orders/" + localStorage.getItem("current_order_id"))
    .get()
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        const customerID = snapshot.val().user_id;
        fetchDeliveryLocation(customerID);
        cusID = customerID;
        ordersID = snapshot.key;
        orders = snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

async function fetchDeliveryLocation(customerID){
  const checkUserType = await getDoc(
    doc(db, "users", customerID)
  );
  let retrievedUserType = checkUserType.data().type;

  const curr_user = await getDoc(doc(db, retrievedUserType, customerID));

  customer = curr_user.data();

  updateDeliveryLocation(curr_user.data().address);
}


async function fetchDrivers() {
  drivers = [];

  const snapshot = await db2.ref().child("drivers").get();

  snapshot.forEach((childSnapshot) => {
    const driverID = childSnapshot.key;
    const driverData = childSnapshot.val();
    const status = driverData.status;
    const driverName = driverData.name;
    const location = driverData.currentLocation;
    const driver = {
      id: driverID,
      name: driverName,
      location: location,
      status: status,
      available: driverData.available,
    };

    if (!drivers.some((d) => d.id === driverID)) {
      drivers.push(driver);
    }
  });
  console.log(drivers);
  await findNearByDrivers(drivers);
}

async function findNearByDrivers(drivers) {
  result = [];
  
  drivers.forEach((driver) => {
    if (driver.status == "online" && driver.available) {
      geocoder.geocode(
         { address: driver.location },
         function (results, status) {
           if (status == "OK") {
             const driverLocationLatLng = new google.maps.LatLng(
               results[0].geometry.location.lat(),
               results[0].geometry.location.lng()
             );
             const restaurantLocationLatLng = new google.maps.LatLng(
               restaurantLocation.lat,
               restaurantLocation.lng
             );
             const deliveryLocationLatLng = new google.maps.LatLng(
               deliveryLocation.lat,
               deliveryLocation.lng
             );

             var totalDistance = 0;
             var totalDuration = 0;
             var deliveryCost = 0;
             var totalDistanceInMiles = 0;

             distanceService.getDistanceMatrix(
               {
                 origins: [driverLocationLatLng],
                 destinations: [restaurantLocationLatLng],
                 travelMode: "DRIVING",
                 unitSystem: google.maps.UnitSystem.METRIC,
                 avoidHighways: false,
                 avoidTolls: false,
                 drivingOptions: {
                   departureTime: new Date(Date.now()),
                   trafficModel: "optimistic",
                 },
               },
               fromDriverToRestaurant
             );

             function fromDriverToRestaurant(response, status) {
               const distance = response.rows[0].elements[0].distance.text;
               const duration = response.rows[0].elements[0].duration.text;
               totalDistance += parseFloat(distance);
               totalDuration += parseFloat(duration);

               distanceService.getDistanceMatrix(
                 {
                   origins: [restaurantLocationLatLng],
                   destinations: [deliveryLocationLatLng],
                   travelMode: "DRIVING",
                   unitSystem: google.maps.UnitSystem.METRIC,
                   avoidHighways: false,
                   avoidTolls: false,
                   drivingOptions: {
                     departureTime: new Date(Date.now()),
                     trafficModel: "optimistic",
                   },
                 },
                 fromRestaurantToDelivery
               );

               function fromRestaurantToDelivery(response, status) {
                 const distance = response.rows[0].elements[0].distance.text;
                 const duration = response.rows[0].elements[0].duration.text;
                 totalDistance += parseFloat(distance);
                 totalDistanceInMiles = Number(
                   (totalDistance * 0.621371).toFixed(1)
                 );
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
         }
       );
    }
  }
  );


  setTimeout(() => {
    showRouteForBestDriver();
  }, 2000);
}

async function showRouteForBestDriver() {
  bestDriver = result.reduce((prev, current) =>
    prev.cost < current.cost ? prev : current
  );
  const bestDriverInformation = drivers.find(
    (driver) => driver.id === bestDriver.id
  );
  let accOrder = {
    cost: bestDriver.cost,
    distance: bestDriver.distance,
    driverID: bestDriver.id,
    duration:bestDriver.duration,
    from: sessionStorage.getItem("currentUser"),
    orderID: ordersID,
    status: "accepted",
    to: cusID,
  };
  sessionStorage.setItem("account_order", JSON.stringify(accOrder));
  console.log(bestDriver);
  createInfo(orders, restaurant, customer, bestDriver);
  console.log(bestDriverInformation);
  await geocoder.geocode(
    { address: bestDriverInformation.location },
    function (results, status) {
      if (status == "OK") {
        driverLocation.lat = results[0].geometry.location.lat();
        driverLocation.lng = results[0].geometry.location.lng();
      }
    }
  );
  console.log(driverLocation);
  if (driverMarker) {
    driverMarker.setMap(null);
  }
  driverMarker = new google.maps.Marker({
    position: driverLocation,
    map,
    // icon: "/assets/restaurant.png",
  });

  const bestDriverLocation = new google.maps.LatLng(
    driverLocation.lat,
    driverLocation.lng
  );
  var waypoints = [
    {
      location: new google.maps.LatLng(
        restaurantLocation.lat,
        restaurantLocation.lng
      ),
      stopover: true,
    },
  ];
  var request = {
    origin: bestDriverLocation,
    destination: new google.maps.LatLng(
      deliveryLocation.lat,
      deliveryLocation.lng
    ),
    waypoints: waypoints,
    optimizeWaypoints: true,
    travelMode: "DRIVING",
    drivingOptions: {
      departureTime: new Date(),
      trafficModel: "pessimistic",
    },
    unitSystem: google.maps.UnitSystem.IMPERIAL,
  };

  directionsService.route(request, function (response, status) {
    if (status == "OK") {
      directionsRenderer.setDirections(response);
    }
  });
}

function updateRestaurantLocation(address) {
  // const address = document.getElementById('restaurantLocation').value;
  geocoder.geocode({ address: address }, function (results, status) {
    if (status == "OK") {
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

function updateDeliveryLocation(address) {
  // const address = document.getElementById('deliveryLocation').value;
  geocoder.geocode({ address: address }, function (results, status) {
    if (status == "OK") {
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

function createInfo(order, restaurant, customer, driver){
  var body = document.getElementsByClassName("order-info")[0];

  //location
  var location_field = document.createElement("fieldset");
  var location_legend = document.createElement("legend");

  var location_title_text = document.createTextNode("Locations:");
  var restaurant_location_text = document.createTextNode("Restaurant: " + restaurant.address);
  var customer_location_text = document.createTextNode("Delivery: " + customer.address);

  var p2 = document.createElement("p");
  var p3 = document.createElement("p");

  location_legend.appendChild(location_title_text);
  p2.appendChild(restaurant_location_text);
  p3.appendChild(customer_location_text);

  location_field.appendChild(location_legend);
  location_field.appendChild(p2);
  location_field.appendChild(p3);

  //order
  var order_field = document.createElement("fieldset");
  var order_legend = document.createElement("legend");

  var order_title_text = document.createTextNode("Order Details:");
  order_legend.appendChild(order_title_text);
  order_field.appendChild(order_legend);

  order.item_lists.map((val, index) => {
    var p = document.createElement("p");
    var order_name = document.createTextNode(val.name + " - Quality: " + val.quantity);
    p.appendChild(order_name);
    order_field.appendChild(p);
  });

  //delivery
  
  var driver_field = document.createElement("fieldset");
  var driver_legend = document.createElement("legend");

  var driver_title_text = document.createTextNode("Delivery Details:");
  var driver_text = document.createTextNode("Driver: " + driver.name);
  var duration_text = document.createTextNode("Duration: " + driver.duration + " mins");
  var distance_text = document.createTextNode("Distance: " + driver.distance + " miles");
  var cost_text = document.createTextNode("Cost: $" + driver.cost);

  var p4 = document.createElement("p");
  var p5 = document.createElement("p");
  var p6 = document.createElement("p");
  var p7 = document.createElement("p");

  driver_legend.appendChild(driver_title_text);
  p4.appendChild(driver_text);
  p5.appendChild(duration_text);
  p6.appendChild(distance_text);
  p7.appendChild(cost_text);

  driver_field.appendChild(driver_legend);
  driver_field.appendChild(p4);
  driver_field.appendChild(p5);
  driver_field.appendChild(p6);
  driver_field.appendChild(p7);

  var accept_button = document.createElement("button");
  accept_button.textContent = "Accept Order";
  accept_button.setAttribute("id", "acceptRequest");
  accept_button.addEventListener("click", () => {
    goToCheckout(driver);
  });

  body.appendChild(location_field);
  body.appendChild(order_field);
  body.appendChild(driver_field);
  body.appendChild(accept_button);
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

async function goToCheckout(driver) {

  var driver_fee = [
    {
      name: "Delivery Fee",
      price: driver.cost,
    }
  ];
  let line_items = driver_fee.map(function (item) {
    return {
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
        },
        unit_amount: parseInt((item.price * 100).toFixed(2)),
      },
      quantity: 1,
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
        success_url: `http://${window.location.host}/successOrder_page.html`,
        cancel_url: `http://${window.location.host}/cancel_payment.html`,
        line_items,
      }),
    }
  );
  let stripeResponse = await stripeRequest.json();
  console.log(stripeResponse);
  window.location.href = stripeResponse.url;
}

window.onload = async function () {
  await fetchOrders();
  await fetchRestaurant();
  await fetchDrivers();
  console.log(localStorage.getItem("current_order_id"));
  console.log(sessionStorage.getItem("currentUser"));
};

window.initMap = initMap;
