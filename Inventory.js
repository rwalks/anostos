Inventory = function() {
  this.inv = {};
  this.maxInventory = 40;
  this.allowedResources = true;

  this.length = function(){
    return this.inv.length;
  }

  this.update = function(){

  }

  this.resourceAllowed = function(resource){
    if(this.allowedResources == true){
      return true;
    }
    for(r in this.allowedResources){
      if(this.allowedResources[r] == resource){
        return true;
      }
    }
    return false;
  }

  this.addItem = function(itemName,count){
    var inventoryRemaining = this.maxInventory - this.count();
    inventoryRemaining = inventoryRemaining < 0 ? 0 : inventoryRemaining;
    var invAdd = Math.min(inventoryRemaining,count);
    if(this.resourceAllowed(itemName) && invAdd > 0){
      this.inv[itemName] = this.inv[itemName] ? this.inv[itemName] + invAdd : invAdd;
    }
  }

  this.removeItem = function(itemName,count){
    if(!this.inv[itemName] || (this.inv[itemName] - count) < 0){
      return false;
    }
    this.inv[itemName] -= count;
    if(this.inv[itemName] == 0){
      delete this.inv[itemName];
    }
    return true;

  }

  this.count = function(){
    var invCount = 0;
    for(i in this.inv){
      invCount += this.inv[i];
    }
    return invCount;
  }

  this.full = function(){
    return this.count() >= this.maxInventory;
  }


}

