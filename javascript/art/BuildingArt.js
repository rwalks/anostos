BuildingArt = function(){

  this.drawHealthIcon = function(x,y,count,obj,canvasBufferContext){
    var healthPercent = obj.currentHealth / obj.maxHealth;
    count = count % 100;
    var modCount = (count >= 50) ? (100-count) : count;
    var a = 0.6 + (0.2 * (modCount/50));
    var r=0;var g=0;var b=0;
    if(healthPercent < (1/3)){
      r = 150 + ((healthPercent / (1/3)) * 155);
    }else if(healthPercent < (2/3)){
      r = 255;
      g = ((3*healthPercent) - 1) * 255;
    }else{
      r = 255 - (((3*healthPercent) - 2) * 255);
      g = 255;
    }
    var fillColor = new Color(r,g,b,a);
    var minSize = Math.min(obj.size.x,obj.size.y);
    var lX = minSize * config.xRatio;
    var lY = minSize * config.yRatio;
    var oX = x + ((obj.size.x/2) * config.xRatio);
    var oY = y + ((obj.size.y/2) * config.yRatio);
    var theta = (count / 100) * 2*Math.PI;
    var geometry = [
      [ 0, 0.32 ],
      [ 0.07, 0.25 ],
      [ 0.07, -0.07 ],
      [ 0.14, -0.14 ],
      [ 0.14, -0.32 ],
      [ 0.07, -0.32 ],
      [ 0.07,-0.21 ],
      [ 0,-0.14 ],
      [ -0.07,-0.21 ],
      [ -0.07, -0.32 ],
      [ -0.14, -0.32 ],
      [ -0.14,-0.14 ],
      [ -0.07,-0.07 ],
      [ -0.07,0.25 ]
    ];
    var firstPoint;
    canvasBufferContext.fillStyle = fillColor.colorStr();
    canvasBufferContext.strokeStyle="rgba(200,200,250,1.0)";
    canvasBufferContext.lineWidth=config.xRatio/2;
    canvasBufferContext.beginPath();
    for(var i = 0; i < geometry.length; i++){
      var points = utils.rotate(geometry[i][0],geometry[i][1],theta);
      var eX = oX+(points[0]*lX);
      var eY = oY+(points[1]*lY);
      if(i == 0){
        canvasBufferContext.moveTo(eX,eY);
        firstPoint = [eX,eY];
      }else{
        canvasBufferContext.lineTo(eX,eY);
      }
    }
    canvasBufferContext.lineTo(firstPoint[0],firstPoint[1]);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawChemicalBattery = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    for(var ex=oX+(lX*0.1);ex<oX+(lX*0.8);ex+=lX*0.2){
      var dr = obj.active ? Math.floor(Math.random() * 50) : 0;
      var dg = obj.active ? Math.floor(Math.random() * 50) : 0;
      var db = obj.active ? Math.floor(Math.random() * 50) : 0;
      var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
      var rgbaString = "rgba("+(200+dr)+","+(200+dg)+","+(80+db)+","+da+")";
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(ex,oY+lY*0.1,lX*0.2,lY*0.8);
      canvasBufferContext.fill();
    }
    var capRGB = "rgba(180,180,190,"+alpha+")";
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = capRGB;
    canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
    canvasBufferContext.moveTo(oX,oY);
    var points = [[lX,0],[lX,lY*0.1],[lX*0.9,lY*0.15],[lX/2,lY*0.25],[lX*0.1,lY*0.15],[0,lY*0.1],[0,0]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //bottomCap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.moveTo(oX+lX,oY+lY);
    var points = [[lX,lY*0.9],[lX*0.9,lY*0.85],[lX*0.5,lY*0.75],[lX*0.1,lY*0.85],[0,lY*0.9],[0,lY],[lX,lY]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawWaterCistern = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    //energybarz
    var points = [[lX*0.3,lY*0.1],[lX*0.1,lY*0.3],[lX*0.3,lY*0.6],[lX*0.6,lY*0.3]];
    for(p in points){
      var db = obj.active ? Math.floor(Math.random() * 50) : 0;
      var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
      var rgbaString = "rgba(0,0,"+(200+db)+","+da+")";
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      var sX; var sY;
      if(p == 0 || p == 2){
        sX = lX * 0.4;
        sY = lY * 0.3;
      }else{
        sX = lX * 0.3;
        sY = lY * 0.4;
      }
      canvasBufferContext.rect(oX+points[p][0],oY+points[p][1],sX,sY);
      canvasBufferContext.fill();

    }
    var capRGB = "rgba(180,180,190,"+alpha+")";
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = capRGB;
    canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
    canvasBufferContext.moveTo(oX+lX*0.2,oY);
    var points = [[lX*0.3,0],[lX*0.3,lY*0.2],[lX*0.5,lY*0.4],[lX*0.7,lY*0.2],[lX*0.7,0],[lX*0.8,0],[lX*0.8,lY*0.1],[lX*0.9,lY*0.2],[lX,lY*0.2],[lX,lY*0.3],[lX*0.8,lY*0.3],[lX*0.6,lY*0.5],[lX*0.8,lY*0.7],[lX,lY*0.7],[lX,lY*0.8],[lX*0.9,lY*0.8],[lX*0.8,lY*0.9],[lX*0.8,lY],[lX*0.7,lY],[lX*0.7,lY*0.8],[lX*0.5,lY*0.6],[lX*0.3,lY*0.8],[lX*0.3,lY],[lX*0.2,lY],[lX*0.2,lY*0.9],[lX*0.1,lY*0.8],[0,lY*0.8],[0,lY*0.7],[lX*0.2,lY*0.7],[lX*0.4,lY*0.5],[lX*0.2,lY*0.3],[0,lY*0.3],[0,lY*0.2],[lX*0.1,lY*0.2],[lX*0.2,lY*0.1],[lX*0.2,0]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawOxygenTank = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    var capRGB = "rgba(180,180,190,"+alpha+")";
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = capRGB;
    canvasBufferContext.strokeStyle= "rgba(100,100,100,1.0)";
    canvasBufferContext.moveTo(oX+lX*0.4,oY);
    var points = [[lX*0.4,lY*0.05],[0,lY*0.15],[0,lY*0.85],[lX*0.4,lY*0.95],[lX*0.4,lY],[lX*0.6,lY],[lX*0.6,lY*0.95],[lX,lY*0.85],[lX,lY*0.15],[lX*0.6,lY*0.05],[lX*0.6,0],[lX*0.4,0]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //energybarz
    for(var ey=oY+(lY*0.25);ey<oY+(lY*0.6);ey+=lY*0.3){
      var dr = obj.active ? Math.floor(Math.random() * 30) : 0;
      var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
      var rgbaString = "rgba("+(230+dr)+","+(230+dr)+","+(230+dr)+","+da+")";
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(oX,ey,lX,lY*0.2);
      canvasBufferContext.fill();
    }
  }

  this.drawDryStorage = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle= "rgba(200,50,70,"+alpha+")";
    canvasBufferContext.strokeStyle= "rgba(200,150,100,1.0)";
    canvasBufferContext.moveTo(oX,oY);
    var points = [
      [lX*0.1,0],[lX*0.15,lY*-0.05],[lX*0.35,lY*-0.05],[lX*0.4,0],[lX*0.6,0],[lX*0.65,lY*-0.05],[lX*0.85,lY*-0.05],[lX*0.9,0],[lX,0],
      [lX,lY*0.1],[lX*1.05,lY*0.15],[lX*1.05,lY*0.35],[lX,lY*0.4],[lX,lY*0.6],[lX*1.05,lY*0.65],[lX*1.05,lY*0.85],[lX,lY*0.9],[lX,lY],
      [lX*0.9,lY],[lX*0.85,lY*0.95],[lX*0.65,lY*0.95],[lX*0.6,lY],[lX*0.4,lY],[lX*0.35,lY*0.95],[lX*0.15,lY*0.95],[lX*0.1,lY],[0,lY],
      [0,lY*0.9],[lX*0.05,lY*0.85],[lX*0.05,lY*0.65],[0,lY*0.6],[0,lY*0.4],[lX*0.05,lY*0.35],[lX*0.05,lY*0.15],[0,lY*0.1],[0,0]
        ];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //energybarz
    var ey = oY + lY*0.1;
    var sx = lX*0.1;
    var sy = lY*0.8;
    for(var ex=oX+(lX*0.2);ex<oX+(lX*0.9);ex+=lX*0.2){
      var dr = obj.active ? Math.floor(Math.random() * 30) : 0;
      var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
      var rgbaString = "rgba("+(100+dr)+","+(40+dr)+","+dr+","+da+")";
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(ex,ey,sx,sy);
      canvasBufferContext.fill();
    }
  }

  this.drawAirVent = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    var capRGB = "rgba(180,180,190,"+alpha+")";
    canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = capRGB;
    canvasBufferContext.moveTo(oX+lX*0.3,oY);
    var points = [[lX*0.7,0],[lX*0.7,lY*0.1],[lX*0.9,lY*0.3],[lX,lY*0.3],[lX,lY*0.7],[lX*0.9,lY*0.7],[lX*0.7,lY*0.9],[lX*0.7,lY],[lX*0.3,lY],[lX*0.3,lY*0.9],[lX*0.1,lY*0.7],[0,lY*0.7],[0,lY*0.3],[lX*0.1,lY*0.3],[lX*0.3,lY*0.1],[lX*0.3,0]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //energybarz
    for(dy=oY+(lY*0.3);dy<oY+(lY*0.7);dy+=lY*0.3){
      var db = obj.active ? Math.floor(Math.random() * 50) : 0;
      var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
      var rgbaString = "rgba("+(200+db)+","+(200+db)+","+(200+db)+","+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.beginPath();
      canvasBufferContext.rect(oX+(lX*0.2),dy,lX*0.6,lY*0.1);
      canvasBufferContext.fill();
    }
  }

  this.drawWaterPipe = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    var capRGB = "rgba(180,180,190,"+alpha+")";
    canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
    //pipes
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.rect(oX+lX*0.4,oY,lX*0.2,lY);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.rect(oX,oY+lY*0.4,lX,lY*0.2);
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = capRGB;
    canvasBufferContext.moveTo(oX+lX*0.5,oY+lY*0.1);
    var points = [[lX*0.9,lY*0.5],[lX*0.5,lY*0.9],[lX*0.1,lY*0.5],[lX*0.5,lY*0.1]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //energybarz
    var db = obj.active ? Math.floor(Math.random() * 50) : 0;
    var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
    var rgbaString = "rgba(0,0,"+(200+db)+","+da+")";
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.beginPath();
    canvasBufferContext.moveTo(oX+lX*0.5,oY+lY*0.3);
    var points = [[lX*0.7,lY*0.5],[lX*0.5,lY*0.7],[lX*0.3,lY*0.5],[lX*0.5,lY*0.3]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
  }

  this.drawConveyorTube = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle= "rgba(130,100,100,"+alpha+")";
    canvasBufferContext.strokeStyle= "rgba(200,150,100,1.0)";
    canvasBufferContext.moveTo(oX,oY+(lY*0.2));
    var points = [[lX*0.3,lY*-0.1],[lX*0.7,lY*-0.1],[lX*1.1,lY*0.3],[lX*1.1,lY*0.7],[lX*0.8,lY],[lX*0.7,lY*0.9],[lX*0.3,lY*0.9],[lX*0.2,lY],[0,lY*0.8],[lX*0.1,lY*0.7],[lX*0.1,lY*0.3],[0,lY*0.2]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //energybarz

    var ey = oY + lY*0.2;
    var sx = lX*0.2;
    var sy = lY*0.6;
    for(var ex=oX+(lX*0.3);ex<oX+(lX*0.7);ex+=lX*0.3){
      var dr = obj.active ? Math.floor(Math.random() * 30) : 0;
      var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
      var rgbaString = "rgba("+(100+dr)+","+(40+dr)+","+dr+","+da+")";
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(ex,ey,sx,sy);
      canvasBufferContext.fill();
    }
  }

  this.drawSoilEvaporator = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    var capRGB = "rgba(180,180,190,"+alpha+")";
    canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = capRGB;
    canvasBufferContext.moveTo(oX,oY);
    var points = [[lX,0],[lX*0.9,lY*0.2],[lX*0.9,lY*0.8],[lX,lY*0.9],[lX,lY],[0,lY],[0,lY*0.9],[lX*0.1,lY*0.8],
                  [lX*0.1,lY*0.2],[0,0]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //water
    var db = obj.active ? Math.floor(Math.random() * 100) : 0;
    var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
    var rgbaString = "rgba("+(150+db)+","+(150+db)+","+(150+db)+","+da+")";
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.beginPath();
    canvasBufferContext.rect(oX+(lX*0.2),oY+(lY*0.2),lX*0.6,lY*0.2);
    canvasBufferContext.fill();
    //soil
    var rgbaString = "rgba(20,200,150,"+(0.9*alpha)+")";
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.beginPath();
    canvasBufferContext.rect(oX+(lX*0.2),oY+(lY*0.4),lX*0.6,lY*0.4);
    canvasBufferContext.fill();
    //red
    var dr = obj.active ? Math.floor(Math.random() * 50) : 0;
    var dg = obj.active ? Math.floor(Math.random() * 50) : 0;
    var rgbaString = "rgba("+(200+dr)+","+(200+dg)+","+20+","+da+")";
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.beginPath();
    canvasBufferContext.rect(oX+(lX*0.4),oY+(lY*0.2),lX*0.2,lY*0.6);
    canvasBufferContext.fill();
    var rgbaString = "rgba(100,100,100,"+alpha+")";
    canvasBufferContext.fillStyle = rgbaString;
    for(var dx=0;dx<=lX*0.80;dx+=lX*0.80){
      for(var dy=lY*0.2;dy<=lY*0.7;dy+=lY*0.5){
        canvasBufferContext.beginPath();
        canvasBufferContext.rect(oX+dx,oY+dy,lX*0.2,lY*0.1);
        canvasBufferContext.fill();
      }
    }
  }

  this.drawOxygenCondenser = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    var capRGB = "rgba(180,180,190,"+alpha+")";
    canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
    //topcap
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = capRGB;
    canvasBufferContext.moveTo(oX,oY+lY*0.5);
    var points = [[lX*0.2,lY*0.5],[lX*0.2,lY*0.8],[lX*0.4,lY*0.75],[lX*0.6,lY*0.75],[lX*0.8,lY*0.8],[lX*0.8,lY*0.5],[lX,lY*0.5],[lX,lY],[0,lY],[0,lY*0.5]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();

    for(var eY = oY; eY < oY+(lY*0.75); eY += lY*0.1){
      //energybarz
      var dr = obj.active ? Math.floor(Math.random() * 100) : 0;
      var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
      var rgbaString = "rgba("+(150+dr)+","+(150+dr)+","+(255)+","+da+")";
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.beginPath();
      canvasBufferContext.rect(oX+(lX*0.4),eY,lX*0.2,lY*0.1);
      canvasBufferContext.fill();
    }
  }

  this.drawSmeltingChamber = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    //topcap
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle= "rgba(10,5,7,"+alpha+")";
    canvasBufferContext.strokeStyle= "rgba(200,150,100,1.0)";
    canvasBufferContext.moveTo(oX,oY+(lY*0.05));
    var points = [
      [lX*0.05,0],[lX*0.95,0],[lX,lY*0.05],[lX,lY*0.95],[lX*0.95,lY],[lX*0.05,lY],[0,lY*0.95],[0,lY*0.05]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //boilerdoor
    canvasBufferContext.beginPath();
    canvasBufferContext.fillStyle= "rgba(100,100,100,"+(0.6*alpha)+")";
    canvasBufferContext.strokeStyle= "rgba(50,50,50,1.0)";
    canvasBufferContext.moveTo(oX+(lX*0.05),oY+(lY*0.3));
    var points = [
      [lX*0.3,lY*0.05],[lX*0.7,lY*0.05],[lX*0.95,lY*0.3],[lX*0.95,lY*0.6],[lX*0.7,lY*0.85],[lX*0.3,lY*0.85],[lX*0.05,lY*0.6],[lX*0.05,lY*0.6]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
    //energybarz
    canvasBufferContext.beginPath();
    var dr = obj.active ? Math.floor(Math.random() * 80) : 0;
    var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
    var rgbaString = "rgba("+(170+dr)+",0,0,"+da+")";
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.moveTo(oX+(lX*0.15),oY+(lY*0.35));
    var points = [
      [lX*0.3,lY*0.15],[lX*0.3,lY*0.75],[lX*0.15,lY*0.55],[lX*0.15,lY*0.35]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.beginPath();
    var dr = obj.active ? Math.floor(Math.random() * 80) : 0;
    var rgbaString = "rgba("+(170+dr)+",0,0,"+da+")";
    canvasBufferContext.fillStyle = rgbaString;
    canvasBufferContext.moveTo(oX+(lX*0.85),oY+(lY*0.35));
    var points = [
      [lX*0.7,lY*0.15],[lX*0.7,lY*0.75],[lX*0.85,lY*0.55],[lX*0.85,lY*0.35]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    var ey = oY + lY*0.15;
    var sx = lX*0.125;
    var sy = lY*0.6;
    for(var ex=oX+(lX*0.35);ex<oX+(lX*0.6);ex+=lX*0.175){
      var dr = obj.active ? Math.floor(Math.random() * 80) : 0;
      var da = (Math.floor(Math.random() * 0.1) + 0.9) * alpha;
      var rgbaString = "rgba("+(170+dr)+",0,0,"+da+")";
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(ex,ey,sx,sy);
      canvasBufferContext.fill();
    }
  }

  this.drawSolarPanel = function(x,y,alpha,canvasBufferContext,obj,scl){
    var scale = scl ? scl : 1;
    var oX = x;
    var oY = y;
    var lX = obj.size.x*config.xRatio*scale;
    var lY = obj.size.y*config.yRatio*scale;
    //energybarz
    for(var ex=oX;ex<oX+lX*0.9;ex+=lX*0.2){
      var dr = obj.active ? Math.floor(Math.random() * 30) : 0;
      var rgbaString = "rgba("+(100+dr)+","+(100+dr)+","+(200+dr)+",0.9)";
      canvasBufferContext.beginPath();
      canvasBufferContext.fillStyle = rgbaString;
      canvasBufferContext.rect(ex,oY+lY*0.2,lX*0.2,lY*0.4);
      canvasBufferContext.fill();
    }
    var baseRGB = "rgba(180,180,190,"+alpha+")";
    //base
    canvasBufferContext.beginPath();
    canvasBufferContext.lineWidth=Math.floor(config.xRatio)+"";
    canvasBufferContext.fillStyle = baseRGB;
    canvasBufferContext.strokeStyle= "rgba(140,140,140,1.0)";
    canvasBufferContext.moveTo(oX+lX*0.35,oY+lY);
    var points = [[lX*0.65,lY],[lX*0.65,lY*0.8],[lX*0.55,lY*0.8],[lX*0.55,lY*0.6],[lX*0.45,lY*0.6],[lX*0.45,lY*0.8],[lX*0.35,lY*0.8],[lX*0.35,lY]];
    for(p in points){
      canvasBufferContext.lineTo(oX+points[p][0],oY+points[p][1]);
    }
    canvasBufferContext.fill();
    canvasBufferContext.stroke();
  }

  this.drawBuilding = function(x,y,alpha,canvasBufferContext,obj,scl){

  }
}
