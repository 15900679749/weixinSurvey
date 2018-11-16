//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    olddistance:"",//上一次两个手指的距离
    newdistance: "",//本次两手指之间的距离，两个一减咱们就知道了滑动了多少，以及放大还是缩小（正负嘛）  
    diffdistance: '', //这个是新的比例，新的比例一定是建立在旧的比例上面的，给人一种连续的假象  
    Scale: 1,//图片放大的比例，
    baseHeight: '',       //原始高  
    baseWidth: ''        //原始宽  
  },
  uploadTap() {
    let _this = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original'], 
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success(res) {
        wx.getImageInfo({
          src: res.tempFilePaths[0],
          success: function (res) {
            //console.log(res.width);
            //console.log(res.height);
            var str = res.width / res.height;//图片的宽高比
            if (str > 1) {//横版图片
              _this.data.height = 400;//图片的显示高度为400
              _this.data.width = str * _this.data.height; //图片的宽度 = 宽高比 * 图片的显示高度
            } else {//竖版图片
              _this.data.width = 400;//图片的显示宽度为400
              _this.data.height = str * _this.data.width; //图片的高度 = 宽高比 * 图片的显示宽度
            }
          }
        })
      }
    })
  },
  scroll: function (e) {
    var _this = this;
    //当e.touches.length等于1的时候，表示是单指触摸，我们要的是双指
    if (e.touches.length == 2) {//两个手指滑动的时候
      var xMove = e.touches[1].clientX - e.touches[0].clientX;//手指在x轴移动距离
      var yMove = e.touches[1].clientY - e.touches[0].clientY;//手指在y轴移动距离
      var distance = Math.sqrt(xMove * xMove + yMove * yMove);//根据勾股定理算出两手指之间的距离  
      if (_this.data.olddistance == 0) {
        _this.data.olddistance = distance; //要是第一次就给他弄上值，什么都不操作  
        // console.log("第一次");
      } else {
        _this.data.newdistance = distance; //第二次就可以计算它们的差值了  
        _this.data.diffdistance = _this.data.newdistance - _this.data.olddistance;//两次差值
        _this.data.olddistance = _this.data.newdistance; //计算之后更新比例  
        _this.data.Scale = _this.data.oldscaleA + 0.005 * _this.data.diffdistance;//这条公式是我查阅资料后找到的，按照这条公式计算出来的比例来处理图片，能给用户比较好的体验
        if (_this.data.Scale > 2.5) {//放大的最大倍数
          return;
        } else if (_this.data.Scale < 1) {//缩小不能小于当前
          return;
        }
        //刷新.wxml ，每次相乘，都是乘以图片的显示宽高
        _this.setData({
          height: _this.data.baseHeight * _this.data.Scale,
          width: _this.data.baseWidth * _this.data.Scale
        })
        _this.data.oldscaleA = _this.data.Scale;//更新比例 


      }
    }
  },
  endTou: function (e) {
    this.data.olddistance = 0;//重置
    this.getRect();
  },
  getRect: function () {
    var _this = this;
    wx.createSelectorQuery().select('.FilePath').boundingClientRect(function (rect) {
      _this.data.x = Math.abs(rect.left);//x坐标
      _this.data.y = Math.abs(rect.top);//y坐标
    }).exec()
  },
  generate: function () {
    var _this = this;
    const ctx_A = wx.createCanvasContext('myCanvas_A');
    var baseWidth = _this.data.baseWidth * _this.data.Scale;//图片放大之后的宽
    var baseHeight = _this.data.baseHeight * _this.data.Scale;//图片放大之后的高
    ctx_A.drawImage(_this.data.src, 0, 0, baseWidth, baseHeight);//我们要在canvas中画一张和放大之后的图片宽高一样的图片
    ctx_A.draw();
    wx.showToast({
      title: '截取中...',
      icon: 'loading',
      duration: 10000
    });//
    setTimeout(function () {//给延时是因为canvas画图需要时间
      wx.canvasToTempFilePath({//调用方法，开始截取
        x: _this.data.x,
        y: _this.data.y,
        width: 400,
        height: 400,
        destWidth: 400,
        destHeight: 400,
        canvasId: 'myCanvas_A',
        success: function (res) {
          console.log(res.tempFilePath);
        }
      })
    }, 2000)

  }
})
