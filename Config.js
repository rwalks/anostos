var Config = function (){
  this.canvasWidth = 800;
  this.canvasHeight = 600;
  this.mapWidth = 10000;
  this.mapHeight = 10000;
  this.cameraMoveRate = 11;
  this.canvasMatchWindow = true;
  this.cX = 600;
  this.cY = 450;
  this.gravity = 0.5;
  this.gridInterval = 10;
  this.terrainInterval = 2*this.gridInterval;
  this.adX = -10000;
  this.xRatio = 1;
  this.yRatio = 1;
  this.updateRatios = function(){
    this.xRatio = this.canvasWidth / this.cX;
    this.yRatio = this.canvasHeight / this.cY;
  }

  var firstNames = ["Lob","Tex","Snake","Jeb","Moose","Kansas","Rolf","Tane","Benji","Javier","Jane","El",
                    "Ellen","Parthenia","Tiny","Henry","Virgil","Hildred","Fern","Eve","Gibraltar","Ace","Vivian",
                    "Rosemary","Yolanda","Deloris","Adeline","Tig","Satan","Whisk","Lance","Jelly","Boss","Ryan",
                    "Quef","Felix","Honest", "Johnny","Lucy","Mallow","Seldon","Zip","Tupac","Shaq","Sputnik","Splif",
                    "Hex","Job","Ez","Opal","Dusty","Doctor","Rod","Geoff","Nib","Nox","Neeber","Doc","Hugh","Laze",
                    "Zandy","Gio","Joe","MadDog","Elvis","Dot","Bertha","Cilantro","Gilly","Lucy","Gomer","Eunice",
                    "Dorcas","Milcah","Naomi","Tamar","Ariadne","Arachne","Abia","Alope","Dirce","Cleo","Electra",
                    "Euryte","Gorge","Niobe","Pero","Mestra","Memphis","Iphis","Bev","Sheila","Jim"
                    ];
  var lastNamesA = ["Lobster","Moose","Star","Scrub","Goose","Gold","Bling","Barf","Sport","Space","Chill","Dance","Rib",
                    "Gluten","Warp","Jazz","Dunk","Profit","Dock","Jelly","Hog","Speed","Laser","Green","Ghost","Mc","Cod",
                    "Orb","Chuckle","Phase","Zen","Pizza","Shoe","Ice","Fire","Slug","Slack","Zap","Bird","Bike","Spork",
                    "Rock","Big","Ion","Ship","Night","Spring","Daisy","Tyrano","Dust","Grit","Volt","Long"
                   ];
  var lastNamesB = ["dog","lord","hammer","bone","man","jesus","magnet","fist","son","sauce","dust","queen","king",
                    "foe","fan","hound","shank","ster","heart","fast","boss","dad","bean","garden","mix","cave","ski",
                    "thief","slow","bucket","field","meat","well","cove","born","kin","nik","smith","saw","opolis","star",
                    "bandit","left","strong","face"
                   ];

  this.nameGenerator = function(){
    var fN = Math.floor(Math.random()*firstNames.length);
    var lNA = Math.floor(Math.random()*lastNamesA.length);
    var lNB = Math.floor(Math.random()*lastNamesB.length);
    return [firstNames[fN],lastNamesA[lNA] + "" + lastNamesB[lNB]];
  }

  this.test = 0;

  this.distance = function(obj1, obj2) {
    return Math.sqrt(Math.pow((obj2.position.x - obj1.position.x),2)+Math.pow((obj2.position.y-obj1.position.y),2));
  }
}
