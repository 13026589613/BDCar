<template>
  <div class="flex column-flex bg-gray details-container">
    <div class="record-details-container" v-if="orderInfo !== null">
      <div class="time-coantianer" @click="turnToLogin()">

        <div class="success"
          v-if="orderInfo.orderState === '0' || orderInfo.orderState === '1' ||orderInfo.orderState === '4'|| orderInfo.orderState === '3' || orderInfo.orderState === '5'">

          <img src="/static/images/common/icon_success.png" style="width: 8em; height: 8em;" />
          <p class="c-coffee font-b font-2">
            {{ orderInfo.status }}
          </p>
          <!-- <p v-if="orderInfo.orderState === '3'">{{ (orderInfo.totalHour || 0) + '小时' }}</p> -->
          <!-- <p v-if="orderInfo.orderState === '4'">{{ (orderInfo.totalHour || 0) + '小时' }}</p> -->
          <p v-if="orderInfo.orderState === '0'" class="mar-btm-5">请在到达车位时,点击下方按钮降下车位锁使用车位</p>
        </div>

        <div class="time-content" v-if="orderInfo.orderState === '2'">
          <div class="font-3 font-b">{{ orderInfo.hasUserTime || 0 }}</div>
          <div class="font-bg font-b padding-bottom mar-lft-5">小时</div>
          <div class="font-3 font-b mar-lft-2">{{ orderInfo.hasUserMin }}</div>
          <div class="font-bg font-b padding-bottom mar-lft-5">分钟</div>
        </div>
        <p class="text-center" v-if="orderInfo.orderState === '2'">车位使用中,已使用时长</p>

        <div class="car-no-container ">
          <img src="/static/images/common/bg_carNumber.png" />
          <p class="plant-no">
            <span class="mar-rgt">{{ orderInfo.carNumTop }}</span>
            <span>{{ orderInfo.carNumFooter }}</span>
          </p>
        </div>
      </div>

      <div class="local-content">
        <div class="P-class record-details-P">
          <img src="/static/images/common/icon_parking_big.png" />
        </div>
        <div class="record-details-content">
          <p class="font-2 record-details-title font-b" style="font-size: 2em;">
            {{ orderInfo.parkName }} {{ orderInfo.parkNum }}
          </p>
          <!-- <p class="record-details-title">车位编号：{{ orderInfo.parkNum }}</p> -->
          <p class="record-details-title">预约时间：{{ orderInfo.createTime }}</p>
          <p class="record-details-title">最晚入场时间：{{ orderInfo.dueTime }}</p>
          <p class="record-details-title">最晚驾离时间：{{ orderInfo.deadTime }}</p>
          <p class="record-details-title">车位收费标准：{{ orderInfo.price / 100 }} 元/小时</p>
          <p class="record-details-title">超时收费标准：30 元/小时</p>

          <p class="record-details-title">
            当前费用：
            <span class="font-lg font-b">{{ orderInfo.totalPrice / 100 }}</span>
            元
          </p>

          <p class="record-details-title">
            当前状态：
            <span class="font-lg font-b">{{ orderInfo.status }}</span>
          </p>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <div class="content" v-if="orderInfo !== null">
        <div class="sure-order-btn mar-top-5" @click="handleLockPay()"
          v-if="orderInfo.orderState === '2' && isWallet === 0">
          结束停车&付款
        </div>
        <div class="sure-order-btn" @click="handleLock()" v-if="orderInfo.orderState === '0' && isWallet === 0">
          降下车位锁
        </div>
        <div class="sure-order-btn mar-top-5" v-if="orderInfo.orderState === '0' && isWallet === 0"
          @click="turnToNav()">
          导航过去
        </div>
        <div class="sure-order-btn mar-top-5" @click="cancelOrderInfo()"
          v-if="orderInfo.orderState === '0' && isWallet === 0">
          取消预约
        </div>
        <div class="sure-order-btn mar-top-5" @click="handleLockPay()"
          v-if="orderInfo.orderState === '3' && isWallet === 0">
          支付本次费用
        </div>

        <div class="sure-order-btn mar-top-5" @click="askLeave()"
          v-if="(orderInfo.orderState === '2') && isWallet === 1 && orderInfo.pressState == '0'">
          催他驶离
        </div>

        <div class="sure-order-btn mar-top-5"
          v-if="(orderInfo.orderState === '2' || orderInfo.orderState === '3') && orderInfo.pressState == '1'">
          已通知驶离
        </div>
      </div>
    </div>

    <div class="pop-cover" v-if="showPopCover">
      <div class="content-wrapper">
        <div
          style="color: #555; font-weight: 500; flex: 1; justify-content: center; align-items: center; display: flex; font-size: 16px;">
          车位锁响应中</div>
        <div class="progress-outer">
          <div class="progress-enter">
            <div class="progress-bg" style="width: 10%;"></div>
          </div>
        </div>

        <div
          style="font-size: 12px; color: #999; flex: 1; justify-content: center; align-items: center; display: flex;">
          车位锁正在响应指令,请稍后...</div>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    orderDetail,
    cancleOrder,
    handOrderParkLot,
    pressLeave,
    handStartOrder,
    handLoadLockState
  } from '../../../../api/parking.js'
  import {
    wxPay
  } from '../../../../api/base.js'
  import {
    setTimeout
  } from 'timers';
  export default {
    data() {
      return {
        interval: null,
        isWallet: 0,
        pressState: '0',
        orderId: null,
        orderInfo: null,
        showPopCover: false
      }
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
      getUserTime() {
        let createTime = new Date(this.orderInfo.createTime)
        var ms = new Date().getTime() - createTime.getTime()
        if (ms < 0) return 0
        this.orderInfo.hasUserTime = Math.floor(ms / 1000 / 60 / 60) || 0
        console.log(this.orderInfo.hasUserTime);

        this.orderInfo.hasUserMin = Math.floor(ms / 1000 / 60) - this.orderInfo.hasUserTime * 60 || 1
        if (this.orderInfo.hasUserMin >= 0) {
          this.orderInfo.totalPrice = this.orderInfo.hasUserTime * (this.orderInfo.price) + (Math.ceil(this.orderInfo
            .hasUserMin / 60)) * (this.orderInfo.price)
        }

        this.$forceUpdate()
      },
      turnToNav() {
        const position = this.orderInfo.enterPosition.split(',')
        this.orderInfo.latitude = position[0]
        this.orderInfo.longitude = position[1]
        wx.navigateTo({
          url: '/pages/parking/navgation/main?info=' + JSON.stringify(this.orderInfo)
        })
      },
      handleLock() { // 降下车位
        const _this = this
        wx.showModal({
          title: '降下车位锁确认',
          content: '确定已到达车位附近，降下后将进入计费',
          confirmText: '降下车位',
          cancelText: '取消操作',
          success: function (res) {
            if (res.confirm) {
              wx.showLoading()

              // 降下车位接口
              handOrderParkLot({
                orderId: _this.orderId,
                handType: '002'
              }).then(res => {
                // wx.showLoading({
                //   title: '车位锁响应中'
                // })
                _this.showPopCover = true

                _this.interval = setInterval(() => {
                  handLoadLockState({ // 循环获取车位锁状态
                    lockId: _this.orderInfo.lockId
                  }).then(data => {
                    wx.hideLoading()

                    if (data.data === 'nowDown') { // 降下状态进行车位启动和订单刷新
                      clearInterval(_this.interval)
                      _this.showPopCover = false
                      wx.showToast({
                        title: '  车位锁已降下  '
                      })

                      handStartOrder({ // 开始计费订单
                        orderId: _this.orderId
                      }).then(resdata => {
                        if (resdata.code === 0) {
                          _this.initOrderInfo() // 刷新当前订单信息
                        }
                      })
                    } else {
                      if (!_this.interval) {
                        setTimeout(() => {
                          _this.showPopCover = false
                          wx.showToast({
                            title: '车位锁未响应',
                            icon: 'none'
                          })
                        }, 2000)
                      }
                    }
                  })
                }, 4000)

                setTimeout(() => {
                  clearInterval(_this.interval)
                  _this.showPopCover = false
                  wx.hideLoading()
                  // wx.showToast({
                  //   title: '车位锁未响应',
                  //   icon: 'none'
                  // })
                }, 12000)

                setTimeout(() => {
                  _this.showPopCover = false
                }, 20000)

                // setTimeout(() => {
                //   _this.showPopCover = false
                //   wx.hideLoading()
                //   if (res.code === 0) {
                //     wx.showToast({
                //       title: '  车位锁已降下  '
                //     })
                //     _this.initOrderInfo()
                //   } else {
                //     wx.showToast({
                //       title: res.msg,
                //       icon: 'none'
                //     })
                //   }
                // }, 5000)
              })
            }
          }
        })
      },
      pay(payInfo) { // 拉起支付窗口
        const _this = this
        wx.requestPayment({
          timeStamp: payInfo.timeStamp,
          nonceStr: payInfo.nonceStr,
          package: payInfo.packageValue,
          signType: payInfo.signType,
          paySign: payInfo.paySign,
          success(res) {
            wx.showToast({
              title: '订单支付成功'
            })
            setTimeout(() => {
              _this.initOrderInfo()
            }, 1000)
          },
          fail(res) {
            wx.hideLoading()
            wx.showToast({
              icon: 'none',
              title: '支付时系统异常,请重新尝试'
            })
          }
        })
      },
      handleLockPay() { // 升起车位支付订单
        const _this = this
        wx.showModal({
          title: '已驶离车位,订单支付',
          content: '支付前请确认已驶离车位,支付订单时将升起车位锁',
          confirmText: '确认支付',
          cancelText: '取消操作',
          success: function (res) {
            if (res.confirm) {

              handOrderParkLot({ // 升起车位锁
                orderId: _this.orderId,
                handType: '001'
              }).then(res => {

                wx.showLoading()
                _this.showPopCover = true
                _this.payMoney(0)
              })
            }
          }
        })
      },
      payMoney(index) { // 拉起支付
        const _this = this

        if (index <= 3) {
          wxPay({
            orderId: _this.orderId
          }).then(res => {
            wx.hideLoading()

            if (res.code === 5) {
              _this.interval = setInterval(() => {
                handLoadLockState({ // 循环获取车位锁状态
                  lockId: _this.orderInfo.lockId
                }).then(data => {
                  if (data.data === 'nowUp') { // 升起状态拉起支付
                    clearInterval(_this.interval)
                    _this.showPopCover = false
                    _this.pay(res.data)
                  } else {
                    index += 1
                    clearInterval(_this.interval)
                    if (index <= 3) {
                      _this.payMoney(index)
                    } else {
                      setTimeout(() => {
                        _this.showPopCover = false
                        wx.showToast({
                          title: '车位锁未升起无法支付',
                          icon: 'none'
                        })
                      }, 1000)
                    }
                  }
                })
              }, 4000)
            } else {
              _this.showPopCover = false
              _this.pay(res.data)
            }
          })
        }
      },
      askLeave() { // 告知离开发通知
        if (this.orderInfo.pressState == '1' ||
          typeof (this.orderInfo.pressState) == 'undefined' ||
          this.orderInfo.pressState == null) {
          return
        }
        pressLeave({
          orderId: this.orderId
        }).then(res => {
          console.log(res);
          wx.showToast({
            title: '已告知催离'
          })
        })
      },
      cancelOrderInfo() { // 取消订单
        const _this = this
        wx.showModal({
          title: '操作确认',
          content: '确定取消预约该车位,取消后无法再次预约',
          confirmText: '确认取消',
          cancelText: '取消操作',
          success: function (res) {
            if (res.confirm) {

              // 用户确认取消
              wx.showLoading()
              cancleOrder({
                orderId: _this.orderId
              }).then(res => {
                _this.initOrderInfo()
                wx.showToast({
                  title: '成功取消订单',
                  icon: ''
                })
                setTimeout(() => {
                  wx.hideLoading()
                }, 500)
              })
            }
          }
        })
      },
      setStatus(item) {
        if (item.orderState === '0') {
          return "已预约"
        }
        if (item.orderState === '1') {
          return "预约超时"
        }
        if (item.orderState === '2') {
          return "车位使用中"
        }
        if (item.orderState === '3') {
          return "等待支付"
        }
        if (item.orderState === '4') {
          return "行程结束"
        }
        if (item.orderState === '5') {
          return "已取消"
        }
      },
      initOrderInfo() { // 加载我的车辆信息（获取最近使用的第一辆车）
        orderDetail({
          orderId: this.orderId
        }).then(res => {
          console.log(res);
          this.orderInfo = res.data
          // this.orderInfo.pressState = this.pressState
          this.orderInfo.status = this.setStatus(this.orderInfo)
          this.orderInfo.carNumFooter = this.orderInfo.carNum.substring(2, this.orderInfo.carNum.length)
          this.orderInfo.carNumTop = this.orderInfo.carNum.substring(0, 2)
          this.orderInfo.totalPrice = Number(this.orderInfo.totalPrice)
          this.$forceUpdate()

          if (this.orderInfo.status == '车位使用中') {
            this.getUserTime()
            setInterval(() => {
              this.getUserTime()
            }, 1000 * 60)
          }
        })
      }
    },
    onShow() {
      this.orderInfo = null
      this.orderId = this.$root.$mp.query.orderId
      this.isWallet = this.$root.$mp.query.isWallet
      this.pressState = this.$root.$mp.query.pressState

      if (typeof (this.isWallet) === 'undefined') {
        this.isWallet = 0
      } else {
        this.isWallet = 1
      }

      console.log(this.isWallet);
      this.$forceUpdate()

      this.initOrderInfo()
    }
  }

</script>

<style lang="scss" scoped>
  .details-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #FFF;

    .time-coantianer {
      background-color: #F5D039;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      padding: 1em 0 4em 0;

      .time-content {
        display: flex;
        justify-content: center;
        align-items: flex-end;

        .padding-bottom {
          padding-bottom: 6px;
        }
      }

      .car-no-container {
        position: absolute;
        bottom: -1em;
        height: 2em;
        left: 0;
        right: 0;
        display: flex;
        justify-content: center;
        color: white;
        font-weight: 600;
        font-size: 2em;
        line-height: 2em;

        img {
          position: absolute;
          left: 51%;
          top: 0;
          bottom: 0;
          margin-left: -4.4em;
          height: 2em;
          width: 8.6em;
          z-index: 1;
        }

        .plant-no {
          z-index: 10;
          letter-spacing: 3px;

          span:first-child {
            position: relative;
          }

          span:first-child::after {
            content: "";
            position: absolute;
            width: .5em;
            height: .5em;
            background: white;
            border-radius: 50%;
            top: 50%;
            margin-top: -0.25em;
            margin-left: .2em;
          }
        }
      }
    }

    .local-content {
      display: flex;
      flex-direction: row;
      background: #FFF;
      padding: 5em 2em 2em 2em;

      .record-details-P {
        width: 1.2rem;
        height: 1.2rem;
        margin-right: .3rem;
        font-size: .8rem;
      }
    }

    .content {
      border-top: 1px solid #f5f5f5;
      padding-top: 1em;
      background: white;
      justify-content: flex-start;
      align-items: center;
      display: flex;
      flex-direction: column;
      flex: 1;

      .sure-order-btn {
        background-color: rgba(245, 208, 57, .9);
        padding: .8em 0;
        width: 80%;
        border-radius: 2rem;
        text-align: center;
        color: #333;
        font-size: 1.2em;
      }
    }
  }

  .record-details {
    &-container {
      display: flex;
      flex-direction: column;
    }

    &-title {
      color: #333333;
      font-size: 1.2em;
      margin-bottom: .5em;
    }
  }

  .success {
    background-color: #F5D039;
    // margin-bottom: 1em;
    text-align: center;
    // padding: 2em 0;
  }


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
    background: repeating-linear-gradient(-45deg, #e61244 25%, #fb8980 0, #fb8980 50%, #e61244 0, #e61244 75%, #fb8980 0);
    background-size: 16px 16px;
    -webkit-animation: panoramic 8s linear infinite;
    animation: panoramic 8s linear infinite;
  }

  @-webkit-keyframes panoramic {
    to {
      background-position: 200% 0;
      width: 100%;
    }
  }

  @keyframes panoramic {
    to {
      background-position: 200% 0;
      width: 100%;
    }
  }

</style>
