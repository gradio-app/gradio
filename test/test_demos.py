import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
# from selenium.webdriver.chrome.service import Service
import multiprocessing
import time
import requests
from matplotlib.testing.compare import compare_images
import random
import os
# from chromedriver_py import binary_path

LOCAL_HOST = "http://localhost:{}"
GOLDEN_PATH = "test/golden/{}/{}.png"
TOLERANCE = 0.1

# s = Service(binary_path)


def wait_for_url(url):
    for i in range(10):
        try:
            requests.get(url)
            print("Interface connected.")
            break
        except:
            time.sleep(0.2)
    else:
        raise ConnectionError("Could not connect to interface.")


def hide_latency(driver):
    js = "document.getElementsByClassName('loading_time')[" \
         "0].style.visibility = " \
         "'hidden';"
    driver.execute_script(js)


def diff_texts_thread(return_dict):
    from demo.diff_texts import io
    io.save_to = return_dict
    io.launch()


def image_mod_thread(return_dict):
    from demo.image_mod import io
    io.examples = None
    io.save_to = return_dict
    io.launch()


def longest_word_thread(return_dict):
    from demo.longest_word import io
    io.save_to = return_dict
    io.launch()


def sentence_builder_thread(return_dict):
    from demo.sentence_builder import io
    io.save_to = return_dict
    io.launch()


class TestDemo(unittest.TestCase):
    def test_diff_texts(self):
        manager = multiprocessing.Manager()
        return_dict = manager.dict()
        self.i_thread = multiprocessing.Process(target=diff_texts_thread,
                                         args=(return_dict,))
        self.i_thread.start()
        while not return_dict:
            time.sleep(0.2)

        URL = LOCAL_HOST.format(return_dict["port"])
        wait_for_url(URL)

        driver = webdriver.Chrome()
        driver.set_window_size(1200, 800)
        driver.get(URL)
        timeout = 10
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".input_interface[interface_id='0'] .input_text"))
        )
        elem.clear()
        elem.send_keys("Want to see a magic trick?")
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".input_interface[interface_id='1'] .input_text"))
        )
        elem.clear()
        elem.send_keys("Let's go see a magic trick!")
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".submit"))
        )
        elem.click()
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".output_interface[interface_id='2'] .output_text"))
        )
        while elem.text == "":
            time.sleep(0.2)

        self.assertEqual(elem.text, "LeWant's tgo see a magic trick?!")
        golden_img = GOLDEN_PATH.format("diff_texts", "magic_trick")
        tmp = "test/tmp/{}.png".format(random.getrandbits(32))
        hide_latency(driver)
        driver.save_screenshot(tmp)
        driver.close()
        self.assertIsNone(compare_images(tmp, golden_img, TOLERANCE))
        os.remove(tmp)

    def test_image_mod(self):
        manager = multiprocessing.Manager()
        return_dict = manager.dict()
        self.i_thread = multiprocessing.Process(target=image_mod_thread,
                                                args=(return_dict,))
        self.i_thread.start()
        while not return_dict:
            time.sleep(0.2)

        URL = LOCAL_HOST.format(return_dict["port"])
        wait_for_url(URL)

        driver = webdriver.Chrome()
        driver.set_window_size(1200, 800)
        driver.get(URL)
        timeout = 10
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".input_interface["
                                            "interface_id='0'] "
                                            ".hidden_upload"))
        )
        hide_latency(driver)
        cwd = os.getcwd()
        rel = "demo/images/cheetah1.jpg"
        elem.send_keys(os.path.join(cwd, rel))
        golden_img = GOLDEN_PATH.format("image_mod", "cheetah1")
        tmp = "test/tmp/{}.png".format(random.getrandbits(32))
        WebDriverWait(driver, timeout).until(
            EC.visibility_of_element_located((By.CSS_SELECTOR,
                                            ".output_interface["
                                            "interface_id='1'] "
                                            ".output_image"))
        )

        hide_latency(driver)
        driver.save_screenshot(tmp)
        self.assertIsNone(compare_images(tmp, golden_img, TOLERANCE))
        os.remove(tmp)
        driver.close()

    def test_longest_word(self):
        manager = multiprocessing.Manager()
        return_dict = manager.dict()
        self.i_thread = multiprocessing.Process(target=longest_word_thread,
                                                args=(return_dict,))
        self.i_thread.start()
        while not return_dict:
            time.sleep(0.2)

        URL = LOCAL_HOST.format(return_dict["port"])
        wait_for_url(URL)

        driver = webdriver.Chrome()
        driver.set_window_size(1200, 800)
        driver.get(URL)
        timeout = 10
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".input_interface[interface_id='0'] .input_text"))
        )
        elem.send_keys("Gradio is the most wonderful machine learning "
                       "library.")
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".submit"))
        )
        elem.click()
        golden_img = GOLDEN_PATH.format("longest_word", "wonderful")
        tmp = "test/tmp/{}.png".format(random.getrandbits(32))
        hide_latency(driver)
        driver.save_screenshot(tmp)
        driver.close()
        self.assertIsNone(compare_images(tmp, golden_img, TOLERANCE))
        os.remove(tmp)

    def test_sentence_builder(self):
        manager = multiprocessing.Manager()
        return_dict = manager.dict()
        self.i_thread = multiprocessing.Process(target=sentence_builder_thread,
                                                args=(return_dict,))
        self.i_thread.start()
        while not return_dict:
            time.sleep(0.2)

        URL = LOCAL_HOST.format(return_dict["port"])
        wait_for_url(URL)

        driver = webdriver.Chrome()
        driver.set_window_size(1200, 800)
        driver.get(URL)
        timeout = 10
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".submit"))
        )
        elem.click()
        elem = WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR,
                                            ".output_interface["
                                            "interface_id='5'] .output_text"))
        )
        self.assertEqual(elem.text, "The 2 cats went to the park where they  until the night")
        golden_img = GOLDEN_PATH.format("sentence_builder", "two_cats")
        tmp = "test/tmp/{}.png".format(random.getrandbits(32))
        hide_latency(driver)
        driver.save_screenshot(tmp)
        self.assertIsNone(compare_images(tmp, golden_img, TOLERANCE))
        os.remove(tmp)
        driver.close()

    def tearDown(self):
        self.i_thread.terminate()
        self.i_thread.join()


if __name__ == '__main__':
    unittest.main()
