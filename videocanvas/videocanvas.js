var efecto = null;
var clip = "video/demovideo1";

window.onload = function() {

	var video = document.getElementById("video");
    
    // Asignar filtros a botones
    var botonNormal = document.getElementById("normal");
	botonNormal.onclick = cambiarEfecto;
	var botonByN = document.getElementById("byn");
	botonByN.onclick = cambiarEfecto;
    var botonScifi = document.getElementById("scifi");
    botonScifi.onclick = cambiarEfecto;
    var botonGameBoy = document.getElementById("gameboy");
    botonGameBoy.onclick = cambiarEfecto;
    var botonInstagram = document.getElementById("instagram");
    botonInstagram.onclick = cambiarEfecto;
    var botonSepia = document.getElementById("sepia");
    botonSepia.onclick = sepia;
    
    // asignar función pausarVideo 'onclick'.
    var pause = document.getElementById("pause");
    pause.onclick = pausarVideo;
    
    // asignar funcion cambiarVolumen 'onchange'
    var volumen = document.getElementById("volumen");
    volumen.onchange = cambiarVolumen;
    
    // lo llamo al inicio para asignar el valor por defecto
    // en el input #volumen cuyo value es 20
    cambiarVolumen()
    
	video.addEventListener("play", procesarFrame, false);
	
	video.src = clip + getFormatExtension();
	video.load();
	video.play();
	
}

// función para pausar el video
function pausarVideo(e) {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

// función para cambiar el volumen
function cambiarVolumen() {
    var video = document.getElementById("video");
    var volumen = document.getElementById("volumen").value / 100;
    video.volume = volumen;
    document.getElementById("volumentxt").innerHTML = volumen;
}

function cambiarEfecto(e){
	var id = e.target.getAttribute("id");
    
    switch (id) {
        case "byn":
            efecto = byn;
            break;
        case "scifi":
            efecto = scifi;
            break;
        case "gameboy":
            efecto = gameboy;
            break;
        case "instagram":
            efecto = instagram;
            break;
        /*
        case "sepia":
            efecto = sepia;
            break;
        */
        default:
            efecto = null;
            break; 
    }
}

function getFormatExtension() {
	var video = document.getElementById("video");
	if (video.canPlayType("video/mp4") != "") {
		return ".mp4";
	} 
	else if (video.canPlayType("video/ogg") != "") {
		return ".ogv";
	}
	else if (video.canPlayType("video/webm") != "") {
		return ".webm";
	} 
}


function procesarFrame(e) {
	var video = document.getElementById("video");

	if (video.paused || video.ended) {
		return;
	}

	var bufferCanvas = document.getElementById("buffer");
	var displayCanvas = document.getElementById("display");
	var buffer = bufferCanvas.getContext("2d");
	var display = displayCanvas.getContext("2d");

	buffer.drawImage(video, 0, 0, bufferCanvas.width, bufferCanvas.height);
	var frame = buffer.getImageData(0, 0, bufferCanvas.width, bufferCanvas.height);
	var length = frame.data.length / 4;

	for (var i = 0; i < length; i++) {
		var r = frame.data[i * 4 + 0];
		var g = frame.data[i * 4 + 1];
		var b = frame.data[i * 4 + 2];
		if (efecto){		
			efecto(i, r, g, b, frame.data);
		}
	}
	display.putImageData(frame, 0, 0);

    // en los navegadores viejos, es mejor usar :
    // setTimeout(procesarFrame, 0);
    //setTimeout(procesarFrame, 0);
	requestAnimationFrame(procesarFrame);
}

function byn(pos, r, g, b, data) {
	var gris = (r+g+b)/3;

	data[pos * 4 + 0] = gris;
	data[pos * 4 + 1] = gris;
	data[pos * 4 + 2] = gris;
}

// función para sci-fi 
function scifi(pos, r, g, b, data) {
	var offset = pos * 4;
    
	data[offset] = Math.round(255 - r) ;
	data[offset+1] = Math.round(255 - g) ;
	data[offset+2] = Math.round(255 - b) ;
} 

function gameboy(pos, r, g, b, data) {
	data[pos * 4 + 0] = 0; // red
	data[pos * 4 + 1] = g; // green
	data[pos * 4 + 2] = b/4; // blue
}

function instagram(pos, r, g, b, data) {
	data[pos * 4 + 0] = r/2; // red
	data[pos * 4 + 1] = g/2; // green
	data[pos * 4 + 2] = b/1.5; // blue
}

function sepia() {
	// funcion tipo toggle con css3
    if (document.getElementById("sepia").value === "Sepia") {
        // elimino filtro anterior
        efecto = null;
        // aplicar filtro css3 sepia :)
        document.getElementById("display").style.WebkitFilter = "sepia(100%)";        
        document.getElementById("display").style.filter = "sepia(100%)";
        // desactivar botones
        document.getElementById("normal").setAttribute("disabled", "");
        document.getElementById("byn").setAttribute("disabled", "");
        document.getElementById("scifi").setAttribute("disabled", "");
        document.getElementById("gameboy").setAttribute("disabled", "");
        document.getElementById("instagram").setAttribute("disabled", "");
        document.getElementById("sepia").value = "Desactivar";
    } else {
        // eliminar el filtro
        document.getElementById("display").removeAttribute("Style");        
        document.getElementById("sepia").value = "Sepia";
        // restaurar botones
        document.getElementById("normal").removeAttribute("disabled");
        document.getElementById("byn").removeAttribute("disabled");
        document.getElementById("scifi").removeAttribute("disabled");
        document.getElementById("gameboy").removeAttribute("disabled");
        document.getElementById("instagram").removeAttribute("disabled");
    }
    
}