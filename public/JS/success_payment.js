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
        const restID = localStorage.getItem('order_restaurantId');
        let restName = "";
        const restaurantsCollection = db.collection('restaurants');

        await restaurantsCollection.get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              if(doc.id === restID){
                restName = doc.data().name;
              }
            });
          });
        var today = new Date();
        var date =
          today.getFullYear() +
          "/" +
          (today.getMonth() + 1) +
          "/" +
          today.getDate();
        var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
        let obj = chargeRes.data[i].data.object;
        const dbRef = real_db.ref();
        dbRef
          .child("Orders")
          .push()
          .set({
            charge_id: obj.id,
            createdAt: date + " " + time,
            item_lists: JSON.parse(localStorage.getItem("cart")),
            payment_type: obj.payment_method_details.type,
            restaurant_id: restID,
            restaurant_name: restName,
            progress: "On the way",
            special_request: localStorage.getItem("request"),
            total_spend: obj.amount / 100.0,
            status: "pending",
            user_id: firebase.auth().currentUser.uid,
          })
          .then((res) => {
            console.log(res);
          })
          .catch((error) => {
            console.log(error);
            console.error(error);
          });
        localStorage.setItem(chargeRes.data[i].id, "true");
        localStorage.removeItem("cart");
        localStorage.removeItem("request");
      }
      console.log("success");
      break;
    } else if (chargeRes.data[i].type == "payment_intent.failed") {
      break;
    }
  }
}

writePayment();
