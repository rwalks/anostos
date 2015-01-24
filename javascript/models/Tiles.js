Tiles = function() {

  this.addTile = function(tile,terrain,remove){
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

  this.isClear = function(obj,terrain,humans){
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

  this.TerrainTile = function(x,y,type){
    this.size = {'x':2*config.gridInterval,'y':2*config.gridInterval};
    x = x - (x % this.size.x);
    y = y - (y % this.size.y);
    this.position = {'x':x,'y':y};

    this.center = function(){
      return {'x':this.position.x+(this.size.x*0.5),'y':this.position.y+(this.size.y*0.5)};
    }
    this.collision = function(){return true;}
    this.pathable = false;
    this.lastDrawn = -1;
    this.type = "construction";
    var fillStyle; var strokeStyle;
    this.topLayer = false;
    this.plant = false;
    this.maxHealth = 100; this.currentHealth = 100;
    switch(type){
      case "soil":
        this.name = ["Soil",""];
        this.cost = {'soil': 8};
        fillStyle = "rgba(20,200,150,1.0)";
        strokeStyle="rgba(40,250,200,1.0)";
        break;
      case "ore":
        this.name = ["Metal","Ore"];
        this.cost = {'ore': 8};
        fillStyle = "rgba(110,100,130,1.0)";
        strokeStyle = "rgba(210,200,230,1.0)";
        break;
      case "rock":
        this.name = ["Rock",""];
        this.cost = {'rock': 8};
        fillStyle = "rgba(10,100,100,1.0)";
        strokeStyle = "rgba(20,150,150,1.0)";
        break;
    }
    this.draw = function(camera,canvasBufferContext,count){
      //draw less often
      if(count > this.lastDrawn || Math.abs(count - this.lastDrawn) > 1){
        if(this.plant){
          this.plant.draw(camera,canvasBufferContext);
        }
        this.lastDrawn = count;
        canvasBufferContext.beginPath();
        canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
        canvasBufferContext.fillStyle = fillStyle;
        canvasBufferContext.strokeStyle = strokeStyle;
        var originX = (this.position.x-camera.xOff)*config.xRatio;
        var originY = (this.position.y-camera.yOff)*config.yRatio;
        var lX = this.size.x*config.xRatio;
        var lY = this.size.y*config.yRatio;
        canvasBufferContext.rect(originX,originY,lX,lY);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
        if(this.topLayer){
          canvasBufferContext.fillStyle = "rgba(100,0,100,1.0)";
          canvasBufferContext.strokeStyle = "rgba(250,0,250,1.0)";
          canvasBufferContext.beginPath();
          canvasBufferContext.moveTo(originX,originY);
          var points = [[lX,0],[lX,lY*0.4],[lX*0.9,lY*0.2],[lX*0.8,lY*0.4],[lX*0.7,lY*0.2],[lX*0.6,lY*0.4],[lX*0.5,lY*0.2],[lX*0.4,lY*0.4],[lX*0.3,lY*0.2],[lX*0.2,lY*0.4],[lX*0.1,lY*0.2],[0,lY*0.4],[0,0]];
          for(var p in points){
            canvasBufferContext.lineTo(originX+points[p][0],originY+points[p][1]);
          }
          canvasBufferContext.fill();
          canvasBufferContext.stroke();
        }
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

