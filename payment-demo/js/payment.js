firebase.initializeApp(firebaseConfig);
firebase.analytics();

const database = firebase.database();

function readOrders(){
  const dbRef = database.ref();
  dbRef.child("Orders").get().then(async (snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      var temp_arr = [];

      snapshot.forEach((childSnapshot) => {
          temp_arr.push(childSnapshot.val());
      });

      tableCreate(temp_arr);
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });
}

function tableCreate(temp_arr) {
//body reference 
var body = document.getElementsByClassName("order-quantity")[0];

// create elements <table> and a <tbody>
var tbl = document.createElement("table");
var tblBody = document.createElement("tbody");

var row_name = document.createElement("tr");
var cell_name_1 = document.createElement("th");
var cell_name_2 = document.createElement("th");

var name1 = document.createTextNode("Order");
var name2 = document.createTextNode("Quantity");

cell_name_1.appendChild(name1);
cell_name_2.appendChild(name2)

row_name.appendChild(cell_name_1);
row_name.appendChild(cell_name_2);
tblBody.appendChild(row_name);

temp_arr.map((val) => {
    
    var row = document.createElement("tr");
    var cell = document.createElement("td");
    var cell2 = document.createElement("td");

    var cellText = document.createTextNode(val.order);
    var cellText2 = document.createTextNode(val.quantity);

    cell.appendChild(cellText);
    cell2.appendChild(cellText2);
    cell2.setAttribute("padding-left", "20px");
    cell.setAttribute("text-align", "center");
    cell2.setAttribute("text-align", "center");
    row.appendChild(cell);
    row.appendChild(cell2);
    tblBody.appendChild(row);
});

// append the <tbody> inside the <table>
tbl.appendChild(tblBody);
// put <table> in the <body>
body.appendChild(tbl);
// tbl border attribute to 
//tbl.setAttribute("border", "2");
}

readOrders();