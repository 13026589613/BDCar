import axios from "../../node_modules/axios/dist/axios";
axios.defaults.adapter = function(config) {
  let baseURL;
  if (process.env.NODE_ENV === "development") {
    // baseURL = 'http://192.168.40.8:8888/api' // 本地代理1(100次/小时)
    baseURL = "https://boodow.com/api"; // 本地代理1(100次/小时)
  } else {
    baseURL = "https://boodow.com/api"; // 本地代理2(100次/小时)
  }

  //发交易之前显示加载中
  wx.showLoading({ title: "拼命加载中..." });

  //发交易调用(开发放开注释)
  return new Promise((resolve, reject) => {
    let paramsData = JSON.parse(config.data);
    let contentType = "application/x-www-form-urlencoded";
    // if (typeof(paramsData.contentType) !== 'undefined') {
    //   contentType = paramsData.contentType
    //   paramsData = JSON.stringify(paramsData)
    // }
    if (typeof paramsData.needLogin === "undefined") {
      paramsData.needLogin = true;
    }
    if (paramsData.needLogin) {
      wx.getStorage({
        key: "LoginUserInfo",
        success(data) {
          paramsData = Object.assign(
            paramsData,
            {},
            {
              userInfoId: data.data.id
            }
          );

          wx.request({
            header: {
              "content-type": contentType
            },
            ...config,
            url: baseURL + config.url,
            data: paramsData,
            success: res => {
              // console.log(res)
              if (res.statusCode < 200 || res.statusCode > 300) {
                return reject(res.data || {});
              }

              if (res.data.code !== 0) {
                if (res.data.code === 4) {
                  wx.showToast({
                    title: res.data.msg || "操作异常，请确认后重试",
                    icon: "none"
                  });
                } else if (res.data.code === 5) {
                  wx.showToast({
                    title: res.data.msg || "操作异常，请确认后重试",
                    icon: "none"
                  });
                } else {
                  wx.showToast({
                    title: res.data.msg ? res.data.msg : "网络连接异常,请重试",
                    icon: "none"
                  });
                }
              }
              return resolve(res.data || {});
            },
            complete: res => {
              wx.hideLoading();
              // TODO:
            }
          });
        },
        fail() {}
      });
    } else {
      wx.request({
        header: {
          "content-type": contentType
        },
        ...config,
        url: baseURL + config.url,
        data: paramsData,
        success: res => {
          // console.log(res)
          if (res.statusCode < 200 || res.statusCode > 300) {
            return reject(res.data || {});
          }

          if (res.data.code !== 0) {
            wx.showToast({
              title: res.data.msg ? res.data.msg : "网络连接异常,请重试",
              icon: "none"
            });
          }
          return resolve(res.data || {});
        },
        complete: res => {
          wx.hideLoading();
          // TODO:
        }
      });
    }
  });
};

export default axios;
