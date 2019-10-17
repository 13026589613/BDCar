<template>
  <div class="flex column-flex bg-gray card-parking-container">
    <map id="map" :longitude="parkingInfo.longitude" :latitude="parkingInfo.latitude" :circles="parkingInfo.circles"
      :markers="markersList" class="map-container">

      <div class="parking-container">
        <div class="P-class parking-P">
          <img src="/static/images/common/icon_parking_big.png" />
        </div>
        <div class="parking-content">
          <p class="parking-title">{{ parkingInfo.title }}停车场</p>
          <p class="parking-info">泊车时间、收费标准以共享车位出租户设置时间为准。</p>
        </div>
      </div>
    </map>

    <van-tabs color="#E0BA21" class="bg-white" @change="onChange"
      style="border-bottom: 1px #f5f5f5 solid; margin-top: .3em" v-if="!scanInfo">
      <van-tab v-for="(enterItem, index) in enterList" :key="index" :title="enterItem.enterName + '进入'"></van-tab>
    </van-tabs>

    <div class="car-position-container">
      <van-row gutter="8">
        <form @submit="chooseListItem" :report-submit="true" style="width: 0" v-for="(item, index) in stationList"
          :key="index" :id="item.userLockId">
          <van-col span="12">
            <div class="car-position-content">
              <button form-type="submit" style="width: 5em;" class="btn-info">
                <div class="p-img">
                  <img src="/static/images/common/icon_parking_left.png" />
                </div>
              </button>

              <button form-type="submit" class="btn-info">
                <div class="flex right-content">
                  <p class="font-lg font-b">{{ item.parkNum }}</p>
                  <p>
                    <van-tag round color="#333">{{ item.price / 100 }}元/时起</van-tag>
                  </p>
                  <p>
                    {{ item.beginTime }}至{{ item.overDay === 0 ? item.endTime : '次日' + item.endTime }}
                  </p>
                </div>
              </button>
            </div>
          </van-col>
        </form>
      </van-row>
      <div v-if="stationList.length === 0" class="no-station">
        暂无车位信息
      </div>
    </div>
  </div>
</template>
<script>
  import {
    checkIsLogin
  } from '../../utils';
  import {
    loadParkEnterList,
    loadParkEnterStationList,
    saveUserForm
  } from '../../api/parking.js'
  export default {
    // onUnload: function () {
    //   wx.redirectTo({
    //     url: '/pages/home/main'
    //   })
    // },
    data() {
      return {
        choostEnterIndex: 0,
        scanInfo: false,
        markersList: [], // market标记
        enterList: [], // 泊车场入口List
        stationList: [], // 入口下面的车位信息 beginTime endTime overDay parkId parkName parkNum price shareSchemeDetailId shareSchemeId userLockId
        parkingInfo: {}, // 泊车场基础信息
        chooseItemInfo: null
      }
    },
    methods: {
      chooseItemInfos(item) {
        this.chooseItemInfo = item
        this.$forceUpdate()
      },
      chooseListItem(e) { // 跳转车位界面，预约
        let wxFormId = e.mp.detail.formId

        let chooseList = this.stationList.filter(item => item.userLockId === e.currentTarget.id)
        this.chooseItemInfo = chooseList[0]
        this.$forceUpdate()

        setTimeout(() => {
          let item = this.chooseItemInfo
          let enterPosition = this.enterList[this.choostEnterIndex].enterPosition
          let enterPositionArray = []
          if (enterPosition !== null && enterPosition !== '') {
            enterPositionArray = enterPosition.split(',')
          }
          const _this = this
          let turnUrl = '../parking/details/main?item=' + JSON.stringify(item) +
            "&parkingInfo=" + JSON.stringify(_this.parkingInfo) +
            '&parkingName=' + _this.parkingInfo.title +
            '&longitude=' + enterPositionArray[1] +
            '&latitude=' + enterPositionArray[0]

          wx.getSetting({
            success(res) {
              if (!res.authSetting['scope.userInfo']) {
                wx.showModal({
                  title: '请先授权个人信息',
                  content: '微信授权读取个人信息',
                  confirmText: '前往授权',
                  cancelText: '暂不授权',
                  success: function (res) {
                    if (res.confirm) {
                      _this.phoneLogin(turnUrl)
                    }
                  }
                })
              } else {
                saveUserForm({
                  wxFormId: e.mp.detail.formId
                }).then(savaForm => {})

                wx.navigateTo({
                  url: turnUrl
                })
              }
            }
          })
        }, 500)
      },
      phoneLogin(turnUrl) {
        wx.login({
          success: function (res) {
            if (res.code) {

              // 获取openId
              wx.request({
                url: 'https://boodow.com/api/getWxId?code=' + res.code,
                method: 'post',
                success: function (data) {
                  const back = JSON.parse(data.data.data)
                  // console.log('sessionKey --- ' + back.sessionKey);
                  // console.log('openId --- ' + back.openId);
                  wx.setStorage({
                    key: 'openId',
                    data: {
                      openId: back.openId
                    }
                  })

                  wx.setStorage({
                    key: 'sessionKey',
                    data: {
                      sessionKey: back.sessionKey
                    }
                  })

                  let url = '../phone/main?turnUrl=' + turnUrl
                  wx.navigateTo({
                    url
                  })
                }
              })
            } else {
              wx.showToast({
                title: '微信登录失败, 请检查网络连接',
                icon: 'none'
              })
            }
          }
        })
      },
      initEnterListById() { // 加载入口LIST
        this.choostEnterIndex = 0
        loadParkEnterList({
          parkId: this.parkingInfo.realId
        }).then(res => {
          // enterName, enterPosition, id, parkId, parkName
          this.enterList = []
          res.data.forEach((element, index) => {
            this.enterList.splice(index, 1, element)
          })

          this.$forceUpdate()

          if (!this.scanInfo) {
            wx.nextTick(() => {
              if (res.data.length > 0) {
                this.initStationListById()
              }
            })
          }
        })
      },
      onChange(tab) { // tab页切换事件
        this.choostEnterIndex = tab.target.index
        this.initStationListById()
      },
      initStationListById() { // 加载入口LIST
        this.stationList = []
        loadParkEnterStationList({
          parkId: this.parkingInfo.realId,
          parkEnterId: this.enterList[this.choostEnterIndex].id
        }).then(res => {
          res.data.forEach((element, index) => {
            this.stationList.splice(index, 1, element)
          })
          this.$forceUpdate()
        })
      }
    },
    onLoad() {
      this.parkingInfo = JSON.parse(this.$root.$mp.query.parkingStation)
      this.markersList.splice(0, 1, this.parkingInfo)

      let parkList = this.parkingInfo.parkList || []
      if (parkList.length > 0) {
        this.scanInfo = true
        this.stationList = parkList
      } else {
        this.scanInfo = false
      }

      this.initEnterListById()
      this.$forceUpdate()
    },
    onShareAppMessage: function (res) {
      if (res.from === 'button') {
        console.log(res.target)
      }
      return {
        path: '/pages/home/main',
        success: function (res) {
          // 转发成功
        },
        fail: function (res) {
          // 转发失败
        }
      }
    },
    onShow(options) {

    }
  }

</script>

<style lang="scss" scoped>
  .map-container {
    width: 100%;
    height: 24em;
    position: relative;

    .parking-P {
      width: 1.2rem;
      height: 1.2rem;
      margin-right: .3rem;
      font-size: .8rem;
    }

    .parking {
      &-container {
        display: flex;
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: .2rem .3rem;
        background: #FFF;
        z-index: 10001;
      }

      &-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      &-title {
        color: #333333;
        font-weight: 600;
        font-size: 1.2em;
        margin-bottom: .1rem;
      }

      &-info {
        color: #666666;
      }
    }
  }

  .no-station {
    font-size: 2em;
    font-weight: 600;
    display: flex;
    min-height: 100px;
    flex: 1;
    justify-content: center;
    align-items: center;
  }

  .car-position {
    &-container {
      padding: .2rem .3rem;
      /* margin-top: .1rem; */
      background-color: #FFF;
      flex: 1;
      overflow-y: auto;
    }

    &-content {
      padding: .2rem;
      background: #f3f3f3;
      margin: .1rem 0;
      border-radius: .2rem;
      display: flex;

      .right-content {
        flex-direction: column;
      }

      .p-img {
        width: 4em;
        height: 7em;
        padding: .5em 0 0 0;

        img {
          width: 100%;
          height: 100%;
        }
      }

      p {
        text-align: right;
        margin: .1rem 0;
      }
    }
  }

  .btn-info {
    position: private;
    display: block;
    margin-left: auto;
    margin-right: auto;
    padding-left: 0px;
    padding-right: 0px;
    box-sizing: border-box;
    font-size: 14px;
    text-align: center;
    text-decoration: none;
    line-height: 1;
    border-radius: 0;
    -webkit-tap-highlight-color: transparent;
    overflow: hidden;
    color: #000000;
    background-color: transparent;
    border: none;
  }

  /deep/ button::after {
    border: none;
  }

</style>
