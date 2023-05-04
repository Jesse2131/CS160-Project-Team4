let counter = 1;
let order_counter = 1; 

function getRestName(user) {
    const restaurantsRef = db.collection("restaurants");
    
    return restaurantsRef
        .where("email", "==", user.email)
        .limit(1)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                return null;
            } else {
                const doc = querySnapshot.docs[0];
                const rest_name = doc.data().name;
                return rest_name;
            }
    });
}


function getRestaurants(){
    const restListElement = document.getElementById('rest-list');
    const restaurantsRef = db.collection("restaurants");
    const curr_user = firebase.auth().currentUser;

    // Get all documents in the collection
    restaurantsRef.get().then((querySnapshot) => {
        // Loop through each document
        querySnapshot.forEach((doc) => {
            // Get the data for the document
            const restaurantItem = doc.data();
            // Add data to list to display
            const restItemElement = document.createElement("div");
            restItemElement.classList.add('rest-item');
            restItemElement.innerHTML = `<span>${counter}. <h1>${restaurantItem.name}
            </h1><button onclick="goOrder()" id="rest_${doc.id}">Order Here</button></span>`;
            // Add event listener to button so we know which button was clicked
            const buttonElement = restItemElement.querySelector(`#rest_${doc.id}`);
            
            buttonElement.addEventListener('click', (event) => {
                const buttonId = event.target.id;
                console.log(`Button ${buttonId} was clicked.`);
                // do something with the button ID
                goOrder(buttonId);
            })
            restListElement.appendChild(restItemElement);
            counter++;
        });
    });
}


function getOrderHistory(){
    const orderListElement = document.getElementById('order-list');
    const ordersRef = real_db.ref("Orders");
    const curr_user = firebase.auth().currentUser;
    ordersRef.on('value', (snapshot) => {
        snapshot.forEach((orderSnap) => {
            const order = orderSnap.val();
            if(order.user_id === curr_user.uid){
                // Add data to list to display
                const orderItemElement = document.createElement("div");
                orderItemElement.classList.add('order-item');
                orderItemElement.innerHTML = `<span>${order_counter}. <h1>${order.restaurant_name}:</h1> <p>Status: ${order.status}</p>`;
                orderListElement.appendChild(orderItemElement);
                order_counter++; 
            }
        });
    });
}


function goOrder(restName){
    if(restName){
        const rest_id = restName.split('_').pop();
        // Set this restaurant ID in local storage so the customer page can access it  
        localStorage.setItem('order_restaurantId', rest_id);
        // Redirect to order page 
        window.location.href = "customerPage.html";
    }
}
 
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      getRestaurants();
      getOrderHistory();
    } else {
      console.log("Not logged in");
    }
});