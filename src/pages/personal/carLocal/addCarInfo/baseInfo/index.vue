<template>
  <div class="step-container">
    <div class="step">
      <img src="/static/images/car/step_1.png" alt="">
    </div>

    <div style="width: 100%;">
      <van-cell title="停车场" :value="chooseParking.text || '选择停车场'" is-link value-class="c-gray" @click="openPopPark()" />
      <van-cell title="车位入口" :value="chooseInner.text || '距车位最近的入口'" is-link value-class="c-gray" @click="openPopParkInner()" />
      <van-field :value="carLocalNo" label="车位编号" 
        placeholder="例：B1-2016" 
        input-align="right" @change="onChangeCarLocalNo" />
    </div>

    <div class="mar-top" style="width: 100%;">
      <van-field :value="carLockNumber" center 
        clearable label="车位锁号" slot="right-icon"
        @change="onChangeCarLockNumber" :disabled="id !== null"
        placeholder="扫描或填写车位锁号" :border="false" 
        use-button-slot input-align="right">

        <van-button slot="button" size="mini" @click="scan()">
          <img src="/static/images/car/icon_scanningcode.png" style="width: 20px; height: 20px;" />
        </van-button>
      </van-field>
    </div>

    <van-popup :show="showParkPop" position="bottom" @click-overlay="onCancel">
      <van-picker
        show-toolbar
        title="选择停车场"
        :columns="columns"
        @cancel="onCancel"
        @confirm="onParkingConfirm"
      />
    </van-popup>

    <van-popup :show="showParkPopInner" position="bottom" @click-overlay="onCancel">
      <van-picker
        show-toolbar
        title="距车位最近的入口"
        :columns="innerColumns"
        @cancel="onCancel"
        @confirm="onInnerConfirm"
      />
    </van-popup>

    <div class="operate-btn" 
      @click="turnPage('../shareInfo/main')">
      {{ isUpdate ? '保存车位信息' : '下一步' }}
    </div>
  </div>
</template>

<script>
import { loadParkingAllList, loadParkEnterList, bindLock, lockInfo, loadLockList } from '../../../../../api/parking.js'
export default {
  data() {
    return {
      id: null, // id
      isUpdate: false,
      carLocalNo: null,
      carLockNumber: null,
      columns: [], // 停车场列表
      innerColumns: [], // 入口
      chooseInner: {
        id: null,
        value: null,
        text: null
      },
      chooseParking: {
        id: null,
        value: null,
        text: null
      },
      showParkPop: false,
      showParkPopInner: false
    }
  },
  onShow() {
    this.id = this.$root.$mp.query.lockId
    this.isUpdate = false
    this.carLocalNo = null
    this.carLockNumber = null
    this.chooseInner = {
      id: null,
      value: null,
      text: null
    }
    this.chooseParking = {
      id: null,
      value: null,
      text: null
    }

    if (this.id !== null && this.id !== '' && typeof(this.id) !== 'undefined'
      && this.id !== 'undefined') {
      // 存在id 为修改
      this.initLockInfo()
      this.isUpdate = true
    } else {
      this.id = null
    }
  },
  mounted() {
    this.initParkingList()
  },
  methods: {
    initLockInfo() {
      lockInfo({
        userLockId: this.id
      }).then(res => {
        if (res.code == 0) {
          const data = res.data
          this.id = data.id
          this.carLocalNo = data.parkNum
          this.carLockNumber = data.lockNum

          this.chooseInner.id = data.parkEnterId
          this.chooseInner.value = data.enterName
          this.chooseInner.text = data.enterName

          this.chooseParking.id = data.parkId
          this.chooseParking.text = data.parkName
          this.chooseParking.value = data.parkName
          this.$forceUpdate()

          this.initInnerColumns()
        }
      })
    },
    openPopPark() { // 打开停车场POP
      this.showParkPop = true
    },
    openPopParkInner() {
      if (this.innerColumns.length === 0) {
        wx.showToast({
          icon: 'none',
          title: '该停车场无入口选项'
        })
        return
      }
      this.showParkPopInner = true
    },
    initParkingList() { // 停车场列表
      loadParkingAllList({}).then(res => {
        this.columns = []
        if (typeof(res.data) === 'undefined' || res.data == null) {
          return
        }
        res.data.forEach(element => {
          this.columns.push({
            id: element.id,
            text: element.parkName,
            value: element.id
          })
        })

        this.$forceUpdate()
      })
    },
    initInnerColumns() { // 入口列表
      loadParkEnterList({
        parkId: this.chooseParking.id
      }).then(data => {
        if (typeof(data.data) === 'undefined' || data.data == null) {
          return
        }
        data.data.forEach(element => {
          this.innerColumns.push({
            id: element.id,
            text: element.enterName,
            value: element.id,
            enterPosition: element.enterPosition,
            parkId: element.parkId,
            parkName: element.parkName
          })
        })

        this.$forceUpdate()
      })
    },
    turnPage(url) { // 跳转界面
      this.$forceUpdate()
      if (this.chooseParking.id === null 
        || this.chooseInner.id === null  
        || this.carLockNumber === null  
        || this.carLocalNo === null) {
        
        wx.showToast({
          icon: 'none',
          title: '请补充完整的车位信息'
        })
        return
      }

      if (this.isUpdate) {
        wx.showLoading()
      }

      bindLock({
        userLockId: this.id || '',
        parkId: this.chooseParking.id,
        lockNum: this.carLockNumber,
        parkNum: this.carLocalNo,
        parkEnterId: this.chooseInner.id,
        parkEnterName: this.chooseInner.text,
        parkName: this.chooseParking.text
      }).then(res => {
        // console.log(res);
        if (res.code === 0) {
          this.id = res.data.id
          wx.setStorage({ key: 'chooseParking', data: {
            chooseParking: Object.assign(res.data, {
              parkEnterName: this.chooseInner.text,
              parkName: this.chooseParking.text
            })
          }})

          if (this.isUpdate) {
            wx.hideLoading()
            wx.showToast({
              title: '车位信息变更成功'
            })
            setTimeout(() => {
              wx.navigateBack({ delta: 1 })
            }, 500)
          } else {
            this.updateParkingList(url + '?lockId=' + this.id, res.data.id)
          }
        }
      })
    },
    updateParkingList(url, turnId) {
      loadLockList({
        type: 'controlled'
      }).then(res => {
        if (res.data !== null 
          && res.data !== ''
          && typeof(res.data) !== 'undefined' 
          && res.code === 0) {
          
          wx.setStorage({ key: 'iCanKZDiCarParking', data: {
            bindedList: res.data.bindedList, // 我绑定车位
            controlledList: res.data.controlledList, // 我可以控制的车位
            allKZList: [...res.data.bindedList, ...res.data.controlledList] // 全部可控制車位
          }})

          wx.navigateTo({url: url + '?lockId=' + turnId })
        }
      })
    },
    onParkingConfirm(e) {
      this.chooseParking = e.mp.detail.value
      this.innerColumns = []
      this.chooseInner = {
        id: null,
        value: null
      }
      this.initInnerColumns()
      this.onCancel()
    },
    onInnerConfirm(e) {
      this.chooseInner = e.mp.detail.value
      this.onCancel()
    },
    onCancel() {
      this.showParkPop = false
      this.showParkPopInner = false
    },
    onChangeCarLockNumber(event) {
      this.carLockNumber = event.mp.detail
    },
    onChangeCarLocalNo(event) {
      this.carLocalNo = event.mp.detail
    },
    scan() {
      if (this.id !== null) {
        return
      }

      const _this = this
      wx.scanCode({
        onlyFromCamera: true,
        success(res) {
          setTimeout(() => {
            _this.carLockNumber = res.result
            _this.$forceUpdate()
          }, 500)
        }
      })
    }
  }
}
</script> 

<style lang="scss" scoped>
@import '../local.scss';
</style>


