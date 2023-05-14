let driver1 = document.getElementById("driver1");
let driver1name = document.getElementById("driver1name");

const one = document.querySelector(".one");
const two = document.querySelector(".two");
const three = document.querySelector(".three");

let currDriver1 = "";


const database = firebase.database();

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        // Set session storage
        sessionStorage.setItem("currentUser", user.uid);
        // Display account page info
        display_user_info(user);
        setTimeout(function () {
            display_curr_orders();
            display_completed_orders(user.uid);
        }, 800);

    } else {
        // No user is signed in.
        console.log('User is not signed in');
    }
});

function display_user_info(user) {
    // Query db for additional data
    const checkUserType = db.collection('users').doc(user.uid);
    let retrievedUserType = "";
    checkUserType.get().then((doc) => {
        retrievedUserType = doc.data().type;

        const curr_user = db.collection("drivers").doc(user.uid);
        curr_user.get().then((doc) => {
            const retrievedName = doc.data().name;
            const retrievedOrder1 = doc.data().order1;
            // Update account button to show currently logged in user
            document.getElementById("nav-logged-in-user").innerHTML = "Welcome " + retrievedName;
            currDriver1 = retrievedOrder1;
        });
    }).catch((error) => {
        console.log("Error getting user data:", error);
    });
}

function display_curr_orders() {
    if (currDriver1 !== "none") {
        var ref = firebase.database().ref('AcceptedOrders/' + currDriver1);
        console.log(currDriver1);
        ref.once('value').then((snapshot) => {
            const orderInfo = snapshot.val();
            // Get the key of the inner object
            const innerKey = Object.keys(orderInfo)[0];
            // Access the inner object using the key
            const innerObject = orderInfo[innerKey];
            driver1name.innerHTML = innerObject.status + "<span id='minuteText'>";
            if (innerObject.status === "on the way") {
                one.classList.add("active");
                two.classList.add("active");
                three.classList.remove("active");
            }
            else if (innerObject.status === "delivered") {
                one.classList.add("active");
                two.classList.add("active");
                three.classList.add("active");
            }
            // var orderRef = firebase.database().ref('Orders/' + retrievedOrderID);
        }, {
            onlyOnce: false
        });
    } else {
        driver1.style.display = 'block';
        driver1.innerHTML = "<h1 id='driver1Name'>You have no current orders to fulfill!</h1>";
    }
}

function display_completed_orders(userID) {
    var ref = real_db.ref('Orders');
    var deliveredOrders = [];

    ref.once('value').then((snapshot) => {
        snapshot.forEach((childSnapshot) => {
            const status = childSnapshot.val().status;
            const resID = childSnapshot.val().restaurant_id;
            if (status === "delivered" && resID === userID) {
                const createdAt = childSnapshot.val().createdAt;
                const total_spend = childSnapshot.val().total_spend;
                deliveredOrders.push([createdAt, total_spend])
            }
        });
    });

    setTimeout(function () {
        display_completed_orders()
    }, 1000);

    display_completed_orders();

    function display_completed_orders() {

        const deliveredOrderList = document.getElementById("completed-order-list");
        console.log(deliveredOrders);
        // Add the first 5 delivered orders to the list
        for (const completedOrder in deliveredOrders) {
            const li = document.createElement("li");
            const createdAt = deliveredOrders[completedOrder][0];
            const total_spend = deliveredOrders[completedOrder][1];
            li.innerHTML = "Date: " + createdAt + " - $" + total_spend;
            deliveredOrderList.appendChild(li);
        }
    }

}