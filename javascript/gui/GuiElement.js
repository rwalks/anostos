GuiElement = function(){
  this.size;
  this.position;
  this.artStr;

  this.buttons = [];

  this.click = function(click){
    var pos = utils.ratioCoords(this.position);
    var size = utils.ratioCoords(this.size);
    var inside = click.x >= pos.x && click.x <= (pos.x+size.x) && click.y >= pos.y && click.y <= (pos.y+size.y);
    if(inside){
      console.log('inside');
      for(var b = 0; b < this.buttons.length; b++){
        if(this.buttons[b].pointWithin(click)){
          return this.buttons[b].click();
        }
      }
    }
    return false;
  }

  this.draw = function(canvasContext){
    this.drawUnder(canvasContext);
    this.drawStatic(canvasContext);
    this.drawOver(canvasContext);
    this.drawButtons(canvasContext);
  };

  this.drawUnder = function(canvasContext){};
  this.drawOver = function(canvasContext){};

  this.drawStatic = function(canvasContext){
    var art = artHolder.getArt(this.artStr);
    var drawPos = utils.ratioCoords(this.position);
    art.draw(drawPos,canvasContext);
  };

  this.drawButtons = function(canvasContext){
    for(var b = 0; b < this.buttons.length; b++){
      this.buttons[b].draw(canvasContext);
    }
  };

}


PlayerGui = function(player){
  GuiElement.call(this);
  this.player = player;
  this.size = new Vector(config.cX * 0.24,config.cY * 0.13);
  var posX = (config.cX/2) - (this.size.x/2);
  this.position = new Vector(posX,0);
  this.artStr = "playerGui";

  this.drawUnder = function(buffCon){


  }

  this.init = function(){
    //create button bank
    var sX = (this.size.x/6)*0.8;
    var bufX = (this.size.x/6)*0.1;
    var sY = (this.size.y/4)*0.8;
    var bufY = (this.size.y/4)*0.1;
    var bSize = new Vector(sX,sY);
    var bX = this.position.x + (this.size.x/6) + bufX;
    var bY = this.position.y + (bufY*2);
    this.buttons.push(new WeaponButton(new Vector(bX,bY),bSize));
    bY += sY + bufY;
    this.buttons.push(new DeleteButton(new Vector(bX,bY),bSize));
    bY += sY + bufY;
    this.buttons.push(new RepairButton(new Vector(bX,bY),bSize));
    var bX = this.position.x + (this.size.x*(2/3)) + bufX;
    var bY = this.position.y + (bufY*2);
    this.buttons.push(new LightButton(new Vector(bX,bY),bSize));
    bY += sY + bufY;
    this.buttons.push(new GuiButton(new Vector(bX,bY),bSize));
    bY += sY + bufY;
    this.buttons.push(new GuiButton(new Vector(bX,bY),bSize));
  }

  this.init();
}

