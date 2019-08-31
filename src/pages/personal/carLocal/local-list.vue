<template>
  <div class="local-container">

    <!-- 钱包数据信息 -->
    <div class="local-card mar-btm" @click="turnToLogin()">
      <div class="local-card_count">
        216.00
        <van-tag plain class="mar-lft-5" round color="#555">总收入</van-tag>
      </div>

      <div class="local-card_title">
        <span>
          分享车位总收入(元)
        </span>
      </div>

      <div class="local-add-btn-content" @click="turnPage('../carLocal/addCarInfo/baseInfo/main')">
        添加新车位
      </div>
    </div>

    <!-- 停车统计分析数据 -->
    <van-cell-group>
      <div class="icon-group">
        <div class="icon">
          <div class="icon__number">10个</div>
          <div class="icon__title">我的车位</div>
        </div>
        <div class="icon">
          <div class="icon__number">100次</div>
          <div class="icon__title">分享停车次数</div>
        </div>
      </div>
    </van-cell-group>

    <div class="panel pad-all car-place-container">
      <div class="info-show-container" v-for="(item, index) in 10" :key="index"
        @click="turnPage('/pages/personal/carLocal/carInfo/main')">
        <div>
          <div class="date">
           车位编号
          </div>
          <span style="margin: 0 8px; font-weight: 600; font-size: 1.2em;">&nbsp;
            A13564 <span v-if="index === 0" class="mar-lft">使用中</span>
          </span>
          <span class="van-cell-text fr mar-rgt" @click="turnPage('../carLocal/carCard/main')">
            <van-tag round color="#F4D65D" size="large">
              <span class="font-smaller font-b" style="padding: 0 .2em; color: #68401D;">车位卡片</span>
            </van-tag>
          </span>
        </div>
        <div style="margin-top: 10px; padding: 0 1em;">
          <span class="fl c-black">
            分享使用次数15次
          </span>
          <span class="fr c-org font-b">累计收入：21.25元</span>
        </div>
        <div style="margin-top: 10px; padding: 0 1em;">
          <span class="fl c-black">
            xxxxx, xxxxx, xxxx等 3位分享人可使用
          </span>
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
  methods: {
    turnPage(url) { // 跳转界面
      wx.navigateTo({url})
    }
  }
}
</script> 

<style lang="scss" scoped>
.local-container {
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


.local-card {
  padding: 1.5em 2em;
  background-color: #F5D039;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #333;
}

.local-card_count {
  font-size: 1.5em;
  font-weight: 600;
  line-height: 1.4;
  display: flex;
  margin-bottom: .3em;
}
.local-card_title {
  font-size: 24rpx;
  line-height: 2;
}

.local-add-btn {
  &-content {
    margin-top: .5em;
    background-color: transparent;
    border: 1px solid #8A96A3;
    padding: .6em 0;
    width: 50%;
    border-radius: 2rem;
    text-align: center;
    color: #333;
    font-size: 1.2em;
  }
}
</style>


