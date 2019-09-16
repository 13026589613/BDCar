<template>
  <div class="flex column-flex bg-gray order-container">
    <div class="parking-container">
      <div class="success">
        <img src="/static/images/common/icon_success.png" style="width: 8em; height: 8em;" />
        <p class="c-coffee font-b font-2 mar-top-5 mar-btm-5">预约成功</p>
        <p>请在到达车位时点击下方按钮降下车位锁</p>
      </div>

      <div class="local-content">
        <div class="P-class parking-P">
          <img src="/static/images/common/icon_parking_big.png" />
        </div>
        <div class="parking-content">
          <p class="parking-title" style="font-size: 2em;">{{ orderInfo.parkName }}车位：{{ orderInfo.parkNum }}</p>
          <div class="local-info">
            <van-tag round color="#333" class="mar-rgt-5">{{ orderInfo.price / 100 }}元/时</van-tag>
            <span class="mar-rgt-5">可停至{{ orderInfo.deadTime }}</span>
            <img src="/static/images/common/icon_help_mini.png" style="width: 1.2em;height: 1.2em;" />
          </div>
          <div>
            <p class="font-lg">预约时间：{{ orderInfo.createTime }}</p>
            <p class="font-lg mar-top-5">最晚入场：{{ orderInfo.dueTime }}</p>
            <p class="font-lg mar-top-5">最晚离开：{{ orderInfo.deadTime }}</p>
            <p class="font-lg mar-top">预约车牌号: {{ orderInfo.carNum }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="content pad-top-5">
      <div class="sure-order-btn" @click="handleLock()">
        降下车位锁
      </div>
      <div class="sure-order-btn bg-white mar-top-5 navigation-btn" @click="turnToNav()">
        导航过去
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
    handOrderParkLot,
    handStartOrder,
    handLoadLockState
  } from '../../../api/parking';
  import {
    checkIsLogin
  } from '../../../utils';
  export default {
    onUnload: function () {
      if (!this.turnPage) { // 不是程序主动跳转提示
        this.chooseTurn()
      }
    },
    data() {
      return {
        carNo: ['', '', '', '', '', '', '', ''],
        interval: null,
        showPopCover: null,
        orderInfo: {
          carNum: null,
          createTime: null,
          deadTime: null,
          dueTime: null,
          id: null,
          orderState: null,
          parkName: null,
          parkNum: null,
          price: null,
          turnPage: false
        }
      }
    },
    onLoad() {
      this.orderInfo = JSON.parse(this.$root.$mp.query.orderInfo)
      console.log(this.orderInfo);
      this.$forceUpdate()
    },
    methods: {
      chooseTurn() {
        const _this = this
        wx.showModal({
          title: '预约订单提示',
          content: '当前有一笔预约订单,是否前往查看',
          confirmText: '查看记录',
          cancelText: '关闭提示',
          success: function (res) {
            if (res.confirm) {
              _this.finish()
            } else {
              // wx.redirectTo({ url: '/pages/home/main' })
            }
          }
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
              _this.handleLockOperate()
            }
          }
        })
      },
      handleLockOperate() {
        const _this = this
        wx.showLoading()

        _this.showPopCover = true
        handOrderParkLot({
          orderId: _this.orderInfo.id,
          handType: '002'
        }).then(res => {
          wx.hideLoading()

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
                  orderId: _this.orderInfo.id
                }).then(resdata => {
                  if (resdata.code === 0) {
                    _this.turnPage = true
                    _this.finish()
                    // _this.initOrderInfo() // 刷新当前订单信息
                  }
                })
              }
            })
          }, 4000)

          setTimeout(() => {
            clearInterval(_this.interval)
            _this.showPopCover = false
            wx.showToast({
              title: '车位锁未响应',
              icon: 'none'
            })
          }, 20000)

          // setTimeout(() => {
          //   if (res.code === 0) {
          //     wx.showToast({
          //       title: '  车位锁已升起  '
          //     })
          //     _this.turnPage = true
          //     _this.finish()
          //   } else {
          //     wx.showToast({
          //       title: res.msg,
          //       icon: 'none'
          //     })
          //   }
          // }, 300)
        })
      },
      finish() {
        const url = '/pages/personal/record/main'
        wx.navigateTo({
          url: url + '?orderId=' + this.orderInfo.id
        })
      },
      turnToNav() {
        console.log(this.orderInfo);
        wx.navigateTo({
          url: '../navgation/main?info=' + JSON.stringify(this.orderInfo)
        })
      }
    },
    onShow(options) {
      // console.log(this.$root.$mp.query);
    }
  }

</script>

<style lang="scss" scoped>
  .order-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .parking-P {
    width: 1.2rem;
    height: 1.2rem;
    margin-right: .3rem;
    font-size: .8rem;
  }

  .parking {
    &-container {
      display: flex;
      flex-direction: column;

      .local-content {
        display: flex;
        flex-direction: row;
        justify-content: center;
        background: #FFF;
        padding: 2em 2em;
      }

      .success {
        margin-bottom: 1em;
        background: white;
        text-align: center;
        padding: 2em 0;
      }
    }

    &-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .local-info {
        display: flex;
        flex-direction: row;
        align-items: center;
        border-bottom: 1px solid #F1F0EA;
        margin-bottom: 1em;
        padding-bottom: 1em;
      }
    }

    &-title {
      color: #333333;
      font-weight: 600;
      font-size: 1.4em;
      margin-bottom: .1rem;
    }
  }

  .content {
    border-top: 1px solid #f5f5f5;
    padding-top: 3em;
    background: white;
    justify-content: flex-start;
    align-items: center;
    display: flex;
    flex-direction: column;
    flex: 1;
  }

  .sure-order-btn {
    background-color: rgba(245, 208, 57, .9);
    padding: .8em 0;
    width: 80%;
    border-radius: 2rem;
    text-align: center;
    color: #333;
    font-size: 1.2em;
  }

  .sure-order-btn.navigation-btn {
    border: 1px solid #666;
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
