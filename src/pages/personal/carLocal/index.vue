<template>
  <div style="flex: 1">
    <!-- <local-list v-if="!hasDataInfo"></local-list> -->
    <no-local-info></no-local-info>
  </div>
</template>

<script>
import LocalList from './local-list'
import NoLocalInfo from './no-local-info'
import { userLockInfoByUserInfoId, loadLockList } from '../../../api/parking'
export default {
  components: {
    LocalList,
    NoLocalInfo
  },
  data: {
    turnPage: false
  },
  onShow() {
    let pages = getCurrentPages()
    let prevPage = pages[ pages.length - 1]
    if (prevPage.data.turnPage) {
      // wx.redirectTo({ url: '/pages/personal/carLocal/carInfo/main' })
    }
  },
  data() {
    return {
      hasDataInfo: true
    }
  },
  onShow() {
    this.loadUserLocalInfo()
  },
  methods: {
    loadUserLocalInfo() {
      const _this = this
      loadLockList({
        type: 'controlled'
      }).then(res => {
        if (res.data !== null 
          && res.data !== ''
          && typeof(res.data) !== 'undefined' 
          && res.code === 0) {
          
          let allList = [...res.data.bindedList, ...res.data.controlledList]
          wx.setStorage({ key: 'iCanKZDiCarParking', data: {
            bindedList: res.data.bindedList, // 我绑定车位
            controlledList: res.data.controlledList, // 我可以控制的车位
            allKZList: allList // 全部可控制車位
          }})
          if (allList.length === 0) {
            wx.removeStorage({ key: 'iCanKZDiCarParking' })
            wx.removeStorage({ key: 'hasChooseLockInfo' })
          } else {
            if (res.data.bindedList.length > 0) {
              wx.getStorage({ // 初始化选中的车位
                key: 'chooseParking',
                fail() {
                  wx.setStorage({ key: 'chooseParking', data: {
                    chooseParking: res.data.bindedList[0]
                  }})
                }
              })
            } else {
              wx.removeStorage({ key: 'chooseParking' })
            }

            // 重置选中的车位锁
            wx.setStorage({ key: 'hasChooseLockInfo', data: {
              hasChooseLockInfo: allList[0]
            }})
          }

          if (res.data.bindedList && res.data.bindedList.length > 0) {
            wx.redirectTo({ url: '/pages/personal/carLocal/carInfo/main?carLocalInfo=' + JSON.stringify(res.data.bindedList[0]) })
          }
        }
      })
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
    width: 85%;
    border-radius: 2rem;
    text-align: center;
    color: #333;
    font-size: 1.2em;
  }
}


</style>


