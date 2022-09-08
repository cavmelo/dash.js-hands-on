var player;
var video;
var log = [];
var firstAutoPlay = true;

function addLog(timestamp, entryLog){
  log.push(entryLog)
  //logger.innerHTML = logger.innerHTML +  + '\r\n';

  logger.innerHTML = JSON.stringify(log);

  console.log(JSON.stringify(entryLog));

}
function processEvent(e){
    if (e.type == 'canPlay'){
      player.play()
    }else if ((e.type == 'bufferLoaded') && (firstAutoPlay)){
      player.setMute(true);
      firstAutoPlay = false;
    }
    showEvent(e)
}

function showEvent(e){
  var timestamp = Date.now();
  var entryLog = {'timestamp':timestamp,'type':e.type,'details':[]};
  //addLog(timestamp, msgLog);

  for (var name in e){
       if (typeof e[name] != 'object') {
           entryLog['details'].push({[name]:e[name]});
       }
   }
   for (name in e) {
    if (typeof e[name] == 'object' )
      {
        entryLog['details'].push({[name]:[e[name]]});
    }
  }
  addLog(timestamp,entryLog);
}

function initPlayer(){
    logger = document.querySelector("#log");
    video = document.querySelector("#videoPlayer");
    //var url = "http://rdmedia.bbc.co.uk/dash/ondemand/elephants\_dream/1/client\_manifest\-all.mpd"
    //var url = "http://rdmedia.bbc.co.uk/dash/ondemand/bbb/2/client_manifest-common_init.mpd";
    var url = "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd"
    player = dashjs.MediaPlayer().create();
    player.on(dashjs.MediaPlayer.events['QUALITY_CHANGE_REQUESTED'],processEvent);
    player.on(dashjs.MediaPlayer.events['BUFFER_LOADED'],processEvent);
    player.on(dashjs.MediaPlayer.events['BUFFER_EMPTY'],processEvent);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_STARTED'], processEvent);
    player.on(dashjs.MediaPlayer.events['CAN_PLAY'], processEvent);
    player.on(dashjs.MediaPlayer.events['FRAGMENT_LOADING_COMPLETED'], processEvent);
    player.on(dashjs.MediaPlayer.events['FRAGMENT_LOADING_ABANDONED'], processEvent);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_ENDED'], processEvent);


    player.initialize(video, url, false);

}
