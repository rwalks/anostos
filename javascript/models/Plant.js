Plant = function(pos) {
  this.position = pos;

  var height = config.gridInterval*0.4 + (Math.random() * (config.gridInterval*0.6));
  var angleChange = 10 + (Math.random() * 10);
  var swayMod = 0;
  var swayInc = (Math.random() > 0.5);

  var r = 150+Math.floor(Math.random()*100);
  var g = 150+Math.floor(Math.random()*100);
  var b = 150+Math.floor(Math.random()*100);

  var fillString = "rgba("+r+","+g+","+b+",0.8)";

  this.draw = function(camera,canvasBufferContext){
    canvasBufferContext.strokeStyle = fillString;
    swayMod = swayInc ? swayMod + 0.05 : swayMod - 0.05;
    if(swayMod >= 10){
     swayInc = false;
    }else if(swayMod <= 0){
     swayInc = true;
    }
    var x = this.position.x + config.terrainInterval/2;
    var y = this.position.y;
    this.drawTree(x,y,-90,5,camera,canvasBufferContext);
  }

  this.drawTree = function(x,y,angle,level,camera,canvasBufferContext){
  	if (level != 0){
      var x2 = x + (Math.cos(angle * (Math.PI / 180)) * level * height);
      var y2 = y + (Math.sin(angle * (Math.PI / 180)) * level * height);

      var ox = (x-camera.xOff)*config.xRatio;
      var oy = (y-camera.yOff)*config.yRatio;
      var ox2 = (x2-camera.xOff)*config.xRatio;
      var oy2 = (y2-camera.yOff)*config.yRatio;

      canvasBufferContext.beginPath();
      canvasBufferContext.moveTo(ox,oy);
      canvasBufferContext.lineTo(ox2,oy2);
      canvasBufferContext.closePath();
      canvasBufferContext.stroke();

      var dAngle = angleChange + swayMod;
      this.drawTree(x2, y2, angle - dAngle, level - 1, camera, canvasBufferContext);
      dAngle = angleChange - swayMod;
      this.drawTree(x2, y2, angle + dAngle, level - 1, camera, canvasBufferContext);
	  }
  }


}

