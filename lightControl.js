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
    //console.log(store.get('user').email)
    if (store.get('user') == undefined || store.get('user').email == '') {
       user = getInfo(); 
    } else {
        user = store.get('user')
    }
    let tplink;
    try {
        tplink = await login(user.email, user.pw)
    } catch {
        console.log('device off')
    }
    
    if (tplink){
        document.getElementById('deviceTable').classList.remove('invisible');
        document.getElementById('deviceTable').classList.add('visible');
        // document.getElementById('signInButton').classList.remove('visible');
        // document.getElementById('signInButton').classList.add('invisible');
    }
    let deviceList  = await tplink.getDeviceList();

    let bigLight = await tplink.getLB130("BigLight")


    // if there's no devices
    if (deviceList.length == 0) {
        
        document.getElementById('noDevicesDiv').classList.remove('invisible');
        document.getElementById('noDevicesDiv').classList.add('visible');
        
    } else {
        document.getElementById('noDevicesDiv').classList.remove('visible');
        document.getElementById('noDevicesDiv').classList.add('invisible');
        //get table 
        let deviceTable = document.getElementById('deviceTable');
        // create a body for the table and append it
        let deviceTableBody = document.createElement('tbody');
        deviceTableBody.id = 'deviceTableBody';
        deviceTable.appendChild(deviceTableBody)
    }

    // Create cells for every device in the list
    for(i in deviceList) {
        //console.log(bigLight)
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

        let deviceOn;
        
        // Check if device is on at the source and show appropriate error msg if not
        try {
        deviceOn = await bigLight.isOn()
        }  catch (e) {
            deviceOn = false
        }

        if (deviceOn) {
            
            checkbox.onchange = function(){bulbToggle(bigLight, i)};
            let label = document.createElement('label');
            label.htmlFor = checkbox.id
    
            checkboxDiv.appendChild(checkbox)
            checkboxDiv.appendChild(label)
            powerCell.appendChild(checkboxDiv)
        } else {
            let deviceOffDiv = document.createElement('div');
            deviceOffDiv.id = 'errorDiv';
            deviceOffDiv.classList.add('alert');
            deviceOffDiv.classList.add('alert-secondary');
            deviceOffDiv.setAttribute('role', 'alert')
            deviceOffDiv.innerText = 'Device off at source'
            powerCell.appendChild(deviceOffDiv)

            let emptyCell1 = row.insertCell(2);
            let emptyCell2 = row.insertCell(3);
        }
            
    
       
           
            
            
        
        if (deviceOn) {
            checkbox.checked = 'checked';
        } else {
            checkbox.checked = '';
        }
        
      
        let colorCell = row.insertCell(2);
        let lightState
        try {
            lightState = await bigLight.getState()
        } catch (e) {
            console.log('light off')
        }
       
        // get the current state of the bulb and set it as the colour
        let color = rgb(lightState.hue, lightState.saturation, lightState.brightness)
        let deviceName = deviceList[i].alias

        let button = document.createElement('button');
        // create the config for the colour picker
        let pickerConfig = {
            backgroundColor : '#333',
            onChange : 'bulbColour(this)',
            value : 'rgba('+ color[0] +',' + color[1] + ',' + color[2] +')'
        };
        var picker = new jscolor(button, pickerConfig);
        colorCell.appendChild(button)
      
        //instantiate colour picker
        jscolor.install()

        // add wave button
        let waveButtonCell = row.insertCell(3);
        let waveDiv = document.createElement('div');
        waveDiv.className = "custom-switch"
        let waveButton = document.createElement('input')
        waveButton.type = "checkbox";

        //set the id of the button to start at 50 to not clash with on/off switches bit of a hack
        waveButton.id="switch-"+(50 + i);
        let waving = false
        waveButton.innerHTML = 'start'
        let wavfunc;

        // set the onchange function of the wave button passing the ligth obj, wavefunc var, if the button is checked or not, and the index of the device
        waveButton.onchange = function(){slowColorChange(bigLight, wavfunc, waveButton.checked, i)}
        let waveLabel = document.createElement('label');
        waveLabel.htmlFor = waveButton.id
        waveDiv.appendChild(waveButton)
        waveDiv.appendChild(waveLabel)
        waveButtonCell.appendChild(waveDiv)

    }
}

// Toggle the bulb on/off
function bulbToggle(bulb, index) {  
    bulb.toggle()
    clearInterval(index +1)

    let waveSwitch = document.getElementById('switch-50'+index)
   
    if (waveSwitch.checked) {
        waveSwitch.checked = false;
    }
}

// Handle bulb changing colour from picker
async function bulbColour(picker, bulb) {
    let user = store.get('user');
    const tplink = await login(user.email, user.pw) 
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
       
        await bulb.setState(1, 75, i, 80, 0 )
    }

}

// Returns the current state of the device
async function refreshState(){
    let deviceTableBody = document.getElementById('deviceTableBody');

    let rowCount = deviceTableBody.rows.length;

    // clear all current intervals
    for(let i = 0; i < rowCount; i ++) {
        clearInterval(i + 1);
    }
    // remove the old table
    deviceTableBody.remove();
    //get table again with current state
    getDevices();
}