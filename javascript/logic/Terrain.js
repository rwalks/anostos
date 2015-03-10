Terrain = function(trMap,sSpawns) {

  this.terrain = trMap ? trMap : {};
  this.entityMap = {};
//construct holders
  this.rooms = [];
//tile reference holders
  var doors = {};
  var airtightWalls = {};
  var containers = {};
  var generators = {};

  this.resources = {
    'power':{'max':0,'current':0},
    'soil':{'max':300,'current':0},
    'ore':{'max':300,'current':0},
    'metal':{'max':300,'current':0},
    'bio':{'max':0,'current':0},
    'xeno':{'max':0,'current':0},
    'rad':{'max':0,'current':0},
    'fissile':{'max':0,'current':0}
  };
  var updateCount = 0;
  var resourceUpdateInterval = 5;
  var roomFinder = new Roomfinder();
  this.surfaceSpawns = sSpawns ? sSpawns : [];

  this.addTile = function(tile){
    var regen = false;
    if(tile.airtight){
      regen = true;
      airtightWalls[tile.position.x] = airtightWalls[tile.position.x] ? airtightWalls[tile.position.x] : {};
      airtightWalls[tile.position.x][tile.position.y] = true;
    }

    if(tile.type == 'door'){
      regen = true;
      doors[tile.position.x] = doors[tile.position.x] ? doors[tile.position.x] : {};
      doors[tile.position.x][tile.position.y] = true;
    }else if(tile.type == 'container'){
      regen = true;
      this.addContainer(tile);
    }else if(tile.type == 'generator'){
      regen = true;
      generators[tile.position.x] = generators[tile.position.x] ? generators[tile.position.x] : {};
      generators[tile.position.x][tile.position.y] = true;
    }
    this.updateTileTerrain(tile,false);
    return regen;
  }

  this.removeTile = function(tile){
    var regen = false;
    if(tile.airtight){
      regen = true;
      delete airtightWalls[tile.position.x][tile.position.y];
    }
    if(tile.type == 'container'){
      regen = true;
      this.removeContainer(tile);
    }else if(tile.type == 'generator'){
      regen = true;
      delete generators[tile.position.x][tile.position.y];
    }else if(tile.type == 'door'){
      regen = true;
      delete doors[tile.position.x][tile.position.y];
    }
    this.updateTileTerrain(tile,true);
    return regen;
  }

  this.updateTileTerrain = function(tile,remove){
    for(x = tile.position.x; x < tile.position.x+(tile.size.x); x += config.gridInterval){
      for(y = tile.position.y; y < tile.position.y+(tile.size.y); y += config.gridInterval){
        if(remove){
          delete this.terrain[x][y];
        }else{
          if(!this.terrain[x]){this.terrain[x] = {};}
          this.terrain[x][y] = tile;
        }
      }
    }
  }

  this.addContainer = function(obj,remove){
    var resource = obj.resourceAffinity;
    switch(resource){
      case 'power':
        this.resources.power.max += ((remove ? -1 : 1) * obj.storageCapacity);
        break;
      case 'oxygen':
        break;
      case 'dry':
        this.resources.soil.max += ((remove ? -1 : 1) * obj.storageCapacity);
        this.resources.metal.max += ((remove ? -1 : 1) * obj.storageCapacity);
        this.resources.ore.max += ((remove ? -1 : 1) * obj.storageCapacity);
        break;
    }
    if(remove){
      delete containers[obj.position.x][obj.position.y];
    }else{
      containers[obj.position.x] = containers[obj.position.x] ? containers[obj.position.x] : {};
      containers[obj.position.x][obj.position.y] = true;
    }
  }

  this.removeContainer = function(obj){
    this.addContainer(obj,true);
  }

  this.update = function(humans,resourceInv){
    for(x in doors){
      for(y in doors[x]){
        this.terrain[x][y].update(this);
      }
    }
    this.transferResources(resourceInv);
    if(updateCount >= resourceUpdateInterval){
      this.updateBuildings();
      updateCount = 0;
    }else{
      updateCount += 1;
    }

  }

  this.purchase = function(cost){
    if(this.canAfford(cost)){
      for(var r in cost){
        this.resources[r].current -= cost[r];
      }
      return true;
    }
    return false;
  }

  this.canAfford = function(cost){
    var canAfford = true;
    for(var r in cost){
      var rQuant = this.resources[r] ? this.resources[r].current : 0;
      if(rQuant < cost[r]){
        canAfford = false;
      }
    }
    return canAfford;
  }

  this.getTile = function(x,y){
    if(this.terrain[x] && this.terrain[x][y]){
      return this.terrain[x][y];
    }else{
      return false;
    }
  }

  this.validBuild = function(obj,coords){
    return (this.canAfford(obj.cost) && this.validBuildPos(obj,coords));
  }

  this.validBuildPos = function(obj,coords){
    //check for no buildings
    for(x = coords.x; x < coords.x+(obj.size.x); x += config.gridInterval){
      for(y = coords.y; y < coords.y+(obj.size.y); y += config.gridInterval){
        if(this.getTile(x,y)){
          return false;
        }
      }
    }
    //check for support
    return true;
  }

  this.canDestroy = function(obj){
    var currentTile = this.getTile(obj.position.x,obj.position.y);
    if(!currentTile){
      return false;
    }
    if(currentTile.currentHealth > 0 || currentTile.cost['rock']){
      return false;
    }
    return true;
  }

  this.draw = function(canvasBufferContext,camera,count){
    if(this.terrain){
      //drawRooms
      for (var r = 0; r < this.rooms.length; r++){
        this.rooms[r].draw(camera,canvasBufferContext);
      }
      //drawTiles
      for(var x=camera.xOff-(camera.xOff%config.gridInterval);x<camera.xOff+config.cX;x+=config.gridInterval){
        if(this.terrain[x]){
          for(var y=(camera.yOff-(camera.yOff%config.gridInterval));y<camera.yOff+config.cY;y+=config.gridInterval){
            if(this.terrain[x][y]){
              this.terrain[x][y].draw(camera,canvasBufferContext,count);
            }
          }
        }
      }
    }
  }

  this.updateBuildings = function(){
    var genXKeys = Object.keys(generators);
    for(var xi = 0; xi < genXKeys.length; xi++){
      var x = genXKeys[xi];
      var genYKeys = Object.keys(generators[x]);
      for(var yi = 0; yi < genYKeys.length; yi++){
        var y = genYKeys[yi];
        var gen = this.terrain[x][y];
        gen.updateGenerator(this.resources);
      }
    }
    for(var r = 0; r < this.rooms.length; r++){
      this.rooms[r].update();
    }
  }

  this.transferResources = function(inv){
    for(var res in this.resources){
      var invCount = inv.itemCount(res);
      if(invCount){
        this.resources[res].current += invCount;
        inv.removeItem(res,invCount);
      }
    }
  }

  var checkSolar = function(build,terrainMap){
    for(var y = build.position.y-config.gridInterval; y > (build.position.y - 500); y -= config.gridInterval){
      if(terrainMap[build.position.x] && terrainMap[build.position.x][y]){
        return false;
      }
    }
    return true;
  }

  this.getEntities = function(tX,tY){
    if(this.entityMap[tX] && this.entityMap[tX][tY]){
      return this.entityMap[tX][tY];
    }else{
      return false;
    }
  }

  this.updateEntityMap = function(obj,eMap){
    var tX = utils.roundToGrid(obj.position.x);
    var tY = utils.roundToGrid(obj.position.y);
    for(var sx = 0; sx <= obj.size.x; sx += config.gridInterval){
      for(var sy = 0; sy <= obj.size.y; sy += config.gridInterval){
        var x = tX + sx;
        var y = tY + sy;
        if(!eMap[x]){
          eMap[x] = {};
        }
        if(!eMap[x][y]){
          eMap[x][y] = [obj];
        }else{
          eMap[x][y].push(obj);
        }
      }
    }
  }

  this.purchaseBuilding = function(obj,coords){
    var regen = false;
    //check if clear
    var clear = this.validBuildPos(obj,coords);
    //purchase then place
    if(clear && this.purchase(obj.cost)){
      var newObj = obj.clone(coords.x,coords.y);
      newObj.setNewHealth();
      regen = this.addTile(newObj);
    }
    return regen;
  }

  this.buildGeneratorNetwork = function(obj,markedObjs){
    var openNodes = {};
    var closedNodes = {};
    var netGens = [];
    var netResources = {'power':true};
    var oxRooms = [];
    var oxContainers = [];
    var current = obj;
    addNode(current,openNodes);
    while(current){
      var x = current.position.x;
      var y = current.position.y;

      var oxType = current.resourceAffinity == 'oxygen';
      addNode(current,markedObjs);

      switch(current.type){
        case 'generator':
          netGens.push(current);
          break;
        case 'container':
          var resAf = current.resourceAffinity;
          if(resAf == 'oxygen'){
            oxContainers.push(current);
          }else if(resAf == 'dry'){
            netResources.soil = true;
            netResources.ore = true;
            netResources.metal = true;
          }else{
            netResources[resAf] = true;
          }
          break;
      }
      //search top and bottom
      var loopPoints = [[0,0,0,-config.gridInterval,config.gridInterval,current.size.y],
                        [-config.gridInterval,current.size.x,current.size.x,0,0,0]];
      for(lp in loopPoints){
        var l = loopPoints[lp];
        for(var vx = x+l[0]; vx < x + config.gridInterval+l[1]; vx += config.gridInterval+l[2]){
          for(var vy = y+l[3]; vy < y + current.size.y+l[4]; vy += config.gridInterval + l[5]){
            var node = this.terrain[vx][vy];
            if(node && node.built){
              if(oxType){
                var r = tileInRoom(node,this.rooms);
                if(r){
                  oxRooms.push(r);
                }
              }
              if(resourceType(node)){
                var relatedAffinity = current.relatedAffinity(node.resourceAffinity);
                if(relatedAffinity && !nodeExists(node,closedNodes)){
                  addNode(node,openNodes);
                }
              }
            }
          }
        }
      }
      addNode(current,closedNodes);
      delete openNodes[current.position.x][current.position.y];
      var current = getNextNode(openNodes,markedObjs);
    }
    //updateRooms
    var uniqueRooms = [];
    if(oxRooms.length){
      var uniqueIds = {};
      for(var r = 0; r < oxRooms.length; r++){
        if(!uniqueIds[oxRooms[r].id]){
          oxRooms[r].containers = oxContainers;
          uniqueRooms.push(oxRooms[r]);
          uniqueIds[oxRooms[r].id] = true;
        }
      }
    }
    //update gens
    for(var gi = 0; gi < netGens.length; gi++){
      var gen = netGens[gi];
      gen.rooms = uniqueRooms;
      gen.containers = oxContainers;
      gen.resourceConnections = netResources;
    }
  }

  var getNextNode = function(nodes,markedObjs){
    for(var x in nodes){
     for(var y in nodes[x]){
       if(!nodeExists(nodes[x][y],markedObjs)){
         return nodes[x][y];
       }
     }
    }
    return false;
  }

  var resourceType = function(node){
    return (node.type == 'generator' || node.type == 'container' || node.type == 'conveyor');
  }

  var nodeExists = function(node,nodeMap){
    return (nodeMap[node.position.x] && nodeMap[node.position.x][node.position.y]);
  }

  var addNode = function(node,nodeMap){
    nodeMap[node.position.x] = nodeMap[node.position.x] ? nodeMap[node.position.x] : {};
    nodeMap[node.position.x][node.position.y] = node;
  }

  this.regenBuildings = function(){
    this.regenRooms();
    this.regenResourceNetworks();
  }

  this.regenResourceNetworks = function(){
    var rNets = [];
    var markedNodes = {};
    for(x in generators){
      for(y in generators[x]){
        var built = generators[x][y].built;
        if(built && !(markedNodes[x] && markedNodes[x][y])){
          this.buildGeneratorNetwork(this.terrain[x][y],markedNodes);
        }
      }
    }
  }

  this.regenRooms = function(){
    var newRooms = [];
    var rId = 0;
    for(var x in airtightWalls){
      for(var y in airtightWalls[x]){
        var til = this.terrain[x][y];
        if(til.built && !tileInRoom(til,newRooms)){
          var rm = roomFinder.findRoom(~~x,~~y,this.terrain);
          if(rm.length > 0){
            if(uniqueRoom(rm,newRooms)){
              var newRoom = new Room(rm);
              var tRoom = tileInRoom(til,this.rooms);
              if(tRoom){
                newRoom.oxygen = tRoom.oxygen;
                newRoom.containers = tRoom.containers;
              }
              newRoom.id = rId;
              newRooms.push(newRoom);
              rId += 1;
            }
          }
        }
      }
    }
    this.rooms = newRooms;
  }

  var uniqueRoom = function(rm,roomArray){
    var rmHash = {};
    var dupe = false;
    for(p in rm){
      var point = rm[p];
      rmHash[point[0]] = rmHash[point[0]] ? rmHash[point[0]] : {};
      rmHash[point[0]][point[1]] = true;
    }
    for(r in roomArray){
      var counter = 0;
      var room = roomArray[r];
      for(i in room.points){
        var point = room.points[i];
        counter += (rmHash[point[0]] && rmHash[point[0]][point[1]]) ? 1 : 0;
      }
      if(counter > (rm.length * 0.5)){
        dupe = true;
      }
    }
    return !dupe;
  }

  this.inARoom = function(x,y,roomArray){
    for(r in roomArray){
      if(roomArray[r].pointWithin(x,y)){
        return roomArray[r];
      }
    }
    return false;
  }

  var tileInRoom = function(tile,roomArray){
    for(r in roomArray){
      var pts = roomArray[r].points;
      for(p in pts){
        if(pts[p][0] == tile.position.x && pts[p][1] == tile.position.y ){
          return roomArray[r];
        }
      }
    }
    return false;
  }


}

