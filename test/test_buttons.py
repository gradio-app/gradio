import sys

class TestClearButton:
    def test_version(self):
        print("version>>>>>>>", sys.version)
        def test(d: dict[str, str]):
            return d
        test({"a": "b"})
        1/0
