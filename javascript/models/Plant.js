Plant = function(x,y){
  Tile.call(this,x,y);

  this.pathable = true;
  this.collision = function(){return false;}

  this.animOffset = Math.floor(Math.random() * 60);

  this.draw = function(camera,buffCon,terrain){
    if(terrain.count > this.lastDrawn){
      this.lastDrawn = terrain.count;
      var drawPos = utils.realCoords(this.position,camera);
      var art = artHolder.getArt(this.artStr);
      var count = terrain.count + this.animOffset;
      art.draw(drawPos,buffCon,1,count);
      this.updateLight(camera,terrain);
      return true;
    }
    return false;
  }

  this.updateLight = function(camera,terrain){};
  this.drawTargetPortrait = function(oX,oY,xSize,ySize,buffCon){
  }
}

Tree = function(x,y){
  Plant.call(this,x,y);
  this.size.x = 12*config.gridInterval;
  this.size.y = 12*config.gridInterval;
  this.position.y -= this.size.y;
  this.name.set("Lumo","Tree");
  this.artStr = "treePlant";

  this.lightRadius = 6.5;
  this.lightColor = new Color(200,0,250,0.4);

  this.updateLight = function(camera,terrain){
    var orig = this.center();
    orig.y -= this.size.y * 0.1;
    terrain.updateLightMap(orig,this.lightRadius,this.lightColor);
  }
}

Scrub = function(x,y){
  Plant.call(this,x,y);
  this.currentHealth = 5; this.maxHealth = 5;
  this.size.x = 2*config.gridInterval;
  this.size.y = 2*config.gridInterval;
  this.position.y -= this.size.y;
  this.name.set("A","Scrub");
  this.artStr = "scrubPlant";
}
