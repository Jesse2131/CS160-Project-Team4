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
    
    // Input form values
    const item_name = document.getElementById("new-menu-item-name").value;
    const item_price = document.getElementById("new-menu-item-price").value;
    
    // Add document to collection and grab values from input forms 

}