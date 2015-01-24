Ship = function(x,y,aud) {


  var audio = aud;

  var shipArt = new ShipArt();

  this.position = {'x':x,'y':y};
  this.velocity = {'x':0,'y':0};
  this.throttle = false;
  var count = 0;

  this.deltaR = 0;
  this.theta = 0;
  this.acceleration = 0.07;
  this.currentFuel = 100;
  this.maxFuel = 100;
  var fuelUse = 0.2;

    this.leftContact = false;
    this.rightContact = false;

  this.engineActive = false;
  this.coolDown = 0;

  this.explosions = [];

  var lX = config.gridInterval*3;
  var lY = config.gridInterval*2;

  this.shipGeometry = {};


  this.init = function(){
    this.shipGeometry.rightGear = [[1.325,0.4],[1.275,0.5],[1.5,1.05]];
    this.shipGeometry.leftGear = this.shipGeometry.rightGear.map(function(p){return [-1*p[0],p[1]];});
    this.shipGeometry.hull = [
        [-0.3,-1],[-0.7,-0.4],[-0.7,-0.2],[-0.5,0],[-0.5,0.4],[-0.3,0.6],[-0.1,0.7],
        [0.1,0.7],[0.3,0.6],[0.5,0.4],[0.5,0],[0.7,-0.2],[0.7,-0.4],[0.3,-1]
      ];
    this.shipGeometry.leftEngine = [
        [-0.7,-0.2],[-1.3,-0.2],[-1.5,0],[-1.5,0.4],[-1.2,0.6],[-1.2,0.4],[-0.7,0.4],[-0.7,0.6],[-0.5,0.4],[-0.5,0]
      ];
    this.shipGeometry.rightEngine = this.shipGeometry.leftEngine.map(function(p){return [-1*p[0],p[1]];});

    for(var part in this.shipGeometry){
      this.shipGeometry[part] = this.shipGeometry[part].map(function(p){return [lX*p[0],lY*p[1]];});
    }
  }

  this.damaged = false;
  this.destroyed = false;
  this.landed = false;
  this.altitude = 9999;

  this.update = function(terrain){
    count += 1;
    if(!this.destroyed){
      //apply move
      if(this.leftContact && this.rightContact){
        this.deltaR = 0;
      }else if(this.leftContact){
        this.deltaR = this.deltaR > 0 ? this.deltaR : 0;
      }else if(this.rightContact){
        this.deltaR = this.deltaR < 0 ? this.deltaR : 0;
      }else{
        //forces
        this.velocity.y += 0.01;
        this.velocity.x = this.velocity.x * 0.99;
      }
      this.theta += this.deltaR;

      var validFuel = this.currentFuel >= fuelUse;
      this.engineActive = (this.throttle && validFuel);
      this.currentFuel -= this.engineActive ? fuelUse : 0;
      this.setCoolDown();
      var thrust = -this.acceleration * this.coolDown;

      if(thrust){
        audio.play("eng1");
        var thrustPoint = rotate(0,thrust,this.theta);
        this.velocity.x += thrustPoint[0];
        this.velocity.y += thrustPoint[1];
      }else{
        audio.stop("eng1");
      }
      this.terrainCollide(terrain);

      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.altitude = findAltitude(this.position,terrain);

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

  this.setCoolDown = function(){
    this.coolDown += this.engineActive ? 0.1 : -0.1;
    this.coolDown = this.coolDown > 1 ? 1 : this.coolDown;
    this.coolDown = this.coolDown < 0 ? 0 : this.coolDown;
  }

  var findAltitude = function(pos,terrain){
    var x = pos.x - (pos.x % config.gridInterval);
    var y = pos.y - (pos.y % config.gridInterval);
    for(yT = y; yT < config.mapHeight; yT+=config.gridInterval){
      if(terrain[x] && terrain[x][yT]){
        return Math.floor(yT-pos.y);
      }
    }
    return 0;
  }

  this.terrainCollide = function(terrain){
    this.leftContact = false;
    this.rightContact = false;
    for(var part in this.shipGeometry){
      var geo = this.shipGeometry[part];
      var gearType = (part == 'rightGear' || part == 'leftGear');
      var maxForce = 1.5;
      var contactFriction = 2.0;
      if(gearType){
        maxForce = 2.8;
      }
      for(var i in geo){
        if(geo[i]){
          var crashed = false;
          var points = rotate(geo[i][0],geo[i][1],this.theta);
          var oX = this.position.x + points[0];
          var oY = this.position.y + points[1];
          var vX = oX + this.velocity.x;
          var vY = oY + this.velocity.y;
          if(vX > config.mapWidth || vX < 0){
            this.velocity.x = this.velocity.x * -1;
            this.theta = this.theta * -1;
          }else{
            var tX = vX - (vX % config.gridInterval);
            var tY = vY - (vY % config.gridInterval);
            if(terrain[tX]&&terrain[tX][tY]){

              if(oX > this.position.x){
                this.rightContact = true;
              }else if(oX < this.position.x){
                this.leftContact = true;
              }
              var dX = 0; var dY = 0;
              var rise = vY - oY;
              var run = vX - oX;

              if(this.velocity.x){
                dX = (this.velocity.x > 0) ? vX - tX : (tX + config.gridInterval) - vX;
              }
              if(this.velocity.y){
                dY = (this.velocity.y > 0) ? vY - tY : (tY + config.gridInterval) - vY;
              }
              if(rise && run){
                if(dY <= dX){
                  dX = (dY/rise)*run;
                }else{
                  dY = (dX/run)*rise;
                }
              }
              var forceToStop = dX + dY;
              if(forceToStop > 0){
                var validForce = forceToStop < maxForce;
                if(!validForce){
                  //crash
                  if(!gearType){
                    if(geo[i][1] <= lY){
                      this.destroyed = this.damaged ? true : this.destroyed;
                      this.damaged = true;
                    }
                  }
                  crashed = true;
                  this.explosions.push(new Explosion(vX,vY));
                  audio.play('explosion2');
                }else{
                  //no crash
                  this.velocity.y += this.velocity.y > 0 ? -dY : dY;
                  this.velocity.x += this.velocity.x > 0 ? -dX : dX;
                }
              }
            }
          }
          if(crashed){
            geo[i] = false;
          }
        }
      }
      if(this.leftContact || this.rightContact){
        this.velocity.x = 0.8 * this.velocity.x;
        this.velocity.y = 0.8 * this.velocity.y;
        this.deltaR += this.rightContact ? -0.001 : 0;
        this.deltaR += this.leftContact ? 0.001 : 0;
      }
    }

    if(this.destroyed){
      for(var part in this.shipGeometry){
        var geo = this.shipGeometry[part];
        for(i in geo){
          if(geo[i]){
            var points = rotate(geo[i][0],geo[i][1],this.theta);
            var tX = this.position.x + points[0] + this.velocity.x;
            var tY = this.position.y + points[1] + this.velocity.y;
            this.explosions.push(new Explosion(tX,tY));
            audio.play('explosion1');
          }
        }
      }
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
    this.throttle = keyDown;
  }


  this.draw = function(camera,canvasBufferContext){
    if(!this.destroyed){
      shipArt.drawExhaust(camera,this,lX,lY,canvasBufferContext);
      shipArt.drawShip(camera,this,canvasBufferContext);
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
  this.init();

}

