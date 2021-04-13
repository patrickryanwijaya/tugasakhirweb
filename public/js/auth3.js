//auth listener
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log('sudahlogin');
      window.location.href = "dashboard.html";
    } else {
      document.getElementById('bodyId').style.visibility = "visible";
    } 
  });

