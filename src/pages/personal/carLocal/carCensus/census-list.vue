<template>
  <div class="census-list-container">
    <div class="panel pad-all car-place-container">
      <div v-if="userLockList.length == 0" style="flex: 1;" class="bg-white no-data-tip">
        <img src="/static/images/car/icon_nodata.png" class="no-data-img" />
        <span style="margin-bottom: 10%;">
          暂无使用记录
        </span>
      </div>
      
      <div class="info-show-container" 
        v-if="userLockList.length > 0"
        v-for="(item, index) in userLockList" :key="index">
        <div>
          <div class="date">
            {{ item.createTime }}
          </div>
          <span style="margin: 0 8px; font-weight: 600; font-size: 1.2em;">
            &nbsp;{{ item.carNum }}
          </span>
          <span class="van-cell-text fr mar-rgt">
            <van-tag round color="#EFEFEF" size="large">
              <span class="font-smaller font-b" 
                style="padding: 0 .5em .2em .5em; color: #68401D;">
                {{ item.status }}
              </span>
            </van-tag>
          </span>
        </div>
        <div style="margin-top: 10px; padding: 0 1em;">
          <span class="fl c-black">
            {{ item.deadTime }} 前驶离
            <span class="mar-lft-5 c-gray"> 累计使用 {{ item.totalHour }} 小时</span>
          </span>
          <span class="fr c-org font-b">计费：{{ item.totalHour * item.price / 100 }}元</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      
    }
  },
  props: {
    userLockList: {
      default: [],
      type: Array
    }
  },
  mounted () {
    this.userLockList.forEach((element, index) => {
      element.status = this.setStatus(element)
      this.userLockList.splice(index, 1, element)
    })
    this.$forceUpdate()
  },
  methods: {
    turnPage(url) { // 跳转界面
      wx.navigateTo({url})
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
  }
}
</script> 

<style lang="scss" scoped>
.census-list-container {
  width: 100%;
  padding: 1em 0;
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


