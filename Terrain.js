Terrain = function(trMap) {

  this.terrain = trMap ? trMap : {};
//construct holders
  var rooms = [];
  var resourceNetworks = [];
//tile reference holders
  var doors = {};
  var airtightWalls = {};
  var containers = {};
  var generators = {};
//
  var updateCount = 0;
  var resourceUpdateInterval = 5;
  var roomFinder = new Roomfinder();

  this.addTile = function(tile,remove){
    var regen = [];
    regen.push('rooms');
    if(remove){
      if(tile.airtight){
        delete airtightWalls[tile.position.x][tile.position.y];
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

  this.update = function(humans){
    for(x in doors){
      for(y in doors[x]){
        this.terrain[x][y].update(humans);
      }
    }
    if(updateCount >= resourceUpdateInterval){
      this.updateBuildings();
      updateCount = 0;
    }else{
      updateCount += 1;
    }

  }

  this.getTile = function(x,y){
    if(this.terrain[x] && this.terrain[x][y]){
      return this.terrain[x][y];
    }else{
      return false;
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
      for (r in rooms){
        rooms[r].draw(camera,canvasBufferContext);
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
    for(r in resourceNetworks){
      resourceNetworks[r].update(true);
    }
    for(r in resourceNetworks){
      resourceNetworks[r].update(false);
    }
    for(r in rooms){
      rooms[r].update();
    }
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
                var r = tileInRoom(node,rooms);
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
              rm.id = rId;
              newRooms.push(new Room(rm));
              rId += 1;
            }
          }
        }
      }
    }
    rooms = newRooms;
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

  var inARoom = function(x,y,roomArray){
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

