/* jshint undef: true, node: true */

var express = require('express');
var ip = require('ip');
var piblaster = require('pi-blaster.js');
var path = require('path');
var app = express();

var RED_GPIO_PIN = 17;
var GREEN_GPIO_PIN = 18;
var BLUE_GPIO_PIN = 22;


//Serve public content - basically any file in the public folder will be available on the server.
app.use(express.static(path.join(__dirname, 'public')));

//We also need 3 services - Red, Green and Blue.
// Each section is doing exactly the same but for a particular color.
// First, we grab the value and if it is an integer we are dividing it by 255 and sending it to the pi-blaster daemon.

var isCommonAnode = true;

var covertToCommonType = function (value) {
    if (isCommonAnode) {
        return (255 - value);
    } else {
        return (value);
    }
}

app.get('/red/:value', function (req, res) {
    console.log("red = " + req.params.value);
    var redValue = req.params.value;
    if( !isNaN( parseInt(redValue) ) ){
        piblaster.setPwm(RED_GPIO_PIN, covertToCommonType(redValue)/255);
        res.send('ok');
    } else {
        res.status(400).send('error');
    }
});

app.get('/green/:value', function (req, res) {
    console.log("green = " + req.params.value);
    var greenValue = req.params.value;
    if( !isNaN( parseInt(greenValue) ) ){
        piblaster.setPwm(GREEN_GPIO_PIN, covertToCommonType(greenValue)/255);
        res.send('ok');
    } else {
        res.status(400).send('error');
    }
});

app.get('/blue/:value', function (req, res) {
    console.log("blue = " + req.params.value);
    var blueValue = req.params.value;
    if( !isNaN( parseInt(blueValue) ) ){
        piblaster.setPwm(BLUE_GPIO_PIN, covertToCommonType(blueValue)/255);
        res.send('ok');
    } else {
        res.status(400).send('error');
    }
});

// Start listening on port 3000.
var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;
    var addr = ip.address();
    // console.dir(addr);
    console.log('RGB LED Slider listening at http://%s:%s', addr, port);
});

