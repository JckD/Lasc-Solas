require('dotenv').config()
const { login } = require("tplink-cloud-api");
const jscolor = require('@eastdesire/jscolor');



async function getDevices()  {
    //console.log('test')
    const tplink = await login(process.env.TPLINK_USER, process.env.TPLINK_PW) 
    let deviceList  = await tplink.getDeviceList();

    console.log(deviceList);

    let bigLight = await tplink.getLB130("BigLight")

    console.log(await bigLight.isOn());
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
        
        let button = document.createElement('button');
        let pickerConfig = {
            backgroundColor : '#333',
            palletteCols : 5,
            onChange : 'bulbColour(this, "BigLight")',
        };
        var picker = new jscolor(button, pickerConfig);
        colorCell.appendChild(button)
        //colorCell.innerHTML = '<button  data-jscolor="{pickerConfig}" id="colorInput"">'

        jscolor.install()

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

    let bigLight = await tplink.getLB130(bulb).setState(1, 75, picker.channels.h, picker.channels.s, 0 )
}

