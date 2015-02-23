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
  this.gridInterval = 10;
  this.gravity = 0.5;
  this.terrainInterval = 2*this.gridInterval;
  this.adX = -10000;
  this.lootRange = this.gridInterval * 10;
  this.pickUpRange = this.gridInterval * 0.25;

  this.xRatio = 1;
  this.yRatio = 1;
  this.updateRatios = function(){
    this.xRatio = this.canvasWidth / this.cX;
    this.yRatio = this.canvasHeight / this.cY;
  }

}
