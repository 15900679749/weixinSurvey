import api from '../../api/api.js';
import util from '../../utils/util.js';
var commonMixin = require('../../utils/commonMixin');

Page(Object.assign({

    /**
     * 页面的初始数据
     */
    data: {
      uid: "",
      qlist: {},
      questiontitle: "",
      questioncontent: "",
      qmlist: [],
      mustList: [],
      itemModList: [],
      ratio: 102 / 152,
      tagaction: false,
      addres: "",
      deviceWidth: "",
      deviceHeight: "",
      src: "",
      toView: "",
      array: ['美国', '中国', '巴西', '日本'],
      tempFilePaths: '',
      answerList: [],
      oitem: {},
      anserResult: {},
      multistageIni: "",
      Hosturl: "https://ffcmc.cn",
      options: [{
          name: 'USA',
          value: '美国'
        },
        {
          name: 'CHN',
          value: '中国',
          checked: 'true'
        }
      ],
      relateSub: [],
      changeItemModel: {}
    },
    radioChange: function(e) {
      var _this = this;
      var txtValue = e.detail.value;
      var rsModel = this.data.anserResult;
      var id = e.currentTarget.dataset.id;
      var lindex = e.currentTarget.dataset.lindex;
      var oindex = e.currentTarget.dataset.oindex;
      var mindex = e.currentTarget.dataset.hasOwnProperty("mindex") ? e.currentTarget.dataset.mindex : "";
      var gData = this.data.qmlist;
      if (rsModel[id] != undefined) {
        _this.setData({
          changeItemModel: gData[lindex].item[oindex]
        });
      }
      rsModel[id] = txtValue;
      var toViewid = "";
      rsModel[e.currentTarget.dataset.id] = txtValue;
      if (e.currentTarget.dataset.hasOwnProperty("mindex")) {
        gData[lindex].item[oindex].item[mindex].result = txtValue; // 保存选择过的内容;
        if (rsModel[id] != undefined) {
          _this.setData({
            changeItemModel: gData[lindex].item[oindex].item[mindex]
          });
        }
        for (var v = 0; v < gData[lindex].item[oindex].item[mindex].option.length; v++) {
          gData[lindex].item[oindex].item[mindex].option[v].default_choose = "0";
          if (txtValue == gData[lindex].item[oindex].item[mindex].option[v].id) {
            if (gData[lindex].item[oindex].item[mindex].option[v].skip_sub != "0") {
              toViewid = 'list' + gData[lindex].item[oindex].item[mindex].option[v].skip_sub;
            }
            if (this.data.changeItemModel.option.filter(o => o.id == txtValue).length > 0) {
              var osubidList = gData[lindex].item[oindex].item[mindex].option.filter(b => b.related_sub != "0");
              //移除当选提有关联选项
              for (var jj = 0; jj < osubidList.length; jj++) {
                var iindex = gData[lindex].item[oindex].item.indexOf(gData[lindex].item[oindex].item.filter(o => o.id == osubidList[jj].related_sub)[0]);
                if (iindex != -1) {
                  gData[lindex].item[oindex].item.splice(iindex, 1);
                }
              }
            }
            var subId = gData[lindex].item[oindex].item[mindex].option[v].related_sub;
            if (subId != "" && subId != "0") {
              var objItem = this.data.qlist[lindex].mod[oindex].item.filter(b => b.id == subId)[0];
              gData[lindex].item[oindex].item.splice(mindex + 1, 0, objItem);
            }
          }
        }
      } else {

        gData[lindex].item[oindex].result = txtValue; // 保存选择过的内容;
        //debugger
        for (var v = 0; v < gData[lindex].item[oindex].option.length; v++) {
          gData[lindex].item[oindex].option[v].default_choose = "0";
          if (txtValue == gData[lindex].item[oindex].option[v].id) {
            gData[lindex].item[oindex].option[v].default_choose = "1";
            //跳转逻辑
            if (gData[lindex].item[oindex].option[v].skip_sub) {
              toViewid = 'list' + gData[lindex].item[oindex].option[v].skip_sub;
            }
            // 关联逻辑
            if (this.data.changeItemModel.hasOwnProperty("id")) {
              var osubidList = gData[lindex].item[oindex].option.filter(b => b.related_sub != "0");
              //移除当选提有关联选项
              for (var jj = 0; jj < osubidList.length; jj++) {
                var iindex = gData[lindex].item.indexOf(gData[lindex].item.filter(o => o.id == osubidList[jj].related_sub)[0]);
                if (iindex != -1) {
                  gData[lindex].item.splice(iindex, 1);
                }
              }
            }
            var subId = gData[lindex].item[oindex].option[v].related_sub;
            if (subId != "" && subId != "0") {
              var objItem = this.data.qlist[lindex].item.filter(b => b.id == subId)[0];
              gData[lindex].item.splice(oindex + 1, 0, objItem);
            }
          }
        }
      }
      _this.setData({
        anserResult: rsModel,
        toView: toViewid,
        qmlist: gData
      });

    },
    inputgetValue: function(e) {
      var id = e.currentTarget.dataset.id;
      var txtValue = e.detail.value;
      var rsModel = this.data.anserResult;
      if (id.indexOf("_") != -1) {
        var nid = id.split('_')[0];
        var nname = id.split('_')[1];
        var model = rsModel[nid] ? rsModel[nid] : {
          "addresname": "",
          "locationName": ""
        };
        if (nname == "addresname") {
          model.addresname = txtValue;
        }
        if (nname == "locationName") {
          model.locationName = txtValue;
        }
        rsModel[nid] = model;
      } else {
        rsModel[id] = txtValue;
      }
      this.saveTogData();
      this.setData({
        anserResult: rsModel
      });
    },

    //保存对象定义值
    saveTogData() {
      var gData = this.data.qmlist;
      for (var kid in this.data.anserResult) {
        //debugger
        for (var k = 0; k < gData.length; k++) {
          if (gData[k].item != "") {
            var itemInfo = gData[k].item.filter(o => o.id == kid);
            if (itemInfo.length > 0) {
              itemInfo[0].result = this.data.anserResult[kid];
            }
          }
        }
      }
    },
    checkboxChange: function(e) {

      var id = e.currentTarget.dataset.id;
      var lindex = e.currentTarget.dataset.lindex;
      var oindex = e.currentTarget.dataset.oindex;
      var mindex = e.currentTarget.dataset.hasOwnProperty("mindex") ? e.currentTarget.dataset.mindex : "";
      var gData = this.data.qmlist;
      var txtValue = e.detail.value.join(',');
      var rsModel = this.data.anserResult;
      rsModel[e.currentTarget.dataset.id] = txtValue;
      this.saveTogData();
      this.setData({
        anserResult: rsModel
      });
      var changeModel = {};
      if (e.currentTarget.dataset.hasOwnProperty("mindex")) {
        changeModel = gData[lindex].item[oindex].item[mindex];
      } else {
        changeModel = gData[lindex].item[oindex];
      }
      for (var k = 0; k < changeModel.option.length; k++) {
        changeModel.option[k].default_choose = "0";
        if (txtValue.indexOf(changeModel.option[k].id) != -1) {
          changeModel.option[k].default_choose = "1";
        }
      }
      if (e.currentTarget.dataset.hasOwnProperty("mindex")) {
        gData[lindex].item[oindex].item[mindex] = changeModel;
      } else {
        gData[lindex].item[oindex] = changeModel;
      }
    },
    bindPickerChange: function(e) {

      var lindex = e.currentTarget.dataset.lindex;
      var oindex = e.currentTarget.dataset.oindex;
      var pindex = e.currentTarget.dataset.pindex;
      var mindex = e.currentTarget.dataset.mindex;
      var options = e.currentTarget.dataset.options;

      var gData = this.data.qmlist;
      var pvalue = parseInt(e.detail.value);
      var picList = [];
      var result = options[pvalue];
      if (e.currentTarget.dataset.hasOwnProperty("mindex")) {
        var bindItem = gData[lindex].item[oindex].item[mindex];
      } else {
        var bindItem = gData[lindex].item[oindex];
      }
      var dmodel = bindItem.pickerList[pindex];
      dmodel.result = result;
      dmodel.pindex = pvalue;
      bindItem.pickerList[pindex] = dmodel;
      var maxDefault = parseInt(bindItem.option[0].default_choose);

      //保存选择的答案
      var rsModel = this.data.anserResult;
      var sarrary = new Array(maxDefault);
      var saveValue = "";
      sarrary[pindex] = pvalue;
      var mvalue = [];
      if (rsModel.hasOwnProperty(e.currentTarget.dataset.id)) {
        mvalue = rsModel[e.currentTarget.dataset.id].split(",");
        mvalue[pindex] = pvalue;
        saveValue = mvalue.join(",");
      } else {
        saveValue = sarrary.join(",");
      }
      rsModel[e.currentTarget.dataset.id] = saveValue;
      this.saveTogData();
      this.setData({
        anserResult: rsModel
      });

      if (maxDefault > (pindex + 1)) {
        var nresult = "";
        var noption = bindItem.option[0].option_name[pindex + 1].childList;
        var sooption = noption.filter(a => a.label == result);
        var pmodel = {};
        pmodel.kindex = "kindex_" + (pvalue + 1);
        if (sooption.length > 0) {
          var narrary = sooption[0].value.split(',');
          for (var m = 0; m < narrary.length; m++) {
            m == 0 && (nresult = narrary[m])
            picList.push(narrary[m]);
          }
        }
        pmodel.pindex = 0;
        pmodel.result = nresult;
        pmodel.options = picList;
        bindItem.pickerList[pindex + 1] = pmodel;
      }
      this.setData({
        qmlist: gData
      });
    },
    slider4change: function(e) {
      var txtValue = e.detail.value;
      var rsModel = this.data.anserResult;
      rsModel[e.currentTarget.dataset.id] = txtValue;
      this.saveTogData();
      this.setData({
        anserResult: rsModel
      });
    },
    gotoShow: function(e) {
      var _this = this;
      var lindex = e.currentTarget.dataset.lindex;
      var oindex = e.currentTarget.dataset.oindex;
      var imgindex = e.currentTarget.dataset.imgindex;
      var mindex = e.currentTarget.dataset.mindex || "";
      var id = e.currentTarget.dataset.id;


      wx.chooseImage({
        count: 1, // 默认9
        sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
        sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
        success(res) {
          //console.log("1");
          console.log("res=" + JSON.stringify(res));

          var gData = _this.data.qmlist;
          var rsModel = _this.data.anserResult;
          var hosturl = res.tempFilePaths[0];
          console.log("hosturl=" + hosturl);
          if (mindex != "") {
            gData[lindex].item[oindex].item[mindex].imgListObj[imgindex].upsrc = hosturl;
            gData[lindex].item[oindex].item[mindex].imgListObj[imgindex].tagaction = true;
            rsModel[id] = gData[lindex].item[oindex].item[mindex].imgList;
          } else {
            gData[lindex].item[oindex].imgListObj[imgindex].upsrc = hosturl;
            gData[lindex].item[oindex].imgListObj[imgindex].tagaction = true;
            rsModel[id] = gData[lindex].item[oindex].imgList;
          }
  
          _this.setData({
            qmlist: gData,
            anserResult: rsModel
          });
        }
      });

      return false;
      wx.chooseImage({
        count: 9, // 最多可以选择的图片张数，默认9
        sizeType: ['original', 'compressed'], // original 原图，compressed 压缩图，默认二者都有
        sourceType: ['album', 'camera'], // album 从相册选图，camera 使用相机，默认二者都有
        success: function(res) {
          var hosturl = ""
          const tempFilePaths = res.tempFilePaths
          wx.uploadFile({
            url: _this.data.Hosturl + '/index.php/Api/Answer/upload', //仅为示例，非真实的接口地址
            filePath: tempFilePaths[0],
            header: {
              "Content-Type": "multipart/form-data",
              'accept': 'application/json',
            },
            name: 'file',
            formData: {
              'openid': wx.getStorageSync("userOpenid")
            },
            success(res) {
              const data = JSON.parse(res.data);
              var gData = _this.data.qmlist;
              var rsModel = _this.data.anserResult;
              var hosturl = _this.data.Hosturl + data.data.uploadPath;
              var nobj = {
                "src": hosturl,
                tagaction: true,
                "upsrc": ""
              };
              if (mindex != "") {
                gData[lindex].item[oindex].item[mindex].imgList[imgindex] = hosturl;
                gData[lindex].item[oindex].item[mindex].imgListObj[imgindex] = nobj;
                rsModel[id] = gData[lindex].item[oindex].item[mindex].imgList;
              } else {
                gData[lindex].item[oindex].imgList[imgindex] = hosturl;
                gData[lindex].item[oindex].imgListObj[imgindex] = nobj;
                rsModel[id] = gData[lindex].item[oindex].imgList;
              }
              _this.setData({
                qmlist: gData,
                anserResult: rsModel,
              });
            }
          })
        },

        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    },
    getCropperImg(e) {
      var _this = this;
      var lindex = e.currentTarget.dataset.lindex;
      var oindex = e.currentTarget.dataset.oindex;
      var imgindex = e.currentTarget.dataset.imgindex;
      var mindex = e.currentTarget.dataset.mindex || "";
      var id = e.currentTarget.dataset.id;
      console.log(e.detail.url)
      wx.uploadFile({
        url: _this.data.Hosturl + '/index.php/Api/Answer/upload', //仅为示例，非真实的接口地址
        filePath: e.detail.url,
        header: {
          "Content-Type": "multipart/form-data",
          'accept': 'application/json',
        },
        name: 'file',
        formData: {
          'openid': wx.getStorageSync("userOpenid")
        },
        success(res) {
         
          const data = JSON.parse(res.data);
          var gData = _this.data.qmlist;
          var rsModel = _this.data.anserResult;
          var hosturl = _this.data.Hosturl + data.data.uploadPath; //e.detail.url; 
          var nobj = {
            "src": hosturl,
            tagaction: true,
            "upsrc": e.detail.url
          };
          //debugger
          if (mindex != "") {
            gData[lindex].item[oindex].item[mindex].imgList[imgindex] = hosturl;
            gData[lindex].item[oindex].item[mindex].imgListObj[imgindex] = nobj;
            rsModel[id] = gData[lindex].item[oindex].item[mindex].imgList;
          } else {
            gData[lindex].item[oindex].imgList[imgindex] = hosturl;
            gData[lindex].item[oindex].imgListObj[imgindex] = nobj;
            rsModel[id] = gData[lindex].item[oindex].imgList;
          }

          _this.setData({
            qmlist: gData,
            anserResult: rsModel,
          });
        }
      });

    },
    chooseImage: function(e) {

      var _this = this;
      var lindex = e.currentTarget.dataset.lindex;
      var oindex = e.currentTarget.dataset.oindex;
      var imgindex = e.currentTarget.dataset.imgindex;
      var mindex = e.currentTarget.dataset.mindex || "";
      var id = e.currentTarget.dataset.id;
      var current = e.currentTarget.dataset.src;
      var previewList = [];
      var rsModel = _this.data.anserResult;
      for (var kname in rsModel[id]) {
        if (rsModel[id][kname] != "") {
          previewList.push(rsModel[id][kname]);
        }
      }
      wx.previewImage({
        current: current,
        urls: previewList
      });
    },
    deleteImage: function(e) {
      var _this = this;
      var lindex = e.currentTarget.dataset.lindex;
      var oindex = e.currentTarget.dataset.oindex;
      var imgindex = e.currentTarget.dataset.imgindex;
      var mindex = e.currentTarget.dataset.mindex || "";
      var id = e.currentTarget.dataset.id;
      var gData = this.data.qmlist;
      var current = e.currentTarget.dataset.src;
      var previewList = [];
      var rsModel = _this.data.anserResult;
      wx.showModal({
        title: '提示',
        content: '确定要删除此图片吗？',
        success: function(res) {
          if (res.confirm) {
            var bindItem = [];
            var bindItems = [];
            if (mindex != "") {
              bindItem = gData[lindex].item[oindex].item[mindex].imgListObj;
              bindItems = gData[lindex].item[oindex].item[mindex].imgList;
            } else {
              bindItem = gData[lindex].item[oindex].imgListObj;
              bindItems = gData[lindex].item[oindex].imgList;
            }
            bindItem.splice(imgindex, 1, {
              "src": "",
              tagaction: false,
              "upsrc": ""
            });
            bindItems.splice(imgindex, 1, "");
            rsModel[id] = bindItems;

            _this.savequestion(e);


            _this.setData({
              qmlist: gData,
              anserResult: rsModel,
            });
          } else if (res.cancel) {
            return false;
          }
        }
      })
    },
    getLocation: function(lindex, oindex, id, mindex) {
      let vm = this;
      wx.getLocation({
        type: 'wgs84',
        success: function(res) {
          // var latitude = res.latitude
          // var longitude = res.longitude
          wx.chooseLocation({
            success: function(res) {
              var addresname = res.address;
              var latitude = res.latitude;
              var longitude = res.longitude;
              var locationName = res.name;
              var rsModel = vm.data.anserResult;
              var gData = vm.data.qmlist;
              // rsModel[id] = addresname + "--" + locationName + ",latitude=" + latitude + ",longitude=" + longitude;
              rsModel[id] = {
                "addresname": addresname,
                "locationName": locationName
              }

              if (mindex != "") {
                gData[lindex].item[oindex].item[mindex].result = {
                  "addresname": addresname,
                  "locationName": locationName
                }
              } else {
                gData[lindex].item[oindex].result = {
                  "addresname": addresname,
                  "locationName": locationName
                }
              }
              vm.setData({
                qmlist: gData,
                anserResult: rsModel,
              });
              //vm.saveTogData();
              //主要保存 选择的地区  执行show方法

              vm.saveLocation();


            }
          })
        }
      })
    },
    getUserLocation: function(lindex, oindex, id, mindex) {
      let vm = this;
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
            wx.showModal({
              title: '请求授权当前位置',
              content: '需要获取您的地理位置，请确认授权',
              success: function(res) {
                if (res.cancel) {
                  wx.showToast({
                    title: '拒绝授权',
                    icon: 'none',
                    duration: 1000
                  })
                } else if (res.confirm) {
                  wx.openSetting({
                    success: function(dataAu) {
                      if (dataAu.authSetting["scope.userLocation"] == true) {
                        wx.showToast({
                          title: '授权成功',
                          icon: 'success',
                          duration: 1000
                        })
                        vm.getLocation(lindex, oindex, id, mindex);
                      } else {
                        wx.showToast({
                          title: '授权失败',
                          icon: 'none',
                          duration: 1000
                        })
                      }
                    }
                  })
                }
              }
            })
          } else if (res.authSetting['scope.userLocation'] == undefined) {
            //调用wx.getLocation的API
            vm.getLocation(lindex, oindex, id, mindex);
          } else {
            //调用wx.getLocation的API
            vm.getLocation(lindex, oindex, id, mindex);
          }
        }
      })
    },
    btnchoose(e) {
      var id = e.currentTarget.dataset.id;
      var lindex = e.currentTarget.dataset.lindex;
      var oindex = e.currentTarget.dataset.oindex;
      var mindex = e.currentTarget.dataset.mindex || "";
      this.getUserLocation(lindex, oindex, id, mindex);
    },
    tagitem: function(e) {
      var index = e.target.dataset.lindex;
      var ndata = this.data.qmlist;
      ndata[index].isShow = !ndata[index].isShow;
      this.setData({
        qmlist: ndata
      });
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      var that = this;
      //页面初始化options为页面跳转所带来的参数 res.windowHeight
      util.getSystemInfo({
        success: (res) => {
          that.setData({
            deviceWidth: res.windowWidth,
            deviceHeight: res.windowHeight
          });
        }
      });
      var uid = options.uid;
      this.setData({
        uid: uid
      });
      this.getDataInitialization(this.data.uid);
    },
    getDataInitialization(uid) {

      this.getData(uid).then(res => {

        var sData = res;
        var dist = sData.mod;
        var itemDist = JSON.parse(JSON.stringify(dist));
        var nlist = [];
        var itemmodList = [];
        var AnserList = [];
        this.setData({
          questiontitle: res.sub_name || '',
          questioncontent: res.description || ''
        })

        for (var i = 0; i < dist.length; i++) {

          var mm = dist[i];

          mm.isShow = i == 0 ? true : false;
          if (!!mm.mod && mm.mod.length != 0) { //mm.item[i].item！=0

            for (var j = 0; j < mm.mod.length; j++) {
              mm.mod[j].sub_cat = 'comprehensive';
              mm.mod[j].title = mm.mod[j].mod_name;
              if (mm.hasOwnProperty("item") && mm.item.length == 0) {
                mm.item = [];
              }
              mm.item.push(mm.mod[j]);
            }
            for (var w = 0; w < mm.item.length; w++) {
              var related = mm.item[w].serial_number;
              if (mm.item[w].hasOwnProperty("item")) {
                this.itemResult(mm.item[w].item, AnserList, related);
              }
            }
          }
          this.itemResult(mm.item, AnserList, related);
          nlist.push(mm);
        }
        // 初始化有关联的题目不加载 2018.10.28
        var resultList = [];
        for (var i = 0, k = nlist.length; i < k; i++) {
          var items = nlist[i];
          var item = [];
          var ncitem = [];
          for (var m = 0, n = items.item.length; m < n; m++) {
            if (items.item[m].sub_cat == "comprehensive") {
              var citem = items.item[m].item;
              for (var op = 0; op < citem.length; op++) {
                if (this.data.relateSub.filter(o => o.id == citem[op].id).length == 0) {
                  ncitem.push(citem[op]);
                }
              }
              items.item[m].item = ncitem;
              item.push(items.item[m]);
            } else {
              if (this.data.relateSub.filter(o => o.id == items.item[m].id).length == 0) {
                item.push(items.item[m]);
              }
            }
          }
          if (item.length > 0) {
            items.item = item;
          }
          resultList.push(items);
        }
        //答案回显 需要追加到具体位置
        for (var i = 0, qq = resultList.length; i < qq; i++) {
          var items = resultList[i];
          var item = [];
          for (var m = 0, n = items.item.length; m < n; m++) {
        
            if (items.item[m].sub_cat == "single") {
              if (items.item[m].result != null && items.item[m].result != "" && items.item[m].result != "0") {
                var options = items.item[m].option.filter(o => o.id == items.item[m].result)[0];
                if (options.default_choose == "1") {
                  this.data.changeItemModel = items.item[m];
                  var objItem = itemDist[i].item.filter(b => b.id == options.related_sub);
                  if (objItem.length > 0) {
                    objItem = objItem[0];
                    if (objItem.result && typeof(JSON.parse(objItem.result)) == "object") {
                      var nameAll = JSON.parse(objItem.result);
                      objItem.result = nameAll;
                    }
                    objItem && (resultList[i].item.splice(m + 1, 0, objItem))
                  }
                }
              }
            } else if (items.item[m].sub_cat == "comprehensive") {
              var citems = items.item[m];
              for (var k = 0, qm = citems.item.length; k < qm; k++) {
                if (citems.item[k].sub_cat == "single") {
                  if (citems.item[k].result != null && citems.item[k].result != "" && citems.item[k].result != "0") {
                    var options = citems.item[k].option.filter(o => o.id == citems.item[k].result)[0];
                    if (options.default_choose == "1") {
                      this.data.changeItemModel = citems.item[k];
                      var objItem = itemDist[i].mod[0].item.filter(b => b.id == options.related_sub);
                      if (objItem.length > 0) {
                        objItem = objItem[0];
                        if (objItem.result && typeof(JSON.parse(objItem.result)) == "object") {
                          var nameAll = JSON.parse(objItem.result);
                          objItem.result = nameAll;
                        }
                        objItem && (resultList[i].item[0].item.splice(k + 1, 0, objItem))
                      }
                    }
                  }
                }
              }
            }
          }
        }
        this.setData({
          qlist: itemDist,
          qmlist: resultList
        });

      });
    },
    getData: function(uid) {
      var _this = this;
      return new Promise((resolve, reject) => {
        api.getAppSubInfo({
          data: {
            id: uid
          },
          success: (res) => {
            resolve(res.data.data);
          },
          fail: res => {
            reject(res);
          }
        });
      });
    },
    itemResult: function(modelItem, AnserList, related) { //modelItem= mm.item

      for (var k = 0; k < modelItem.length; k++) {
        modelItem[k].serial_number = parseInt(modelItem[k].serial_number);
        if (modelItem[k].sub_cat == "single") {
          for (var q = 0; q < modelItem[k].option.length; q++) {
            if (modelItem[k].option[q].related_sub != "0") {
              var sublist = this.data.relateSub;
              sublist.push({
                "id": modelItem[k].option[q].related_sub,
                "serial_number": modelItem[k].serial_number
              });
              this.setData({
                relateSub: sublist
              })

            }
            if (modelItem[k].result) {
              var df = "0";
              var res = modelItem[k].result;
              var rid = modelItem[k].option[q].id;
              if (res.indexOf(rid) != -1) {
                df = "1";
              }
              modelItem[k].option[q].default_choose = df;
            }
          }
        }
        if (modelItem[k].sub_cat == "multistage") {
          var picList = [];
          var count = parseInt(modelItem[k].option[0].default_choose);
          var resArrary = [];
          if (!!modelItem[k].result) {
            resArrary = modelItem[k].result.split(",");
          } else {
            for (var mm = 0; mm < count; mm++) {
              resArrary.push(0);
            }
          }
          var clist = modelItem[k].option[0].option_name;
          if (clist != null) {
            for (var j = 0; j < count; j++) {
              var pmodel = {};
              pmodel.kindex = "kindex_" + (j + 1);
              pmodel.options = [];
              pmodel.result = "";
              if (j > 0) {
                if (this.data.multistageIni != "") {
                  var noption = clist[j].childList.filter(a => a.label == this.data.multistageIni);
                  var narrary = noption[0].value.split(',');
                  for (var m = 0; m < narrary.length; m++) {
                    pmodel.options.push(narrary[m]);
                    if (resArrary[j] == m) {
                      pmodel.result = narrary[m];
                    }
                  }
                } else {
                  for (var m = 0; m < clist[j].options.length; m++) {
                    if (clist[j].svalue != "" && modelItem[k].result == "") {
                      m == 0 && (pmodel.result = clist[j].svalue);
                    } else {
                      m == 0 && (pmodel.result = clist[j].options[m].value);
                    }
                    pmodel.options.push(clist[j].options[m].value);
                  }
                }
              } else {
                for (var m = 0; m < clist[j].options.length; m++) {
                  m == 0 && (pmodel.result = clist[j].options[m].value);
                  pmodel.options.push(clist[j].options[m].value);
                }
              }
              pmodel.pindex = resArrary[j] == "" ? 0 : parseInt(resArrary[j]);
              if (resArrary[j] != "") {
                pmodel.result = pmodel.options[parseInt(resArrary[j])];
              }
              this.setData({
                multistageIni: pmodel.result
              });
              picList.push(pmodel);
            }
          }
          modelItem[k].pickerList = picList;
        }
        if (modelItem[k].sub_cat == "multiple") {
          for (var q = 0; q < modelItem[k].option.length; q++) {
            if (modelItem[k].result) {
              var df = "0";
              var res = "," + modelItem[k].result + ",";
              var rid = "," + modelItem[k].option[q].id + ",";
              if (res.indexOf(rid) != -1) {
                df = "1";
              }
              modelItem[k].option[q].default_choose = df;
            }
          }
        }
        if (modelItem[k].sub_cat == "loCation") {
          if (modelItem[k].result && typeof(JSON.parse(modelItem[k].result)) == "object") {
            var nameAll = JSON.parse(modelItem[k].result);
            modelItem[k].result = nameAll;
            //modelItem[k].result = { "addresname": "222", "locationName": "33333" };
            // JSON.parse(modelItem[k].result).addresname = nameAll.addresname;
            // JSON.parse(modelItem[k].result).locationName = nameAll.locationName;
          }

        }
        if (modelItem[k].sub_cat == "uploadimg") {

          //2018.10.31 图片上传 需要分开数组
          var imgList = [];
          var imgListObj = [];

          for (var mm = 0; mm < modelItem[k].option[0].option_name; mm++) {
            imgList.push("");

            // 增加控制图片裁剪 2018.11.12
            imgListObj.push({
              "src": "",
              tagaction: false,
              "upsrc": ""
            });
          }

          if (modelItem[k].result) {
            var imgResult = JSON.parse(modelItem[k].result);
            for (var ly = 0; ly < imgResult.length; ly++) {
              imgListObj[ly] = {
                "src": imgResult[ly],
                tagaction: imgResult[ly] ? true : false,
                "upsrc": "", //imgResult[ly] ? imgResult[ly] : ""
              }
            }
            imgList = imgResult;
          }
          modelItem[k].imgList = imgList;
          modelItem[k].imgListObj = imgListObj;
          var resid = modelItem[k].id;
          var model = this.data.anserResult;
          model[resid] = imgList;
          this.setData({
            anserResult: model
          });
        }
        modelItem.sort(function(a, b) {
          return a.serial_number - b.serial_number;
        });
        // 结束
        if (modelItem[k].result) {
          AnserList.push({
            "id": modelItem[k].id,
            "result": modelItem[k].result
          })
          this.setData({
            answerList: AnserList
          })
        }
        if (modelItem[k].is_must == "1") {
          this.data.mustList.push({
            "id": modelItem[k].id,
            "questionname": modelItem[k].title
          });
        }
      }
    },
    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function() {
      //this.getDataInitialization(this.data.uid);
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function() {

    },
    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function() {

    },
  exit:function(){
    wx.navigateBack({ changed: false });
  },
    savequestion: function(e) {

      var _this = this;
      // var anserList = this.data.answerList.push;
      console.log(JSON.stringify(this.data.anserResult));

      var forinModel = this.data.anserResult;
      for (var mkey in forinModel) {
        for (var i = 0; i < _this.data.answerList.length; i++) {
          if (_this.data.answerList[i].id == mkey) {

            _this.data.answerList.splice(i, 1)
          }
        }
        _this.data.answerList.push({
          "id": mkey,
          "result": forinModel[mkey]
        });
      }
      console.log(_this.data.answerList)
      var saveModel = {};
      saveModel.id = this.data.uid;
      saveModel.ans_status = e.target.dataset.save;
      for (var i = 0; i < this.data.answerList.length; i++) {
        if (typeof(this.data.answerList[i].result) == 'object') {
          this.data.answerList[i].result = JSON.stringify(this.data.answerList[i].result)
        }
      }
      saveModel.data = JSON.stringify(_this.data.answerList);
      if (e.target.dataset.save == "2") {
        for (var q = 0; q < _this.data.mustList.length; q++) {
          for (var b = 0; b < _this.data.answerList.length; b++) {

            // if (!_this.data.answerList[b][_this.data.mustList[q].id]) {
            var ansMolde = _this.data.answerList.filter(o => o.id == _this.data.mustList[q].id);
            if (ansMolde.length == 0 || ansMolde[0].result == "") {
              // debugger
              wx.showModal({
                title: '提示',
                content: "题目:" + _this.data.mustList[q].questionname + "为必答题，请作答后再提交",
                success: function(res) {
                  // _this.getDataInitialization(_this.data.uid);
                }
              })
              return
            }
          }
        }
      }

      api.getAppAnswerSave({
        data: saveModel,
        success: (res) => {
          console.log(res);
          if (e.type != "longpress") {
            wx.showModal({
              title: '提示',
              content: "保存成功！",
              success: function(res) {
                if (e.target.dataset.save == "2") {
                  wx.switchTab({
                    url: '/pages/myproject/myproject',
                    fail: function() {}
                  });
                }

              }
            })
          }

          _this.getDataInitialization(this.data.uid);



        }
      });
    },
    submitquestion: function() {

    },
    submitSaveitem: function() {

    },
    saveLocation() {
      var _this = this;
      console.log(JSON.stringify(this.data.anserResult));
      var forinModel = this.data.anserResult;
      for (var mkey in forinModel) {
        for (var i = 0; i < _this.data.answerList.length; i++) {
          if (_this.data.answerList[i].id == mkey) {
            _this.data.answerList.splice(i, 1)
          }
        }
        _this.data.answerList.push({
          "id": mkey,
          "result": forinModel[mkey]
        });
      }
      console.log(_this.data.answerList)
      var saveModel = {};
      saveModel.id = this.data.uid;
      saveModel.ans_status = "1";
      for (var i = 0; i < this.data.answerList.length; i++) {
        if (typeof(this.data.answerList[i].result) == 'object') {
          this.data.answerList[i].result = JSON.stringify(this.data.answerList[i].result)
        }
      }
      saveModel.data = JSON.stringify(_this.data.answerList);
      api.getAppAnswerSave({
        data: saveModel,
        success: (res) => {
          console.log(res);
        }
      });
    }
  },
  commonMixin));