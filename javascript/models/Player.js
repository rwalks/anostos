Player = function(x,y,name) {
  Human.call(this,x,y,name);

  this.input = {
    'left' : false,
    'right' : false,
    'up' : false,
    'down' : false,
    'fire' : false,
    'crouch' : false,
    'jump' : false
  };

  this.equipment.attack = new BasicBlaster(this);
  this.equipment.repair = new Wrench(this);
  this.equipment.drill = new PlasmaTorch(this);

  this.currentTool = this.equipment.drill;

  this.walkAccel = config.gridInterval/8;
  this.airAccel = config.gridInterval/8;
  this.jumpAccel = config.gridInterval * 0.75;
  this.groundMaxX = config.gridInterval / 2;
  this.airMaxX = config.gridInterval / 3;

  this.scout = true;
  this.scoutRange = config.gridInterval * 15;

  this.setInput = function(action,keyDown){
    var xInput = (action == 'left' || action == 'right');
    if(keyDown && xInput){
      this.direction = (action == 'right');
    }
    this.input[action] = keyDown;
  }

  this.updateMove = function(){
    this.crouching = this.input.crouch;
    //sideways
    var accel = this.onGround ? this.walkAccel : this.airAccel;
    var max = this.groundMaxX;
    if(!this.onGround){
      accel = this.airAccel;
      max = this.airMaxX;
    }
    var dX = (this.input.left ? -accel : 0);
    dX += (this.input.right ? accel : 0);
    if(!this.crouching){
      var maxLateral = Math.abs(this.velocity.x + dX) - max;
      if(maxLateral <= 0){
        this.velocity.x += dX;
      }
    }
    //jump
    if(this.input.jump && this.onGround){
      this.velocity.y -= this.jumpAccel;
    }
    //aiming
    if(this.input.up){
      this.toolTheta = (dX ? -0.5 : -1) * Math.PI/2;
    }else if(this.input.down){
      this.toolTheta = (dX ? 0.5 : 1) * Math.PI/2;
    }else{
      this.toolTheta = 0;
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
    ret = false;
    this.toolActive = this.currentTool && this.input.fire;
    if(this.toolActive){
      ret = this.currentTool.activate(terrain);
    }
    return ret;
  }

}

