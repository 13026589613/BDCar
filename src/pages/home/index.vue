<template>
  <div class="full-con">
    <div class="person-container">
      <div class="person-btn" @click.stop="turnToPersonal()">
        <img src="/static/images/common/personal.png" />
      </div>
    </div>
    
    <div class="full-container">
      <van-tabs :active="activeTab" @change="onChange" color="#E0BA21"
        :class="{'bg-white': activeTab === 0}">
        <van-tab title="扫码停车"></van-tab>
        <van-tab title="预约车位"></van-tab>
      </van-tabs>
      
      <!-- tab内容 -->
      <scan-index v-if="activeTab === 0" @turn-to-login="turnToLogin" :showLogin="showLogin"></scan-index>
      <order-index v-if="activeTab === 1" 
        ref="orderIndex"
        :showLogin="showLogin"
        :showHasUsingOrder="showHasUsingOrder"
        :hasUsingOrder="hasUsingOrder"
        :location="location"
        @turn-personal="turnToPersonal"
        @turn-to-login="turnToLogin"
        @change-type="changeType" 
        @tip-marker="tipMarker"></order-index>
    </div>
  </div>
</template>
<script>

// 引入SDK核心类
let plugin = requirePlugin("mapPlugin")
// let QQMapWX = require('../../../static/tencent-map/map-wx-jssdk.min.js')
// let qqmapsdk
import OrderIndex from './order-index'
import ScanIndex from './scan-index'
import { getLocation, toast } from '../../utils/wxapi'
import { acceptManageLock, getParkInfoByLockid, userUnendOrder } from '../../api/parking'
export default {
  components: {
    OrderIndex,
    ScanIndex
  },
  data() {
    return {
      tipMarkerInfo: null,
      activeTab: 1, // 激活的tab页签
      showLogin: true,
      showHasUsingOrder: false,
      hasUsingOrder: {},
      showPersonal: true,
      location: {
        latitude: -999,
        longitude: -999
      }
    }
  },
  onReady: function (e) {
    // 使用 wx.createMapContext 获取 map 上下文
    // this.mapCtx = wx.createMapContext('map')
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      console.log(res.target)
    }
    return {
      path: '/pages/home/main', 
      success: function (res) {
        // 转发成功
      },
      fail: function (res) {
        // 转发失败
      }
    }
  },
  methods: {
    checkNeedTurn(option) {
      const scene = decodeURIComponent(option.scene)
      let canTurn = false
      if (scene !== null && scene !== ''
        && scene !== 'undefined' && typeof (scene) !== 'undefined') {
        canTurn = true
      }

      if (option.orderId !== null && option.orderId !== ''
        && option.orderId !== 'undefined' && typeof (option.orderId) !== 'undefined') { 
          // 催离通知进入界面
          canTurn = true
      }
      
      if (canTurn) {

        if (option.orderId !== null && option.orderId !== ''
        && option.orderId !== 'undefined' && typeof (option.orderId) !== 'undefined') { 
          // 催离通知进入界面
          
        } else {
          const positionId = scene

          // 判断扫码类型
          const type = positionId.substring(0, 2) === 'AA' ? 0 : 1 // 0 车位扫码 1 共享

          let url = '/pages/phone/main?isSharePosition=true&positionId=' 
            + positionId + '&type=' + type

          const _this = this
          wx.showModal({
            title: '系统提示',
            content: type === 0 ? '前往预约该车位？' :'确认接受车位控制邀请？',
            confirmText: type === 0 ? '前往预约' :'接受邀请',
            success: function (sm) {
              if (sm.confirm) {
                if (type === 0) { // 0 车位扫码
                  getParkInfoByLockid({
                    lockId: positionId
                  }).then(res => {
                    if (res.code === 0) {
                      let url = '/pages/parking/main?parkingStation=' + JSON.stringify({
                        id: res.data.parkInfo.id,
                        iconPath: "/static/images/common/map_icon.png",
                        latitude: res.data.parkInfo.enterPosition.split(',')[0],
                        longitude: res.data.parkInfo.enterPosition.split(',')[1],
                        title: res.data.parkInfo.parkName,
                        width: 25,
                        height: 40,
                        parkList: res.data.parkList
                      })
                      wx.navigateTo({ url: url})
                    }
                  })
                } else {
                  wx.getSetting({ // 判断是否授权
                    success(res) {
                      if (!res.authSetting['scope.userInfo']) {
                        wx.showModal({
                          title:'请先授权个人信息', 
                          content:'微信授权读取个人信息',
                          confirmText:'前往授权',
                          cancelText: '暂不授权',
                          success: function(res) {
                            if (res.confirm) {
                              wx.navigateTo({url})
                            }
                          }
                        })
                      } else {
                        wx.getStorage({  // 获取登录授权的用户信息
                          key: 'LoginUserInfo',
                          success(data) {
                            if (data.data) {

                              wx.getStorage({ // 获取wx信息
                                key: 'WXUserInfo',
                                success(wxData) {
                                  if (wxData.data) {

                                    // 添加共享车位信息
                                    acceptManageLock({
                                      userLockId: positionId,
                                      userInfoId: data.data.id,
                                      head: wxData.data.avatarUrl,
                                      name: wxData.data.nickName
                                    }).then(res => {
                                      wx.showToast({ title: '已接受控制邀请', icon: 'success' })
                                    })
                                  } else {
                                    setTimeout(() => {
                                      wx.navigateTo({url})
                                    }, 1500)
                                  }
                                },
                                fail() {
                                  setTimeout(() => {
                                    wx.navigateTo({url})
                                  }, 1500)
                                }
                              })
                            } else {
                              setTimeout(() => {
                                wx.navigateTo({url})
                              }, 1500)
                            }
                          },
                          fail() {
                            setTimeout(() => {
                              wx.navigateTo({url})
                            }, 1500)
                          }
                        })
                      }
                    }
                  })
                }
              }
            }
          });
        }
      }
    },
    turnToLogin(turnUrl) { // 跳转到登陆界面
      wx.login({
        success: function(res) {
          if (res.code) {

            // 获取openId
            wx.request({
              url: 'https://boodow.com/api/getWxId?code=' + res.code,
              method: 'post',
              success: function (data) {
                const back = JSON.parse(data.data.data) 
                // console.log('sessionKey --- ' + back.sessionKey);
                // console.log('openId --- ' + back.openId);
                wx.setStorage({
                  key: 'openId',
                  data: {
                    openId: back.openId
                  }
                })

                wx.setStorage({
                  key: 'sessionKey',
                  data: {
                    sessionKey: back.sessionKey
                  }
                })
                
                let url = '../phone/main?turnUrl=' + turnUrl
                wx.navigateTo({ url })
              }
            })
          } else {
            wx.showToast({
              title: '微信登录失败, 请检查网络连接',
              icon: 'none'
            })
          }
        }
      })
    },
    turnToPersonal() { // 跳转个人中心
      if (!this.showLogin) { // 已经登录
        let url = '/pages/personal/main'
        wx.navigateTo({url})
      } else {
        this.turnToLogin('personal/main')
      }
    },
    tipMarker(status, info) { // 地图点击marker标记
      this.tipMarkerInfo = info
      this.showPersonal = !status
    },
    changeType(status) { // 切换列表模式
      // if (!status) {
      //   this.showLogin = false  // 列表模式
      // } else { 
      //   this.showLogin = true  // 地图模式
      // }
    },
    onChange(tab) { // tab页切换事件
      this.activeTab = tab.target.index
      // this.showLogin = true
    }
  },
  onLoad(option) { // 实例化API核心类
    // qqmapsdk = new QQMapWX({
    //   key: "JSDBZ-U4CA2-XUHUH-CX43P-SAXVK-XTFAR"
    // });
    const _this = this
    _this.checkNeedTurn(option)
  },
  onShow() { // 调用接口
    const _this = this
    _this.showLogin = true
    wx.getStorage({
      key: 'LoginUserInfo',
      success(res) {
        if (res.data !== null) {
          _this.showLogin = false

          // 获取用户是否存在进行的订单
          userUnendOrder({}).then(res => {
            _this.showHasUsingOrder = false
            _this.hasUsingOrder = {}

            if (res.code === 0) {
              if (res.data) {
                _this.showHasUsingOrder = true
                _this.hasUsingOrder = res.data
              }
            }
          })
        }
      },
      fail() {
        _this.showLogin = true
      }
    })
    getLocation().then(res => {
      _this.location.latitude = res.latitude
      _this.location.longitude = res.longitude
      if (!res.success) {
        toast('未允许获取定位信息,地图无法加载车位信息')
      } else {
        // _this.$refs.orderIndex.initParkingList()
        _this.$refs.orderIndex.localPostion()
      }
    })
  }
}
</script>

<style lang="scss">

.login-btn {
  &-container {
    position: absolute;
    left: 0;
    top: 4em;
    display: flex;
    width: 100%;
    justify-content:center;
    align-items:center;
    z-index: 9999;
  }

  &-content {
    background-color:rgba(245, 208, 57, .9);
    padding: .3rem 0;
    width: 75%;
    border-radius: 2rem;
    text-align: center;
    color: #333;
    font-size: .3rem;
  }
}
.person {
  &-container{
    position: absolute;
    background-color: #FFF;
    bottom: 3em;
    right: 0rem;
    border-top-left-radius: 4em;
    border-bottom-left-radius: 4em;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    padding: .5em;
    z-index: 9999;
  }

  &-btn {
    width: 4em;
    height: 4em;
    border-radius: 50%;
    margin-right: 1em;
    background-color: #f2f2f2;

    img {
      width: 100%;
      height: 100%;
    }
  }
}

</style>


