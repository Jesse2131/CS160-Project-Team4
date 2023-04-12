let allInfo = document.getElementsByClassName("accInfoContainer");
let but1 = document.getElementById("accInfoButton1");
let but2 = document.getElementById("accInfoButton2");
let but3 = document.getElementById("accInfoButton3");
let but4 = document.getElementById("accInfoButton4");
const db = firebase.firestore();

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
    const curr_userID = sessionStorage.getItem("currentUser"); 
    const checkUserType = db.collection('users').doc(curr_userID);
    let retrievedUserType = "";
    checkUserType.get().then((doc) => {
        retrievedUserType = doc.data().type;
        document.getElementById("acc_type").placeholder = retrievedUserType;

        const curr_user = db.collection(retrievedUserType).doc(curr_userID);
        curr_user.get().then((doc) => {
            const retrievedName = doc.data().name;
            const retrievedEmail = doc.data().email;
            const retrievedAddress = doc.data().address;
            document.getElementById("username").placeholder = retrievedName;
            document.getElementById("email").placeholder = retrievedEmail;
            document.getElementById("address").placeholder = retrievedAddress;
        });
    }).catch((error) => {
        console.log("Error getting user data:", error);
    });
}

function updateInfo() {
    const curr_userID = sessionStorage.getItem("currentUser");
    const checkUserType = db.collection('users').doc(curr_userID);
    const usernameField = document.getElementById("username");
    const passwordField = document.getElementById("password");
    const emailField = document.getElementById("email");

    if (emailField.value !== "") {
        firebase.auth().curr_userID.updateEmail(emailField)
        .then(() => {
            document.getElementById("errormsg").innerHTML = "Changes saved successfully";
        }).catch((error) => {
            document.getElementById("errormsg").innerHTML = error;
        });
    }
    
}

window.onload = displayInfo();