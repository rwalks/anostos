ArtHolder = function(){
  this.loadCount = 0;

  this.staticArt = {};
  this.procArt = {};

  this.init = function(){
    //procedural art
    this.procArt['weaponButton'] = new WeaponButtonArt();
    this.procArt['repairButton'] = new RepairButtonArt();
    this.procArt['deleteButton'] = new DeleteButtonArt();
    this.procArt['lightButton'] = new LightButtonArt();
    this.procArt['guiButton'] = new ButtonArt();
    this.procArt['gaugeGui'] = new GaugeGuiArt();
    //static art
    this.staticArt['soilTile'] = new SoilTileArt();
    this.staticArt['rockTile'] = new RockTileArt();
    this.staticArt['oreTile'] = new OreTileArt();
    this.staticArt['grassTile'] = new GrassTileArt();
    this.staticArt['playerGui'] = new PlayerGuiArt();
    this.staticArt['treePlant'] = new TreeArt();
    this.staticArt['scrubPlant'] = new ScrubArt();
    this.staticArt['treeS'] = new TreeArtS();
    this.staticArt['scrubS'] = new ScrubArtS();
    this.staticArt['treeM'] = new TreeArtM();
    this.staticArt['scrubM'] = new ScrubArtM();
    this.staticArt['star'] = new StarArt();
    this.staticArt['hill'] = new HillArt();
    this.staticArt['hill2'] = new HillArt2();
    this.staticArt['hill3'] = new HillArt3();
    this.staticArt['hill4'] = new HillArt4();
    this.staticArt['hillS1'] = new HillArtS1();
    this.staticArt['hillS2'] = new HillArtS2();
    this.staticArt['hillS3'] = new HillArtS3();
    this.staticArt['hillS4'] = new HillArtS4();
    this.staticArt['field'] = new FieldArt();
    this.staticArt['underground'] = new UnderGroundArt();
    this.staticArt['cloud'] = new CloudArt();
    this.staticArt['cloud2'] = new CloudArt();
    this.staticArt['cloud3'] = new CloudArt();
    this.staticArt['cloud4'] = new CloudArt();
    this.staticArt['cloudS1'] = new CloudArtS();
    this.staticArt['cloudS2'] = new CloudArtS();
    this.staticArt['cloudS3'] = new CloudArtS();
    this.staticArt['cloudL1'] = new CloudArtL();
    this.staticArt['cloudL2'] = new CloudArtL();
    this.staticArt['cloudL3'] = new CloudArtL();
    this.staticArt['atmoScreen'] = new AtmoScreenArt();
    this.staticArt['blackScreen'] = new BlackScreenArt();
    this.staticArt['scrubForest1'] = new ScrubForestArt();
    this.staticArt['scrubForest2'] = new ScrubForestArt();
    this.staticArt['scrubForestS1'] = new ScrubForestArtS();
    this.staticArt['scrubForestS2'] = new ScrubForestArtS();
    this.staticArt['scrubForestM1'] = new ScrubForestArtM();
    this.staticArt['scrubForestM2'] = new ScrubForestArtM();
  }

  this.getArt = function(name){
    return this.procArt[name] || this.staticArt[name];
  }

  this.updateSizes = function(){
    var artKeys = Object.keys(this.staticArt);
    for(var a = 0; a < artKeys.length; a++){
      this.staticArt[artKeys[a]].updateSize();
    }
    return true;
  }
}
