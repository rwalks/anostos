HillArt = function(){
  CachedArt.call(this);

  this.size = new Vector(20*config.gridInterval,8*config.gridInterval);
  this.lightColor = new Color(150,160,200,0.1);

  this.baseGeo = [[0,1],[0.1,0.6],[0.3,0.2],[0.45,0],[0.55,0.1],[0.58,0.3],[0.62,0.34],[0.65,0.26],[0.68,0.23],[0.7,0.2],[0.9,0.6],[1,1]];
  this.shadeGeos = [
    [[0,1],[0.1,0.6],[0.3,0.2],[0.45,0],[0.4,0.08],[0.35,0.2],[0.32,0.46],[0.3,0.55],[0.25,0.58],[0.2,0.6],[0.25,0.8],[0.4,1]],
    [[0.58,0.3],[0.62,0.34],[0.65,0.26],[0.68,0.23],[0.7,0.2],[0.65,0.3],[0.6,0.55],[0.6,0.45]]
  ];
  this.lights = [[0.5,0,10]];

  this.drawCanvas = function(){
    var origin = new Vector(0,0);
    var size = new Vector(this.canvas.width,this.canvas.height);
    //base
    this.context.fillStyle = "rgba(10,10,25,1)";
    this.context.strokeStyle = "rgba(20,10,25,1)";
    this.drawGeo(this.baseGeo,origin,size,this.context,true,true);
    //shading
    this.context.save();
    this.context.globalCompositeOperation = 'source-atop';
    this.context.fillStyle = this.lightColor.colorStr();
    for(var l = 0; l < this.lights.length; l++){
      var lightX = this.lights[l][0] * size.x;
      var lightY = this.lights[l][1] * size.y;
      var orig = new Vector(lightX,lightY);
      var rad = size.y * this.lights[l][2];
      sceneArt.drawGradCircle(orig,12,rad,this.context);
    }
    this.context.restore();
    //shadow
    var shadeA = 0.2;
    for(var s = 0; s < this.shadeGeos.length; s++){
      this.context.fillStyle = "rgba(10,10,25,"+shadeA+")";
      this.drawGeo(this.shadeGeos[s],origin,size,this.context,true,false);
      shadeA = shadeA * 0.7;
    }
  }
}

HillArt2 = function(){
  HillArt.call(this);
  this.size = new Vector(16*config.gridInterval,12*config.gridInterval);
  this.lightColor = new Color(150,150,200,0.1);
  this.baseGeo = [[0,1],[0.1,0.6],[0.3,0.2],[0.5,0],[0.6,0.3],[0.9,0.6],[1,1]];
  this.shadeGeos = [
    [[0,1],[0.1,0.6],[0.3,0.2],[0.5,0],[0.45,0.05],[0.35,0.2],[0.32,0.5],[0.25,0.6],[0.25,0.8],[0.4,1]],
    [[0.8,1],[0.85,0.9],[0.92,0.85],[0.85,0.6],[0.85,0.5],[0.9,0.6],[1,1]]
  ];
  this.lights = [[0.5,0,10]];
}

HillArt3 = function(){
  HillArt.call(this);
  this.size = new Vector(18*config.gridInterval,16*config.gridInterval);
  this.lightColor = new Color(150,150,220,0.1);
  this.baseGeo = [[0,1],[0.1,0.8],[0.18,0.7],[0.18,0.8],[0.25,0.9],[0.35,0.75],[0.4,0.45],[0.45,0.4],[0.5,0.45],[0.6,0.35],[0.7,0],[0.8,0.3],[0.9,0.5],[0.95,0.8],[1,1]];
  this.shadeGeos = [
    [[0,1],[0.1,0.8],[0.18,0.7],[0.18,0.8],[0.25,0.9],[0.35,0.75],[0.4,0.45],[0.45,0.5],[0.4,0.7],[0.4,1]],
    [[0.5,1],[0.55,0.9],[0.58,0.85],[0.55,0.6],[0.5,0.45],[0.6,0.35],[0.7,0],[0.63,0.4],[0.57,0.45],[0.65,0.53],[0.75,0.55],[0.7,0.6],[0.7,0.9],[0.8,1],[0.96,0.93],[1,1]]
  ];
  this.lights = [[0.5,0,10]];
}

HillArt4 = function(){
  HillArt.call(this);
  this.size = new Vector(24*config.gridInterval,10*config.gridInterval);
  this.lightColor = new Color(160,150,200,0.1);
  this.baseGeo = [[0,1],[0.04,0.8],[0.1,0.7],[0.13,0.4],[0.18,0.2],[0.2,0.1],[0.23,0.15],[0.3,0.4],[0.4,0.6],[0.5,0.65],[0.6,0.4],[0.7,0.3],[0.75,0.05],[0.8,0],[0.83,0.1],[0.9,0.6],[1,1]];
  this.shadeGeos = [
    [[0,1],[0.04,0.8],[0.1,0.7],[0.13,0.4],[0.18,0.2],[0.2,0.1],[0.19,0.25],[0.18,0.4],[0.15,0.7],[0.2,1]],
    [[0.4,0.6],[0.5,0.65],[0.6,0.4],[0.7,0.3],[0.75,0.05],[0.8,0],[0.76,0.1],[0.75,0.3],[0.65,0.65],[0.6,1],[0.55,0.8],[0.45,0.7]]
  ];
  this.lights = [[0.2,0,6],[0.8,0,6]];
}

HillArtS1 = function(){
  HillArt.call(this);
  this.size.x = this.size.x * 0.8;
  this.size.y = this.size.y * 0.8;
  this.lightColor = new Color(160,150,210,0.1);
}
HillArtS2 = function(){
  HillArt2.call(this);
  this.size.x = this.size.x * 0.8;
  this.size.y = this.size.y * 0.8;
  this.lightColor = new Color(165,155,190,0.1);
}
HillArtS3 = function(){
  HillArt3.call(this);
  this.size.x = this.size.x * 0.8;
  this.size.y = this.size.y * 0.8;
  this.lightColor = new Color(170,145,210,0.1);
}
HillArtS4 = function(){
  HillArt4.call(this);
  this.size.x = this.size.x * 0.8;
  this.size.y = this.size.y * 0.8;
  this.lightColor = new Color(180,160,220,0.1);
}

ForestArt = function(){
  CachedArt.call(this);
}

StarArt = function(){
  AnimatedCachedArt.call(this);

  this.frameCount = 12;
  this.size = new Vector(0.2*config.gridInterval,0.2*config.gridInterval);
  this.speed = 0.3;

  this.drawFrame = function(frameP){
    var lX = this.canvas.width;
    var lY = this.canvas.height / this.frameCount;
    var oX = lX/2;
    var oY = ((this.canvas.height * frameP)+(lY*0.5));
    var orig = new Vector(oX,oY);
    var rad = lX / (2.1+(Math.random()*0.15));

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

  this.drawFrame = function(frameP){
    var baseY = this.canvas.height * frameP;
    var lX = this.canvas.width;
    var lY = this.canvas.height / this.frameCount;
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
      var maxR = (0.96 + Math.abs((0.08*frameP)-0.04)) * Math.min(minX,minY);
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
  }
}

CloudArtS = function(){
  CloudArt.call(this);
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
}

FieldArt = function(){
  CachedArt.call(this);

  this.size.x = config.cX;
  this.size.y = config.cY*0.2;

  this.drawCanvas = function(){
    var lX = this.canvas.width;
    var lY = this.canvas.height;
    this.context.fillStyle = "rgba(200,100,200,1)";
    this.context.beginPath();
    this.context.rect(0,0,lX,lY);
    this.context.fill();
    //perspective lines
    /*
    this.context.strokeStyle = "rgba(150,75,150,0.3)";
    this.context.lineWidth = lX * 0.001;
    var oX = lX/2;
    var oY = -lX * 0.1;
    var thetaInterval = Math.PI / 30;
    for(var theta = Math.PI*0; theta <= Math.PI*1; theta+=thetaInterval){
      var dest = utils.rotate(lX,0,theta);
      this.context.beginPath();
      this.context.moveTo(oX,oY);
      this.context.lineTo(dest[0],dest[1]);
      this.context.stroke();
    }
    */
  }
}
