ButtonArt = function(){
  Art.call(this);

  this.draw = function(button,canvasContext){
    var size = utils.ratioCoords(button.size);
    var pos = utils.ratioCoords(button.position);
    var active = button.active;
    this.drawBg(size,pos,active,canvasContext);
    this.drawIcon(size,pos,canvasContext);
  }

  this.drawIcon = function(size,pos,canvasContext){};

  this.drawBg = function(size,pos,active,canvasContext){
    var aRed = active ? 200 : 0;
    canvasContext.fillStyle = "rgba("+aRed+",50,100,0.9)";
    canvasContext.strokeStyle="rgba("+aRed+",50,175,1.0)";
    canvasContext.beginPath();
    canvasContext.rect(pos.x,pos.y,size.x,size.y);
    canvasContext.stroke();
    canvasContext.fill();
  }
}

WeaponButtonArt = function(){
  ButtonArt.call(this);
  this.drawIcon = function(size,pos,canvasContext){
    var cX = pos.x + (size.x/2);
    var cY = pos.y + (size.y/2);
    var buttonSize = Math.min(size.x,size.y);
    canvasContext.strokeStyle="rgba(250,250,250,1.0)";
    canvasContext.beginPath();
    canvasContext.moveTo(cX + (buttonSize * -0.3), cY + (buttonSize * 0.0));
    canvasContext.lineTo(cX + (buttonSize * 0.3), cY + (buttonSize * 0.0));
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(cX + (buttonSize * 0.0), cY + (buttonSize * -0.3));
    canvasContext.lineTo(cX + (buttonSize * 0.0), cY + (buttonSize * 0.3));
    canvasContext.stroke();

    canvasContext.beginPath();
    var circRad = buttonSize * 0.2;
    canvasContext.arc(cX,cY,circRad,0,2*Math.PI,false);
    canvasContext.stroke();
  }
}

RepairButtonArt = function(){
  ButtonArt.call(this);
  this.drawIcon = function(size,pos,canvasContext){
    var cX = pos.x + (size.x/2);
    var cY = pos.y + (size.y/2);
    var buttonSize = Math.min(size.x,size.y);
    canvasContext.fillStyle = "rgba(250,250,250,0.9)";
    canvasContext.strokeStyle="rgba(250,250,250,1.0)";
    canvasContext.beginPath();
    canvasContext.moveTo(cX + (buttonSize * -0.3), cY + (buttonSize * 0.3));
    canvasContext.lineTo(cX + (buttonSize * -0.2), cY + (buttonSize * 0.3));
    canvasContext.lineTo(cX + (buttonSize * 0.1), cY + (buttonSize * 0.0));
    canvasContext.lineTo(cX + (buttonSize * 0.3), cY + (buttonSize * 0.0));
    canvasContext.lineTo(cX + (buttonSize * 0.3), cY + (buttonSize * -0.2));
    canvasContext.lineTo(cX + (buttonSize * 0.2), cY + (buttonSize * -0.1));
    canvasContext.lineTo(cX + (buttonSize * 0.1), cY + (buttonSize * -0.2));
    canvasContext.lineTo(cX + (buttonSize * 0.2), cY + (buttonSize * -0.3));
    canvasContext.lineTo(cX + (buttonSize * 0.0), cY + (buttonSize * -0.3));
    canvasContext.lineTo(cX + (buttonSize * 0.0), cY + (buttonSize * -0.1));
    canvasContext.lineTo(cX + (buttonSize * -0.3), cY + (buttonSize * 0.2));
    canvasContext.lineTo(cX + (buttonSize * -0.3), cY + (buttonSize * 0.3));
    canvasContext.fill();
    canvasContext.stroke();
  }
}

DeleteButtonArt = function(){
  ButtonArt.call(this);
  this.drawIcon = function(size,pos,canvasContext){
    var cX = pos.x + (size.x/2);
    var cY = pos.y + (size.y/2);
    var buttonSize = Math.min(size.x,size.y);
    canvasContext.strokeStyle="rgba(250,250,250,1.0)";
    canvasContext.beginPath();
    canvasContext.moveTo(cX + (buttonSize * -0.2), cY + (buttonSize * 0.2));
    canvasContext.lineTo(cX + (buttonSize * 0.2), cY + (buttonSize * -0.2));
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.moveTo(cX + (buttonSize * -0.2), cY + (buttonSize * -0.2));
    canvasContext.lineTo(cX + (buttonSize * 0.2), cY + (buttonSize * 0.2));
    canvasContext.stroke();
    canvasContext.beginPath();
    canvasContext.rect(cX + (buttonSize * -0.3), cY + (buttonSize * -0.3),buttonSize*0.6,buttonSize*0.6);
    canvasContext.stroke();
  }
}


LightButtonArt = function(){
  ButtonArt.call(this);
  //var lightGeo = [[-0.2,-0.15],[-0.1,-0.15],[0,-0.1],[0.3,-0.1],[0.3,0.1],[0,0.1],[-0.1,0.15],[-0.2,0.15],[-0.2,-0.2]];
  var lightGeo = [[0,0.3],[-0.075,0.25],[-0.075,0.1],[0.075,0.1],[0.075,0.25]];
  var lightLine = [[0.28,0.23,0.2,0.1],[0.35,-0.05,0.25,-0.05],[0.3,-0.3,0.2,-0.2]];
  this.drawIcon = function(size,pos,canvasContext){
    canvasContext.save();
    var cX = pos.x + (size.x/2);
    var cY = pos.y + (size.y/2);
    var origin = new Vector(cX,cY);
    var buttonSize = Math.min(size.x,size.y);
    var bSize = new Vector(buttonSize,buttonSize);
    canvasContext.fillStyle = "rgba(250,250,250,0.9)";
    canvasContext.strokeStyle="rgba(250,250,250,1.0)";
    this.drawGeo(lightGeo,origin,bSize,canvasContext,true,false);
    canvasContext.beginPath();
    var circRad = buttonSize * 0.15;
    var oY = cY - (0.05*buttonSize);
    canvasContext.arc(cX,oY,circRad,0,2*Math.PI,false);
    canvasContext.stroke();
    //light beams
    canvasContext.lineWidth = config.minRatio/2;
    for(var l = 0; l < lightLine.length; l++){
      var line = lightLine[l];
      for(var xFlip = -1; xFlip <= 1; xFlip += 2){
        canvasContext.beginPath();
        canvasContext.moveTo(cX + (buttonSize * line[0] * xFlip), cY + (buttonSize * line[1]));
        canvasContext.lineTo(cX + (buttonSize * line[2] * xFlip), cY + (buttonSize * line[3]));
        canvasContext.stroke();
      }
    }
    canvasContext.beginPath();
    canvasContext.moveTo(cX + (buttonSize * 0), cY + (buttonSize * -0.4));
    canvasContext.lineTo(cX + (buttonSize * 0), cY + (buttonSize * -0.3));
    canvasContext.stroke();
    canvasContext.restore();
  }
}
/*

ButtonArt = function(){
  ButtonArt.call(this);
  this.drawIcon = function(size,pos,canvasContext){
    var cX = pos.x + (size.x/2);
    var cY = pos.y + (size.y/2);
    var buttonSize = Math.min(size.x,size.y);
  }
}

ButtonArt = function(){
  ButtonArt.call(this);
  this.drawIcon = function(size,pos,canvasContext){
    var cX = pos.x + (size.x/2);
    var cY = pos.y + (size.y/2);
    var buttonSize = Math.min(size.x,size.y);
  }
}
*/
