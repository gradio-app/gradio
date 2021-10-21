from gradio import networking
import unittest
import unittest.mock as mock


class TestUtils(unittest.TestCase):
    @mock.patch("pkg_resources.require")
    def test_should_fail_with_distribution_not_found(self, mock_require):

if __name__ == '__main__':
    unittest.main()
