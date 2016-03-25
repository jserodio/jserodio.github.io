// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
    ctx.save();
var w = canvas.width;
var h = canvas.height;


var x = 130,
  y = 135;


// GAME FRAMEWORK STARTS HERE
var GF = function() {

    // vars for counting frames/s, used by the measureFPS function
    var frameCount = 0;
    var lastTime;
    var fpsContainer;
    var fps, delta, oldTime = 0;

    var speed = 300; // px/s
    var vausWidth = 30, vausHeight = 10;

    // vars for handling inputs
    var inputStates = {
        left: false,
        right: false,
        space: false,
        shift: false
    };


    var measureFPS = function(newTime) {

        // test for the very first invocation
        if (lastTime === undefined) {
            lastTime = newTime;
            return;
        }

        //calculate the difference between last & current frame
        var diffTime = newTime - lastTime;

        if (diffTime >= 1000) {
            fps = frameCount;
            frameCount = 0;
            lastTime = newTime;
        }

        //and display it in an element we appended to the
        // document in the start() function
        fpsContainer.innerHTML = 'FPS: ' + fps;
        frameCount++;
    };

    // clears the canvas content
    function clearCanvas() {
        ctx.clearRect(0, 0, w, h);
        // ctx.fillStyle = 'green';
        // ctx.fillRect(15,15,4,4);
    }

    // Función para pintar la raqueta Vaus
    function drawVaus(x, y) {
        // Función para pintar la raqueta Vaus
        ctx.restore();
        ctx.beginPath();
        ctx.moveTo(x,y);
        ctx.lineTo(x+vausWidth,y);
        ctx.lineTo(x+vausWidth,y+vausHeight);
        ctx.lineTo(x, y+vausHeight);
        ctx.closePath();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fill();
        ctx.save();
    }


    var calcDistanceToMove = function(delta, speed) {
        // speed = 300 pixeles por segundo
        // delta = 16,66 ms = 0,01666 segundos
        return num_pixels_frame = (speed * delta) / 1000; // 5 pixeles por frame
    };

    var updatePaddlePosition = function() {

        var incX = Math.ceil(calcDistanceToMove(delta, speed));
        var limiteDerecha = false;
        var limiteIzquierda = false;
        
        // Si pulsa shift, se mueve con precision, más despacio
        if (inputStates.shift) {
            incX = incX / 2;
        }
        
        
        if ( (x+vausWidth) >= w ) {
            //llego al limite
            limiteDerecha = true;
        } else if (x <= 0) {
            //llego al limite
            limiteIzquierda = true;
        }
        
        if (inputStates.left && !limiteIzquierda) {
            // si pulsa izquierda y no sobrepasa el limite izquierdo
            x = x - incX;
        }
        
        if (inputStates.right && !limiteDerecha) {
            // si pulsa derecha y no sobrepasa el limite derecho
            x = x + incX;
        }
        
        if (inputStates.space) {
            console.log("¡bang! ¡pam, pam! ¡paiummm! 🔫");
            console.log("");
        }
        
    }
    
    function timer(currentTime) {
        var aux = currentTime - oldTime;
        oldTime = currentTime;
        return aux;
    }

    var mainLoop = function(time){
        //main function, called each frame
        measureFPS(time);

        // number of ms since last frame draw
        delta = timer(time);

        // Clear the canvas
        clearCanvas();

        // Mover Vaus de izquierda a derecha
        updatePaddlePosition();

        // draw Vaus
        drawVaus(x, y);

        // call the animation loop every 1/60th of second
        requestAnimationFrame(mainLoop);
        };

        var start = function() {
        // adds a div for displaying the fps value
        fpsContainer = document.createElement('div');
        document.body.appendChild(fpsContainer);

        // Crea un listener para gestionar la pulsación
        // de izquierda, derecha o espacio
        // y actualiza inputStates.left .right o .space
        // el listener será para keydown (pulsar)
        // y otro para keyup
        document.onkeydown = function (e) {
            // Arrow Key Codes
            // 32 - spacebar
            // 37 - left
            // 38 - up
            // 39 - right
            // 40 - down
            if (e.keyCode === 37) {
                // izquierda
                inputStates.left = true;
            }
            if (e.keyCode === 39) {
                // derecha
                inputStates.right = true;
            }
            if (e.keyCode === 32) {
                // disparo
                inputStates.space = true;
            }
            if (e.keyCode === 16) {
                // moverse con precision (lento)
                inputStates.shift = true;
            }
        };
        
        // Para que se mueva hasta que se suelte la tecla
        document.onkeyup = function (e) {
            if (e.keyCode === 37) {
                inputStates.left = false;
            }
            if (e.keyCode === 39) {
                inputStates.right = false;
            }
            if (e.keyCode === 32) {
                inputStates.space = false;
            }
            if (e.keyCode === 16) {
                inputStates.shift = false;
            }
        }

        // start the animation
        requestAnimationFrame(mainLoop);
        };

        //our GameFramework returns a public API visible from outside its scope
        return {
            start: start
        };
};


var game = new GF();
game.start();
