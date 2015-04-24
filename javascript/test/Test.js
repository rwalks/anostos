Test = function(){
  this.convert = function(arr){
    var minX; var maxX;
    var minY; var maxY;
    for(var i = 0; i < arr.length; i++){
      var p = arr[i];
      if(!i){
        minX = p[0]; maxX = p[0];
        minY = p[1]; maxY = p[1];
      }
      if(p[0] < minX){
        minX = p[0];
      }
      if(p[0] > maxX){
        maxX = p[0];
      }
      if(p[1] < minY){
        minY = p[1];
      }
      if(p[1] > maxY){
        maxY = p[1];
      }
    }
    var xDif = maxX - minX;
    var yDif = maxY - minY;
    var string = "[";
    for(var i = 0; i < arr.length; i++){
      string += i ? ",[" : "[";
      var x = round((arr[i][0] + (-1 * minX))/xDif);
      var y = round((arr[i][1] + (-1 * minY))/yDif);
      string += x+","+y+"]";
    }
    string += "]";
    console.log(string);
  }

  var round = function(x){
    return Math.round(x*100)/100;
  }

}
