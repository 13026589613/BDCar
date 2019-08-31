<template>
  <div class="bg-gray navgation-container full-container">
    <div class="navgation-map-container">
      <map id="navgation-map" 
        :longitude="longitude" 
        :latitude="latitude"
        :markers="markersList"
        style="width: 100%; height: 100%;">
      </map>
    </div>
    <div class="navgation-content">
      <span>[位置] {{ address }} </span>
      <div class="btn-open-sheet" @click="handleOpenSheet()">
        <img src="/static/images/common/icon_navigatePast.png" />
      </div>
    </div>

    <van-action-sheet
      :show="showSheet"
      :actions="sheetList"
      @select="onSelect"
      @close="() => this.showSheet = false"
    />
  </div>
</template>
<script>

// 引入SDK核心类
export default {
  data() {
    return {
      showSheet: false,
      sheetList: [{
        name: '显示路线',
        subname: '(界面路径规划)',
        // openType: 'share'
      },
      {
        name: '高德地图'
      },
      {
        name: '腾讯地图'
      },
      {
        name: '百度地图'
      },
      {
        name: '街景'
      },
      {
        name: '取消',
        type: 'cancel'
      }],
      latitude: 40.002607,
      longitude: 116.487847,
      address: null,
      markersList: []
    }
  },
  onLoad() {
    const info = JSON.parse(this.$root.$mp.query.info)
    this.latitude = Number(info.latitude) || 0
    this.longitude = Number(info.longitude) || 0
    this.markersList.splice(0, 1, {
      latitude: this.latitude,
      longitude: this.longitude
    })
    this.address = info.parkName + info.parkNum
    console.log(info);
    this.$forceUpdate()
  },
  methods: {
    handleOpenSheet() {
      //  this.setData({ showSheet: true })
      //  this.showSheet = true
      const _this = this
      wx.openLocation({
        latitude: _this.latitude,
        longitude: _this.longitude,
        scale: 15
      })
    },
    onSelect(event) {
      if (event.target.type === 'cancel') {
        this.showSheet = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.navgation-map-container {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 5em;
  top: 0;
}

.navgation-content {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  background: #FFF;
  padding: 0 2em;
  height: 5em;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .btn-open-sheet {
    width: 3em;
    height: 3em;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
</style>


