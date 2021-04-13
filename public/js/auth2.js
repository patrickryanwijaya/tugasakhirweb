const signOut = document.querySelector('.logout2');
const requestModal = document.querySelector('.req-track');
const reqLink = document.querySelectorAll('.add-track');
const pageHeader = document.querySelector('.page-header');
const pilihTrack = document.querySelector('.pilihTrack');
const marker = document.querySelector('.markerTrack');
const insertID = document.querySelector('.req-track form');
const tombolStart = document.querySelector('.tombol.starting');
const tombolEnd = document.querySelector('.tombol.ending');

var x;

firebase.auth().onAuthStateChanged(user => {
  if (!user) {
    window.location.href = "/";
  } else {
    document.getElementById('bodyIdDash').style.visibility = "visible";
    let html = '';
    html = `${user.email}`;
    document.querySelector('.username').innerHTML = html;
    let elements = document.getElementsByClassName('tracklist');
    for(let el of elements){
     new Vue({
      el: el,
      data: {
        trackers: [],
      },
      methods: {
        displayData(name,id) {
          let html2 = '';
          html2 = `<i class="fa fa-map-marker"></i>${name}`;
          pageHeader.innerHTML = html2;
          marker.innerHTML = html2;
          x=id;
          getMap(x);
          toggleButton(x);
          console.log(x);
        }
      },
      mounted() {
        const ref = firebase.firestore().collection('devices').where('Owner', '==', user.uid);
        ref.onSnapshot(snapshot => {
          let trackers = [];
          snapshot.forEach(doc => {
            trackers.push({...doc.data(), id: doc.id});
          });
          this.trackers = trackers;
        });
      }
    });
  }
    function getMap(id){
    const map = firebase.firestore().collection('devices').doc(id);
    map.onSnapshot(doc => {
        initMap(doc.data().RealLat,doc.data().RealLong) ;
    });
    };

  }
   
});

signOut.addEventListener('click', () => {
    firebase.auth().signOut()
      .then(() => {console.log('signed out');
      });
  });
// open request modal
reqLink.forEach(function(requestLink) {
  requestLink.addEventListener('click', () => {
    requestModal.classList.add('open');
  });
});
// close request modal
requestModal.addEventListener('click', (e) => {
  if (e.target.classList.contains('req-track')) {
    requestModal.classList.remove('open');
  }
});

//Insert Device
insertID.addEventListener('submit', (e) => {
  e.preventDefault();
  const insertDevice = firebase.functions().httpsCallable('insertDevice');
  const insertName = firebase.functions().httpsCallable('insertName');
  insertDevice({
    text1: insertID.deviceID.value,
    text2: insertID.devnam.value
  })
  .then(() => {
    insertID.reset();
    requestModal.classList.remove('open');
  });
});


//Google Maps
function initMap(latt,long){

  // Map option

  var options = {
      center: {lat: latt , lng: long },
      zoom: 18.5
  }

  //New Map
  map = new google.maps.Map(document.getElementById("map"),options)

  //Marker
  const marker = new google.maps.Marker({
  position:{lat: latt , lng: long },
  map:map
  });
};

//tombol kontol
tombolStart.addEventListener('click', () => {
  const statusRealTime = firebase.functions().httpsCallable('statusRealTime');
  statusRealTime({
    text1: x,
    text2: 1,
  })
  .then(() => {
    toggleButton(x);
  });
});

tombolEnd.addEventListener('click', () => {
  const statusRealTime = firebase.functions().httpsCallable('statusRealTime');
  statusRealTime({
    text1: x,
    text2: 0,
  })
  .then(() => {
    toggleButton(x);
  });
});
function toggleButton(id){
  console.log(id);
  const trackDB = firebase.firestore().collection('devices').doc(id);
  trackDB.onSnapshot(doc => {
      if(doc.data().ReqReal==1){
        tombolStart.classList.remove('aktif');
        tombolEnd.classList.add('aktif');
      }else{
        tombolEnd.classList.remove('aktif');
        tombolStart.classList.add('aktif');
      }
  });
};