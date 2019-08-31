/** Created by guangqiang on 2018-06-29 19:58:09 */

// toast 工具类
class checkIsLogin {
  
  static checkIsLogin (turnUrl, redirectTo = false) {
    wx.getStorage({
      key: 'LoginUserInfo',
      success: function (res) { // 已经授权，存在用户信息
        if (redirectTo) {
          wx.redirectTo({ url: turnUrl })
        } else {
          wx.navigateTo({ url: turnUrl })
        }
      },
      fail: function (res) { // 未授权用户信息不存在
        let url = '../phone/main'
        wx.navigateTo({ url })
      }
    })
  }
}

export default checkIsLogin