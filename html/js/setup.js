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
    var showanyway = false;
    if (e.type == 'canPlay'){
      player.play()
      showanyway = true;
    }else if ((e.type == 'bufferLoaded') && (firstAutoPlay)){
      player.setMute(true);
      firstAutoPlay = false;
    }else if (e.type == 'fragmentLoadingStarted'){
      player.off(dashjs.MediaPlayer.events['FRAGMENT_LOADING_STARTED'], processEvent);
    }else if (e.type == 'manifestLoaded'){
      showanyway = true;
    }
    showEvent(e, showanyway)
}

function showEvent(e, anyway){
  var timestamp = Date.now();
  var entryLog = {'timestamp':timestamp,'type':e.type,'details':[]};
  //addLog(timestamp, msgLog);
  var status = false;
  for (var name in e){
       if (typeof e[name] != 'object'){
          if (name == 'mediaType' && e[name] == 'video'){
            status = true  
          }
          entryLog['details'].push({[name]:e[name]});
       }
   }
   for (name in e) {
    if (typeof e[name] == 'object' ){
      if (name == 'mediaType' && e[name] == 'video'){
        status = true  
      }
      entryLog['details'].push({[name]:[e[name]]});
    }
  }
  if (e.type == 'fragmentLoadingStarted')
    entryLog['details'] = [];

  if ( (status) || (anyway) )
    addLog(timestamp,entryLog);
}

function initPlayer(){
    logger = document.querySelector("#log");
    video = document.querySelector("#videoPlayer");
    //var url = "https://rdmedia.bbc.co.uk/elephants_dream/1/client_manifest-all.mpd"
    var url = "https://rdmedia.bbc.co.uk/bbb/2/client_manifest-common_init.mpd";
   
    player = dashjs.MediaPlayer().create();
    player.on(dashjs.MediaPlayer.events['BUFFER_LOADED'],processEvent);
    player.on(dashjs.MediaPlayer.events['BUFFER_EMPTY'],processEvent);
    player.on(dashjs.MediaPlayer.events['BUFFER_LEVEL_STATE_CHANGED'], processEvent);
    player.on(dashjs.MediaPlayer.events['CAN_PLAY'], processEvent);
    player.on(dashjs.MediaPlayer.events['QUALITY_CHANGE_REQUESTED'],processEvent);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_STARTED'], processEvent);
    player.on(dashjs.MediaPlayer.events['PLAYBACK_ENDED'], processEvent);
    player.on(dashjs.MediaPlayer.events['MANIFEST_LOADED'], processEvent);
    player.on(dashjs.MediaPlayer.events['FRAGMENT_LOADING_STARTED'], processEvent);

    //player.addABRCustomRule('qualitySwitchRules', 'abrLowest', LowestBitrateRule);
    
    player.updateSettings({
      'streaming': {
          'abr': {
              'useDefaultABRRules': true,
              'ABRStrategy': 'abrThroughput',
//              'ABRStrategy': 'abrLowest',
              'additionalAbrRules':{
                  'insufficientBufferRule': false,
                  'switchHistoryRule': false,
                  'droppedFramesRule': false,
                  'abandonRequestsRule': false
              },
              'initialBitrate':{
                'video':0
              }
            },
          // 'buffer':{
          //     'initialBufferLevel':20
          //   }
        }
    });

    var currentSettings = player.getSettings();
    console.log(currentSettings);
    
    //console.log(LowestBitrateRule);
    
    player.initialize(video, url, false);

}
