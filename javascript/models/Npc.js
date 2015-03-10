Npc = function(x,y,name) {
  Human.call(this,x,y,name);

  this.maxHealth = 100; this.currentHealth = 100;
  this.maxOxygen = 20; this.currentOxygen = 20;

  this.targetObj = false;
  this.targetRange = false;
  this.targetCoords = {};

  this.maxSpeed = {'x':3,'y':10};

  this.weapon = new BasicBlaster(this);

  //suit color
  var r = Math.floor(Math.random()*250);
  var g = Math.floor(Math.random()*250);
  var b = Math.floor(Math.random()*250);
  this.fillColor = "rgba("+r+","+g+","+b+",0.9)";
  r = (r >= g && r >= b) ? 250 : 0;
  g = (g >= r && g >= b) ? 250 : 0;
  b = (b >= g && b >= r) ? 250 : 0;
  this.lineColor = "rgba("+r+","+g+","+b+",1.0)";


  this.updateMove = function(){
    //move path
    if(this.path.length){
      this.followPath();
    }
  };

  this.applyForces = function(){
    //gravity
    this.velocity.y += config.gravity;
    //max speed
    this.velocity.x = (Math.abs(this.velocity.x) > this.maxSpeed.x) ? (this.velocity.x * (this.maxSpeed.x/Math.abs(this.velocity.x))) : this.velocity.x ;
    this.velocity.y = (Math.abs(this.velocity.y) > this.maxSpeed.y) ? (this.velocity.y * (this.maxSpeed.y/Math.abs(this.velocity.y))) : this.velocity.y ;
    //friction
    this.velocity.x = this.velocity.x * (this.onGround ? 0.8 : 0.9);
    this.velocity.y = this.velocity.y * 0.9;
  }

  this.setDirection = function(){
    if(this.targetObj && this.targetRange){
      this.direction = (this.targetObj.position.x > this.position.x);
    }else{
      if(this.velocity.x > 0){this.direction = true;}
      if(this.velocity.x < 0){this.direction = false;}
    }
  }

  this.assignAction = function(coords,terrain,action,obj){
    this.action = false;
    this.targetObj = false;
    this.targetCoords = {};
    if(!obj){
      coords = pathfinder.findValidSpace(coords,terrain,this.size);
      this.path = pathfinder.findPath(coords.x,coords.y,terrain,this);
    }else if(obj){
      this.targetCoords.x = obj.position.x;
      this.targetCoords.y = obj.position.y;
      this.path = pathfinder.findObjPath(obj,terrain,this);
      if(this.path.length && action == 'select'){
        //determine if attack or repair
        if(hostileTarget(obj)){
          action = 'attack';
        }else if(repairTarget(obj)){
          action = 'repair';
        }
      }
    }
    this.action = action;
    if(action && action != 'select'){
      this.activeTool = action;
    }
    this.targetObj = obj;
    return;
  }

  this.interactTarget = function(terrain){
    var ret = false;
    this.targetRange = false;
    if(this.targetObj){
      var targCoords = [this.targetObj.position.x+(this.targetObj.size.x/2),this.targetObj.position.y+(this.targetObj.size.y/2)];
      var range = this.interactRange();
      if(nodeDistance(targCoords,this.center()) < range){
        this.targetRange = true;
        switch(this.action){
          case 'build':
            ret = {'action':'build','obj':this.targetObj};
            this.dropTarget();
            break;
          case 'delete':
            var targ = terrain.getTile(this.targetObj.position.x,this.targetObj.position.y);
            if(targ && targ == this.targetObj){
              var dead = this.digTile(targ);
              if(dead){
                ret = {'action':'delete','obj':targ};
                this.dropTarget();
              }
            }else{
              this.dropTarget();
            }
            break;
          case 'attack':
            if(this.weapon){
              var ammoRet = this.weapon.fire();
              if(ammoRet){
                ret = {'action':'fire','obj':ammoRet};
              }
            }
            break;
          case 'repair':
            this.dropTarget();
            break;
          default:
            this.dropTarget();
            break;
        }
      }
      if(this.action == 'attack'){
        this.attackTarget(terrain);
      }
    }
    return ret;
  }

  this.attackTarget = function(terrain){
    if(!this.targetObj || this.targetObj.dead){
      this.dropTarget();
      return false;
    }else{
      var enemyDeviation = utils.objectDistance({'position':this.targetCoords},this.targetObj);
      var range = this.weapon ? this.weapon.range : config.gridInterval*2;
      if(enemyDeviation > range){
        this.path = pathfinder.findObjPath(this.targetObj,terrain,this);
        if(this.path.length){
          this.targetCoords.x = this.path[0][0];
          this.targetCoords.y = this.path[0][1];
        }
      }
    }
  }

  this.dropTarget = function(){
    this.path = [];
    this.targetObj = false;
    this.targetCoords = {};
  }

}

