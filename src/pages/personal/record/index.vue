<template>
  <!-- 记录 && 订单 -->
  <div class="record-container">

    <!-- 泊车统计分析数据 -->
    <van-cell-group>
      <div class="icon-group">
        <div class="icon">
          <div class="icon__number">{{ record.totalHour }}小时</div>
          <div class="icon__title">泊豆泊车时长</div>
        </div>
        <div class="icon">
          <div class="icon__number">{{ record.totalNum }}次</div>
          <div class="icon__title">泊豆泊车次数</div>
        </div>
      </div>
    </van-cell-group>

    <div class="panel pad-all car-place-container mar-top" v-if="totalNumber > 0">

      <div class="info-show-container" v-for="(item, index) in list" :key="index"
        @click="turnPage('../record/details/main', item)">

        <div>
          <div class="date">
            {{ item.createTime }}
          </div>
          <span style="margin: 0 8px; font-weight: 600; font-size: 1.2em;">
            &nbsp;{{ item.carNum }}
          </span>
          <span class="van-cell-text fr mar-rgt c-org font-b" style="font-size: 1.2em;"
            v-if="item.orderState === '3' || item.orderState === '4'">
            总计：{{ item.totalPrice / 100 }}元
          </span>
        </div>

        <div style="margin-top: 10px; padding: 0 1em;" v-if="item.orderState === '0'">
          <span class="fl c-black">
            预约有效时间：{{ item.dueTime }} ，超过时间将取消订单
          </span>
        </div>

        <div style="margin-top: 10px; padding: 0 1em;">
          <span class="fl c-black">
            <span v-if="orderState === '4'">驶离时间：{{ item.outParkTime }}</span>
            <!-- <span v-if="orderState !== '4'">{{ item.deadTime }} 前驶离</span> -->
            <span class="mar-lft-5 c-gray" v-if="item.orderState === '3' || item.orderState === '4'">
              车位使用 {{ item.totalHour }} 小时
            </span>
          </span>
          <span class="fr c-org font-b">
            状态：{{ item.status }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="totalNumber == 0" style="flex: 1;" class="bg-white no-data-tip">
      <img src="/static/images/car/icon_nodata.png" class="no-data-img" />
      <span style="margin-bottom: 10%;">
        暂无行程记录
      </span>
    </div>
  </div>
</template>

<script>
  import {
    record
  } from '../../../api/car.js'
  import {
    orderList
  } from '../../../api/parking.js'
  export default {
    data() {
      return {
        record: {
          totalHour: 0,
          totalNum: 0
        },
        totalNumber: 0,
        list: [],
        turnOrderId: null
      }
    },
    // onUnload: function () {
    //   const _this = this
    //   wx.redirectTo({
    //     url: '/pages/personal/main?goBack=no'
    //   })
    // },
    onLoad() {
      this.turnOrderId = this.$root.$mp.query.orderId
      console.log(this.turnOrderId);
    },
    mounted() {
      this.initRecord()
      this.initOrderList()
    },
    methods: {
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
      turnPage(url, params) { // 跳转界面
        wx.navigateTo({
          url: url + '?orderId=' + params.id
        })
      },
      initOrderList() { // 加载列表
        const _this = this
        orderList({
          limit: 100,
          offset: 0
        }).then(res => {
          this.totalNumber = res.data.total
          res.data.rows.forEach((element, index) => {
            element.status = this.setStatus(element)
            this.list.splice(index, 1, element)
          })
          this.$forceUpdate()

          setTimeout(() => {
            if (typeof (_this.turnOrderId) !== 'undefined' && _this.turnOrderId !== 'undefined' &&
              _this.turnOrderId !== null && _this.turnOrderId !== '') {
              wx.navigateTo({
                url: '../record/details/main' + '?orderId=' + _this.turnOrderId
              })
            }
          }, 300)
        })
      },
      initRecord(userId) { // 统计信息
        record({

        }).then(res => {
          this.record = res.data
        })
      }
    }
  }

</script>

<style lang="scss" scoped>
  .record-container {
    width: 100%;
    padding: 1em 0;
    display: flex;
    flex-direction: column;
  }

  .car-place-container {
    display: flex;
    flex-direction: column;
    border-top: 1px solid #f3f3f3;
    border-bottom: 1px solid #f3f3f3;

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
