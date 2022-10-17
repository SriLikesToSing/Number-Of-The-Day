//use ctrl+C to cancell and end the server
/*
 * A process that is blocked is one that is waiting for some event, 
 * such as a resource becoming available or the completion of an I/O operation.[1]
*/

/*
 * guess a number.
 * It tells how close your are compared to your peers in ranking
 * at the end of the day it shows the previous number and stores it in the database
 * it also stores the high scores for one day.
*/

// a self fullfilling leaderboard that shows at what time your best result was and if your headed in a better or worse direction 
// compared to your top result.


//TODO: finish up the front end and make it not look like dogshit

const http = require('http');
const express = require('express');
const path = require("path");
const app = express();

const fs = require('fs');
const uc = require('upper-case');
const bodyParser = require('body-parser');
const querystring = require('querystring');
var cookieParser = require('cookie-parser');
var Cookies = require('cookies');

app.use(express.static("public"));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(bodyParser.urlencoded({extended: true}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', __dirname);

const hostname = '127.0.0.1';
const port = 3000;

const winner = "YOU WON YOU CHEEKY BASTARD!";
const closeThanTopAnswer = "YOU ARE GETTING CLOSER MY FRIEND";
const worseThanTopAnswer = " YOU ARE GETTING FARTHER LOSER";

var numOfDay = 0;
var firstTime = true;
var RESULT = " ";

//storing topscore as a cookie 
function parseCookies (request) {
    const list = {};
    const cookieHeader = request.headers?.cookie;
	console.log(request.headers);
    if (!cookieHeader) return list;

    cookieHeader.split(`;`).forEach(function(cookie) {
        let [ name, ...rest] = cookie.split(`=`);
        name = name?.trim();
        if (!name) return;
        const value = rest.join(`=`).trim();
        if (!value) return;
        list[name] = decodeURIComponent(value);
    });

    return list;
}

function setCookie(cname, cvalue, response){
	response.writeHead(200, {
		"Set-Cookie": `${cname}=${cvalue}`,
		"Content-Type": `text/plain`,
	});
}

//generates the large random number that will cycle every 24 hours for the user to guess
function genLargeNum(){
	return Math.floor(Math.random()*(1000000000000-1) + 1).toString();
}

function testNumberGenerator(){
	return Math.floor(Math.random()*(10-1) + 1).toString();
}

function init(){
	//numOfDay = testNumberGenerator();
	numOfDay = genLargeNum();
	topScore = true;
	console.log("NUMER OF THE DAYYYYYYY" + " " + numOfDay);
}

//set this to update every 86400 seconds or 24 hours

init(); 
setInterval(function(){init()}, 86400);

app.get('/' , (req, res) => {
	res.render(path.join(__dirname, '/public/index.html'), {RESULT:"start now my friend"});
});

app.post('/', function(req, res){
	console.log(req.body['guess']);
	var answer = req.body['guess'];
	var cookie = req.cookies.cookieName;
	
	if(req.cookies.cookieName === undefined){
		//create cookie if the cookie is empty.
		res.cookie('topGuess', answer, {maxAge: 186400, httpOnly: true});
		console.log(req.cookies);
		console.log('cookie created successfully');
	}

	console.log(req.cookies['topGuess']);

	if(numOfDay === answer){
		RESULT = winner;
	}else if(Math.abs(answer-numOfDay) <= Math.abs(req.cookies['topGuess']-numOfDay)){
		console.log("closer...");
		RESULT = closeThanTopAnswer;
		res.cookie('topGuess', answer, {maxAge: 186400, httpOnly: true});
	}else if(Math.abs(answer-numOfDay) > Math.abs(req.cookies['topGuess']-numOfDay)){
		console.log("farther...");
		RESULT = worseThanTopAnswer;
	}

//	res.sendFile(path.join(__dirname, '/public/index.html'), {RESULT:RESULT});
	res.render(path.join(__dirname, '/public/index.html'), {RESULT:RESULT});
});

app.listen(port, () => {
	console.log(`Server running at http://${hostname}:${port}/`);
});









































