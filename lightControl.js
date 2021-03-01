require('dotenv').config()
const { login } = require("tplink-cloud-api");
const jscolor = require('@eastdesire/jscolor');
const rgb = require('hsv-rgb');
const Store = require('./store.js');

// instantiate Store
const store = new Store({
    configName: 'user-preferences',
    defaults: {
        windowBounds : {width: 600, height: 400 },
        user : { email: '', pw: ''}
    }
})



// get the info from the sign in form and return it to the getDevices() function
function getInfo() {
    let email  = document.getElementById('email').value;
    let pw = document.getElementById('password').value;
    let remember = document.getElementById('rememberME').checked;
    
    //close modal
    location.href = '#';

    if (remember) {
        store.set('user', {email: email, pw: pw});
    }

    let user = { email, pw }

    return user
}

// Have the sign in modal open by default
// TODO check if the use has been remember'd first and have modal
// show accodingly
function openModal(){
    console.log(store.get('user'))
    if (store.get('user') != undefined) {
        

        location.href = '#'
        getDevices()
    } else {
       location.href = '#modal-2';
    }
    
}

async function getDevices()  {
    //console.log('test')
    let user;
    
    if (store.get('user') == undefined) {
       user = getInfo(); 
    } else {
        user = store.get('user')
    }
    console.log(user)
    const tplink = await login(user.email, user.pw)
    if (tplink){
        document.getElementById('deviceTable').classList.remove('invisible');
        document.getElementById('deviceTable').classList.add('visible');
        // document.getElementById('signInButton').classList.remove('visible');
        // document.getElementById('signInButton').classList.add('invisible');
    }
    let deviceList  = await tplink.getDeviceList();

    let bigLight = await tplink.getLB130("BigLight")

    //get table 
    let deviceTable = document.getElementById('deviceTable');
    // create a body for the table and append it
    let deviceTableBody = document.createElement('tbody');
    deviceTableBody.id = 'deviceTableBody';
    deviceTable.appendChild(deviceTableBody)

    // Create cells for every device in the list
    for(i in deviceList) {

        let rowCount = deviceTableBody.rows.length;
        let row = deviceTableBody.insertRow(rowCount);
        
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
        
        checkbox.onchange = function(){bulbToggle(bigLight, i)};
        let label = document.createElement('label');
        label.htmlFor = checkbox.id

        checkboxDiv.appendChild(checkbox)
        checkboxDiv.appendChild(label)
        powerCell.appendChild(checkboxDiv)

        let colorCell = row.insertCell(2);
        
        let lightState = await bigLight.getState()
        
        console.log(lightState)

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
        waveButton.onchange = function(){slowColorChange(bigLight, wavfunc, waveButton.checked, i)}
        let waveLabel = document.createElement('label');
        waveLabel.htmlFor = waveButton.id
        waveDiv.appendChild(waveButton)
        waveDiv.appendChild(waveLabel)
        waveButtonCell.appendChild(waveDiv)

    }

    // if there's no devices
   // if (deviceList.length )
}

// Toggle the bulb on/off
function bulbToggle(bulb, index) {  
    bulb.toggle()
    console.log(index + 1)
    clearInterval(index +1)

    let waveSwitch = document.getElementById('switch-50'+index)
    console.log(waveSwitch)
    if (waveSwitch.checked) {
        waveSwitch.checked = false;
    }
}

// Handle bulb changing colour from picker
async function bulbColour(picker, bulb) {

    const tplink = await login(process.env.TPLINK_USER, process.env.TPLINK_PW) 
    let deviceList  = await tplink.getDeviceList();

    let bigLight = await tplink.getLB130('BigLight').setState(1, 75, picker.channels.h, picker.channels.s, 0 )
    //await bulb.setState(1, 75, picker.channels.h, picker.channels.s, 0 )
}


// Wave function that cycles through colours every 3 seconds
// takes the checked status of the switch
function slowColorChange(bulb, wavfunc, checked, index) {
   
    let OnSwitch = document.getElementById('switch-'+index)

    if (checked) {
        wavefunc = setInterval(function(){
            i = i + 10;
            if (i == 360) {
                i = 0;
            }
            changeColor(i) 
            
            
        }, 3000);

        if (!OnSwitch.checked) {
            OnSwitch.checked = true;
        }

    } else {
        clearInterval(wavefunc)
    }


    let i = 0
    let changeColor =async function(i) {
        console.log(i)
        await bulb.setState(1, 75, i, 80, 0 )
    }

}

// Returns the current state of the device
async function refreshState(){
    let deviceTableBody = document.getElementById('deviceTableBody');
    // remove the old table
    deviceTableBody.remove();
    //get table again with current state
    getDevices();
}