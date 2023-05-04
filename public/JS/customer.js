let cart = [];

var myStyles = [
  {
    featureType: "poi",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "transit",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  }
];


const sendOrder = document.getElementById('sendOrder');
sendOrder.addEventListener('click', function () {
  window.location.href = `http://${window.location.host}/checkout_detail.html`
});


function getRestMenu(restID) {
  // const restID = "130B8712-FC53-4A93-9E78-AC44F29B3F2B";
  console.log("loading menu for " + restID);

  const restaurantsCollection = db.collection('restaurants');

  restaurantsCollection.doc(restID).get()
  .then((doc) => {
    if (doc.exists) {
      const data = doc.data();
      const rest_name = data.name; 
      console.log(rest_name);
      const formatted_rest_name = rest_name.replace(/ /g, "_") + "_Menu";
      // Use this name to load the menu items
      console.log(formatted_rest_name);
      loadRestaurantMenu(formatted_rest_name);
    } else {
      console.log("No such document!");
    }
  })
  .catch((error) => {
    console.log("Error getting document: ", error);
  });
}

function loadRestaurantMenu(rest_name){
  const myCollection = db.collection(rest_name);
  document.getElementById("order_RestName").innerHTML = rest_name;

  myCollection.get().then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      addItem(data.item_name, data.item_price, 0);
    });
  })
  .catch((error) => {
    console.log("Error getting documents: ", error);
  });
}

function addItem(label, price, quantity) {
  // Get the table body element
  const tableBody = document.getElementById('table-body');

  // Create a new row element
  const newRow = document.createElement('tr');

  // Create label cell and set the text content
  const labelCell = document.createElement('td');
  labelCell.textContent = label;
  newRow.appendChild(labelCell);

  // Create price cell and set the text content
  const priceCell = document.createElement('td');
  priceCell.textContent = '$' + price + '';
  newRow.appendChild(priceCell);

  // Create quantity cell and input field
  const quantityCell = document.createElement('td');
  const quantityInput = document.createElement('input');
  quantityInput.type = 'number';
  quantityInput.min = 0;
  quantityInput.max = 10;
  quantityInput.value = quantity;
  quantityCell.appendChild(quantityInput);
  newRow.appendChild(quantityCell);

  // Create add button cell and set the click event listener
  const addButtonCell = document.createElement('td');
  const addButton = document.createElement('button');
  addButton.textContent = 'Add';
  addButton.addEventListener('click', () => {
    const quantity = quantityInput.value;
    // TODO: Add logic to add item to cart
    if (quantity > 0) {
      //   name: "Trip minimum",
      //   price: 5,
      //   quantity: 1,
      const data = {
        id: (Math.random() * 1000).toFixed(0).toString(),
        name: label,
        price: price,
        quantity: quantity,
      };
      cart = JSON.parse(localStorage.getItem("cart"));
      cart.push(data);
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCart(label, data.price, quantity, data.id);
      console.log(cart);
    }
  });
  addButtonCell.appendChild(addButton);
  newRow.appendChild(addButtonCell);

  // Add the new row to the table body
  tableBody.appendChild(newRow);

  
}

function updateProcessButton() {
  // Get sum prices from cart-items 
  const cartItems = document.getElementById('cart-items');
  const cartItemsRows = cartItems.getElementsByTagName('tr');
  let sum = 0;
  for (let i = 0; i < cartItemsRows.length; i++) {
    const row = cartItemsRows[i];
    const price = row.getElementsByTagName('td')[1].textContent;
    sum += parseFloat(price.substring(1));
  }
  sendOrder.textContent = "Process Order: " + "$" + sum.toFixed(2) + "";
};

function updateCart(label, price, quantity, id) {
  // Get the table body element
  const tableBody = document.getElementById('cart-items');

  // Create a new row element
  const newRow = document.createElement('tr');

  // Create label cell and set the text content
  const labelCell = document.createElement('td');
  labelCell.textContent = label;
  newRow.appendChild(labelCell);

  // Create price cell and set the text content
  const priceCell = document.createElement('td');
  priceCell.textContent = "$" + (price * quantity).toFixed(2) + "";
  newRow.appendChild(priceCell);

  // Create quantity cell and input field
  const quantityCell = document.createElement('td');
  quantityCell.textContent = quantity;
  newRow.appendChild(quantityCell);

  // Create add button cell and set the click event listener
  const addButtonCell = document.createElement('td');
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.style.backgroundColor = 'red';
  deleteButton.addEventListener('click', () => {
    newRow.remove();
    cart = JSON.parse(localStorage.getItem("cart"));
    cart = cart.filter((order) => {return order.id != id});
    console.log(id);
    console.log(cart);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateProcessButton();
  });
  addButtonCell.appendChild(deleteButton);
  newRow.appendChild(addButtonCell);
  // Add the new row to the table body
  tableBody.appendChild(newRow);

  updateProcessButton();
}


window.onload = function () {
  if (localStorage.getItem("cart") === null) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }else{
    cart = JSON.parse(localStorage.getItem("cart"));
    cart.forEach((order) => {
      updateCart(
        order.name,
        order.price,
        order.quantity,
        order.id,
      );
    });
  }

  const restaurantId = localStorage.getItem('order_restaurantId');
  getRestMenu(restaurantId);
  
  cart = JSON.parse(localStorage.getItem("cart"));
  console.log(cart);

  // sets navbar username 
  document.getElementById("nav-logged-in-user").innerHTML = "Welcome " + localStorage.getItem("userName");

}