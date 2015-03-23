ArtHolder = function(){
  this.loadCount = 0;

  this.artMap = {};

  this.artMap['soilTile'] = new SoilTileArt();

  this.getArt = function(name){
    return this.artMap[name];
  }

  this.updateSizes = function(){
    var artKeys = Object.keys(this.artMap);
    for(var a = 0; a < artKeys.length; a++){
      this.artMap[artKeys[a]].updateSize();
    }
    return true;
  }
}

Art = function(sX,sY) {
  this.size = new Vector(sX,sY);

  this.update = function(){}

  this.draw = function(pos,canvasContext){
  }

}

CachedArt = function(sX,sY){
  Art.call(this,sX,sY);

  this.canvas = document.createElement('canvas');
  this.context = this.canvas.getContext('2d');

  this.updateSize = function(){
    var sX = Math.ceil(this.size.x * config.xRatio);
    var sY = Math.ceil(this.size.y * config.yRatio);
    this.canvas.width = sX;
    this.canvas.height = sY;
    this.context.clearRect(0,0,sX,sY);
    this.drawCanvas();
  }

  this.drawCanvas = function(){
  }

  this.draw = function(pos,canvasContext){
    canvasContext.drawImage(this.canvas,pos.x,pos.y);
  }

  this.update = function(){
  }

}


