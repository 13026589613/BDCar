<template>
  <div class="census-charts">
    <div class="list-item">
      <span class="font-b">车位自用</span>
      <span class="c-gray">暂不统计，等待开放</span>
    </div>
    <div class="list-item">
      <span class="font-b">共享闲置</span>
      <span class="c-gray">暂不统计，等待开放</span>
    </div>
    <div class="list-item">
      <span class="font-b">共享使用</span>
      <span class="c-gray">暂不统计，等待开放</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.census-charts {
  padding: 0 2em;
  margin: 1em 0;
  background: white;
  flex: 1;
}
.list-item {
  display: flex;
  flex-direction: row;
  padding: 1.2em 0;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f3f3f3;
}
</style>
