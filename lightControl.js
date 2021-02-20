require('dotenv').config()
const { login } = require("tplink-cloud-api");
const jscolor = require('@eastdesire/jscolor');
const rgb = require('hsv-rgb');


async function getDevices()  {
    //console.log('test')
    const tplink = await login(process.env.TPLINK_USER, process.env.TPLINK_PW) 
    let deviceList  = await tplink.getDeviceList();

    console.log(deviceList);

    let bigLight = await tplink.getLB130("BigLight")

    //console.log(await bigLight.isOn());
    let deviceTable = document.getElementById('deviceTableBody')
    //console.log(deviceTable)
    console.log(deviceList[0])
    for(i in deviceList) {

        let rowCount = deviceTable.rows.length;
        let row = deviceTable.insertRow(rowCount);
        
        // Add device name cell  from devices list alias
        let deviceNameCell = row.insertCell(0);
        deviceNameCell.innerHTML = deviceList[i].alias

        // Add power switch cell
        let powerCell = row.insertCell(1)
        let checkboxDiv = document.createElement('div');
        checkboxDiv.className = "custom-switch"

        let checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.id="switch-"+i;

        if (await bigLight.isOn()) {
            checkbox.checked = 'checked';
        } else {
            checkbox.checked = '';
        }
        
        checkbox.onchange = function(){bulbToggle(bigLight)};
        let label = document.createElement('label');
        label.htmlFor = checkbox.id

        checkboxDiv.appendChild(checkbox)
        checkboxDiv.appendChild(label)
        powerCell.appendChild(checkboxDiv)

        let colorCell = row.insertCell(2);
        
        let lightState = await bigLight.getState()
        //console.log(lightState)

        let color = rgb(lightState.hue, lightState.saturation, lightState.brightness)
        let deviceName = deviceList[i].alias

        let button = document.createElement('button');
        let pickerConfig = {
            backgroundColor : '#333',
            onChange : 'bulbColour(this)',
            value : 'rgba('+ color[0] +',' + color[1] + ',' + color[2] +')'
        };
        var picker = new jscolor(button, pickerConfig);
        colorCell.appendChild(button)
        //colorCell.innerHTML = '<button  data-jscolor="{pickerConfig}" id="colorInput"">'

        jscolor.install()

        // add wave button
        let waveButtonCell = row.insertCell(3);
        let waveDiv = document.createElement('div');
        waveDiv.className = "custom-switch"

        let waveButton = document.createElement('input')
        waveButton.type = "checkbox";
        waveButton.id="switch-"+(50 + i);
        let waving = false
        waveButton.innerHTML = 'start'
        let wavfunc;
        waveButton.onchange = function(){slowColorChange(bigLight, wavfunc, waveButton.checked)}
        let waveLabel = document.createElement('label');
        waveLabel.htmlFor = waveButton.id
        waveDiv.appendChild(waveButton)
        waveDiv.appendChild(waveLabel)
        waveButtonCell.appendChild(waveDiv)
    }
}

// Toggle the bulb on/off
function bulbToggle(bulb) {  
    bulb.toggle()
}

// Handle bulb changing colour from picker
async function bulbColour(picker, bulb) {
    const tplink = await login(process.env.TPLINK_USER, process.env.TPLINK_PW) 
    let deviceList  = await tplink.getDeviceList();

    let bigLight = await tplink.getLB130('BigLight').setState(1, 75, picker.channels.h, picker.channels.s, 0 )
}


// Wave function that cycles through colours every 3 seconds
// takes the checked status of the switch
function slowColorChange(bulb, wavfunc, checked) {
    
    if (checked) {
        wavefunc = setInterval(function(){
            i = i + 10;
            if (i == 360) {
                i = 0;
            }
            changeColor(i) 
            
            
        }, 3000);

    } else {
        clearInterval(wavefunc)
    }

    
    let i = 0
    let changeColor =async function(i) {
        console.log(i)
        await bulb.setState(1, 75, i, 80, 0 )
    }

}

