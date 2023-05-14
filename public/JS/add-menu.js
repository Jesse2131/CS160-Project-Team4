let counter = 1;
function addToMenu(event){
    /*  Collection represents a restaurants menu(named Name-Menu, ie FoodInc-Menu)
            Documents inside of collection represents each menu item
                Name:
                Price:
                Image: 
    */
    event.preventDefault();

    const curr_user = firebase.auth().currentUser;
    // Input form values
    const item_name = document.getElementById("new-menu-item-name").value;
    let item_price = "";
    try{
        item_price = parseFloat(document.getElementById("new-menu-item-price").value).toFixed(2);
    }
    catch(error){
        document.getElementById("errormsg").innerHTML = error.message;
        return;
    }

    console.log(item_price);
    // Make sure item_price is a number
    if (isNaN(item_price) || item_price < 0 || item_price > 100){
        document.getElementById("errormsg").innerHTML = "Price must be a number between 0 and 100";
        return;
    }

    // create document for menu item and add it to proper collection
    if(item_name !== "" && item_price !== ""){
        getRestName(curr_user).then((rest_name) => {
            // Collections for each restaurants menus are in the format
            // Restaurantname_Menu. If restaurant names have spaces replace with "_"
            console.log(rest_name);
            const formatted_rest_name = rest_name.replace(/ /g, "_") + "_Menu"; 
            // Add item and price to collection
            createCollection(formatted_rest_name, item_name, item_price);
        });
    }
    else{
        document.getElementById("errormsg").innerHTML = "Please fill out both forms";
    }

}

function getRestName(user) {
    const restaurantsRef = db.collection("restaurants");
    return restaurantsRef
        .where("email", "==", user.email)
        .limit(1)
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                console.log("didn't find anyone");
                return null;
            } else {
                const doc = querySnapshot.docs[0];
                const rest_name = doc.data().name;
                console.log(rest_name);
                return rest_name;
            }
    });
}

function createCollection(...params) {

    // unpack params 
    const [formatted_rest_name, item_name, item_price] = params

    // Check for duplicates before adding item
    db.collection(formatted_rest_name)
    .where("item_name", "==", item_name)
    .get()
    .then((querySnapshot) => {
        if (!querySnapshot.empty) {
            // Document with matching item name and price already exists
            document.getElementById("errormsg").innerHTML = "This item already exists on the menu";
        } else {
            // No duplicates found, add item to menu
            db.collection(formatted_rest_name).add({
                item_name: item_name,
                item_price: item_price
            }).then((docRef) => {
                document.getElementById("errormsg").innerHTML = "Menu Item added successfully!";
                // Display on menu
                const menuListElement = document.getElementById('menu-list');
                const menuItemElement = document.createElement('div');
                menuItemElement.classList.add('menu-item');
                menuItemElement.innerHTML = `<span>${counter}. <h1>${item_name}</h1> $<p>${item_price}</p></span>`;
                menuListElement.appendChild(menuItemElement);
                counter++;
            }).catch((error) => {
                document.getElementById("errormsg").innerHTML = error;
            });
        }
    });

    return;
}

function getMenu(){
    const menuListElement = document.getElementById('menu-list');
    const curr_user = firebase.auth().currentUser;
    getRestName(curr_user).then((rest_name) => {
        const formatted_rest_name = rest_name.replace(/ /g, "_") + "_Menu"; 
        const menuItemsRef = firebase.firestore().collection(formatted_rest_name);
        menuItemsRef.get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                const menuItem = doc.data();
                const menuItemElement = document.createElement('div');
                menuItemElement.classList.add('menu-item');
                menuItemElement.innerHTML = `<span>${counter}. <h1>${menuItem.item_name}</h1> $<p>${menuItem.item_price}</p></span>`;
                menuListElement.appendChild(menuItemElement);
                counter++;
            });
        });
    });
}
 
firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      getMenu();
    } else {
      console.log("Not logged in");
    }
});