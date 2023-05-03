let driver1 = document.getElementById("driver1");
let driver1name = document.getElementById("driver1name");

const one = document.querySelector(".one");
const two = document.querySelector(".two");
const three = document.querySelector(".three");

let status = "";
let currDriver1 = "";


const database = firebase.database();

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Set session storage
        sessionStorage.setItem("currentUser", user.uid);
        // Display account page info
        display_user_info(user);
        setTimeout(function() {
            link_to_dashboard();
            if (status !== "offline") {
                display_curr_orders();
            }
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

        const curr_user = db.collection(retrievedUserType).doc(user.uid);
        curr_user.get().then((doc) => {
            const retrievedName = doc.data().name;
            const retrievedStatus = doc.data().status;
            const retrievedOrder1 = doc.data().order1;
            // Update account button to show currently logged in user
            document.getElementById("nav-logged-in-user").innerHTML = "Welcome " + retrievedName;
            if (retrievedStatus === "delivering") {
                one.classList.add("active");
                two.classList.remove("active");
                three.classList.remove("active");
            }
            status = retrievedStatus;
            currDriver1 = retrievedOrder1;
        });
    }).catch((error) => {
        console.log("Error getting user data:", error);
    });
}

function display_curr_orders() {
    if (currDriver1 !== "none") {
        var ref = firebase.database().ref('activeOrders/' + currDriver1);
        ref.once('value').then((snapshot) => {
            driver1.style.display = 'block';
            var retrievedDriverID = (snapshot.val() && snapshot.val().driver_id) || 'none';
            var retrievedDuration = (snapshot.val() && snapshot.val().duration) || 'none';
            driver1name.innerHTML = retrievedDriverID + " Driver 1" + "<span id='minuteText'>" + retrievedDuration + " Min</span>";
        }, {
            onlyOnce: false
        });
    } else {
        driver1.style.display = 'block';
        driver1.innerHTML = "<h1 id='driver1Name'>You have no current orders to fulfill!</h1>";
    }
}

two.onclick = function() {
    if (currDriver1 !== "none") {
        var ref = firebase.database().ref('activeOrders/' + currDriver1);
        var updates = {};
        updates['/status'] = "on the way";
        ref.update(updates);
        one.classList.add("active");
        two.classList.add("active");
        three.classList.remove("active");
    }
}

three.onclick = function() {
    if (currDriver1 !== "none") {
        var ref = firebase.database().ref('activeOrders/' + currDriver1);
        var updates = {};
        updates['/status'] = "delivered";
        ref.update(updates);
        one.classList.add("active");
        two.classList.add("active");
        three.classList.add("active");
    }

    setTimeout(function() {
        display_curr_orders();
    }, 500);
}