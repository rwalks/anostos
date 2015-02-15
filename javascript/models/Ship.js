Ship = function(x,y,aud) {


  var audio = aud;

  var shipArt = new ShipArt();

  this.position = {'x':x,'y':y};
  this.velocity = {'x':0,'y':0};
  this.throttle = false;
  var count = 0;

  this.gravity = 0.01;

  this.deltaR = 0;
  this.theta = 0;
  this.manualRotateState = 0;
  this.acceleration = 0.07;
  this.currentFuel = 100;
  this.maxFuel = 100;
  this.maxSpeed = config.gridInterval * 0.99;
  var fuelUse = 0.2;

  var pointTransTolerance = config.gridInterval / 5;
  var pointRotTolerance = Math.PI / 1.5;

  this.contact = {};
  this.contact.left = false; this.contact.right = false;

  var maxSkidDepth = config.gridInterval/5;

  this.engineActive = false;
  this.coolDown = 0;

  this.explosions = [];

  var lX = config.gridInterval*3;
  var lY = config.gridInterval*2;

  this.shipGeometry = {};


  this.init = function(){
    this.shipGeometry.rightGear = [[1.325,0.4],[1.275,0.5],[1.35,0.75],[1.5,1.05],[1.4,0.7]];
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
      this.deltaR = 0;

      if(this.manualRotateState){
        this.deltaR += (0.05 * this.manualRotateState);
      }

      //apply forces
      this.velocity.y += this.gravity;

      var validFuel = this.currentFuel >= fuelUse;
      this.engineActive = (this.throttle && validFuel);
      this.currentFuel -= this.engineActive ? fuelUse : 0;
      this.setCoolDown();
      var thrust = -this.acceleration * this.coolDown;

      if(thrust){
        audio.play("eng1");
        //change thrust angle before deltaR verified, gimbal?
        var thrustPoint = rotate(0,thrust,(this.theta+this.deltaR));
        this.velocity.x += thrustPoint[0];
        this.velocity.y += thrustPoint[1];
      }else{
        audio.stop("eng1");
      }
      this.setMaxVelocity();
      this.handleLanding();
      this.terrainCollide(terrain);

      this.theta += this.deltaR;
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
      this.altitude = findAltitude(this.position,terrain);
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

  this.handleLanding = function(){
    if(this.contact.left){
      this.deltaR += 0.01;
    }else if(this.contact.right){
      this.deltaR -= 0.01;
    }
  }

  this.setMaxVelocity = function(){
    //max velocities
    var totalV = Math.abs(this.velocity.x) + Math.abs(this.velocity.y);
    if(totalV >= this.maxSpeed){
      var mod = totalV / this.maxSpeed;
      this.velocity.x = this.velocity.x / mod;
      this.velocity.y = this.velocity.y / mod;
    }
  }

  var findAltitude = function(pos,terrain){
    var x = pos.x - (pos.x % config.gridInterval);
    var y = pos.y - (pos.y % config.gridInterval);
    for(yT = y; yT < config.mapHeight; yT+=config.gridInterval){
      if(terrain.getTile(x,yT)){
        return Math.floor(yT-pos.y);
      }
    }
    return 0;
  }

  this.terrainCollide = function(terrain){
    this.contact.left = false; this.contact.right = false;
    this.landed = false;
    var rotForce = 0;
    for(var part in this.shipGeometry){
      var geo = this.shipGeometry[part];
      var gearType = (part == 'rightGear' || part == 'leftGear');
      var contactFriction = 2.0;
      var crashed = [];
      for(var i in geo){
        if(geo[i]){
          //roundVelocity
          this.velocity.x = (Math.abs(this.velocity.x) < 0.0001) ? 0 : this.velocity.x;
          this.velocity.y = (Math.abs(this.velocity.y) < 0.0001) ? 0 : this.velocity.y;
          if(this.velocity.x || this.velocity.y){
            var rotation = this.theta;
            var points = rotate(geo[i][0],geo[i][1],rotation);
            var oX = this.position.x + points[0];
            var oY = this.position.y + points[1];
            rotation += this.deltaR;
            points = rotate(geo[i][0],geo[i][1],rotation);
            var vX = this.position.x + points[0] + this.velocity.x;
            var vY = this.position.y + points[1] + this.velocity.y;
            if(vX > config.mapWidth || vX < 0){
              this.velocity.x = this.velocity.x * -1;
              this.theta = this.theta * -1;
            }else{
              var tX = vX - (vX % config.gridInterval);
              var tY = vY - (vY % config.gridInterval);
              var rightC = (oX > this.position.x);
              var leftC = (oX < this.position.x);
              var upC = (oY > this.position.y);
              var downC = (oY < this.position.y);
              if(terrain.getTile(tX,tY)){
                var dX = 0; var dY = 0;
                var dTheta = 0; var collSide;
                //handle edge behavior
                var origOnEdge = pointOnTileEdge(oX,oY,tX,tY);
                if(origOnEdge){
                  dX = (origOnEdge == 'left' || origOnEdge == 'right')  ? -this.velocity.x : 0;
                  dY = (origOnEdge == 'up' || origOnEdge == 'down') ? -this.velocity.y : 0;
                  collSide = origOnEdge;
                }else if(this.velocity.x && this.velocity.y){
                  var ret = this.findTranslationPenetration(tX,tY,oX,oY,vX,vY);
                  dX = ret[0];
                  dY = ret[1];
                  collSide = ret[2];
                }else if(this.velocity.x){
                  if(this.velocity.x > 0){
                    dX = tX - vX;
                    collSide = 'left';
                  }else{
                    dX = tX + config.gridInterval - vX;
                    collSide = 'right';
                  }
                }else if(this.velocity.y){
                  if(this.position.y <= tY && this.velocity.y > 0){
                    dY = tY - vY;
                    collSide = 'up';
                  }else{
                    dY = tY + config.gridInterval - vY;
                    collSide = 'down';
                  }
                }
                if(collSide && this.deltaR){
                  dTheta = cancelEdgeTheta(collSide,this.deltaR,rightC,leftC,upC,downC);
                }
                if(dTheta > pointRotTolerance ||
                  (Math.abs(dX) > pointTransTolerance) || (Math.abs(dY) > pointTransTolerance)){
                    if(!gearType){
                      this.destroyed = this.damaged ? true : this.destroyed;
                      this.damaged = true;
                    }
                    crashed.push(i);
                    this.explosions.push(new Explosion(vX,vY));
                    audio.play('explosion2');
                }

                this.deltaR += dTheta;
                if(dX){
                  this.position.x += dX;
                  this.velocity.x = this.velocity.x * 0.9;
                }
                if(dY){
                  this.position.y += dY
                  this.velocity.y = this.velocity.y * 0.9;
                }
                this.contact.left = leftC || this.contact.left;
                this.contact.right = rightC || this.contact.right;
              }
            }
          }
        }
      }
      for(var p in crashed){
        this.shipGeometry[part].splice(crashed[p],1);
      }
    }
    var majorMotion = (Math.abs(this.velocity.x) > 0.1 || Math.abs(this.velocity.y) > 0.1);
    if((this.contact.left || this.contact.right) && (this.deltaR == 0) && !majorMotion){
      this.landed = true;
    }
    if(crashed.length && this.destroyed){
      this.destroyShip();
    }
  }

  var pointOnTileEdge = function(oX,oY,tX,tY){
    var ret = false;
    if(oY == tY){
      ret = 'up';
    }else if(oY == (tY + config.gridInterval)){
      ret = 'down';
    }else if(oX == tX){
      ret = 'left';
    }else if(oX == (tX + config.gridInterval)){
      ret = 'right';
    }
    return ret;
  }

  var cancelEdgeTheta = function(side,deltaR,rightC,leftC,upC,downC){
    var dT = 0;
    switch(side){
      case 'up':
        if(rightC){
          dT = (deltaR > 0) ? -deltaR : 0;
        }else if(leftC){
          dT = (deltaR < 0) ? -deltaR : 0;
        }
       break;
      case 'down':
        if(rightC){
          dT = (deltaR < 0) ? -deltaR : 0;
        }else if(leftC){
          dT = (deltaR > 0) ? -deltaR : 0;
        }
       break;
      case 'left':
        if(upC){
          dT = (deltaR > 0) ? -deltaR : 0;
        }else if(downC){
          dT = (deltaR < 0) ? -deltaR : 0;
        }
       break;
      case 'right':
        if(upC){
          dT = (deltaR < 0) ? -deltaR : 0;
        }else if(downC){
          dT = (deltaR > 0) ? -deltaR : 0;
        }
       break;
    }
    return dT;
  }

  var calculateFriction = function(d1,d2,maxDepth){
    var pen1 = Math.abs(d1);
    var pen2 = Math.abs(d2);
    var penRatio = pen2 / maxDepth;
    penRatio = penRatio > 1 ? 1 : 0;
    return d1 * Math.pow(penRatio,4);
  }

  this.destroyShip = function(){
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

  this.findRotationPenetration = function(tX,tY,oX,oY,vX,vY){
    var inter = this.findTerrainIntersect(tX,tY,oX,oY,vX,vY);
    if(inter){
      var destPoint = [vX,vY];
      var originPoint = [oX,oY];
      var intPoint = [inter.intersect[0],inter.intersect[1]];
      var oIntLen = config.distance(originPoint,intPoint);
      var dIntLen = config.distance(intPoint,destPoint);
      return oIntLen / dIntLen;
    }
  }

  this.findTranslationPenetration = function(tX,tY,oX,oY,vX,vY){
    var dX = 0; var dY = 0;

    var otX = oX - (oX % config.gridInterval);
    var otY = oY - (oY % config.gridInterval);
    if(!(otX == tX && otY == tY)){
      var interFound = false;
      var inter = this.findTerrainIntersect(tX,tY,oX,oY,vX,vY);
      if(inter){
        interFound = true;
        dX = inter.intersect[0] - vX;
        dY = inter.intersect[1] - vY;
        return [dX,dY,inter.side];
      }
    }
    return false;
  }

  this.findTerrainIntersect = function(tX,tY,oX,oY,vX,vY){
    var ret = {};
    ret.intersect = false;
    var cubeSides = {
      'up' : [[tX,tY],[tX+config.gridInterval,tY]],
      'left' : [[tX,tY],[tX,tY+config.gridInterval]],
      'right' : [[tX+config.gridInterval,tY],[tX+config.gridInterval,tY+config.gridInterval]],
      'down' : [[tX,tY+config.gridInterval],[tX+config.gridInterval,tY+config.gridInterval]]
    };
    var sides = (vY - oY) > 0 ? ['up'] : ['down'];
    sides.push((vX - oX) > 0 ? 'left' : 'right');
    for(var s in sides){
      var side = cubeSides[sides[s]];
      var inter = config.intersect([oX,oY],[vX,vY],side[0],side[1]);
      if(inter){
        ret.intersect = inter;
        ret.side = sides[s];
        return ret;
      }
    }
    return false;
  }

  this.rotate = function(right,keyDown){
    if(keyDown){
      this.manualRotateState += right ? 1 : -1;
      this.manualRotateState = (this.manualRotateState > 2) ? 2 : this.manualRotateState;
      this.manualRotateState = (this.manualRotateState < -2) ? -2 : this.manualRotateState;
    }else{
      this.manualRotateState = 0;
    }
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

