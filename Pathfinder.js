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
    var ret;
    var count = 0;
    for(var nX in nodes){
      for(var nY in nodes[nX]){
        count += 1;
        if(nodes[nX][nY].eCost() < cheapest){
         ret = nodes[nX][nY];
         cheapest = nodes[nX][nY].eCost();
        }
      }
    }
    return ret;
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

  var estimateDistance = function(x,y,dX,dY,size){
    var e = Math.abs((dX - x) / size.x);
    e += Math.abs((dY - y) / size.y);
    return e;
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
    //find natural height
    if(!digger){
      for(var nY = dY; nY > dY-(size.y*2); nY -= config.gridInterval){
        if(this.validSpace(dX,nY,terrain,size,climber,digger)){
          dY = nY;
          break;
        }
      }
      dY = this.collapseY(dX,dY,terrain,size,climber,digger);
    }

    var search = true;
    var validPath = false;
    var dirs = [1,-1];
    while(search){
      //check + add above to open if height below maxJump
      var nY = curNode.y-config.gridInterval;
      var validHeight = climber ? true : (curNode.height < maxJump);
      if(validHeight && this.validSpace(curNode.x,nY,terrain,size,climber,digger)){
        var next = new Node(curNode.x,nY,curNode,estimateDistance(curNode.x,nY,dX,dY,size));
        if(!nodeExists(next,closedNodes)){
          if(nodeExists(next,openNodes)){
            if(next.eCost() < openNodes[next.x][next.y].eCost()){
              openNodes[next.x][next.y] = next;
            }
          }else{
            addNode(next,openNodes);
          }
        }
      }
      //check below
      var nY = curNode.y+size.y;
      if(this.validSpace(curNode.x,nY,terrain,size,climber,digger)){
        var next = new Node(curNode.x,nY,curNode,estimateDistance(curNode.x,nY,dX,dY,size));
        if(!nodeExists(next,closedNodes)){
          if(nodeExists(next,openNodes)){
            if(next.eCost() < openNodes[next.x][next.y].eCost()){
              openNodes[next.x][next.y] = next;
            }
          }else{
            addNode(next,openNodes);
          }
        }
      }
      //check left + right, collapse to terrain, add to open
      for(i in dirs){
        var offset = dirs[i] * size.x;
        var nX = curNode.x + offset;
        if(this.validSpace(nX,curNode.y,terrain,size,climber,digger)){
          var nY = digger ? nY : this.collapseY(nX,curNode.y,terrain,size,climber,digger);
          if(this.validSpace(nX,nY,terrain,size,climber,digger)){
            var next = new Node(nX,nY,curNode,estimateDistance(nX,nY,dX,dY,size));
            if(!nodeExists(next,closedNodes)){
              if(nodeExists(next,openNodes)){
                if(next.eCost() < openNodes[next.x][next.y].eCost()){
                  openNodes[next.x][next.y] = next;
                }
              }else{
                addNode(next,openNodes);
              }
            }
          }
        }
      }
      //stop searching if no open nodes or digger with too many open nodes
      if(Object.keys(openNodes).length < 1 || (digger && Object.keys(closedNodes).length > 50) || (climber && Object.keys(closedNodes).length > 500)){
        search = false;
      }else{
        curNode = findCheapestNode(openNodes);
        if(!curNode){
          return [];
        }
        delete openNodes[curNode.x][curNode.y];
        if(Object.keys(openNodes[curNode.x]).length < 1){delete openNodes[curNode.x];}
        addNode(curNode,closedNodes);

        if(curNode.x == dX && curNode.y == dY){
          validPath = true;
          search = false;
        }
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
  var estimate = estim ? estim : 0;
  this.eCost = function(){
    return this.cost + estimate;
  }
}
