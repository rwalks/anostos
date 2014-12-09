Terrain = function() {

  this.terrain = {};
  
  var doors = {};
  var airtightWalls = {};
  var containers = {};
  var generators = {};

  this.addTile = function(tile,remove){
    if(remove){
      if(tile.airtight){
        delete airtightWalls[tile.position.x][tile.position.y];
        this.regenRooms();
      }
      if(tile.type == 'container'){
        delete containers[tile.position.x][tile.position.y];
      }else if(tile.type == 'generator'){
        delete generators[tile.position.x][tile.position.y];
      }else if(tile.type == 'door'){
        delete doors[tile.position.x][tile.position.y];
      }
    }else{
      if(tile.airtight){
        airtightWalls[tile.position.x] = airtightWalls[tile.position.x] ? airtightWalls[tile.position.x] : {};
        airtightWalls[tile.position.x][tile.position.y] = true;
        this.regenRooms();
      }
      if(tile.type == 'door'){
        doors[tile.position.x] = doors[tile.position.x] ? doors[tile.position.x] : {};
        doors[tile.position.x][tile.position.y] = true;
      }else if(tile.type == 'container'){
        containers[tile.position.x] = containers[tile.position.x] ? containers[tile.position.x] : {};
        containers[tile.position.x][tile.position.y] = true;
      }else if(tile.type == 'generator'){
        generators[tile.position.x] = generators[tile.position.x] ? generators[tile.position.x] : {};
        generators[tile.position.x][tile.position.y] = true;
      }
    }
    for(x = tile.position.x; x < tile.position.x+(tile.size.x); x += config.gridInterval){
      for(y = tile.position.y; y < tile.position.y+(tile.size.y); y += config.gridInterval){
        if(remove){
          delete terrain[x][y];
        }else{
          if(!terrain[x]){terrain[x] = {};}
          terrain[x][y] = tile;
        }
      }
    }
  }

  this.removeTile = function(tile,terrain){
    this.addTile(tile,terrain,true);
  }

  this.update = function(humans){
    for(x in doors){
      for(y in doors[x]){
        terrain[x][y].update(humans);
      }
    }

  }

  this.isClear = function(obj,humans){
    for(h in humans){
      if (humans[h].pointWithin(obj.position.x+(obj.size.x/2),obj.position.y+(obj.size.y/2))){
        return false;
      }
    }
    for(x = obj.position.x; x < obj.position.x+(obj.size.x); x += config.gridInterval){
      for(y = obj.position.y; y < obj.position.y+(obj.size.y); y += config.gridInterval){
        if(terrain[x] && terrain[x][y]){
          return false;
        }
      }
    }
    return true;
  }

  this.TerrainTile = function(x,y){
    this.name = ["Soil",""];
    this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
    x = x - (x % this.size.x);
    y = y - (y % this.size.y);
    this.position = {'x':x,'y':y};
    this.collision = function(){return true;}
    this.pathable = false;
    this.lastDrawn = -1;
    this.cost = {'soil': 8};
    this.type = "construction";
    this.draw = function(camera,canvasBufferContext,count){
      //draw less often
      if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
        this.lastDrawn = count;
        canvasBufferContext.beginPath();
        canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
        canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
        canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
        var originX = (this.position.x-camera.xOff)*config.xRatio;
        var originY = (this.position.y-camera.yOff)*config.yRatio;
        var lX = this.size.x*config.xRatio;
        var lY = this.size.y*config.yRatio;
        canvasBufferContext.rect(originX,originY,lX,lY);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
      }
    }

    this.drawTargetPortrait = function(oX,oY,xSize,ySize,canvasBufferContext){
      canvasBufferContext.beginPath();
      canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
      canvasBufferContext.fillStyle = "rgba(20,200,150,0.9)";
      canvasBufferContext.strokeStyle="rgba(40,250,200,1.0)";
      canvasBufferContext.rect(oX+(xSize*0.2),oY+(ySize*0.2),xSize*0.6,ySize*0.6);
      canvasBufferContext.fill();
      canvasBufferContext.stroke();
    }

    this.click = function(coords,terrain){
      return;
    }
  }

}

