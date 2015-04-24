Art = function() {
  this.size = new Vector(1,1);

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
    if(firstPoint){
      canvasContext.lineTo(firstPoint[0],firstPoint[1]);
    }
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
  this.frameHeight = 1;

  this.drawCanvas = function(){
    for(var f = 0; f < this.frameCount; f++){
      this.drawFrame(f);
    }
  };

  this.drawFrame = function(frame){};

  this.getCanvasSize = function(){
    var sX = Math.ceil(this.size.x * config.xRatio);
    var sY = Math.ceil(this.size.y * this.frameCount * config.yRatio);
    this.frameHeight = Math.floor(sY / this.frameCount);
    return new Vector(sX,sY);
  }

  this.draw = function(pos,canvasContext,alpha,count){
    var frame = Math.floor((count*this.speed) % ((this.frameCount*2)-2));
    frame = (frame >= this.frameCount) ? this.frameCount-(frame-this.frameCount)-2 : frame;
    var sY = frame * this.frameHeight;
    canvasContext.save();
    if(alpha){
      canvasContext.globalAlpha = alpha;
    }
    canvasContext.drawImage(this.canvas,0,sY,this.canvas.width,this.frameHeight,pos.x,pos.y,this.canvas.width,this.frameHeight);
    canvasContext.restore();
  }

  this.drawIndex = function(pos,canvasContext,alpha,frame,yOff){
    yOff = yOff || 0;
    var sY = ((frame * this.frameHeight) + (yOff * this.frameHeight));
    canvasContext.save();
    if(alpha){
      canvasContext.globalAlpha = alpha;
    }
    canvasContext.drawImage(this.canvas,0,sY,this.canvas.width,this.frameHeight,pos.x,pos.y,this.canvas.width,this.frameHeight);
    canvasContext.restore();
  }

}

