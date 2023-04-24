let allInfo = document.getElementsByClassName("accInfoContainer");
let but1 = document.getElementById("accInfoButton1");
let but2 = document.getElementById("accInfoButton2");
let but3 = document.getElementById("accInfoButton3");
let but4 = document.getElementById("accInfoButton4");
const db = firebase.firestore();

async function getCharge(index){
    let chargeRequest = await fetch(
        `https://api.stripe.com/v1/charges`,
        {
            method: "GET",
            headers: {
            Authorization: `Bearer sk_test_51Mvuu4I6ZJcOWwlq0rLtERYLSP8MOAZYNq6dKQdpJfywIpdi8A5LEOgcl2oW5ynvWaidmPQArHvIAizmHX86IeRj009naEPT3c`,
            },
        }
    );
    
    let chargeRes = await chargeRequest.json();
    let charge_arr = chargeRes.data;

    let chargeRequest2 = await fetch(
        `https://api.stripe.com/v1/charges/${charge_arr[index].id}`,
        {
            method: "GET",
            headers: {
            Authorization: `Bearer sk_test_51Mvuu4I6ZJcOWwlq0rLtERYLSP8MOAZYNq6dKQdpJfywIpdi8A5LEOgcl2oW5ynvWaidmPQArHvIAizmHX86IeRj009naEPT3c`,
            },
        }
    );
    
    chargeRes2 = await chargeRequest2.json();
    console.log(chargeRes2.receipt_url);
}

function testing(){
    console.log("test");
}

// document.getElementById("receipt-testing").addEventListener("click", getCharge(0));

function viewAccDet() {
    let newView = document.getElementById("accountDetails");
    for (var i = 0; i < allInfo.length; i++) {
        allInfo[i].style.display = "none";
    }
    newView.style.display = "block";

    but2.classList.add('deselectedButton');
    but2.classList.remove('selectedButton');
    but3.classList.add('deselectedButton');
    but3.classList.remove('selectedButton');
    but4.classList.add('deselectedButton');
    but4.classList.remove('selectedButton');

    but1.classList.add('selectedButton');
    but1.classList.remove('deselectedButton');
}

function viewAddrInfo() {
    let newView = document.getElementById("addressInformation");
    for (var i = 0; i < allInfo.length; i++) {
        allInfo[i].style.display = "none";
    }
    newView.style.display = "block";

    but1.classList.add('deselectedButton');
    but1.classList.remove('selectedButton');
    but3.classList.add('deselectedButton');
    but3.classList.remove('selectedButton');
    but4.classList.add('deselectedButton');
    but4.classList.remove('selectedButton');

    but2.classList.add('selectedButton');
    but2.classList.remove('deselectedButton');
}

function viewPayInfo() {
    let newView = document.getElementById("paymentInformation");
    for (var i = 0; i < allInfo.length; i++) {
        allInfo[i].style.display = "none";
    }
    newView.style.display = "block";

    but1.classList.add('deselectedButton');
    but1.classList.remove('selectedButton');
    but2.classList.add('deselectedButton');
    but2.classList.remove('selectedButton');
    but4.classList.add('deselectedButton');
    but4.classList.remove('selectedButton');

    but3.classList.add('selectedButton');
    but3.classList.remove('deselectedButton');
}

function viewOrdrHist() {
    let newView = document.getElementById("orderHistory");
    for (var i = 0; i < allInfo.length; i++) {
        allInfo[i].style.display = "none";
    }
    newView.style.display = "block";

    but1.classList.add('deselectedButton');
    but1.classList.remove('selectedButton');
    but2.classList.add('deselectedButton');
    but2.classList.remove('selectedButton');
    but3.classList.add('deselectedButton');
    but3.classList.remove('selectedButton');

    but4.classList.add('selectedButton');
    but4.classList.remove('deselectedButton');
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        // Set session storage
        sessionStorage.setItem("currentUser", user.uid);
        // Email is given
        document.getElementById("email").placeholder = user.email;
        // Query db for additional data
        const checkUserType = db.collection('users').doc(user.uid);
        let retrievedUserType = "";
        checkUserType.get().then((doc) => {
            retrievedUserType = doc.data().type;
            document.getElementById("acc_type").placeholder = retrievedUserType;

            const curr_user = db.collection(retrievedUserType).doc(user.uid);
            curr_user.get().then((doc) => {
                const retrievedName = doc.data().name;
                const retrievedAddress = doc.data().address;
                document.getElementById("username").placeholder = retrievedName;
                document.getElementById("address").placeholder = retrievedAddress;
            });
        }).catch((error) => {
            console.log("Error getting user data:", error);
        });
    } else {
      // No user is signed in.
      console.log('User is not signed in');
    }
  });
  

// function displayInfo() {

//     const curr_userID = sessionStorage.getItem("currentUser"); 
//     const checkUserType = db.collection('users').doc(curr_userID);
//     let retrievedUserType = "";
//     checkUserType.get().then((doc) => {
//         retrievedUserType = doc.data().type;
//         document.getElementById("acc_type").placeholder = retrievedUserType;

//         const curr_user = db.collection(retrievedUserType).doc(curr_userID);
//         curr_user.get().then((doc) => {
//             const retrievedName = doc.data().name;
//             const retrievedEmail = doc.data().email;
//             const retrievedAddress = doc.data().address;
//             document.getElementById("username").placeholder = retrievedName;
//             document.getElementById("email").placeholder = retrievedEmail;
//             document.getElementById("address").placeholder = retrievedAddress;
//         });
//     }).catch((error) => {
//         console.log("Error getting user data:", error);
//     });
// }

function updateInfo() {
    const curr_user = firebase.auth().currentUser;
    // Text fields
    const usernameField = document.getElementById("username").value;
    const passwordField = document.getElementById("password").value;
    const emailField = document.getElementById("email").value;
    
    
    if (emailField.value !== "") {
        curr_user.updateEmail(emailField)
        .then(() => {
            document.getElementById("errormsg").innerHTML = "Changes saved successfully";
        }).catch((error) => {
            document.getElementById("errormsg").innerHTML = error;
        });
    }
}

// window.onload = displayInfo();