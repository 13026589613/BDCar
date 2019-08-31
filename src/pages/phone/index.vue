<template>
  <div class="login-container">
    <div v-if="canIUse" class="">
      <div class='header'>
        <image src="/static/images/logo.png" />
      </div>
  
      <div class='content'>
          <div>申请获取以下权限</div>
          <text>获得你的手机用于注册小程序</text>
      </div>

      <button class='bottom' type='primary' 
        open-type="getPhoneNumber" lang="zh_CN"
        @getphonenumber="getphonenumber">
        一键授权手机号/登录
      </button>
    </div>

    <!-- 版本不符合 -->
    <div v-if="!canIUse">当前版本无法授权，请升级微信版本</div>
  </div>
</template>

<script>
import { userLogin } from '../../api/base.js'
import { getCarList } from '../../api/car.js'

import RdWXBizDataCrypt from '../../../static/WXBizDataCrypt'
export default {
  data() {
    return {
      isSharePosition: false,
      positionId: null,
      turnUrl: null,
      type: null,
      canIUse: wx.canIUse('button.open-type.getUserInfo')
    }
  },
  onLoad() {
    let turnUrl = this.$root.$mp.query.turnUrl
    let isSharePosition = this.$root.$mp.query.isSharePosition

    if (turnUrl === null || turnUrl === '' 
      || typeof(turnUrl) === 'undefined') {
      this.turnUrl = null
    } else {
      this.turnUrl = turnUrl
    }

    if (isSharePosition === null || isSharePosition === '' 
      || typeof(isSharePosition) === 'undefined') {
      this.isSharePosition = false
    } else {
      this.isSharePosition = isSharePosition
      this.type = type
      this.positionId = this.$root.$mp.query.positionId || null
    }
  },
  mounted () {
    const _this = this
    wx.getSetting({
      success(res) {
        console.log(res.authSetting);
        if (!res.authSetting['scope.userInfo']) {
          wx.showToast({
            title: '小程序需要您授权手机号码， 点击下方授权按钮进行授权',
            icon: 'none'
          })
        }
      }
    })
  },
  methods: {
    getphonenumber: function(e) {
      const _this = this
      wx.getStorage({
        key: 'sessionKey',
        success(data) {
          var pc = new RdWXBizDataCrypt('wxff46723a1a8c5bc5', data.data.sessionKey)
          var phoneData = pc.decryptData(e.mp.detail.encryptedData , e.mp.detail.iv)
          _this.userToLogin(phoneData)
          // _this.userToLogin({
          //   phoneNumber: '13026589613'
          // })
        },
        fail() {
          wx.showToast({
            icon: '',
            title: '用户信息异常,清理缓存后重试'
          })
        }
      })
    },
    userToLogin(phoneData) {
      const _this = this
      wx.login({
        success: function(res) {
          if (res.code) {   
            _this.initUserLogin(res.code, phoneData)
          } else {
            console.log('微信登录失败, 请检查网络连接' + res.errMsg)
            wx.showToast({
              title: '微信登录失败, 请检查网络连接',
              icon: 'none'
            })
          }
        }
      })
    },
    initUserLogin(code, phoneData) { // 登录接口
      const _this = this
      wx.getStorage({
        key: 'openId',
        success(res) {
          userLogin({
            code: code,
            phoneNum: phoneData.phoneNumber,
            openId: res.data.openId,
          }).then(data => {
            console.log(data);
            // 设置用户信息
            wx.setStorage({ key: 'LoginUserInfo', data: data.data })
            wx.showToast({ title: '手机号授权登录成功', icon: 'success' })

            if (_this.isSharePosition) { // 共享车位
              let url = '/pages/login/main?isSharePosition=' + _this.isSharePosition
                + '&positionId=' + _this.positionId + '&userInfoId=' + data.id
                + '&type=' + _this.type
              wx.redirectTo({url})
            } else {
              let url = '/pages/login/main'
              wx.redirectTo({url})
            }
            // 拉去车辆列表
            // _this.loadCarList(data.data.id)
          })
        }
      })
    },
    loadCarList(userId) { // 获取登录用户的车辆列表
      const _this = this
      getCarList({
        userInfoId: userId
      }).then(res => {
        if (res.data.length === 0) {
          wx.showModal({
            title:'前往添加我的车辆',
            content:'租用车位前需要绑定车辆信息',
            confirmText:'添加车辆',
            cancelText: '暂不绑定',
            success: function(res) {
              if (res.confirm) {
                wx.redirectTo({ url: '../personal/myCar/main' })
              } else if (res.cancel) {
                if (_this.turnUrl !== null && typeof(_this.turnUrl) !== 'undefined') {
                  wx.redirectTo({ url: '../' + _this.turnUrl })
                } else {
                  wx.navigateBack({ delta: 1 })
                }
              }
            }
          })
        } else {
          if (_this.turnUrl !== null && typeof(_this.turnUrl) !== 'undefined' && _this.turnUrl !== 'undefined') {
            wx.redirectTo({ url: '../' + _this.turnUrl })
          } else {
            wx.navigateBack({ delta: 1 })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  flex-direction: column;
  flex: 1;

  .header {
    margin: 90rpx 0 60rpx 0rpx;
    border-bottom: 1px solid #ccc;
    text-align: center;
    height: 400rpx;
    line-height: 450rpx;
  }
  
  .header image {
    width: 200rpx;
    height: 200rpx;
  }
  
  .content {
    margin-left: 70rpx;
    margin-bottom: 90rpx;
  }
  
  .content text {
    display: block;
    color: #9d9d9d;
    margin-top: 40rpx;
  }
  
  .bottom {
    border-radius: 80rpx;
    margin: 70rpx 50rpx;
    font-size: 35rpx;
  }
}

</style>


