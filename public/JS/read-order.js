let arr = [];
let key = [];

function readOrders() {
  const dbRef = real_db.ref();
    dbRef
    .child("Orders")
    .get()
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          if(childSnapshot.val().status == "pending" && firebase.auth().currentUser.uid === childSnapshot.val().restaurant_id){
            key.push(childSnapshot.key);
            arr.push(childSnapshot.val());
          }
        });
        if(arr.length !== 0){
          createOrder(arr);
        }
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function createOrder(arr){
    var body = document.getElementsByClassName("order-list")[0];

    arr.map((val, index) => {
        var box = document.createElement("button");
        box.classList.add("order-box");
        box.addEventListener("click", () => {
            localStorage.setItem("current_order_id", key[index]);
            window.location.href = `http://${window.location.host}/restaurantPage.html`;
        });

        var row = document.createElement("div");
        row.classList.add("order-box-row");
        
        var name = document.createTextNode("Order" + (index + 1));
        var note = document.createTextNode("Note: " + val.special_request);

        var text1 = document.createElement("text");
        var text2 = document.createElement("text");

        text1.appendChild(name);
        text2.appendChild(note);

        row.appendChild(text1);
        row.appendChild(text2);

        var icon = document.createElement("i");
        icon.setAttribute("class", "fa fa-arrow-right");

        box.appendChild(row);
        box.appendChild(icon);

        body.appendChild(box);
    });
}

function readAcceptedOrder(){
  const dbRef = real_db.ref();
  dbRef
    .child("AcceptedOrders")
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          let orderData = childSnapshot.val();
          if(orderData.from == localStorage.getItem("currentUser") && orderData.status == "accepted"){
            var orderRef = firebase
              .database()
              .ref("drivers/" + orderData.driverID);
            orderRef.once("value").then((snapshot) => {
              console.log(snapshot.val());
              createAcceptedOrder(snapshot.val().name, orderData.distance);
            });
          }
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function createAcceptedOrder(name, distance){
  var body = document.getElementsByClassName("currentDeliveries")[0];

  var cont = document.createElement("div");
  cont.setAttribute("id", "driver1");

  var h1 = document.createElement("h1");
  h1.setAttribute("id", "driver1name");
  h1.textContent = name + " - " + distance + " miles";
  cont.appendChild(h1);

  body.appendChild(cont);
}

function readCompletedOrder(){
  const dbRef = real_db.ref();
  dbRef
    .child("AcceptedOrders")
    .get()
    .then((snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          let orderData = childSnapshot.val();
          if (
            orderData.from == localStorage.getItem("currentUser") &&
            orderData.status == "delivered"
          ) {
            var orderRef = firebase
              .database()
              .ref("drivers/" + orderData.driverID);
            orderRef.once("value").then((snapshot) => {
              console.log(orderData);
              createCompletedOrder(
                snapshot.val().name,
                orderData.distance,
                orderData.cost
              );
            });
          }
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}

function createCompletedOrder(name, distance, cost){
  const deliveredOrderList = document.getElementById("completed-order-list");
  const li = document.createElement("li");
  li.innerHTML = "Driver: " + name + " - $" + cost + " - " + distance + " miles.";
  deliveredOrderList.appendChild(li);
}

window.onload = function(){
  readOrders();
  readAcceptedOrder();
  readCompletedOrder();
}