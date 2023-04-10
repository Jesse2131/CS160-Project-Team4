let allInfo = document.getElementsByClassName("accInfoContainer");
let but1 = document.getElementById("accInfoButton1");
let but2 = document.getElementById("accInfoButton2");
let but3 = document.getElementById("accInfoButton3");
let but4 = document.getElementById("accInfoButton4");

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

function displayInfo() {
    const db = firebase.firestore();
    const curr_userID = sessionStorage.getItem("currentUser");
    const curr_user = db.collection('drivers').doc(curr_userID);
    return curr_user.get()
        .then((doc) => {
            let retrievedEmail = "";
            retrievedEmail = doc.data().email;
            document.getElementById("email").placeholder = retrievedEmail;
        })
        .catch((error) => {
            console.log("Error getting user data:", error);
            return "";
        });
}

window.onload = displayInfo();