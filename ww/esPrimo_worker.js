// un web worker no puede acceder al DOM
function esPrimo(n) {
  if (n == 2) return true;
  for (var i = 2; i <= Math.sqrt(n); ++i) {
    if (n % i == 0) return false;
  }
  return true;
}

self.onmessage = function (event) {
  var count = 0;
  for (var i = 1; i<=event.data; i++)
    if (esPrimo(i)){
      count++;
      if (count % 2000 === 0)
        console.log("El número:  "+i+" es primo.");
    }
  postMessage(count);
}
