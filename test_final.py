import gradio as gr
# 模拟带空格的数据
data = [(" Hello", "A"), ("   ", "B")]

print("正在测试默认行为...")

# 这次我们不传 show_whitespaces 参数，因为它默认应该是 True
comp = gr.HighlightedText(value=data, label="默认应该保留空格")

# 检查默认值是否为 True
if comp.show_whitespaces == True:
    print("✅ 成功！默认值已改为 True，空格将被保留。")
else:
    print("❌ 失败！默认值仍为 False。")