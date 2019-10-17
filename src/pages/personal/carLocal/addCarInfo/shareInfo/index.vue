<template>
  <div class="step-container">
    <div class="step">
      <img src="/static/images/car/step_2.png" alt="">
    </div>

    <div style="width: 100%;">
      <van-cell title="共享类型">
        <div>
          <van-tag :plain="reuseType !== 1" :color="reuseType === 1 ? '#F5D039' : '#999999'"
            @click="chooseReuseType(1)">
            <span class="c-black">周期</span>
          </van-tag>
          <van-tag :plain="reuseType !== 0" class="mar-lft-5" :color="reuseType === 0 ? '#F5D039' : '#999999'"
            @click="chooseReuseType(0)">

            <span class="c-black">单次</span>
          </van-tag>
        </div>
      </van-cell>
      <van-cell title="重复时段">
        <div>
          <van-tag :plain="schemeType !== 0" :color="schemeType === 0 ? '#F5D039' : '#999999'" text-color="#333333"
            @click="chooseSchemeType(0)">

            <span class="c-black">工作日</span>
          </van-tag>
          <van-tag :plain="schemeType !== 1" class="mar-lft-5" :color="schemeType === 1 ? '#F5D039' : '#999999'"
            @click="chooseSchemeType(1)">

            <span class="c-black">双休日</span>
          </van-tag>
          <van-tag :plain="schemeType !== 2" class="mar-lft-5" :color="schemeType === 2 ? '#F5D039' : '#999999'"
            @click="chooseTime(2)">

            <span class="c-black">自定义</span>
          </van-tag>
        </div>
      </van-cell>
      <van-cell title="自定义时段" is-link v-if="schemeType == 2">
        <van-tag class="mar-lft-5" v-for="(item, index) in resultInfo" :key="index" color="#F5D039">
          <span class="c-black">{{ item }}</span>
        </van-tag>
      </van-cell>

      <van-cell title="开始时间" :value="startTime || '选择开始时间点'" is-link value-class="c-gray" @click="chooseStartTime()" />
      <van-cell title="结束时间" :value="(endTime !== null ? (overDay === 1 ? '次日 ' : '') : '') + (endTime || '选择结束时间点')"
        is-link value-class="c-gray" @click="chooseEndTime()" />
    </div>

    <div class="mar-top" style="width: 100%;">
      <van-field :value="price" center clearable label="共享单价" @change="priceChange" placeholder="如设置3.5元/时，输入3.5即可"
        :border="false" input-align="right">
      </van-field>
    </div>

    <div class="operate-btn" @click="turnPage('../finish/main')">
      设置共享时段
    </div>
    <div class="operate-btn" v-if="canJump && !operate" @click="turnToPage('../finish/main')">
      跳过设置
    </div>

    <van-popup :show="showPopStart" position="bottom" @clickOverlay="onCancel">
      <van-datetime-picker type="time" :value="startTime" :minHour="startMinHour" :maxHour="startMaxHour"
        @cancel="onCancel" @confirm="onConfirmStart" />
    </van-popup>

    <van-popup :show="showPopEnd" position="bottom" @clickOverlay="onCancel">
      <van-datetime-picker type="time" :value="endTime" :minHour="endMinHour" :maxHour="endMaxHour" @cancel="onCancel"
        @confirm="onConfirmEnd" />
    </van-popup>

    <van-popup :show="showPopWeek" position="bottom" @clickOverlay="onCancel">
      <div @click="onCancelweek()" style="padding: 1em; border-bottom: 1px solid #f5f5f5; float: left;">取消</div>

      <div @click="onCancel()" style="padding: 1em; border-bottom: 1px solid #f5f5f5; float: right;">确定选择</div>
      <div style="clear: both;"></div>
      <van-checkbox-group :value="result" @change="onChange" style="padding: 1em 0;">
        <van-cell-group>
          <van-cell v-for="(cellItem, cellIndex) in list" :key="cellIndex" :title="cellItem" :data-name="cellIndex"
            @click="toggle" clickable>
            <van-checkbox :name="cellIndex" @click="checkboxClick" :class="'checkboxes-' + cellIndex"
              style="margin-bottom: .5em;">
              &nbsp;
            </van-checkbox>
          </van-cell>
        </van-cell-group>
      </van-checkbox-group>
    </van-popup>
  </div>
</template>

<script>
  import {
    operateSechmeInfo
  } from '../../../../../api/parking.js'
  export default {
    data() {
      return {
        canJump: true,
        list: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
        // list: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
        result: [], // 周几
        resultInfo: [],
        startTime: null, // beginTime
        startMinHour: 0,
        startMaxHour: 23,
        endTime: null, // endTime
        endMinHour: 0,
        endMaxHour: 23,
        showPopStart: false,
        showPopEnd: false,
        showPopWeek: false,
        schemeType: 0, // 0、工作日、1、周末、2自定义
        reuseType: 1, // 0初始 1 重复
        lockId: null, // 车位ID
        price: null,
        overDay: 1, // 次日标示
        schemesInfo: null,
        isUpdate: false,
        operate: false
      }
    },
    onShow() {
      this.isUpdate = false
      this.operate = false
      this.lockId = this.$root.$mp.query.lockId
      console.log(this.lockId);
      this.operate = this.$root.$mp.query.operate

      const schemesInfo = this.$root.$mp.query.schemesInfo
      if (typeof (schemesInfo) !== 'undefined' && schemesInfo !== null) {
        this.schemesInfo = JSON.parse(schemesInfo)
        this.isUpdate = true
        this.endTime = this.schemesInfo.endTime
        this.startTime = this.schemesInfo.beginTime
        this.price = this.schemesInfo.price / 100
        this.schemeType = Number(this.schemesInfo.schemeType)
        this.reuseType = Number(this.schemesInfo.reuseType)
        // this.result = this.schemesInfo.startTime
      }
    },
    methods: {
      priceChange(event) {
        this.price = event.mp.detail
      },
      noop() {

      },
      onChange(event) {
        this.result = event.mp.detail
        this.resultInfo = []
        this.result.forEach(element => {
          this.resultInfo.push(this.list[Number(element)])
        });
      },
      checkboxClick() {
        return
      },
      toggle(event) {
        const {
          name
        } = event.mp.currentTarget.dataset
        const checkbox = this.$mp.page.selectComponent(`.checkboxes-${name}`)
        checkbox.toggle()
      },
      onCancelweek() {
        this.showPopWeek = false
        this.result = []
        this.resultInfo = []
        this.$forceUpdate()
      },
      onCancel() {
        this.showPopStart = false
        this.showPopEnd = false
        this.showPopWeek = false
      },
      chooseTime(info) {
        this.schemeType = info
        this.showPopWeek = true
      },
      chooseReuseType(info) {
        this.reuseType = info
      },
      chooseSchemeType(info) {
        this.schemeType = info
        this.result = []
        this.resultInfo = []
      },
      chooseStartTime() {
        this.showPopStart = true
      },
      chooseEndTime() {
        if (this.startTime == null ||
          typeof (this.startTime) == 'undefined') {

          this.endTime = null
          wx.showToast({
            icon: 'none',
            title: '  请选择开始时间  '
          })
          return
        }

        this.showPopEnd = true
      },
      checkTime() {
        if (this.endTime == null || this.startTime == null) {
          return
        }
        const startArr = this.startTime.split(':')
        const endArr = this.endTime.split(':')
        const startHour = Number(startArr[0])
        const startMin = Number(startArr[1])
        const endHour = Number(endArr[0])
        const endMin = Number(endArr[1])

        if (endHour <= startHour) { // 次日
          this.overDay = 1
        } else if (endHour <= startHour + 2) {
          if (endHour <= startHour + 1) {
            this.overDay = 1
          } else {
            if (endMin <= startMin) { // 次日大于start
              this.overDay = 1
            } else {
              this.overDay = 0
            }
          }
        } else {
          this.overDay = 0
        }
      },
      onConfirmStart(event) {
        this.endTime = null
        this.startTime = event.mp.detail

        let timeArray = Number(this.startTime.substring(0, 2))
        // console.log(timeArray);
        // this.endMinHour = timeArray + 2
        this.$forceUpdate()
        this.onCancel()
        this.checkTime()
      },
      onConfirmEnd(event) {
        this.endTime = event.mp.detail
        this.onCancel()
        this.checkTime()
      },
      turnToPage(url) {
        wx.navigateTo({
          url
        })
      },
      turnPage(url) { // 跳转界面
        this.$forceUpdate()
        if (this.startTime === null ||
          this.endTime === null ||
          this.schemeType === null ||
          this.lockId === null ||
          this.schemeType === null ||
          this.price === null ||
          (this.schemeType === 2 && this.result === null) ||
          this.reuseType === null) {

          wx.showToast({
            icon: 'none',
            title: '请补充完整的车位共享时段信息'
          })
          return
        }

        const shareSchemeId = this.isUpdate ? this.schemesInfo.id : ''

        const resultItemList = [...this.result]
        resultItemList.map((item) => {
          item = item + 1
        })
        operateSechmeInfo({
          shareSchemeId: shareSchemeId,
          isUpdate: this.isUpdate,
          overDay: this.overDay,
          beginTime: this.startTime, // beginTime
          endTime: this.endTime, // endTime
          schemeType: this.schemeType, // 0、工作日、1、周末、2自定义
          reuseType: this.reuseType, // 0初始 1 重复
          lockId: this.lockId, // 车位ID
          userLockId: this.lockId,
          price: Number(this.price) * 100,
          weekDays: resultItemList.join(',')
        }).then(res => {
          // console.log(res);
          if (res.code === 0) {
            if (this.operate) {
              wx.navigateBack({
                delta: 1
              })
            } else {
              wx.navigateTo({
                url
              })
            }
          }
        })
      }
    }
  }

</script>

<style lang="scss" scoped>
  @import '../local.scss';

</style>
