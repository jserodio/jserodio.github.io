$(document).ready(function() {

var kBoardWidth = 8;
var kBoardHeight= 8;
var kPieceWidth = 64;
var kPieceHeight= 64;
var kPixelWidth = 1 + (kBoardWidth * kPieceWidth);
var kPixelHeight= 1 + (kBoardHeight * kPieceHeight);

var gCanvasElement = document.getElementById("lienzo");
var gDrawingContext = gCanvasElement.getContext("2d");

function getCursorPosition(e) {
    /* returns Cell with .row and .column properties */
    var x;
    var y;
    if (e.pageX != undefined && e.pageY != undefined) {
      x = e.pageX;
      y = e.pageY;
    }
    else {
      x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
      y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }
    x -= gCanvasElement.offsetLeft;
    y -= gCanvasElement.offsetTop;
    x = Math.min(x, kBoardWidth * kPieceWidth);
    y = Math.min(y, kBoardHeight * kPieceHeight);

    var json = {row: Math.floor(y/kPieceHeight), column: Math.floor(x/kPieceWidth)};

    return json;
}

function drawBoard() {

    gDrawingContext.clearRect(0, 0, kPixelWidth, kPixelHeight);

    gDrawingContext.beginPath();

    /* vertical lines */
    for (var x = 0; x <= kPixelWidth; x += kPieceWidth) {
		gDrawingContext.moveTo(0.5 + x, 0);
		gDrawingContext.lineTo(0.5 + x, kPixelHeight);
    }

    /* horizontal lines */
    for (var y = 0; y <= kPixelHeight; y += kPieceHeight) {
		gDrawingContext.moveTo(0, 0.5 + y);
		gDrawingContext.lineTo(kPixelWidth, 0.5 +  y);
    }

    /* draw it! */
    gDrawingContext.strokeStyle = "#ccc";
    gDrawingContext.stroke();

}

   $('#damas img').draggable({
    cursor: 'pointer',
    helper: 'clone',
    revert: 'invalid',
    revertDuration: 200,
    opacity: 0.35
  });

  $('#lienzo').droppable({
    drop: function(event, ui) {

      // obtener elemento imagen (elemento soltado)
      var image = ui.draggable[0];
      var id = image.id;

      // obtener coordenadas del grid que hay en el canvas
      var casilla = getCursorPosition(event);

      // imprimir resultados (id --> fil:col)
      $("#ui").append(id + "--->" + casilla.row + ":" + casilla.column + '<br>');

      // dibujar la imagen en el canvas (x - col, y - fil)
      gDrawingContext.drawImage(image,casilla.column*64,casilla.row*64);

    }
  });

  drawBoard();
});

