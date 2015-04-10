AmmoArt = function() {

  var plasmaColor = new Color();

  this.drawBlastAmmo = function(x,y,buffCon){
    var rad = config.gridInterval / 2;
    plasmaColor.randomize('plasma');

    buffCon.fillStyle = plasmaColor.colorStr();
    buffCon.lineWidth = config.xRatio / 3;
    buffCon.beginPath();
    buffCon.arc(x,y,rad,0,2*Math.PI,false);
    buffCon.fill();
  }



}

