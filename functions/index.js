const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
var c = 0;
var d = 0;
var a = 0;
var b = 0;
// auth trigger (new user signup)
exports.newUserSignUp = functions.auth.user().onCreate(user => {
  // for background triggers you must return a value/promise
  return admin.firestore().collection('users').doc(user.uid).set({
    email: user.email
  });
});

// auth trigger (user deleted)
exports.userDeleted = functions.auth.user().onDelete(user => {
  const doc = admin.firestore().collection('users').doc(user.uid);
  return doc.delete();
});

/**
 * Receive data from pubsub, then
 * Maintain last device data on Firestore 'devices' collections then
 * Write telemetry raw data to 'devices/location_logs' subcollection
 */

exports.receiveTelemetry = functions.pubsub
  .topic('iot-topic')
  .onPublish((message, context) => {
    const payload = message.json;
    const data = {
      latitude: parseFloat(payload.latlon.lat),
      longitude: parseFloat(payload.latlon.lon)
    };
    let curi=0;
    if (payload.mode===1){
      b=0;
      c=0;
      d=0;
      let deviceRef = db.collection('users').doc(user.uid).collection('devices').doc(deviceID);
      return deviceRef.set({
              Pencurian: curi,
              RealLat: data.latitude,
              RealLong: data.longitude,
              timestamp: admin.firestore.Timestamp.now()
            });
    } else {
      if(b===0){
        c=data.latitude;
        d=data.longitude;
        b=1;
      }
      if( getDistanceFromLatLonInKm(data.latitude,data.longitude,c,d)>=0.5){
        curi=1;
      }
        let deviceRef = db.collection('users').doc(user.uid).collection('devices').doc(deviceID).collection('histori');
        return deviceRef.add({
                pencurian: curi,
                Lat: data.latitude,
                Long: data.longitude,
                timestamp: admin.firestore.Timestamp.now()
              });   

    }
    });


//kirim data dari firebase ke Google Cloud
const cloudRegion = 'asia-east1';
var deviceID;
var devnam;
const projectId = 'tugasakhir-3f92c';
const registryId = 'iot-registry';
const data = 'OFF';
const version = 0;
const iot = require('@google-cloud/iot');
const iotClient = new iot.v1.DeviceManagerClient();

exports.updateConfig = functions.auth.user().onCreate(user => {
  modifyCloudToDeviceConfig();
});

async function modifyCloudToDeviceConfig() {
  // Construct request
  const formattedName = iotClient.devicePath(
    projectId,
    cloudRegion,
    registryId,
    deviceID
  );

  const binaryData = Buffer.from(data).toString('base64');
  const request = {
    name: formattedName,
    versionToUpdate: version,
    binaryData: binaryData,
  };

  const [response] = await iotClient.modifyCloudToDeviceConfig(request);
  console.log('Success:', response);
}

//hitung jarak
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

//insert device
exports.insertDevice = functions.https.onCall((data, context) =>{
  deviceID = data.text1;
  devnam = data.text2;
  let deviceRef = db.collection('devices').doc(deviceID);
  return deviceRef.set({
    Owner: context.auth.uid,
    Daya : 0,
    Pencurian: 0,
    RealLat: 0,
    RealLong: 0,
    ReqReal: 0,
    Trigger: 0,
    name: devnam,
  },{merge:true});
});

//ubah status realtime
exports.statusRealTime = functions.https.onCall((data, context) =>{
 deviceID = data.text1;
 status = data.text2;
 let deviceRef = db.collection('devices').doc(deviceID);
 return deviceRef.set({
   ReqReal: status
 },{merge:true});
});

//ubah status trigger mode
exports.TriggerMode = functions.https.onCall((data, context) =>{
  deviceID = data.text1;
  status = data.text2;
  let deviceRef = db.collection('devices').doc(deviceID);
  return deviceRef.set({
    Trigger: status
  },{merge:true});
 });