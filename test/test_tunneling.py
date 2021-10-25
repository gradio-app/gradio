import io
import sys
import unittest
import unittest.mock as mock
from gradio import tunneling


# class TestTunneling(unittest.TestCase):
    # pass
    # @mock.patch("pkg_resources.require")
    # def test_should_fail_with_distribution_not_found(self, mock_require):

class TestVerbose(unittest.TestCase):   
    """Unncessary tests but just including them for the sake of completion.""" 
    
    def setUp(self):
        self.message = "print test"
        self.capturedOutput = io.StringIO()                  # Create StringIO object
        sys.stdout = self.capturedOutput                     #  and redirect stdout.

    def test_verbose_debug_true(self):
        tunneling.verbose(self.message, debug_mode=True)
        self.assertEqual(self.capturedOutput.getvalue().strip(), self.message)

    def test_verbose_debug_false(self):
        tunneling.verbose(self.message, debug_mode=False)
        self.assertEqual(self.capturedOutput.getvalue().strip(), '')

    def tearDown(self):
        sys.stdout = sys.__stdout__

if __name__ == '__main__':
    unittest.main()
