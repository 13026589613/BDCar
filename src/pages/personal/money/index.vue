<template>
  <div class="money-container">

    <!-- 钱包数据信息 -->
    <div class="money-card mar-btm">
      <div class="money-card_count" @click="outMoney()">
        {{ (wallet.totalPrice || 0) / 100 }} 元
        <van-tag plain class="mar-lft-5" round color="#555">提现</van-tag>
      </div>

      <div class="money-card_title">
        <span>
          钱包余额 (元)
        </span>
      </div>
    </div>

    <!-- 停车统计分析数据 -->
    <van-cell-group>
      <div class="icon-group">
        <div class="icon">
          <div class="icon__number">{{ wallet.totalHour }}小时</div>
          <div class="icon__title">泊豆租用时长</div>
        </div>
        <div class="icon">
          <div class="icon__number">{{ wallet.totalNum }}次</div>
          <div class="icon__title">泊豆停车次数</div>
        </div>
      </div>
    </van-cell-group>

    <div class="panel pad-all car-place-container">
      <div class="info-show-container" v-for="(item, index) in walletsRecordList" :key="index">
        <div>
          <div class="date" @click="turnPage('../record/details/main?isWallet=true&orderId=' + item.id)">
            {{ item.createTime }}
          </div>
          <span style="margin: 0 8px; font-weight: 600; font-size: 1.2em;" @click="turnPage('../record/details/main?pressState=' + item.pressState
              + '&isWallet=true&orderId=' + item.id)">&nbsp;
            {{ item.carNum }}
            <span class="mar-lft">{{ item.status }}</span>
          </span>

          <span class="van-cell-text fr mar-rgt" @click="askLeave(item)"
            v-if="item.pressState == '0' && (item.orderState === '2')">
            <van-tag round plain color="#F4D65D" size="large">
              <span class="font-smaller font-b" style="padding: 0 .2em;">催他驶离</span>
            </van-tag>
          </span>

          <span class="van-cell-text fr mar-rgt" v-if="item.pressState == '1'">
            <van-tag round color="#F4D65D" size="large">
              <span class="font-smaller font-b" style="padding: 0 .2em; color: #68401D;">已通知驶离</span>
            </van-tag>
          </span>
        </div>
        <div style="margin-top: 10px; padding: 0 1em;"
          @click="turnPage('../record/details/main?isWallet=true&orderId=' + item.id)">
          <span class="fl c-black">
            {{ item.deadTime }}
            <span class="mar-lft-5 c-gray" v-if="item.orderState === '3' || item.orderState === '4'">
              使用 {{ item.totalHour }} 小时
            </span>
          </span>
          <span class="fr c-org font-b" v-if="item.orderState === '3' || item.orderState === '4'">
            总计：{{ item.totalHour * item.price / 100 }}元
          </span>
        </div>
      </div>

      <div v-if="totalNumber == 0" style="flex: 1;" class="bg-white no-data-tip">
        <img src="/static/images/car/icon_nodata.png" class="no-data-img" />
        <span style="margin-bottom: 10%;">
          暂无钱包记录
        </span>
      </div>
    </div>
  </div>
</template>

<script>
  import {
    wallet,
    withdraw
  } from '../../../api/car.js'
  import {
    wallets,
    pressLeave
  } from '../../../api/parking.js'
  export default {
    data() {
      return {
        wallet: {
          totalHour: 0,
          totalNum: 0,
          totalPrice: 0
        },
        walletsRecordList: [],
        totalNumber: 0
      }
    },
    mounted() {
      const _this = this
      wx.getStorage({
        key: 'LoginUserInfo',
        success(res) {
          _this.initWallet(res.data.id)
          _this.initWalletsList()
        },
        fail() {
          _this.hasDataInfo = true
        }
      })
    },
    methods: {
      outMoney() { // 提现
        if (_this.wallet.totalPrice === 0) {
          wx.showToast({
            title: '无可提现金额',
            duration: 2500
          })
          return
        }

        const _this = this
        withdraw({}).then(res => {
          _this.wallet.totalPrice = 0
          wx.showToast({
            title: '提现余额到微信零钱',
            duration: 3000
          })
        })
      },
      askLeave(item) { // 告知离开发通知
        // if (item.pressState == '1' 
        //   || typeof(item.pressState) == 'undefined'
        //   || item.pressState == null) {
        //   return
        // }
        const _this = this
        pressLeave({
          orderId: item.id
        }).then(res => {
          console.log(res);
          wx.showToast({
            title: '已告知催离'
          })
          setTimeout(() => {
            _this.initWalletsList()
          }, 500)
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
          return "进行中"
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
      turnPage(url) { // 跳转界面
        wx.navigateTo({
          url
        })
      },
      initWallet(userId) {
        wallet({
          shareUserInfoId: userId
        }).then(res => {
          this.wallet = res.data
        })
      },
      initWalletsList() {
        wallets({
          limit: 100,
          offset: 0
        }).then(res => {
          this.totalNumber = res.data.total
          // this.list = res.data.rows
          res.data.rows.forEach((element, index) => {
            element.status = this.setStatus(element)
            this.walletsRecordList.splice(index, 1, element)
          })
          this.$forceUpdate()
        })
      }
    }
  }

</script>

<style lang="scss" scoped>
  .money-container {
    width: 100%;
  }

  .car-place-container {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #f3f3f3;
    border-bottom: 1px solid #f3f3f3;
    padding: 1em 0;

    .info-show-container {
      display: flex;
      flex-direction: column;
      flex: 1;
      padding: 1.2em 0;
      border-bottom: 1px solid #f3f3f3;
      margin-bottom: .2em;
      background-color: white;

      .date {
        width: auto;
        height: 2.4em;
        line-height: 2.4em;
        background-color: #EEE;
        border-top-right-radius: 1.2em;
        border-bottom-right-radius: 1.2em;
        display: inline-block;
        padding: 0 1em;
        color: #333333;
        font-weight: 500;
      }
    }
  }

  .icon-img {
    width: 20px;
    height: 22px;
    margin-right: 4px;
  }

  .panel {
    /* background-color: white; */
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


  .money-card {
    padding: 1.5em 2em;
    background-color: #F5D039;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    color: #333;
  }

  .money-card_count {
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1.4;
    display: flex;
    margin-bottom: .3em;
  }

  .money-card_title {
    font-size: 24rpx;
    line-height: 2;
  }

  .no-data-tip {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 1.5em;
    font-weight: 600;

    .no-data-img {
      width: 3rem;
      height: 3rem;
    }
  }

</style>
