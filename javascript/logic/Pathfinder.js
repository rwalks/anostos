Pathfinder = function() {

  var buildPath = function(node){
    var path = [];
    var current = node;
    while(current.parentNode){
      path.push([current.x,current.y]);
      current = current.parentNode;
    }
    return path;
  }

  var findCheapestNode = function(nodes){
    var cheapest = config.mapHeight;
    var ret = false;
    var count = 0;
    var xKeys = Object.keys(nodes);
    var xKey; var yKey;
    for(var nX = 0; nX < xKeys.length; nX++){
      xKey = xKeys[nX];
      var yKeys = Object.keys(nodes[xKey]);
      for(var nY = 0; nY < yKeys.length; nY++){
        yKey = yKeys[nY];
        count += 1;
        var nod = nodes[xKey][yKey];
        if(nod.costEst < cheapest){
         ret = nod;
         cheapest = nod.costEst;
        }
      }
    }
    return ret;
  }

  var estimateDistance = function(x,y,dX,dY){
   var e = utils.distance([x,y],[dX,dY]) / config.gridInterval;
    return e;
  }

  this.validSpace = function(nX,nY,terrain,size,climber,digger){
    var valid = {};
    var airborne = true;
    //for climbers check adjacent tiles for grip
    var iX = climber ? nX - config.gridInterval : nX;
    var iY = climber ? nY - config.gridInterval : nY;
    var mX = climber ? nX + size.x + config.gridInterval : nX + size.x;
    //check floor for all to see if airborne
    var mY = nY + size.y + config.gridInterval;
    for(var x=iX;x<mX;x+=config.gridInterval){
      for(var y=iY;y<mY;y+=config.gridInterval){
        var til = terrain.getTile(x,y);
        if(til){
          //til internal:
          if(x < nX+size.x && x >= nX && y < nY+size.y && y >= nY){
            var invalidDig = til.cost['rock'];
            if((!digger && !til.pathable) || (digger && invalidDig)){
              valid = false;
              break;
            }
          //til external:
          }else{
            airborne = airborne && til.pathable;
          }
        }
      }
      if(!valid){break;}
    }
    if(valid){
      valid.airborne = airborne;
   //   valid = (climber && airborne) ? false : valid;
    }
    return valid;
  }

  this.findValidSpace = function(coords,terrain,size){
    for(var nY = coords.y; nY > coords.y-(size.y*2); nY -= config.gridInterval){
      if(this.validSpace(coords.x,nY,terrain,size,false,false)){
        coords.y = nY;
        break;
      }
    }
    coords.y = this.collapseY(coords.x,coords.y,terrain,size,false,false);
    return coords;
  }

  this.findObjPath = function(obj,terrain,human){
    //find spot adjacent to obj
    var oX = utils.roundToGrid(obj.position.x);
    var oY = utils.roundToGrid(obj.position.y);
    var minX = oX - config.gridInterval;
    var maxX = oX + obj.size.x;
    var minY = oY - config.gridInterval;
    var maxY = oY + obj.size.y;
    var possibleSpaces = [[oX,oY],[oX,minY],[oX,maxY],[minX,oY],[maxX,oY]];
    var path = false;
    for(var ps = 0; ps < possibleSpaces.length; ps++){
      var tX = possibleSpaces[ps][0];
      var tY = possibleSpaces[ps][1];
      if(this.validSpace(tX,tY,terrain,human.size,false,false)){
        var newPath = this.findPath(tX,tY,terrain,human);
        if(!path || newPath.length < path.length){
          path = newPath;
        }
      }
    }
    return path;
  }

  this.findPath = function(destX,destY,terrain,obj){
    sX = utils.roundToGrid(obj.position.x);
    sY = utils.roundToGrid(obj.position.y);
    //if not climbing collapse to ground to avoid air jumping

    var maxHoriz = obj.jump.x;
    var maxVert = obj.jump.y;
    var openNodes = {};
    var closedNodes = {};
    var dX = utils.roundToGrid(destX);
    var dY = utils.roundToGrid(destY);
    var size = obj.size;
    size = obj.climber ? minimumSize(size) : size;
    var climber = obj.climber;
    var digger = obj.digger;
    var search = true;
    var validPath = false;
    var possibleSpaces = [[0,1],[0,-1],[1,0],[-1,0]];

    sY = climber ? sY : this.collapseY(sX,sY,terrain,size,climber,digger);
    var curNode = new Node(sX,sY);
    while(search){
      for(var ps = 0; ps < possibleSpaces.length; ps++){
        var tX = curNode.x + (possibleSpaces[ps][0] * config.gridInterval);
        var tY = curNode.y + (possibleSpaces[ps][1] * config.gridInterval);
        var spaceInfo = this.validSpace(tX,tY,terrain,size,climber,digger);
        if(spaceInfo){
          var hJump = curNode.horizJump;
          var vJump = curNode.vertJump;
          if(spaceInfo.airborne){
            //handle jumping
            if(tX != curNode.x){
              hJump += 1;
            }
            if(tY < curNode.y){
              vJump += 1;
            }
            var validJump = (hJump <= maxHoriz && vJump <= maxVert);
            if(!validJump){
              tY = this.collapseY(tX,tY,terrain,size,climber,digger);
              hJump = 0;
              vJump = 0;
            }
          }else{
            //grounded - reset jump
            hJump = 0;
            vJump = 0;
          }
          var dEstimate = estimateDistance(tX,tY,dX,dY);
          var next = new Node(tX,tY,hJump,vJump,curNode,dEstimate);
          considerNode(next,openNodes,closedNodes);
        }
      }
      //stop searching if no open nodes or digger with too many open nodes
      var timeoutSearch = (digger && Object.keys(closedNodes).length > 25) || (Object.keys(closedNodes).length > 200);
      curNode = findCheapestNode(openNodes);
      if(curNode && !timeoutSearch){
        delete openNodes[curNode.x][curNode.y];
        if(Object.keys(openNodes[curNode.x]).length < 1){delete openNodes[curNode.x];}
        addNode(curNode,closedNodes);
        if(curNode.x == dX && curNode.y == dY){
          validPath = true;
          search = false;
        }
      }else{
        search = false;
      }
    }
    return validPath ? buildPath(curNode) : [];
  }

  this.collapseY = function(x,y,terrain,size,climber,digger){
    for(var cY = y+config.gridInterval;cY < config.mapHeight;cY += config.gridInterval){
      var spaceInfo = this.validSpace(x,cY,terrain,size,climber,digger);
      if(!spaceInfo){
        return cY-config.gridInterval;
      }else if(!spaceInfo.airborne){
        return cY;
      }
    }
  }

  var considerNode = function(node,openList,closedList){
    if(!nodeExists(node,closedList)){
      if(nodeExists(node,openList)){
        if(node.cost < openList[node.x][node.y].cost){
          openList[node.x][node.y] = node;
        }
      }else{
        addNode(node,openList);
      }
    }
  }


  var nodeExists = function(node,nodeMap){
    return (nodeMap[node.x] && nodeMap[node.x][node.y]);
  }

  var addNode = function(node,nodeMap){
    nodeMap[node.x] = nodeMap[node.x] ? nodeMap[node.x] : {};
    nodeMap[node.x][node.y] = node;
  }

  var minimumSize = function(size){
    var min = Math.min(size.x,size.y);
    return {'x':min,'y':min};
  }
}


Node = function(pX,pY,hJump,vJump,pNode,estim){
  this.x = pX;
  this.y = pY;
  this.parentNode = pNode;
  this.horizJump = hJump ? hJump : 0;
  this.vertJump = vJump ? vJump : 0;
  this.cost = this.parentNode ? (this.parentNode.cost + 1) : 1;
  this.estimate = estim ? estim : 0;
  this.costEst = this.estimate + this.cost;
}
