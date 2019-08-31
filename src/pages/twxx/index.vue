<template>
  <div class="full-con" style="padding: 10px;">
    <web-view src="https://boodow.com/api/recommendRead"></web-view>
    <!-- <wxParse :content="titleInfo" /> -->
  </div>
</template>
<script>
  import wxParse from 'mpvue-wxparse'
  export default {
    components: {
      wxParse
    },
    data() {
      return {
        titleInfo: null
      }
    },
    methods: {
      preview(src, e) {
        // do something
      },
      navigate(href, e) {
        // do something
      }
    },
    onLoad(option) { // 实例化API核心类
      // const _this = this
      // wx.getStorage({
      //   key: 'message',
      //   success(res) {
      //     if (res.data) {
      //       _this.titleInfo = res.data.titleInfo
      //     }
      //   }
      // })
    }
  }

</script>

<style>
  @import url("~mpvue-wxparse/src/wxParse.css");

</style>

<style lang="scss">
  .login-btn {
    &-container {
      position: absolute;
      left: 0;
      top: 4em;
      display: flex;
      width: 100%;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    &-content {
      background-color: rgba(245, 208, 57, .9);
      padding: .3rem 0;
      width: 75%;
      border-radius: 2rem;
      text-align: center;
      color: #333;
      font-size: .3rem;
    }
  }

  .person {
    &-container {
      position: absolute;
      background-color: #FFF;
      bottom: 3em;
      right: 0rem;
      border-top-left-radius: 4em;
      border-bottom-left-radius: 4em;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
      padding: .5em;
      z-index: 9999;
    }

    &-btn {
      width: 4em;
      height: 4em;
      border-radius: 50%;
      margin-right: 1em;
      background-color: #f2f2f2;

      img {
        width: 100%;
        height: 100%;
      }
    }
  }

</style>
