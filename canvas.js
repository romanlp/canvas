/* eslint-env browser */

document.addEventListener('DOMContentLoaded', init);

var xCanvas = 800;
var yCanvas = 600;
var ctxt;
var painter;

function Painter(canvas){
	this.canvas = canvas;
	this.ctxt = canvas.getContext('2d');

	this.x = 0;
	this.y = 0;

	this.drawCircle = function(x,y,color) {
		this.ctxt.beginPath();
		this.ctxt.arc(x-(this.penSize),y-(this.penSize),this.penSize*2,0,2*Math.PI)
		this.ctxt.strokeStyle = color;
		this.ctxt.fillStyle = color;
		this.ctxt.fill();

		var point = { x: x, y: y, color:color };
		ws.send(JSON.stringify(point));
	};
	this.penSize = 5;
	this.drawOnSecond = false;
	this.draw = this.drawCircle;
}

Painter.prototype.drawRectangle = function  (x,y,color) {
	this.ctxt.beginPath();
	this.ctxt.rect(x-(this.penSize*2),y-this.penSize,this.penSize*4,this.penSize*2);
	this.ctxt.strokeStyle = color;
	this.ctxt.fillStyle = color;
	this.ctxt.fill();
}

Painter.prototype.drawSquare = function  (x,y,color) {
	ctxt.beginPath();
	ctxt.rect(x-(this.penSize*2),y-this.penSize,this.penSize*2,this.penSize*2);
	ctxt.strokeStyle = color;
	ctxt.fillStyle = color;
	ctxt.fill();
}

Painter.prototype.drawLine = function  (x,y,color, oldX, oldY) {
	ctxt.beginPath();
	ctxt.moveTo(oldX,oldY);
	ctxt.lineTo(x,y);
	ctxt.strokeStyle = color;
}

Painter.prototype.drawText = function  (x,y,color) {
	ctxt.beginPath();
	ctxt.font = "30px Arial";
	ctxt.strokeStyle = color;
	ctxt.fillText(document.getElementById('textToWrite').value,x,y);

}

Painter.prototype.drawImage = function  (x,y,color) {
	ctxt.beginPath();
	var img1 = new Image();
	//drawing of the test image - img1
	img1.onload = function () {
		ctxt.drawImage(img1, x, y);
	};
	img1.src = "img/img1.png";
}

Painter.prototype.enableDraw = function (x,y){
	this.x = x;
	this.y = y;
	colorObj.randomColor();
	this.drawOnSecond = true;
}

Painter.prototype.disableDraw = function (){
	this.drawOnSecond = false;
}

Painter.prototype.clearCanvas = function () {
	ctxt.clearRect(0,0,xCanvas,yCanvas);
}

Painter.prototype.switchShape = function (shape){
	switch(shape){
		case 'circle':
		this.draw = this.drawCircle;
		break;
		case 'square':
		this.draw = this.drawSquare;
		break;
		case 'rect':
		this.draw = this.drawRectangle;
		break;
		case 'line':
		this.draw = this.drawLine;
		break;
		case 'text':
		this.draw = this.drawText;
		break;
		case 'image':
		this.draw = this.drawImage;
		break;
		default:
		this.draw = this.drawLine;
	}
}

Painter.prototype.move = function (eventX, eventY) {
	if(this.drawOnSecond){
		if(x > eventX+25 || x < eventX-25 || y > eventY+25 || y < eventY-25){
			this.draw(x,y, colorObj.getColor(), eventX, eventY);
			x = eventX;
			y = eventY;
		}
		ctxt.stroke();
	}
}

/*
* Utilisation de la couleur sous la forme d'un objet singleton
* Permet de gerer la génération aléatoire de couleur
*/
var colorObj = {
	value: '#000000',
	panel: 'random',
	randomness: false,
	random: function(s,c) {
		if(c==0){
			return '';
		}
		else{
			return s[Math.floor(Math.random() * s.length)]+this.random(s,c-1);
		}
	},
	randomColor: function() {
		if(colorObj.panel === 'random'){

			colorObj.value =  '#'+ this.random('123456789ABCDEF',6)
		}
		else if(colorObj.panel === 'dark'){
			colorObj.value = '#' + this.random('12345',6);
		}
		else if(colorObj.panel === 'light'){
			colorObj.value = '#' + this.random('ABCDEF',6);
		}
		else if(colorObj.panel === 'red'){
			colorObj.value = '#' + this.random('BCDEF',2) + this.random('12345678',4);
		}
		else if(colorObj.panel === 'blue'){
			colorObj.value = '#' + this.random('12345678',4) + this.random('BCDEF',2);
		}
		else if(colorObj.panel === 'green'){
			colorObj.value = '#' + this.random('12345678',2) + this.random('BCDEF',2) + this.random('12345678',2);
		}
	},
	getColor: function(){
		if(this.randomness == true){
			this.randomColor();
		}
		return this.value;
	},
	setRandom: function(r){
		this.randomness = r;
	}
};

function updateTailleInput (value) {
	penSize = document.getElementById('taille').value;
}

function setColor (color) {
	colorObj.panel = color;	
}

function drawRandomCircle() {
	ctxt.beginPath();
	colorObj.randomColor();
	for (var i = 0; i < 100; i++) {

		x = Math.random()*xCanvas;
		y = Math.random()*yCanvas;
		painter.draw(x,y, colorObj.getColor());
	}

}

function fillCanvas(){
	colorObj.randomColor();
	for (var i = 0; i < xCanvas; i = i+10) {
		for (var j = 0; j < yCanvas; j = j+5) {
			painter.draw(i,j, colorObj.getColor());
		};
	};
}


function init() {
	var canvas = document.querySelector('canvas');
	canvas.width  = xCanvas;
	canvas.height = yCanvas;

	ctxt = canvas.getContext('2d');

	canvas.addEventListener('mousedown', enableDraw);
	canvas.addEventListener('mouseup', disableDraw);
	canvas.addEventListener('mouseout', disableDraw);
	canvas.addEventListener('mousemove', move);
	canvas.addEventListener('click', drawOne);

	painter = new Painter(canvas);
}

function enableDraw(){
	x = event.pageX;
	y = event.pageY;
	painter.enableDraw(x,y);
}

function disableDraw(){
	painter.disableDraw();
}

function move (event) {
	var point = { x: event.pageX, y: event.pageY };
	//ws.send(JSON.stringify(point));
	painter.move(event.pageX, event.pageY);
}

function drawOne(event) {
	painter.draw(x,y, colorObj.getColor(), event.pageX, event.pageY);
	x = event.pageX;
	y = event.pageY;
}

function switchShape(shape) {
	painter.switchShape(shape);
}

function clearCanvas(){
	painter.clearCanvas();
}

// Serialize coordinates then send to the server
function send(event) {
	var point = { x: event.pageX, y: event.pageY };
	ws.send(JSON.stringify(point));
}

function draw(point) {
	var x = point.x;
	var y = point.y;

	ctxt.beginPath();
	ctxt.moveTo(x, y);
	ctxt.lineTo(x + 1, y + 1);
	ctxt.stroke();
}

// Setup WebSocket

var url = 'ws:' + document.location.hostname + ':3001';
var ws = new WebSocket(url);
ws.onopen = function() { console.log('CONNECTED'); };
ws.onclose = function() { console.log('DISCONNECTED'); };

// When a message is received from the server, draw the point
ws.onmessage = function(event) {
	// Need to unserialize data first
	var point = JSON.parse(event.data);
	painter.draw(point.x, point.y, point.color);
};
