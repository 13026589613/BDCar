<template>
  <div class="local-container">
    <img src="/static/images/car/icon_nodata.png" class="no-data-img" />
    <div class="title-info">暂无车位</div>
    <div>点击下方按钮添加车位信息</div>

    <div class="local-add-btn-content" 
      @click="addLocalInfo('../carLocal/addCarInfo/baseInfo/main')">
      添加车位
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
    addLocalInfo(url) { // 跳转界面
      // wx.redirectTo({url})
      wx.navigateTo({url}) 
    }
  }
}
</script> 

<style lang="scss" scoped>
.local-container {
  width: 100%;
  align-items:center;
  display: flex;
  flex-direction: column;
  padding-top: 2em;

  .no-data-img {
    width: 3rem;
    height: 3rem;
  }

  .title-info {
    color: #68401D;
    font-size: 2.2em;
    font-weight: 500;
    margin-bottom: .3em;
  }
}

.local-add-btn {
  &-content {
    margin-top: 5em;
    background-color:rgba(245, 208, 57, .9);
    padding: .8em 0;
    width: 75%;
    border-radius: 2rem;
    text-align: center;
    color: #333;
    font-size: 1.2em;
  }
}


</style>


