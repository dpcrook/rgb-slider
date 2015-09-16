/* From the JQuery UI Slider color picker demo: http://jqueryui.com/slider/#colorpicker */  
/* Slightly modified to call the services and pass the values */
function hexFromRGB(r, g, b) {
  var hex = [
    r.toString( 16 ),
    g.toString( 16 ),
    b.toString( 16 )
  ];
  $.each( hex, function( nr, val ) {
    if ( val.length === 1 ) {
      hex[ nr ] = "0" + val;
    }
  });
  return hex.join( "" ).toUpperCase();
}


//
function refreshSwatch() {
  var red = $( "#red" ).slider( "value" ),
  green = $( "#green" ).slider( "value" ),
  blue = $( "#blue" ).slider( "value" ),
  hex = hexFromRGB( red, green, blue );
  $( "#swatch" ).css( "background-color", "#" + hex );
}

// Main start. Will create the sliders and assign the default values
$(function() {

  $( "#red, #green, #blue" ).slider({
    orientation: "horizontal",
    range: "min",
    max: 255,
    value: 0,
    slide: refreshSwatch,
  });

  $( "#red" ).slider({change: function( event, ui ) {
    var redValue = $( "#red" ).slider( "value" );
    $.get( "/red/"+ redValue , function() {});
  }});

  $( "#green" ).slider({change: function( event, ui ) {
    var greenValue = $( "#green" ).slider( "value" );
    $.get( "/green/"+ greenValue , function() {});
  }});

  $( "#blue" ).slider({change: function( event, ui ) {
    var blueValue = $( "#blue" ).slider( "value" );
    $.get( "/blue/"+ blueValue , function() {});
  }});

});

// http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately


/* accepts parameters
 * h  Object = {h:x, s:y, v:z}
 * OR 
 * h, s, v
*/

// This code expects 0 <= h, s, v <= 1, if you're using degrees or radians,
// remember to divide them out.

// The returned 0 <= r, g, b <= 255 are rounded to the nearest Integer. If you
// don't want this behaviour remove the Math.rounds from the returned object.

function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/* accepts parameters
 * r  Object = {r:x, g:y, b:z}
 * OR 
 * r, g, b
 */

// This code will output 0 <= h, s, v <= 1, but this time takes any 0 <= r, g,
// b <= 255 (does not need to be an integer)

function RGBtoHSV(r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
        d = max - min,
        h,
        s = (max === 0 ? 0 : d / max),
        v = max / 255;

    switch (max) {
        case min: h = 0; break;
        case r: h = (g - b) + d * (g < b ? 6: 0); h /= 6 * d; break;
        case g: h = (b - r) + d * 2; h /= 6 * d; break;
        case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
        h: h,
        s: s,
        v: v
    };
}

//var tid = setInterval(colorIncrement, interval);
var tid ;
var my_state = {};
var myColor = {r: 0, g:0 , b:0};

var startAuto = false;

// number of milliseconds between color change calls
var interval = 200;

// number of steps along the HSV scale
my_state.autoNumberOfSteps = 64; 


// starting value
my_state.hue = 0.0;

my_state.saturation = 1.0;
my_state.value = 1.0;

/// http://infohost.nmt.edu/tcc/help/pubs/colortheory/web/hsv.html

// starting direction
my_state.countUp = true;

// different color strategy
my_state.colorStrategy = 2;


function colorIncrement() {
    var nextColor;
    console.debug("DEBUG: colorIncrement");
    
    if (startAuto === true) {
        if (my_state.countUp) {
            my_state.hue = my_state.hue + 1.0/my_state.autoNumberOfSteps;
        } else {
            my_state.hue = my_state.hue - 1.0/my_state.autoNumberOfSteps;
        }

        // bounce back and forth from 0.0 to 1.0
        if (my_state.colorStrategy === 1) {
            if (my_state.hue >= 1.0) {
                my_state.hue = 1.0;
                my_state.countUp = false;
                console.log("counting down");
            } else if (my_state.hue < 0.0) {
                my_state.hue = 0.0;
                my_state.countUp = true;
                console.log("counting up");
            }
        }

        // restart at 0 from 1
        if (my_state.colorStrategy === 2) {
            if (my_state.hue >= 1.0) {
                my_state.hue = 0.0;
                my_state.countUp = true;
                console.log("counting up");
            }
        }
        
        // console.log(my_state.hue);
            
        nextColor = HSVtoRGB(my_state.hue, my_state.saturation, my_state.value);
        // console.log(nextColor);
        setSlidersToRGB (nextColor);
        refreshSwatch();

    }
}

function startTimer() {
    console.debug("DEBUG: startTimer");
    clearInterval(tid);
    tid = setInterval(colorIncrement, interval);
    startAuto = true;
}

function pause() { 
    console.debug("DEBUG: pause");
    startAuto = false;
}


function abortTimer() { // to be called when you want to stop the timer
    console.debug("DEBUG: abortTimer");
    startAuto = false;
    clearInterval(tid);
    setSlidersToRGB (0,0,0)
    refreshSwatch();
}




function setSlidersToRGB (r, g, b) {
    if (arguments.length === 1) {
        g = r.g, b = r.b, r = r.r;
    }
    
    $( "#red" ).slider( "value", r);
    $( "#green" ).slider( "value", g);
    $( "#blue" ).slider( "value", b);
}
    
