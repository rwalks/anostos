ArtHolder = function(){
  this.loadCount = 0;

  this.staticArt = {};
  this.procArt = {};

  //procedural art
  this.procArt['weaponButton'] = new WeaponButtonArt();
  this.procArt['repairButton'] = new RepairButtonArt();
  this.procArt['deleteButton'] = new DeleteButtonArt();
  this.procArt['lightButton'] = new LightButtonArt();
  this.procArt['guiButton'] = new ButtonArt();
  this.procArt['gaugeGui'] = new GaugeGuiArt();
  //static art
  this.staticArt['soilTile'] = new SoilTileArt();
  this.staticArt['topSoilTile'] = new TopSoilTileArt();
  this.staticArt['rockTile'] = new RockTileArt();
  this.staticArt['oreTile'] = new OreTileArt();
  this.staticArt['playerGui'] = new PlayerGuiArt();
  this.staticArt['treePlant'] = new TreeArt();
  this.staticArt['scrubPlant'] = new ScrubArt();

  this.getArt = function(name){
    return this.procArt[name] || this.staticArt[name];
  }

  this.updateSizes = function(){
    var artKeys = Object.keys(this.staticArt);
    for(var a = 0; a < artKeys.length; a++){
      this.staticArt[artKeys[a]].updateSize();
    }
    return true;
  }
}

Art = function() {
  this.size;

  this.draw = function(obj,canvasContext){};

  this.drawGeo = function(geo,origin,size,canvasContext,fill,stroke,mod){
    var firstPoint;
    mod = mod || new Vector(1,1);
    canvasContext.beginPath();
    for(var i = 0; i < geo.length; i++){
      var point = geo[i];
      var pX = origin.x + (point[0]*size.x*mod.x);
      var pY = origin.y + (point[1]*size.y*mod.y);
      if(!i){
        canvasContext.moveTo(pX,pY);
        firstPoint = [pX,pY];
      }else{
        canvasContext.lineTo(pX,pY);
      }
    }
    canvasContext.lineTo(firstPoint[0],firstPoint[1]);
    if(fill){
      canvasContext.fill();
    }
    if(stroke){
      canvasContext.stroke();
    }
  }
}

CachedArt = function(){
  Art.call(this);

  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');

  this.updateSize = function(){
    var cS = this.getCanvasSize();
    this.canvas.width = cS.x;
    this.canvas.height = cS.y;
    this.context.clearRect(0,0,this.canvas.width,this.canvas.height);
    this.drawCanvas();
  }

  this.getCanvasSize = function(){
    var sX = this.size.x * config.xRatio;
    var sY = this.size.y * config.yRatio;
    return new Vector(sX,sY);
  }

  this.drawCanvas = function(){};

  this.draw = function(pos,canvasContext,alpha){
    canvasContext.save();
    if(alpha){
      canvasContext.globalAlpha = alpha;
    }
    canvasContext.translate(pos.x,pos.y);
    canvasContext.drawImage(this.canvas,0,0);
    canvasContext.restore();
  }
}

AnimatedCachedArt = function(){
  CachedArt.call(this);

  this.frameCount = 1;
  this.speed = 1;

  this.drawCanvas = function(){
    for(var i = 0; i < this.frameCount; i++){
      var frameP = (i/this.frameCount);
      this.drawFrame(frameP);
    }
  };

  this.drawFrame = function(frameP){};

  this.getCanvasSize = function(){
    var sX = this.size.x * config.xRatio;
    var sY = this.size.y * this.frameCount * config.yRatio;
    return new Vector(sX,sY);
  }

  this.draw = function(pos,canvasContext,alpha,count){
    var frame = Math.floor((count*this.speed) % ((this.frameCount*2)-2));
    frame = (frame >= this.frameCount) ? this.frameCount-(frame-this.frameCount)-2 : frame;
    var lY = this.canvas.height / this.frameCount;
    var sY = frame * lY;
    canvasContext.save();
    if(alpha){
      canvasContext.globalAlpha = alpha;
    }
    canvasContext.drawImage(this.canvas,0,sY,this.canvas.width,lY,pos.x,pos.y,this.canvas.width,lY);
    canvasContext.restore();
  }

}


