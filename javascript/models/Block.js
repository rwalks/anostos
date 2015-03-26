Block = function(type,x,y) {
  Building.call(this,x,y);
  this.rType = type;
  var fName = '';
  var fillRGB;
  var strokeRGB;
  this.airtight = false;
  this.pathable = false;
  this.cost = {};
  this.maxHealth = 100; this.currentHealth = 100;
  switch(type){
    case 'soil':
      fName = 'Soil';
      fillRGB = new Color(20,200,150,0.9);
      strokeRGB=new Color(40,250,200,1.0);
      this.cost.soil = 2;
      break;
    case 'metal':
      fName = 'Metal';
      fillRGB = new Color(200,220,200,0.9);
      strokeRGB=new Color(230,230,230,1.0);
      this.airtight = true;
      this.cost.metal = 2;
      break;
  }

  this.name.set(fName,"Block");

  this.collision = function(){return true;}

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    fillRGB.a = alpha;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = fillRGB.colorStr();
    canvasBufferContext.strokeStyle= strokeRGB.colorStr();
    var lX = this.size.x*config.xRatio*scl;
    var lY = this.size.y*config.yRatio*scl;
    canvasBufferContext.rect(x,y,lX,lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(x,y){
    return new Block(this.rType,x,y);
  }
}

Door = function(x,y) {
  Building.call(this,x,y);

  this.airtight = true;
  this.name.set("AirLock","");
  this.size.y = 2*config.gridInterval;

  this.open = false;
  this.cost = {'metal': 4};

  this.collision = function(){
    return this.active && !this.open;
  }
  this.pathable = true;
  this.type = "door";

  var fillRGB = new Color(40,200,50,0.9);
  var strokeRGB = new Color(80,250,100,1.0);

  this.update = function(terrain){
    var closeHuman = false;
    if(this.active){
      var entities = terrain.getEntities(this.position.x,this.position.y) || [];
      entities = entities.concat(terrain.getEntities(this.position.x+config.gridInterval,this.position.y) || []);
      entities = entities.concat(terrain.getEntities(this.position.x-config.gridInterval,this.position.y) || []);
      for(var e = 0; e < entities.length; e++){
        var entity = entities[e];
        var humanType = (entity.type == 'human');
        if(humanType){
          closeHuman = true;
        }
      }
    }
    this.open = closeHuman;
  }

  this.drawBlock = function(x,y,alpha,canvasBufferContext,scl){
    fillRGB.a = alpha;
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = fillRGB.colorStr();
    canvasBufferContext.strokeStyle= strokeRGB.colorStr();
    var lX = this.size.x*config.xRatio*scl / 3;
    var lY = (this.open ? this.size.y * 0.1 * config.yRatio : this.size.y*config.yRatio) * scl;
    canvasBufferContext.rect(x+lX,y,lX,lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.clone = function(x,y){
    return new Door(x,y);
  }
}

TerrainTile = function(x,y){
  Tile.call(this,x,y);
  this.size.x = 2*config.gridInterval;
  this.size.y = 2*config.gridInterval;
  this.artStr;

  this.currentHealth -= (Math.random() * 10);

  this.draw = function(camera,canvasBufferContext,terrain){
    if(terrain.count > this.lastDrawn){
      this.lastDrawn = terrain.count;
      var healthPercent = (this.currentHealth/this.maxHealth);
      var alpha = this.baseAlpha + (healthPercent*this.healthAlpha);
      var art = artHolder.getArt(this.artStr);
      var drawPos = utils.realCoords(this.position,camera);
      art.draw(drawPos,canvasBufferContext,alpha);
      return true;
    }
    return false;
  }

  this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = this.fillStyle.colorStr();
    canvasBufferContext.strokeStyle= this.strokeStyle.colorStr();
    canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }
}

SoilTile = function(x,y,topLayer){
  TerrainTile.call(this,x,y);
  this.name.set("Soil","");
  this.cost = {'soil': 8}
  this.artStr = topLayer ? "topSoilTile" : "soilTile";
  this.fillStyle = new Color(20,200,150,0.9);
  this.strokeStyle = new Color(40,250,200,1.0);
}

RockTile = function(x,y){
  TerrainTile.call(this,x,y);
  this.name.set("Rock","");
  this.cost = {'rock': 8};
  this.artStr = "rockTile";
  this.fillStyle = new Color(10,100,100,1.0);
  this.strokeStyle = new Color(20,150,150,1.0);
}

OreTile = function(x,y){
  TerrainTile.call(this,x,y);
  this.currentHealth -= (Math.random() * 10);
  this.name.set("Metal","Ore");
  this.cost = {'ore': 8};
  this.artStr = "oreTile";
  this.fillStyle = new Color(110,100,130,1.0);
  this.strokeStyle = new Color(210,200,230,1.0);
}
