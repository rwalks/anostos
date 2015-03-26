var convert = function(arr){
  var minX;
  var minY;
  for(var i; i < arr.length; i++){
    var p = arr[i];
    if(!minX || p[0] < minX){
      minX = p[0];
    }
    if(!minY || p[1] < minY){
      minY = p[1];
    }
  }
  var newArray = [];
  for(var i; i < arr.length; i++){
    var x = arr[i][0] + (-1 * minX);
    var y = arr[i][1] + (-1 * minY);
    newArray.push([x,y]);
  }
  console.log(newArray);
}
