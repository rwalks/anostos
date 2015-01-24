Room = function(points) {

  this.id = 0;
  this.points = points;

  this.polygon;

  this.oxygen = 0;
  this.maxOxygen = 20;

  this.update = function(){

  }

  this.pointWithin = function(x,y,points){
    var pts = points ? points : this.polygon;
    var inside = false;
    for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var xi = pts[i][0], yi = pts[i][1];
        var xj = pts[j][0], yj = pts[j][1];
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
  }

  this.draw = function(camera,canvasBufferContext){
    var dr = 200 - Math.floor((this.oxygen / this.maxOxygen) * 190);
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = "rgba("+dr+",10,10,0.2)";

    var x = (this.polygon[0][0] - camera.xOff) * config.xRatio;
    var y = (this.polygon[0][1] - camera.yOff) * config.yRatio;
    canvasBufferContext.moveTo(x,y);
    var points = this.polygon;
    for(i in points){
      x = (points[i][0] - camera.xOff) * config.xRatio;
      y = (points[i][1] - camera.yOff) * config.yRatio;
      canvasBufferContext.lineTo(x,y);
    }
    var x = (this.polygon[0][0] - camera.xOff) * config.xRatio;
    var y = (this.polygon[0][1] - camera.yOff) * config.yRatio;
    canvasBufferContext.lineTo(x,y);
    canvasBufferContext.fill();

  }

  var poly = function(pts){
    var path = [];
    var pushDirs = [[0,0],[0,1],[1,1],[1,0],[0,0]];
    for(i in pts){
      for(d in pushDirs){
        var xOff = pushDirs[d][0] * config.gridInterval;
        var yOff = pushDirs[d][1] * config.gridInterval;
        path.push([pts[i][0]+xOff,pts[i][1]+yOff]);
      }
    }
    return path;
  }

  this.cullPath = function(path){
    var cleanPath = [];
    for(p in path){
      if(!this.pointWithin(path[p][0],path[p][1],path)){
        var dupe = false;
        for(c in cleanPath){
          if((path[p][0] == cleanPath[c][0]) && (path[p][1] == cleanPath[c][1])){
            dupe = true;
          }
        }
        if(!dupe){
          cleanPath.push(path[p]);
        }
      }
    }
    return cleanPath;
  }
  //this.polygon = this.cullPath(poly(points));
  this.polygon = poly(points);

}

