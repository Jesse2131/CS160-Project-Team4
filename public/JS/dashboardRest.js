let driver1 = document.getElementById("driver1");
let driver1name = document.getElementById("driver1name");

const one = document.querySelector(".one");
const two = document.querySelector(".two");
const three = document.querySelector(".three");

let currDriver1 = "";


const database = firebase.database();

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Set session storage
        sessionStorage.setItem("currentUser", user.uid);
        // Display account page info
        display_user_info(user);
        setTimeout(function() {
            display_curr_orders();
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
        ref.once('value').then((snapshot) => {
            driver1.style.display = 'block';
            var retrievedOrderID = (snapshot.val() && snapshot.val().orderID) || 'none';
            var retrievedTime = (snapshot.val() && snapshot.val().duration) || 'none';
            var orderRef = firebase.database().ref('Orders/' + retrievedOrderID);
            orderRef.once('value').then((snapshot2 => {
                var retrievedProgress = (snapshot2.val() && snapshot2.val().progress) || 'none';
                driver1name.innerHTML = retrievedProgress + " - Driver 1" + "<span id='minuteText'>" + retrievedTime + " Min</span>";
                if(retrievedProgress === "on the way") {
                    one.classList.add("active");
                    two.classList.add("active");
                    three.classList.remove("active");
                }
                else if(retrievedProgress === "delivered") {
                    one.classList.add("active");
                    two.classList.add("active");
                    three.classList.add("active");
                }
            }));
        }, {
            onlyOnce: false
        });
    } else {
        driver1.style.display = 'block';
        driver1.innerHTML = "<h1 id='driver1Name'>You have no current orders to fulfill!</h1>";
    }
}
