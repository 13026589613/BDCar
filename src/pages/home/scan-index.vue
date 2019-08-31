<template>
  <div class="scan-container">
    <div class="login-btn-container"
      @click="turnToLogin()">
      <div class="login-btn-content" v-if="showLogin">
        请先登录，再预约车位
      </div>
    </div>

    <div class="scan-btn" @click="scan()">
      <img class="bg-scan" src="/static/images/scan/bg_scan.png" />
      <img class="scan-img" src="/static/images/scan/scan.png" />
      <span>扫码任意停</span>
    </div>

    <div class="bottom-info-container">
      <img src="/static/images/scan/icon_safe.png" />
      泊豆泊车安全保障
    </div>
  </div>
</template>

<script>
import { acceptManageLock, getParkInfoByLockid } from '../../api/parking'
export default {
  props: {
    showLogin: Boolean
  },
  methods: {
    turnToLogin() {
      this.$emit('turn-to-login')
    },
    scan() {
      const _this = this
      wx.getSetting({
        success(res) {
          if (!res.authSetting['scope.userInfo']) {
            wx.showModal({
              title:'请先授权个人信息', 
              content:'微信授权读取个人信息',
              confirmText:'前往授权',
              cancelText: '暂不授权',
              success: function(res) {
                if (res.confirm) {
                  _this.phoneLogin()
                }
              }
            })
          } else {
            wx.scanCode({
              onlyFromCamera: true,
              success(res) {
                console.log(res);
                _this.turnToPage(res)
              },
              fail() {

              }
            })
          }
        }
      })
    },
    phoneLogin() {
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
                
                let url = '../phone/main'
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
    turnToPage(info) {
      if (info.path && info.path.indexOf('?') > 0) {
        const paths = info.path.split('?')
        const infos = paths[1].split('=')
        getParkInfoByLockid({
          lockId: infos[1]
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
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.scan-container {
  display: flex;
  flex: 1;
  justify-content: center;
  align-items: center;
  position: relative;
}

.scan-btn {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 15em;
  height: 15em;
  border-radius: 50%;
  position: relative;
}

.scan-btn .bg-scan {
  position: absolute;
  top: 0;
  left: 0;
  width:100%;
  height:100%;
  z-index:-1;
}

.scan-img {
  width: 6em;
  height: 6em;
  margin: .3rem 0;
}

.scan-btn span {
  font-size: 1.2em;
}

.bottom-info-container {
  position: absolute;
  background-color: transparent;
  bottom: .7rem;
  right: 0;
  left: 0;
  padding: .1rem;
  z-index: 1;
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
</style>

