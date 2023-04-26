firebase.initializeApp(firebaseConfig);
firebase.analytics();

const database = firebase.database();

var isFirstLoad = localStorage.getItem("isFirstLoad");

if (!isFirstLoad) {
  console.log("Test");
  localStorage.setItem("isFirstLoad", "true");
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

async function writePayment() {
  let chargeRequest = await fetch(`https://api.stripe.com/v1/events`, {
    method: "GET",
    headers: {
      Authorization: `Bearer sk_test_51Mvuu4I6ZJcOWwlq0rLtERYLSP8MOAZYNq6dKQdpJfywIpdi8A5LEOgcl2oW5ynvWaidmPQArHvIAizmHX86IeRj009naEPT3c`,
    },
  });

  let chargeRes = await chargeRequest.json();
  console.log(chargeRes.data);

  for (let i = 0; i < 5; i++) {
    if (chargeRes.data[i].type == "charge.succeeded") {
      var isFirstLoad = localStorage.getItem(chargeRes.data[i].id);

      if (!isFirstLoad) {
        var today = new Date();
        var date =
          today.getFullYear() +
          "/" +
          (today.getMonth() + 1) +
          "/" +
          today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let obj = chargeRes.data[i].data.object;
        const dbRef = database.ref();
        dbRef
          .child("Orders")
          .push()
          .set({
            createdAt: date + " " + time,
            driver_id: "BJ5wMY0pJfXeWglmloWkmTElyL13",
            item_lists: cart,
            payment_type: obj.payment_method_details.type,
            restaurant_id: 121241,
            restaurant_name: "Mcdonald",
            status: "On the way",
            total_miles: 5,
            total_spend: obj.amount / 100.0,
            transportation_cost: 2,
            charge_id: obj.id,
          })
          .then()
          .catch((error) => {
            console.log(error);
            console.error(error);
          });
        localStorage.setItem(chargeRes.data[i].id, "true");
      }
      console.log("success");
      break;
    } else if (chargeRes.data[i].type == "payment_intent.failed") {
      break;
    }
  }
}

writePayment();
