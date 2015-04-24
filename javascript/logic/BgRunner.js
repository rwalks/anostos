BgRunner = function(){

  this.bgs = [];
  var hillArt = ['hill','hill2','hill3','hill4'];
  var hillArtS = ['hillS1','hillS2','hillS3','hillS4'];
  var cloudArt = ['cloud','cloud2','cloud3','cloud4'];
  var cloudArtS = ['cloudS1','cloudS2','cloudS3'];
  var cloudArtL = ['cloudL1','cloudL2','cloudL3'];
  var plantArt = ['scrubPlant','treePlant','scrubForest1','scrubForest2'];
  var smallPlantArt = ['scrubS','treeS','scrubForestS1','scrubForestS2'];
  var medPlantArt = ['scrubM','treeM','scrubForestM1','scrubForestM2'];

  this.bgHeight = config.cY * 0.15;

  this.load = function(){
    var scale;
    //middle features
    scale = 0.7;
    this.bgs.push(new BackGround(scale,plantArt,1-scale,0.3,20));
    //l clouds
    var yOff = 1.8;
    this.bgs.push(new CloudBackGround(0.45,cloudArtL,yOff));
    //med plants
    scale = 0.525;
    this.bgs.push(new BackGround(scale,medPlantArt,1-scale,0.3,20));
    //small plants
    scale = 0.35;
    this.bgs.push(new BackGround(scale,smallPlantArt,1-scale,0.3,20));
    //mid clouds
    var yOff = 0.9;
    this.bgs.push(new CloudBackGround(0.25,cloudArt,yOff));
    //mid hills
    scale = 0.2;
    this.bgs.push(new BackGround(scale,hillArt,1-scale,0.2));
    //rear clouds
    yOff = 0.8;
    this.bgs.push(new CloudBackGround(0.15,cloudArtS,yOff));
    //rear hills
    scale = 0.15;
    this.bgs.push(new BackGround(scale,hillArtS,1-scale,0.25));
    for(var b = 0; b < this.bgs.length; b++){
      this.bgs[b].load();
    }
  }

  this.drawBg = function(camera,light,buffCon,count){
    var atmoArt = artHolder.getArt('atmoScreen');
    var atmoAlpha = light * 0.1;
    var atmoPos = new Vector(0,0);
    var darkArt = artHolder.getArt('blackScreen');
    var darkAlpha = 1-light;
    if(darkAlpha){
      darkArt.draw(atmoPos,buffCon,darkAlpha);
    }
    var actY = config.cY * 0.2;
    var dY = ((config.groundLevel)-(config.cY*0.5))-camera.yOff;
    var bgMod = (0.15 * (dY/actY));
    this.bgHeight = config.cY * utils.clamp(bgMod,-0.15,0.15);
    //underground
    this.drawUnderGround(camera,light,buffCon);
    //trees
    this.bgs[0].draw(this.bgHeight,camera,buffCon,false,count);
    this.bgs[1].draw(this.bgHeight,camera,buffCon,false,count);
    this.bgs[2].draw(this.bgHeight,camera,buffCon,false,count);
    this.bgs[3].draw(this.bgHeight,camera,buffCon,false,count);
    atmoPos.y = Math.min(((config.groundLevel - (this.bgHeight*0.8))-camera.yOff-config.cY)*config.yRatio,0);
    atmoArt.draw(atmoPos,buffCon,atmoAlpha);
    this.bgs[4].draw(this.bgHeight,camera,buffCon,false,count);
    this.bgs[5].draw(this.bgHeight,camera,buffCon,false,count);
    atmoPos.y = 0;
    atmoArt.draw(atmoPos,buffCon,atmoAlpha*2);
    this.bgs[6].draw(this.bgHeight,camera,buffCon,false,count);
    this.bgs[7].draw(this.bgHeight,camera,buffCon,false,count);
    //field
    this.drawField(camera,light,buffCon,count);
  }

  this.drawUnderGround = function(camera,light,buffCon){
    //dirt
    var dirtArt = artHolder.getArt('underground');
    var oX = 0;
    var oY = Math.max(config.groundLevel - camera.yOff,0);
    var pos = new Vector(oX*config.xRatio,oY*config.yRatio);
    dirtArt.draw(pos,buffCon,false);
  }

  this.drawField = function(camera,light,buffCon,count){
    //field
    var fieldArt = artHolder.getArt('field');
    var oX = 0;
    var oY = (config.groundLevel - Math.floor(this.bgHeight)) - camera.yOff;
    var pos = new Vector(oX*config.xRatio,oY*config.yRatio);
    var frame = Math.floor(fieldArt.frameCount * ((camera.xOff % config.terrainInterval)/config.terrainInterval));
    var yOff = 1-(this.bgHeight / (config.cY *0.15));
    fieldArt.drawIndex(pos,buffCon,false,frame,yOff);
  }

  this.load();
}

BackGround = function(scale,artStrings,yOff,freq,interval){
  var interval = interval || 20;
  var buffer = 0;
  var width = ((config.mapWidth * scale) + (config.cX*(1-scale)))/interval;
  var bgArray = [];
  var arts = [];
  this.artFreq = freq || 0.2;
  this.drift = 0;
  this.dV = 0;
  this.yOffset = yOff || 0;
  this.baseY = config.groundLevel;

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
        if(artIndex != lastArt || arts.length < 3){
          lastArt = artIndex;
          bgArray[x] = artIndex + "";
        }
      }
    }
  }

  this.draw = function(bgHeight,camera,buffCon,alpha,count){
    var xOff = camera.xOff*scale;
    var oX = Math.floor(xOff/interval)-buffer;
    var oY = (this.baseY - (bgHeight * this.yOffset)) - camera.yOff;
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

CloudBackGround = function(scale,artStrings,yOff,freq,interval){
  BackGround.call(this,scale,artStrings,yOff,freq,interval);

  this.dV = 0.1;
  this.baseY = config.groundLevel - (config.cY * (0.15 + (0.05*scale)));
}
