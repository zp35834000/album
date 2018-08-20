require('normalize.css/normalize.css');
require('styles/App.scss');

import React from 'react';
import ReactDOM from 'react-dom';

// 导入相册相关的组件
import ImgFigure from './photo/ImgFigure';
import ControllerUnit from './photo/ControllerUnit';

// 获取图片的 json 数据
var imagesData = require('../data/imageDatas.json');

// 导入音乐相关的组件
import Player from './music/player';

// 歌名、歌手、播放URL等数据
import {MUSIC_LIST} from '../data/musicDatas';

import {randomRange} from './utils/util';

require('../styles/common.css');

let PubSub = require('pubsub-js');

/**
 * @imagesDataArray  {Array}
 * @return {Array}
 */
imagesData = (function getImageURL(imagesDataArray) {
  for (var i = 0, j = imagesDataArray.length; i < j; i++) {
    var singleImageData = imagesDataArray[i];

    singleImageData.imageURL = require('../images/' + singleImageData.fileName);

    imagesDataArray[i] = singleImageData;
  }
  return imagesDataArray;
})(imagesData);

/**
 * 获取指定范围内的随机值
 * @param  {min}
 * @param  {max}
 * @return {random between min and max}
 */
function getRangeRandom(low, high) {
  return Math.floor(Math.random() * (high - low) + low);
}

/**
 * 获取 0到30 之间的随机旋转度数
 * @return {random degree between 0 and 30}
 */
function get30DegRandom() {
  return ((Math.random() > 0.5 ? '' : '-') + Math.floor(Math.random() * 30));
}

/**
 * 总组件
 */
class AppComponent extends React.Component {
  /**
   * 构造方法
   * @param props
   */
  constructor(props) {
    super(props);
    this.Constant = {
      centerPos: { // 中心位置
        left: 0,
        top: 0
      },
      hPosRange: { // 水平方向
        leftSecX: [0, 0],
        rightSecX: [0, 0],
        y: [0, 0]
      },
      vPosRange: { // 垂直方向
        x: [0, 0],
        topY: [0, 0]
      }
    };
    this.state = {
      imgArrangeArr: []
    };


    // 这里不能用 return
    // return {
    //   musicList: MUSIC_LIST,
    //   currentMusitItem: {},
    //   repeatType: 'cycle',
    //
    //   progress: 0,
    //   volume: 0,
    //   isPlay: true,
    //   leftTime: ''
    // }

  }

  /**
   * 反转图片，参数为图片的索引
   * @param  {index of pic to be rotated}
   * @return {a closure function, return a function}
   */
  inverse(index) {
    return function () {
      var imgArrangeArr = this.state.imgArrangeArr;

      imgArrangeArr[index].isInverse = !imgArrangeArr[index].isInverse;

      this.setState({
        imgArrangeArr: imgArrangeArr
      });
    }.bind(this);
  }

  /**
   * 重新排列所有的图片
   * @param  {the index of pic to be centered}
   * @return {[type]}
   */
  rearrange(centerIndex) {
    let imgArrangeArr = this.state.imgArrangeArr,
      Constant = this.Constant,
      centerPos = Constant.centerPos,
      hPosRange = Constant.hPosRange,
      vPosRange = Constant.vPosRange,
      hPosRangeLeftSecX = hPosRange.leftSecX,
      hPosRangeRigheSecX = hPosRange.rightSecX,
      hPosRangeY = hPosRange.y,
      vPosRangeTopY = vPosRange.topY,
      vPosRangeX = vPosRange.x,

      imgArrangeTopArr = [],
      topImgNum = Math.floor(Math.random() * 2), // there would be 0 or 1 pics in top sec
      topImgSpliceIndex = 0, // the index of pic at top sec

      imgArrangeCenterArr = imgArrangeArr.splice(centerIndex, 1); // get the center pic

    // get the info of pics in up sec
    topImgSpliceIndex = Math.floor(Math.random() * (imgArrangeArr.length - topImgNum));
    imgArrangeTopArr = imgArrangeArr.splice(topImgSpliceIndex, topImgNum);

    /*---- position part ----*/
    // 让图片居中
    imgArrangeCenterArr[0] = {
      pos: centerPos,
      rotate: 0,
      isCenter: true
    }

    // 让图片在最上层
    imgArrangeTopArr.forEach(function (value, index) {
      imgArrangeTopArr[index] = {
        pos: {
          top: getRangeRandom(vPosRangeTopY[0], vPosRangeTopY[1]),
          left: getRangeRandom(vPosRangeX[0], vPosRangeX[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      };
    });

    // let pics in the left and right sec positioned
    // now imgArrangeArr only has pics to be position in left and right sec
    for (var i = 0, j = imgArrangeArr.length, k = j / 2; i < j; i++) {
      let hPosRangeLORX = null;

      // first half pics at left
      // rest pics at right
      if (i < k) {
        hPosRangeLORX = hPosRangeLeftSecX;
      } else {
        hPosRangeLORX = hPosRangeRigheSecX;
      }

      imgArrangeArr[i] = {
        pos: {
          left: getRangeRandom(hPosRangeLORX[0], hPosRangeLORX[1]),
          top: getRangeRandom(hPosRangeY[0], hPosRangeY[1])
        },
        rotate: get30DegRandom(),
        isCenter: false
      };
    }

    if (imgArrangeTopArr && imgArrangeTopArr[0]) {
      imgArrangeArr.splice(topImgSpliceIndex, 0, imgArrangeTopArr[0]);
    }

    imgArrangeArr.splice(centerIndex, 0, imgArrangeCenterArr[0]);

    this.setState({
      imgArrangeArr: imgArrangeArr
    })
  }

  /**
   * use rearrange() to center pic
   * @param  {index of pic to be centered}
   * @return {function}
   */
  center(index) {
    return function () {
      this.rearrange(index);
    }.bind(this);
  }

  /**
   * 生命周期：componentDidMount
   * 计算它们的位置范围
   */
  componentDidMount() {
    // get the size of stage
    let stageDOM = ReactDOM.findDOMNode(this.refs.stage),
      stageW = stageDOM.scrollWidth,
      stageH = stageDOM.scrollHeight,
      halfStageW = Math.ceil(stageW / 2),
      halfStageH = Math.ceil(stageH / 2);
    // get the size of one music
    let imgFigureDOM = ReactDOM.findDOMNode(this.refs.imgFigure0),
      imgW = imgFigureDOM.scrollWidth,
      imgH = imgFigureDOM.scrollHeight,
      halfImgW = Math.ceil(imgW / 2),
      halfImgH = Math.ceil(imgH / 2);
    // 计算中心图片的位置
    this.Constant.centerPos = {
      left: halfStageW - halfImgW,
      top: halfStageH - halfImgH - 140
    }
    // calculate the range of posiztion for the left and right sec
    this.Constant.hPosRange.leftSecX[0] = -halfImgW;
    this.Constant.hPosRange.leftSecX[1] = halfStageW - halfImgW * 3;

    this.Constant.hPosRange.rightSecX[0] = halfStageW + halfImgW;
    this.Constant.hPosRange.rightSecX[1] = stageW - halfImgW;

    this.Constant.hPosRange.y[0] = -halfImgH;
    this.Constant.hPosRange.y[1] = stageH - halfImgH * 3;
    // calculate the range of position for up sec
    this.Constant.vPosRange.x[0] = halfStageW - imgW;
    this.Constant.vPosRange.x[1] = halfStageW;

    this.Constant.vPosRange.topY[0] = 0 - halfImgH;
    this.Constant.vPosRange.topY[1] = halfStageH - halfImgH * 3;
    // let the first pic at center
    this.rearrange(0);

    /** 播放音乐相关的 start */

    $('#player').jPlayer({
      supplied: 'mp3',
      wmode: 'window',
      useStateClassSkin: true
    });

    this.playMusic(MUSIC_LIST[0]);

    $('#player').bind($.jPlayer.event.ended, (e) => {
      this.playWhenEnd();
    });
    PubSub.subscribe('PLAY_MUSIC', (msg, item) => {
      this.playMusic(item);
    });
    PubSub.subscribe('DEL_MUSIC', (msg, item) => {
      this.setState({
        musicList: this.state.musicList.filter((music) => {
          return music !== item;
        })
      });
    });
    PubSub.subscribe('PLAY_NEXT', () => {
      this.playNext();
    });
    PubSub.subscribe('PLAY_PREV', () => {
      this.playNext('prev');
    });
    let repeatList = [
      'cycle',
      'once',
      'random'
    ];
    PubSub.subscribe('CHANAGE_REPEAT', () => {
      let index = repeatList.indexOf(this.state.repeatType);
      index = (index + 1) % repeatList.length;
      this.setState({
        repeatType: repeatList[index]
      });
    });

    /** 播放音乐相关的 end */

  }

  componentWillUnmount() {
    PubSub.unsubscribe('PLAY_MUSIC');
    PubSub.unsubscribe('DEL_MUSIC');
    PubSub.unsubscribe('CHANAGE_REPEAT');
    PubSub.unsubscribe('PLAY_NEXT');
    PubSub.unsubscribe('PLAY_PREV');
  }

  componentWillMount() {
    this.getInitialState();
  }

  /** 音乐相关的方法 start */

  getInitialState() {
    return {
      musicList: MUSIC_LIST,
      currentMusitItem: MUSIC_LIST[0],
      repeatType: 'cycle'

      // progress: 0,
      // volume: 0,
      // isPlay: true,
      // leftTime: ''
    }
  }

  playWhenEnd() {
    if (this.state.repeatType === 'random') {
      let index = this.findMusicIndex(this.state.currentMusitItem);
      let randomIndex = randomRange(0, this.state.musicList.length - 1);
      while (randomIndex === index) {
        randomIndex = randomRange(0, this.state.musicList.length - 1);
      }
      this.playMusic(this.state.musicList[randomIndex]);
    } else if (this.state.repeatType === 'once') {
      this.playMusic(this.state.currentMusitItem);
    } else {
      this.playNext();
    }
  }

  playNext(type = 'next') {
    let index = this.findMusicIndex(this.state.currentMusitItem);
    if (type === 'next') {
      index = (index + 1) % this.state.musicList.length;
    } else {
      index = (index + this.state.musicList.length - 1) % this.state.musicList.length;
    }
    let musicItem = this.state.musicList[index];
    this.setState({
      currentMusitItem: musicItem
    });
    this.playMusic(musicItem);
  }

  findMusicIndex(music) {
    let index = this.state.musicList.indexOf(music);
    return Math.max(0, index);
  }

  playMusic(item) {
    $('#player').jPlayer('setMedia', {
      mp3: item.file
    }).jPlayer('play');
    this.setState({
      currentMusitItem: item
    });
  }

  /** 音乐相关的方法 end */


  /**
   * render 方法
   * @returns {*}
   */
  render() {
    /* declare 2 units*/
    var controllerUnits = [],
      imgFigures = [];

    Array.prototype.forEach.call(imagesData, function (value, index) {
      if (!this.state.imgArrangeArr[index]) {
        this.state.imgArrangeArr[index] = {
          pos: {
            left: 0,
            top: 0
          },
          rotate: 0,
          isInverse: false,
          isCenter: false
        }
      }
      imgFigures.push(<ImgFigure data={value} key={index} ref={'imgFigure' + index}
                                 arrange={this.state.imgArrangeArr[index]} inverse={this.inverse(index)}
                                 center={this.center(index)}/>);
      controllerUnits.push(<ControllerUnit key={index} arrange={this.state.imgArrangeArr[index]}
                                           inverse={this.inverse(index)} center={this.center(index)}/>);
    }.bind(this));

    return (
      <section className="stage" ref="stage">
        {/* 相册相关的组件 */}
        <section className="img-sec">
          {imgFigures}
        </section>
        <nav className="controller-nav">
          {controllerUnits}
        </nav>

        {/* 音乐相关的组件 */}
        <div>
          <Player/>
        </div>

        {/* 源代码组件 */}
        <div className="source-area">
          <a target="_blank">给盈颖的音乐相册</a>
        </div>

      </section>
    );
  }
}

AppComponent.defaultProps = {};

export default AppComponent;
