Tile = function(x,y) {
  x = utils.roundToGrid(x);
  y = utils.roundToGrid(y);
  this.position = new Vector(x,y);
  this.size = new Vector(config.gridInterval,config.gridInterval);
  this.structSupport = new StructSupport();
  this.name = new Name();

  this.pathable = false;
  this.lastDrawn = -1;
  this.type = "tile";
  this.initialHealth = 0.1;
  this.maxHealth = 100;
  this.currentHealth = 100;
  this.built = true;
  this.active = true;
  this.hidden = true;

  this.baseAlpha = 0.2;
  this.healthAlpha = 0.6;

  this.setNewHealth = function(){
    this.currentHealth = this.maxHealth * this.initialHealth;
  }

  this.cost = {};

  this.center = function(){
    return {'x':this.position.x+(this.size.x*0.5),'y':this.position.y+(this.size.y*0.5)};
  }

  this.collision = function(){return true;}

  this.click = function(coords,terrain){
    return;
  }

  this.wound = function(damage){
    this.currentHealth -= damage;
    if(this.currentHealth <= 0){
      return true;
    }
    return false;
  }

  this.updateLight = function(terrain,lMap){
    if(this.light){
      terrain.updateLightMap(this.center(),this.lightRadius,lMap,this.lightColor);
    }
  }

  this.repair = function(amount){
    if(this.currentHealth >= this.maxHealth){
      this.currentHealth = this.maxHealth;
      return false;
    }
    this.currentHealth += amount;
    if(this.currentHealth >= this.maxHealth){
      this.currentHealth = this.maxHealth;
      if(!this.built){
        this.built = true;
        this.active = true;
        return "built";
      }
    }
    return true;
  }
}

StructSupport = function(){
}

