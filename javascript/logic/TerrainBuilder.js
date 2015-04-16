TerrainBuilder = function(){
  this.meanY = config.mapHeight;
  this.rangeY = 0;
  this.yPos = 0;
  this.layerOffset = 0;
  this.scale = 0;

  this.bgs = [];
  this.bgLayers = 5;

  this.load = function(terrain){
    //find metrics
    var sum = 0;
    var highY = config.mapHeight;
    var xKeys = Object.keys(terrain.terrain);
    for(var xI = 0; xI < xKeys.length; xI++){
      var x = xKeys[xI];
      var yKeys = Object.keys(terrain.terrain[x]);
      var minY = parseInt(yKeys[0]);
      //avg
      sum += minY;
      //highest point?
      highY = minY < highY ? minY : highY;
    }
    this.meanY = (sum / xKeys.length) * 0.96;
    this.rangeY = this.meanY - (highY * 0.5);
    //gen bgs
    var scale = 0.5;
    for(var b = 0; b < this.bgLayers; b++){
      this.bgs.push(new BackGround(scale));
      scale -= 0.1;
    }
  }

  this.drawBg = function(camera,light,buffCon){
    this.updateY(camera.yOff);
    var color = new Color(50,150,150,1);
    var sA = 0.4 + (0.6 * (1-light));
    var sColor = new Color(250,0,250,sA);
    var a = 0.15 + (0.85*light);
    color.r = Math.floor(color.r * a);
    color.b = Math.floor(color.b * a);
    color.g = Math.floor(color.g * a);
    var yInit = this.yPos;
    var yEnd = config.canvasHeight;
    var lineWidth = config.minRatio * 1.5;
    for(var b = 0; b < this.bgs.length; b++){
      buffCon.lineWidth = lineWidth;
      buffCon.fillStyle = color.colorStr();
      buffCon.strokeStyle = sColor.colorStr();
      this.bgs[b].draw(camera,yInit,yEnd,this.scale,buffCon);
      //update vals
      yEnd = (yInit+1) * config.yRatio;
      yInit -= this.layerOffset * ((this.bgs.length - b - 1)/this.bgs.length);
      color.r = Math.floor(color.r * 0.75);
      color.g = Math.floor(color.g * 0.75);
      color.b = Math.floor(color.b * 0.75);
      sColor.r = Math.floor(sColor.r*0.75);
      sColor.b = Math.floor(sColor.b*0.75);
      lineWidth = lineWidth * 0.9;
    }
  }

  this.updateY = function(camY){
    var camMid = camY + (config.cY/2);
    var altitude = -1 * (camMid - this.meanY);
    var altPerc = altitude / this.rangeY;
    if(altitude < 0){
      //scale underground faster
      var lowFac = 1  + (10 * -altPerc);
      altitude = altitude * lowFac;
      altPerc = altitude / this.rangeY;
    }
    altPerc = utils.clamp(altPerc,-1,1);
    //scale
    this.scale = 1 - (altitude > 0 ? altPerc : 0);
    //yPos
    var baseY = config.cY * 0.6;
    this.yPos = baseY + (baseY * altPerc);
    //layer offset
    var baseOffset = config.cY / 8;
    this.layerOffset = baseOffset * (1-Math.abs(altPerc));
  }
}
