import axios from './axios.js'

// 获取停车场列表
export const userLogin = function(params) {
  params.needLogin = false
  return axios.post('/updateUserPhone', params)
}

// 个人信息统计使用情况
export const userLockOverview = function(params) {
  return axios.post('/userLockOverview', params)
}

// 个人信息统计使用情况列表
export const userLockUseList = function(params) {
  return axios.post('/userLockUseList', params)
}

// 个人中心统计使用情况
export const userCenterOverview = function(params) {
  return axios.post('/userCenterOverview', params)
}

// 拉起支付证书
export const wxPay = function(params) {
  return axios.post('/endBiling', params)
}

// 图文推荐
export const twtj = function(params) {
  return axios.post('/getRecommend', params)
}
