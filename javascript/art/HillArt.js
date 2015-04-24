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
  this.baseShadowAlpha = 0.5;

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
    //shadow
    var shadeA = 0.2;
    for(var s = 0; s < this.shadeGeos.length; s++){
      this.context.fillStyle = "rgba(10,10,25,"+shadeA+")";
      this.drawGeo(this.shadeGeos[s],origin,size,this.context,true,false);
      shadeA = shadeA * 0.7;
    }
    //shade bottom
    var a = this.baseShadowAlpha;
    var yInt = -0.09;
    for(var y = 1; y > 0.1; y += yInt){
      yInt = Math.min(yInt*0.9,-0.001);
      var oY = y * size.y;
      this.context.fillStyle = "rgba(0,0,0,"+a+")";
      this.context.beginPath();
      this.context.rect(0,oY,size.x,yInt*size.y);
      this.context.fill();
      a = a * 0.92;
    }
    this.context.restore();
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
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
  this.lightColor = new Color(160,150,210,0.1);
  this.baseShadowAlpha = 0.8;
}
HillArtS2 = function(){
  HillArt2.call(this);
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
  this.lightColor = new Color(165,155,190,0.1);
  this.baseShadowAlpha = 0.8;
}
HillArtS3 = function(){
  HillArt3.call(this);
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
  this.lightColor = new Color(170,145,210,0.1);
  this.baseShadowAlpha = 0.8;
}
HillArtS4 = function(){
  HillArt4.call(this);
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
  this.lightColor = new Color(180,160,220,0.1);
  this.baseShadowAlpha = 0.8;
}
