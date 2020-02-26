// component/modal/share/share.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showShare:{
      type:Boolean,
      value:true
    },
    itemInfo:{
      type:Object,
      value:{}
    },
    picUrl:{
      type:String,
      value:''
    },
    farmInfo:{
      type:Object,
      value:{}
    }
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    closewindow:function(){
      this.setData({
        showShare:false
      })
    },
    save_pic:function(){
      wx.saveImageToPhotosAlbum({
        filePath: './qingjiao/'+itemInfo.item_name+'.png',
      })
    }

  }
})
