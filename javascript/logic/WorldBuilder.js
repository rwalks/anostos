WorldBuilder = function(){

  var soilY = config.groundLevel;

  this.generate = function(){
    var tMap = {};
    var stars = {};
    tMap = generateSoil(tMap);
    stars = generateStars(stars);
    return new World(tMap,[],[],stars);
  };

  var generateSoil = function(tMap){
    for(var x=0;x<=config.mapWidth;x+=config.terrainInterval){
      tMap[x] = {};
      for(var y=config.mapHeight;y>=soilY;y-=config.terrainInterval){
        var tile = new SoilTile(x,y);
        if(y == soilY){
          tile.grass = true;
        }
        addTile(tile,tMap,false);
      }
    }
    return tMap;
  }

  var generateStars = function(sMap){
    var lX = (config.mapWidth * config.starP) + (config.cX*(1-config.starP));
    var lY = (config.groundLevel * config.starP) + (config.cY*(1-config.starP));
    for(var s=0;s<config.starCount;s++){
      var pos = new Vector(
          Math.round(Math.random() * lX),
          Math.round(Math.random() * lY)
          );
      var tX = utils.roundToGrid(pos.x);
      var tY = utils.roundToGrid(pos.y);
      var star = new Star(pos);
      sMap[tX] = sMap[tX] || {};
      if(sMap[tX][tY]){
        sMap[tX][tY].push(star);
      }else{
        sMap[tX][tY] = [star];
      }
    }
    return sMap;
  }

  var addTile = function(tile,terrain,remove){
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

}

Star = function(pos){
  this.position = pos;
  this.countOffset = Math.floor(Math.random() * 48);

  this.draw = function(count,camera,buffCon){
    var starArt = artHolder.getArt('star');
    count = count + this.countOffset;
    var x = this.position.x - (camera.xOff*config.starP);
    var y = this.position.y - (camera.yOff*config.starP);
    var pos = new Vector((x*config.xRatio),(y*config.yRatio));
    starArt.draw(pos,buffCon,1,count);
  }
}
