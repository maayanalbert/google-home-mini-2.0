var offset = 25;
var plugOffset = 10;
var cirlceDist = 15;
var miniFill = 170;
var correctnessIndex = 1;
var plugThickness = 15;
var plugTipThickness = 45;
var plugTipHeight = 25;
var miniSize = 450;

var particleSystem;
var voiceSystem;

var modes = ["off", "listening", "answering"];
var currMode = "off";

var speech;
var mic;

var scenarios = []
var nullScenario;
var currScenario;
var anotherDayOfSun;
var activate;
var selectAnswers;
var demi;
var instrumental;
var startTime;

var instructionsX = 50;
var instructionsY = 50;


function preload() {
  soundFormats('mp3', 'ogg');
  anotherDayOfSun = new audioClip(loadSound('assets/another_day_of_sun.mp3'));
  selectAnswers = new audioClip(loadSound('assets/googleSound3.2.mp3'))
  activate = new audioClip(loadSound('assets/googleSound1.mp3'));
  demi = new audioClip(loadSound('assets/demi_lovato.mp3'));
  instrumental = new audioClip(loadSound('assets/mia_and_sebastians_theme.mp3'));
}


function setup(){
    angleMode(DEGREES);
    createCanvas(1425, 880);
    voiceSystem = new VoiceSystem();
    setupStuff()
    //setup mic
    mic = new p5.AudioIn()
    mic.start();

    setupScenarios();
}

function setupStuff(){
    particleSystem = new ParticleSystem();
    particleSystem.set();



    //setup speechrec
    speech = new p5.Speech();
    speech.setVoice('Samantha');//Samantha
    lang = navigator.language || 'en-US';
    speechRec = new p5.SpeechRec(lang);
    continuous = true;
    interim = false;
    speechRec.start(continuous, interim);
    speechRec.resultString = "";
    speech.onEnd = speechEnded;

}

function setupScenarios(){
      //set up the scenarios
  scenario0 = new Scenario("where is New York", 
    ["new york is 3 hundred and 15 miles away", 
    "New york city is 3 hundred and 60 miles away",
    "New york is located on the eastern coast of the united states", 
    "New york is located at 40 degrees north and 74 degrees west"],
    [.4, .3, .2, .1], [])

  scenarios.push(scenario0);

    scenario1 = new Scenario("play La La Land on Spotify", 
    ["playing La La Land Instrumental Score on Spotify", 
    "playing La La Land Original Motion Picture Soundtrack on Spotify", 
    "playing La La Land by Demi Lovato On Spotify"],
    [.6, .2, .2],
    [instrumental, anotherDayOfSun, demi]);

    scenarios.push(scenario1);

    scenario2 = new Scenario("wake me up at 7", 
    ["Ok, your alarm is set for tomorrow at 7 a m", 
    "Your alarm is set for tonight at 7 p m",
    "Your alarm is set for tomorrow at 7 pm"],
    [.6, .3, .1],[])

    scenarios.push(scenario2);

    scenario3 = new Scenario("when is my next appointment", 
    ["You have dinner with scott 6 p m tonight", 
    "Your doctors appointment is scheduled for 2 pm tomorrow",
    "You have meeting with dan at 4 pm on friday"],
    [.6, .3, .1],[])

    scenarios.push(scenario3)

    nullScenario = new Scenario("", 
    ["I'm sorry, I can't answer that yet"],
    [0],[])
}


function draw(){
    background(235);
    drawInstructions();
    drawMini();
    handleModes();
    particleSystem.updateOpacity();
    particleSystem.updateVelocities();
    particleSystem.updatePosition();
    particleSystem.draw();
    if(voiceSystem.releaseFrame == frameCount){
        voiceSystem.sayAnswer();
    }
}

function drawInstructions(){
    noStroke();
    textFont("Avenir")
    textSize(20);
    fill(100);
    text("What it is hearing (refresh browser if unresponsive):", instructionsX, instructionsY);
    fill(40, 140, 250);
    text('"' + speechRec.resultString + '"', instructionsX, instructionsY + 27);

    step1 = "1. Activate by saying 'OK Google' or 'Hey Google'";
    step2 = "2. Ask it one of these questions:\n   -Where is New York?\n   -Wake me up at 7\n   -When is my next appointment?";
    step3 = "3. If you don't like the answer, say 'try again' or 'next answer'";

    fill(100, 100, 100);
    textSize(20);
    text("Instructions:", instructionsX, instructionsY+ 70);
    textSize(14);
    text(step1 + "\n\n" + step2 + "\n\n" + step3, instructionsX, instructionsY + 100);



}

function handleModes(){
    if(speechRec.resultString == "OK Google" || 
        speechRec.resultString == "hey Google"){
        setupStuff()
        currMode = "listening";
    }else if(currMode == "listening" && 
                speechRec.resultValue && 
                speechRec.resultString != "OK Google" && 
                speechRec.resultString != "hey Google"){
        currMode = "answering";

        foundScenario = false;
        for(i = 0; i < scenarios.length; i++){
            if(scenarios[i].question == speechRec.resultString){
                currScenario = scenarios[i];
                foundScenario = true;
            }
        }
        if(foundScenario == false){
            currScenario = nullScenario;
        }


        voiceSystem.releaseFrame = frameCount + 50;
        //phraseLight.rawSpeech = speechRec.resultString;
    }else if(currMode == "answering"){
        if(speechRec.resultValue &&
        speechRec.resultString == "try again" || 
        speechRec.resultString == "next answer" || 
        speechRec.resultString == "no not that one"){
        currScenario.selectedInd = (currScenario.selectedInd + 1) % 
                            currScenario.possibleAnswers.length
        speechRec.resultValue = "";
        voiceSystem.releaseFrame = frameCount;
        }
    }


    if(currMode == "off"){
        particleSystem.isVisible = false;
        activate.reset();
        selectAnswers.reset();
    }else if(currMode == "listening"){
        particleSystem.isVisible = true;
        activate.play();
        selectAnswers.reset();
    }else if(currMode == "answering"){
        particleSystem.isVisible = true;
        particleSystem.setForScenario(currScenario);
        activate.reset(); 
        selectAnswers.play();      
    }
}

function audioClip(sound){
    this.sound = sound;
    this.played = false;
    this.play = function(){
        if(this.played == false){
            this.sound.play();
            this.played = true;
        }
    }
    this.reset = function(){
        this.played = false;
    }
    this.stop = function(){
        this.sound.stop();
    }
}

function VoiceSystem(){
    this.releaseFrame = -1;
    this.sayAnswer = function(){
        if(currScenario.selectedInd > 0 && currScenario.songs.length != 0){
            currScenario.songs[currScenario.selectedInd-1].stop();
        }
        speech.speak(currScenario.possibleAnswers[currScenario.selectedInd]);
        speechRec.resultString = "";
    }

}

function Scenario(question, possibleAnswers, answerProbabilities, songs){
    this.question = question;
    this.possibleAnswers = possibleAnswers;
    this.answerProbabilities = answerProbabilities;
    this.songs = songs;
    this.selectedInd = 0;
}

function speechEnded(){
    if(currScenario.songs.length != 0){
        currScenario.songs[currScenario.selectedInd].play();
    }
}

function drawMini(){
    noStroke();

    //plug
    fill(210);
    rect(width/2 - plugThickness/2, 0, plugThickness, height/2);
    
    fill(250);
    rect(width/2 - plugThickness/2, 0, plugThickness*2/3, height/2);

    //plugtip

    fill(200);
    rect(width/2 - plugTipThickness/2, 
        height/2 - miniSize/2 - plugTipHeight, 
        plugTipThickness, plugTipHeight);

    fill(240);
    rect(width/2 - plugTipThickness/2, 
        height/2 - miniSize/2 - plugTipHeight, 
        plugTipThickness*5/6, plugTipHeight);


    fill(250);
    rect(width/2 - plugTipThickness/2, height/2 - miniSize/2 - plugTipHeight, 
        plugTipThickness/6, plugTipHeight);

    //mini shadow
    fill(120);
    ellipse(width/2+offset, height/2+offset, miniSize - offset, miniSize-offset);
    
    //google mini
    fill(miniFill)
    ellipse(width/2, height/2, miniSize, miniSize);

    //shading
    fill(miniFill + 10);
    ellipse(width/2 - offset/4, height/2 - offset/4, miniSize - offset, miniSize - offset);
}


//courtesy of Golan Levin (http://cmuems.com/2015c/november-4/)
function ParticleSystem(){
    this.bigParticles = [];
    this.myParticles = [];
    this.nParticles = 400;
    this.particleSize = 10;
    this.isVisible = false;
    this.opacity = 0;
    this.set = function(){
        for (var i = 0; i < this.nParticles; i++) {
            var distFromCenter = random(0, miniSize/2-offset/4);
            var degree = random(0, 360);
            var rx = cos(degree)*distFromCenter + width/2; //random(width/4, width/4 *3);
            var ry = sin(degree)*distFromCenter + height/2; //random(height/4, height/4*3);
            this.myParticles[i] = new Particle(rx, ry, 10, random(.7, 1));
        }
    }

    this.setForScenario = function(scenario){
        if(this.bigParticles.length != scenario.possibleAnswers.length){
            for(ansInd = 0; ansInd < scenario.possibleAnswers.length; ansInd++){
                this.addToBigParticles(scenario.answerProbabilities[ansInd]*250);
            }
        }
        for(ind = 0; ind < this.bigParticles.length; ind++){
            if(ind == scenario.selectedInd){
                this.bigParticles[ind].answering = true;
            }else{
                this.bigParticles[ind].answering = false;
            }
        }
    }

    this.addToBigParticles = function(goalSize){
        index = floor(random(0, particleSystem.nParticles));
        changingParticle = particleSystem.myParticles[index];
        changingParticle.goalSize = goalSize;
        particleSystem.bigParticles.push(changingParticle);
    }

    this.updateVelocities = function(){
        var gravityForcex = 0;
        var gravityForcey = -1;
 
 
        for (var i = 0; i < this.myParticles.length; i++) {
            var ithParticle = this.myParticles[i];
            var px = ithParticle.px;
            var py = ithParticle.py;

            
            //ithParticle.addForce(gravityForcex, gravityForcey);
 
            for (var j = 0; j < i; j++) {
                var jthParticle = this.myParticles[j];
                var qx = jthParticle.px;
                var qy = jthParticle.py;
                //var mutualAttractionAmount = 10 * (ithParticle.mass + jthParticle.mass)/2;
                var mutualAttractionAmount = (ithParticle.mass * jthParticle.mass)/2;
 
                var dx = px - qx;
                var dy = py - qy;
                var dh = sqrt(dx*dx + dy*dy);
                var componentInX = dx/dh;
                var componentInY = dy/dh;
                var proportionToDistanceSquared = 1.0/(dh*dh);
                //var sizeOffset = (ithParticle.size + jthParticle.size)/2 *.1
                 
                var attractionForcex = mutualAttractionAmount * componentInX * proportionToDistanceSquared;
                var attractionForcey = mutualAttractionAmount * componentInY * proportionToDistanceSquared;

                if (dh > (ithParticle.mass + jthParticle.mass)/2 * 8) {
                    ithParticle.addForce( attractionForcex,  attractionForcey); // add in forces
                    jthParticle.addForce(-attractionForcex, -attractionForcey); // add in forces
                }else{
                    ithParticle.addForce( -attractionForcex,  -attractionForcey); // add in forces
                    jthParticle.addForce(attractionForcex, attractionForcey);  // add in forces
                }
            }
        }
    }
 
    this.updatePosition = function(){
        for (var i = 0; i < this.myParticles.length; i++) {
                particle = this.myParticles[i];
                particle.update();
        }
    }

    this.draw = function(){
        for (var i = 0; i < this.myParticles.length; i++) {
            particle = this.myParticles[i];
            if(sqrt(pow(width/2 - particle.px, 2) + pow(height/2 - particle.py, 2)) < miniSize/2){
                if(abs(particle.goalSize-particle.size) < 15 && particle.goalSize < 20){
                    particle.render(this.opacity); 
                }
            }
        }

        for (var i = 0; i < this.bigParticles.length; i++) {
            particle = this.bigParticles[i];
            if(sqrt(pow(width/2 - particle.px, 2) + pow(height/2 - particle.py, 2)) < miniSize/2){
                particle.render(this.opacity * currScenario.answerProbabilities[i]*3); // draw all particles
            }
        }
    }
    this.updateOpacity = function(){
        if(this.isVisible == false){
            //if(this.opacity > 0){
                this.opacity = this.opacity*.9 +0*.1;
            //}
        }else{
            //if(this.opacity < 255){
                this.opacity = this.opacity*.9 + 255*.1 ;               
            //}
        }

    }
}




//courtesy of Golan Levin (http://cmuems.com/2015c/november-4/)
function Particle(x, y, mass, personalOpacity){
    this.personalOpacity = personalOpacity;
    this.size = mass;
    this.px= x;
    this.py=y;
    this.vx= 0;
    this.vy=0;
    this.damping = 0.96;
    this.mass = (pow(mass, 3))/100;
    this.bLimitVelocities=true;
    this.bPeriodicBoundaries=false;
    this.bElasticBoundaries=false;
    this.goalSize = mass;
    this.answering = false;
    this.opacity = 0;

    this.addForce=function(fx,fy){
        var ax=fx/this.mass*1.5;
        var ay=fy/this.mass*1.5;
        if(this.goalSize < 30){
            this.vx+=ax;
            this.vy+=ay;
        }else{
            this.vx+=ax*.1;
            this.vy+=ay*.1;            
        }
    }
    this.update=function(){
        this.vx*=this.damping;
        this.vy*=this.damping;
        this.limitVelocities();
        this.handleBoundaries();

        //if(this.goalSize < 30){
            this.px-=this.vx;
            this.py-=this.vy;
       //}

        if(abs(this.goalSize-this.size) > 1){
            this.size = this.size*.9 + this.goalSize*.1;
        }
    }
    this.limitVelocities=function(){
        if(this.bLimitVelocities){
            var speed=sqrt(this.vx*this.vx+this.vy*this.vy);
            var maxSpeed=10;
            if(speed>maxSpeed){
                this.vx*=maxSpeed/speed;this.vy*=maxSpeed/speed;
            }
        }
    }
    this.inBounds=function(){
        return(this.px<width&&this.px>0&&this.py<height&&this.py>0);
    }
    this.handleBoundaries=function(){
        if(this.bPeriodicBoundaries){
            if(this.px>width)
                this.px-=width;
            if(this.px<0)
                this.px+=width;
            if(this.py>height)
                this.py-=height;
            if(this.py<0)
                this.py+=height;
        }else if(this.bElasticBoundaries){
            if(sqrt(pow(width/2 - particle.px, 2) + pow(height/2 - particle.py, 2)) > miniSize/2){
                this.vy = this.vy*-1; // draw all particles
                this.vx = this.vx*-1;
            }
        }
    }
    this.render=function(parentOpacity){

        

        if(abs(this.goalSize-this.size) < 15 && this.goalSize < 20){
            if(currMode == "listening"){
                this.opacity = 255 -getDist(this.px, this.py, width/2, height/2)*1.2 //+ this.size*this.size;
                this.opacity = this.opacity*this.personalOpacity
            }else if (currMode == "answering") {
                goalOpacity = (0 -getDist(this.px, this.py, width/2, height/2)*.8)*this.personalOpacity

                this.opacity = (this.opacity*.95 + goalOpacity*.05)
            }  
           fill(40, 140, 250, this.opacity*(parentOpacity/255));
           ellipse(this.px,this.py,this.size,this.size);
        }else{
            if(this.answering){
                numLayers = 5;
            }else{
                numLayers = 1;
            }
           for(j = 0; j < numLayers; j++){
                diameter = this.size - j*5
                r = lerp(255, 40, 1 - j*.1);
                g = lerp(255, 140, 1 - j*.1);
                b = lerp(255, 250, 1 - j*.1);

                fill(r, g, b, 255*(parentOpacity/255));
                ellipse(this.px,this.py,diameter,diameter);
           }

        }
    }
}

function getDist(x1, y1, x2, y2){
    return sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2))
}

//for testing

function mousePressed(){

    for(i = 0; i < particleSystem.bigParticles.length; i++){
        particle = particleSystem.bigParticles[i];
        particle.goalSize = 7;
        particle.answering = false;
    }

    particleSystem.bigParticles = [];

    for(i = 0; i < 3; i++){
        index = floor(random(0, particleSystem.nParticles));
        changingParticle = particleSystem.myParticles[index];
        changingParticle.goalSize = random(70, 90);
        particleSystem.bigParticles.push(changingParticle);
        if(i == 2){
            changingParticle.answering = true;
        }
    }
}

function keyPressed(){
    if(particleSystem.isVisible){
        particleSystem.isVisible = false;
    }else{
        particleSystem.isVisible = true;
    }
}










