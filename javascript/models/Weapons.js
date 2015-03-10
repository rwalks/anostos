Weapon = function(owner){
  Tool.call(this,owner);
  this.type = 'attack';

  this.typeActivate = function(orig,theta,terrain){
    var ammoRet = this.spawnAmmo(orig,theta);
    return {'action':'fire','obj':ammoRet};
  }

  this.spawnAmmo = function(orig,theta){
  }
}

BasicBlaster = function(owner){
  Weapon.call(this,owner);

  this.name.set("Basic","Blaster");
  this.cooldownCost = 10;
  this.range = config.gridInterval * 20;
  this.actionOffset.x = config.gridInterval * 0.9;
  this.actionOffset.y = config.gridInterval * -0.2;

  this.drawTool = function(x,y,buffer){
    weaponArt.drawBlaster(x,y,buffer,this.owner);
  }

  this.spawnAmmo = function(orig,theta){
    return [new BlastAmmo(orig,theta,this.owner.type)];
  }

  this.clone = function(owner){
    return new BasicBlaster(owner);
  }
}
