Block = function(type,pos) {

  this.rType = type;
  var fName = '';
  var fillRGB;
  var strokeRGB;
  this.airtight = false;
  switch(type){
    case 'soil':
      fName = 'Soil';
      fillRGB = "rgba(20,200,150,0.9)";
      strokeRGB="rgba(40,250,200,1.0)";
      break;
    case 'metal':
      fName = 'Metal';
      fillRGB = "rgba(150,150,150,0.9)";
      strokeRGB="rgba(200,200,200,1.0)";
      this.airtight = true;
      break;
  }

  this.name = [fName,"Block"];
  this.size = {'x':1*config.gridInterval,'y':1*config.gridInterval};
  this.position = pos ? pos : {'x':x,'y':y};
  this.collision = true;
  this.lastDrawn = -1;
  this.type = "block";
  this.draw = function(camera,canvasBufferContext,count){
    //draw less often
    if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
      this.lastDrawn = count;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = fillRGB;
      canvasBufferContext.strokeStyle= strokeRGB;
      var originX = (this.position.x-camera.xOff)*config.xRatio;
      var originY = (this.position.y-camera.yOff)*config.yRatio;
      var lX = this.size.x*config.xRatio;
      var lY = this.size.y*config.yRatio;
      canvasBufferContext.rect(originX,originY,lX,lY);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = fillRGB;
    canvasBufferContext.strokeStyle= strokeRGB;
    canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(pos){
    return new Block(this.rType,pos);
  }

  this.click = function(coords,terrain){
    return;
  }
}
