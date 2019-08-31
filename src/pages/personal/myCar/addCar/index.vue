<template>
  <div class="car-container">
    <div class="content">
      <p style="margin-bottom: 15px;">
        普通车牌号为七位, 新能源车牌号为八位
      </p>
      <van-row>
        <van-col span="1" v-for="(item, index) in carNo" :key="index">
          <van-button custom-class="car-no-btn-class" plain @click="openBoard()">{{ item }}</van-button>
        </van-col>
      </van-row>

      <div class="operate-car-btn" @click="saveInfo()">
        保存车辆信息
      </div>
    </div>

    <div class="board">
      <keyboard @carnum="carnumChange"></keyboard>
    </div>
  </div>
</template>

<script>
import keyboard from './keyboard.vue'
import { setTimeout } from 'timers';
import { bindCars } from '../../../../api/car.js'
export default {
  data() {
    return {
      showSheet: false,
      carNo: [' ', ' ', ' ', ' ',' ', ' ', ' ', ' '],
      turnPage: null,
      id: null,
    }
  },
  onLoad() {
    this.turnPage = this.$root.$mp.query.turnPage
    let carInfo = this.$root.$mp.query.carInfo
    if (typeof(carInfo) !== 'undefined' && carInfo !== null) {
      carInfo = JSON.parse(carInfo)
      console.log(carInfo);
      const carNumList = carInfo.carNum.split('')
      carNumList.forEach((item, index) => {
        this.carNo.splice(index, 1, item)
      })

      this.id = carInfo.id
    }
  },
  components: {
    keyboard
  },
  methods: {
    carnumChange(carnum) { // 车牌号变更
      this.carNo = ['', '', '', '','', '', '', '']
      carnum.split('').forEach((value, index) => {
        this.carNo.splice(index, 1, value)
        this.$forceUpdate()
      })
    },
    openBoard() { // 开启键盘
      this.showSheet = true
    },
    saveInfo() {
      const _this = this
      wx.getStorage({
        key: 'LoginUserInfo',
        success(res) {
          _this.operateCarInfo(res.data)
        }
      })
    },
    operateCarInfo(userId) { // 添加车辆信息
      if (this.carNo.join('').length < 7) {
        wx.showToast({
          icon: 'none',
          title: '请填写正确的车牌号'
        })
        return
      }
      const _this = this
      bindCars({
        userInfoId: userId,
        carNum: this.carNo.join('')
      }).then(res => {
        if (res) {
          wx.showToast({
            title: ' 成功保存车辆信息 ',
            icon: 'success',
            duration: 1500,
            success: function() {
              setTimeout(function() {
                if (_this.turnPage === 'goback') {
                  wx.navigateBack({ delta: 1 })
                }

                if (_this.turnPage !== '-1') return
                if (_this.turnPage !== null) {
                  wx.navigateBack({ delta: 1 })
                } else {
                  wx.redirectTo({ url: _this.turnPage })
                }
              }, 1500)
            }
          })
        } else {
          wx.showToast({
            title: ' 保存车辆信息异常 ',
            icon: 'none',
            duration: 1500
          })
        }
      })
    }
  }
}
</script> 

<style lang="scss" scoped>
.car-container {
  width: 100%;
  align-items:center;
  display: flex;
  flex-direction: column;

  .board {
    flex: 1;
    display: flex;
    align-items: flex-end;
  }
  .content {
    padding-top: 4em;
    width: 100%;
    background: white;
    align-items:center;
    display: flex;
    flex-direction: column;
  }

  .operate-car-btn {
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
}
</style>


