import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import multiprocessing
import time
import requests
from matplotlib.testing.compare import compare_images
import random
import os

current_dir = os.getcwd()
os.environ["GRADIO_TEST_MODE"] = "1"

LOCAL_HOST = "http://localhost:{}"
GOLDEN_PATH = "test/golden/{}/{}.png"
TOLERANCE = 0.1
TIMEOUT = 10

GAP_TO_SCREENSHOT = 1

def wait_for_url(url):
    for i in range(TIMEOUT):
        try:
            requests.get(url)
            print("Interface connected.")
            break
        except:
            time.sleep(0.2)
    else:
        raise ConnectionError("Could not connect to interface.")


def diff_texts_thread(return_dict):
    from demo.diff_texts import iface
    iface.save_to = return_dict
    iface.launch()


def image_mod_thread(return_dict):
    from demo.image_mod import iface
    iface.examples = None
    iface.save_to = return_dict
    iface.launch()


def longest_word_thread(return_dict):
    from demo.longest_word import iface
    iface.save_to = return_dict
    iface.launch()


def sentence_builder_thread(return_dict):
    from demo.sentence_builder import iface
    iface.save_to = return_dict
    iface.launch()


class TestDemo(unittest.TestCase):
    def start_test(self, target):
        manager = multiprocessing.Manager()
        return_dict = manager.dict()
        self.i_thread = multiprocessing.Process(target=target,
                                                args=(return_dict,))
        self.i_thread.start()
        total_sleep = 0
        while not return_dict and total_sleep < TIMEOUT:
            time.sleep(0.2)
            total_sleep += 0.2
        URL = LOCAL_HOST.format(return_dict["port"])
        wait_for_url(URL)

        driver = webdriver.Chrome()
        driver.set_window_size(1200, 800)
        driver.get(URL)
        return driver

    def test_diff_texts(self):
        driver = self.start_test(target=diff_texts_thread)
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".panel:nth-child(1) .component:nth-child(1) .input_text textarea"))
        )
        elem.clear()
        elem.send_keys("Want to see a magic trick?")
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".panel:nth-child(1) .component:nth-child(2) .input_text textarea"))
        )
        elem.clear()
        elem.send_keys("Let's go see a magic trick!")
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".submit"))
        )
        elem.click()
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".panel:nth-child(2) .component:nth-child(1) .output_text"))
        )

        total_sleep = 0
        while elem.text == "" and total_sleep < TIMEOUT:
            time.sleep(0.2)
            total_sleep += 0.2

        self.assertEqual(elem.text, "LeWant's tgo see a magic trick?!")
        golden_img = os.path.join(current_dir, GOLDEN_PATH.format(
            "diff_texts", "magic_trick"))
        tmp = os.path.join(current_dir, "test/tmp/{}.png".format(
            random.getrandbits(32)))
        time.sleep(GAP_TO_SCREENSHOT)
        driver.save_screenshot(tmp)
        driver.close()
        self.assertIsNone(compare_images(tmp, golden_img, TOLERANCE))
        os.remove(tmp)

    def test_image_mod(self):
        driver = self.start_test(target=image_mod_thread)
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, ".panel:nth-child(1) .component:nth-child(1) .hidden_upload"))
        )
        cwd = os.getcwd()
        rel = "demo/images/cheetah1.jpg"
        elem.send_keys(os.path.join(cwd, rel))
        golden_img = os.path.join(current_dir, GOLDEN_PATH.format(
            "image_mod", "cheetah1"))
        tmp = os.path.join(current_dir, "test/tmp/{}.png".format(
            random.getrandbits(32)))
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".submit"))
        )
        elem.click()
        WebDriverWait(driver, TIMEOUT).until(
            EC.visibility_of_element_located(
                (By.CSS_SELECTOR, ".panel:nth-child(2) .component:nth-child(1) .output_image"))
        )

        time.sleep(GAP_TO_SCREENSHOT)
        driver.save_screenshot(tmp)
        self.assertIsNone(compare_images(tmp, golden_img, TOLERANCE))
        os.remove(tmp)
        driver.close()

    def test_longest_word(self):
        driver = self.start_test(target=longest_word_thread)
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".panel:nth-child(1) .component:nth-child(1) .input_text textarea"))
        )
        elem.send_keys("This is the most wonderful machine learning "
                       "library.")
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".submit"))
        )
        elem.click()
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".panel:nth-child(2) .component:nth-child(1) .output_class"))
        )

        total_sleep = 0
        while elem.text == "" and total_sleep < TIMEOUT:
            time.sleep(0.2)
            total_sleep += 0.2

        golden_img = os.path.join(current_dir, GOLDEN_PATH.format(
            "longest_word", "wonderful"))
        tmp = os.path.join(current_dir, "test/tmp/{}.png".format(
            random.getrandbits(32)))
        time.sleep(GAP_TO_SCREENSHOT)
        driver.save_screenshot(tmp)
        driver.close()
        self.assertIsNone(compare_images(tmp, golden_img, TOLERANCE))
        os.remove(tmp)

    def test_sentence_builder(self):
        driver = self.start_test(target=sentence_builder_thread)
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".submit"))
        )
        elem.click()
        elem = WebDriverWait(driver, TIMEOUT).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, ".panel:nth-child(2) .component:nth-child(1) .output_text"))
        )

        total_sleep = 0
        while elem.text == "" and total_sleep < TIMEOUT:
            time.sleep(0.2)
            total_sleep += 0.2

        self.assertEqual(
            elem.text, "The 2 cats went to the park where they  until the night")
        golden_img = os.path.join(current_dir, GOLDEN_PATH.format(
            "sentence_builder", "two_cats"))
        tmp = os.path.join(current_dir, "test/tmp/{}.png".format(
            random.getrandbits(32)))
        time.sleep(GAP_TO_SCREENSHOT)
        driver.save_screenshot(tmp)
        self.assertIsNone(compare_images(tmp, golden_img, TOLERANCE))
        os.remove(tmp)
        driver.close()

    def tearDown(self):
        self.i_thread.terminate()
        self.i_thread.join()


if __name__ == '__main__':
    unittest.main()
