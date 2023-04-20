function addToMenu(event){
    /*  Collection represents a restaurants menu(named Name-Menu, ie FoodInc-Menu)
            Documents inside of collection represents each menu item
                Name:
                Price:
                Image: 
    */
    event.preventDefault();
    // Get currently logged in rest user 
    const curr_user = firebase.auth().currentUser;
    console.log(curr_user);
    // Input form values
    const item_name = document.getElementById("new-menu-item-name").value;
    const item_price = document.getElementById("new-menu-item-price").value;
    
    // create document for menu item and add it to proper collection
    if(item_name !== "" && item_price !== ""){
        getRestName(curr_user).then((name) => {
            console.log(name);
        });
    }
    else{
        document.getElementById("errormsg").innerHTML = "Please fill out both forms";
    }
}

function getRestName(user) {
    const restaurantsRef = db.collection("restaurants");
  
    restaurantsRef
        .where("email", "==", user.email)
        .limit(1)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
            const name = doc.data().name;
            return name;
        });
    });
}
  