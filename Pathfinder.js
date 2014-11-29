Pathfinder = function() {

  var size = {'x':1*config.gridInterval,'y':2*config.gridInterval};

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

  var validSpace = function(nX,nY,grid){
    var valid = true;
    for(var x=nX;x<nX+size.x;x+=config.gridInterval){
      for(var y=nY;y<nY+size.y;y+=config.gridInterval){
        if(grid[x] && grid[x][y] && !grid[x][y].pathable){
          valid = false;
          break;
        }
      }
      if(!valid){break;}
    }
    return valid;
  }

  var estimateDistance = function(x,y,dX,dY){
    var e = Math.abs((dX - x) / size.x);
    e += Math.abs((dY - y) / size.y);
    return e;
  }


  this.findPath = function(sX,sY,destX,destY,terrain){
    sX = sX - (sX % config.gridInterval);
    sY = sY - (sY % config.gridInterval);
    var maxJump = 6;
    var openNodes = {};
    var closedNodes = {};
    var curNode = new Node(sX,sY);
    var dX = destX - (destX % size.x);
    var dY = destY - (destY % size.y);
    dY = collapseY(dX,dY,terrain);


    var search = true;
    var validPath = false;
    var dirs = [1,-1];
    while(search){
      //check + add above to open if height below maxJump
      var nY = curNode.y-config.gridInterval;
      if(curNode.height < maxJump && validSpace(curNode.x,nY,terrain)){
        var next = new Node(curNode.x,nY,curNode,estimateDistance(curNode.x,nY,dX,dY));
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
        var offset = dirs[i] * config.gridInterval;
        var nX = curNode.x + offset;
        if(validSpace(nX,curNode.y,terrain)){
          var nY = collapseY(nX,curNode.y,terrain);
          if(validSpace(nX,nY,terrain)){
            var next = new Node(nX,nY,curNode,estimateDistance(nX,nY,dX,dY));
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
      if(Object.keys(openNodes).length < 1){
        search = false;
      }else{
        curNode = findCheapestNode(openNodes);
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

  var collapseY = function(x,y,map){
    for(cY = y+config.gridInterval;cY < config.mapHeight;cY += config.gridInterval){
      if(!validSpace(x,cY,map)){
        return cY - config.gridInterval;
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
