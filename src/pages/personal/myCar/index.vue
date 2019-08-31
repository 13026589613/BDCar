<template>
  <div style="flex: 1">
    <!-- <local-list v-if="hasDataInfo"></local-list> -->
    <no-local-info v-if="!hasDataInfo"></no-local-info>
  </div>
</template>

<script>
import LocalList from './local-list'
import NoLocalInfo from './no-local-info'
import { getCarList } from '../../../api/car.js'
export default {
  components: {
    LocalList,
    NoLocalInfo
  },
  data() {
    return {
      hasDataInfo: false
    }
  },
  onLoad() {
    this.loadCarList()
  },
  methods: {
    loadCarList(userId) { // 获取登录用户的车辆列表
      getCarList({ }).then(res => {
        if (res.data.id === null || typeof(res.data.id) === 'undefined') {
          this.hasDataInfo = false
        } else {
          this.hasDataInfo = true
          wx.redirectTo({ url: './addCar/main?carInfo=' + JSON.stringify(res.data) + '&turnPage="-1"'})
        }
      })
    }
  }
}
</script> 

<style lang="scss" scoped>
</style>


