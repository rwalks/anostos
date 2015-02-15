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
   var e = config.distance([x,y],[dX,dY]) / config.gridInterval;
    return e;
  }

  this.validSpace = function(nX,nY,grid,size,climber,digger){
    var valid = true;
    var grip = false;
    var iX = climber ? nX - config.gridInterval : nX;
    var iY = climber ? nY - config.gridInterval : nY;
    var mX = climber ? nX + size.x + config.gridInterval : nX + size.x;
    var mY = climber ? nY + size.y + config.gridInterval : nY + size.y;
    for(var x=iX;x<mX;x+=config.gridInterval){
      for(var y=iY;y<mY;y+=config.gridInterval){
        if(x < nX+size.x && x >= nX && y < nY+size.y && y >= nY){
          if(grid[x] && grid[x][y]){
            var invalidDig = grid[x][y].cost['rock'];
            if((!digger && !grid[x][y].pathable) || (digger && invalidDig)){
              valid = false;
              break;
            }
          }
        }else if(climber && grid[x] && grid[x][y]){
          grip = grip || !grid[x][y].pathable;
        }
      }
      if(!valid){break;}
    }
    if(climber && !grip){
      valid = false;
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

  this.findPath = function(sX,sY,destX,destY,terrain,jump,siz,climber,digger){
    sX = sX - (sX % config.gridInterval);
    sY = sY - (sY % config.gridInterval);
    var maxJump = jump ? jump : 6;
    var openNodes = {};
    var closedNodes = {};
    var curNode = new Node(sX,sY);
    var dX = destX - (destX % config.gridInterval);
    var dY = destY - (destY % config.gridInterval);
    var size = siz ? siz : {'x':1*config.gridInterval,'y':2*config.gridInterval};
    size = climber ? minimumSize(size) : size;
    //search above destination for valid space
    var search = true;
    var validPath = false;
    while(search){
      //check + add above to open if height below maxJump
      var nY = curNode.y-config.gridInterval;
      var validHeight = climber ? true : (curNode.height < maxJump);
      if(validHeight && this.validSpace(curNode.x,nY,terrain,size,climber,digger)){
        var dEstimate = estimateDistance(curNode.x,nY,dX,dY);
        var next = new Node(curNode.x,nY,curNode,dEstimate);
        considerNode(next,openNodes,closedNodes);
      }
      //check below
      var nY = curNode.y+size.y;
      if(this.validSpace(curNode.x,nY,terrain,size,climber,digger)){
        var dEstimate = estimateDistance(curNode.x,nY,dX,dY);
        var next = new Node(curNode.x,nY,curNode,dEstimate);
        considerNode(next,openNodes,closedNodes);
      }
      //check left + right, collapse to terrain, add to open
      for(var i = 1; i >= -1; i -= 2){
        var offset = i * size.x;
        var nX = curNode.x + offset;
        if(this.validSpace(nX,curNode.y,terrain,size,climber,digger)){
          var dEstimate = estimateDistance(nX,curNode.y,dX,dY);
          var next = new Node(nX,curNode.y,curNode,dEstimate);
          considerNode(next,openNodes,closedNodes);
        }
      }
      //stop searching if no open nodes or digger with too many open nodes
      var timeoutSearch = (digger && Object.keys(closedNodes).length > 25) || (climber && Object.keys(closedNodes).length > 100);
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

  this.collapseY = function(x,y,map,size,climber,digger){
    for(var cY = y+size.y;cY < config.mapHeight;cY += size.y){
      if(!this.validSpace(x,cY,map,size,climber,digger)){
        return cY - size.y;
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


Node = function(pX,pY,pNode,estim){
  this.x = pX;
  this.y = pY;
  this.parentNode = pNode;
  this.height = pNode ? ((pY < pNode.y) ? pNode.height + 1 : 0) : 0;
  this.cost = this.parentNode ? (this.parentNode.cost + 1) : 1;
  this.estimate = estim ? estim : 0;
  this.costEst = this.estimate + this.cost;
}
