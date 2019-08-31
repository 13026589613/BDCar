<template>
  <div class="lock-container">

    <div class="parking-div" @click="openCardList()" v-if="carLocalInfo">
      <img src="/static/images/personal/icon_my_parklockCard.png" class="card-operate-img" />
      <div>{{ carLocalInfo.parkName }}停车场-{{ carLocalInfo.parkNum }}</div>
      <img src="/static/images/i_selectc@2x.png" class="card-operate-img" style="left:.5em;" />
    </div>
    <span :class="{'c-red': status.code === 'using'}" class="header-tip">
      当前车位锁状态：<br>
      {{ status.tipInfo }}
    </span>

    <div class="lock-btn" @click="handleUsingLock()"
      :class="{'opacity': status.code === 'using'}" >
      <img class="bg-lock"
        src="/static/images/scan/bg_scan.png" />
      <img class="lock-img" v-if="status.code" :src="'/static/images/place_lock/icon_' + status.code + '.png'" />
      <span>{{ status.title }}</span>
    </div>

    <span class="census-span" @click="turnPage('../personal/carLocal/carCensus/main')">
      <img src="/static/images/place_lock/icon_statistics.png" />
      车位使用情况统计
    </span>

    <div class="bottom-info-container">
      <img src="/static/images/scan/icon_safe.png" />
      泊豆泊车安全保障
    </div>

    <van-popup :show="showCarCardList" 
      position="bottom"
      click-overlay="cancelCardPop">
      <van-picker
        show-toolbar
        title="切换控制车位"
        :columns="columns"
        @cancel="cancelCardPop"
        @confirm="confirmCardPop"
      />
    </van-popup>
    <!-- <div>
      <span @click="changePageStatus('up')">界面1&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span @click="changePageStatus('down')">界面2&nbsp;&nbsp;&nbsp;&nbsp;</span>
      <span @click="changePageStatus('using')">界面3</span>
    </div> -->

    <div class="pop-cover" v-if="showPopCover">
      <div class="content-wrapper">
        <div style="color: #555; font-weight: 500; flex: 1; justify-content: center; align-items: center; display: flex; font-size: 16px;">车位锁响应中</div>
        <div class="progress-outer">
          <div class="progress-enter">
            <div class="progress-bg" style="width: 10%;"></div>
          </div>
        </div>

        <div style="font-size: 12px; color: #999; flex: 1; justify-content: center; align-items: center; display: flex;">车位锁正在响应指令,请稍后...</div>
      </div>
    </div>
  </div>
</template>

<script>
import { handParkLotNew, loadLockList, userLockInfo } from '../../api/parking';
export default {
  data() {
    return {
      interval: null,
      carLocalInfo: null,
      showCarCardList: false, // 车位列表显示控制
      columns: [], // 车位列表数据
      showPopCover: false,
      status: {
        tipInfo: null, // 车位锁降下使用中
        title: null, // 降下车位锁  升起车位锁
        code: 'using' // up, down, using
      }
    }
  },
  mounted() {
    
  },
  onShow() {
    const _this = this
    this.initAllLockList()

    this.carLocalInfo = null
    this.carLocalInfo = this.$root.$mp.query.carLocalInfo

    if (this.carLocalInfo !== null && this.carLocalInfo !== '' 
      && typeof(this.carLocalInfo) !== 'undefined'
      && this.carLocalInfo !== 'undefined') {
      
      this.carLocalInfo = JSON.parse(this.$root.$mp.query.carLocalInfo)
      wx.setStorage({ key: 'hasChooseLockInfo', data: {
        hasChooseLockInfo: _this.carLocalInfo // 选中控制的车位锁
      }})

      // 获取当前的车位锁状态，是否有租用状态，升起还是落下
      this.initStatus()
    } else {
      wx.getStorage({ // 初始化选中的车位锁
        key: 'hasChooseLockInfo',
        success(res) {
          _this.carLocalInfo = res.data.hasChooseLockInfo
          _this.initStatus()
        },
        fail() {
          wx.showToast({
            duration: 3000,
            title: '无可操控车位,请先绑定车位!'
          })
          setTimeout(() => {
            wx.navigateBack({ delta: 1 })
          }, 100)
        }
      })
    }
  },
  methods: {
    initAllLockList() { // 获取存储的可以操控的全部锁
      const _this = this
      _this.columns = []
      
      wx.getStorage({ 
        key: 'iCanKZDiCarParking',
        success(res) {
          if (res.data.allKZList.length > 0) {
            res.data.allKZList.forEach((element,index) => {
              _this.columns.push(Object.assign(element, {
                id: element.id,
                text: element.parkName + ' ' + element.parkNum,
                value: index
              }))
            })
          } else {
            wx.showToast({
              duration: 3000,
              title: '暂无可操控的车位锁'
            })
            setTimeout(() => {
              wx.redirectTo({
                url: '/pages/personal/main'
              }) 
            }, 2000)
          }
        },
        fail() {
          wx.showToast({
            duration: 3000,
            title: '暂无可操控的车位锁'
          })
          setTimeout(() => {
            wx.redirectTo({
              url: '/pages/personal/main'
            }) 
          }, 2000)
        }
      })
    },
    confirmCardPop(e) { // 切换车位
      this.carLocalInfo = e.mp.detail.value
      this.$forceUpdate()
      this.$nextTick(() => { // 加载当前车位锁状态
        this.initStatus()
      })

      const _this = this
      wx.setStorage({ key: 'hasChooseLockInfo', data: {
        hasChooseLockInfo: _this.carLocalInfo
      }})
      this.cancelCardPop()
    },
    cancelCardPop() { // 取消车位选择pop
      this.showCarCardList = false
      this.$forceUpdate()
    },
    openCardList() { // 打开车位选择pop
      this.showCarCardList = true
      this.$forceUpdate()
    },
    initStatus() { // 获取初始化状态
      userLockInfo({
        userLockId: this.carLocalInfo.id
      }).then(res => {
        this.carLocalInfo = res.data

        let code = (this.carLocalInfo.shareUseState === '0' ? (this.carLocalInfo.state === '1' ? 'down' : 'up') : 'using')
        this.changePageStatus(code)
      })
    },
    handParkLot(type) { // 操作车位锁
      const _this = this
      wx.showLoading()
      _this.handleLoadingStatus(type)
    },
    handleLoadingStatus(type) {
      const _this = this
      handParkLotNew({
        handType: type,
        userLockId: this.carLocalInfo.id
      }).then(res => {
        // wx.showLoading({
        //   title: '车位锁响应中'
        // })
        _this.showPopCover = true

        _this.interval = setInterval(() => {
          userLockInfo({
            userLockId: _this.carLocalInfo.id
          }).then(data => {
            wx.hideLoading()
            _this.carLocalInfo = data.data
            let code = (data.data.shareUseState === '0' ? (data.data.state === '1' ? 'down' : 'up') : 'using')

            // console.log(code);
            // console.log(_this.status.code);

            if (code !== _this.status.code) {
              wx.hideLoading()
              clearInterval(_this.interval)
              _this.showPopCover = false

              wx.showToast({
                title: type === '001' ? '  车位锁已升起  ' : '  车位锁已降落  '
              })
              _this.changePageStatus(code)
            }
          })
        }, 4000)

        setTimeout(() => {
          clearInterval(_this.interval)
          _this.showPopCover = false
          wx.showToast({
            title: '车位锁未响应',
            icon: 'none'
          })
        }, 20000)

        // setTimeout(() => {
        //   _this.showPopCover = false
        //   wx.hideLoading()
        //   if (res.code == 0) {
        //     wx.showToast({
        //       title: type === '001' ? '  车位锁已升起  ' : '  车位锁已降落  '
        //     })
        //     _this.initStatus()
        //     // _this.changePageStatus(type === '001' ? 'up' : 'down')
        //   } else {
        //     wx.showToast({
        //       title: res.msg,
        //       icon: 'none'
        //     })
        //   }
        // }, 8000)
      })
    },
    turnPage(url) {
      wx.navigateTo({ url })
    },
    changePageStatus(name) { // up, down, using 仅供测试
      this.status.code = name
      if (this.status.code === 'down') {
        this.status.tipInfo = '已降下状态，正在使用中'
        this.status.title = '升起车位锁'
      } else if (this.status.code === 'using') {
        this.status.tipInfo = '车位已被共享，当前暂时无法控制'
        this.status.title = '暂时无法控制'
      } else {
        this.status.tipInfo = '升起状态，降下车位锁使用'
        this.status.title = '降下车位锁'
      }
    },
    handleUsingLock() {
      if (this.status.code === 'using') {
        return
      }

      wx.showLoading()
      let type = null
      if (this.status.code === 'down') {
        type = '001' // 升起车位锁
      } else if (this.status.code === 'up') {
        type = '002' // 降下车位锁
      }

      if (type === null) return
      this.handParkLot(type)
    }
  }
}
</script>
<style scoped lang="scss">

.pop-cover {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(0, 0, 0, .5);
  z-index: 10000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .content-wrapper {
    width: 65%;
    height: 15%;
    background: #FFF;
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
}
.progress-outer {
  width: 80%; 
  height: 5px;
  border-radius: 4px;
  overflow: hidden;
  position: relative; 
}    
.progress-enter {  
  height: inherit;
  background: rgba(180, 160, 120, .1); 
}
.progress-bg {
  width: 0; 
  height: inherit;
  border-radius: 3px; 
  background: repeating-linear-gradient(-45deg, #e61244  25%, #fb8980 0, #fb8980 50%, #e61244 0, #e61244 75%, #fb8980 0);
  background-size: 16px 16px;
  -webkit-animation: panoramic 4s  linear infinite;
  animation: panoramic 4s  linear infinite;
}
@-webkit-keyframes panoramic{
  to {
    background-position: 200% 0;
    width: 100%;
  }
}
@keyframes panoramic{
  to {
    background-position: 200% 0;
    width: 100%;
  }
}

.lock-container {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
}

.header-tip {
  padding: 3em 0 2em 0;
  text-align: center;
  font-size: 1.5em;
  font-weight: 500;
}

.lock-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 15em;
  height: 15em;
  border-radius: 50%;
  position: relative;
}

.lock-btn .bg-lock {
  position: absolute;
  top: 0;
  left: 0;
  width:100%;
  height:100%;
  z-index:-1;
}

.opacity {
  opacity:0.5;
}

.lock-img {
  width: 6em;
  height: 6em;
}

.lock-btn span {
  font-size: 1.2em;
  margin-bottom: 2em;
}

.census-span {
  margin-top: 5em;
  display: flex;
  justify-content: center;
  align-items:center;

  img {
    width: 2em;
    height: 2em;
    margin-right: .5em;
    display: inline-block;
  }
}

.bottom-info-container {
  position: absolute;
  background-color: transparent;
  bottom: .7rem;
  right: 0;
  left: 0;
  padding: .1rem;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333333;
  font-weight: 400;
  font-size: 1em;
}

.bottom-info-container img {
  width: .5rem;
  height: .5rem;
  margin-right: .1rem;
  display: inline-block;
}
.card-operate-img {
  position:relative !important;
  width:1.5em;
  height:1.5em;
  left:-.5em;
}
.parking-div {
  display: flex;
  flex-direction: row;
  width: auto;
  padding: 0em 3em;
  margin-top: 3em;
  justify-content: center;
  align-items: center;
  background: white;
  border-radius: 2em;
  height: 3em;
}
</style>

