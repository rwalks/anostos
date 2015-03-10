HitBox = function(origin,size) {
  //non rotating hitbox
  var oX = origin.x;
  var oY = origin.y;
  var sX = oX + size.x;
  var sY = oY + size.y;

  this.points = [new Vector(oX,oY), new Vector(sX,oY), new Vector(sX,sY), new Vector(oX,sY)];

  this.pointWithin = function(x,y){
    return (x >= oX && x <= sX && y >= oY && y <= sY);
  }

}

RotHitBox = function(center,size,theta){
  //rotating hitbox
  var oX = -(size.x/2);
  var oY = -(size.y/2);
  var sX = (size.x/2);
  var sY = (size.y/2);

  this.points = [];

  var coords = [[oX,oY],[sX,oY],[sX,sY],[oX,sY]];
  for(var i = 0; i < coords.length; i++){
    var rotP = utils.rotate(coords[i][0],coords[i][1],theta);
    var x = center.x + rotP[0];
    var y = center.y + rotP[1];
    this.points.push(new Vector(x,y));
  }

  this.pointWithin = function(x,y){
    var inside = false;
    for (var i = 0, j = this.points.length - 1; i < this.points.length; j = i++) {
        var xi = this.points[i].x, yi = this.points[i].y;
        var xj = this.points[j].x, yj = this.points[j].y;
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
  }
}
