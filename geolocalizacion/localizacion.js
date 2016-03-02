window.onload = obtenerLocalizacion;

document.getElementById("clearWatch").addListener("click", function(){
    detenerMonitorizacion();
});

function obtenerLocalizacion() {

	if (navigator.geolocation) {
        // Eventos click
        var botonStart = document.getElementById("start");
        botonStart.onclick = function(){
            navigator.geolocation.getCurrentPosition( mostrarLocalizacion , mostrarError );
        }

        var botonWatch = document.getElementById("watch");
        botonWatch.onclick = iniciarMonitorizacion;

        var botonClear = document.getElementById("clearWatch");
        botonClear.onclick = detenerMonitorizacion;

	}
	else {
		alert("Este navegador no soporta Geolocation API");
	}
}

function mostrarLocalizacion(posicion) {
	var latitud = posicion.coords.latitude;
	var longitud = posicion.coords.longitude;

	var div = document.getElementById("localizacion");
	div.innerHTML = "Latitud de tu posición: " + latitud + ", Longitud: " + longitud;

    if (map === null){
        showMap(posicion.coords);
    } else {
        centrarMapa(posicion.coords);
    }

}

function mostrarError(error) {
	var errorTypes = {
		0: "Error desconocido",
		1: "Permiso denegado",
		2: "Posición no disponible",
		3: "Tiempo de espera agotado"
	};
	var errorMessage = errorTypes[error.code];
	if (error.code == 0 || error.code == 2) {
		errorMessage = errorMessage + " " + error.message;
	}
	var div = document.getElementById("localizacion");
	div.innerHTML = errorMessage;
}



var map; // variable global

function showMap(coords) {

	var googleLatAndLong = new google.maps.LatLng(coords.latitude,coords.longitude);

	var mapOptions = {
		zoom: 10,
		center: googleLatAndLong,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var mapDiv = document.getElementById("mapa");
	map = new google.maps.Map(mapDiv, mapOptions);

	var titulo = "Tu geoposición";
	var contenido;

  if (coords.altitude === 0) {

  } else {
      contenido= "Latitud: " + coords.latitude + "<br>Longitud: " + coords.longitude + "<br>Altitud: "+ coords.altitude;
  }

	addMarker(map, googleLatAndLong, titulo, contenido);

}

function addMarker(mapa, latlong, titulo, contenido) {
	var markerOptions = {
		position: latlong,
		map: mapa,
		title: titulo,
		clickable: true
	};

	var marker = new google.maps.Marker(markerOptions);

	var infoWindowOptions = {
		content: contenido,
		position: latlong
	};

	var infoWindow = new google.maps.InfoWindow(infoWindowOptions);

	google.maps.event.addListener(marker, "click", function() {
		infoWindow.open(mapa);
	});
}

function centrarMapa(coords){
    var latitud = coords.latitude;
    var longitud = coords.longitude;
    var latlong = new google.maps.LatLng(latitud, longitud);

    // Centrar el mapa en la posicion que le pasamos como parámetro
    map.panTo(latlong);

    addMarker(map, latlong, "Tu nueva localizacion", "Te has movido a: " +
    latitud + "," + longitud);
}



var watchId = null;

function iniciarMonitorizacion() {
    var opciones = {
        enableHighAccuracy: true,
        timeout: Infinity,
        maximumAge: 2000
    }
    watchId = navigator.geolocation.watchPosition(mostrarLocalizacion, mostrarError, opciones);
}

function detenerMonitorizacion() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}
