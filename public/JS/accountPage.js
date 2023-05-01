let allInfo = document.getElementsByClassName("accInfoContainer");
let but1 = document.getElementById("accInfoButton1");
let but2 = document.getElementById("accInfoButton2");
let but3 = document.getElementById("accInfoButton3");
let but4 = document.getElementById("accInfoButton4");

const database = firebase.database();

function createTable(arr) {
//body reference 
var body = document.getElementsByClassName("order_history")[0];

arr.map((val, index) => {
  var row = document.createElement("div");
  row.classList.add("row");

  var createdAt = document.createTextNode(val.createdAt);
  var restaurant = document.createTextNode(val.restaurant_name);
  var total_spend = document.createTextNode(val.total_spend);
  var status = document.createTextNode(val.status);
  var payment_type = document.createTextNode(val.payment_type);

  var text1 = document.createElement("text");
  var text2 = document.createElement("text");
  var text3 = document.createElement("text");
  var text4 = document.createElement("text");
  var text5 = document.createElement("text");

  text1.appendChild(createdAt);
  text2.appendChild(restaurant);
  text3.appendChild(total_spend);
  text4.appendChild(status);
  text5.appendChild(payment_type);

  var receipt = document.createElement("div");
  receipt.classList.add("order-receipt-button");

  var link = document.createElement("a");
  link.setAttribute("id", "view_receipt" + index);

  var view = document.createTextNode("View Receipt");
  link.appendChild(view);

  receipt.appendChild(link);

  row.appendChild(text1);
  row.appendChild(text2);
  row.appendChild(text3);
  row.appendChild(text4);
  row.appendChild(text5);
  row.appendChild(receipt);
  
  body.appendChild(row);

  getCharge(val.charge_id, index);
});
}

console.log(localStorage.getItem("current_order"));

function readOrders(){
  const dbRef = database.ref();
  dbRef.child("Orders").get().then(async (snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      var arr = [];

      snapshot.forEach((childSnapshot) => {
          arr.push(childSnapshot.val());
      });
      createTable(arr);
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
}

readOrders();

async function getCharge(id, index){
    let chargeRequest2 = await fetch(
        `https://api.stripe.com/v1/charges/${id}`,
        {
            method: "GET",
            headers: {
            Authorization: `Bearer sk_test_51Mvuu4I6ZJcOWwlq0rLtERYLSP8MOAZYNq6dKQdpJfywIpdi8A5LEOgcl2oW5ynvWaidmPQArHvIAizmHX86IeRj009naEPT3c`,
            },
        }
    );
    
    chargeRes2 = await chargeRequest2.json();
    console.log(chargeRes2.receipt_url);

    var a = document.getElementById("view_receipt" + index);
    a.href = chargeRes2.receipt_url;
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


function updateInfo() {
    const curr_user = firebase.auth().currentUser;
    const curr_user_id = curr_user.uid;
    // Text fields
    const usernameField = document.getElementById("username").value;
    const emailField = document.getElementById("email").value;

    if (emailField !== "") {
        curr_user.updateEmail(emailField)
        .then(() => {
            document.getElementById("errormsg").innerHTML = "Changes saved successfully";
        }).catch((error) => {
            document.getElementById("errormsg").innerHTML = error;
        });
    }
    else if(usernameField !== ""){
        getUserType(curr_user.uid)
        .then(userType => {
            const userRef = db.collection(userType).doc(curr_user.uid);
            updateAttribute(userRef, "name", usernameField);
        });
    }
    // TODO: 
    // Add code for address update 
}

// For email reset
document.getElementById("reset-password-link").addEventListener("click", function(event) {
    // Prevent the link from navigating to a new page
    event.preventDefault(); 
    resetPassword();
});

function resetPassword() {
    const curr_user_email = firebase.auth().currentUser.email;
    firebase.auth().sendPasswordResetEmail(curr_user_email).then(function() {
      // Password reset email sent.
      document.getElementById("errormsg").innerHTML = "An email as been sent to you to reset your password";
    }).catch(function(error) {
      document.getElementById("errormsg").innerHTML = error;
    });
}

// Function to query the DB
function updateAttribute(userRef, attribute, updatedValue) {
    const updateObject = {};
    updateObject[attribute] = updatedValue;
  
    userRef.update(updateObject)
    .then(() => {
        document.getElementById("errormsg").innerHTML = "Changes saved successfully";
    })
    .catch((error) => {
        document.getElementById("errormsg").innerHTML = error;
    });
}
