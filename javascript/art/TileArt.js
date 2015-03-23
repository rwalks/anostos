SoilTileArt = function(){
  var sX = 2*config.gridInterval;
  var sY = 2*config.gridInterval;
  CachedArt.call(this,sX,sY);

  this.fillStyle = new Color(20,200,150,1.0);
  this.strokeStyle = new Color(40,250,200,1.0);

  this.drawCanvas = function(){
    this.context.beginPath();
    var lineW = Math.ceil(config.minRatio * 1);
    this.context.lineWidth = lineW;
    this.context.fillStyle = this.fillStyle.colorStr();
    this.context.strokeStyle = this.strokeStyle.colorStr();
    var lX = this.canvas.width;
    var lY = this.canvas.height;
    this.context.rect(0,0,lX,lY);
    this.context.fill();
    this.context.stroke();
  }
}
