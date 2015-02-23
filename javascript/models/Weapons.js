Weapon = function(){
  this.name = ["Unknown","Weapon"];
  this.cooldownTimer = 0;
  this.cooldownCost;

  this.draw = function(x,y,canvasBufferContext,human){
  }

  this.fire = function(pos){
    if(!this.cooldownTimer){
      this.cooldownTimer += this.cooldownCost;
      return this.spawnAmmo(pos);
    }
  }

  this.spawnAmmo = function(orig,dest){
  }

  this.update = function(){
    if(this.cooldownTimer > 0){
      this.cooldownTimer -= 1;
    }
  }

}

BasicBlaster = function(pos){
  Weapon.call(this);

  this.name = ["Basic","Blaster"];
  this.cooldownCost = 20;


  this.spawnAmmo = function(orig,dest){
    return [new BlastAmmo(orig,dest)];
  }

  this.clone = function(pos){
    return new BasicBlaster(pos);
  }
}
