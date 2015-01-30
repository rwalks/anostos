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
  this.acceleration = 0.07;
  this.currentFuel = 100;
  this.maxFuel = 100;
  this.maxSpeed = config.gridInterval * 0.99;
  var fuelUse = 0.2;

  this.contact = {};
  this.contact.up = false; this.contact.down = false;
  this.contact.left = false; this.contact.right = false;
  this.onGround = false;

  var frictionLimit = 1.5;
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
      if(!this.onGround){
        //air friction;
        this.velocity.x = this.velocity.x * 0.99;
      }

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
    var rotForce = 0;
    this.onGround = false;
    for(var part in this.shipGeometry){
      var geo = this.shipGeometry[part];
      var gearType = (part == 'rightGear' || part == 'leftGear');
      var maxForce = 1.5;
      var contactFriction = 2.0;
      if(gearType){
        maxForce = 5.0;
      }
      for(var i in geo){
        if(geo[i]){
          var crashed = false;
          //old rot
          var oRotPoint = rotate(geo[i][0],geo[i][1],this.theta);
          var oRotX = this.position.x + oRotPoint[0];
          var oRotY = this.position.y + oRotPoint[1];
          var vRotX = oRotX + this.velocity.x;
          var vRotY = oRotY + this.velocity.y;
          //new theta
          var rotation = this.theta + this.deltaR;
          var points = rotate(geo[i][0],geo[i][1],rotation);
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
            var rightOfCenter = (oX > this.position.x);
            var leftOfCenter = (oX < this.position.x);
            if(terrain.getTile(tX,tY)){
              this.onGround = true;
              var dX = 0; var dY = 0;
              //handle behavior crossing into tile
              var originWithin = (oX > tX && oX < (tX + config.gridInterval)) &&
                                 (oY > tY && oY < (tY + config.gridInterval));
              var moving = this.velocity.x && this.velocity.y && !originWithin;
              var tRotX = vRotX - (vRotX % config.gridInterval);
              var tRotY = vRotY - (vRotY % config.gridInterval);
              var rotOriginWithin = (oRotX > tX && oRotX < (tX + config.gridInterval)) &&
                                 (oRotY > tY && oRotY < (tY + config.gridInterval));

              var rotating = this.deltaR && !rotOriginWithin;
              if(rotating || moving){
                var o1;var o2;
                if(rotating){
                  o1 = oRotX; o2 = oRotY;
                }else{
                  o1 = oX; o2 = oY;
                }
                var ret = this.findTilePenetration(rotating,tX,tY,o1,o2,vX,vY);
                dX = ret ? ret[0] : dX;
                dY = ret ? ret[1] : dY;
                var diagStr = rotating ? 'rotate: ' : 'translate: ';
              }else if(this.velocity.x){
                if(this.velocity.x > 0){
                  dX = Math.max(tX - vX,-this.gravity*2);
                }else{
                  dX = Math.min(tX + config.gridInterval - vX,this.gravity*2);
                }
              }else if(this.velocity.y){
                if(this.position.y <= tY && this.velocity.y > 0){
                  dY = Math.max(tY - vY,-this.gravity*4);
                }else{
                  dY = Math.min(tY + config.gridInterval - vY,this.gravity*2);
                }
              }else{
              //point within tile or collision bug
                var dYTop = tY - vY;
                var dYBot = (tY+config.gridInterval) - vY;
                var dYMin = (Math.abs(dYTop) <= Math.abs(dYBot)) ? dYTop : dYBot;
                var dXL = tX - vX;
                var dXR = (tX+config.gridInterval) - vX;
                var dXMin = (Math.abs(dXL) <= Math.abs(dXR)) ? dXL : dXR;
                if(dYMin <= dXMin){
                  dY = dYMin;
                  dX = -this.velocity.x;
                }else{
                  dX = dXMin;
                  dY = -this.velocity.y;
                }
              }
              if(dX || dY){
                //create triangle between pos, vPoint, and adjusted pos
                //to find dTheta
                var pos = [this.position.x,this.position.y];
                var aPoint = [vX,vY];
                var bPoint = [vX+dX,vY+dY];
                var aLen = config.distance(pos,aPoint);
                var bLen = config.distance(pos,bPoint);
                var cLen = config.distance(aPoint,bPoint);
                var dTheta = Math.acos((Math.pow(bLen,2) + Math.pow(aLen,2) - Math.pow(cLen,2)) / (2 * aLen * bLen));
                //degs to rads
                dTheta = dTheta * (Math.PI / 180);
                if(dTheta){
                  var adjustRot = false;
                  if(rightOfCenter && !this.contact.left){
                    this.deltaR += dTheta;
                    adjustRot = true;
                  }else if(leftOfCenter && !this.contact.right){
                    this.deltaR += dTheta;
                    adjustRot = true;
                  }
                  if(adjustRot){
                    //find new dest, adjust dX / dY
                    var newRot = this.theta + this.deltaR;
                    var points = rotate(geo[i][0],geo[i][1],newRot);
                    var newOX = this.position.x + points[0];
                    var newOY = this.position.y + points[1];
                    var newVX = newOX + this.velocity.x;
                    var newVY = newOY + this.velocity.y;
                    dX = (vX + dX) - newVX;
                    dY = (vY + dY) - newVY;
                  }
                }
              }
              //resolve deltas
              if(this.velocity.y && (dY * this.velocity.y) < 0){
                var deltaVY = (Math.abs(dY) > this.velocity.y) ? -this.velocity.y : dY;
                this.velocity.y += deltaVY;
                dY -= deltaVY;
              }
              if(this.velocity.x && (dX * this.velocity.x) < 0){
                var deltaVX = (Math.abs(dX) > this.velocity.x) ? -this.velocity.x : dX;
                this.velocity.x += deltaVX;
                dX -= deltaVX;
              }
              var maxD = (Math.abs(dX) + Math.abs(dY)) / 1;
              dX = maxD > 1 ? dX / maxD : dX;
              dY = maxD > 1 ? dY / maxD : dY;
              this.position.y += dY;
              this.position.x += dX;
              //contact points
              this.contact.right = rightOfCenter || this.contact.right;
              this.contact.left = leftOfCenter || this.contact.left;
            }else{
            }
          }
          if(crashed){
            geo[i] = false;
          }
        }
      }
    }
    if(this.contact.left && this.velocity.y){
      var dTheta = (!this.contact.right) ? 0.05 : 0;
      dTheta = dTheta * (this.velocity.y > 0 ? 1 : -1);
      this.deltaR += dTheta;
    }else if(this.contact.right && this.velocity.y){
      var dTheta = (!this.contact.left) ? -0.05 : 0;
      dTheta = dTheta * (this.velocity.y > 0 ? 1 : -1);
      this.deltaR += dTheta;
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

  var calculateFriction = function(d1,d2,maxDepth){
    var pen1 = Math.abs(d1);
    var pen2 = Math.abs(d2);
    var penRatio = pen2 / maxDepth;
    penRatio = penRatio > 1 ? 1 : 0;
    return d1 * Math.pow(penRatio,4);
  }

  this.findTilePenetration = function(rot,tX,tY,oX,oY,vX,vY){
    var dX = 0; var dY = 0;
    var interFound = false;
    var inter = this.findTerrainIntersect(tX,tY,oX,oY,vX,vY);
    if(inter){
      if(inter.adjacent && !inter.horizontal){
        interFound = true;
        dY = calculateFriction(dY,dX,maxSkidDepth);
        dX = -1 * (vX - oX);
      }else if(inter.adjacent && inter.horizontal){
        interFound = true;
        dX = calculateFriction(dX,dY,maxSkidDepth);
        dY = -1 * (vY - oY);
      }else{
        interFound = true;
        dX = inter.intersect[0] - vX;
        dY = inter.intersect[1] - vY;
        if(inter.horizontal){
          //slide horiz
          dX = calculateFriction(dX,dY,maxSkidDepth);
        }else{
          //slide vert
          dY = calculateFriction(dY,dX,maxSkidDepth);
        }
      }
    }
    return interFound ? [dX,dY] : false;
  }

  this.findTerrainIntersect = function(tX,tY,oX,oY,vX,vY){
    var ret = {};
    ret.intersect = false;
    var cubeSides = {
      'u' : [[tX,tY],[tX+config.gridInterval,tY]],
      'l' : [[tX,tY],[tX,tY+config.gridInterval]],
      'r' : [[tX+config.gridInterval,tY],[tX+config.gridInterval,tY+config.gridInterval]],
      'd' : [[tX,tY+config.gridInterval],[tX+config.gridInterval,tY+config.gridInterval]]
    };
    var sides = (vY - this.position.y) > 0 ? ['u'] : ['d'];
    sides.push((vX - this.position.x) > 0 ? ['l'] : ['r']);
    for(var s in sides){
      var side = cubeSides[sides[s]];
      var horizSide = (sides[s] == 'u' || sides[s] == 'd');
      if((oX == side[0][0] && !horizSide) || (oY == side[0][1] && horizSide)){
        ret.intersect = [oX,oY];
        ret.horizontal = horizSide;
        ret.adjacent = true;
      }else{
        var inter = config.intersect([oX,oY],[vX,vY],side[0],side[1]);
        if(inter){
          ret.intersect = inter;
          ret.horizontal = horizSide;
          ret.adjacent = false;
        }
      }
      if(ret.intersect){ break; }
    }
    if(ret.intersect){
      return ret;
    }else{
      return false;
    }
  }

  this.rotate = function(right,keyDown){
    if(keyDown){
      this.manualRotateState += right ? 1 : -1;
      this.manualRotateState = (this.manualRotateState > 4) ? 4 : this.manualRotateState;
      this.manualRotateState = (this.manualRotateState < -4) ? -4 : this.manualRotateState;
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

