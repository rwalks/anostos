Inventory = function() {
  this.inv = {};
  this.maxInventory = 200;
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
    for(var r in this.allowedResources){
      if(this.allowedResources[r] == resource){
        return true;
      }
    }
    return false;
  }

  this.itemCount = function(itemName){
    return this.inv[itemName] ? this.inv[itemName] : 0;
  }

  this.addItem = function(itemName,count){
    var inventoryRemaining = this.spaceRemaining();
    inventoryRemaining = inventoryRemaining < 0 ? 0 : inventoryRemaining;
    var invAdd = Math.min(inventoryRemaining,count);
    if(this.resourceAllowed(itemName) && invAdd > 0){
      this.inv[itemName] = this.inv[itemName] ? this.inv[itemName] + invAdd : invAdd;
      return invAdd;
    }
    return false;
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

  this.purchase = function(cost){
    var canAfford = true;
    for(var r in cost){
      if(this.itemCount(r) < cost[r]){
        canAfford = false;
      }
    }
    if(canAfford){
      for(var r in cost){
        this.removeItem(r,cost[r]);
      }
      return true;
    }
    return false;
  }

  this.count = function(){
    var invCount = 0;
    for(var it in this.inv){
      invCount += this.inv[it];
    }
    return invCount;
  }

  this.spaceRemaining = function(){
    return this.maxInventory - this.count();
  }

  this.full = function(){
    return this.count() >= this.maxInventory;
  }

  this.empty = function(){
    return this.count() == 0;
  }


}

