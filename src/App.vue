<template>
  <a-watermark :image="WATERMARK_IMG" :gap="[300, 300]" :rotate="0" :width="100" :height="100">
    <div class="container">
      <Tips />
      <a-flex gap="24" direction="horizontal" wrap>
        <a-card title="时间-阻抗变化趋势图" hoverable class="item1" ref="lineRef">
          <a-card-meta :description="`UR：${UR} V`" />
          <a-card-meta :description="`RS：${RS} Ω`" />
          <a-card-meta :description="`数据时长：${second} S`" />
          <Eline :data="lineData" />
        </a-card>
        <a-card title="预填数据" hoverable class="item2">
          <a-flex gap="24" direction="vertical">
            <div>
              <span>UR：</span>
              <a-input-number addonAfter="V" step="0.000001" v-model:value="UR" stringMode />
            </div>
            <div>
              <span>RS：</span>
              <a-input-number addonAfter="Ω" step="0.000001" v-model:value="RS" stringMode />
            </div>
            <div>
              <span>数据时长：</span>
              <a-input-number addonAfter="S" step="1" min="1" v-model:value="second" />
            </div>
            <div>
              <span>是否开启数据抽样：</span>
              <a-switch checkedChildren="开启" unCheckedChildren="关闭" v-model:checked="checked" />
            </div>
            <div v-if="checked">
              <div>
                <a-tooltip title="每个数据点中只选一个进行绘制">
                  <span>
                    抽样比例：
                    <QuestionCircleOutlined />
                  </span>
                </a-tooltip>
                <a-input-number addonAfter="个" step="1" min="1" v-model:value="sampleRate" />
              </div>
              <div>
                <span>抽样数据是否平均：</span>
                <a-switch checkedChildren="开启" unCheckedChildren="关闭" v-model:checked="avgChecked" />
              </div>
            </div>
          </a-flex>
        </a-card>
        <a-card title="UA串口值" class="item3" hoverable>
          <a-textarea readonly rows="5" v-model:value="UA" style="resize: none" class="textarea-custom" />
        </a-card>
        <a-card class="item4" hoverable>
          <a-flex gap="24" direction="horizontal" wrap justify="flex-start">
            <div style="flex: 0 0 100%; display: flex;">
              <a-timeline mode="left">
                <a-timeline-item label="步骤一">
                  <ReadData @successTransfer="successTransfer" />
                </a-timeline-item>
                <a-timeline-item label="步骤二">
                  <a-button type="primary" @click="handleCalculateImpedance" class="downloadBtn">
                    计算阻抗
                  </a-button>
                </a-timeline-item>
              </a-timeline>
            </div>
            <a-button @click="downloadZXData" class="downloadBtn">
              保存阻抗数据
            </a-button>
            <a-button @click="downloadLineData" class="downloadBtn">
              保存图表数据
            </a-button>
            <a-button @click="downloadDivAsImage">
              保存图表为图片
            </a-button>
          </a-flex>
        </a-card>
      </a-flex>
    </div>
  </a-watermark>
</template>

<script>
import {
  Button,
  InputNumber,
  Input,
  Card,
  Flex,
  Timeline,
  Watermark,
  message,
  Switch,
  Tooltip
} from "ant-design-vue";
import { DownloadOutlined, QuestionCircleOutlined } from "@ant-design/icons-vue";
import { ref, h } from "vue";
import { saveAs } from "file-saver";
import * as htmlToImage from "html-to-image";
import { nanoid } from "nanoid";
import Eline from "./components/Eline.vue";
import Tips from "./components/Tips.vue";
import ReadData from "./components/ReadData.vue";
import {
  calculateImpedance,
  createTimeNodes,
  mergeArraysToData,
  sampleData,
  sampleDataWithAverage
} from "./utils/index.js";
import { WATERMARK_IMG } from './constants/index.js';

const { TextArea } = Input;
const { Meta } = Card;

export default {
  name: "App",
  components: {
    AButton: Button,
    AInputNumber: InputNumber,
    ATextArea: TextArea,
    ACard: Card,
    AFlex: Flex,
    ATimeline: Timeline,
    AWatermark: Watermark,
    Meta,
    Tips,
    Eline,
    ReadData,
    DownloadOutlined,
    QuestionCircleOutlined
  },
  setup() {
    const UR = ref(60);
    const RS = ref(500);
    const second = ref(2);
    const UA = ref([]);
    const ZX = ref([]);
    const lineData = ref([]);
    const checked = ref(false);
    const avgChecked = ref(false);
    const sampleRate = ref(1000);
    const lineRef = ref(null);

    const downloadDivAsImage = async () => {
      const divElement = lineRef.value;
      if (!divElement) {
        console.error("未找到<div>元素！");
        return;
      }
      try {
        const imgDataURL = await htmlToImage.toPng(divElement);
        saveAs(imgDataURL, `image${nanoid()}.png`);
      } catch (error) {
        console.error("转换<div>为图像时出错：", error);
      }
    };

    const changeRS = (value) => {
      RS.value = parseFloat(value);
    };
    const changeUR = (value) => {
      UR.value = parseFloat(value);
    };
    const changeSecond = (value) => {
      second.value = value || 2;
    };
    const changeSampleRate = (value) => {
      sampleRate.value = value;
    };

    const successTransfer = (value) => {
      UA.value = value;
      message.success("串口数据读取成功！");
    };
    const handleCalculateImpedance = async () => {
      const zx = UA.value.map((ua) => {
        return calculateImpedance(ua, UR.value, RS.value);
      }).filter(Boolean);
      ZX.value = zx;
      const timers = createTimeNodes(zx.length, second.value);
      let lines = mergeArraysToData(timers, zx);
      if (checked.value) {
        lines = avgChecked.value ? sampleDataWithAverage(lines, sampleRate.value) : sampleData(lines, sampleRate.value);
      }
      lineData.value = lines;
      message.success("阻抗计算结束！折线图表已生成！");
    };
    const downloadZXData = () => {
      const numberString = ZX.value.join(",");
      const blob = new Blob([numberString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "numbers.txt";
      a.click();
      URL.revokeObjectURL(url);
    };
    const downloadLineData = () => {
      const formattedString = lineData.value.map((item) => `[${item.time},${item.zx}]`).join(",");
      const blob = new Blob([formattedString], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data.txt";
      a.click();
      URL.revokeObjectURL(url);
    };

    return {
      UR,
      RS,
      second,
      UA,
      ZX,
      lineData,
      checked,
      avgChecked,
      sampleRate,
      lineRef,
      downloadDivAsImage,
      changeRS,
      changeUR,
      changeSecond,
      changeSampleRate,
      successTransfer,
      handleCalculateImpedance,
      downloadZXData,
      downloadLineData,
      WATERMARK_IMG
    };
  }
};
</script>

<style scoped>
.container {
  padding: 24px;
}
.textarea-custom {
  border: none;
  box-shadow: none;
  overflow: auto;
  box-sizing: border-box;
}
.textarea-custom::-webkit-scrollbar {
  display: none; /* Chrome, Safari 和 Opera */
}
.textarea-custom {
  -ms-overflow-style: none;  /* IE 和 Edge */
  scrollbar-width: none;     /* Firefox */
}
.textarea-custom:focus {
  border: none;
  box-shadow: none;
}

.container .item1 {
  flex: 0 0 calc(80% - 24px);
}

.container .item2 {
  flex: 0 0 calc(20% - 24px);
}

.container .item3 {
  flex: 0 0 calc(60% - 24px);
}

.container .item4 {
  flex: 0 0 calc(40% - 24px);
}

/* Media query for small screens */
@media (max-width: 600px) {
  .container .item1,
  .container .item2,
  .container .item3,
  .container .item4 {
    flex: 0 0 100%;
  }
}
</style>
