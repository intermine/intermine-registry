/**
  * File used to init a raw copy of InterMine Registry on a new DB environment.
  *
  */

var request = require('request');
var asyncLoop = require('node-async-loop');

mines = [
    ["FlyMine", 'http://www.flymine.org/query'],
    ["HumanMine", 'http://www.humanmine.org/humanmine'],
    ["MouseMine", 'http://www.mousemine.org/mousemine'],
    ["YeastMine", 'http://yeastmine.yeastgenome.org/yeastmine'],
    ["YeastMine Dev" , 'http://yeastmine-test-aws.yeastgenome.org/yeastmine-dev/'],
    ["ZebrafishMine", 'http://www.zebrafishmine.org/'],
    ["WormMine", 'http://intermine.wormbase.org/tools/wormmine'],
    ["SoyMine", 'https://mines.legumeinfo.org/soymine'],
    ["BeanMine", 'https://mines.legumeinfo.org/beanmine'],
    ["MedicMine", 'http://medicmine.jcvi.org/medicmine'],
    ["PeanutMine", 'https://mines.legumeinfo.org/peanutmine'],
    ["ChickpeaMine", 'https://mines.legumeinfo.org/chickpeamine'],
    ["LegumeMine", 'https://intermine.legumefederation.org/legumemine'],
    ["RatMine", 'http://ratmine.mcw.edu/ratmine'],
    ["Wheat3BMine", 'http://urgi.versailles.inra.fr/Wheat3BMine'],
    ["RepetDB", 'http://urgi.versailles.inra.fr/repetdb'],
    ["ThaleMine", 'https://apps.araport.org/thalemine'],
    ["BovineMine", 'http://bovinegenome.org/bovinemine'],
    ["PhytoMine", 'https://phytozome.jgi.doe.gov/phytomine'],
    ["FlyTF", 'http://www.flytf.org/flytfmine'],
    ["HymenopteraMine", 'http://hymenopteragenome.org/hymenopteramine'],
    ["Mitominer", 'http://mitominer.mrc-mbu.cam.ac.uk/release-4.0'],
    ["TargetMine", 'http://targetmine.mizuguchilab.org/targetmine'],
    ["INDIGO", "http://www.cbrc.kaust.edu.sa/indigo"],
    ["Shaare", "http://www.shaare.org.uk/release-1.0"],
    ["XenMine", "http://www.xenmine.org/xenmine"],
    ["GrapeMine", "http://urgi.versailles.inra.fr/GrapeMine"],
    ["PlanMine", "http://planmine.mpi-cbg.de/planmine"],
    ["TetraMine", "http://adenine.bradley.edu/tetramine"],
    ["modMine", "http://intermine.modencode.org/release-33"],
    ["CHOmine", "https://chomine.boku.ac.at/chomine"]
]

var host = '';  // Host where InterMine registry is running
var username = '';
var password = '';

asyncLoop(mines, function(mine, next){
    var mineName = mine[0];
    var mineURL = mine[1];
    var req = {
        "name": mineName,
        "url": mineURL
    };
    request.post({
        json: true,
        url: host + "/service/instances",
        body: req,
        auth: {
          "user": username,
          "pass": password
        },
    }, function(err, res, body){
        console.log(mineName + " ==> " + body.friendlyMessage);
        next();
    });
})

