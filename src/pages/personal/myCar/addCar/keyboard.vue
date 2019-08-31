<template>
  <div class="board-container">
    <!-- 车牌 -->
    <!-- <div class='carnum'>{{carnum}}</div> -->
    <div class='keyboard'>

      <!-- 省键盘 -->
      <div class="provinces" v-show='hiddenPro'>
        <view class="pro-li fl" v-for="(item, index) in provinceArr" 
          :key="index" :data-province="item"
          @click='proTap'>{{item}}</view>
      </div>

      <!-- 号码键盘	 -->
      <div class="keyNums" v-show='hiddenStr'>
        <view class="pro-li fl" v-for="(item, index) in strArr" 
          :key="index" :data-str="item"
          @click='strTap'>{{item}}</view>
        <div class="bot fl">
          <view class='kb-icon kb-hide fl pro-li' @click='backKeyboard'>返回</view>
          <view class='kb-icon kb-hide fl pro-li' @click='backSpace'>删除</view>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      provinceArr: ["粤", "京", "津", "渝", "沪", "冀", "晋", "辽", "吉","黑", "苏", "浙", "皖", "闽", "赣", "鲁", "豫", "鄂", "湘", "琼", "川", "贵", "云", "陕","甘", "青", "蒙", "桂", "宁", "新", "藏", "使", "领", "警", "学", "港", "澳"],
      strArr: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9","Q", "W", "E", "R", "T", "Y", "U", "P","A", "S", "D", "F", "G", "H", "J", "K", "L","Z","X", "C", "V", "B", "N", "M"], 
      hiddenPro: true, // 省份键盘
      hiddenStr: false, // 数字字母键盘
      carnum: ''
    }
  },
  methods: {
    proTap(e) {//点击省份
      let province = e.mp.currentTarget.dataset.province
      let carnum = this.carnum
      
      this.hiddenPro = false
      this.hiddenStr = true
      if (carnum !== null && carnum !== '') { // 存在
        carnum = carnum.substring(1, carnum.length)
        this.carnum = province + carnum
      } else {
        this.carnum = carnum + province
      }

      this.$emit('carnum', this.carnum)
    },
    strTap(e) {//点击字母数字
      let province = e.mp.currentTarget.dataset.str
      let carnum = this.carnum

      // 车牌长度最多为8个（新能源车牌8个）
      if (carnum.length > 7) return

      carnum += province
      this.carnum = carnum
      this.$emit('carnum', this.carnum)
    },
    backSpace() {//退格
      let carnum = this.carnum
      var arr = carnum.split('')
      arr.splice(-1, 1)

      var str = arr.join('')
      if (str === '') {
        this.hiddenPro = true
        this.hiddenStr = false
      }
      this.carnum = str
      this.$emit('carnum', this.carnum)
    },
    backKeyboard() {//返回省份键盘
      this.hiddenPro = true
      this.hiddenStr = false
    }
  }
}
</script> 

<style lang="scss" scoped>
.board-container {
  width: 100%;
  background: white;
  padding-top: 10rpx;
}
/* 键盘 */
.fl{
  float: left
}
.carnum{
  text-align: center;
  height: 88rpx
}
.tel{
	border-bottom: 2rpx solid #ddd;
	height: 100rpx;
	line-height:100rpx;
}
.chepai{
	height: 200rpx;
	line-height:200rpx;
}
.provinces{
	overflow: hidden;
	// padding:30rpx 0;
}
.pro-li{
	font-size: 32rpx;
  color:#353535;
	height: 76rpx;
	width: 62rpx;
	line-height: 76rpx;
	text-align: center;
	margin-left: 12rpx;
  margin-bottom: 20rpx;
	background-color:#f6f6f6; 
  box-shadow: 2rpx 4rpx 0rpx 0 #999;
  border-radius: 10rpx;
}
.pro-close{
	width: 100rpx;
	height: 70rpx;
	line-height: 70rpx;
	font-size: 32rpx;
	text-align: center;
	background-color: #fff;
	border: 2rpx solid #ddd;
	margin: 5rpx ;
}
.pro-del{
	width: 100rpx;
	height: 70rpx;
	line-height: 70rpx;
	font-size: 32rpx;
	text-align: center;
	background-color: #fff;
	border: 2rpx solid #ddd;
	margin: 5rpx;
}
.keyNums{
	overflow: hidden;
	// padding:30rpx 0;
	/* position: absolute;
	bottom: 0;
	left: 0;
	z-index: 10000; */
}
.pro-ok{
	width: 100rpx;
	height: 70rpx;
	line-height: 70rpx;
	font-size: 32rpx;
	text-align: center;
	background-color: #fff;
	border: 2rpx solid #ddd;
	margin: 5rpx ;
	/* margin-left: 35%; */
}
.pro-d{
	width: 100rpx;
	height: 70rpx;
	line-height: 70rpx;
	font-size: 32rpx;
	text-align: center;
	background-color: #fff;
	border: 2rpx solid #ddd;
	margin: 5rpx;
}
.keyNums .bot .kb-del{
   margin-left: 12rpx
}
.keyNums .bot .kb-icon{
  width: 104rpx;
  height: 76rpx;
  background: #ccc
}
</style>


