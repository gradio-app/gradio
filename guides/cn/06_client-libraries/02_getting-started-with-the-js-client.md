# 使用Gradio JavaScript客户端快速入门

Tags: CLIENT, API, SPACES

Gradio JavaScript客户端使得使用任何Gradio应用作为API非常简单。例如，考虑一下这个[从麦克风录音的Hugging Face Space，用于转录音频文件](https://huggingface.co/spaces/abidlabs/whisper)。

![](https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/gradio-guides/whisper-screenshot.jpg)

使用`@gradio/client`库，我们可以轻松地以编程方式使用Gradio作为API来转录音频文件。

以下是完成此操作的完整代码：

```js
import { Client } from "@gradio/client";

const response = await fetch(
	"https://github.com/audio-samples/audio-samples.github.io/raw/master/samples/wav/ted_speakers/SalmanKhan/sample-1.wav"
);
const audio_file = await response.blob();

const app = await Client.connect("abidlabs/whisper");
const transcription = await app.predict("/predict", [audio_file]);

console.log(transcription.data);
// [ "I said the same phrase 30 times." ]
```

Gradio客户端适用于任何托管的Gradio应用，无论是图像生成器、文本摘要生成器、有状态的聊天机器人、税收计算器还是其他任何应用！Gradio客户端通常与托管在[Hugging Face Spaces](https://hf.space)上的应用一起使用，但您的应用可以托管在任何地方，比如您自己的服务器。

**先决条件**：要使用Gradio客户端，您不需要深入了解`gradio`库的细节。但是，熟悉Gradio的输入和输出组件的概念会有所帮助。

## 安装

可以使用您选择的软件包管理器从npm注册表安装轻量级的`@gradio/client`包，并支持18及以上的Node版本：

```bash
npm i @gradio/client
```

## 连接到正在运行的Gradio应用

首先，通过实例化`Client`对象并将其连接到在Hugging Face Spaces或任何其他位置运行的Gradio应用来建立连接。

## 连接到Hugging Face Space

```js
import { Client } from "@gradio/client";

const app = Client.connect("abidlabs/en2fr"); // 一个从英语翻译为法语的 Space
```

您还可以通过在options参数的`hf_token`属性中传入您的HF token来连接到私有Spaces。您可以在此处获取您的HF token：https://huggingface.co/settings/tokens

```js
import { Client } from "@gradio/client";

const app = Client.connect("abidlabs/my-private-space", { hf_token="hf_..." })
```

## 为私人使用复制一个Space

虽然您可以将任何公共Space用作API，但是如果您发出的请求过多，Hugging Face可能会对您进行速率限制。为了无限制使用Space，只需复制Space以创建私有Space，然后使用它来进行任意数量的请求！

`@gradio/client`还导出了另一个函数`duplicate`，以使此过程变得简单（您将需要传入您的[Hugging Face token](https://huggingface.co/settings/tokens)）。

`duplicate`与`Client`几乎相同，唯一的区别在于底层实现：

```js
import { Client } from "@gradio/client";

const response = await fetch(
	"https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"
);
const audio_file = await response.blob();

const app = await Client.duplicate("abidlabs/whisper", { hf_token: "hf_..." });
const transcription = app.predict("/predict", [audio_file]);
```

如果您之前复制过一个Space，则重新运行`duplicate`不会创建一个新的Space。而是客户端将连接到先前创建的Space。因此，可以安全地多次使用相同的Space重新运行`duplicate`方法。

**注意：**如果原始Space使用了GPU，您的私有Space也将使用GPU，并且将根据GPU的价格向您的Hugging Face账户计费。为了最大程度地减少费用，在5分钟不活动后，您的Space将自动进入休眠状态。您还可以使用`duplicate`的options对象的`hardware`和`timeout`属性来设置硬件，例如：

```js
import { Client } from "@gradio/client";

const app = await Client.duplicate("abidlabs/whisper", {
	hf_token: "hf_...",
	timeout: 60,
	hardware: "a10g-small"
});
```

## 连接到通用的Gradio应用

如果您的应用程序在其他地方运行，只需提供完整的URL，包括"http://"或"https://"。以下是向运行在共享URL上的Gradio应用进行预测的示例：

```js
import { Client } from "@gradio/client";

const app = Client.connect("https://bec81a83-5b5c-471e.gradio.live");
```

## 检查API端点

一旦连接到Gradio应用程序，可以通过调用`Client`的`view_api`方法来查看可用的API端点。

对于Whisper Space，我们可以这样做：

```js
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/whisper");

const app_info = await app.view_info();

console.log(app_info);
```

然后我们会看到以下内容：

```json
{
	"named_endpoints": {
		"/predict": {
			"parameters": [
				{
					"label": "text",
					"component": "Textbox",
					"type": "string"
				}
			],
			"returns": [
				{
					"label": "output",
					"component": "Textbox",
					"type": "string"
				}
			]
		}
	},
	"unnamed_endpoints": {}
}
```

这告诉我们该Space中有1个API端点，并显示了如何使用API端点进行预测：我们应该调用`.predict()`方法（下面将进行更多探索），并提供类型为`string`的参数`input_audio`，它是指向文件的URL。

我们还应该提供`api_name='/predict'`参数给`predict()`方法。虽然如果一个Gradio应用只有1个命名的端点，这不是必需的，但它可以允许我们在单个应用中调用不同的端点。如果应用有未命名的API端点，可以通过运行`.view_api(all_endpoints=True)`来显示它们。

## 进行预测

进行预测的最简单方法就是使用适当的参数调用`.predict()`方法：

```js
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/en2fr");
const result = await app.predict("/predict", ["Hello"]);
```

如果有多个参数，您应该将它们作为一个数组传递给`.predict()`，像这样：

```js
import { Client } from "@gradio/client";

const app = await Client.connect("gradio/calculator");
const result = await app.predict("/predict", [4, "add", 5]);
```

对于某些输入，例如图像，您应该根据所需要的方便程度传入`Buffer`、`Blob`或`File`。在Node.js中，可以使用`Buffer`或`Blob`；在浏览器环境中，可以使用`Blob`或`File`。

```js
import { Client } from "@gradio/client";

const response = await fetch(
	"https://audio-samples.github.io/samples/mp3/blizzard_unconditional/sample-0.mp3"
);
const audio_file = await response.blob();

const app = await Client.connect("abidlabs/whisper");
const result = await Client.connect.predict("/predict", [audio_file]);
```

## 使用事件

如果您使用的API可以随时间返回结果，或者您希望访问有关作业状态的信息，您可以使用事件接口获取更大的灵活性。这对于迭代的或生成器的端点特别有用，因为它们会生成一系列离散的响应值。

```js
import { Client } from "@gradio/client";

function log_result(payload) {
	const {
		data: [translation]
	} = payload;

	console.log(`翻译结果为：${translation}`);
}

const app = await Client.connect("abidlabs/en2fr");
const job = app.submit("/predict", ["Hello"]);

job.on("data", log_result);
```

## 状态

事件接口还可以通过监听`"status"`事件来获取运行作业的状态。这将返回一个对象，其中包含以下属性：`status`（当前作业的人类可读状态，`"pending" | "generating" | "complete" | "error"`），`code`（作业的详细gradio code），`position`（此作业在队列中的当前位置），`queue_size`（总队列大小），`eta`（作业完成的预计时间），`success`（表示作业是否成功完成的布尔值）和`time`（作业状态生成的时间，是一个`Date`对象）。

```js
import { Client } from "@gradio/client";

function log_status(status) {
	console.log(`此作业的当前状态为：${JSON.stringify(status, null, 2)}`);
}

const app = await Client.connect("abidlabs/en2fr");
const job = app.submit("/predict", ["Hello"]);

job.on("status", log_status);
```

## 取消作业

作业实例还具有`.cancel()`方法，用于取消已排队但尚未启动的作业。例如，如果您运行以下命令：

```js
import { Client } from "@gradio/client";

const app = await Client.connect("abidlabs/en2fr");
const job_one = app.submit("/predict", ["Hello"]);
const job_two = app.submit("/predict", ["Friends"]);

job_one.cancel();
job_two.cancel();
```

如果第一个作业已经开始处理，那么它将不会被取消，但客户端将不再监听更新（丢弃该作业）。如果第二个作业尚未启动，它将被成功取消并从队列中移除。

## 生成器端点

某些Gradio API端点不返回单个值，而是返回一系列值。您可以使用事件接口实时侦听这些值：

```js
import { Client } from "@gradio/client";

const app = await Client.connect("gradio/count_generator");
const job = app.submit(0, [9]);

job.on("data", (data) => console.log(data));
```

这将按生成端点生成的值进行日志记录。

您还可以取消具有迭代输出的作业，在这种情况下，作业将立即完成。

```js
import { Client } from "@gradio/client";

const app = await Client.connect("gradio/count_generator");
const job = app.submit(0, [9]);

job.on("data", (data) => console.log(data));

setTimeout(() => {
	job.cancel();
}, 3000);
```
