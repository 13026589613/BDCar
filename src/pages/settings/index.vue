<template>
  <map id="map" 
    :longitude="longitude" 
    :latitude="latitude" 
    :markers="markersList"
    :circles="circles" 
    style="width: 100%; height: 350px;">
  </map>
</template>
<script>

// 引入SDK核心类
let plugin = requirePlugin("mapPlugin")
let QQMapWX = require('../../../static/tencent-map/map-wx-jssdk.min.js')
let qqmapsdk
export default {
  data() {
    return {
      markersList: [{
        latitude: '40.007153',
        longitude: '116.491081',
        title: '#FF0000DD',
        fillColor: '#7cb5ec88',
        width: 40
      }, {
        latitude: '40.107153',
        longitude: '116.491081',
        title: '#FF0000DD',
        fillColor: '#7cb5ec88',
        width: 40
      }, {
        latitude: '40.087153',
        longitude: '116.191081',
        title: '#FF0000DD',
        fillColor: '#7cb5ec88',
        width: 40
      }, {
        latitude: '40.207153',
        longitude: '117.491081',
        title: '#FF0000DD',
        fillColor: '#7cb5ec88',
        width: 40
      }],
      circles: [{
        latitude: '39.707153',
        longitude: '116.391081',
        color: '#FF0000DD',
        fillColor: '#7cb5ec88',
        radius: 400,
        strokeWidth: 2
      }],
      latitude: 40.002607,
      longitude: 116.487847
    }
  },
  mounted() {
   
  },
  onLoad() {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: "JSDBZ-U4CA2-XUHUH-CX43P-SAXVK-XTFAR"
    });
  },
  onShow() {
    // 调用接口
    qqmapsdk.search({
      keyword: '酒店',
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        console.log(res);
      }
    })
  }
}
</script>

<style lang="css">

</style>


