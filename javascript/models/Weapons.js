Weapon = function(owner){
  this.owner = owner;
  this.name = ["Unknown","Weapon"];
  this.cooldownTimer = 0;
  this.cooldownCost;
  this.range = config.gridInterval;

  this.draw = function(x,y,canvasContext){
    this.drawWeapon(x,y,canvasContext);
  }

  this.drawWeapon = function(x,y,buffer){};

  this.fire = function(){
    var ret = false;
    var origin = utils.clonePos(this.owner.center());
    var dest = this.owner.targetObj ? utils.clonePos(this.owner.targetObj.center()) : false;
    if(!this.cooldownTimer && dest){
      this.cooldownTimer += this.cooldownCost;
      ret = this.spawnAmmo(origin,dest);
    }
    return ret;
  }

  this.spawnAmmo = function(orig,dest){
  }

  this.update = function(){
    if(this.cooldownTimer > 0){
      this.cooldownTimer -= 1;
    }
  }

}

BasicBlaster = function(owner){
  Weapon.call(this,owner);

  this.name = ["Basic","Blaster"];
  this.cooldownCost = 20;
  this.range = config.gridInterval * 20;

  this.drawWeapon = function(x,y,buffer){
    weaponArt.drawBlaster(x,y,buffer,this.owner);
  }

  this.spawnAmmo = function(orig,dest){
    return [new BlastAmmo(orig,dest)];
  }

  this.clone = function(pos){
    return new BasicBlaster(pos);
  }
}
