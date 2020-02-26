Component({
  properties: {
    showComment: {
      type: Boolean,
      value: false
    },
    itemId:{
      type:Number,
      value:1,
    },
    
  },
  

  data: {
    inputValue:''
  },
  methods: {
    // 这里是自定义方法
    mask_click: function () {
      this.setData({
        showComment:false,
      })
    },
    catchtap:function(){
    },
    sendComment:function(e){
      var that = this
      console.log('newcomment:', e, that.data.itemId)
      var comment = e.detail.value      
      var danmu = {
        text: comment,
        color: '#00FF00',
        time: Math.ceil(Math.random() * 15),
        speed: 10,
        top:46
      }
      
      
      wx.login({        
        success(res){
          wx.request({
            method: 'GET',
            url: 'https://qingjiao.shop:8000' + '/dataserver/postComment/',
            data: { 
              comment: comment,
              code:res.code,
              item_id: that.data.itemId,
            },
            success(res){
              if (res.code=='sensitive'){
                wx.showToast({
                  title: '请勿评论敏感内容',
                  complete: (res) => {},
                  duration: 100,
                })
              }else{
                this.triggerEvent('newDanmu',danmu)
                that.mask_click()
              }
            }
            
          })
        }
      })
      
    }
  },
})