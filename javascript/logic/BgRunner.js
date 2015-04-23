BgRunner = function(){

  this.bgs = [];
  var hillArt = ['hill','hill2','hill3','hill4'];
  var hillArtS = ['hillS1','hillS2','hillS3','hillS4'];
  var cloudArt = ['cloud','cloud2','cloud3','cloud4'];
  var cloudArtS = ['cloudS1','cloudS2','cloudS3','cloudS4'];

  this.load = function(){
    this.bgs.push(new CloudBackGround(0.25,cloudArt));
    this.bgs.push(new BackGround(0.25,hillArt));
    this.bgs.push(new CloudBackGround(0.2,cloudArtS));
    this.bgs.push(new BackGround(0.2,hillArtS));
    for(var b = 0; b < this.bgs.length; b++){
      this.bgs[b].load();
    }
  }

  this.drawBg = function(camera,light,buffCon,count){
    //mountains + clouds
    var yOffset = config.cY * 0.05;
    var oY = (config.groundLevel - (yOffset*2)) - camera.yOff;
    var y = oY - (yOffset * 3);
    this.bgs[0].draw(y,camera,buffCon,1,count);
    this.bgs[1].draw(oY,camera,buffCon,1,count);
    oY -= yOffset;
    y = oY - (yOffset * 2);
    this.bgs[2].draw(y,camera,buffCon,1,count);
    this.bgs[3].draw(oY,camera,buffCon,1,count);
    //field
    this.drawField(camera,light,buffCon);
  }

  this.drawField = function(camera,light,buffCon){
    buffCon.save();
    //perspective lines
    buffCon.strokeStyle = "rgba(150,75,150,0.3)";
    buffCon.lineWidth = 10;
    var buffer = config.terrainInterval * 10;
    var oX = (-camera.xOff % config.terrainInterval) - buffer;
    var oY = config.groundLevel - camera.yOff;
    var tX = config.canvasWidth * 0.5;
    var tY = config.yRatio * ((config.groundLevel - (config.cY * 0.2)) - camera.yOff);
    var lX = config.cX + buffer;
    for(var x = oX; x < lX; x += config.terrainInterval){
      buffCon.beginPath();
      buffCon.moveTo(x*config.xRatio,oY*config.yRatio);
      buffCon.lineTo(tX,tY);
      buffCon.stroke();
    }
    buffCon.restore();
    //field
    var fieldArt = artHolder.getArt('field');
    var oX = 0;
    var oY = (config.groundLevel - (config.cY * 0.2)) - camera.yOff;
    var pos = new Vector(oX*config.xRatio,oY*config.yRatio);
    fieldArt.draw(pos,buffCon,1);
  }

  this.load();
}

BackGround = function(scale,artStrings){
  var interval = 20;
  var buffer = 0;
  var width = ((config.mapWidth * scale) + (config.cX*(1-scale)))/interval;
  var bgArray = [];
  var arts = [];
  this.artFreq = 0.2;
  this.drift = 0;
  this.dV = 0;

  this.load = function(){
    //load art
    var widest = 0;
    for(var a = 0; a < artStrings.length; a++){
      var art = artHolder.getArt(artStrings[a]);
      arts.push(art);
      widest = (art.size.x > widest) ? art.size.x : widest;
    }
    buffer = Math.ceil(widest / interval);
    //gen array
    var lastArt = 0;
    for(var x = 0; x < width; x++){
      bgArray[x] = 0;
      if(Math.random() < this.artFreq){
        var artIndex = Math.floor(Math.random()*artStrings.length);
        if(artIndex != lastArt){
          lastArt = artIndex;
          bgArray[x] = artIndex + "";
        }
      }
    }
  }

  this.draw = function(oY,camera,buffCon,alpha,count){
    var xOff = camera.xOff*scale;
    var oX = Math.floor(xOff/interval)-buffer;
    var lX = oX+(config.cX/interval)+buffer;
    var pos = new Vector();
    for(var ix = oX; ix <= lX; ix++){
      if(bgArray[ix]){
        var art = arts[bgArray[ix]];
        pos.x = ((ix*interval) - xOff)*config.xRatio;
        pos.y = (oY - art.size.y)*config.yRatio;
        art.draw(pos,buffCon,alpha,count);
      }
    }
  }
}

CloudBackGround = function(scale,artStrings){
  BackGround.call(this,scale,artStrings);

  this.artFreq = 0.25;
  this.dV = 0.1;
}
