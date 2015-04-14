var SceneUtils = function (bg){
  this.bgs = bg ? bg : [{},{},{}];
  this.starInterval = 5;

  this.generateTerrain = function(){
    var terrainInterval = config.terrainInterval;
    var tMap = {};
    var surfaceSpawns = [];
    var mid = config.mapHeight*0.7;
    var last = mid;
    var plants = [];
    for(var x=0;x<=config.mapWidth;x+=terrainInterval){
      tMap[x] = {};
      var dY = Math.random();
      if(dY < 0.3){
        if(dY < 0.05){
          dY = (Math.random()*(terrainInterval*10))-(terrainInterval*5);
        }else if(dY<0.1){
          dY = (Math.random()*(terrainInterval*20))-(terrainInterval*10);
        }else{
          dY = (Math.random()*(terrainInterval*4))-(terrainInterval*2);
        }
      }else{
         dY = (Math.random()*(terrainInterval*2))-(terrainInterval*1);
         //dY = 0;
      }
      var yMin = last + dY;
      var rockChance = 0.99;
      var colHeight = (config.mapHeight - yMin);
      for(var y=config.mapHeight;y>=yMin;y-=terrainInterval){
        var topLayer = false;
         if(y < yMin+terrainInterval){
           topLayer = true;
           var randAction = Math.random();
           if(Math.random() < 0.01){
             surfaceSpawns.push(tile.position);
           }else if(Math.random() < 0.1){
             plants.push(new Tree(x,y));
           }
         }
         var tile = new SoilTile(x,y,topLayer);
         addTile(tile,tMap,false);
      }
      if(x % (config.gridInterval * 4) == 0){
        this.bgs[0][x] = yMin - ((Math.random() * 50) + 200);
        this.bgs[1][x] = yMin - ((Math.random() * 50) + 100);
      }
      if(x % (config.gridInterval * 2) == 0){
        this.bgs[2][x] = yMin - 50;
      }
      last = yMin;
    }

    generateRock(tMap);
    generateOre(tMap);
    return new Terrain(tMap,surfaceSpawns,plants);
  }

  var generateOre = function(tMap){
    for(var i = 0; i < 1000; i ++){
      var x = Math.floor(Math.random() * (config.mapWidth/config.terrainInterval)) * config.terrainInterval;
      var y = (config.mapHeight/2) + (Math.floor(Math.random() * (config.mapHeight/2/config.terrainInterval)) * config.terrainInterval);
      if(tMap[x] && tMap[x][y]){
        var oreVeinLength = Math.random() * 10;
        for(var z = 0; z < oreVeinLength; z++){
          var tile = new OreTile(x,y);
          addTile(tile,tMap);
          if(Math.random() > 0.5){
            x += (Math.random() > 0.5) ? config.terrainInterval : -config.terrainInterval;
          }else{
            y += (Math.random() > 0.5) ? config.terrainInterval : -config.terrainInterval;
          }
        }
      }
    }
  }

  var generateRock = function(tMap){
    var lastMin = config.mapHeight * 0.9;
    var yMax = config.mapHeight;
    var towerDuration = 0;
    var towerHeight = 0;
    for(var x = 0; x < config.mapWidth; x += config.terrainInterval){
      if(Math.random() < 0.01){
        towerDuration = Math.random() * 20;
        towerHeight = Math.random() * config.mapHeight * 0.1;
      }
      var deltaH = (Math.random() * config.mapHeight * 0.01) - (config.mapHeight*0.005);
      lastMin = lastMin - deltaH;
      for(var y = yMax; y > (lastMin - towerHeight); y -= config.terrainInterval){
        var tile = new RockTile(x,y);
        addTile(tile,tMap);
      }
    }
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

  this.generateStars = function(c){
    var ret = {};
    var count = c ? c : 100;
    for(i=0; i<count; i++){
      var x = (Math.random() * config.cX);
      var y = (Math.random() * config.cY);
      if(!ret[x]){ ret[x] = {};}
      var fontSize = Math.random();
      ret[x][y] = ["",fontSize];
    }
    return ret;
  }


  this.onScreen = function(obj,camera){
    return obj.position.x > camera.xOff && obj.position.x < camera.xOff + config.cX;
  }

}
