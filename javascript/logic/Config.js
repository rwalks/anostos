var Config = function (){
  this.fps = 30;
  this.canvasWidth = 800;
  this.canvasHeight = 600;
  this.mapWidth = 10000;
  this.mapHeight = 10000;
  this.cameraMoveRate = 11;
  this.canvasMatchWindow = true;
  this.cX = 600;
  this.cY = 450;
  this.groundLevel = this.mapHeight * 0.6;
  this.gridInterval = 10;
  this.gravity = 0.5;
  this.terrainInterval = 2*this.gridInterval;
  this.adX = -10000;
  this.lootRange = this.gridInterval * 10;
  this.pickUpRange = this.gridInterval * 0.4;
  this.starCount = 2000;
  this.starP = 0.1;

  this.xRatio = 1;
  this.yRatio = 1;
  this.minRatio = 1;
  this.updateRatios = function(windowSize){
    this.xRatio = Math.floor(10 * (windowSize.x / this.cX)) / 10;
    this.yRatio = Math.floor(10 * (windowSize.y / this.cY)) / 10;
    this.canvasWidth = this.cX * this.xRatio;
    this.canvasHeight = this.cY * this.yRatio;
//    this.canvasWidth = windowSize.x;
//    this.canvasHeight = windowSize.y;
    this.minRatio = Math.min(this.xRatio,this.yRatio);
  }

}
