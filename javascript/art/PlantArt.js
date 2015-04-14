TreeArt = function() {
  AnimatedCachedArt.call(this);

  this.frameCount = 30;
  this.size = new Vector(12*config.gridInterval,12*config.gridInterval);
  this.speed = 0.3;

  this.drawFrame = function(frameP){
    var lX = this.canvas.width;
    var lY = this.canvas.height / this.frameCount;
    var oX = lX/2;
    var oY = Math.floor((this.canvas.height * frameP)+lY);

    var sway = 3 + (frameP * -6);

    this.context.fillStyle = "rgba(10,10,150,0.8)";
  //  this.context.globalCompositeOperation = "xor";
    this.drawTree(oX,oY,-90,5,sway);
  }

  var angleChange = 45;
  var treeGeo = [];

  this.drawTree = function(x,y,angle,level,sway){
  	if (level != 0){
      this.context.beginPath();
      this.context.moveTo(x,y);
      var width = (this.canvas.width * 0.05);
      var height = (this.canvas.height/this.frameCount) * 0.065;
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
      var leafRadius = level * Math.min(this.canvas.width,this.canvas.height) * (0.06 + (Math.random()*0.002));
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

  this.frameCount = 20;
  this.size = new Vector(2*config.gridInterval,2*config.gridInterval);
  this.speed = 0.4;

  this.drawFrame = function(frameP){
    var lX = this.canvas.width;
    var lY = this.canvas.height / this.frameCount;
    var oX = lX/2;
    var oY = ((this.canvas.height * frameP)+(lY*0.95));

    var sway = 5 + (frameP * -10);

    this.context.fillStyle = "rgba(200,200,0,0.7)";
    this.context.strokeStyle = "rgba(10,20,200,0.7)";
    this.drawTree(oX,oY,-65,4,sway);
    this.drawTree(oX,oY,-115,4,sway);
    this.drawTree(oX,oY,-103,4,sway);
    this.drawTree(oX,oY,-77,4,sway);
    this.drawTree(oX,oY,-90,4,sway);
  }

  var angleChange = 45;
  var treeGeo = [];

  this.drawTree = function(x,y,angle,level,sway){
  	if (level != 0){
      var dAngle = angle + (sway*(0.7 + (Math.random()*0.3)));
      this.context.beginPath();
      this.context.moveTo(x,y);
      var width = (this.canvas.width * 0.085);
      var height = (this.canvas.height/this.frameCount) * 0.085;
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
      if(level == 2){
        this.drawTree(x2, y2, dAngle - angleChange, 1, sway);
        this.drawTree(x2, y2, dAngle + angleChange, 1, sway);
        this.drawTree(x2, y2, dAngle - (angleChange*2.5), 1, sway);
        this.drawTree(x2, y2, dAngle + (angleChange*2.5), 1, sway);
      }
    }
  }


}

