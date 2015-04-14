TerrainTileArt = function(){
  CachedArt.call(this);
  var s = 2*config.gridInterval;
  this.size = new Vector(s,s);
  this.fillStyle = new Color();
  this.strokeStyle = new Color();

  this.drawCanvas = function(){
    this.drawTile();
  }

  this.drawTile = function(){
    var lineW = Math.floor(config.minRatio * 2);
    var lX = this.canvas.width;
    var lY = this.canvas.height;
    this.context.lineWidth = lineW;
    this.context.fillStyle = this.fillStyle.colorStr();
    this.context.strokeStyle = this.strokeStyle.colorStr();
    this.context.beginPath();
    this.context.rect(0,0,lX,lY);
    this.context.fill();
    //border
    this.context.beginPath();
    this.context.moveTo(0,lY);
    this.context.lineTo(0,0);
    this.context.lineTo(lX,0);
    this.context.stroke();
    this.context.strokeStyle = "rgba(0,0,0,0.5)";
    this.context.beginPath();
    this.context.moveTo(0,lY);
    this.context.lineTo(lX,lY);
    this.context.lineTo(lX,0);
    this.context.stroke();
  }
}

RockTileArt = function(){
  TerrainTileArt.call(this);
  this.fillStyle = new Color(10,100,100,1.0);
  this.strokeStyle = new Color(20,150,150,1.0);
}

OreTileArt = function(){
  TerrainTileArt.call(this);
  this.fillStyle = new Color(110,100,130,1.0);
  this.strokeStyle = new Color(210,200,230,1.0);
}

SoilTileArt = function(){
  TerrainTileArt.call(this);
  this.fillStyle = new Color(100,200,200,1.0);
  this.strokeStyle = new Color(140,250,250,1.0);
}

TopSoilTileArt = function(){
  SoilTileArt.call(this);

  this.drawCanvas = function(){
    this.drawTile();
    this.drawGrass();
  }

  this.drawGrass = function(){
    var lineW = Math.floor(config.minRatio * 2);
    this.context.lineWidth = lineW;
    this.context.strokeStyle = "rgba(0,0,100,1)";
    this.context.fillStyle = "rgba(0,0,250,1)";
    var lX = this.canvas.width;
    var lY = this.canvas.height;
    this.context.beginPath();
    this.context.moveTo(0,0);
    var points = [[lX,0],[lX,lY*0.4],[lX*0.9,lY*0.2],[lX*0.8,lY*0.4],[lX*0.7,lY*0.2],[lX*0.6,lY*0.4],[lX*0.5,lY*0.2],[lX*0.4,lY*0.4],[lX*0.3,lY*0.2],[lX*0.2,lY*0.4],[lX*0.1,lY*0.2],[0,lY*0.4],[0,0]];
    for(var p = 0; p < points.length; p++){
      this.context.lineTo(points[p][0],points[p][1]);
    }
    this.context.fill();
    this.context.stroke();
  }
}
