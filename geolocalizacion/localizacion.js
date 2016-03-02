var map; // variable global
var watchId = null;

window.onload = obtenerLocalizacion;

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
    div.innerHTML += "<br> (con una precisión de " + posicion.coords.accuracy + " metros)";

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





function showMap(coords) {

	var googleLatAndLong = new google.maps.LatLng(coords.latitude,coords.longitude);

	var mapOptions = {
		zoom: 10,
		center: googleLatAndLong,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	var mapDiv = document.getElementById("mapa");
	map = new google.maps.Map(mapDiv, mapOptions);

    // Añadir marcador
	var titulo = "Tu geoposición";
	var contenido;

    if (coords.altitude === 0 || coords.altitude === null) {
        tryElevation = true;
    } else {
        contenido= "<br>Altitud sin elevación: "+ coords.altitude;
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
        if (tryElevation) {
    	    var elevator = new google.maps.ElevationService;
  		    displayLocationElevation(latlong, elevator, infoWindow);
        }
		infoWindow.open(mapa);
	});
}

function displayLocationElevation(location, elevator, infowindow) {
        // Initiate the location request
        elevator.getElevationForLocations({
          'locations': [location]
        }, function(results, status) {
          infowindow.setPosition(location);
          if (status === google.maps.ElevationStatus.OK) {
            // Retrieve the first result
            if (results[0]) {
              // Open the infowindow indicating the elevation at the clicked position.
              infowindow.setContent('La altitud en este punto es: ' +
                  results[0].elevation.toFixed(2) + ' metros.');
            } else {
              infowindow.setContent('No results found');
            }
          } else {
            infowindow.setContent('Elevation service failed due to: ' + status);
          }
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
