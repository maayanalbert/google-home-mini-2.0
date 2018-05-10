var mic;
var offset = 25;
var plugOffset = 10;
var cirlceDist = 15;
var words = [];
var interval = 0;
var wordStart = 0;
var miniFill = 170;
var makingWords = false;
var dots = [];
var correctnessIndex = 1;
var plugThickness = 15;
var plugTipThickness = 45;
var plugTipHeight = 25;
var miniSize = 450;
var mouseAngle = 0;
var positionAngle = 0;
var speechRec;
var listeningLight;
var phraseLight;
// var optionLight;
var answerLight;
var modes = ["off", "listening", "parsingSpeech", "answering"];
var currMode = "off";
var clickCount = 0;
var startTime = 0;
var phrasePeriod = 1500;
var voice;
var scenarios = []
var nullScenario;
var anotherDayOfSun;
var activate;
var processWords;
var demi;
var instrumental;
var startTime2;


function preload() {
  soundFormats('mp3', 'ogg');
  anotherDayOfSun = new audioClip(loadSound('assets/another_day_of_sun.mp3'));
  processWords = new audioClip(loadSound('assets/googleSound3.2.mp3'))
  activate = new audioClip(loadSound('assets/googleSound1.mp3'));
  demi = new audioClip(loadSound('assets/demi_lovato.mp3'));
  instrumental = new audioClip(loadSound('assets/mia_and_sebastians_theme.mp3'));
}

function setup(){
    //anotherDayOfSun.play();
 createCanvas(1425, 880);
    speech = new p5.Speech();
    speech.setVoice('Samantha');//Samantha
  mic = new p5.AudioIn()
  mic.start();
  noStroke();
  angleMode(DEGREES);
  lang = navigator.language || 'en-US';
  speechRec = new p5.SpeechRec(lang);
  continuous = true;
  interim = false;
  speechRec.start(continuous, interim);
  speechRec.resultString = "";
  speech.onEnd = speechEnded;
  //speech.speak('Coding Train');


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
    [1],[])

    //initialize lights
    listeningLight = new ListeningLight(0);
    phraseLight = new PhraseLight(0);
    phraseLight.parseSpeech();
    answerLight = new AnswerLight(0);

}


function draw(){
    background(235);
    micLevel = mic.getLevel();
    print(speechRec.resultString);
    print(currMode);

    if(speechRec.resultString == "OK Google" || 
        speechRec.resultString == "hey Google"){
        currMode = "listening";
    }else if(currMode == "listening" && 
                speechRec.resultValue && 
                speechRec.resultString != "OK Google" && 
                speechRec.resultString != "hey Google"){
        currMode = "parsingSpeech";

        foundScenario = false;
        for(i = 0; i < scenarios.length; i++){
            if(scenarios[i].question == speechRec.resultString){
                answerLight.currScenario = scenarios[i];
                foundScenario = true;
            }
        }
        if(foundScenario == false){
            answerLight.currScenario = nullScenario;
        }
                phraseLight.rawSpeech = speechRec.resultString;
        phraseLight.parseSpeech();


        startTime = millis();
    }else if(currMode == "parsingSpeech" && 
        millis() >= startTime + phrasePeriod ){
        currMode = "answering";
        answerLight.sayAnswer();
    }else if(currMode == "answering"){
        if(speechRec.resultValue &&
        speechRec.resultString == "try again" || 
        speechRec.resultString == "next answer" || 
        speechRec.resultString == "no not that one"){
        answerLight.selectedInd = (answerLight.selectedInd + 1) % 
                            answerLight.currScenario.possibleAnswers.length
        answerLight.sayAnswer();
        }
    }


    if(currMode == "off"){
        listeningLight.isOn = false;
        phraseLight.isOn = false;
        answerLight.isOn = false;
        activate.reset();
        processWords.reset();
    }else if(currMode == "listening"){
        listeningLight.isOn = true;
        phraseLight.isOn = false;
        answerLight.isOn = false;
        activate.play();
        processWords.reset();
    }else if(currMode == "parsingSpeech"){
        listeningLight.isOn = false;
        phraseLight.isOn = true;
        answerLight.isOn = false;
        activate.reset();
        processWords.play();
    }else if(currMode == "answering"){
        listeningLight.isOn = false;
        phraseLight.isOn = false;
        answerLight.isOn = true;
        activate.reset(); 
        processWords.reset();      
    }

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

    
    // listeningLight.draw();
    // listeningLight.update();
    // phraseLight.draw();
    // phraseLight.update();
    // answerLight.draw();
    // answerLight.update();
    answerLight.activate();
    phraseLight.activate();
    listeningLight.activate();


    getMouseAngle();
}

function audioClip(sound){
    this.sound = sound;
    this.played = false;
    this.play = function(){
        print(this.played);
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

function Scenario(question, possibleAnswers, answerProbabilities, songs){
    this.question = question;
    this.possibleAnswers = possibleAnswers;
    this.answerProbabilities = answerProbabilities;
    this.songs = songs;
}

function speechEnded(){
    if(answerLight.currScenario.songs.length != 0){
        answerLight.currScenario.songs[answerLight.selectedInd].play();
    }
}

function AnswerLight(opacity){
    this.opacity = opacity;
    // this.options = [.4, .3, .15, .15]
    this.selectedInd = 0;
    this.isOn = false;
    this.currScenario = scenarios[0];
    this.sayAnswer = function(){
        if(this.selectedInd > 0 && this.currScenario.songs.length != 0){
            this.currScenario.songs[this.selectedInd-1].stop();
        }
        speech.speak(this.currScenario.possibleAnswers[this.selectedInd]);
        speechRec.resultString = "";
    }
    this.draw = function(){
        startDegree = 180
        currentPos = startDegree;
        gapSize = 0
        for(optionInd = 0; optionInd < this.currScenario.possibleAnswers.length; optionInd++){

            noStroke();
            optionSize = this.currScenario.answerProbabilities[optionInd]*359.99

            midPoint = currentPos + gapSize*optionInd + optionSize/2;

            numGradients = 7
            //gradientSize = (miniSize-offset*3)/numGradients;

            if(this.selectedInd == optionInd){
                for(i = 0; i < numGradients; i ++){

                fillColorR = lerp(50, 255, i*.07 + .4)
                fillColorG = lerp(190, 255, i*.07 + .4)
                fillColorB = lerp(235, 255, i*.07 + .4)

                fill(fillColorR, fillColorG, fillColorB, this.opacity);

                    arc(width/2-offset/4, height/2 - offset/4,
                        miniSize-offset -7*i, 
                        miniSize-offset -7*i,
                        currentPos + gapSize*optionInd,
                        currentPos + optionSize + gapSize*optionInd);
                }
            }else{

                fill(176, 229, 247, this.opacity/4);
                arc(width/2-offset/4 ,height/2 - offset/4,
                        miniSize-offset,miniSize-offset,
                        currentPos + gapSize*optionInd,
                        currentPos + optionSize + gapSize*optionInd);

            }

            if(this.currScenario.question != ""){
                stroke(miniFill+ 10);
                strokeWeight(7);
                strokeCap(PROJECT)
                inset = 7;

                //sohcahtoa
                //opposite/hypotenuse
                line(width/2-offset/4,height/2 - offset/4, 
                    width/2-offset/4 + cos(currentPos)*(miniSize-offset - inset)/2,
                    height/2-offset/4 + sin(currentPos)*(miniSize-offset - inset)/2)

                line(width/2-offset/4,height/2 - offset/4, 
                    width/2-offset/4 + cos(startDegree)*(miniSize-offset - inset)/2,
                    height/2-offset/4 + sin(startDegree)*(miniSize-offset - inset)/2)
            }

            currentPos += optionSize;
        }
    }
    this.update = function(){
        if(this.isOn == false){
            if(this.opacity > 0){
                this.opacity = this.opacity - 5;
            }
        }else{
            if(this.opacity < 255){
                this.opacity = this.opacity + 2;               
            }
        }

    }
    this.activate = function(){
        this.update();
        this.draw();
    }
}

function PhraseLight(opacity){
    this.strokes = [random(200, 255), random(200, 255), random(200, 255), 
    random(200, 255), random(200, 255)]
    this.wordSizes = [random(5, 20), random(5, 20),random(5, 20),random(5, 20),
    random(5, 20)]
    this.rawSpeech = "How far away is San Francisco?";
    this.parsedSpeech = [];
    this.speechTags = [];
    this.isOn = false;
    this.positionAngle = 0;
    this.opacity = opacity;
    this.parseSpeech = function(){
        this.parsedSpeech = [];
        this.speechTags = [];
        currWord = "";
        for(i = 0; i < this.rawSpeech.length; i++){
            currLetter = this.rawSpeech[i];
            if(currLetter == " "){
                this.parsedSpeech.push(currWord);
                this.speechTags.push(floor(random(0, 5)));
                currWord = "";
            }else{
                currWord += currLetter;
            }
        }
        this.parsedSpeech.push(currWord);
    }
    this.update = function(){
        if(this.isOn == false){
            if(this.opacity > 0){
                this.opacity = this.opacity - 20;
            }
            // this.baseBrightness = 0;
        }else{
            if(this.opacity < 255){
                this.opacity = this.opacity + 5;               
            }
            // if(this.baseBrightness < .3){
            //     this.baseBrightness += .01;
            // }
        }
    }
    //this.baseBrightness = .4;
    this.draw = function(){
        //strokeCap(SQUARE);
        noFill();
        letterLength = 4
        overallLength = this.rawSpeech.length * letterLength;
        currentPos = 0;
        currWordSize = 0;
        gapSize = 2
        strokeCap(SQUARE)
        for(numWord = 0; numWord < this.parsedSpeech.length; numWord++){
            wordIndex = this.parsedSpeech.length - 1- numWord;
            currWordSize = this.parsedSpeech[wordIndex].length 
                                * letterLength;


            for(i = 0; i < 3; i++){

                if(this.speechTags[wordIndex] > 0){
                    fillColorR = lerp(50, 255, i*.15 + .3)
                    fillColorG = lerp(190, 255, i*.15 + .3)
                    fillColorB = lerp(235, 255, i*.15 + .3)
                    strokeWeight(37 - i*5);
                    stroke(fillColorR, fillColorG, fillColorB, this.opacity);
                }else{
                    stroke(176, 229, 247, this.opacity/10); 
                    strokeWeight(37);
                }

            
                arc(width/2-offset/4,height/2 - offset/4,
                    miniSize-offset*2.5,miniSize-offset*2.5,
                    mouseAngle -overallLength/2 + currentPos + gapSize*numWord,
                    mouseAngle -overallLength/2 + currentPos + currWordSize +gapSize*numWord);
            }
            currentPos += currWordSize;

        }
    }
    this.activate = function(){
        this.update();
        this.draw();
    }
}

function ListeningLight(opacity){
    this.positionAngles = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.isOn = false;
    this.opacity = opacity;
    this.update = function(){
        if(this.isOn == false){
            if(this.opacity > 0){
                this.opacity = this.opacity - 10;
            }
        }else{
            if(this.opacity < 255){
                this.opacity = this.opacity + 10;               
            }
        }
    }
    this.sizeOffset = 0;
    this.draw = function(){
        strokeCap(ROUND);
        noFill();
        for(i = this.positionAngles.length - 1; i >= 0; i--){
            if(mouseAngle < 90 && this.positionAngles[i] > 270){
                mouseAngle = mouseAngle + 360;            
            }else if(mouseAngle > 270 && this.positionAngles[i] < 90){
                mouseAngle = mouseAngle - 360;
            }
            this.positionAngles[i] = this.positionAngles[i]*(1-.15*(this.positionAngles.length-i)) 
                                        + mouseAngle*.15*(this.positionAngles.length-i);
            this.positionAngles[i] = this.positionAngles[i] + 360;
            this.positionAngles[i] = this.positionAngles[i] % 360;

            fillColorR = lerp(255, 50, i*.05 + .1)
            fillColorG = lerp(255, 190, i*.05 + .1)
            fillColorB = lerp(255, 235, i*.05 + .1)

            stroke(fillColorR, fillColorG, fillColorB, this.opacity);
            strokeWeight(30 + i*1);
            arc(width/2-offset/4,height/2 - offset/4,
                miniSize-offset*2.5 -i*0,miniSize-offset*2.5 -i*0,
                this.positionAngles[i] - 3 - i*2,
                this.positionAngles[i] + 3 + i*2);
        }        
    }
    this.activate = function(){
        this.update();
        this.draw();
    }
}

function getMouseAngle(){
    distFromCenterX = mouseX - width/2;
    distFromCenterY =  mouseY - height/2;
    mouseAngle = atan(distFromCenterY/distFromCenterX);

    fill(0);
    noStroke();

    if(distFromCenterX < 0 && distFromCenterY > 0){
        mouseAngle = map(mouseAngle, -90, 0, 90, 180);
    }else if(distFromCenterX < 0 && distFromCenterY < 0){
        mouseAngle = map(mouseAngle, 0, 90, 180, 270);
    }else if(distFromCenterX > 0  && distFromCenterY < 0){
        mouseAngle = map(mouseAngle, -90, 0, 270, 360);
    }
}

function mousePressed(){
    clickCount++;
    currMode = "off";
}









