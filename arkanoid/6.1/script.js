// Variables globales de utilidad
var canvas = document.querySelector("canvas");
var ctx = canvas.getContext("2d");
    ctx.save();
var w = canvas.width;
var h = canvas.height;
var x = 130,
    y = 135;
var delta;
// var frames = 30;

function testCollisionWithWalls(ball, w, h) {
    // @return  TRUE si toca borde inferior
    //          FALSE en cualquier otro caso

    var ret = false;


    if ((ball.x + ball.radius) >= w) {      // toca borde derecho
        ball.x = w-ball.radius;             // recolocar derecha -- 150 - 3 = 147 px
        ball.angle = -ball.angle + Math.PI;
    }

    if ((ball.x - ball.radius) <= 0) {      // toca borde izquierdo
        ball.x = ball.radius;               // recolocar izquierda -- 3 px
        ball.angle = -ball.angle + Math.PI;
    }

    if ((ball.y - ball.radius) <= 0) {      // toca borde superior
        ball.y = ball.radius;               // recolocar arriba -- 3 px
        ball.angle = -ball.angle;
    }

    if ((ball.y + ball.radius) >= h ) {     // toca borde inferior
        ball.y = h-ball.radius;             // recolocar debajo -- 150 - 3 = 147 px
        ball.angle = -ball.angle;
        ret = true;
    }

    return ret;

}

// Funcion auxiliar
var calcDistanceToMove = function(delta, speed) {
    // speed = 300 pixeles por segundo
    // delta = 16,66 ms = 0,01666 segundos
    return num_pixels_frame = (speed * delta) / 1000; // 5 pixeles por frame
};

function Ball(x, y, angle, v, diameter, sticky) {

    // atributos
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = v;
    this.radius = diameter/2;
    this.sticky = sticky;

    this.draw = function(ctx) {
        ctx.restore();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);
        ctx.stroke();
        ctx.fillStyle = "green";
        ctx.fill();
        ctx.save();
    };

    this.move = function(x, y) {
        var incX = 0;
        var incY = 0;

        incX = this.speed * Math.cos(this.angle);
        incY = this.speed * Math.sin(this.angle);

       this.x = this.x + calcDistanceToMove(delta, incX);

        if (this.y > 0) {
            this.y = this.y - calcDistanceToMove(delta, incY);
        }

    };

}

// GAME FRAMEWORK STARTS HERE
    var GF = function() {

    // vars for counting frames/s, used by the measureFPS function
    var frameCount = 0;
    var lastTime;
    var fpsContainer;
    var fps, oldTime = 0;

    var speed = 300; // px/s
    var vausWidth = 30,   vausHeight = 10;

    var balls = [];

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
    // ctx.fillRect(105,0,4,4);
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
            // hacer algo
        }

    };


    function updateBalls() {
        for (var i = balls.length - 1; i >= 0; i--) {
            var ball = balls[i];
            ball.move();
            var die = testCollisionWithWalls(ball, w, h);
            ball.draw(ctx);
        }
    }

    function timer(currentTime) {
        var aux = currentTime - oldTime;
        oldTime = currentTime;
        return aux;
    }
    var mainLoop = function(time) {
        //main function, called each frame
        measureFPS(time);

        // number of ms since last frame draw
        delta = timer(time);

        // Clear the canvas
        clearCanvas();

        // Mover Vaus de izquierda a derecha
        updatePaddlePosition();

        updateBalls();

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
                console.log("¡bang! ¡pam, pam! ¡paiummm! 🔫");
                console.log("");
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

    // Instancia una bola con los parámetros del enunciado e introdúcela en el array balls
    var bola = new Ball(10, 70, Math.PI/3, 10, 6, false);
    balls.push(bola);

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

var ball1 = new Ball(48.68599000001268,2.993899778876827,1.0471975511965976, 10, 6, false);

test('Colisión con pared superior', function(assert) {
  var res_sup = testCollisionWithWalls(ball1, w, h);
  assert.equal(ball1.x, 48.68599000001268, "Passed!");
  assert.equal(ball1.y, 3, "Passed!");
  assert.equal(ball1.angle,-1.0471975511965976, "Passed!");
  assert.equal(res_sup, false);
});


var ball2 = new Ball( 131.84048499999335,147.02781021770147,-1.0471975511965976
, 10, 6, false);

test('Colisión con pared inferior', function(assert) {
  var res_bottom = testCollisionWithWalls(ball2, w, h);
  assert.equal(ball2.x,  131.84048499999335 , "Passed!");
  assert.equal(ball2.y, 147, "Passed!");
  assert.equal(ball2.angle,1.0471975511965976, "Passed!");
  assert.equal(res_bottom, true);
});


var ball3 = new Ball(  147.0802850000473 ,120.60389210271744,1.0471975511965976
, 10, 6, false);

test('Colisión con pared izquierda', function(assert) {
  var res_left = testCollisionWithWalls(ball3, w, h);
  assert.equal(ball3.x, 147, "Passed!");
  assert.equal(ball3.y,  120.60389210271744, "Passed!");
  assert.equal(ball3.angle,  2.0943951023931957, "Passed!");
  assert.equal(res_left, false);
});