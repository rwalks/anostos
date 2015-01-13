HiveAlienArt = function() {
  this.maxFuel = 100;

  this.leftLanded = false;
  this.rightLanded = false;

  this.explosions = [];

  var lX = config.gridInterval * 2;
  var lY = config.gridInterval * 2;
  var shipGeometry = [[lX,lY],[lX,lY*1.5],[lX*1.5,lY],[lX,0],[lX,-lY],[0,-2*lY],
                      [-lX,-lY],[-lX,0],[-lX*1.5,lY],[-lX*1.5.lY*1.5],[-lX,lY*1.5],[-lX,lY],[0,lY]];
  this.damaged = false;
  this.destroyed = false;
  this.landed = false;
  this.altitude = 9999;


  this.rotate = function(right,keyDown){
    if(keyDown){
      this.deltaR += right ? 0.05 : -0.05;
    }else{
      this.deltaR = (right && this.deltaR > 0) ? 0 : this.deltaR;
      this.deltaR = (!right && this.deltaR < 0) ? 0 : this.deltaR;
    }
    this.deltaR = (this.deltaR > 0.1) ? 0.1 : this.deltaR;
    this.deltaR = (this.deltaR < -0.1) ? -0.1 : this.deltaR;
  }

  this.draw = function(camera,canvasBufferContext){
    if(!this.destroyed){
      var xRatio = config.canvasWidth / config.cX;
      var yRatio = config.canvasHeight / config.cY;
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(200,200,200,0.6)";
      canvasBufferContext.strokeStyle="rgba(250,250,250,0.8)";
      for(i in shipGeometry){
        var points = rotate(shipGeometry[i][0],shipGeometry[i][1],this.theta);
        var x = (this.position.x+points[0]-camera.xOff)*xRatio;
        var y = (this.position.y+points[1]-camera.yOff)*yRatio;
        if(i == 0){
          canvasBufferContext.moveTo(x,y);
          firstPoint = [x,y];
        }else{
          canvasBufferContext.lineTo(x,y);
        }
      }
      if(firstPoint){
        canvasBufferContext.lineTo(firstPoint[0],firstPoint[1]);
      }
      canvasBufferContext.stroke();
      canvasBufferContext.fill();
      //draw window
      var rad = config.gridInterval/2 * xRatio;
      var windows = [[0,-rad],[0,rad/2]];
      for(i in windows){
        var points = rotate(windows[i][0],windows[i][1],this.theta);
        var x = (this.position.x+points[0]-camera.xOff)*xRatio;
        var y = (this.position.y+points[1]-camera.yOff)*yRatio;
        canvasBufferContext.fillStyle = "rgba(0,0,200,0.6)";
        canvasBufferContext.strokeStyle="rgba(50,50,250,0.8)";
        canvasBufferContext.beginPath();
        canvasBufferContext.arc(x,y,rad,0,2*Math.PI,false);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
      }
      if(this.throttle.x || this.throttle.y){
        this.drawExhaust(camera,canvasBufferContext);
      }
    }
    for(e in this.explosions){
      this.explosions[e].draw(camera,canvasBufferContext);
    }
  }

  var rotate = function(x,y,theta){
    var rx = (x*Math.cos(theta))-(y*Math.sin(theta));
    var ry = (x*Math.sin(theta))+(y*Math.cos(theta));
    return [rx,ry];
  }

}

