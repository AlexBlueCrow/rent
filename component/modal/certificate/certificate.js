// component/modal/certificate/certificate.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showCerti:{
      type:Boolean,
      value:false,
    },
    orderInfo:{
      type:Object,
    }

  },

  /**
   * 组件的初始数据
   */
  data: {
    cur:0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    closewindow: function () {
      this.setData({
        showCerti: false,
      })
    },
    goto_buy:function(){
      var that = this
      that.triggerEvent('redirect')
    }
    
  }
})
