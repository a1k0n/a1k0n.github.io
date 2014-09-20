<?php

###########
# update as necessary

$flashrev = '12723';
$swfurl   = "http://static.farmville.com/embeds/v$flashrev/FarmGame.release-10-01-07.$flashrev.swf";

$ch       = curl_init("http://fb-2.farmville.com/flashservices/gateway.php");
$ua       = "User-Agent: Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10.6; en-US; rv:1.9.0.15) Gecko/2009101600 Firefox/3.0.15";
# steal userid and token from the captured stream
$userId   = '576174569';
#$token    = 'c54f2a119b661d8e7ad9366887c4375356';
#$cookies  = "80c6ec6628efd9a465dd223190a65bbc_user=576174569; 80c6ec6628efd9a465dd223190a65bbc_session_key=2.n5_kD8H73hFQTd7DUGZLng__.86400.1262991600-576174569; 80c6ec6628efd9a465dd223190a65bbc_expires=1262991600; 80c6ec6628efd9a465dd223190a65bbc=0c4a51c68d1ee46af6283e94d978d7bb; base_domain_80c6ec6628efd9a465dd223190a65bbc=farmville.com; 80c6ec6628efd9a465dd223190a65bbc_ss=9KDSkZI41PORg2Qir9SLiQ__; PHPSESSID=1jb2ft678be89k90goloo972t7; fbsetting_80c6ec6628efd9a465dd223190a65bbc=%7B%22connectState%22%3A1%2C%22oneLineStorySetting%22%3A1%2C%22shortStorySetting%22%3A1%2C%22inFacebook%22%3Atrue%7D";
$cookies  = '';
$sigTime  = gettimeofday(true);
$maxplots = 3200;
$rpcmax   = 20; # max number of stacked calls
$debugout = true;

$cropToPlant   = 'blackberries';
$goldToReserve = 1000;

date_default_timezone_set("America/Chicago");

###########

define("AMFPHP_BASE", "amfphp/core/");

include "amfphp/core/amf/app/Gateway.php";
include "gameSettings.php";

include_once("amfphp/core/amf/io/AMFDeserializer.php");
include_once("amfphp/core/amf/io/AMFSerializer.php");

###########

$seq = 0;
$rpcseq = 0;

# {{{ RPC requests
function req_plow($plot) {
  global $seq;
  return array(
    params => array('plow', $plot, array(array(energyCost => 0))),
    sequence => ++$seq,
    functionName => 'WorldService.performAction');
}

function req_plant($crop, &$plot) {
  global $seq;
  $plot['state'] = 'planted';
  $plot['tempId'] = 4294967295;
  $plot['itemName'] = $crop;
  $plot['plantTime'] = floor(1000*gettimeofday(true));# - 60*2*1000; # - 60*60*2*1000; # total cheating opportunity here, but it's capped at 2 minutes or so
  return array(
    params => array('place', &$plot, array(array(energyCost => 0, isGift => false))),
    sequence => ++$seq,
    functionName => 'WorldService.performAction');
}

function req_harvest($plot) {
  global $seq;
  return array(
    params => array('harvest', $plot, array(array(energyCost => 0))),
    sequence => ++$seq,
    functionName => 'WorldService.performAction');
}

function req_clearplot($plot) {
  global $seq;
  return array(
    params => array('clear', $plot, array()),
    sequence => ++$seq,
    functionName => 'WorldService.performAction');
}

function gen_header() {
  global $userId, $token, $sigTime, $flashrev;
  return array (
    'userId' => $userId,
    'token' => $token,
    'flashRevision' => $flashrev,
    'sigTime' => $sigTime,
  );
}

# this is ugly as hell, but it works.  awesome!
function rpc($reqs, $progress = true)
{
  global $ua, $ch, $swfurl, $cookies, $rpcseq, $rpcmax;
  global $debugout;
  $offset=0;
  $resps = array();
  while(true) {
    $n = min(count($reqs)-$offset, $rpcmax);
    if($n == 0) break;
    $req = array(gen_header(), array_slice($reqs, $offset, $n), 0);
    $offset += $n;

    ++$rpcseq;
    $body = new MessageBody();
    $body->setResponseURI("BaseService.dispatchBatch");
    $body->setResponseTarget("/$rpcseq");
    $body->setResults($req);
    $amf = new AMFObject();
    $amf->addBody($body);
    $serializer = new AMFSerializer();
    $postdata = $serializer->serialize($amf);
    if($debugout) file_put_contents("out/$rpcseq.req", $postdata);

    curl_setopt_array($ch, array(
      CURLOPT_POST=>true,
      CURLOPT_BINARYTRANSFER=>true,
      CURLOPT_RETURNTRANSFER=>true,
      CURLOPT_USERAGENT=>$ua,
      CURLOPT_REFERER=>$swfurl,
      CURLOPT_COOKIE=>$cookies,
      CURLOPT_POSTFIELDS=>$postdata));
    $out = curl_exec($ch);
    if($debugout) file_put_contents("out/$rpcseq.resp", $out);
    if($progress) print(".");

    $amf = new AMFObject($out);
    $deserializer = new AMFDeserializer($amf->rawData); // deserialize the data
    $deserializer->deserialize($amf); // run the deserializer
    $v = $amf->getBodyAt(0)->getValue();
    if($v['errorType'] != 0) {
      die($v['errorData']."\n");
    }
    $resps = array_merge($resps, $v['data']);
  }
  return $resps;
}

# }}}

#$newplotctr = 63000;
function newplot($x,$y) {
#  global $newplotctr;
#  $plot = array(id => $newplotctr++, <- doesn't work... we have to invent ids
  global $maxobjid;
  $plot = array(id => ++$maxobjid,
    className => 'Plot',
    plantTime => NAN,
    direction => 0,
    itemName  => NULL,
    deleted   => false,
    isJumbo   => false,
    position  => array(x=>$x,y=>$y,z=>0),
    tempId    => NAN,
    isProduceItem => false,
    state     => 'plowed',
    isBigPlot => false);
  return $plot;
}

function initUser() {
  # captured initUser
  global $userId, $seq, $userName;
  $out = rpc(array(array(
      'params'       => array($userName),
      'sequence'     => ++$seq,
      'functionName' => 'UserService.initUser',
    )), false);
  return $out[0];
}

global $crops;
function reinit() {
  global $alldata, $objects, $player, $map, $maxobjid;
  global $cropvalue, $nextharvest, $nextharvestitem, $crops;
  global $gold, $xp, $level;
  global $seq, $rpcseq;
  $seq = 0; $rpcseq = 0;

  $alldata = initUser();
  $worldobjects = $alldata['data']['userInfo']['world']['objects'];
  $player = $alldata['data']['userInfo']['player'];
#  $map = array();
  $maxobjid = 0;
  $cropvalue = 0;
  $nextharvest = -1;
  foreach($worldobjects as $i => &$obj) {
    $objects[$obj['id']] = $obj;
    unset($obj['_explicitType']);
    unset($obj['usesAltGraphic']);
    unset($obj['hasGiftRemaining']);
    $x = $obj['position']['x'];
    $y = $obj['position']['y'];
#    if(!isset($map[$x])) { $map[$x] = array(); }
#    $map[$x][$y] = $obj;
    $obj['tempId'] = NAN;
    $obj['position']['z'] = 0;
    $obj['direction'] = 0;
    $obj['deleted'] = false;
    if($obj['position']['x'] == 28 && $obj['position']['y'] == 28) { $centerplot = $i; }
    if($obj['id'] > $maxobjid) { $maxobjid = $obj['id']; }
    if($obj['className'] == 'Plot') {
      if($obj['itemName']) {
        $crop = $crops[$obj['itemName']];
        $cropvalue += $crop['yield'];
        $harvesttime = floor($obj['plantTime']/1000) + 23*3600*$crop['growtime'];
        if(($nextharvest == -1) || ($harvesttime < $nextharvest)) {
          $nextharvest = $harvesttime;
          $nextharvestitem = $obj['itemName'];
        }
      }
    }
  }
  $gold = $player['gold'];
  $xp = $player['xp'];
  $level = $player['level'];
}

function plowPlots(&$plots) {
  global $objects;
  $reqs = array();
  $n = count($plots);
  if($n == 0) return $plots;
  print("plowing $n plots: ");
  rpc(array_map("req_plow", $plots));
  print(" done\n");
  foreach($plots as &$plot) { $plot['state'] = 'plowed'; }
  return $plots;
}

function plantPlots($crop, &$plots) {
  global $objects;
  $reqs = array();
  $n = 0;
  foreach($plots as &$plot) {
    $reqs[] = req_plant($crop, $plot);
    $n++;
  }
  if($n == 0) { return $plots; }
  print("planting $n $crop: ");
  rpc($reqs);
  print(" done\n");
  return $plots;
}

function harvestPlots(&$plots) {
  global $gold, $crops;
  $reqs = array();
  $n = count($plots);
  if($n == 0) { return $plots; }
  print("harvesting $n: ");
  foreach($plots as &$plot) {
    $reqs[] = req_harvest($plot);
    $gold += $crops[$plot['itemName']]['yield'];
    $plot['state'] = 'fallow';
  }
  rpc($reqs);
  print(" done\n");
  return $plots;
}

function makePlots($ntomake) {
#  global $map;
  global $objects;
  $reqs = array();
  $nplowed=0;
#  for($x=0;$x<58 && $nplowed < $ntomake;$x++) {
#    for($y=0;$y<58 && $nplowed < $ntomake;$y++) {
#      if(!isset($map[$x][$y])) {
#        $plot = newplot($x,$y);
#        $objects[] = $plot;
#        $nplowed++;
#      }
#    }
#  }
  $plots = array();
  if($ntomake <= 0) return $plots;
  while($ntomake--) {
    # stack them all underneath an 8x8 grid
    $plot = newplot(4*($nplowed&7),4*(($nplowed>>3)&7));
    $plots[] = $plot;
    $reqs[] = req_plow($plot);
    $nplowed++;
  }
  print("plowing $nplowed new plots: ");
  if(count($reqs) > 0) {
    $resps = rpc($reqs);
    for($i=0;$i<count($resps);$i++) {
      # something like this?
      $id = $resps[$i]['data']['id'];
      $plots[$i]['id'] = $resps[$i]['data']['id'];
      $objects[$id] = $plots[$i];
    }
  }
  print(" done\n");
  return $plots;
}

function clearPlots($plots) {
  global $objects;
  if(!count($plots)) return;
  print("clearing ".count($plots).": ");
  rpc(array_map("req_clearplot", $plots));
  print(" done\n");
}

function getPlots($state, $max = -1) {
  global $objects;
  $plots = array();
  $n = 0;
  foreach($objects as &$obj) {
    if($obj['className'] == 'Plot' && $obj['state'] == $state && ($max == -1 || $n < $max)) {
      $plots[] = &$obj;
      $n++;
    }
  }
  return $plots;
}

function getPlanted($type) {
  $plots = array();
  foreach(getPlots('planted') as $obj) {
    if($obj['itemName'] == $type) $plots[] = $obj;
  }
  return $plots;
}

function gold_to_xp($goldtospend) {
  global $objects, $centerplot, $nplowed, $nfallow, $nplots;
  $n = floor($goldtospend/30);
  print("### converting ".($n*30)." gold to ".($n*3)." xp ###\n");
  while($n > 0) {
    $nn = min(200, $n);
    clearPlots(plantPlots('soybeans', makePlots($nn)));
    $n -= $nn;
  }
}

function runstep() {
  global $nplots, $nplowed, $nfallow, $gold, $xp, $level, $cropvalue;
  global $nextharvest, $nextharvestitem, $maxplots;
  global $crops, $cropToPlant, $goldToReserve;

  reinit();
  $nplowed  = count(getPlots("plowed"));
  $nfallow  = count(getPlots("fallow"));
  $nplanted = count(getPlots("planted"));
  $ngrown   = count(getPlots("grown"));
  $nplots   = $nplowed+$nfallow+$nplanted+$ngrown;

  print("$nplots plots ($nplanted planted, $ngrown grown, $nplowed plowed, $nfallow fallow), $gold coins, $xp xp (level $level)\n");
  print("crop value: at least $cropvalue; net asset value (1xp=10c): ".($nplowed*15 + $cropvalue + $gold + 10*$xp)."\n");
  if($nextharvest != -1) {
    print("next harvest: ".strftime("%a %r", $nextharvest)." ($nextharvestitem)\n");
  }

  if(count(harvestPlots(getPlots("grown"))) > 0) {
    # if we harvested anything, we want to reinit here to get the exact amount 
    # of gold we have
    reinit();
#    print("### cleaning up old fallow plots ###\n");
#    clearPlots(getPlots('fallow'));
  }

  if($gold > $goldToReserve + 300) {
    $gold -= $goldToReserve;

    $crop = $crops[$cropToPlant];
    if(!isset($crop['cost'])) die("can't look up cost of $cropToPlant");
    $cropcost = $crop['cost'];

    # whee, unlimited space; this could become somewhat nuts as it will grow exponentially
    $nplowed = count($plowed = getPlots('plowed'));
    $nfallow = count($fallow = getPlots('fallow'));

    $n1   =  min($nplowed, floor($gold/$cropcost));
    $gold -= $n1 * $cropcost;
    $n2   =  floor($gold/($cropcost + 15));
    $n3   =  $n2 - $nfallow;
    assert($n1 == $nplowed);

    print("### plowing/planting $nfallow fallow, $n1 plowed, and $n3 new $cropToPlant ###\n");
    plantPlots($cropToPlant, array_merge(plowPlots($fallow), $plowed, makePlots($n3)));
    return;
  }
  if($nextharvest != -1) {
    $delay = min(45*60, $nextharvest - gettimeofday(true) + 60);
    print("waiting ".floor($delay/60)." minutes...");
    sleep($delay);
    print("\n");
  }
}

while(1) runstep();

?>
