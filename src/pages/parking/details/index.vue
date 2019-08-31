<template>
  <div class="flex column-flex bg-gray card-parking-container">
    <map id="orderMap"
      :longitude="parkingInfo.longitude" 
      :latitude="parkingInfo.latitude" 
      :markers="markersList"
      class="map-container">

      <div class="parking-container">
        <div class="P-class parking-P">
          <img src="/static/images/common/icon_parking_big.png" />
        </div>
        <div class="parking-content">
          <p class="parking-title">{{ parkingName }}车位：{{ stationInfo.parkNum }}</p>
          <p class="parking-info">
            <van-tag round color="#333" class="mar-rgt-5">{{ stationInfo.price / 100 }}元/时起</van-tag>
            <span class="mar-rgt-5">
              {{ stationInfo.beginTime }}至{{ stationInfo.overDay === 0 ? stationInfo.endTime : '次日' + stationInfo.endTime }}
            </span>
            <img src="/static/images/common/icon_help_mini.png" style="width: 1.2em;height: 1.2em;" />
          </p>
        </div>
      </div>
    </map>
    
    <div class="content">
      <van-row>
        <van-col span="1" v-for="(item, index) in carNo" :key="index">
          <van-button custom-class="car-no-btn-class" plain @click="turnToAddCar()">
            {{ item }}
          </van-button>
        </van-col>
      </van-row>
      
      <form @submit="operateCarInfo" :report-submit="true" style="width: 100%">
        <button form-type="submit" class="sure-order-btn" style="line-height: 2 !important">
          预约车位
        </button>
      </form>
      <!-- <div class="sure-order-btn" @click="operateCarInfo()">
        预约车位
      </div> -->
    </div>
  </div>
</template>

<script>
import { checkIsLogin } from '../../../utils';
import { getCarList } from '../../../api/car.js'
import { orderPark } from '../../../api/parking.js'
export default {
  onUnload: function () {
    // if (this.clickOperate) return
    // wx.navigateTo({
    //   url: '/pages/parking/main?parkingStation=' + JSON.stringify(this.parkingInfo)
    // })
  },
  data() {
    return {
      clickOperate: false,
      carInfo: null,
      carNo: ['', '', '', '','', '', '', ''],
      stationInfo: {},
      parkingName: null,
      longitude: 0,
      latitude: 0,
      parkingInfo: {},
      markersList: [] // market标记
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
    loadCarList() { // 获取登录用户的车辆列表
      getCarList({}).then(res => {
        if (res.data.id === null || typeof(res.data.id) === 'undefined') {
          this.model()
        } else {
          this.carInfo = res.data
          this.loadingMyCar(this.carInfo.carNum)
        }
      })
    },
    model() {
      const _this = this
      wx.showModal({
        title:'前往绑定我的车辆',
        content:' 租用车位前需要先绑定个人车辆信息 ',
        confirmText:'绑定车辆',
        cancelText: '关闭提示',
        success: function(res) {
          if (res.confirm) {
            _this.turnToAddCar()
          } else if (res.cancel) {
            wx.showToast({
              image: '/static/images/icon_tabbar_order_selected@3x.png',
              title: ' 未绑定车辆信息, 无法使用预约车位 '
            })
          }
        }
      })
    },
    turnToAddCar() {
      if (this.carInfo !== null) {
        wx.navigateTo({ url: '/pages/personal/myCar/addCar/main?carInfo=' + JSON.stringify(this.carInfo) + '&turnPage=goback'})
      } else {
        wx.navigateTo({ url: '/pages/personal/myCar/addCar/main?turnPage=goback'})
      }
    },
    loadingMyCar(carNo) { // 加载我的车辆信息（获取最近使用的第一辆车）
      carNo.split('').forEach((value, index) => {
        this.carNo.splice(index, 1, value)
      })
      this.$forceUpdate()
    },
    operateCarInfo(e) { // 跳转车位界面，预约
      this.clickOperate = true
      if (this.carInfo == null) {
        wx.showToast({
          image: '/static/images/icon_tabbar_order_selected@3x.png',
          title: ' 请先绑定车辆 '
        })
        this.model()
        return
      }
      
      orderPark({ // 预约下单
        userLockId: this.stationInfo.userLockId,
        carNum: this.carInfo.carNum,
        shareSchemeDetailId: this.stationInfo.shareSchemeDetailId,
        wxFormId: e.mp.detail.formId
      }).then(res => {
        if (res.code === 0) {
          res.data.longitude = this.longitude
          res.data.latitude = this.latitude
          wx.redirectTo({
            url: '../order/main?orderInfo=' + JSON.stringify(res.data)
          })
        }
      })
    }
  },
  onLoad() {
    this.stationInfo = JSON.parse(this.$root.$mp.query.item)
    this.parkingName = this.$root.$mp.query.parkingName
    this.latitude = this.$root.$mp.query.latitude
    this.longitude = this.$root.$mp.query.longitude
    this.parkingInfo = JSON.parse(this.$root.$mp.query.parkingInfo)
    
    this.markersList.splice(0, 1, this.parkingInfo)
  },
  onShow() {
    this.loadCarList()
  }
}
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%; 
  height: 24em; 
  position: relative; 

  .parking-P {
    width: 1.2rem;
    height: 1.2rem;
    margin-right: .3rem;
    font-size: .8rem;
  }

  .parking {
    &-container {
      display: flex;
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: .2rem .3rem;
      background: #FFF;
      z-index: 10001;
    }

    &-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    &-title {
      color: #333333;
      font-weight:600;
      font-size:1.2em;
      margin-bottom:.1rem;
    }

    &-info {
      color: #666666;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
}

.content {
  border-top: 1px solid #f5f5f5;
  padding-top: 3em;
  background: white;
  align-items:center;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.sure-order-btn {
  margin-top: 3em;
  margin-bottom: 3em;
  background-color:rgba(245, 208, 57, .9);
  padding: .8em 0;
  width: 80%;
  border-radius: 2rem;
  text-align: center;
  color: #333;
  font-size: 1.2em;
}
</style>


