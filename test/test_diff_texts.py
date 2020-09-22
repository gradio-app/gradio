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
import gradio

URL = "http://localhost:7860"


def wait_for_url(url):
    for i in range(10):
        try:
            requests.get(url)
            print("Interface connected.")
            break
        except:
            time.sleep(1)
    else:
        raise ConnectionError("Could not connect to interface.")


def diff_texts_thread():
    from demo.diff_texts import io


def image_mod_thread():
    from demo.image_mod import io



class TestDemo(unittest.TestCase):
    def test_diff_texts(self):
        # URL={"io": None}
        self.i_thread = multiprocessing.Process(target=diff_texts_thread)
        self.i_thread.start()

        # print("\n\n\n\n" + str(io.server_port) + "\n\n\n")
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
        # i_thread.terminate()
        self.assertEqual(elem.text, "LeWant's tgo see a magic trick?!")
        golden = "demo/screenshots/diff_texts/1.png"
        tmp = "test/tmp/{}.png".format(random.getrandbits(32))
        driver.save_screenshot(tmp)
        driver.close()
        self.assertIsNone(compare_images(tmp, golden, 0.0001))
        os.remove(tmp)
        # gr.reset_all()


    # def test_image_mod(self):
    #     i_thread = multiprocessing.Process(target=image_mod_thread)
    #     i_thread.start()
    #     # URL
    #     wait_for_url(URL)
    #
    #     driver = webdriver.Chrome()
    #     driver.set_window_size(1200, 800)
    #     driver.get(URL)
    #     timeout = 10
    #     elem = WebDriverWait(driver, timeout).until(
    #         EC.presence_of_element_located((By.CSS_SELECTOR,
    #                                         ".input_interface["
    #                                         "interface_id='0'] .input_image"))
    #     )
    #     self.assertIsNotNone(elem)
    #     driver.close()
    def tearDown(self):
        self.i_thread.terminate()
        self.i_thread.join()
        print(gradio.networking.get_first_available_port(7860, 7870))
        while gradio.networking.get_first_available_port(7860, 7870) != 7680:
            time.sleep(1)
        print("7860 is available")




if __name__ == '__main__':
    unittest.main()
