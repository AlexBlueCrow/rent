function Danmu(page, danmulist, delay = 500) {
  this.page = page
  this.danmulist = danmulist
  
  this.len = danmulist.length
  this.i = 0
  this.tick = 0
  this.delay = delay
}

Danmu.prototype.start = function () {
  console.log('start')
  this.i = 0
  this.page.setData({ movings: [] })
  this.tick = setInterval(this.move.bind(this), this.delay)
  
}

Danmu.prototype.move = function () {
  this.page.setData({
    [`movings[${this.i}]`]: true
  })
  this.i++
  if (this.i === this.len) {
    this.reset()
  }
  
}

Danmu.prototype.reset = function () {
  
  this.stop()
  setTimeout(this.start.bind(this), 4000)
  console.log('reset')
}

Danmu.prototype.stop = function () {
  console.log('stop')
}

export default Danmu