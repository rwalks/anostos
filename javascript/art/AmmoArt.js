AmmoArt = function() {

  this.drawBlastAmmo = function(x,y,buffCon){
    var rad = config.gridInterval / 2;
    var r = Math.floor(Math.random() * 155) + 100;
    var g = Math.floor(Math.random() * 155) + 100;
    var b = Math.floor(Math.random() * 155) + 100;
    var rgbStr = "rgba("+r+","+g+","+b+",0.9)";

    buffCon.fillStyle = rgbStr;
    buffCon.strokeStyle= "rgba(255,0,255,1.0)";
    buffCon.lineWidth = config.xRatio / 3;
    buffCon.beginPath();
    buffCon.arc(x,y,rad,0,2*Math.PI,false);
    buffCon.fill();
    buffCon.stroke();
  }



}

