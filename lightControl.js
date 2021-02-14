const { Client } = require('tplink-smarthome-api');


const client = new Client();




client.startDiscovery()
console.log(client.devices)
console.log(client.devices.values())

let values = client.devices.values()

console.log(values.Bulb)
console.log(values.next().value)


function bulbToggle() {
    //get the bulb from IP
    let device = client.getDevice({ host: '192.168.0.164' }).then( async (device) => {
        // Toggle Bulb on off
        device.setPowerState(!await device.getPowerState())  
    }) 
}

