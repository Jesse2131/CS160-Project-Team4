const database = firebase.database();

let arr = [];
let key = [];

async function readOrders() {
  const dbRef = database.ref();
  await dbRef
    .child("Orders")
    .get()
    .then(async (snapshot) => {
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          key.push(childSnapshot.key);
          arr.push(childSnapshot.val());
        });
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });
    console.log(arr);
    createOrder(arr);
}

readOrders();

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

window.onload = function(){
    const user = firebase.auth().currentUser;
    console.log(user);
}