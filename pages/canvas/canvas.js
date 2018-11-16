const ctx = wx.createCanvasContext('cover-preview');
var start_position = {};//移动图片时手指起始坐标
var tempFilePath;//图片路径
var tempWidth;//图片初始宽度
var tempHeight;//图片初始高度
var old_x = 0;//图片初始x坐标
var old_y = 0;//图片初始y坐标
var _touches = 1;//触屏的手指数
var old_scale = 1;//原始放大倍数
var new_scale = 1;//新的放大倍数
var is_move = false;//是否移动
var bg_url;
Page({
  data: {
    hide_canvas: true,//绘图层显示控制变量
  },
  //选择并将图片输出到canvas
  change_cover: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '更改我的封面',
      confirmColor: '#39bae8',
      success: function (res) {
        if (res.confirm) {


          wx.chooseImage({
            count: 1, // 默认9
            sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
            sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
            success: function (res0) {

              tempFilePath = res0.tempFilePaths[0];
              that.setData({
                hide_canvas: false,
                // edit_url: tempFilePath
              })
              wx.getImageInfo({
                src: tempFilePath,
                success: function (res) {
                  // console.log(res.width)
                  // console.log(res.height)
                  tempWidth = res.width;
                  tempHeight = res.height;
                  ctx.drawImage(tempFilePath, 0, 0, 375, res.height / res.width * 375);
                  ctx.draw();
                }
              })

            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  //监听手指触摸事件，并判断是移动还是缩放，并记录初始状态
  canvas_start: function (e) {
    // console.log(e);
    var touches = e.touches.length;
    if (touches == 1) {
      _touches = 1;
      start_position = { x: e.touches[0].x, y: e.touches[0].y, timeStamp: e.timeStamp }
    } else if (touches == 2) {
      _touches = 2;
      start_position = { x: e.touches[0].x, y: e.touches[0].y, x1: e.touches[1].x, y1: e.touches[1].y, timeStamp: e.timeStamp }
    } else {
      _touches = 1;
    }
  },
  //监听手指移动事件，并做出相应调整
  canvas_move: function (e) {
    // console.log(e);
    var touches = e.touches.length;
    if (_touches == 1 && e.timeStamp - start_position.timeStamp > 150) {
      ctx.drawImage(tempFilePath, old_x + e.touches[0].x - start_position.x, old_y + e.touches[0].y - start_position.y, 375 * new_scale, tempHeight / tempWidth * 375 * new_scale);
      ctx.draw();
      is_move = true;
    } else if (_touches == 2 && e.timeStamp - start_position.timeStamp > 150) {
      var change_x = Math.abs(Math.abs(e.touches[0].x - e.touches[1].x) - Math.abs(start_position.x - start_position.x1));
      var change_y = Math.abs(Math.abs(e.touches[0].y - e.touches[1].y) - Math.abs(start_position.y - start_position.y1));
      if (change_x - change_y > 10) {
        old_scale = Math.abs(e.touches[0].x - e.touches[1].x) / Math.abs(start_position.x - start_position.x1);
      } else {
        old_scale = Math.abs(e.touches[0].y - e.touches[1].y) / Math.abs(start_position.y - start_position.y1);
      }
      ctx.drawImage(tempFilePath, old_x, old_y, 375 * old_scale * new_scale, tempHeight / tempWidth * 375 * old_scale * new_scale);
      ctx.draw();
      is_move = true;
    } else {
      is_move = false;
    }
  },
  //监听手指离开动作，并保存当前状态数据
  canvas_end: function (e) {
    // console.log(e);
    if (_touches == 1 && is_move) {
      old_x = old_x + e.changedTouches[0].x - start_position.x;
      old_y = old_y + e.changedTouches[0].y - start_position.y;
    } else if (_touches == 2 && is_move) {
      new_scale = old_scale * new_scale;
    }

  },
  //确定并上传背景图
  upload_bg: function () {
    var that = this;
    var screenWidth = wx.getSystemInfoSync().screenWidth;
    // console.log(screenWidth);
    wx.canvasToTempFilePath({
      x: 0,
      y: screenWidth / 750 * 400,
      width: screenWidth,
      height: screenWidth / 750 * 526,
      destWidth: screenWidth,
      screenHeight: screenWidth / 750 * 526,
      quality: 1,
      canvasId: 'cover-preview',
      success: function (res) {
        that.setData({
          hide_canvas: true,
        })
        //res.tempFilePath即为生成的图片路径
        console.log(res.tempFilePath)

      }
    })
  },
  //取消图片预览编辑
  cancel_croper: function () {
    ctx.clearActions();
    this.setData({
      hide_canvas: true,
      // edit_url: tempFilePath
    })
  },
})
