<template>
  <v-chart :options="options" autoresize />
</template>

<script>
import { defineComponent, computed } from 'vue';
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import { GridComponent, TooltipComponent, DataZoomComponent, DatasetComponent } from "echarts/components";
import VChart from 'vue-echarts';

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  DataZoomComponent,
  DatasetComponent
]);

export default defineComponent({
  name: 'Eline',
  components: {
    VChart,
  },
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const options = computed(() => ({
      tooltip: {
        trigger: "axis",
        formatter: (params) => {
          const time = params[0].name;
          const zx = params[0].data;
          return `阻抗: ${zx}<br/>时间: ${time}`;
        },
      },
      xAxis: {
        type: "category",
        data: props.data.map((item) => item.time),
        name: '时间/s',
        nameLocation: 'end',
        nameTextStyle: {
          fontSize: 12,
          padding: [0, 0, 10, 0],
        },
      },
      yAxis: {
        type: "value",
        name: '阻抗/Ω',
        nameLocation: 'end',
        nameTextStyle: {
          fontSize: 12,
          padding: [0, 10, 0, 0],
        },
      },
      dataZoom: [
        {
          type: 'slider',
          start: 0,
          end: 100,
          xAxisIndex: [0]
        },
        {
          type: 'inside',
          start: 0,
          end: 100,
          xAxisIndex: [0]
        }
      ],
      series: [
        {
          name: "zx",
          type: "line",
          data: props.data.map((item) => item.zx),
          smooth: true,
          renderMode: 'gl'
        },
      ],
    }));

    return {
      options
    };
  }
});
</script>

<style scoped>
/* 你的样式 */
</style>
