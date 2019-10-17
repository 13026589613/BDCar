<template>
  <div class="personal-container">
    <!-- 用户基本信息 -->
    <div class="user-card" @click="checkUserInfo()">
      <!-- <image class="user-card__avatar" src="/static/images/personal/icon_my_qrCode.png"/>  -->
      <image class="user-card__avatar" :src="user.avatar"/> 
      <div class="user-card__info">
        <div class="user-card__name">
          {{ user.name }}
        </div> 

        <div class="user-card__helper">
          <span>
            {{ user.phone || '' }}
          </span>
          <van-tag plain type="success" class="mar-lft-5" color="white">
            {{ user.hasCertification ? '已认证' : '未认证'}}
          </van-tag>
        </div>
      </div>
    </div>

    <!-- 统计分析数据 -->
    <van-cell-group>
      <div class="icon-group">
        <div class="icon" @click="turnPage('../personal/record/main')">
          <div class="icon__number">{{ censusData.totalUseHour || 0 }}小时</div>
          <div class="icon__title">泊豆泊车时长</div>
        </div>
        <div class="icon" @click="turnPage('../personal/money/main')">
          <div class="icon__number">{{ (censusData.totalIncome || 0) / 100 }}元</div>
          <div class="icon__title">总收入</div>
        </div>
        <div class="icon" @click="turnPage('../personal/carLocal/carCensus/main')">
          <div class="icon__number">{{ censusData.totalShareHour || 0 }}小时</div>
          <div class="icon__title">共享车位时长</div>
        </div>
      </div>
    </van-cell-group>

    <div class="panel pad-all car-place-container" v-if="carLocalInfo !== null && accessNum === 0"
      @click="turnPage(
        '/pages/personal/carLocal/carCard/main?carLocalInfo=' + JSON.stringify(carLocalInfo)
      )">

      <div class="car-share-cotainer" v-if="canturnShare">
        <div>
          <img class="share-icon" src="/static/images/personal/icon_my_parklockCard.png" />
          <!-- <span style="margin: 0 8px; font-weight: 600; font-size: 1.2em;">&nbsp;我的车位名片</span> -->
          <span class="van-cell-text">&nbsp;邀请家人一起控制</span>
        </div>
        <div style="margin-top: 10px;" v-if="accessUserInfo !== null">
          正与 <span class="c-org">{{ accessUserInfo }}</span>等{{ sharedList.length }}位共同使用
        </div>
        <div style="margin-top: 10px;" v-if="accessUserInfo == null">
          暂未邀请人
        </div>
      </div>
      <img class="icon-img" src="/static/images/personal/icon_my_qrCode.png" />
    </div>

    <!-- 系统设置 -->
    <div class="mar-top-10">&nbsp;</div>
    <div class="panel">
      <van-cell-group>
        <van-cell :value="((user.wallet.totalPrice || 0) / 100) + ' 元'" is-link value-class="c-gray-white" @click="turnPage('../personal/money/main')">
          <img slot="icon" class="icon-img" src="/static/images/personal/icon_my_car.png" />
          <view slot="title">
            <span class="van-cell-text">我的钱包</span>
            <van-tag type="danger" class="mar-lft-5">
              {{ ((user.wallet.totalPrice || 0) / 100) }} 元</van-tag>
          </view>
        </van-cell>
        <van-cell title="我的车位" is-link @click="turnPage('../personal/carLocal/main')">
          <img slot="icon" class="icon-img" src="/static/images/personal/icon_my_parklock.png" />
        </van-cell>
        <van-cell title="车位锁管理" v-if="canturnKZ" is-link @click="turnPage('../carPlaceLock/main')">
          <img slot="icon" class="icon-img" src="/static/images/personal/icon_my_parklockControl.png" />
        </van-cell>

        <van-cell value="设置车辆" is-link value-class="c-gray-white" 
          @click="turnPage('../personal/myCar/main')">
          <img slot="icon" class="icon-img" src="/static/images/personal/icon_my_wallet.png" />
          <view slot="title">
            <span class="van-cell-text">我的车辆</span>
            <!-- <van-tag type="danger" class="mar-lft-5">设置车辆</van-tag> -->
          </view>
        </van-cell>
        <van-cell title="我的行程" is-link @click="turnPage('../personal/record/main')">
          <img slot="icon" class="icon-img" 
          src="/static/images/personal/icon_my_trip.png" />
        </van-cell>
      </van-cell-group>
    </div>

    <div class="mar-top-10">&nbsp;</div>
    <div class="panel">
      <van-cell-group>
        <!-- <van-cell value="0531-88887077" title="联系我们" 
          @click='callPhone()'
          is-link value-class="c-gray-white">
          <img slot="icon" class="icon-img" src="/static/images/personal/icon_my_phone.png" />
        </van-cell> -->
        <van-cell title="清除缓存" 
          @click='userOut()'
          value-class="c-gray-white">
        </van-cell>
        <!-- <van-cell value="0531-88887077" title="支付接口测试" is-link value-class="c-gray-white" @click="testPay()">
         
        </van-cell> -->
      </van-cell-group>
    </div>
  </div>
</template>

<script>
import { wallet } from '../../api/car.js'
import { userCenterOverview } from '../../api/base.js'
import { lockInfo, userLockInfoByUserInfoId, loadLockList, loadBindAndAccessNum } from '../../api/parking'
export default {
  onLoad() {
    // const _this = this
    // wx.getStorage({
    //   key: 'LoginUserInfo',
    //   success(res) {
    //     console.log(res.data);
    //     _this.userHaslogin(res.data)
    //   }
    // })
  },
  onShow() {
    const _this = this
    wx.getStorage({
      key: 'LoginUserInfo',
      success(res) {
        _this.userHaslogin(res.data)
      }
    })
  },
  data() {
    return {
      canturnKZ: false,
      canturnShare: false,
      bindNum: 0,
      accessNum: 0,
      carLocalInfo: null,
      accessUserInfo: null,
      sharedList: [],
      censusData: {
        totalIncome: 0,
        totalShareHour: 0,
        totalUseHour: 0
      },
      user: {
        wallet: {},
        name: '用户名称',
        avatar: null,
        phone: null,
        hasCertification: true
      }
    }
  },
  onShareAppMessage: function (res) {
    if (res.from === 'button') {
      // console.log(res.target)
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
    checkUserInfo() {
      const _this = this
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userInfo']) {
            wx.showModal({
              title:'前往授权个人信息', 
              content:'微信授权读取个人信息',
              confirmText:'前往授权',
              cancelText: '暂不授权',
              success: function(res) {
                if (res.confirm) {
                  let url = '/pages/login/main'
                  wx.redirectTo({url})
                } else {
                  _this.userHaslogin(_this.user)
                }
              }
            })
          }
        }
      })
    },
    userHaslogin(userInfo) {
      const _this = this
      wx.getStorage({
        key: 'WXUserInfo',
        success(res) {
          _this.user.name = res.data.nickName
          _this.user.avatar = res.data.avatarUrl
          _this.user.phone = userInfo.pnone
          _this.user.pnone = userInfo.pnone
          userCenterOverview({}).then(back => {
            _this.censusData = back.data
          })
          _this.initWallet(userInfo.id)
          _this.initlockInfo(userInfo.id)
        },
        fail() {
          wx.showToast({
            title: '请先授权获取用户信息'
          })
          wx.showModal({
            title:'前往授权个人信息', 
            content:'微信授权读取个人信息',
            confirmText:'前往授权',
            cancelText: '暂不授权',
            success: function(res) {
              if (res.confirm) {
                let url = '/pages/login/main'
                wx.redirectTo({url})
              } else {
                _this.user.name = '用户未授权'
                _this.user.avatar = '/static/images/logo.png'
                wx.setStorage({ key: 'WXUserInfo', data: {
                  nickName: _this.user.name,
                  avatarUrl: _this.user.avatar,
                  phone: userInfo.phone,
                  id: userInfo.id
                }})
              }
            }
          })
        }
      })
    },
    callPhone() {
      wx.makePhoneCall({
        phoneNumber: '0531-88887077',
      })
    },
    initWallet(userId) {
      wallet({
        shareUserInfoId: userId
      }).then(res => {
        this.user.wallet = res.data
        this.$forceUpdate()
      })
    },
    initlockInfo() {
      
      // 获取登录人的接受邀请次数信息
      loadBindAndAccessNum({
      }).then(numberInfo => {
        if (numberInfo.data !== null 
              && typeof(numberInfo.data) !== 'undefined' 
              && numberInfo.code === 0) {

          this.accessNum = Number(numberInfo.data.accessNum || 0)
          this.bindNum = Number(numberInfo.data.bindNum || 0)

          // if (this.bindNum > 0) {
            // userLockInfoByUserInfoId
            loadLockList({ // 获取登录人的车位信息
              type: 'controlled'
            }).then(res => {
              if (res.data !== null 
                && typeof(res.data) !== 'undefined' 
                && res.code === 0
                && res.data.bindedList && res.data.bindedList.length > 0) {
                this.carLocalInfo = res.data.bindedList[0]

                let allList = [...res.data.bindedList, ...res.data.controlledList]
                wx.setStorage({ key: 'iCanKZDiCarParking', data: {
                  bindedList: res.data.bindedList, // 我绑定车位
                  controlledList: res.data.controlledList, // 我可以控制的车位
                  allKZList: allList // 全部可控制車位
                }})
                if (allList.length === 0) {
                  this.canturnShare = false
                  this.canturnKZ = false
                  wx.removeStorage({ key: 'iCanKZDiCarParking' })
                  wx.removeStorage({ key: 'hasChooseLockInfo' })
                } else {
                  this.canturnKZ = true

                  if (res.data.bindedList.length > 0) {
                    this.canturnShare = true
                    wx.getStorage({ // 初始化选中的车位
                      key: 'chooseParking',
                      fail() {
                        wx.setStorage({ key: 'chooseParking', data: {
                          chooseParking: res.data.bindedList[0]
                        }})
                      }
                    })
                  } else {
                    this.canturnShare = false
                    wx.removeStorage({ key: 'chooseParking' })
                  }

                  wx.getStorage({ // 初始化选中的车位
                    key: 'hasChooseLockInfo',
                    success(res) {
                      let hasValue = false
                      allList.forEach(itemInfo => {
                        if (itemInfo.id === res.data.hasChooseLockInfo.id) {
                          hasValue = true
                        }
                      })
                      
                      if (!hasValue) {
                        // 重置选中的车位锁
                        wx.setStorage({ key: 'hasChooseLockInfo', data: {
                          hasChooseLockInfo: allList[0]
                        }})
                      }
                    },
                    fail() {

                      // 重置选中的车位锁
                      wx.setStorage({ key: 'hasChooseLockInfo', data: {
                        hasChooseLockInfo: allList[0]
                      }})
                    }
                  })
                }

                lockInfo({ // 获取车位共享信息
                  userLockId: this.carLocalInfo.id
                }).then(data => {
                  if (typeof(data.data) !== 'undefined' && data.data !== 'undefined') {
                    this.sharedList = data.data.sharedList
                  } else {
                    this.sharedList = []
                  }
                  
                  let info = ''
                  if (this.sharedList.length > 0) {
                    this.sharedList.forEach(element => {
                      info += element.controlUserNickName.substring(0, 2) + '**,'
                    });
                  }
                  this.accessUserInfo = info || null
                  this.$forceUpdate()
                })
              }
            })
          // }
        }
      })
    },
    turnPage(url) { // 跳转界面
      wx.navigateTo({url})
    },
    turnToLogin() {
      wx.login({
        success: function(res) {
          if (res.code) {
            //发起网络请求
            wx.request({
              url: 'https://server.gmbsh.com:8443/vue/miniapp/login.do',
              data: {
                code: res.code,
                wx_name: 'test',// 微信用户昵称
                head_portrait:'test-header-url', // 头像地址
                sex: 1// 性别
              },
              success: function (res) {
                // console.log('获取openid成功');
                // console.log(res)
                let url = '../login/main'
                wx.navigateTo({url})
              },
              fail: function(res) {

              }
            })
          } else {
            console.log('登录失败！' + res.errMsg)
          }
        }
      })
    },
    userOut() {
      wx.clearStorage()
      wx.navigateTo({ url: '/pages/home/main' })
    },
    testPay() {
      wx.login({
        success: function (res) {
          if (res.code) {
            wx.request({
              url: 'https://www.yourdomain.com/pay',
              data: {
                code: res.code,//要去换取openid的登录凭证
                ordercode: ordercode
              },
              method: 'GET',
              success: function (res) {
                // console.log(res.data)
                wx.requestPayment({
                  timeStamp: res.data.timeStamp,
                  nonceStr: res.data.nonceStr,
                  package: res.data.package,
                  signType: 'MD5',
                  paySign: res.data.paySign,
                  success: function (res) {
                    // success
                    console.log('success' + res);
                  },
                  fail: function (res) {
                    // fail
                    console.log('fail' + res);
                  },
                  complete: function (res) {
                    // complete
                    console.log('complete' + res);
                  }
                })
              }
            })
          } else {
            console.log('获取用户登录态失败！' + res.errMsg)
          }
        }
      })
    }
  }
}
</script> 

<style lang="scss" scoped>
.personal-container {
  width: 100%;
}

.car-place-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2em;

  .car-share-cotainer {
    display: flex;
    flex-direction: column;
    justify-content: center;

    .share-icon {
      width: 3em;
      height: 1.2em;
    }
  }
}

.icon-img {
  width: 20px;
  height: 22px;
  margin-right: 4px; 
}

.user-card {
  padding: 2em 2em;
  background-color: #F5D039;
  display: flex;
  flex: 1;
}
.user-card__avatar {
  width: 6em;
  height: 6em;
  border-radius: 50%;
}
.user-card__info {
  padding: 0 30rpx;
  color: #333;
  display: flex;
  flex-direction: column;
  flex: 1;
  justify-content: center;
}
.user-card__name {
  font-size: 1.5em;
  font-weight: 600;
  line-height: 1.4;
  display: flex;
  margin-bottom: .5em;
}
.user-card__helper {
  font-size: 24rpx;
  line-height: 2;
}
.panel {
  background-color: white;
  margin: 0 1em;
  border-radius: .5em;
}

.icon-group {
  display: flex;
  justify-content: start;
  flex-wrap: wrap;
  padding: .2em 0;
}
.icon {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 20rpx 0;
}
.iconfont,
.iconfont--main {
  display: flex;
  justify-content: center;
  margin-bottom: .5em;
}
.icon ._van-icon {
  display: flex;
  justify-content: center;
  margin: 20rpx 0;
}
.icon__number {
  margin-bottom: .5em;
  font-weight: 600;
  font-size: 1.3em;
  color: #333333;
}
.icon__title {
  color: #8A96A3;
  font-size: .9em;
  text-align: center;
}


</style>


