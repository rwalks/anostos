Terrain = function(trMap,sSpawns) {

  this.terrain = trMap ? trMap : {};
//construct holders
  this.rooms = [];
  var resourceNetworks = [];
//tile reference holders
  var doors = {};
  var airtightWalls = {};
  var containers = {};
  var generators = {};
  var powerBuildings = {};

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
//
  var updateCount = 0;
  var resourceUpdateInterval = 5;
  var roomFinder = new Roomfinder();
  this.surfaceSpawns = sSpawns ? sSpawns : [];

  this.addTile = function(tile,remove){
    var regen = false;
    if(remove){
      if(tile.airtight){
        regen = true;
        delete airtightWalls[tile.position.x][tile.position.y];
      }
      if(tile.type == 'container'){
        regen = true;
        delete containers[tile.position.x][tile.position.y];
      }else if(tile.type == 'generator'){
        regen = true;
        delete generators[tile.position.x][tile.position.y];
      }else if(tile.type == 'door'){
        regen = true;
        delete doors[tile.position.x][tile.position.y];
      }
    }else{
      if(tile.airtight){
        regen = true;
        airtightWalls[tile.position.x] = airtightWalls[tile.position.x] ? airtightWalls[tile.position.x] : {};
        airtightWalls[tile.position.x][tile.position.y] = true;
      }
      var powerType = tile.resourceAffinities && tile.resourceAffinities[0] == 'power';
      if(tile.type == 'door'){
        regen = true;
        doors[tile.position.x] = doors[tile.position.x] ? doors[tile.position.x] : {};
        doors[tile.position.x][tile.position.y] = true;
      }else if(powerType){
        regen = true;
        powerBuildings[tile.position.x] = powerBuildings[tile.position.x] ? powerBuildings[tile.position.x] : {};
        powerBuildings[tile.position.x][tile.position.y] = true;
      }else if(tile.type == 'container'){
        regen = true;
        containers[tile.position.x] = containers[tile.position.x] ? containers[tile.position.x] : {};
        containers[tile.position.x][tile.position.y] = true;
      }else if(tile.type == 'generator'){
        regen = true;
        generators[tile.position.x] = generators[tile.position.x] ? generators[tile.position.x] : {};
        generators[tile.position.x][tile.position.y] = true;
      }
    }
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
    return regen;
  }

  this.removeTile = function(tile){
    return this.addTile(tile,true);
  }

  this.update = function(humans,resourceInv){
    for(x in doors){
      for(y in doors[x]){
        this.terrain[x][y].update(humans);
      }
    }
    this.updateResources(resourceInv);
    if(updateCount >= resourceUpdateInterval){
      this.updateBuildings();
      updateCount = 0;
    }else{
      updateCount += 1;
    }

  }

  this.purchase = function(cost){
    var canAfford = true;
    for(var r in cost){
      var rQuant = this.resources[r] ? this.resources[r].current : 0;
      if(rQuant < cost[r]){
        canAfford = false;
      }
    }
    if(canAfford){
      for(var r in cost){
        this.resources[r].current -= cost[r];
      }
      return true;
    }
    return false;
  }

  this.getTile = function(x,y){
    if(this.terrain[x] && this.terrain[x][y]){
      return this.terrain[x][y];
    }else{
      return false;
    }
  }

  this.isClear = function(obj){
    for(x = obj.position.x; x < obj.position.x+(obj.size.x); x += config.gridInterval){
      for(y = obj.position.y; y < obj.position.y+(obj.size.y); y += config.gridInterval){
        if(this.terrain[x] && this.terrain[x][y]){
          return false;
        }
      }
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
    this.updatePower();
    for(r in resourceNetworks){
      resourceNetworks[r].update(this.resources,true);
    }
    for(r in resourceNetworks){
      resourceNetworks[r].update(this.resources,false);
    }
    for(r in this.rooms){
      this.rooms[r].update();
    }
  }

  this.updateResources = function(inv){
    for(var res in this.resources){
      var invCount = inv.itemCount(res);
      if(invCount){
        this.resources[res].current += invCount;
        inv.removeItem(res,invCount);
      }
    }
  }

  this.updatePower = function(){
    var capacity = 0;
    var yield = 0;
    for(var x in powerBuildings){
      for(var y in powerBuildings[x]){
        var pBuild = this.terrain[x][y];
        if(pBuild){
          switch(pBuild.type){
            case "container":
              capacity += pBuild.powerCapacity;
              break;
            case "generator":
              if(pBuild.solar){
                if(checkSolar(pBuild,this.terrain)){
                  yield += pBuild.powerYield;
                }
              }else{
                yield += pBuild.powerYield;
              }
              break;
          }
        }
      }
    }
    this.resources.power.current += yield;
    this.resources.power.max = capacity;
    if(this.resources.power.current >= capacity){
      this.resources.power.current = capacity;
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

  this.updateResourceNetwork = function(obj,markedContainers){
    var openNodes = {};
    var closedNodes = {};
    var cRooms = [];
    var cGens = [];
    var cContainers = [];
    var current = obj;
    var oxygenType = matchingAffinity(obj,{'resourceAffinities':["oxygen"]});
    addNode(current,openNodes);
    while(current){
      var x = current.position.x;
      var y = current.position.y;

      switch(current.type){
        case 'generator':
          cGens.push(current);
          break;
        case 'container':
          cContainers.push(current);
          addNode(current,markedContainers);
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
            if(node){
              if(oxygenType){
                var r = tileInRoom(node,this.rooms);
                if(r){
                  cRooms.push(r);
                }
              }
              if(resourceType(node) && matchingAffinity(obj,node)){
                if(!nodeExists(node,closedNodes) && !nodeExists(node,openNodes)){
                  addNode(node,openNodes);
                }
              }
            }
          }
        }
      }
      addNode(current,closedNodes);
      delete openNodes[current.position.x][current.position.y];
      var current = getNextNode(openNodes);
    }
    //handle lists
    if(cContainers.length > 0 && (cRooms.length > 0 || cGens.length > 0)){
      var uniqueIds = {};
      var uniqueRooms = [];
      for(r in cRooms){
        if(!uniqueIds[cRooms[r].id]){
          uniqueRooms.push(cRooms[r]);
          uniqueIds[cRooms[r].id] = true;
        }
      }
      return new ResourceNetwork(cRooms,cGens,cContainers,closedNodes,obj.resourceAffinities);
    }
    return false;
  }

  var getNextNode = function(nodes){
    for(var x in nodes){
     for(var y in nodes[x]){
       return nodes[x][y];
     }
    }
    return false;
  }

  var matchingAffinity = function(nodeA,nodeB){
    for(a in nodeA.resourceAffinities){
      for(b in nodeB.resourceAffinities){
        if(nodeA.resourceAffinities[a] == nodeB.resourceAffinities[b]){
          return true;
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
    for(x in containers){
      for(y in containers[x]){
        if(!(markedNodes[x] && markedNodes[x][y])){
          var ret = this.updateResourceNetwork(this.terrain[x][y],markedNodes);
          if(ret){
            rNets.push(ret);
          }
        }
      }
    }
    resourceNetworks = rNets;
  }

  this.regenRooms = function(){
    var newRooms = [];
    var rId = 0;
    for(x in airtightWalls){
      for(y in airtightWalls[x]){
        if(!tileInRoom(this.terrain[x][y],newRooms)){
          var rm = roomFinder.findRoom(~~x,~~y,this.terrain);
          if(rm.length > 0){
            if(uniqueRoom(rm,newRooms)){
              var newRoom = new Room(rm);
              var tRoom = tileInRoom(this.terrain[x][y],rooms);
              if(tRoom){
                newRoom.oxygen = tRoom.oxygen;
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

