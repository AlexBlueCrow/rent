 //index.js


//获取应用实例
const app = getApp()
var url = app.globalData.serverurl
var n=0
var userLat = null
var userLon = null
var Bmap = require('../../libs/bmap-wx.js'); 
var wxMarkerData = [];
var ak='1c49OwFPRHs80bPsHM065qQnyhtpGqKj'; 
var doommList = []
var i=0
var page = undefined
var top = undefined
var target=-1

Page({
   //data
  data: {
    doommData:[],
    add_region:'',
    add_detail:'',
    showComment:false,
    showGetTree:false,
    showCerti:false,
    showShare:false,
    showReward:false,
    showGift:false,
    showQuestion:true,
    showGetGift:false,
    showGiftSuc:false,
    answer_disable:false,
    region:['test','2','3'],
    addRegion: ['浙江省', '杭州市', '西湖区'],
    
    //item_info
    items:{

    },
    displayed : 0,
    itemInfo:{},
    farmInfo:{},
    farmLoc:{
      lon:0,
      lat:0,
    },
    distance:0,
    cityName: '',
    countyName: '',
    detailInfo: '',
    provinceName: '',
    userName: '', 
    phoneNum:'', 
    address:'',
    danmulist: [],
    questions: {},
    video_url:'',
    pic_url:'',
    end_question:false,
    //
    touchDotY:0,
    touchMoveY:0,
    ismove:0,
    current_order:0,
    //question
    orderInfo:{},
    current_question:0,
    question_text:'',
    option_A:'',
    option_B:'',
    option_C:'',
    option_D:'',
    correct_answer:'',
    anw_color:{
      'A':'black',
      'B':'black',
      'C':'black',
      'D':'black',
    },
    cur_reward:0,
    num_cor:0,
    total_reward:0,
    num_correct:0,
    

    userInfo: {},
    hasUserInfo: false,
    
    
  },
  //事件处理函数
  //取得Item信息
  onLoad: function (para){
    var that=this
    page = this
    if (para.item_id){
      
      target=para.item_id
    }
    that.getUserAuth()
    that.getUserLoc()
    that.getOrders()
    that.getWxUserInfo() 
    console.log('para',para)
    
  },

  onReady:function(){ 
    
    
    this.videoContext = wx.createVideoContext('item_video')    
    wx.showToast({
      title: '上下滑切换视频',
      icon:'',
      duration:3000,
    })
    this.danmuStart()
  },

  getOrders:function(){
    var that = this
    wx.login({
      success(res) {
        wx.request({
          url: url +"/dataserver/getOrderInfo/",
          data: {
            code:res.code
          },
          success(res){
              if(res){
              that. setData({
                orderInfo:res.data
              })
            }
            console.log('orderInfo:',that.data.orderInfo)
          }
        })
      }
    })
  },
  paySuc:function(){
    var that = this
    that.getOrders()
    setTimeout(() => {
      that.setData({
        showGetTree:false,
        showCerti:true,
      })
    }, 800);    
  },
  getItemInfo: function (lat,lon) {
    var that = this
    wx.request({
      url: url+'/dataserver/getItem/',
      data: {
        lat:lat,
        lon:lon,    
      },
      header: {
        'Content-Type': 'application/json'
      },
      success(res) {
        that.setData({
          items:res.data

        })
        if (target>=0){
          console.log('tar',target)
          var index = that.findIndexof(target)
          console.log('index',index)
          that.setData({
            displayed:index,
          })
          target=-1
        }    
        that.display_item(that.data.displayed)
      },
      fail(res){
        console.log('fail:',res)
        wx.showToast({
          title: '网络异常',
          image: '/images/icon/close_47.png,',
          duration: 5000,
          mask: true,      
        })
      }
    })
  },

  getFarmInfo:function(){
    var that = this
    wx.request({
      url: url+'/dataserver/getFarmInfo/',
      data:{
        farm:that.data.itemInfo.owner
      },
      success(res){
        that.setData({
          farmInfo:res.data[0]
        })       
      }
    })
  },

  getQuestions:function(){
    var that = this 
    wx.request({
      url: url+'/dataserver/getQuestions/',
      data:{
        cate:that.data.itemInfo.category
      },
      header: {
        'Content-Type': 'application/json'
      },
      success(res){        
        if(res.data){
          that.setData({
            questions:res.data,
            current_question:0,
            total_reward:0,
            num_correct:0,
          })
        }else{
          console.log('getQ.fail')       
        }
        that.updateQue()
      }
    })
  },
  getComments:function(){
    var that = this
    wx.request({
      url: url+'/dataserver/getComments/',    
      data:{
        item_id:that.data.itemInfo.id
      },
      success(res){
        if (res.errMsg == "request:ok"){
          that.setData({
            comments:res.data,
            danmulist:[],   
          })
          for (var comment of that.data.comments){
            var speed = Math.ceil(10 - comment.comment_text.length / 5)
            var danmu={
              text:comment.comment_text, 
              color:'#FFFFFF',
              time:speed,
              speed:speed,
              top: 10+Math.ceil(Math.random() * 6)*6,
            } 
            that.data.danmulist.push(danmu) 
          }
          that.setData({
            danmulist: that.data.danmulist
          })
        } 
      }
    })
  },
  redtoGettree:function(){
    var that = this
    this.setData({
      showCerti:false,
      showGetTree:true,
    })
  },
  newDanmu:function(e){
    var that = this
    var danmu = e.detail
    that.data.danmulist.push(e.detail)
    that.setData({
      danmulist:that.data.danmulist
    })
    console.log('danmulist:',that.data.danmulist)
    console.log(doommList)
    doommList.push(new Doomm(danmu.text, danmu.top, danmu.speed,danmu.color));
    console.log(doommList)
    that.setData({
      doommData: doommList
    }) 
    console.log('doommdata:',that.data.doommData)
  },

  

  updateQue: function () {
    var that = this
    var cur =that.data.current_question
    
    that.setData({
      question_text: that.data.questions[cur].question_text,
      option_A: that.data.questions[cur].option_A,
      option_B: that.data.questions[cur].option_B,
      option_C: that.data.questions[cur].option_C,
      option_D: that.data.questions[cur].option_D,
      correct_answer:that.data.questions[cur].correct_answer,
      cur_reward:that.data.questions[cur].question_reward,
      showReward:false,
      showQuestion:true,
      answer_disable:false,
      anw_color:{
        'A': 'black',
        'B': 'black',
        'C': 'black',
        'D': 'black',
      }     
    })
  },
  checkanswer: function (e) {
    var that = this
    if(!that.data.answer_disable){
      if (!that.data.end_question){
        if (e.currentTarget.dataset.answer == that.data.correct_answer) {
          that.setData({
            total_reward: that.data.total_reward + that.data.cur_reward,
            num_correct:that.data.num_correct+1,
          })
        }else{
          that.data.anw_color[e.currentTarget.dataset.answer]='#F75000'//答错提示颜色        
        }
        that.data.anw_color[that.data.correct_answer] = '#00BB00'
        that.setData({
          anw_color:that.data.anw_color,
          answer_disable:true
        })
      }
      if (that.data.current_question >= that.data.questions.length-1) {
        
        that.setData({
          showReward: true,
          end_question:true,
        })
      } else {
        setTimeout(function(){
          that.setData({
            current_question: that.data.current_question + 1
          })
          that.updateQue();
        },1000)
      }
    }else {
      if (that.data.end_question){
        that.setData({
          showReward: true,
          end_question: true,
        })
      } 
    }
  },
  showCorAns:function(anw,cor){
    var that = this
    if (anw == cor)
    that.setData({ 
    })
  },
  testVar:function(){
    console.log("skey_in_storage,skey:", wx.getStorageSync('skey'))
  },
  video_tap:function(){
    if (n==0){
      this.videoContext.pause() 
      n=1
    }else{
      this.videoContext.play()
      n=0
    }  
  },
  video_touchStart: function (e) {
    var that = this
    var touchDotY = e.touches[0].pageY
    that.setData({
      touchDotY: touchDotY,
    })
  },  
  video_touchMove:function(e){
    var that=this
    var touchMoveY = e.touches[0].pageY
    that.setData({
      touchMoveY: touchMoveY, //把触摸移动后的高度记录下来
      ismove: 1 //证明移动了
    })
  },
  video_touchEnd:function(e){
    var that =this;
    var touchDotY = that.data.touchDotY;
    var touchMoveY = that.data.touchMoveY;
    if (touchMoveY ==0 || that.data.ismove == 0){
      return 'fail';
    }
    if (touchMoveY - touchDotY>100){
      if(that.data.displayed > 0){
        this.display_item(that.data.displayed-1)
      
        that.setData({
          displayed: that.data.displayed-1,
          touchDotY:0,
          touchMoveY:0,
        })
      }else{
        that.setData({
          displayed: that.data.items.length,
          touchDotY: 0,
          touchMoveY: 0,
        })
      }
    }
    if (touchDotY - touchMoveY>100){
      console.log(that.data.displayed, that.data.items.length - 1)
      if(that.data.displayed<(that.data.items.length-1)){
        this.display_item(that.data.displayed+1)
        that.setData({
          touchDotY: 0,
          touchMoveY: 0,
          displayed: that.data.displayed + 1,
        })
      }else{
        this.display_item(0)
        that.setData({
          touchDotY: 0,
          touchMoveY: 0,
          displayed: 0,
        })
      }
    }
  },

  

  showShare:function(e){
    this.setData({
      showShare :true
    })
  },

  showComment:function(){
    this.setData({
      showComment:true
    })
    
  },

  showGetTree: function () {
    var that =this
    
    this.setData({
      showGetTree:true
    })
  },
    
  goToshowGetTree: function () {
    this.setData({
      showGetTree: true,
      showReward:false
    })

  },

  showCerti:function(){
    this.setData({
      showCerti:true,
    })

  },
  customservice:function(e){
  },
  preventTouchMove: function (){
  },
  hideComment:function(){
    this.setData({
      showComment:false
    })
  },
  onSendComment: function () {
    wx.showToast({
      title: '提交成功',
      icon: 'success',
      duration: 1200
    })
    this.hideModal();
  },
  closewindow_reward: function () {
    this.setData({
      showReward: false,
    })
  },
  closewindow_gift: function () {
    this.setData({
      showGift: false,
      wrongcode:false,
    })
  },

  closewindow_getgift: function () {
    this.setData({
      showGetGift: false,
    })
  },
  closewindow_giftsuc: function () {
    this.setData({
      showGiftSuc:false,
    })
  },


  display_item:function(displayed){
    var that = this
    that.setData({
      itemInfo:that.data.items[displayed],
      doommData:[],
      doommList:[],

    })

    that.setData({

      video_url: url + '/static/video/' + that.data.itemInfo.video_address,
      pic_url: url + '/static/pic/' + that.data.itemInfo.pic_address,
      answer_disable:false,
      end_question:false,
      
    })
    that.getQuestions()
    that.getComments()
    that.getFarmInfo()
    that.getDistance()
  },

  reDo:function(){
    var that=this
    that.setData({
      total_reward:0,
      current_question:0,
      end_question:false,
      num_correct:0,
    })
    this.updateQue()
  },
  getUserAuth:function(){
    wx.getSetting({
      success(res){
        console.log('getAuth:', res.authSetting['scope.userLocation'])
        if (!res.authSetting['scope.userLocation']) {
          wx.authorize({
            scope: 'userLocation',
          })
        }
        if (!res.authSetting['scope.address']){
          wx.authorize({
            scope: 'address',
          })
        }
        if(!res.authSetting['scope.userinfo']){
          wx.authorize({
            scope: 'userinfo',
          })
        }
      },
      fail(res){
        console('getUAu.fail',res)
      }
    })
  },
  getUserLoc:function(lat,lon){
    var that = this
    wx.getLocation({
      success: function(res) {
        userLat=res.latitude
        userLon=res.longitude
        console.log('getLocSuc:',userLat,userLon)
        that.getItemInfo(userLat,userLon)
      },
      fail:function(res){
        that.getItemInfo(30,120)
      }
    })
  },

  getFarmLoc:function(){
    var that =this
    var Bmap = new Bmap.BMapWX({
      ak: ak
    }); 
    var fail=function(data){
      console.log(data)
    };
    var success=function(data){
      var that=this
      console.log('farmLocSU',data)
      wxMarkerData = data.wxMarkerData;
      that.setData({
        markers: wxMarkerData
      });
      that.setData({
        farmLoc: {lat:wxMarkerData[0].latitude,
                  lon: wxMarkerData[0].longitude
        }
      })
      that.getDistance()
      
    };
    console.log(that.data.farmInfo.farm_addrress)
    bMap.geocoding({
      address: that.data.farmInfo.farm_addrress,
      fail: fail,
      success: success,
      iconPath: '',
      iconTapPath: ''
    });  
    
  },

  getDistance:function(){
    var that = this
   
    var farmLat = that.data.farmLoc.lat
    var farmLon = that.data.farmLoc.lon
    console.log(farmLat,farmLon)
    var radLat1 = userLat * Math.PI / 180.0;
    var radLat2 = farmLat * Math.PI / 180.0;
    var a = (userLat-farmLat)*3.14/180.0
    var b = (userLon-farmLon)*3.14/180
    var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s *6378.137/1000 ;
    s = s.toFixed(2);
    console.log('distance:',s)    
},

  onShareAppMessage: function () {
    var that = this
    console.log(that.data.itemInfo.id)
    return {
      title: '青椒认领',
      desc: '转发给好友，一起来happy',
      url:that.data.pic_url,
      path: '/pages/index/index?item_id='+that.data.itemInfo.id,
    } 
  },

  getAddress:function(){
    console.log('111')
    var that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.address']) {
          console.log('2')
          wx.chooseAddress({
            success(res) {
              console.log(res)
            
              that.setData({
                  cityName:res.cityName,
                  countyName:res.countyName,
                  detailInfo:res.detailInfo,
                  provinceName:res.provinceName,
                  userName:res.userName,
                  phoneNum:res.telNumber,
                  addressee:res.userName,
                  add_region: ['res.provinceName','res.cityName','res.countyName'], 
                  add_detail: res.detailInfo
              })
              
              
            }
          })
        } else {
          console.log('3')
          wx.authorize({
            scope: 'scope.address',
            success(res){
              wx.chooseAddress({
                success(res){
                  console.log('success',res)
                  this.data.setData({
                    cityName: res.cityName,
                    countyName: res.countyName,
                    detailInfo: res.detailInfo,
                    provinceName: res.provinceName,
                    userName: res.userName,
                    phoneNum: res.telNumber,
                    addressee: res.userName,
                    address: res.provinceName + res.cityName + res.countyName + res.detailInfo
                  })
                }
              })
            },
            fail(res){
              console.log('fail:',res)
            }
          })
        }
      }
    })
    wx.authorize({
      scope: 'address',
      success(res) {
        console.log(res)
      }
    })
  },
  updateUserinfo:function(){
    var that = this
    wx.login({
      success(res){
        wx.request({
          method:'POST',
          url: url+'/dataserver/login/update',
          data:{
            code:res.code,
            cityName: that.data.cityName,
            countyName: that.data.countyName,
            detailInfo: that.data.detailInfo,
            provinceName: that.data.provinceName,
            userName: that.data.userName, 
            phoneNum:that.data.phoneNum, 
            userName:that.data.userName,
          }
        })
      }
    }) 
  },

  getUserInfo:function(){
    //get userinfo from backend server  
    var that= this
    
    wx.login({
      success(res){
        wx.request({
          url: url+'/dataserver/getUserInfo',
          data:{
            code:res.code
          },
          success(res){

            console.log('getUserInfo',res)
            var data = res.data
            if(data.user_address !=''){
            that.setData({
              addressee:data.user_addressee,
              address:data.user_address,
              phoneNum:data.user_phonenumber,
            })
            }else{
            
            }
          }
        })
      }
    })
  },
  getWxUserInfo:function(){
    var that = this
    wx.getUserInfo({      
      success(res){
        console.log(res.userInfo)
        that.setData({
          nickName : res.userInfo.nickName,
          avatarUrl:res.userInfo.avatarUrl,
        })  
      }
    })
  },
  danmuShoot: function (i) {
    var that = this
    var danmu = that.data.danmulist[i]
    if (i >= 1 && Math.abs(danmu.top - that.data.danmulist[i-1].top) < 6) {
      danmu.top = that.data.danmulist[(i - 1)].top + 6
    } 
    doommList.push(new Doomm(danmu.text,danmu.top,danmu.speed, danmu.color));
    this.setData({
      doommData: doommList
    }) 
  },
  danmuStart:function(){
    var that=this
    var interval = setInterval(function(){
      if (i < that.data.danmulist.length) {  
      that.danmuShoot(i)
      i=i+1
      
      }else{
        i=i+1
        if(i>that.data.danmulist.length+4){   
          i=0
        }
      }
    },1000) 
  },
  goToitem:function(itemid){
      var that = this 
     
      index = findIndexof(itemid)
      that.setData({
        displayed:index
      })
      that.display_item(index)
  },
  findIndexof:function(itemid){
    var that = this
    var items = that.data.items
    for (var index = 0; index < items.length; index++) {
      
      if (items[index]['id'] == itemid) {
        console.log('mached', index)
        break
      }
    }
    console.log('index',index)
    return index
  },
  showGift:function(){
    var that = this
    that.setData({
      showGift:true
    })
  },
  send_giftcode:function(e){
    var code = e.detail.value.giftcode
    var that = this
    if ((code.length==12)||(code.length == 14)){
      that.setData({
        wrongcode:false
      })
      wx.request({
        url: url+'/dataserver/usecode/',
        data:{
          'giftcode':code
        },
        success(res){
          console.log(res)
          if (res.data.res=='error'){
              console.log(res.data.errormsg)
              that.setData({
                wrongcode:true
              })         
          }
          if(res.data.res=='varified'){
            that.setData({
              wrongcod:false,
              showGift:false,
              showGetGift:true,
              giftcode:{
                'item_name':res.data.item_name,
                'item_id':res.data.item_id,
                'code':res.data.code,
              }
            })
          }
          if(res.data.res=='codes_info'){
            console.log('codes_info')
          }
        }
      })
    }else{
      that.setData({
        wrongcode:true
      })
    }
  },
  getgift:function(e){
    var that = this
    var data = e.detail.value
    wx.login({
      success(res){
        wx.request({
          url: url+'/dataserver/get_gift/',
          data:{
            code:res.code,
            giftcode:that.data.giftcode.code,
            addRegion: that.data.addRegion[0]+that.data.addRegion[1]+that.data.addRegion[2],
            addDetail: e.detail.value.addDetail,
            nickname: e.detail.value.nickname,
            post_sign: e.detail.value.post_sign,
            name_rec: e.detail.value.name_rec,
            phone_num: e.detail.value.phone_num,
          },
          success(res){
            console.log(res)
            if(res.data.res=='success'){
              that.setData({
                showGiftSuc:true,
                showGetGift:false,
                giftinfo:res.data,
              })
            }
          }
        })
      }
    })
    
  },
  bindRegionChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      addRegion: e.detail.value
    })
  },
  gotoCerti:function(){
    var that = this
    that.setData({
      showGiftSuc:false,
      showCerti:true,
    })
  },
  getAddress: function () { 
    var that = this
    wx.getSetting({
      success(res) {
        if (res.authSetting['scope.address']) {
          console.log('2')
          wx.chooseAddress({
            success(res) {
              console.log('choose_from_wx',res)
              that.setData({
                cityName: res.cityName,
                countyName: res.countyName,
                detailInfo: res.detailInfo,
                provinceName: res.provinceName,
                userName: res.userName,
                phoneNum: res.telNumber,
                addressee: res.userName,
                addRegion: [res.provinceName, res.cityName, res.countyName],
                addDetail: res.detailInfo
              })
            }
          })
        } else {
          console.log('3')
          wx.authorize({
            scope: 'scope.address',
            success(res) {
              wx.chooseAddress({
                success(res) {
                  this.data.setData({
                    cityName: res.cityName,
                    countyName: res.countyName,
                    detailInfo: res.detailInfo,
                    provinceName: res.provinceName,
                    userName: res.userName,
                    phoneNum: res.telNumber,
                    addressee: res.userName,
                    addRegion: [res.provinceName, res.cityName, res.countyName],
                    addDetail: res.detailInfo
                  })
                }
              })
            },
            fail(res) {
              console.log('fail:', res)
            }
          })
        }
      }
    })
    wx.authorize({
      scope: 'address',
      success(res) {
        console.log(res)
      }
    })
  },
  
  
  
})

class Doomm {
  constructor(text, top, speed, color) {
    this.text = text;
    this.top = top;
    this.time = speed;
    this.color = color;
    this.display = true;
    let that = this;
    this.id = i;
    setTimeout(function () {
      doommList.splice(doommList.indexOf(that), 1);
      page.setData({
        doommData: doommList
      })
    }, this.time * 1000)
  }
}



  
