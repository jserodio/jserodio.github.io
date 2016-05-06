var reloj ;

window.onload = function() {
    // Calculará un número random entre 1M y 2M
    min = 1000000;
    max = 2000000;
    var num = Math.floor(Math.random() * (max - min + 1)) + min;
    var botonMostrar = document.getElementById("mostrar");
    var botonCalcular = document.getElementById("calcular");
    
    // onclicks
    botonMostrar.onclick = function() {
      botonCalcular.disabled = false;
      reloj = setInterval(mostrar,100);
    };
    
    botonCalcular.onclick = function() {
      var worker = new Worker("esPrimo_worker.js");
      
      salida.innerHTML += "Calculando los primos hasta el número: " + num;
      // una vez calcula, cuando reciba el mensaje desde el worker...
      worker.onmessage = function(event) {
        if (event.data > 0) {
          salida.innerHTML += "Existen " + event.data + " números primos";
          // parar el reloj que repite la funcion mostrar
          clearInterval(reloj);
          // reactivar el boton calcular
          botonCalcular.disabled = false;
        } else {
          salida.innerHTML += "No existen primos.";
        }
      }
      // enviar mensaje
      worker.postMessage(num);
      
      // desactivamos el boton durante el proceso
      botonCalcular.disabled = true;
    };
    
}

function mostrar() {
  var salida = document.getElementById("salida");
  salida.innerHTML = salida.innerHTML + " #";
}
