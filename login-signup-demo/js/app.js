firebase.initializeApp(firebaseConfig);
firebase.analytics();

function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  firebase.auth().signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
      // Signed in
      const user = userCredential.user;
      console.log(user);
      // Redirect to dashboard or home page
      window.location.href = 'index.html';
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
      alert(errorMessage);
    });
}

function signup() {
    const email = document.getElementById('email_sign').value;
    const password = document.getElementById('password_sign').value;
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(userCredential => {
        // User signed up successfully
        console.log(userCredential);
        alert('User signed up successfully!');
        // Redirect to login page or do other actions
        window.location.href = 'index.html';
      })
      .catch(error => {
        // Handle errors here
        document.getElementById("errormsg").innerHTML = error.message;
    });
}

