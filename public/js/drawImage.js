var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var data = 
'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">'+
'<foreignObject width="100%" height="100%">'+
'<div xmlns="http://www.w3.org/1999/xhtml">'+
'<table>'+
	'<tr style="height: 80px;color: white;font-size:36px;">'+
		'<th style="background-color: black;width: 160px;"></th>'+
		'<th style="background-color: deeppink;width: 160px;">TUE</th>'+
		'<th style="background-color: orange;width: 160px;">THU</th>'+
		'<th style="background-color: purple;width: 160px;">SAT</th>'+
		'<th style="background-color: red;width: 160px">SUN</th>'+
	'</tr>'+
'</table>'+
'</div>'+
'</foreignObject>'+
'</svg>';
var DOMURL = window.URL || window.webkitURL || window;

var img = new Image();
var svg = new Blob([data], {type: 'image/svg+xml'});
var url = DOMURL.createObjectURL(svg);

img.onload = function() {
  ctx.drawImage(img, 0, 0);
  DOMURL.revokeObjectURL(url);
}

img.src = url;