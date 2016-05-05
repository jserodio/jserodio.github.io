var reloj ;

window.onload = function() {
    var num = 2227644437;

    var botonMostrar = document.getElementById("mostrar");

    botonMostrar.onclick = function() {
      reloj = setInterval(mostrar,100);
    };

    var botonCalcular = document.getElementById("calcular");
    botonCalcular.onclick = function() {
      var worker = new Worker("esPrimo_worker.js");

      // una vez calcula, cuando reciba el mensaje desde el worker...
      worker.onmessage = function(event) {
        if (event.data > 0) {
          salida.innerHTML += "Existen " + event.data + " números primos";
        } else {
          salida.innerHTML += "No existen primos.";
        }
      }

      worker.postMessage(num);
    };
}

function mostrar() {
  var salida = document.getElementById("salida");
  salida.innerHTML = salida.innerHTML + " #";
}
