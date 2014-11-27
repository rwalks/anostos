Roomfinder = function() {

  var size = {'x':1*config.gridInterval,'y':1*config.gridInterval};

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

  var validSpace = function(x,y,grid){
    if(grid[x] && grid[x][y] && grid[x][y].airtight){
      return true;
    }
    return false;
  }

  var estimateDistance = function(x,y,dX,dY){
    var e = Math.abs((dX - x) / size.x);
    e += Math.abs((dY - y) / size.y);
    return e;
  }


  this.findRoom = function(sX,sY,terrain){
    var openNodes = {};
    var closedNodes = {};
    var curNode = new Node(sX,sY);
    closedNodes = addNode(curNode,closedNodes);
    var dX = sX;
    var dY = sY;
    var path = [];

    var search = true;
    var dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    while(search){
      //check left + right, collapse to terrain, add to open
      for(i in dirs){
        path = [];
        var xoffset = dirs[i][0] * config.gridInterval;
        var yoffset = dirs[i][1] * config.gridInterval;
        var nX = curNode.x + xoffset;
        var nY = curNode.y + yoffset;
        if(validSpace(nX,nY,terrain)){
          var next = new Node(nX,nY,curNode);
          if(!nodeExists(next,closedNodes)){
            if(nodeExists(next,openNodes)){
              //complete room???
              var current = curNode;
              while(current){
                path.push([current.x,current.y]);
                current = current.parentNode;
              }

              var current = openNodes[next.x][next.y];
              while(current.parentNode){
                path.unshift([current.x,current.y]);
                current = current.parentNode;
              }

              if(path.length >= 8 && (path[1][0] != path[(path.length-2)][0]) && (path[1][1] != path[(path.length-2)][1])){
                var xDic = {};
                var yDic = {};
                for(i in path){
                  xDic[path[i][0]] = true;
                  yDic[path[i][1]] = true;
                }
                if(Object.keys(xDic).length >= 3 && Object.keys(yDic).length >= 3){
                  return path;
                }
              }
            }else{
              openNodes = addNode(next,openNodes);
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
        closedNodes = addNode(curNode,closedNodes);
      }
    }
    return [];
  }



  var nodeExists = function(node,nodeMap){
    return (nodeMap[node.x] && nodeMap[node.x][node.y]);
  }

  var addNode = function(node,nodeMap){
    nodeMap[node.x] = nodeMap[node.x] ? nodeMap[node.x] : {};
    nodeMap[node.x][node.y] = node;
    return nodeMap;
  }
}


Node = function(pX,pY,pNode){
  this.x = pX;
  this.y = pY;
  this.parentNode = pNode;
  this.cost = this.parentNode ? (this.parentNode.cost + 1) : 1;
  this.eCost = function(){
    return this.cost;
  }
}
