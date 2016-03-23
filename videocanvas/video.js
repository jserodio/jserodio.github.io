"use strict";

var efecto = null;
var clip = "video/demovideo1";

window.onload = function() {

    // Sepia tiene su propia función (no usa cambiarEfecto)
    // ver última función del fichero
    var botonSepia = document.getElementById("sepia");
    botonSepia.onclick = sepia;
    
    var botonGrayScale = document.getElementById("grayscale");
    botonGrayScale.onclick = grayscale;
    
    var botonBlur = document.getElementById("blur");
    botonBlur.onclick = blur;

    // asignar función pausarVideo 'onclick'.
    var pause = document.getElementById("pause");
    pause.onclick = pausarVideo;

    // asignar funcion cambiarVolumen 'onchange'
    var volumen = document.getElementById("volumen");
    volumen.onchange = cambiarVolumen;

    // lo llamo al inicio para asignar el valor por defecto
    // asignado en el elemento #volumen
    cambiarVolumen();

    video.src = clip + getFormatExtension();
    video.load();
    video.play();

};

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
    document.getElementById("volumentxt").innerHTML = (volumen * 100).toFixed(0) + " %";
}

function getFormatExtension() {
    var video = document.getElementById("video");
    if (video.canPlayType("video/mp4") != "") {
        return ".mp4";
    }
    if (video.canPlayType("video/ogg") != "") {
        return ".ogv";
    }
    if (video.canPlayType("video/webm") != "") {
        return ".webm";
    }
}

function sepia() {
    // funcion tipo toggle con css3
    if (!document.getElementById('video').classList.contains('sepia')) {
        // aplicar filtro css3 sepia :)
        document.getElementById('video').classList.add('sepia');
    } else {
        // eliminar el filtro
        document.getElementById('video').classList.remove('sepia');
    }
}
    
function grayscale() {
    // funcion tipo toggle con css3
    if (!document.getElementById('video').classList.contains('grayscale')) {
        // aplicar filtro css3 grayscale :)
        document.getElementById('video').classList.add('grayscale');
    } else {
        // eliminar el filtro
        document.getElementById('video').classList.remove('grayscale');
    }
}

function blur() {
    // funcion tipo toggle con css3
    if (!document.getElementById('video').classList.contains('blur')) {
        // aplicar filtro css3 blur :)
        document.getElementById('video').classList.add('blur');
    } else {
        // eliminar el filtro
        document.getElementById('video').classList.remove('blur');
    }
}
