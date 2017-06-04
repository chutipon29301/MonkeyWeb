var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var data = 
'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400">'+
'<foreignObject width="100%" height="100%">'+
'<div xmlns="http://www.w3.org/1999/xhtml">'+
	'<table>'+
		'<tr>'+
			'<th style="background-color:black"></th>'+
			'<th style="background-color:deeppink">TUE</th>'+
			'<th style="background-color:orange">THU</th>'+
			'<th style="background-color:purple">SAT</th>'+
			'<th style="background-color:red">SUN</th>'+
		'</tr>'+
		'<tr>'+
			'<td>8-10</td>'+
			'<td></td>'+
			'<td></td>'+
			'<td></td>'+
			'<td></td>'+
		'</tr>'+
		'<tr>'+
			'<td>10-12</td>'+
			'<td></td>'+
			'<td></td>'+
			'<td></td>'+
			'<td></td>'+
		'</tr>'+
		'<tr>'+
			'<td>13-15</td>'+
			'<td></td>'+
			'<td></td>'+
			'<td></td>'+
			'<td></td>'+
		'</tr>'+
		'<tr>'+
			'<td>15-17</td>'+
			'<td></td>'+
			'<td></td>'+
			'<td></td>'+
			'<td></td>'+
		'</tr>'+
	'</table>'+
'</div>'+
'</foreignObject>'+
'</svg>';
//'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="360">' +
//  '<foreignObject width="100%" height="100%">' +
//    '<div xmlns="http://www.w3.org/1999/xhtml" style="font-size:20px">' +
//      '<em>I</em> like ' + 
//      '<span style="color:white; text-shadow:0 0 2px blue;">cheese</span>' +
//      '<table>'+
//	    '<tr>'+
//		  '<td>ssss</td>'+
//		  '<td>dferdfdf</td>'+
//	    '</tr>'+
//	  '</table>'+
//    '</div>' +
//  '</foreignObject>' +
//'</svg>';
var DOMURL = window.URL || window.webkitURL || window;

var img = new Image();
var svg = new Blob([data], {type: 'image/svg+xml'});
var url = DOMURL.createObjectURL(svg);

img.onload = function() {
  ctx.drawImage(img, 0, 0);
  DOMURL.revokeObjectURL(url);
}

img.src = url;