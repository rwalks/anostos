Ship = function(x,y,aud) {


  var audio = aud;

  this.position = {'x':x,'y':y};
  var startingVX = (Math.random() * 20) - 10;
  this.velocity = {'x':startingVX,'y':0};
  this.throttle = {'x':0,'y':0};
  var count = 0;

  this.deltaR = 0;
  this.theta = 0;
  this.acceleration = 0.07;
  this.currentFuel = 100;
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

  this.update = function(terrain){
    count += 1;
    if(!this.destroyed){
      this.velocity.y += 0.01;
      this.terrainCollide(terrain);
      //apply move
      if(this.leftLanded && this.rightLanded){
        this.deltaR = 0;
      }else if(this.leftLanded){
        this.deltaR = this.deltaR > 0 ? this.deltaR : 0;
      }else if(this.rightLanded){
        this.deltaR = this.deltaR < 0 ? this.deltaR : 0;
      }
      this.theta += this.deltaR;
      if(this.throttle.x != 0 || this.throttle.y != 0){
        this.currentFuel = (this.currentFuel > 0) ? this.currentFuel - 0.2 : 0;
     //   if(count % 30 == 0){

          audio.play("eng1");
    //    }
      }else{
        audio.stop("eng1");
      }
      this.velocity.x += this.throttle.x;
      this.velocity.y += this.throttle.y;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      this.landed = (this.velocity.x == 0 && this.velocity.y == 0 && this.deltaR == 0 && (this.leftLanded || this.rightLanded))
    }
    var doneList = [];
    for(e in this.explosions){
      var ret = this.explosions[e].update();
      if(ret){
        doneList.push(e);
      }
    }
    for(i in doneList){
      this.explosions.splice(doneList[i],1);
    }
  }

  this.terrainCollide = function(terrain){
    this.rightLanded = false;
    this.leftLanded = false;
    var crashList = [];
    for(i in shipGeometry){
      var points = rotate(shipGeometry[i][0],shipGeometry[i][1],this.theta);
      var oX = this.position.x + points[0];
      var oY = this.position.y + points[1];
      var tX = oX + this.velocity.x;
      var tY = oY + this.velocity.y;
      if(tX > config.mapWidth || tX < 0){
        this.velocity.x = 0;
      }else{
        tX = tX - (tX % config.gridInterval);
        tY = tY - (tY % config.gridInterval);
        if(terrain[tX]&&terrain[tX][tY]){
          if(Math.abs(this.velocity.x) + Math.abs(this.velocity.y) > 0.5){
            //crash
            if(shipGeometry[i][1] <= lY){
              this.destroyed = this.damaged ? true : this.destroyed;
              this.damaged = true;
            }
            crashList.push(i);
            this.velocity.x = 0.8 * this.velocity.x;
            this.velocity.y = 0.8 * this.velocity.y;
            this.explosions.push(new Explosion(tX,tY));
            audio.play('explosion2');
          }else{
            //no crash
            if(tY > this.position.y){
              this.velocity.y = 0;
            }
            if(tX > this.position.x){
              this.velocity.x = 0;
              this.rightLanded = true;
            }else if(tX < this.position.x){
              this.velocity.x = 0;
              this.leftLanded = true;
            }else{
              this.velocity.x = 0;
            }
          }
        }
      }
    }

    if(this.destroyed){
      for(i in shipGeometry){
        var points = rotate(shipGeometry[i][0],shipGeometry[i][1],this.theta);
        var tX = this.position.x + points[0] + this.velocity.x;
        var tY = this.position.y + points[1] + this.velocity.y;
        this.explosions.push(new Explosion(tX,tY));
        audio.play('explosion1');
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
    var points = [0,0];
    if(keyDown){
      if(this.currentFuel > 0){
        points = rotate(0,-this.acceleration,this.theta);
      }
    }
    this.throttle.x = points[0];
    this.throttle.y = points[1];
  }

  this.drawExhaust = function(camera,canvasBufferContext){
    var firstPoint;
    var xRatio = config.canvasWidth / config.cX;
    var yRatio = config.canvasHeight / config.cY;
    var trailWidth = lX/10;
    var y = 1.5*lY;
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    for(x=-lX;x<lX;x+=trailWidth){
      y += (x < 0) ? lY / 4 : -lY / 4;
      canvasBufferContext.beginPath();
      var r = Math.floor(Math.random() * 250);
      var g = Math.floor(Math.random() * 250);
      var b = Math.floor(Math.random() * 250);
      var a = Math.floor(Math.random() * 0.1) + 0.9;
      var rgbaString = "rgba("+r+","+20+","+20+","+a+")";
      canvasBufferContext.fillStyle = rgbaString;
      var geometry = [[x,lY],[x+trailWidth,lY],[x+trailWidth,y],[x,y]];
      for(i in geometry){
        var points = rotate(geometry[i][0],geometry[i][1],this.theta);
        var eX = (this.position.x+points[0]-camera.xOff)*xRatio;
        var eY = (this.position.y+points[1]-camera.yOff)*yRatio;
        if(i == 0){
          canvasBufferContext.moveTo(eX,eY);
          firstPoint = [eX,eY];
        }else{
          canvasBufferContext.lineTo(eX,eY);
        }
      }
      canvasBufferContext.lineTo(firstPoint[0],firstPoint[1]);
      canvasBufferContext.fill();
    }
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

