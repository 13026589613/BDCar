<template>
  <div class="census-container" v-if="censusData !== null">
    <!-- 用户基本信息 -->
    <div class="census-header" @click="turnToLogin()">
      <image class="census-header__avatar" src="/static/images/car/icon_car.png"/> 
      <div class="census-header__info">
        <div class="census-header__name">
          {{ censusData.parkName }}&nbsp;&nbsp;{{ censusData.parkNum }}&nbsp;&nbsp;{{ censusData.enterName }}
        </div>
        <div class="census-header__helper">
          累计分享使用&nbsp;{{ censusData.totalShareHour }} 小时
        </div>
      </div>
    </div>

    <van-tabs color="#E0BA21" class="bg-white census-tab">
      <van-tab title="使用记录">
        <census-list :userLockList="userLockList"></census-list>
      </van-tab>
      <van-tab title="数据统计">
        <census-charts :userLockId="censusData.userLockId"></census-charts>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script>
import CensusList from './census-list'
import CensusCharts from './census-charts'
import { userLockOverview, userLockUseList } from '../../../../api/base.js'
export default {
  components: {
    CensusList,
    CensusCharts
  },
  onLoad() {
    const _this = this
    wx.getStorage({
      key: 'chooseParking',
      success(res) {
        _this.id = res.data.chooseParking.id
        _this.$forceUpdate()
        _this.$nextTick(() => {
          _this.initDataList()
        })
      },
      fail() {
        wx.showToast({
          duration: 3000,
          title: '无绑定车位信息, 请先绑定车位'
        })
        setTimeout(() => {
          wx.navigateBack({ delta: 1 })
        }, 100)
      }
    })
  },
  data() {
    return {
      id: null,
      userLockList: [],
      censusData: null
    }
  },
  methods: {
    initDataList() {
      userLockOverview({
        userLockId: this.id
      }).then(res => { // 加载统计信息
        this.censusData = res.data
        userLockUseList({ // 加载列表
          offset: 0,
          limit: 100,
          userLockId: this.censusData.userLockId
        }).then(data => {
          this.userLockList = data.data.rows
        })
      })
    }
  }
}
</script> 

<style lang="scss" scoped>
.census-container {
  width: 100%;
  flex: 1;

  .census-tab {
    border-bottom: 1px #f5f5f5 solid; 
    margin-top: .3em
  }
  
  .census-header {
    padding: 2em 2em;
    background-color: #F5D039;
    display: flex;
    flex: 1;
  }
  .census-header__avatar {
    width: 6em;
    height: 6em;
    border-radius: 50%;
  }
  .census-header__info {
    padding: 0 30rpx;
    color: #333;
    display: flex;
    flex-direction: column;
    flex: 1;
    justify-content: center;
  }
  .census-header__name {
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1.4;
    display: flex;
    margin-bottom: .5em;
  }
  .census-header__helper {
    font-size: 24rpx;
    line-height: 2;
  }
}
</style>


