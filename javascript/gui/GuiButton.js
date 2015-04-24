GuiButton = function(pos,size){
  this.position = pos;
  this.size = size;
  this.active = false;
  this.artStr = "guiButton";

  this.pointWithin = function(click){
    var pos = utils.ratioCoords(this.position);
    var size = utils.ratioCoords(this.size);
    var inside = click.x >= pos.x && click.x <= (pos.x+size.x) && click.y >= pos.y && click.y <= (pos.y+size.y);
    return inside;
  };

  this.click = function(){
    this.active = !this.active;
  };

  this.draw = function(canvasContext){
    var art = artHolder.getArt(this.artStr);
    art.draw(this,canvasContext);
  };
}

WeaponButton = function(pos,size){
  GuiButton.call(this,pos,size);
  this.artStr = "weaponButton";
}

RepairButton = function(pos,size){
  GuiButton.call(this,pos,size);
  this.artStr = "repairButton";
}

DeleteButton = function(pos,size){
  GuiButton.call(this,pos,size);
  this.artStr = "deleteButton";
}

LightButton = function(pos,size){
  GuiButton.call(this,pos,size);
  this.artStr = "lightButton";
}
