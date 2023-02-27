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
    const emailVal = document.getElementById('email_sign').value;
    const passwordVal = document.getElementById('password_sign').value;
    firebase.auth().createUserWithEmailAndPassword(emailVal, passwordVal)
      .then(userCredential => {
        // User signed up successfully
        console.log(userCredential);
        alert('User signed up successfully!');
        // Redirect to login page or do other actions
        window.location.href = 'index.html';
      })
      .catch(error => {
        // Handle errors here
        console.error(error);
        alert(error.message);
    });
}

