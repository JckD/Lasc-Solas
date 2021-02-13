const { Client } = require('tplink-smarthome-api');


const client = new Client();



     let devices = client.startDiscovery()


     console.log(devices.devices)
     let values = [...devices.devices.entires()];

     console.log(values)


function bulbToggle() {
    //get the bulb from IP
    let device = client.getDevice({ host: '192.168.0.164' }).then( async (device) => {
        // Toggle Bulb on off
        device.setPowerState(!await device.getPowerState())  
    }) 
}




