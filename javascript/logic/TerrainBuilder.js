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
    var scale = 0.1;
    for(var b = 0; b < this.bgLayers; b++){
      this.bgs.push(new BackGround(scale));
      scale += 0.1;
    }
  }

  this.drawBg = function(camera,light,buffCon){
    this.updateY(camera.yOff);
    var color = new Color(3,30,23,1);
    var sA = 0.4 + (0.6 * (1-light));
    var sColor = new Color(50,0,50,sA);
    var a = 0.15 + (0.85*light);
    color.r = Math.floor(color.r * a);
    color.b = Math.floor(color.b * a);
    color.g = Math.floor(color.g * a);
    var yInit = this.yPos;
    for(var b = 0; b < this.bgs.length; b++){
      buffCon.fillStyle = color.colorStr();
      buffCon.strokeStyle = sColor.colorStr();
      this.bgs[b].draw(camera,yInit,this.scale,buffCon);
      if(b != this.bgs.length-1){
        yInit += this.layerOffset * (((b*(b/2))+1)/this.bgs.length);
      }
      color.r = Math.floor(color.r * 1.5);
      color.g = Math.floor(color.g * 1.5);
      color.b = Math.floor(color.b * 1.5);
      sColor.r = Math.floor(sColor.r*1.5);
      sColor.b = Math.floor(sColor.b*1.5);
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
    var baseY = config.cY * 0.5;
    this.yPos = baseY + (baseY * altPerc);
    //layer offset
    var baseOffset = config.cY / 8;
    this.layerOffset = baseOffset * (1-Math.abs(altPerc));
  }
}

BackGround = function(scale){
  this.baseScale = scale;
  this.size = (config.cY / 10) * this.baseScale;
  this.points = [];

  this.length = 2000*this.baseScale;

  //init
  for(var i=0;i<this.length;i++){
    var d = Math.random() > 0.8 ? 5 : 2;
    var u = Math.random() > 0.9 ? 3 : 1;
    d = 2; u = 0;
    var pY = (Math.random()*d)-u;
    this.points.push(pY);
  }

  this.draw = function(camera,yPos,scale,buffCon){
    var camCentP = (camera.xOff+(config.cX/2))/config.mapWidth;
    var xBuff = this.length * this.baseScale;
    var xLength = this.length - xBuff;
    var bgCent = (xBuff / 2) + (camCentP * this.baseScale * xLength);
    var sizP = (config.cX / 2) / config.mapWidth;
    var lX = sizP * xLength;
    var dX = config.canvasWidth / (lX*2);
    lX = Math.ceil(lX);
    var geo = [];
    for(var dir = -1; dir <= 1; dir += 2){
      var oX = (dir == -1) ? Math.floor(bgCent) : Math.ceil(bgCent);
      var xOff = (oX - bgCent) * dX;
      var x = (config.canvasWidth/2) + xOff;
      for(var i = 0; i <= lX; i++){
        var xI = oX + (i*dir);
        var y = this.points[xI];
        var point = [x,y];
        if(dir == -1){
          geo.unshift(point);
        }else{
          geo.push(point);
        }
        x += (dX * dir);
      }
    }
    buffCon.beginPath();
    buffCon.moveTo(-1,config.canvasHeight);
    for(var p = 0; p < geo.length; p++){
      var point = geo[p];
      var x = point[0];
      var y = (yPos + (point[1] * this.size * scale)) * config.yRatio;
      buffCon.lineTo(x,y);
    }
    buffCon.lineTo(config.canvasWidth+1,config.canvasHeight+1);
    buffCon.lineTo(-1,config.canvasHeight+1);
    buffCon.fill();
    buffCon.stroke();
  }

}
