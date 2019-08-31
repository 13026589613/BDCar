<template>
  <!-- 车位信息 -->
  <div class="info-container">
    <div class="info-content">
      <div class="header">
        <img src="/static/images/car/icon_car.png" class="car-img" />
        <div class="font-b font-bg mar-top-5 card-div">
          <img src="/static/images/car/i_add@2x.png" class="card-operate-img" @click="turnToAdd()" />
          <div>{{ carLocalInfo.parkName }}</div>
          <img src="/static/images/car/i_selectc@2x.png" class="card-operate-img" style="left:.5em;" @click="openCardList()" />
        </div>
        <div class="mar-top-5">
          {{ carLocalInfo.parkNum }}
        </div>
        <img src="/static/images/car/icon_delete.png" class="btn-img del-img" @click="deleteInfo()" />
        <img src="/static/images/car/icon_edit.png" class="btn-img edit-img" 
          @click="editInfo('../addCarInfo/baseInfo/main')" />
        <img src="/static/images/car/icon_lock.png" class="btn-img lock-img" @click="turnPage('/pages/carPlaceLock/main?carLocalInfo=' + JSON.stringify(carLocalInfo))" />
        <img src="/static/images/car/icon_share.png" class="btn-img share-img" @click="turnPage('../carCard/main?carLocalInfo=' + JSON.stringify(carLocalInfo))" />
      </div>
      
      <div class="footer">
        <div v-if="!hasSetting">
          <img src="/static/images/car/icon_nodata.png" class="no-data-img" />
          <div class="c-gray font-b font-lg mar-top-5">暂未共享</div>
        </div>
        <div v-if="hasSetting">
          <div v-for="(item, index) in shareList" :key="index" class="share-list">
            <div class="flex-row">
              <span>{{ item.beginTime }} 至{{ item.overDay === 1 ? '次日' : '' }} {{ item.endTime }}</span>
              <!-- <br />
              <van-tag type="danger" style="margin: 0 .4em;">{{ item.count }}</van-tag>
              <van-tag type="primary" style="margin: 0 .4em;">{{ item.time }}</van-tag> -->
              <img src="/static/images/car/icon_share_self.png" v-if="item.schemeType === '2'" style="margin: 0 .8em;" />
              <img src="/static/images/car/icon_share_work.png" v-if="item.schemeType === '0'" style="margin: 0 .8em;" />
              <img src="/static/images/car/icon_share_week.png" v-if="item.schemeType === '1'" style="margin: 0 .8em;" />

              <span>{{ item.price / 100 }}元/时</span>
              <!-- <van-tag type="success" style="margin: 0 .4em;">价格: {{ item.price }}元/时</van-tag> -->
            </div>
            <span>
              <img src="/static/images/car/icon_setting_del.png" style="margin-right: .5em;" @click="deleteSchemesInfo(item)" />
              <img src="/static/images/car/icon_setting_edit.png" style="margin-right: .1em;" 
              @click="operateSchemesInfo(item)"/>
            </span>
          </div>
        </div>
      </div>
      <div class="bottom-btn" 
        @click="sharePage()">
        添加共享方案
      </div>
    </div>

    <div class="bottom-info-container" @click="turnPage('../carCensus/main')">
      <img src="/static/images/place_lock/icon_statistics.png" />
      车位使用情况统计
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
  </div>
</template>

<script>
import { dropLock, dropSchemes, shareSchemesList, loadLockList } from '../../../../api/parking.js'
export default {
  data() {
    return {
      showCarCardList: false, // 车位列表显示控制
      columns: [], // 车位列表数据
      showPopCode: false,
      carLocalInfo: {},
      shareList: [],
      hasSetting: true
    }
  },
  onShow() {
    this.initCardList()
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
            _this.initData(res.data.bindedList)
          } else {
            wx.redirectTo({
              url: '/pages/personal/main'
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

            _this.initData(res.data.bindedList)
          })
        }
      })
    },
    initData(bindedList) {
      const _this = this

      wx.getStorage({
        key: 'chooseParking',
        success(res) {
          _this.carLocalInfo = res.data.chooseParking
          _this.$forceUpdate()
          _this.$nextTick(() => {
            _this.initShareSchemeList()
          })
        },
        fail() {
          _this.carLocalInfo = bindedList[0]
          wx.setStorage({ key: 'chooseParking', data: {
            chooseParking: _this.carLocalInfo
          }})

          _this.$forceUpdate()
          _this.$nextTick(() => {
            _this.initShareSchemeList()
          })
        }
      })
    },
    confirmCardPop(e) { // 切换车位
      this.chooseParking = e.mp.detail.value

      this.carLocalInfo = e.mp.detail.value
      this.$forceUpdate()
      this.$nextTick(() => {
        _this.initShareSchemeList()
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
    turnToAdd() {
      wx.navigateTo({
        url: '/pages/personal/carLocal/addCarInfo/baseInfo/main'
      }) 
    },
    sharePage() {
      wx.navigateTo({url: '/pages/personal/carLocal/addCarInfo/shareInfo/main' + '?operate=' + true + '&lockId=' + this.carLocalInfo.id})
    },
    initShareSchemeList() { // 获取共享列表
      this.shareList = []
      shareSchemesList({
        userLockId: this.carLocalInfo.id
      }).then(res => {
        res.data.forEach((element, index) => {
          if (element.reuseType === '1') {
            element.count = '周期'
          }
          if (element.reuseType === '0') {
            element.count = '单次'
          }
          if (element.schemeType === '0') {
            element.time = '工作日'
          }
          if (element.schemeType === '1') {
            element.time = '双休日'
          }
          if (element.schemeType === '2') {
            element.time = '自定义'
          }

          this.shareList.splice(index, 1, element)
        })
        this.$forceUpdate()
      })
    },
    deleteSchemesInfo(item) { // 删除车位共享
      const _this = this
      wx.showModal({
        title:'删除车位共享信息',
        confirmText:'确定删除',
        cancelText: '取消操作',
        success: function(res) {
          if (res.confirm) {
            _this.dropSchemesOperate(item)
          }
        }
      })
    },
    operateSchemesInfo(item) { // 编辑车位共享
      wx.navigateTo({url: '../addCarInfo/shareInfo/main?schemesInfo=' + JSON.stringify(item) + '&lockId=' + this.carLocalInfo.id + '&operate=' + true })
    },
    dropSchemesOperate(item) {
      dropSchemes({
        shareSchemeId: item.id
      }).then(res => {
        if (res.code == 0) {
          wx.showToast({
            duration: 3000,
            title: '成功删除车位共享设置'
          })
          this.initShareSchemeList()
        }
      })
    },
    deleteInfo() { // 删除车位
      const _this = this
      wx.showModal({
        title:'删除车位信息',
        confirmText:'确定删除',
        cancelText: '取消操作',
        success: function(res) {
          if (res.confirm) {
            _this.dropOperate()
          }
        }
      })
    },
    dropOperate() { // 删除操作API
      dropLock({
        userLockId: this.carLocalInfo.id
      }).then(res => {
        if (res.code == 0) {
          wx.removeStorage({ key: 'chooseParking' })
          wx.redirectTo({ url: '/pages/personal/carLocal/main' })
        }
      })
    },
    editInfo(url) { // 编辑车位
      wx.navigateTo({url: url + '?lockId=' + this.carLocalInfo.id})
    },
    turnPage(url) { // 跳转界面
      wx.navigateTo({url})
    }
  }
}
</script> 

<style lang="scss" scoped>
.info-container {
  width: 100%;
  padding: 3em 2.5em;
  flex: 1;
  display: flex;
  flex-direction: column;

  .info-content {
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

      .btn-img {
        position: absolute;
        height: 3em;
        width: 3em;
      }
      .del-img {
        top: 1em;
        left: 1em;
      }
      .edit-img {
        top: 5em;
        left: 1em;
      }
      .lock-img {
        top: 1em;
        right: 1em;
      } 
      .share-img {
        top: 5em;
        right: 1em;
      } 
      .car-img {
        width: 6em;
        height: 6em;
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
    
  }
}

.bottom-info-container {
  background-color: transparent;
  padding: .5em;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333333;
  font-weight: 400;
  font-size: 1em;
  margin-top: 5em;
}
.bottom-info-container img {
  width: .5rem;
  height: .5rem;
  margin-right: .1rem;
  display: inline-block;
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


