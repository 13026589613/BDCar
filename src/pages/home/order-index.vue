<template>
  <div class="flex order-container">
    <div class="search-input">
      <!-- <van-search :value="searchValue" placeholder="请输入搜索关键词"></van-search> -->

      <div class="btn-model" @click="changeShowType()">
        <div v-if="showType" class="modle-content">
          <img src="/static/images/common/icon_list.png" class="img-model-type" /> 列表模式
        </div>
        <div v-if="!showType" class="modle-content">
          <img src="/static/images/common/icon_list.png" class="img-model-type" /> 地图模式
          <!-- <img src="/static/images/common/map_my_position.png" class="img-model-type" /> 地图模式 -->
        </div>
      </div>
    </div>

    <!-- 地图模式 -->
    <div v-if="showType" class="map-container">
      <map id="homeMap" show-location @markertap="clickTipMarker" @tap="clickMapTip" scale="12" :longitude="longitude"
        :latitude="latitude" :markers="markersList" :circles="circles" class="map-container">
      </map>

      <!-- v-if="showTWXX" -->
      <cover-view class="map-TWXX-container" v-if="showTWXX">
        <cover-image :src="TWXX" class="img" @click="trunPageToInfo()" />
        <cover-image src="/static/images/icon_close@2x.png" @click="closeInfo()" class="close-img" />
      </cover-view>


      <!-- marker信息 -->
      <cover-view class="map-marker-container" v-if="showTipMarkeStatus">
        <cover-view class="header">
          <cover-view class="display-flex flex-1 info-div">
            <cover-view class="mar-rgt-5">
              {{ tipMarkerInfo.title }}
              ({{ tipMarkerInfo.chronometer }}分钟内)
            </cover-view>
            <!-- <van-tag round color="#333" text-color="#A3A3A3">3.0元/时起</van-tag> -->
          </cover-view>
          <cover-view class="display-flex flex-1">
            <cover-view class="P-class mar-rgt-5">
              <cover-image src="/static/images/common/icon_parking_mini.png" />
            </cover-view>
            <cover-view>
              可用车位：{{ tipMarkerInfo.parksNum }}个
            </cover-view>
          </cover-view>
        </cover-view>
        <cover-view style="height: 1px; width: 100%; background: #d3d3d3;"></cover-view>
        <cover-view class="footer">
          <cover-view class="display-flex flex-1">
            <cover-view class="P-class mar-rgt-5">
              <cover-image src="/static/images/common/icon_navigatePast.png" />
            </cover-view>
            <cover-view @click='navigationLocal'>导航过去</cover-view>
          </cover-view>
          <cover-view class="split-line"></cover-view>
          <cover-view class="display-flex flex-1">
            <cover-view class="P-class mar-rgt-5">
              <cover-image src="/static/images/common/icon_parkingDetails.png" />
            </cover-view>
            <cover-view @click="tapDetails">查看详情</cover-view>
          </cover-view>
        </cover-view>
      </cover-view>

      <!-- 存在正在进行的订单 -->
      <cover-view class="login-btn-container" @click="turnToUsingOrderInfo()" v-if="showHasUsingOrder">
        <cover-view class="login-btn-content">点击查看进行中的订单 -> </cover-view>
      </cover-view>

      <!-- 登录提示窗口 -->
      <cover-view class="login-btn-container" @click="turnToLogin()" v-if="showLogin">
        <cover-view class="login-btn-content">请先登录，再预约车位</cover-view>
      </cover-view>

      <!-- 个人中心 -->
      <cover-view class="person-container" v-if="showPersonalBtn">
        <cover-view class="person-btn" @click="turnToPersonal()">
          <cover-image src="/static/images/common/personal.png" />
        </cover-view>
      </cover-view>

      <!-- 左侧锁、定位 -->
      <cover-view class="lock-container" @click="turnToLock()" v-if="showMapBtnStatus && showType">
        <cover-image src="/static/images/common/car_lock.png" />
      </cover-view>
      <cover-view class="position-container" v-if="showMapBtnStatus && showType" @click="localPostion()">
        <cover-image src="/static/images/common/icon_location.png" />
      </cover-view>
    </div>

    <!-- 列表模式 -->
    <div v-if="!showType" class="list-container">
      <van-row gutter="8" style="width: 100%;">
        <van-col span="12" v-for="(item, index) in markersList" :key="index">
          <div class="list-panel" @click="chooseListItem(item)">
            <div class="list-panel-header">
              <span class="font-b font-lg">{{ item.title }}</span>
              <span class="display-flex">
                <span class="P-class mar-rgt-5">
                  <img src="/static/images/common/icon_parking_mini.png" />
                </span>
                <span>{{ item.parksNum }}</span>
              </span>
            </div>
            <img class="list-panel-driver-img" src="/static/images/common/img_road.png" />
            <div class="list-panel-footer">
              <van-tag round color="#EEE" :textColor="'#A3A3A3'">
                <span class="font-lg font-b" style="color: #A3A3A3; padding: .1em .5em .2em .5em">
                  延时入场 {{ item.chronometer }}分钟内
                </span>
              </van-tag>
            </div>
          </div>
        </van-col>
      </van-row>
    </div>
  </div>
</template>
<script>
  import {
    twtj
  } from '../../api/base.js'
  import {
    loadParkingList,
    apiAddress
  } from '../../api/parking.js'
  import {
    getLocation,
    toast
  } from '../../utils/wxapi'
  import {
    setTimeout
  } from 'timers';
  export default {
    data() {
      return {
        showTWXX: false,
        TWXXInfo: null,
        TWXX: null,
        showPersonalBtn: true,
        tipMarkerInfo: null,
        showTipMarkeStatus: false,
        showMapBtnStatus: true,
        showType: true, // 地图模式true  列表模式 false
        searchValue: null, // 搜索框值\
        parkingList: [],
        markersList: [],
        distance: 10000,
        circles: [{
          latitude: 36.693218,
          longitude: 117.13125,
          color: '#FF0000DD',
          fillColor: '#7cb5ec10',
          radius: 0,
          strokeWidth: .5
        }],
        latitude: 36.693218,
        longitude: 117.13125,
        mapCtx: null
      }
    },
    props: {
      location: Object,
      hasUsingOrder: Object,
      showLogin: Boolean,
      showHasUsingOrder: Boolean
    },
    mounted() {
      this.localPostion()
    },
    methods: {
      turnToUsingOrderInfo() { // 正在进行的订单
        const url = '/pages/personal/record/main'
        wx.navigateTo({
          url: url + '?orderId=' + this.hasUsingOrder.id
        })
      },
      navigationLocal() {
        const _this = this
        wx.openLocation({
          latitude: Number(_this.tipMarkerInfo.latitude),
          longitude: Number(_this.tipMarkerInfo.longitude),
          parkName: _this.tipMarkerInfo.title,
          scale: 15
        })
      },
      initParkingList() { // 初始化停车场列表信息s
        this.latitude = this.location.latitude
        this.longitude = this.location.longitude
        this.circles[0].latitude = this.location.latitude
        this.circles[0].longitude = this.location.longitude
        this.circles[0].radius = this.distance

        loadParkingList({
          point: this.latitude + ',' + this.longitude,
          distance: this.distance
        }).then(res => {
          this.markersList = []

          if (typeof (res.data) === 'undefined' || res.data == null) {
            return
          }
          res.data.forEach(element => {
            let postionArray = element.parkPosition.split(',')
            if (postionArray.length !== 2) return

            // chronometer
            this.markersList.push({
              id: this.markersList.length + 1,
              realId: element.id,
              latitude: postionArray[0],
              longitude: postionArray[1],
              title: element.parkName,
              parksNum: element.parksNum,
              fillColor: element.chronometer,
              width: 25,
              height: 40,
              // iconPath: apiAddress() + element.parkImage,
              iconPath: '/static/images/common/map_icon.png',
              chronometer: element.chronometer
            })
          })

          this.$forceUpdate()
        })
      },
      turnToLogin() {
        this.$emit("turn-to-login")
      },
      turnToPersonal() {
        this.$emit('turn-personal')
      },
      changeShowType() {
        this.showType = !this.showType
        this.$emit('change-type', this.showType)
      },
      clickMapTip(e) {
        this.showMapBtnStatus = true
        this.showTipMarkeStatus = false
        this.tipMarkerInfo = null
        this.showPersonalBtn = true
        this.$emit('tip-marker', false, null)
      },
      clickTipMarker(e) {
        let id = e.mp.markerId
        this.showMapBtnStatus = false
        this.showTipMarkeStatus = true
        this.showPersonalBtn = false
        this.tipMarkerInfo = this.markersList[id - 1]
        this.$emit('tip-marker', true, this.markersList[id - 1])
      },
      chooseListItem(item) { // 选中停车场所位置
        let url = '../parking/main?parkingStation=' + JSON.stringify(item)
        wx.navigateTo({
          url
        })
      },
      turnToLock() { // 进入车位锁管理
        const _this = this
        wx.getStorage({
          key: 'LoginUserInfo',
          success(data) {
            if (data.data.id !== null) {
              wx.navigateTo({
                url: '../carPlaceLock/main'
              })
            } else {
              _this.turnToLogin()
            }
          },
          fail() {
            _this.turnToLogin()
          }
        })
      },
      tapDetails(item) { // 选中停车场所位置
        const _this = this
        setTimeout(() => {
          _this.showPersonalBtn = true
          _this.showMapBtnStatus = true
          _this.showTipMarkeStatus = false
        }, 1500)
        let url = '/pages/parking/main?parkingStation=' + JSON.stringify(this.tipMarkerInfo)
        wx.navigateTo({
          url
        })
      },
      closeInfo() {
        this.showTWXX = false
      },
      trunPageToInfo() {
        let url = '/pages/twxx/main?TWXXInfo=' + JSON.stringify(this.TWXXInfo)
        wx.navigateTo({
          url
        })
      },
      loadtwtj() {
        const _this = this
        // twtj({}).then(res => {
        //   wx.setStorage({ key: 'message', data: {
        //     createDate: res.data.createDate,
        //     titleInfo: res.data.content,
        //     pictureUrl: res.data.pictureUrl
        //   }})
        //   _this.showTWXX = true
        //   _this.TWXX = res.data.pictureUrl
        //   _this.TWXXInfo = res.data.content
        // })

        wx.getStorage({
          key: 'message',
          success(data) {
            if (data.data) {
              twtj({
                time: data.data.createDate
              }).then(res => {
                if (res.data !== null) {
                  wx.setStorage({
                    key: 'message',
                    data: {
                      createDate: res.data.createDate,
                      pictureUrl: res.data.pictureUrl,
                      titleInfo: res.data.content
                    }
                  })

                  _this.showTWXX = true
                  _this.TWXX = res.data.pictureUrl
                  _this.TWXXInfo = res.data.content
                }
                //  else {
                //   _this.showTWXX = true
                //   _this.TWXX = data.data.pictureUrl
                //   _this.TWXXInfo = data.data.titleInfo
                // }
              })
            } else {
              twtj({}).then(res => {
                wx.setStorage({
                  key: 'message',
                  data: {
                    createDate: res.data.createDate,
                    titleInfo: res.data.content,
                    pictureUrl: res.data.pictureUrl
                  }
                })
                _this.showTWXX = true
                _this.TWXX = res.data.pictureUrl
                _this.TWXXInfo = res.data.content
              })
            }
          },
          fail() {
            twtj({}).then(res => {
              wx.setStorage({
                key: 'message',
                data: {
                  createDate: res.data.createDate,
                  titleInfo: res.data.content,
                  pictureUrl: res.data.pictureUrl
                }
              })
              _this.showTWXX = true
              _this.TWXX = res.data.pictureUrl
              _this.TWXXInfo = res.data.content
            })
          }
        })
      },
      localPostion() { // 定位个人的位置信息
        this.loadtwtj()
        const _this = this

        wx.getSetting({
          success: (res) => {
            if (res.authSetting['scope.userLocation'] != undefined &&
              res.authSetting['scope.userLocation'] != true) { //非初始化进入该页面,且未授权

              wx.showModal({ // 弹出授权窗口
                title: '是否授权当前位置',
                content: '需要获取您的地理位置，请确认授权，否则地图功能将无法使用',
                success: function (res) {
                  if (res.cancel) {
                    toast('未允许获取定位信息,地图无法加载车位信息')
                  } else if (res.confirm) {

                    wx.openSetting({ // 获取微信授权信息
                      success: function (data) {
                        if (data.authSetting["scope.userLocation"] == true) {
                          wx.showToast({
                            title: '授权成功',
                            icon: 'success',
                            duration: 5000
                          })

                          //再次授权，调用getLocationt的API
                          getLocation().then(res => {
                            _this.latitude = res.latitude
                            _this.longitude = res.longitude

                            if (!res.success) {
                              toast('未允许获取定位信息,地图无法加载车位信息')
                            } else {
                              this.initParkingList()
                            }
                          })
                        } else {
                          toast('未允许获取定位信息,地图无法加载车位信息')
                        }
                      }
                    })
                  }
                }
              })
            } else if (res.authSetting['scope.userLocation'] == undefined) { //初始化进入
              getLocation().then(res => {
                _this.latitude = res.latitude
                _this.longitude = res.longitude

                if (!res.success) {
                  toast('未允许获取定位信息,地图无法加载车位信息')
                } else {
                  this.initParkingList()
                }
              })
            } else {
              getLocation().then(res => {
                _this.latitude = res.latitude
                _this.longitude = res.longitude

                if (!res.success) {
                  toast('未允许获取定位信息,地图无法加载车位信息')
                } else {
                  this.initParkingList()
                }
              })
            }
          }
        })
      }
    }
  }

</script>
<style lang="scss" scoped>
  @import './order-index.scss';

  .img-model-type {
    display: inline-block;
    width: .5rem;
    height: .4rem;
  }

</style>
