const { Client } = require('tplink-smarthome-api');
const { jscolor } = require('@eastdesire/jscolor');

const client = new Client();




client.startDiscovery()
console.log(client.devices)
console.log(client.devices.values())

let values = client.devices.values()

console.log(values.Bulb)
console.log(values.next().value)

// Toggle the bulb on/off
// currently hardcoded to single bulb
function bulbToggle() {
    //get the bulb from IP
    let device = client.getDevice({ host: '192.168.0.164' }).then( async (device) => {
        // Toggle Bulb on off
        device.setPowerState(!await device.getPowerState())  
    }) 
}

// Handle bulb changing colour from picker
function bulbColour(picker) {
    console.log('test')
   // document.getElementById
}

