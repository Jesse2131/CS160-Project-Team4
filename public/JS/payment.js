let cart = [];

function tableCreate() {
  //body reference
  console.log(cart);
  var body = document.getElementsByClassName("order-quantity")[0];
  // create elements <table> and a <tbody>
  var tbl = document.createElement("div");
  tbl.setAttribute("style", "width: 100%;");
  tbl.classList.add("col");

  var title = document.createElement("div");
  title.setAttribute("padding-bottom", "20px");
  title.classList.add("row");

  let total = 0.0;

  cart.map((val, index) => {
    var row = document.createElement("div");
    row.setAttribute("padding-bottom", "20px");
    row.classList.add("row");

    var name = document.createTextNode(val.name);
    var quantity = document.createTextNode(val.quantity);
    var price = document.createTextNode("$" + (val.price * val.quantity));

    total += (val.price * val.quantity);

    var text1 = document.createElement("text");
    var text2 = document.createElement("text");
    var text3 = document.createElement("text");

    text1.appendChild(name);
    text2.appendChild(quantity);
    text3.appendChild(price);
    text1.setAttribute("flex", 2);
    text2.setAttribute("flex", 1);
    text3.setAttribute("flex", 1);
    text3.setAttribute("text-align", "end");

    row.appendChild(text1);
    row.appendChild(text2);
    row.appendChild(text3);

    tbl.appendChild(row);
  });


  var total_row = document.createElement("div");
  total_row.setAttribute("padding-bottom", "20px");
  total_row.classList.add("row");

  var title = document.createTextNode("Total");
  var total_cost = document.createTextNode(total);
  var text1 = document.createElement("text");
  var text2 = document.createElement("text");

  text1.appendChild(title);
  text2.appendChild(total_cost);
  text1.setAttribute("flex", 1);
  text2.setAttribute("flex", 1);
  text2.setAttribute("text-align", "end");

  total_row.appendChild(text1);
  total_row.appendChild(text2);
  total_row.setAttribute("style", "margin-top: 20px;");

  body.appendChild(tbl);
  body.appendChild(total_row);
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

async function goToCheckout(){
  console.log("test");
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
        success_url: `http://${window.location.host}/success_payment.html`,
        cancel_url: `http://${window.location.host}/cancel_payment.html`,
        line_items,
      }),
    }
  );
  let stripeResponse = await stripeRequest.json();
  window.location.href = stripeResponse.url;
}

const checkout = document.getElementById("checkout");
checkout.addEventListener("click", function () {
  //window.location.href = `http://${window.location.host}/HTML/checkout_detail.html`
  
  const request = document.getElementById("requests").value;
  localStorage.setItem("request", request);
  goToCheckout();
});

window.onload = function(){
  let data = [
    {
      id: (Math.random() * 1000).toFixed(0).toString(),
      name: "pizza",
      price: 5,
      quantity: 2,
    },
    {
      id: (Math.random() * 1000).toFixed(0).toString(),
      name: "Sushi",
      price: 2,
      quantity: 3,
    },
  ];
  localStorage.setItem("cart", JSON.stringify(data));
  console.log(JSON.parse(localStorage.getItem("cart")));
  cart = JSON.parse(localStorage.getItem("cart"));
  tableCreate();
}