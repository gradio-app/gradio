# 区块和事件监听器 (Blocks and Event Listeners)

我们在[快速入门](https://gradio.app/blocks-and-event-listeners)中简要介绍了区块。让我们深入探讨一下。本指南将涵盖区块的结构、事件监听器及其类型、连续运行事件、更新配置以及使用字典与列表。

## 区块结构 (Blocks Structure)

请查看下面的演示。

$code_hello_blocks
$demo_hello_blocks

- 首先，注意 `with gr.Blocks() as demo:` 子句。区块应用程序代码将被包含在该子句中。
- 接下来是组件。这些组件是在 `Interface` 中使用的相同组件。但是，与将组件传递给某个构造函数不同，组件在 `with` 子句内创建时会自动添加到区块中。
- 最后，`click()` 事件监听器。事件监听器定义了应用程序内的数据流。在上面的示例中，监听器将两个文本框相互关联。文本框 `name` 作为输入，文本框 `output` 作为 `greet` 方法的输出。当单击按钮 `greet_btn` 时触发此数据流。与界面类似，事件监听器可以具有多个输入或输出。

## 事件监听器与交互性 (Event Listeners and Interactivity)

在上面的示例中，您会注意到可以编辑文本框 `name`，但无法编辑文本框 `output`。这是因为作为事件监听器的任何组件都具有交互性。然而，由于文本框 `output` 仅作为输出，它没有交互性。您可以使用 `interactive=` 关键字参数直接配置组件的交互性。

```python
output = gr.Textbox(label="输出", interactive=True)
```

## 事件监听器的类型 (Types of Event Listeners)

请查看下面的演示：

$code_blocks_hello
$demo_blocks_hello

`welcome` 函数不是由点击触发的，而是由在文本框 `inp` 中输入文字触发的。这是由于 `change()` 事件监听器。不同的组件支持不同的事件监听器。例如，`Video` 组件支持一个 `play()` 事件监听器，当用户按下播放按钮时触发。有关每个组件的事件监听器，请参见[文档](http://gradio.app/docs/components)。

## 多个数据流 (Multiple Data Flows)

区块应用程序不像界面那样限制于单个数据流。请查看下面的演示：

$code_reversible_flow
$demo_reversible_flow

请注意，`num1` 可以充当 `num2` 的输入，反之亦然！随着应用程序变得更加复杂，您将能够连接各种组件的多个数据流。

下面是一个 " 多步骤 " 示例，其中一个模型的输出（语音到文本模型）被传递给下一个模型（情感分类器）。

$code_blocks_speech_text_sentiment
$demo_blocks_speech_text_sentiment

## 函数输入列表与字典 (Function Input List vs Dict)

到目前为止，您看到的事件监听器都只有一个输入组件。如果您希望有多个输入组件将数据传递给函数，有两种选项可供函数接受输入组件值：

1. 作为参数列表，或
2. 作为以组件为键的单个值字典

让我们分别看一个例子：
$code_calculator_list_and_dict

`add()` 和 `sub()` 都将 `a` 和 `b` 作为输入。然而，这些监听器之间的语法不同。

1. 对于 `add_btn` 监听器，我们将输入作为列表传递。函数 `add()` 将每个输入作为参数。`a` 的值映射到参数 `num1`，`b` 的值映射到参数 `num2`。
2. 对于 `sub_btn` 监听器，我们将输入作为集合传递（注意花括号！）。函数 `sub()` 接受一个名为 `data` 的单个字典参数，其中键是输入组件，值是这些组件的值。

使用哪种语法是个人偏好！对于具有许多输入组件的函数，选项 2 可能更容易管理。

$demo_calculator_list_and_dict

## 函数返回列表与字典 (Function Return List vs Dict)

类似地，您可以返回多个输出组件的值，可以是：

1. 值列表，或
2. 以组件为键的字典

首先让我们看一个（1）的示例，其中我们通过返回两个值来设置两个输出组件的值：

```python
with gr.Blocks() as demo:
    food_box = gr.Number(value=10, label="Food Count")
    status_box = gr.Textbox()
    def eat(food):
        if food > 0:
            return food - 1, "full"
        else:
            return 0, "hungry"
    gr.Button("EAT").click(
        fn=eat,
        inputs=food_box,
        outputs=[food_box, status_box]
    )
```

上面的每个返回语句分别返回与 `food_box` 和 `status_box` 相对应的两个值。

除了返回与每个输出组件顺序相对应的值列表外，您还可以返回一个字典，其中键对应于输出组件，值作为新值。这还允许您跳过更新某些输出组件。

```python
with gr.Blocks() as demo:
    food_box = gr.Number(value=10, label="Food Count")
    status_box = gr.Textbox()
    def eat(food):
        if food > 0:
            return {food_box: food - 1, status_box: "full"}
        else:
            return {status_box: "hungry"}
    gr.Button("EAT").click(
        fn=eat,
        inputs=food_box,
        outputs=[food_box, status_box]
    )
```

注意，在没有食物的情况下，我们只更新 `status_box` 元素。我们跳过更新 `food_box` 组件。

字典返回在事件监听器影响多个组件的返回值或有条件地影响输出时非常有用。

请记住，对于字典返回，我们仍然需要在事件监听器中指定可能的输出组件。

## 更新组件配置 (Updating Component Configurations)

事件监听器函数的返回值通常是相应输出组件的更新值。有时我们还希望更新组件的配置，例如可见性。在这种情况下，我们返回一个 `gr.update()` 对象，而不仅仅是更新组件的值。

$code_blocks_essay_simple
$demo_blocks_essay_simple

请注意，我们可以通过 `gr.update()` 方法自我配置文本框。`value=` 参数仍然可以用于更新值以及组件配置。

## 连续运行事件 (Running Events Consecutively)

你也可以使用事件监听器的 `then` 方法按顺序运行事件。在前一个事件运行完成后，这将运行下一个事件。这对于多步更新组件的事件非常有用。

例如，在下面的聊天机器人示例中，我们首先立即使用用户消息更新聊天机器人，然后在模拟延迟后使用计算机回复更新聊天机器人。

$code_chatbot_simple
$demo_chatbot_simple

事件监听器的 `.then()` 方法会执行后续事件，无论前一个事件是否引发任何错误。如果只想在前一个事件成功执行后才运行后续事件，请使用 `.success()` 方法，该方法与 `.then()` 接受相同的参数。

## 连续运行事件 (Running Events Continuously)

您可以使用事件监听器的 `every` 参数按固定计划运行事件。这将在客户端连接打开的情况下，每隔一定秒数运行一次事件。如果连接关闭，事件将在下一次迭代后停止运行。
请注意，这不考虑事件本身的运行时间。因此，使用 `every=gr.Timer(5)` 运行时间为 1 秒的函数实际上每 6 秒运行一次。

以下是每秒更新的正弦曲线示例！

$code_sine_curve
$demo_sine_curve

## 收集事件数据 (Gathering Event Data)

您可以通过将相关的事件数据类作为类型提示添加到事件监听器函数的参数中，收集有关事件的特定数据。

例如，使用 `gradio.SelectData` 参数可以为 `.select()` 的事件数据添加类型提示。当用户选择触发组件的一部分时，将触发此事件，并且事件数据包含有关用户的具体选择的信息。如果用户在 `Textbox` 中选择了特定单词，在 `Gallery` 中选择了特定图像或在 `DataFrame` 中选择了特定单元格，则事件数据参数将包含有关具体选择的信息。

在下面的双人井字游戏演示中，用户可以选择 `DataFrame` 中的一个单元格进行移动。事件数据参数包含有关所选单元格的信息。我们可以首先检查单元格是否为空，然后用用户的移动更新单元格。

$code_tictactoe

$demo_tictactoe
