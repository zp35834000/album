let filePrefix = "./assets/music/";
let coverPrefix = "./assets/images/";
let MUSIC_LIST = [
   {
    id: 7,
    title: 'love story',
    artist: 'Taylor Swift',
    file: filePrefix + 'Love Story.mp3',
    cover: coverPrefix + 'Taylor Swift.jpg'
  }, {
    id: 8,
    title: '宠护',
    artist: '王理文',
    file: filePrefix + '宠护.mp3',
    cover: coverPrefix + '宠护.jpg'
  }

];

//
let turnMusicFile = function(relativeFile, musicList){
  debugger;
  let actualMusicList = [];
  for (let i = 0; i < musicList.length; i++) {
    let currentMusicInfo = musicList[i];
    let tempMusicInfo = {};
    for (var key in currentMusicInfo) {
      if(key === 'file' || key === 'cover'){
        tempMusicInfo[key] = "."+require(relativeFile + currentMusicInfo[key]);
      }else{
        tempMusicInfo[key] = currentMusicInfo[key];
      }
    }
    actualMusicList.push(tempMusicInfo);
  }
  return actualMusicList;
}
export {MUSIC_LIST}
