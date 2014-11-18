Explosion = function(x,y) {

  this.position = {'x':x,'y':y};
  var count = 0;
  var maxCount = 100;
  var circles = [];
  for(i=0;i<4;i++){
    var cX = this.position.x + (Math.random()*6-3);
    var cY = this.position.y + (Math.random()*6-3);
    var r = 100 + Math.floor(Math.random() * 100);
    var g = 20 + Math.floor(Math.random() * 50);
    var b = Math.floor(Math.random() * 20);
    var rgb = "rgba("+r+","+g+","+b+",0.6)";
    var duration = (maxCount / 2) + (Math.random() * (maxCount/2));
    var size = Math.floor(Math.random() * (config.canvasHeight/20));
    circles.push([cX,cY,rgb,duration,size]);
  }


  this.update = function(){
    count += 1;
    return (count > maxCount);
  }

  this.draw = function(camera,canvasBufferContext){
    for(c in circles){
      var circ = circles[c];
      if(count < circ[3]){
        var x = (circ[0]-camera.xOff) * config.xRatio;
        var y = (circ[1]-camera.yOff) * config.yRatio;
        console.log(x+" " + y + " " + (circ[4] + count) + " " );
        canvasBufferContext.beginPath();
        canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
        canvasBufferContext.fillStyle = circ[2];
        canvasBufferContext.strokeStyle= "rgba(250,0,0,0.8)";
        canvasBufferContext.arc(x,y,circ[4]+count,0,2*Math.PI,false);
        canvasBufferContext.fill();
        canvasBufferContext.stroke();
      }
    }
  }

}

