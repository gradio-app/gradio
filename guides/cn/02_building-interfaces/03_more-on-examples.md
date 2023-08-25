# 更多示例 (More on Examples)

本指南介绍了有关示例的更多内容：从目录中加载示例，提供部分示例和缓存。如果你对示例还不熟悉，请查看 [关键特性](../key-features/#example-inputs) 指南中的介绍。

## 提供示例 (Providing Examples)

正如 [关键特性](../key-features/#example-inputs) 指南中所介绍的，向接口添加示例就像提供一个列表的列表给 `examples` 关键字参数一样简单。
每个子列表都是一个数据样本，其中每个元素对应于预测函数的一个输入。
输入必须按照与预测函数期望的顺序排序。

如果你的接口只有一个输入组件，那么可以将示例提供为常规列表，而不是列表的列表。

### 从目录加载示例 (Loading Examples from a Directory)

你还可以指定一个包含示例的目录路径。如果你的接口只接受单个文件类型的输入（例如图像分类器），你只需将目录文件路径传递给 `examples=` 参数，`Interface` 将加载目录中的图像作为示例。
对于多个输入，该目录必须包含一个带有示例值的 log.csv 文件。
在计算器演示的上下文中，我们可以设置 `examples='/demo/calculator/examples'` ，在该目录中包含以下 `log.csv` 文件：
contain a log.csv file with the example values.
In the context of the calculator demo, we can set `examples='/demo/calculator/examples'` and in that directory we include the following `log.csv` file:

```csv
num,operation,num2
5,"add",3
4,"divide",2
5,"multiply",3
```

当浏览标记数据时，这将非常有用。只需指向标记目录，`Interface` 将从标记数据加载示例。

### 提供部分示例

有时你的应用程序有许多输入组件，但你只想为其中的一部分提供示例。为了在示例中排除某些输入，对于那些特定输入对应的所有数据样本都传递 `None`。

## 示例缓存 (Caching examples)

你可能希望为用户提供一些模型的缓存示例，以便他们可以快速尝试，以防您的模型运行时间较长。
如果 `cache_examples=True` ，当你调用 `launch()` 方法时，`Interface` 将运行所有示例，并保存输出。这些数据将保存在一个名为 `gradio_cached_examples` 的目录中。

每当用户点击示例时，输出将自动填充到应用程序中，使用来自该缓存目录的数据，而不是实际运行函数。这对于用户可以快速尝试您的模型而不增加任何负载是非常有用的！

请记住一旦生成了缓存，它将不会在以后的启动中更新。如果示例或函数逻辑发生更改，请删除缓存文件夹以清除缓存并使用另一个 `launch()` 重新构建它。
