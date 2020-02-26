
Component({
  properties: {
    showGettree: {
      type: Boolean,
      value: false,
    },
    item_num: {
      
      type: Number,
      value: 1,
    },
    num:{
      //num of purchase
      type:Number,
      value:1,
    },
    itemInfo:{
      type:Object,
    },
    reward:{
      type:Number,
      value:0,
    },
    phoneNum:{
      type:String,
      value:null
    },
    
    addDetail: {
      type: String,
      value: ''
    },
    userName: {
      type: String,
      value: ''
    },
   
  },
  data: {
    color_nick:'black',
    color_sign:'black',
    color_address:'black',
    color_rec:'black',
    color_phone:'black',
    color_addDetail:'balck',
    addRegion: ['浙江省', '杭州市', '西湖区'],
    customItem: '全部',
    addDetail:'',  
  },
  methods: {
    closewindow: function () {
      this.setData({
        showGettree: false,
        num:1,
      })
    },
    minus1:function(){
      if(this.data.num>1){
        this.setData({
          num:this.data.num-1
        })
      }
    },
    plus1:function(){
      this.setData({
        num:this.data.num+1,
      })
      console.log(this.data.itemInfo)
    },
    wx_pay:function(){
      wx.requestPayment({
        timeStamp: '',
        nonceStr: '',
        package: '',
        signType: '',
        paySign: '',
      })
    },
    get_wxaddress:function(){
      
      this.triggerEvent('getAddress')
    },

    bindRegionChange: function (e) {
      console.log('picker发送选择改变，携带值为', e.detail.value)
      this.setData({
        addRegion: e.detail.value
      })
    },

    getTree_pay:function(e){
      var that =this
      var value=e.detail.value
      if (value.nickname && value.name_rec && value.phone_num && value.post_sign && value.addDetail) {
        that.setData({
          color_nick: 'black',
          color_sign: 'black',
          color_address: 'black',
          color_rec: 'black',
          color_phone: 'black',
          color_addDetail: 'balck',
        })
        
        wx.login({  
          success(res){
            wx.request({
              method:'GET',
              url: 'https://qingjiao.shop:8000/dataserver/weChatPay/',
              data:{
                code: res.code,
                item_id: that.data.itemInfo.id,
                item_price:that.data.itemInfo.item_price,
                item_name:that.data.itemInfo.item_name,
                num_buy: that.data.num,
                reward: that.data.reward,
                total_fee: that.data.itemInfo.item_price * that.data.num - that.data.reward,
                addRegion: that.data.addRegion[0]+that.data.addRegion[1]+that.data.addRegion[2],
                addDetail: e.detail.value.addDetail,
                nickname: e.detail.value.nickname,
                post_sign: e.detail.value.post_sign,
                name_rec: e.detail.value.name_rec,
                phone_num: e.detail.value.phone_num,
              },
              header: {
                'Content-Type': 'application/json'
              },
              success:function(res){
                console.log("res.data",res.data)
                if (res.data.status == 100) {
                  var payModel = res.data.wepy_sign;
                  console.log("payModel", payModel)
                  wx.requestPayment({
                    'timeStamp': res.data.timeStamp,
                    'nonceStr': res.data.nonceStr,
                    'package': 'prepay_id='+payModel.prepayid,
                    'signType': 'MD5',
                    'paySign': res.data.paySign,
                    'success': function (res) {
                      wx.showToast({
                        title: '支付成功',
                        icon: 'success',
                        duration: 2500
                      })
                      that.triggerEvent('paySuc', {}, {})
                    },
                    
                  })
                }else{
                  wx.showToast({
                    title: '下单失败',
                    icon: '',
                    duration: 3000,
                  })
                }
              },
            })
          }  
        })
      }else{
        if(!value.nickname){
          this.setData({
            color_nick:'red',
          })
        }else{
          this.setData({
            color_nick: 'black',
          })
        }
        if (!value.post_sign) {
          this.setData({
            color_sign: 'red',
          })
        } else {
          this.setData({
            color_sign: 'black',
          })
        }
        if (!value.addDetail) {
          this.setData({
            color_addDetail: 'red',
          })
        } else {
          this.setData({
            color_addDetail: 'black',
          })
        }
        if (!value.name_rec) {
          this.setData({
            color_rec: 'red',
          })
        } else {
          this.setData({
            color_rec: 'black',
          })
        }
        if (!value.phone_num) {
          this.setData({
            color_phone: 'red',
          })
        } else {
          this.setData({
            color_phone: 'black',
          })
        }
        
      }
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

  }
})