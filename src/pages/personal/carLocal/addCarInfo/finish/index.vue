<template>
  <div class="step-container bg-white">
    <div class="step">
      <img src="/static/images/car/step_3.png" alt="">
    </div>

    <div class="pad-all">
      <p class="font-b font-2">设置完成</p>
      <p>泊豆泊车，让泊车更轻松。</p>
    </div>

    <div class="operate-btn mar-top" @click="turnPage('../../carInfo/main')">
      开始管理车位
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
        // wx.redirectTo({ url })
        let pages = getCurrentPages()
        let prevPage = pages[pages.length - 4]
        prevPage.setData({
          turnPage: true
        })
        console.log(prevPage);
        wx.navigateBack({
          delta: 3
        })
      }
    }
  }

</script>

<style lang="scss" scoped>
  @import '../local.scss';

</style>
