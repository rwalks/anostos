ScrubForestArt = function(){
  AnimatedCachedArt.call(this);

  this.scrubArt = artHolder.getArt('scrubPlant');

  this.frameCount = this.scrubArt.frameCount;
  this.size = new Vector(12*config.gridInterval,2*config.gridInterval);
  this.speed = this.scrubArt.speed;

  this.plants = [];
  this.plantCount = 30;
  this.scrubProb = 0.4;

  var x;
  var type;
  var buff = (this.scrubArt.size.x) / this.size.x;
  for(var p = 0; p < this.plantCount; p++){
    if(Math.random() < this.scrubProb){
      x = buff + (Math.random() * (1-(2*buff)));
      type = 0;
      this.plants.push([x,type]);
    }
  }

  this.drawFrame = function(frame){
    var lX = this.canvas.width;
    var lY = this.frameHeight;
    var oX;
    var oY = ((this.frameHeight * frame)+lY);
    var orig = new Vector(oX,oY);
    var plant;
    var art;
    for(var p = 0; p < this.plants.length; p++){
      plant = this.plants[p];
      orig.x = lX * plant[0];
      orig.y = oY - (this.scrubArt.size.y * config.yRatio);
      this.scrubArt.draw(orig,this.context,1,frame);
    }

  }
}

ScrubForestArtS = function(){
  ScrubForestArt.call(this);
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
  this.scrubArt = artHolder.getArt('scrubS');
}

ScrubForestArtM = function(){
  ScrubForestArt.call(this);
  this.size.x = this.size.x * 0.8;
  this.size.y = this.size.y * 0.8;
  this.scrubArt = artHolder.getArt('scrubM');
}

StarArt = function(){
  AnimatedCachedArt.call(this);

  this.frameCount = 12;
  this.size = new Vector(0.2*config.gridInterval,0.2*config.gridInterval);
  this.speed = 0.3;

  this.drawFrame = function(frame){
    var lX = this.canvas.width;
    var lY = this.frameHeight;
    var oX = lX/2;
    var oY = ((this.frameHeight * frame)+(lY*0.5));
    var orig = new Vector(oX,oY);
    var rad = Math.min(lX,lY) * (0.5 - (Math.random()*0.15));

    var r = 150 + Math.floor(Math.random() * 100);
    var g = 150 + Math.floor(Math.random() * 100);
    var b = 150 + Math.floor(Math.random() * 100);
    var a = 0.3+(Math.random()*0.5);
    this.context.fillStyle = "rgba("+r+","+g+","+b+","+a+")";
    sceneArt.drawGradCircle(orig,3,rad,this.context);
  }
}

CloudArt = function(){
  AnimatedCachedArt.call(this);

  this.frameCount = 20;
  this.size = new Vector(20*config.gridInterval,8*config.gridInterval);
  this.speed = 0.3;

  this.clouds = [];
  this.cloudCount = 60;

  for(var i = 0; i < this.cloudCount; i++){
    var x = 0.2+(Math.random() * 0.6);
    var yRange = 0.5 - Math.abs(0.5-x);
    var y = 0.5-(yRange/2)+(Math.random() * yRange);
    var rad = (Math.random()*yRange*2);
    var cR = 80 + Math.floor(Math.random() * 40);
    var cG = 180 + Math.floor(Math.random() * 80);
    var cB = 80 + Math.floor(Math.random() * 60);
    var cA = 0.05 + (Math.random()*0.05);
    var colStr = "rgba("+cR+","+cG+","+cB+","+cA+")";
    this.clouds.push([x,y,rad,colStr]);
  }

  this.drawFrame = function(frame){
    var baseY = this.frameHeight * frame;
    var lX = this.canvas.width;
    var lY = this.frameHeight;
    this.context.lineWidth = lX * 0.005;
//    this.context.strokeStyle = "rgba(10,150,10,0.2)";
    for(var c = 0; c < this.clouds.length; c++){
      var cloud = this.clouds[c];
      var flip = (c%4 == 0);
      this.context.fillStyle = cloud[3];
      var x = cloud[0];
      var y = cloud[1];
      x = x * lX;
      y = baseY + (y * lY);
      var minX = Math.min(x,(lX-x));
      var topY = flip ? (baseY+lY-y) : (baseY+lY);
      var minY = Math.min((y-baseY),topY);
      var maxR = (0.96 + Math.abs((0.08*(frame/this.frameCount))-0.04)) * Math.min(minX,minY);
      var rand = Math.random();
      if(rand > 0.9){
        this.clouds[c][2] += (Math.random() < 0.5) ? 0.001 : -0.001;
        this.clouds[c][2] = utils.clamp(this.clouds[c][2],0,1);
      }else if(rand > 0.8){
        var dX = Math.random() * 0.001;
        var dY = Math.random() * 0.001;
        this.clouds[c][0] += (Math.random() < 0.5) ? dX : -dX;
        this.clouds[c][1] += (Math.random() < 0.5) ? dY : -dY;
        this.clouds[c][0] = utils.clamp(this.clouds[c][0],0,1);
        this.clouds[c][1] = utils.clamp(this.clouds[c][1],0,1);
      }
      var r = this.clouds[c][2] * maxR;
      this.context.beginPath();
      this.context.arc(x,y,r,Math.PI,2*Math.PI,flip);
      this.context.fill();
      //this.context.stroke();
    }
    //shade
    this.context.save();
    this.context.globalCompositeOperation = 'source-atop';
    var a = 0.8;
    var yInt = -0.05;
    for(var y = 1; y > 0.1; y += yInt){
      yInt = Math.min(yInt*0.9,-0.001);
      var oY = baseY + (y * lY);
      this.context.fillStyle = "rgba(10,10,10,"+a+")";
      this.context.beginPath();
      this.context.rect(0,oY,lX,yInt*lY);
      this.context.fill();
      a = a * (a < 0.4 ? 0.5 : 0.98);
    }
    this.context.restore();
  }
}

CloudArtS = function(){
  CloudArt.call(this);
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
}

CloudArtL = function(){
  CloudArt.call(this);
  this.size.x = this.size.x * 1.5;
  this.size.y = this.size.y * 1.5;
}

FieldArt = function(){
  AnimatedCachedArt.call(this);

  this.frameCount = 30;
  this.speed = 0.1;

  this.size.x = config.cX;
  this.size.y = config.cY*0.15;

  this.drawFrame = function(frame){
    var lX = this.canvas.width;
    var lY = this.frameHeight;
    var oY = lY * frame;
    if(!frame){
      //always same bg color, back all in first frame
      this.context.fillStyle = "rgba(250,0,250,1)";
      this.context.strokeStyle = "rgba(150,75,150,0.3)";
      this.context.beginPath();
      this.context.rect(0,0,this.canvas.width,this.canvas.height);
      this.context.fill();
    }
    //depth lines
    this.context.lineWidth = config.xRatio;
    var lineInterval = config.terrainInterval * config.xRatio;
    var buffer = lineInterval * 80;
    var oX = (-lineInterval * (frame/this.frameCount)) - buffer;
    var tX = lX * 0.5;
    var dX = lX + buffer;
    var xTopOff = -lX * 0.5;
    for(var x = oX; x < dX; x += lineInterval*config.zFactor){
      var xOff = (((dX-x)/(lX + (2.1*buffer))) - 0.5) * xTopOff;
      var topX = tX + xOff;
      this.context.beginPath();
      this.context.moveTo(x,oY+lY);
      this.context.lineTo(topX,oY);
      this.context.stroke();
    }
    //horiz lines
    var yInt = -lY * 0.1;
    var a;
    var minY = lY * 0.01;
    for(var y = lY; y > 0; y += yInt){
      yInt = Math.round(Math.min(-minY, yInt * 0.8));
      yInt = Math.min(yInt,y);
      a = 1-(y/lY);
      this.context.lineWidth = config.yRatio*(y/lY);
      this.context.fillStyle = "rgba(0,0,0,"+a+")";
      this.context.beginPath();
      this.context.rect(0,(oY+y),lX,yInt);
      this.context.fill();
      if(yInt < -minY){
        this.context.stroke();
      }
    }
  }
}

UnderGroundArt = function(){
  CachedArt.call(this);

  this.size.x = config.cX;
  this.size.y = config.cY;
  this.fillStyle = "rgba(40,80,80,1)";

  this.drawCanvas = function(){
    var lX = this.canvas.width;
    var lY = this.canvas.height;
    this.context.fillStyle = this.fillStyle;
    this.context.beginPath();
    this.context.rect(0,0,lX,lY);
    this.context.fill();
  }
}

BlackScreenArt = function(){
  UnderGroundArt.call(this);
  this.fillStyle = "rgba(0,0,0,1)";
}

AtmoScreenArt = function(){
  UnderGroundArt.call(this);
  this.fillStyle = "rgba(0,250,0,1)";
}
