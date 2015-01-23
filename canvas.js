/* eslint-env browser */

document.addEventListener('DOMContentLoaded', init);

var xCanvas = 800;
var yCanvas = 600;
var ctxt;
var painter;
var painterServer;

function Painter(canvas){
	this.canvas = canvas;
	this.ctxt = canvas.getContext('2d');

	this.x = 0;
	this.y = 0;
	this.shape = 'circle';
	this.text = 'Mon Texte';

	this.drawCircle = function(x,y,color) {
		this.ctxt.beginPath();
		this.ctxt.arc(x-(this.penSize),y-(this.penSize),this.penSize*2,0,2*Math.PI)
		this.ctxt.strokeStyle = color;
		this.ctxt.fillStyle = color;
		this.ctxt.fill();
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

Painter.prototype.drawLine = function  (x2,y2,color, oldX, oldY) {
	ctxt.beginPath();
	ctxt.moveTo(oldX,oldY);
	ctxt.lineTo(x2,y2);
	ctxt.strokeStyle = color;
	ctxt.stroke();
}

Painter.prototype.drawText = function  (x,y,color) {
	ctxt.beginPath();
	ctxt.font = "30px Arial";
	ctxt.fillStyle = color;
	ctxt.fillText(this.text,x,y);

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
	this.shape = shape;
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

Painter.prototype.drawFromServer = function(point){
	this.switchShape(point.shape);
	this.text = point.text;
	this.draw(point.x, point.y, point.color, point.oldX, point.oldY);
}

Painter.prototype.move = function (eventX, eventY) {
	if(this.drawOnSecond){
		//if(this.x > eventX+25 || this.x < eventX-25 || this.y > eventY+25 || this.y < eventY-25){
			var colorTmp = colorObj.getColor();
			this.drawAndSend(this.x,this.y, colorTmp, eventX, eventY);
			this.x = eventX;
			this.y = eventY;
		//}
		ctxt.stroke();
	}	
}

Painter.prototype.drawAndSend = function (x,y,color, eventX, eventY){

	var point = { 
		shape: this.shape,
		x: x, 
		y: y,
		color: color,
		oldX: eventX,
		oldY: eventY,
		text: document.getElementById('textToWrite').value,
	};
	//this.draw(x,y, color, eventX, eventY);
	ws.send(JSON.stringify(point));
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

/**
* Dessine 100 elements avec les parametres du painter
*/
function drawRandom() {
	xFin = Math.floor(Math.random()*xCanvas);
	yFin = Math.floor(Math.random()*yCanvas);
	ctxt.beginPath();
	colorObj.randomColor();
	for (var i = 0; i < 100; i++) {

		x = Math.floor(Math.random()*xCanvas);
		y = Math.floor(Math.random()*yCanvas);
		console.log(x,y);
		painter.drawAndSend(x,y, colorObj.getColor(), xFin,yFin);
	}

}

function fillCanvas(){
	colorObj.randomColor();
	for (var i = 0; i < xCanvas; i = i+10) {
		for (var j = 0; j < yCanvas; j = j+5) {
			painter.drawAndSend(i,j, colorObj.getColor());
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

	window.addEventListener('keydown', keyPressed, true);


	painter = new Painter(canvas);
	painterServer = new Painter(canvas);


	ctxt.beginPath();

	personnage = new Personnage(100, 100);
	personnage.image.onload = function(){
		personnage.draw(100,100);
	}
	


}

function keyPressed(event) {
	switch (String.fromCharCode(event.keyCode)) {
		case"Z":
		personnage.move("up");
		break;
		case"S":
		personnage.move("down");
		break;
		case"Q":
		personnage.move("left");
		break;
		case"D":
		personnage.move("right");
		break;

	}

	console.log("toto"+event.keyCode+String.fromCharCode(event.keyCode));
	personnage.draw(50,50);
}

function Personnage(x, y){
	this.x = x;
	this.y = y;

	this.spriteX = 0;
	this.spriteY = 0;

	console.log(this.x + this.y);
	var widthImage;
	var heightImage;
	this.draw = function(){
		widthImage = image.width;
		heightImage = image.height;
		ctxt.drawImage(image, this.spriteX * widthImage/4, this.spriteY * heightImage/4, widthImage/4, heightImage/4, this.x, this.y, widthImage/4, heightImage/4);

	}

	var image = new Image();
	image.src = "img/perso1.png";
}

Personnage.prototype.move = function(direction){
	
	var newX = 0;
	var newY = 0;
	if(direction == "up"){
		newY = -50;
		this.spriteX = 0;
		this.spriteY = 3;
	}
	else if(direction == "down"){
		newY = 50;
		this.spriteX = 0;
		this.spriteY = 0;
	}
	else if(direction == "left"){
		newX = -50;
		this.spriteX = 0;
		this.spriteY = 1;
	}
	else if(direction == "right"){
		newX = 50;
		this.spriteX = 0;
		this.spriteY = 2;
	}
	var i = 0;
	var start = new Date().getTime();
	var milliseconds = 0;
	while(i<3){
		if ((new Date().getTime() - start) > milliseconds){
			console.log(this.spriteX);
			this.x += (newX/4);
			this.y += (newY/4);
			this.spriteX += 1;
			this.clean();
			this.draw();
			i++;
			start = new Date().getTime();
		}
		
	}
	this.x += (newX/4);
	this.y += (newY/4);
	this.spriteX = 0;
	this.clean();
	this.draw();
	i++;
	console.log('draw : x='+this.x+' y='+this.y);
}

Personnage.prototype.clean = function () {
	ctxt.clearRect ( 0 , 0 , xCanvas, yCanvas );
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
	painter.move(event.pageX, event.pageY);
}

function drawOne(event) {
	painter.drawAndSend(painter.x,painter.y, colorObj.getColor(), event.pageX, event.pageY);
	x = event.pageX;
	y = event.pageY;
}

function switchShape(shape) {
	painter.switchShape(shape);
}

/**
* Le clear n'est pas envoyé au serveur
*/
function clearCanvas(){
	painter.clearCanvas();
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
	console.log(point);
	painterServer.x = point.x;
	painterServer.y = point.y;
	painterServer.drawFromServer(point);
};
