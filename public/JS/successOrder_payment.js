import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import {
  initializeFirestore,
  getDoc,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

// firebase.initializeApp(firebaseConfig);
// firebase.analytics();

// const database = firebase.database();

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

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
        const dbRef = real_db.ref();
        let data = JSON.parse(sessionStorage.getItem("account_order"));

        dbRef
          .child("Orders")
          .child(data.orderID)
          .update({ status: "accepted" });

        var pushed = dbRef.child("AcceptedOrders").push(data);
        console.log(pushed.key);

        const checkUserType = await getDoc(doc(db, "users", data.driverID));
        let retrievedUserType = checkUserType.data().type;

        const curr_user = await getDoc(
          doc(db, retrievedUserType, data.driverID)
        );
        let driver = curr_user.data();
        console.log(driver);
        if (driver["order1"] == "none"){
          driver["order1"] = pushed.key;
        } else{
          driver["order2"] = pushed.key;
          dbRef
            .child("drivers")
            .child(data.driverID)
            .update({ available: false });
        }
        await setDoc(doc(db, retrievedUserType, data.driverID), driver);

        localStorage.setItem(chargeRes.data[i].id, "true");
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


// const curr_user = await getDoc(
//   doc(db, retrievedUserType, sessionStorage.getItem("currentUser"))
// );