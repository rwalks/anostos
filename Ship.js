Ship = function(x,y) {

  var counter = 0;

  this.position = {'x':x,'y':y};
  this.velocity = {'x':0,'y':0};
  this.throttle = {'x':0,'y':0};
  var count = 0;

  this.deltaR = 0;
  this.theta = 0;
  this.acceleration = 0.05;

    var lX = config.gridInterval * 2;
    var lY = config.gridInterval * 2;
  var shipGeometry = [[lX,lY],[lX,0],[lX,-lY],[0,-lY],[-lX,-lY],[-lX,0],[-lX,lY],[0,lY],[lX,lY]];

  this.update = function(terrain){
    count += 1;
    this.velocity.y += 0.01;
    this.terrainCollide(terrain);
    //apply move
    this.theta += this.deltaR;
    this.velocity.x += this.throttle.x;
    this.velocity.y += this.throttle.y;
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  this.terrainCollide = function(terrain){
    var crashList = [];
    for(i in shipGeometry){
      var points = rotate(shipGeometry[i][0],shipGeometry[i][1],this.theta);
      var tX = this.position.x + points[0] + this.velocity.x;
      var tY = this.position.y + points[1] + this.velocity.y;
      tX = tX - (tX % config.gridInterval);
      tY = tY - (tY % config.gridInterval);
      if(terrain[tX]&&terrain[tX][tY]){
        if(Math.abs(this.velocity.x) + Math.abs(this.velocity.y) > 1){
          //crash
          crashList.push(i);
          this.velocity.x = 0.2 * this.velocity.x;
          this.velocity.y = 0.2 * this.velocity.y;
        }else{
          //no crash
          if(tY > this.position.y){
            this.velocity.y = 0;
          }
          if(tX > this.position.x){
            this.velocity.x = 0;
            this.theta -= 0.03;
          }else if(tX < this.position.x){
            this.velocity.x = 0;
            this.theta += 0.03;
          }else{
            this.velocity.x = 0;
          }
        }
      }
    }
    for(i in crashList){
      shipGeometry.splice(crashList[i],1);
    }
  }

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

  this.accelerate = function(keyDown){
    var points = keyDown ? rotate(0,-this.acceleration,this.theta) : [0,0];
    this.throttle.x = points[0];
    this.throttle.y = points[1];
  }


  this.draw = function(camera,canvasBufferContext){
    var xRatio = config.canvasWidth / config.cX;
    var yRatio = config.canvasHeight / config.cY;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = "rgba(0,200,0,0.6)";
    canvasBufferContext.strokeStyle="rgba(0,250,0,0.8)";
    for(i in shipGeometry){
      var points = rotate(shipGeometry[i][0],shipGeometry[i][1],this.theta);
      var x = (this.position.x+points[0]-camera.xOff)*xRatio;
      var y = (this.position.y+points[1]-camera.yOff)*yRatio;
      if(i == 0){
        canvasBufferContext.moveTo(x,y);
      }else{
        canvasBufferContext.lineTo(x,y);
      }
    }
    canvasBufferContext.stroke();
    canvasBufferContext.fill();
  }

  var rotate = function(x,y,theta){
    var rx = (x*Math.cos(theta))-(y*Math.sin(theta));
    var ry = (x*Math.sin(theta))+(y*Math.cos(theta));
    return [rx,ry];
  }

}

