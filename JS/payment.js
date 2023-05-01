firebase.initializeApp(firebaseConfig);
firebase.analytics();

//const database = firebase.database();

// function readOrders(){
//   const dbRef = database.ref();
//   dbRef.child("Orders").get().then(async (snapshot) => {
//     if (snapshot.exists()) {
//       console.log(snapshot.val());
//       var temp_arr = [];

//       snapshot.forEach((childSnapshot) => {
//           temp_arr.push(childSnapshot.val());
//       });

//       tableCreate(temp_arr);
//     } else {
//       console.log("No data available");
//     }
//   }).catch((error) => {
//     console.error(error);
//   });
// }

// function tableCreate(temp_arr) {
// //body reference 
// var body = document.getElementsByClassName("order-quantity")[0];

// // create elements <table> and a <tbody>
// var tbl = document.createElement("table");
// var tblBody = document.createElement("tbody");

// var row_name = document.createElement("tr");
// var cell_name_1 = document.createElement("th");
// var cell_name_2 = document.createElement("th");

// var name1 = document.createTextNode("Order");
// var name2 = document.createTextNode("Quantity");

// cell_name_1.appendChild(name1);
// cell_name_2.appendChild(name2)

// row_name.appendChild(cell_name_1);
// row_name.appendChild(cell_name_2);
// tblBody.appendChild(row_name);

// temp_arr.map((val) => {
    
//     var row = document.createElement("tr");
//     var cell = document.createElement("td");
//     var cell2 = document.createElement("td");

//     var cellText = document.createTextNode(val.order);
//     var cellText2 = document.createTextNode(val.quantity);

//     cell.appendChild(cellText);
//     cell2.appendChild(cellText2);
//     cell2.setAttribute("padding-left", "20px");
//     cell.setAttribute("text-align", "center");
//     cell2.setAttribute("text-align", "center");
//     row.appendChild(cell);
//     row.appendChild(cell2);
//     tblBody.appendChild(row);
// });

// // append the <tbody> inside the <table>
// tbl.appendChild(tblBody);
// // put <table> in the <body>
// body.appendChild(tbl);
// // tbl border attribute to 
// //tbl.setAttribute("border", "2");
// }

// readOrders();

// var stripe = Stripe(
//   "pk_test_51Mvuu4I6ZJcOWwlqfxypyW1ftkR2CJAyngLbxqWjz2i7O5qaoPSHz1C5oJuMf9tT0iCeKjCkiookBBK6gyHTihHj00tI1jztDs"
// );


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

let cart = [
  {
    name: "Trip minimum",
    price: 5,
    quantity: 1,
  },
  {
    name: "XX miles", 
    price: 5,
    quantity: 1,
  },
];

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


async function getStripeSession() {
    // Call the Stripe API
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
            receipt_email:'handyperson12@gmail.com'
          },
          success_url: `http://${window.location.host}/HTML/success_payment.html`,
          cancel_url: `http://${window.location.host}/cancel_payment.html`,
          line_items,
        }),
      }
    );
    let stripeResponse = await stripeRequest.json();

    console.log(stripeResponse);
    console.log(stripeResponse.url);

    // Redirect to Stripe Checkout
    //window.location.href = stripeResponse.url;
    var a = document.getElementById("checkout");
    a.href = stripeResponse.url;
  };

getStripeSession();

async function testing(){
  let paymentRequest2 = await fetch(
    "https://api.stripe.com/v1/payment_intents",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer sk_test_51Mvuu4I6ZJcOWwlq0rLtERYLSP8MOAZYNq6dKQdpJfywIpdi8A5LEOgcl2oW5ynvWaidmPQArHvIAizmHX86IeRj009naEPT3c`,
      },
    }
  );
  let res2 = await paymentRequest2.json();
  console.log("test");
  console.log(res2.data);

  let paymentRequest = await fetch(
    "https://api.stripe.com/v1/payment_intents/pi_3MyjiDI6ZJcOWwlq0g7zySvt",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer sk_test_51Mvuu4I6ZJcOWwlq0rLtERYLSP8MOAZYNq6dKQdpJfywIpdi8A5LEOgcl2oW5ynvWaidmPQArHvIAizmHX86IeRj009naEPT3c`,
      },
    }
  );
  let res = await paymentRequest.json();
  console.log(res.latest_charge);
}
testing();
