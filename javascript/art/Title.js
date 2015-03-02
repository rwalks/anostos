Title = function() {

  var counter = 0;
  var rdbaString;
  var xColor = {
    'r': Math.floor(Math.random() * 250),
    'g': Math.floor(Math.random() * 250),
    'b': Math.floor(Math.random() * 250),
    'rMod':(Math.random() * 6)-3,
    'gMod':(Math.random() * 6)-3,
    'bMod':(Math.random() * 6)-3
  };

  this.draw = function(canvasContext){
    var size = config.canvasWidth / 80;
    var x = (config.canvasWidth / 2) - (17 * size);
    var y = (config.canvasHeight / 2) - (15 * size);
    for (i = 0; i < 1; i++){
      drawLogo(size,x,y+(size * 6),canvasContext);
      x += size * 8;
      y += size * 1;
      size = size * 0.75
    }

  }

  var drawLogo = function(size,x,y,canvasContext){
    xColor.r += xColor.rMod;  if(xColor.r > 250 || xColor.r < 0){xColor.rMod = xColor.rMod * -1;}
    xColor.g += xColor.gMod;  if(xColor.g > 250 || xColor.g < 0){xColor.gMod = xColor.gMod * -1;}
    xColor.b += xColor.bMod;  if(xColor.b > 250 || xColor.b < 0){xColor.bMod = xColor.bMod * -1;}
    rgbaString = "rgba("+Math.floor(xColor.r)+","+Math.floor(xColor.g)+","+Math.floor(xColor.b)+",1.0)";
    canvasContext.font = size + 'px Courier';
    canvasContext.fillStyle = rgbaString;
    canvasContext.fillText("       -----------==\\\\\\     ///======\\\\\\     ///==-----------",x,size*1+y);
    canvasContext.fillText("      ---------------\\\\\\   ///........\\\\\\   ///---------------",x,size*2+y);
    canvasContext.fillText("     -----------------\\\\\\ ///..........\\\\\\ ///-----------------",x,size*3+y);
    canvasContext.fillStyle = 'rgba(50,250,0,1.0)';
    canvasContext.fillText("//====\\\\  //====\\\\  //====\\\\  //====\\\\  //====\\\\  //====\\\\  //====\\\\",x,size*5+y);
    canvasContext.fillText("||    ||  ||    ||  ||    ||  ||           ||     ||    ||  ||",x,size*6+y);
    canvasContext.fillText("||====||  ||    ||  ||    ||  \\\\====\\\\     ||     ||    ||  \\\\====\\\\",x,size*7+y);
    canvasContext.fillText("||    ||  ||    ||  ||    ||        ||     ||     ||    ||        ||",x,size*8+y);
    canvasContext.fillText("\\\\    //  \\\\    //  \\\\====//  \\\\====//     \\/     \\\\====//  \\\\====//",x,size*9+y);
    canvasContext.fillStyle = rgbaString;
    canvasContext.fillText("    ------------------/// \\\\\\........../// \\\\\\-----------------",x,size*11+y);
    canvasContext.fillText("     ----------------///   \\\\\\........///   \\\\\\---------------",x,size*12+y);
    canvasContext.fillText("      ------------==///     \\\\\\======///     \\\\\\==-----------",x,size*13+y);
    counter += 1;
    counter = (counter < 100) ? counter : 0;
  }

}

