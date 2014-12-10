Terrain = function(trMap) {

  this.terrain = trMap ? trMap : {};
  
  var doors = {};
  var airtightWalls = {};
  var containers = {};
  var generators = {};

  this.getType = function(type){
    switch(type){
      case 'airtight':
        return airtightWalls;
    }
  }

  this.addTile = function(tile,remove){
    var regen = [];
    if(remove){
      if(tile.airtight){
        delete airtightWalls[tile.position.x][tile.position.y];
        this.regenRooms();
        regen.push('rooms');
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
        regen.push('rooms');
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

  this.drawMap = function(canvasBufferContext,camera,count){
    if(this.terrain){
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
    for(x in containers){
      for(y in containers[x]){
        this.updateResourceNetwork(containers[x][y]);
      }
    }
  }

  this.updateResourceNetwork(obj){
    var openNodes = {};
    var closedNodes = {};
    var rooms = [];
    var generators = [];
    var containers = [];
    var search = true;
    var current = obj;
    while(search == true;){
      var x = current.position.x;
      var y = current.position.x;

      switch(current.type){
        case 'generator':
          generators.push(current);
          break;
        case 'container':
          containers.push(current);
          break;
      }
      //search top and bottom
      for(var vx = x; vx < (x + current.size.x); x += config.gridInterval){
        for(var vy = y-config.gridInterval; vy < (y + current.size.y+config.gridInterval); y += config.gridInterval + current.size.y){
          var node = this.terrain[vx][vy];
          if(node && resourceType(node) && matchingAffinity(obj,node)){
            if(!nodeExists(node,closedNodes) && !nodeExists(node,openNodes)){
              addNode(node,openNodes);
            }
          }
        }
      }
      //search left/right
      for(var vx = x-configgridInterval; vx < (x + current.size.x); x += config.gridInterval){
        for(var vy = y-config.gridInterval; vy < (y + current.size.y+config.gridInterval); y += config.gridInterval + current.size.y){
          var node = this.terrain[vx][vy];
          if(node && resourceType(node) && matchingAffinity(obj,node)){
            if(!nodeExists(node,closedNodes) && !nodeExists(node,openNodes)){
              addNode(node,openNodes);
            }
          }
        }
      }
      addNode(current,closedNodes);
      delete openNodes[current.position.x][current.position.y];
      var current = getNextNode(openNodes);
      seach = current ? true : false;
    }

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
        if(nodeA[a] == nodeB[b]){
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
    return (nodeMap[node.x] && nodeMap[node.x][node.y]);
  }

  var addNode = function(node,nodeMap){
    nodeMap[node.x] = nodeMap[node.x] ? nodeMap[node.x] : {};
    nodeMap[node.x][node.y] = node;
  }


}

