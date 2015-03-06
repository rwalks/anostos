Player = function(x,y,name) {
  Human.call(this,x,y,name);

  this.input = {
    'left' : false,
    'right' : false,
    'up' : false,
    'down' : false,
    'fire' : false,
    'jump' : false
  };

  this.walkAccel = config.gridInterval/8;
  this.airAccel = config.gridInterval/10;
  this.jumpAccel = config.gridInterval * 0.75;
  this.groundMaxX = config.gridInterval / 2;
  this.airMaxX = config.gridInterval / 4;

  this.setInput = function(dir,keyDown){
    this.input[dir] = keyDown;
    var xInput = (dir == 'left' || dir == 'right');
    if(keyDown && xInput){
      this.direction = (dir == 'right') ? true : false;
    }
  }

  this.updateMove = function(){
    //sideways
    var accel = this.onGround ? this.walkAccel : this.airAccel;
    var max = this.groundMaxX;
    if(!this.onGround){
      accel = this.airAccel;
      max = this.airMaxX;
    }

    var dX = (this.input.left ? -accel : 0);
    dX += (this.input.right ? accel : 0);
    var maxLateral = Math.abs(this.velocity.x + dX) - max;
    if(maxLateral <= 0){
      this.velocity.x += dX;
    }
    //jump
    if(this.input.jump && this.onGround){
      this.velocity.y -= this.jumpAccel;
    }
    //aiming
    if(this.input.up){
      this.weaponTheta = (dX ? -0.5 : -1) * Math.PI/2;
    }else if(this.input.down){
      this.weaponTheta = (dX ? 0.5 : 1) * Math.PI/2;
    }else{
      this.weaponTheta = 0;
    }
  }

  this.applyForces = function(){
    //gravity
    this.velocity.y += config.gravity;
    //friction
    this.velocity.x = this.velocity.x * (this.onGround ? 0.8 : 0.95);
    //max speed
    this.applyMaxVelocity();
  }

  this.interactTarget = function(terrain){

    this.activeTool = 'delete';
    ret = false;
    this.weaponActive = this.input.fire;
    if(this.input.fire){
      switch(this.activeTool){
        case 'attack':
          var ammoRet = this.weapon.fire();
          if(ammoRet){
            ret = {'action':'fire','obj':ammoRet};
          }
          break;
      }
    }
    return ret;
  }




}

