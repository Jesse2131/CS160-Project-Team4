firebase.initializeApp(firebaseConfig);
firebase.analytics();

const database = firebase.database();

async function writePayment() {
  let chargeRequest = await fetch(`https://api.stripe.com/v1/events`, {
    method: "GET",
    headers: {
      Authorization: `Bearer sk_test_51Mvuu4I6ZJcOWwlq0rLtERYLSP8MOAZYNq6dKQdpJfywIpdi8A5LEOgcl2oW5ynvWaidmPQArHvIAizmHX86IeRj009naEPT3c`,
    },
  });

  let chargeRes = await chargeRequest.json();
//   console.log(chargeRes.data);
  console.log(JSON.parse(sessionStorage.getItem("account_order")));
  for (let i = 0; i < 5; i++) {
    if (chargeRes.data[i].type == "charge.succeeded") {
      var isFirstLoad = localStorage.getItem(chargeRes.data[i].id);

      if (!isFirstLoad) {
        console.log("test");
        const dbRef = database.ref();
        let data = JSON.parse(sessionStorage.getItem("account_order"));
        // var pushed = await dbRef
        //   .child("AcceptedOrders")
        //   .push()
        //   .set(data)
        //   .catch((error) => {
        //     console.error(error);
        //   });
        dbRef.child("Orders").child(data.orderID).update({status: "accepted"});
        var pushed = dbRef.child("AcceptedOrders").push(data);
        console.log(pushed.key);

            // localStorage.setItem(chargeRes.data[i].id, "true");
        localStorage.removeItem("account_order");
      }
      console.log("success");
      break;
    } else if (chargeRes.data[i].type == "payment_intent.failed") {
      break;
    }
  }
}

writePayment();
