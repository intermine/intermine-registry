import requests

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

def add_instance(name, instance_url, registry_url):
    request = {
        "name": name,
        "instance_url": instance_url
    }
    r = requests.post(registry_url + "/registry/service/instances", request)
    print r

def main():
    registry_url = raw_input("Enter the URL where your APP is located: ")
    registry_url = registry_url.strip()
    map(lambda x: add_instance(x[0], x[1], registry_url), mines)

if __name__ == '__main__':
    main()
