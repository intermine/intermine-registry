/**
  * File used to init a raw copy of InterMine Registry on a new DB environment.
  *
  */

const request = require('request');
const asyncLoop = require('node-async-loop');

mines = [
    ["FlyMine", 'http://www.flymine.org/query', "flymine"],
    ["HumanMine", 'http://www.humanmine.org/humanmine', "humanmine"],
    ["MouseMine", 'http://www.mousemine.org/mousemine', "mousemine"],
    ["YeastMine", 'https://yeastmine.yeastgenome.org/yeastmine', "yeastmine"],
    ["ZebrafishMine", 'http://www.zebrafishmine.org/', "zebrafishmine"],
    ["WormMine", 'http://intermine.wormbase.org/tools/wormmine',"wormmine"],
    ["SoyMine", 'https://mines.legumeinfo.org/soymine',"soymine"],
    ["BeanMine", 'https://mines.legumeinfo.org/beanmine', "beanmine"],
    ["MedicMine", 'http://medicmine.jcvi.org/medicmine',"medicmine"],
    ["PeanutMine", 'https://mines.legumeinfo.org/peanutmine',"peanutmine"],
    ["ChickpeaMine", 'https://mines.legumeinfo.org/chickpeamine', "chickpeamine"],
    ["LegumeMine", 'https://intermine.legumefederation.org/legumemine', "legumemine"],
    ["RatMine", 'http://ratmine.mcw.edu/ratmine',"ratmine"],
    ["WheatMine", 'http://urgi.versailles.inra.fr/WheatMine', "wheatmine"],
    ["RepetDB", 'http://urgi.versailles.inra.fr/repetdb',"repetdb"],
    ["ThaleMine", 'https://apps.araport.org/thalemine',"thalemine"],
    ["BovineMine", 'http://128.206.116.12:8080/bovinemine/begin.do',"bovinemine"],
    ["PhytoMine", 'https://phytozome.jgi.doe.gov/phytomine',"phytomine"],
    ["HymenopteraMine", 'http://hymenopteragenome.org/hymenopteramine', "hymenopteramine"],
    ["Mitominer", 'http://mitominer.mrc-mbu.cam.ac.uk/release-4.0', "mitominer"],
    ["TargetMine", 'http://targetmine.mizuguchilab.org/targetmine', "targetmine"],
    ["INDIGO", "http://www.cbrc.kaust.edu.sa/indigo", "indigo"],
    ["Shaare", "http://www.shaare.org.uk/release-1.0","shaare"],
    ["XenMine", "http://www.xenmine.org/xenmine","xenmine"],
    ["GrapeMine", "http://urgi.versailles.inra.fr/GrapeMine","grapemine"],
    ["PlanMine", "http://planmine.mpi-cbg.de/planmine","planmine"],
    ["TetraMine", "http://adenine.bradley.edu/tetramine","tetramine"],
    ["modMine", "http://intermine.modencode.org/release-33","modmine"],
    ["CHOmine", "https://chomine.boku.ac.at/chomine","chomine",]
]

const host = '';  // Host where InterMine registry is running
const username = '';
const password = '';

asyncLoop(mines, function(mine, next){
    const mineName = mine[0];
    const mineURL = mine[1];
    const mineNamespace = mine[2];
    const req = {
        "name": mineName,
        "url": mineURL,
        "namespace" : mineNamespace
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

