<template>
  <div class="login-container">
    <div v-if="canIUse" class="">
      <div class='header'>
        <image src="/static/images/logo.png" />
      </div>
  
      <div class='content'>
          <div>申请获取以下权限</div>
          <text>获得你的公开信息(昵称，头像等)</text>
      </div>
  
      <button class='bottom' type='primary' 
        open-type="getUserInfo" lang="zh_CN"
        @getuserinfo="bindGetUserInfo">
        授权读取个人信息
      </button>
    </div>

    <!-- 版本不符合 -->
    <div v-if="!canIUse">当前版本无法授权，请升级微信版本</div>
  </div>
</template>

<script>
import { userLogin } from '../../api/base.js'
import { getCarList } from '../../api/car.js'
import { acceptManageLock } from '../../api/parking'

export default {
  data() {
    return {
      isSharePosition: false,
      positionId: null,
      turnUrl: null,
      userInfoId: null,
      canIUse: wx.canIUse('button.open-type.getUserInfo')
    }
  },
  onLoad() {
    let turnUrl = this.$root.$mp.query.turnUrl
    if (turnUrl === null || turnUrl === '' 
      || typeof(turnUrl) === 'undefined') {
      this.turnUrl = null
    } else {
      this.turnUrl = turnUrl
    }

    let isSharePosition = this.$root.$mp.query.isSharePosition
    if (isSharePosition === null || isSharePosition === '' 
      || typeof(isSharePosition) === 'undefined') {
      this.isSharePosition = false
    } else {
      this.isSharePosition = isSharePosition
      this.userInfoId = this.$root.$mp.query.userInfoId || null
      this.positionId = this.$root.$mp.query.positionId || null
    }
  },
  mounted () {
    const _this = this
    wx.getSetting({
      success(res) {
        if (!res.authSetting['scope.userInfo']) {
          wx.showToast({
            title: '小程序需要您授权手机号码， 点击下方授权按钮进行授权',
            icon: 'none'
          })
        } else {
          // _this.loadWXinfoSuccess()
        }
      }
    })
  },
  methods: {
    loadWXinfoSuccess() {
      wx.showToast({
        title:'授权读取个人信息成功，登陆跳转中...'
      })

      this.userToLogin()
    },
    userToLogin() {
      const _this = this
      wx.login({
        success: function(res) {
          if (res.code) {   
            _this.initUserLogin(res.code)
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
    initUserLogin(code) { // 登录接口
      const _this = this
      wx.getStorage({
        key: 'LoginUserInfo',
        success(data) {
          _this.loadCarList(data.data.id)
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
    },
    loadUserLocalInfo() { // 查詢用戶可操控車位
      const _this = this
      loadLockList({
        type: 'controlled'
      }).then(res => {
        if (res.data !== null 
          && res.data !== ''
          && typeof(res.data) !== 'undefined' 
          && res.code === 0) {
          
          let allList = [...res.data.bindedList, ...res.data.controlledList]
          wx.setStorage({ key: 'iCanKZDiCarParking', data: {
            bindedList: res.data.bindedList, // 我绑定车位
            controlledList: res.data.controlledList, // 我可以控制的车位
            allKZList: allList // 全部可控制車位
          }})

          if (allList.length === 0) {
            wx.removeStorage({ key: 'iCanKZDiCarParking' })
          }
        }
      })
    },
    bindGetUserInfo: function (e) {
      if (e.mp.detail.userInfo) {
        // 用户按了允许授权按钮
        var _this = this;
        if (_this.isSharePosition) { // 共享车位
          wx.showModal({ // 添加共享车位信息
            title:'确认接受控制共享',
            confirmText:'确定接受',
            cancelText: '取消操作',
            success: function(res) {
              if (res.confirm) {

                // 添加共享车位信息
                acceptManageLock({
                  userLockId: _this.positionId,
                  head: e.mp.detail.userInfo.avatarUrl,
                  name: e.mp.detail.userInfo.nickName,
                  userInfoId: _this.userInfoId
                }).then(res => {
                  
                  _this.loadUserLocalInfo()
                  wx.showToast({ title: '成功接受邀请', icon: 'success' })
                  setTimeout(() => {
                    wx.switchTab({
                      url: '/pages/personal/main'  
                    })
                  }, 1500)
                })
              }
            }
          })
        } else {
          this.loadWXinfoSuccess()
          wx.setStorage({ key: 'WXUserInfo', data: e.mp.detail.userInfo })

          //授权成功后，跳转进入小程序首页
          wx.switchTab({
            url: '/pages/personal/main'  
          })
        }
      } else {
        //用户按了拒绝按钮
        wx.showToast({
          title: '  用户拒绝授权，无法读取个人信息  '
        })
        // wx.showModal({
        //   title:'拒绝授权提示',
        //   content:'拒绝授权，将无法正常使用小程序功能',
        //   showCancel:false,
        //   confirmText:'继续授权',
        //   success:function(res){
        //     if (res.confirm) {
        //       console.log('用户点击了“返回授权”')
        //     } 
        //   }
        // })
      }
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


