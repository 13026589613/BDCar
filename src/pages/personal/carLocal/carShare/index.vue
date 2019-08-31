<template>
  <div class="local-container">
    <img src="/static/images/car/icon_nodata.png" />
    <div>暂无车位</div>
    <div>点击下方按钮添加车位信息</div>
    <div class="local-add-btn-container" @click="addLocal('../personal/carLocal/main')">
      <div class="local-add-btn-content">
        添加车位
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
    addLocal(url) { // 跳转界面
      wx.navigateTo({url})
    }
  }
}
</script> 

<style lang="scss" scoped>
.local-container {
  width: 100%;
}

.local-add-btn {
  &-container {
    position: absolute;
    left: 0;
    display: flex;
    width: 100%;
    justify-content:center;
    align-items:center;
    z-index: 9999;
  }

  &-content {
    background-color:rgba(245, 208, 57, .9);
    padding: .3rem 0;
    width: 75%;
    border-radius: 2rem;
    text-align: center;
    color: #333;
    font-size: .3rem;
  }
}


</style>


