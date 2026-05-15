import gradio as gr
import sys

# 设置输出编码为 UTF-8
sys.stdout.reconfigure(encoding='utf-8')

# 测试 Timeline 组件的基本功能
print("=" * 60)
print("Timeline Component Verification Test")
print("=" * 60)

# 1. 测试默认初始化
print("\n1. Test default initialization...")
t1 = gr.Timeline()
print(f"   - value: {t1.value}")
print(f"   - layout: {t1.layout}")
print(f"   - EVENTS: {t1.EVENTS}")
assert t1.value is None
assert t1.layout == "vertical"
print("   [PASS] Default initialization")

# 2. 测试带值初始化
print("\n2. Test initialization with value...")
test_value = [
    {"title": "Event 1", "status": "completed", "timestamp": "10:00"},
    {"title": "Event 2", "status": "in-progress", "timestamp": "11:00"},
    {"title": "Event 3", "status": "pending", "timestamp": "12:00"},
]
t2 = gr.Timeline(value=test_value, layout="horizontal")
print(f"   - value: {t2.value}")
print(f"   - layout: {t2.layout}")
assert t2.value == test_value
assert t2.layout == "horizontal"
print("   [PASS] Initialization with value")

# 3. 测试 preprocess
print("\n3. Test preprocess...")
result = t2.preprocess(test_value)
assert result == test_value
print(f"   - preprocess output: {result}")
print("   [PASS] preprocess")

# 4. 测试 postprocess
print("\n4. Test postprocess...")
result = t2.postprocess(test_value)
assert result == test_value
print(f"   - postprocess output: {result}")
print("   [PASS] postprocess")

# 5. 测试 process_example
print("\n5. Test process_example...")
example_result = t2.process_example(test_value)
print(f"   - process_example output: '{example_result}'")
assert example_result == "3 events"
print("   [PASS] process_example")

# 6. 测试 example_payload
print("\n6. Test example_payload...")
payload = t2.example_payload()
print(f"   - example_payload: {payload}")
assert isinstance(payload, list)
assert len(payload) > 0
assert "title" in payload[0]
assert "status" in payload[0]
print("   [PASS] example_payload")

# 7. 测试 example_value
print("\n7. Test example_value...")
value = t2.example_value()
print(f"   - example_value: {value}")
assert isinstance(value, list)
assert len(value) > 0
assert "title" in value[0]
print("   [PASS] example_value")

# 8. 测试 api_info
print("\n8. Test api_info...")
api_info = t2.api_info()
print(f"   - api_info type: {api_info['type']}")
assert api_info['type'] == 'array'
assert 'items' in api_info
print("   [PASS] api_info")

# 9. 测试 None 值处理
print("\n9. Test None value handling...")
t3 = gr.Timeline()
assert t3.preprocess(None) is None
assert t3.postprocess(None) is None
assert t3.process_example(None) == ""
print("   [PASS] None value handling")

# 10. 测试空列表
print("\n10. Test empty list...")
assert t3.process_example([]) == ""
print("   [PASS] Empty list handling")

print("\n" + "=" * 60)
print("All tests passed!")
print("=" * 60)

# 打印组件配置信息
print("\nComponent config info:")
config = t2.get_config()
print(f"  - component name: {config.get('props', {}).get('name', 'timeline')}")
print(f"  - layout: {config.get('props', {}).get('layout', 'N/A')}")
print(f"  - value length: {len(config.get('props', {}).get('value', []))}")
print(f"  - all keys: {list(config.keys())}")
