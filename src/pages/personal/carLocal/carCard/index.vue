<template>
  <!-- 车位信息 -->
  <div class="card-container" v-if="carLocalInfo !== null">
    <div class="card-content">
      <div class="header">
        <img src="/static/images/car/icon_car.png" class="car-img" />
        <div class="font-b font-bg mar-top-5 card-div">
          {{ carLocalInfo.parkName }} {{ carLocalInfo.parkNum }}
          <img src="/static/images/car/i_selectc@2x.png" class="card-operate-img" style="left:.5em;" @click="openCardList()" />
        </div>
        <div class="mar-top-5">
          有{{ totalCount }}位车位锁控制者
        </div>
      </div>
      <div class="footer">
        <div v-if="totalCount == 0">
          <img src="/static/images/car/icon_nodata.png" class="no-data-img" />
          <div class="c-gray font-b font-lg mar-top-5">暂无共享信息</div>
        </div>

        <div v-if="totalCount > 0">
          <div v-for="(item, index) in lockList" :key="index" class="share-list">
            <span>{{ item.controlUserNickName }}</span>
            <span @click="delManageLock(item)">
              <img src="/static/images/car/icon_setting_del.png" 
                style="margin-right: .5em;" />
            </span>
          </div>
        </div>
      </div>
      <div class="bottom-btn" @click="saveInviteManageLock(true)">
        邀请家人使用
      </div>
      <div class="bottom-btn btn-lock" @click="turnPage('../../../carPlaceLock/main?carLocalInfo=' + JSON.stringify(carLocalInfo))">
        车位锁控制
      </div>

      <van-popup :show="showCarCardList" 
      position="bottom"
      click-overlay="cancelCardPop">
      <van-picker
        show-toolbar
        title="切换控制车位"
        :columns="columns"
        @cancel="cancelCardPop"
        @confirm="confirmCardPop"
      />
    </van-popup>

      <van-popup :show="showPopCode" custom-class="pop-class" @close="openCode(false)">
        <img :src="shareImg" />
      </van-popup>
    </div>
  </div>
</template>

<script>
import { inviteManageLock, lockInfo, removeManageLock } from '../../../../api/parking'
export default {
  data() {
    return {
      showCarCardList: false, // 车位列表显示控制
      columns: [], // 车位列表数据
      showPopCode: false,
      carLocalInfo: null,
      lockList: [],
      totalCount: 0,
      shareImg: '/static/images/personal/icon_my_qrCode.png'
    }
  },
  onLoad() {
    const _this = this
    _this.initCardList()
    wx.getStorage({
      key: 'chooseParking',
      success(res) {
        _this.carLocalInfo = res.data.chooseParking
        if (_this.carLocalInfo !== null) {
          _this.loadLockInfoList()
        }
        _this.$forceUpdate()
      },
      fail() {
        wx.showToast({
          title: '系统参数异常',
          icon: 'none'
        })

        setTimeout(() => {
          wx.navigateBack({ delta: 1 })
        }, 1500)
      }
    })
  },
  methods: {
    initCardList() { // 我绑定的车位锁列表
      this.columns = []
      const _this = this

      wx.getStorage({
        key: 'iCanKZDiCarParking',
        success(res) {
          if (res.data.bindedList.length > 0) {
            res.data.bindedList.forEach((element,index) => {
              _this.columns.push(Object.assign(element, {
                id: element.id,
                text: element.parkName + ' ' + element.parkNum,
                value: index
              }))
            })
          } else {
            loadLockList({
              type: 'controlled'
            }).then(res => {
              if (typeof(res.data) === 'undefined' || res.data == null) {
                return
              }
              // 我绑定的车位锁列表
              res.data.bindedList.forEach(element => {
                _this.columns.push({
                  id: element.id,
                  text: element.parkName + ' ' + element.parkNum,
                  value: element.id
                })
              })
            })
          }
        },
        fail() {
          loadLockList({
            type: 'controlled'
          }).then(res => {
            if (typeof(res.data) === 'undefined' || res.data == null) {
              return
            }
            // 我绑定的车位锁列表
            res.data.bindedList.forEach(element => {
              _this.columns.push({
                id: element.id,
                text: element.parkName + ' ' + element.parkNum,
                value: element.id
              })
            })
          })
        }
      })
    },
    confirmCardPop(e) { // 切换车位
      this.chooseParking = e.mp.detail.value
      this.carLocalInfo = e.mp.detail.value
      this.$forceUpdate()
      this.$nextTick(() => {
        this.loadLockInfoList()
      })

      const _this = this
      wx.setStorage({ key: 'chooseParking', data: {
        chooseParking: _this.chooseParking
      }})
      this.cancelCardPop()
    },
    cancelCardPop() { // 取消车位选择pop
      this.showCarCardList = false
      this.$forceUpdate()
    },
    openCardList() { // 打开车位选择pop
      this.showCarCardList = true
      this.$forceUpdate()
    },
    saveInviteManageLock() { // 发起邀请
      inviteManageLock({
        userLockId: this.carLocalInfo.id
      }).then(res => {

        // 获取生成的图片信息
        this.shareImg = res.data.fileUrl
        this.showPopCode = true
        this.$forceUpdate()
        console.log(res);
      })
    },
    loadLockInfoList() { // 获取邀请列表
      lockInfo({
        userLockId: this.carLocalInfo.id
      }).then(res => {
        this.lockList = res.data.sharedList
        this.totalCount = this.lockList.length
        this.$forceUpdate()
      })
    },
    delManageLock(item) { // 删除邀请
      const _this = this
      wx.showModal({
        title:'删除控制共享信息',
        confirmText:'确定删除',
        cancelText: '取消操作',
        success: function(res) {
          if (res.confirm) {
            removeManageLock({
              lockShareId: item.id,
              userInfoId: item.userInfoId
            }).then(res => {
              wx.showToast({
                title: '成功删除信息'
              })
              _this.loadLockInfoList()
            })
          }
        }
      })
    },
    turnPage(url) { // 跳转界面
      wx.navigateTo({url})
    },
    openCode(value) { // 弹出二维码
      this.showPopCode = value
    }
  }
}
</script> 

<style lang="scss" scoped>
.card-container {
  width: 100%;
  padding: 7em 3em;
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 30%;

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    position: relative;
    background: white;
    border-radius: .5em;

    .header {
      padding: 3.5em 0 2em 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      background-color: #F5D039;
      border-top-left-radius: .5em;
      border-top-right-radius: .5em;
      position: relative;

      .car-img {
        width: 6em;
        height: 6em;
        position: absolute;
        top: -3em;
        left: 50%;
        margin-left: -3em;
      }
    }
    .footer {
      flex: 1;
      text-align: center;
      padding: 0em 1.6em;
      margin: .5em 0 2em 0;
      overflow-x: hidden;
      overflow-y: auto;

      .no-data-img {
        width: 10em;
        height: 10em;
        margin-top: 2em;
      }

      .share-list {
        display: flex;
        flex-direction: row;
        padding: 1.2em 0;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #f3f3f3;
        img {
          width: 20px; 
          height: 20px; 
        }
      }
    }
    .bottom-btn {
      position: absolute;
      background-color:rgba(245, 208, 57, .9);
      height: 3em;
      line-height: 3em;
      width: 75%;
      margin-left: 12.5%;
      border-radius: 1.5em;
      text-align: center;
      color: #333;
      font-size: 1.2em;
      bottom: -1.5em;
    }
    .btn-lock {
      bottom: -6em;
    }
  }
}

.bottom-card-container {
  background-color: transparent;
  padding: .5em;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333333;
  font-weight: 400;
  font-size: 1em;
  margin-top: 5em;
}
.bottom-card-container img {
  width: .5rem;
  height: .5rem;
  margin-right: .1rem;
  display: inline-block;
}

.pop-class {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;

  img {
    width: 15em;
    height: 15em;
  }
}
.card-operate-img {
  position:relative !important;
  width:1.5em;
  height:1.5em;
  left:-.5em;
}
.card-div {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: center;
  align-items: center;
}
</style>


