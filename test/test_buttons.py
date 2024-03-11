import sys


class TestClearButton:
    def test_version(self):
        print("version>>>>>>>", sys.version)

        def test(d: dict[str, str]):
            return d

        assert test({"a": "b"}) == {"a": "c"}
