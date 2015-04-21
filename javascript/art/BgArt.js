HillArt = function(){
  CachedArt.call(this);

  this.size = new Vector(20*config.gridInterval,8*config.gridInterval);

  this.baseGeo = [[0,1],[0.1,0.6],[0.3,0.2],[0.5,0],[0.7,0.2],[0.9,0.6],[1,1]];
  this.shadeGeo = [[0,1],[0.1,0.6],[0.3,0.2],[0.5,0],[0.45,0.05],[0.35,0.2],[0.32,0.46],[0.3,0.55],[0.25,0.58],[0.2,0.6],[0.25,0.8],[0.4,1]];
  this.crookGeo = [[0.8,1],[0.85,0.9],[0.92,0.85],[0.85,0.6],[0.85,0.5],[0.9,0.6],[1,1]];

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
    var orig = new Vector(size.x/2,0);
    var rad = Math.min(size.x,size.y) * 10;
    this.context.fillStyle = "rgba(150,150,250,0.1)";
    sceneArt.drawGradCircle(orig,12,rad,this.context);
    this.context.restore();
    //shadow
    this.context.fillStyle = "rgba(10,10,25,0.2)";
    this.drawGeo(this.shadeGeo,origin,size,this.context,true,false);
    this.context.fillStyle = "rgba(10,10,25,0.1)";
    this.drawGeo(this.crookGeo,origin,size,this.context,true,false);
  }
}

HillArt2 = function(){
  HillArt.call(this);
  this.size = new Vector(16*config.gridInterval,12*config.gridInterval);
  this.baseGeo = [[0,1],[0.1,0.6],[0.3,0.2],[0.5,0],[0.6,0.3],[0.9,0.6],[1,1]];
  this.shadeGeo = [[0,1],[0.1,0.6],[0.3,0.2],[0.5,0],[0.45,0.05],[0.35,0.2],[0.32,0.5],[0.25,0.6],[0.25,0.8],[0.4,1]];
  this.crookGeo = [[0.8,1],[0.85,0.9],[0.92,0.85],[0.85,0.6],[0.85,0.5],[0.9,0.6],[1,1]];
}

HillArt3 = function(){
  HillArt.call(this);
  this.size = new Vector(16*config.gridInterval,12*config.gridInterval);
  this.baseGeo = [[0,1],[0.1,0.8],[0.18,0.7],[0.18,0.8],[0.25,0.9],[0.35,0.75],[0.4,0.45],[0.45,0.4],[0.5,0.45],[0.6,0.35],[0.7,0],[0.8,0.3],[0.9,0.5],[0.95,0.8],[1,1]];
  this.shadeGeo = [[0,1],[0.1,0.6],[0.3,0.2],[0.5,0],[0.45,0.05],[0.35,0.2],[0.32,0.5],[0.25,0.6],[0.25,0.8],[0.35,0.75],[0.4,0.45],[0.45,0.5],[0.4,0.7],[0.4,1]];
  this.crookGeo = [[0.5,1],[0.55,0.9],[0.58,0.85],[0.55,0.6],[0.5,0.45],[0.6,0.35],[0.7,0],[0.63,0.4],[0.57,0.45],[0.65,0.53],[0.75,0.55],[0.7,0.6],[0.7,0.9],[0.8,1],[0.96,0.93],[1,1]];
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
  this.size = new Vector(20*config.gridInterval,6*config.gridInterval);
  this.speed = 0.3;

  this.clouds = [];
  this.cloudCount = 60;

  for(var i = 0; i < this.cloudCount; i++){
    var x = 0.2+(Math.random() * 0.6);
    var yRange = 0.5 - Math.abs(0.5-x);
    var y = 0.5-(yRange/2)+(Math.random() * yRange);
    var r = (Math.random()*yRange*2);
    this.clouds.push([x,y,r]);
  }

  this.drawFrame = function(frameP){
    var baseY = this.canvas.height * frameP;
    var lX = this.canvas.width;
    var lY = this.canvas.height / this.frameCount;
  //  this.context.globalCompositeOperation = 'lighter';
    this.context.fillStyle = "rgba(100,250,100,0.1)";
    this.context.strokeStyle = "rgba(10,150,10,0.3)";
    for(var c = 0; c < this.clouds.length; c++){
      var cloud = this.clouds[c];
      var flip = (c%4 == 0);
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
