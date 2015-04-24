TreeArt = function() {
  AnimatedCachedArt.call(this);

  this.frameCount = 30;
  this.size = new Vector(12*config.gridInterval,12*config.gridInterval);
  this.speed = 0.3;
  this.baseA = 0.6;

  this.drawFrame = function(frame){
    var lX = this.canvas.width;
    var lY = this.frameHeight;
    var oX = lX/2;
    var oY = (this.frameHeight * frame)+(lY*0.97);

    var sway = 3 + ((frame/this.frameCount) * -6);

    this.drawGroundShadow(frame);
    this.context.fillStyle = "rgba(10,10,150,0.8)";
  //  this.context.globalCompositeOperation = "xor";
    this.drawTree(oX,oY,-90,5,sway);
    //shading
    this.context.save();
    this.context.globalCompositeOperation = 'source-atop';
    //shade bottom
    var a = this.baseA;
    var yInt = -0.09;
    for(var y = 1; y > 0.1; y += yInt){
      yInt = Math.min(yInt*0.9,-0.001);
      var pY = oY - ((1-y) * lY);
      this.context.fillStyle = "rgba(0,0,0,"+a+")";
      this.context.beginPath();
      this.context.rect(0,pY,lX,yInt*lY);
      this.context.fill();
      a = a * (y > 0.5 ? 0.92 : 0.6);
    }
    this.context.restore();
  }

  this.drawGroundShadow = function(frame){
    var lX = this.canvas.width;
    var lY = this.frameHeight;
    var oX = lX * 0.1;
    var oY = (this.frameHeight * frame)+lY;
    //ground shadow
    var r = lX;
    var y = oY - (lY * 0.04);
    var dY = lY * 0.05;
    this.context.fillStyle = "rgba(0,0,0,0.3)";
    this.context.beginPath();
    this.context.moveTo(oX,y);
    this.context.bezierCurveTo(
               oX,y+dY,
               lX*0.9,y+dY,
               lX*0.9,y
    );
    this.context.bezierCurveTo(
               lX*0.9,y-dY,
               oX,y-dY,
               oX,y
    );
    this.context.fill();
  }

  var angleChange = 45;
  var treeGeo = [];

  this.drawTree = function(x,y,angle,level,sway){
  	if (level != 0){
      this.context.beginPath();
      this.context.moveTo(x,y);
      var width = (this.canvas.width * 0.05);
      var height = this.frameHeight * 0.06;
      var lX = level * width;
      var lY = level * height;
      var x2 = x + (Math.cos(angle * (Math.PI / 180)) * lX);
      var y2 = y + (Math.sin(angle * (Math.PI / 180)) * lY);
      var bases = [[x,y],[x2,y2]];
      var firstPoint;
      for(var b = 0; b < bases.length; b++){
        var cent = bases[b];
        var angles = b ? [270,90] : [90,270];
        lX = (level-b) * width/6;
        lY = (level-b) * height/6;
        for(var a = 0; a < angles.length; a++){
          var theta = angles[a] + angle;
          var bX = cent[0] + (Math.cos(theta * (Math.PI / 180)) * lX);
          var bY = cent[1] + (Math.sin(theta * (Math.PI / 180)) * lY);
          this.context.lineTo(bX,bY);
          if(!firstPoint){
            firstPoint = [bX,bY];
          }
        }
      }
      this.context.lineTo(firstPoint[0],firstPoint[1]);
      this.context.fill();
      //shade
      this.context.save();
      this.context.strokeStyle = "rgba(100,100,250,0.5)";
      this.context.lineWidth = lY * 0.5;
      this.context.beginPath();
      this.context.moveTo(x,y);
      this.context.lineTo(x2,y2);
      this.context.stroke();
      this.context.restore();

      sway = (sway * (0.9 + (Math.random()*0.1)));
      var dAngle = angle + sway;
      this.drawTree(x2, y2, dAngle - angleChange, level - 1, sway);
      this.drawTree(x2, y2, dAngle + angleChange, level - 1, sway);
      this.drawTree(x2, y2, dAngle, level - 1, sway);
      if(level != 5 && level > 3){
        this.drawTree(x2, y2, dAngle - (angleChange*2.5), 2, sway);
        this.drawTree(x2, y2, dAngle + (angleChange*2.5), 2, sway);
      }
    }
    if(level < 4){
      //leaves
      var leafRadius = level * Math.min(this.canvas.width,this.frameHeight) * (0.06 + (Math.random()*0.002));
      this.context.save();
      if(level > 2){
        this.context.globalCompositeOperation = "destination-over";
        leafRadius = leafRadius * 0.6;
      }
      this.context.beginPath();
      this.context.strokeStyle= "rgba(200,0,250,0.8)";
      this.context.fillStyle = "rgba(200,0,250,0.1)";
      this.context.arc(x,y,leafRadius,0*Math.PI,2*Math.PI,false);
      this.context.closePath();
      this.context.stroke();
      this.context.fill();
      this.context.restore();
    }
  }
}

ScrubArt = function() {
  AnimatedCachedArt.call(this);

  this.frameCount = 30;
  this.size = new Vector(2*config.gridInterval,2*config.gridInterval);
  this.baseA = 0.6;
  this.speed = 0.4;

  this.drawFrame = function(frame){
    var lX = this.canvas.width;
    var lY = this.frameHeight;
    var oX = lX/2;
    var oY = ((this.frameHeight * frame)+(lY*0.93));

    var sway = 5 + ((frame/this.frameCount) * -10);
    this.drawGroundShadow(frame);

    this.context.fillStyle = "rgba(200,200,0,0.7)";
    this.context.strokeStyle = "rgba(10,20,200,0.7)";
    this.drawTree(oX,oY,-65,4,sway);
    this.drawTree(oX,oY,-115,4,sway);
    this.drawTree(oX,oY,-103,4,sway);
    this.drawTree(oX,oY,-77,4,sway);
    this.drawTree(oX,oY,-90,4,sway);
    //shading
    this.context.save();
    this.context.globalCompositeOperation = 'source-atop';
    //shade bottom
    var a = this.baseA;
    var yInt = -0.09;
    for(var y = 1; y > 0.1; y += yInt){
      yInt = Math.min(yInt*0.9,-0.001);
      var pY = oY - ((1-y) * lY);
      this.context.fillStyle = "rgba(0,0,0,"+a+")";
      this.context.beginPath();
      this.context.rect(0,pY,lX,yInt*lY);
      this.context.fill();
      a = a * (y > 0.5 ? 0.6 : 0.3);
    }
    this.context.restore();
  }

  this.drawGroundShadow = function(frame){
    var lX = this.canvas.width;
    var lY = this.frameHeight;
    var oX = lX * 0.1;
    var oY = (this.frameHeight * frame)+lY;
    //ground shadow
    var r = lX;
    var y = oY - (lY * 0.07);
    var dY = lY * 0.08;
    this.context.fillStyle = "rgba(0,0,0,0.3)";
    this.context.beginPath();
    this.context.moveTo(oX,y);
    this.context.bezierCurveTo(
               oX,y+dY,
               lX*0.9,y+dY,
               lX*0.9,y
    );
    this.context.bezierCurveTo(
               lX*0.9,y-dY,
               oX,y-dY,
               oX,y
    );
    this.context.fill();
  }

  var angleChange = 45;
  var treeGeo = [];

  this.drawTree = function(x,y,angle,level,sway){
  	if (level != 0){
      var dAngle = angle + (sway*(0.7 + (Math.random()*0.3)));
      this.context.beginPath();
      this.context.moveTo(x,y);
      var width = (this.canvas.width * 0.085);
      var height = this.frameHeight * 0.085;
      var lX = level * width;
      var lY = level * height;
      var x2 = x + (Math.cos(dAngle * (Math.PI / 180)) * lX);
      var y2 = y + (Math.sin(dAngle * (Math.PI / 180)) * lY);
      var bases = [[x,y],[x2,y2]];
      var firstPoint;
      for(var b = 0; b < bases.length; b++){
        var cent = bases[b];
        var angles = b ? [270,90] : [90,270];
        lX = (level-b) * width/5;
        lY = (level-b) * height/5;
        for(var a = 0; a < angles.length; a++){
          var theta = angles[a] + angle;
          var bX = cent[0] + (Math.cos(theta * (Math.PI / 180)) * lX);
          var bY = cent[1] + (Math.sin(theta * (Math.PI / 180)) * lY);
          this.context.lineTo(bX,bY);
          if(!firstPoint){
            firstPoint = [bX,bY];
          }
        }
      }
      this.context.lineTo(firstPoint[0],firstPoint[1]);
      this.context.fill();
      this.context.stroke();

      this.drawTree(x2, y2, dAngle, level - 1, sway);
      if(level == 1){
        var leafRadius = Math.min(this.canvas.width,this.frameHeight) * (0.1 + (Math.random()*0.01));
        this.context.save();
        this.context.beginPath();
        var r = 100 + Math.floor(Math.random() * 20);
        var b = 200 + Math.floor(Math.random() * 20);
        this.context.strokeStyle= "rgba("+r+",0,"+b+",0.3)";
        this.context.fillStyle = "rgba("+r+",0,"+b+",0.4)";
        this.context.arc(x,y,leafRadius,0*Math.PI,2*Math.PI,false);
        this.context.closePath();
       // this.context.stroke();
        this.context.fill();
        this.context.restore();
      }
    }
  }
}

TreeArtS = function(){
  TreeArt.call(this);
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
  this.baseA = 0.9;
}

ScrubArtS = function(){
  ScrubArt.call(this);
  this.size.x = this.size.x * 0.6;
  this.size.y = this.size.y * 0.6;
  this.baseA = 0.9;
}

TreeArtM = function(){
  TreeArt.call(this);
  this.size.x = this.size.x * 0.8;
  this.size.y = this.size.y * 0.8;
  this.baseA = 0.9;
}

ScrubArtM = function(){
  ScrubArt.call(this);
  this.size.x = this.size.x * 0.8;
  this.size.y = this.size.y * 0.8;
  this.baseA = 0.9;
}

