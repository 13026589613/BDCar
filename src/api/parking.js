import axios from './axios.js'
export const apiAddress = function() {
  if (process.env.NODE_ENV === 'development') {
    return 'http://192.168.40.21:8080/' // 本地代理1(100次/小时)
    // return 'https://boodow.com/api' // 本地代理1(100次/小时)
  } else {
    return 'https://boodow.com/api' // 本地代理2(100次/小时)
  } 
}

// 获取全部停车场列表
export const loadParkingAllList = function(params) {
  params.needLogin = false
  return axios.post('/allParks', params)
}


// 获取停车场列表
export const loadParkingList = function(params) {
  params.needLogin = false
  return axios.post('/parks', params)
}

// 根据ID获取停车场入口
export const loadParkEnterList = function(params) {
  params.needLogin = false
  return axios.post('/parkEnters', params)
}

// 根据停车场ID和入口ID获取停车位置列表
export const loadParkEnterStationList = function(params) {
  params.needLogin = false
  return axios.post('/getParkList', params)
}

// 删除车位信息
export const dropLock = function(userLockInfo) {
  // userLockInfo.contentType = 'application/json'
  return axios.post('/dropLock', userLockInfo)
}

// 保存车位信息
export const bindLock = function(userLockInfo) {
  // userLockInfo.contentType = 'application/json'
  return axios.post('/bindLock', userLockInfo)
}

// 获取用户的车位信息
export const userLockInfoByUserInfoId = function(userLockInfo) {
  return axios.post('/userLockInfoByUserInfoId', userLockInfo)
}

// 预约车位
export const orderPark = function(params) {
  return axios.post('/orderPark', params)
}

// 订单列表
export const orderList = function(params) {
  return axios.post('/routes', params)
}

// 钱包列表
export const wallets = function(params) {
  return axios.post('/wallets', params)
}

// 订单详情
export const orderDetail = function(params) {
  return axios.post('/orderDetail', params)
}

// 取消订单接口
export const cancleOrder = function(params) {
  return axios.post('/cancleOrder', params)
}

// 车位共享列表
export const shareSchemesList = function(params) {
  return axios.post('/shareSchemes', params)
}

// 添加共享设置
export const operateSechmeInfo = function(params) {
  let url = params.isUpdate ? '/editShareScheme' : '/addShareScheme'
  return axios.post(url, params)
}

// 删除共享设置
export const dropSchemes = function(params) {
  return axios.post('/delShareScheme', params)
}



// 车位锁控制
// 订单操作车位锁，降下车位锁
export const handOrderParkLot = function(params) {
  return axios.post('/handOrderParkLot', params)
}

/**
 * 开始订单接口：（用户降下车位锁成功后，需要调用接口启动订单
 */
export const handStartOrder = function(params) {
  return axios.post('/startOrder', params)
}

/**
 * 获取车位锁升起降下状态接口
 */
export const handLoadLockState = function(params) {
  return axios.post('/getLockState', params)
}

// 主人控制车位锁
export const handParkLot = function(params) {
  return axios.post('/handParkLot', params)
}

export const handParkLotNew = function(params) {
  return axios.post('/handParkLotNew', params)
}


// 车位锁邀请控制
// 接受车位锁邀请控制
export const acceptManageLock = function(params) {
  return axios.post('/acceptManageLock', params)
}

// 发起车位锁邀请控制
export const inviteManageLock = function(params) {
  return axios.post('/inviteManageLock', params)
}

// 共享车位锁邀请控制列表
export const lockInfo = function(params) {
  return axios.post('/lockInfo', params)
}

// 删除共享车位锁邀请控制
export const removeManageLock = function(params) {
  return axios.post('/removeManageLock', params)
}

// 催离
export const pressLeave = function(params) {
  return axios.post('/pressLeave', params)
}

// 根据lockid 获取停车位信息
export const getParkInfoByLockid = function(params) {
  return axios.post('/getParkInfoByLockid', params)
}

// 获取绑定次数和接受邀请次数
export const loadBindAndAccessNum = function(params) {
  return axios.post('/getBindAndAccessNum', params)
}

// 保存用户formid
export const saveUserForm = function(params) {
  return axios.post('/saveUserForm', params)
}

// 获取用户未完成的订单记录
export const userUnendOrder = function(params) {
  return axios.post('/userUnendOrder', params)
}

// 获取车位锁信息
export const loadLockList = function(params) {
  return axios.post('/lockList', params)
}

// 根据车位id获取车位状态信息
export const userLockInfo = function(params) {
  return axios.post('/userLockInfo', params)
}