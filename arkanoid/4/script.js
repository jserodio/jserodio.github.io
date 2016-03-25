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

    var direction = -1; // inicialmente movimiento a la izquierda
    var speed = 300; // px/s
    var vausWidth = 30, vausHeight = 10;

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

        // Usar incX y direction para actualizar la posición
        // de Vaus. Debe moverse hacia la izquierda hasta chocar
        // con la pared. En ese momento, debe moverse hacia la
        // derecha, hasta volver a chocar, y repetir el ciclo


        if ( (x+vausWidth) >= w ) {
            //console.log("cambio a la derecha");
            direction = -1;
        } else if (x <= 0) {
             //console.log("cambio a la izquierda");
            direction = 1;
        }
        
        x = x + (incX * direction);
        // console.log(x);
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

        test('60 fps', function(assert) {
            assert.ok(5, calcDistanceToMove(1/60*1000, speed));
        });

        test('50 fps', function(assert) {
            assert.ok(6, calcDistanceToMove(1/50*1000, speed));
        });

        // start the animation
        requestAnimationFrame(mainLoop);
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
// GameFramework ends here
};

var game = new GF();
game.start();