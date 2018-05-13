var mic;
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


function setup(){
angleMode(DEGREES);
 createCanvas(1425, 880);
 particleSystem = new ParticleSystem();
 particleSystem.set();

}


function draw(){
    background(235);

    drawMini();
    particleSystem.updateVelocities();
    particleSystem.updatePosition();
    particleSystem.draw();


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
    this.nParticles = 100;
    this.particleSize = 10;
    this.set = function(){
        for (var i = 0; i < this.nParticles; i++) {
            var distFromCenter = random(0, miniSize/2-offset/4);
            var degree = random(0, 360);
            var rx = cos(degree)*distFromCenter + width/2; //random(width/4, width/4 *3);
            var ry = sin(degree)*distFromCenter + height/2; //random(height/4, height/4*3);
            this.myParticles[i] = new Particle(rx, ry, 20);
        }
    }

    this.updateVelocities = function(){
        var gravityForcex = 0;
        var gravityForcey = 0.05;
 
 
        for (var i = 0; i < this.myParticles.length; i++) {
            var ithParticle = this.myParticles[i];
            var px = ithParticle.px;
            var py = ithParticle.py;
 
            for (var j = 0; j < i; j++) {
                var jthParticle = this.myParticles[j];
                var qx = jthParticle.px;
                var qy = jthParticle.py;
                //var mutualAttractionAmount = 10 * (ithParticle.mass + jthParticle.mass)/2;
                var mutualAttractionAmount = ithParticle.mass * jthParticle.mass;
 
                var dx = px - qx;
                var dy = py - qy;
                var dh = sqrt(dx*dx + dy*dy);
                var componentInX = dx/dh;
                var componentInY = dy/dh;
                var proportionToDistanceSquared = 1.0/(dh*dh);
                //var sizeOffset = (ithParticle.size + jthParticle.size)/2 *.1
                 
                var attractionForcex = mutualAttractionAmount * componentInX * proportionToDistanceSquared;
                var attractionForcey = mutualAttractionAmount * componentInY * proportionToDistanceSquared;

                if (dh > (ithParticle.mass + jthParticle.mass)/2 * 1) {
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
                particle.render(); // draw all particles
            }
        }
    }
}




//courtesy of Golan Levin (http://cmuems.com/2015c/november-4/)
function Particle(x, y, mass){
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

    this.addForce=function(fx,fy){
        var ax=fx/this.mass;
        var ay=fy/this.mass;
        this.vx+=ax;
        this.vy+=ay;
    }
    this.update=function(){
        this.vx*=this.damping;
        this.vy*=this.damping;
        this.limitVelocities();
        this.handleBoundaries();
        this.px-=this.vx;
        this.py-=this.vy;
        //this.mass = this.size;
        if(abs(this.goalSize-this.size) > 1){
            if(this.goalSize> this.size){
                this.size ++;
            }else{
                this.size --;
            }
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
            if(this.px>width)this.px-=width;
            if(this.px<0)this.px+=width;
            if(this.py>height)this.py-=height;
            if(this.py<0)this.py+=height;
        }else if(this.bElasticBoundaries){
            if(this.px>width)this.vx=-this.vx;
            if(this.px<0)this.vx=-this.vx;
            if(this.py>height){
                this.vy=-this.vy;if(this.py<0)this.vy=-this.vy;
            }
        }
    }
    this.render=function(){
        if(this.goalSize < 50){
            opacity = 70 - getDist(this.px, this.py, width/2, height/2)/2;
        }else{
            opacity = this.size * this.size;
        }
        fill(40, 140, 250, opacity);
        ellipse(this.px,this.py,this.size,this.size);
    }
}

function getDist(x1, y1, x2, y2){
    return sqrt(pow(x1 - x2, 2) + pow(y1 - y2, 2))
}

function mousePressed(){
    for(i = 0; i < particleSystem.bigParticles.length; i++){
        particle = particleSystem.bigParticles[i];
        particle.goalSize = 20;
    }


    index = floor(random(0, particleSystem.nParticles));
    changingParticle = particleSystem.myParticles[index];
    changingParticle.goalSize = 50;
    particleSystem.bigParticles.push(changingParticle);
}


