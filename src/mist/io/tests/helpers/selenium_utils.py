from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

try:
    from mist.io.tests.settings import selenium_hub, WEBDRIVER_PATH, \
        BROWSER_LOCAL, BROWSER_FLAVOR, WEBDRIVER_LOG
except ImportError:
    pass


def choose_driver(flavor=BROWSER_FLAVOR):
    """
    Returns an instance of a remote selenium driver
    """
    if BROWSER_LOCAL:
        if flavor == "firefox":
            driver = webdriver.Firefox()
        elif flavor == "chrome":
            service_args = ['--verbose']
            driver = webdriver.Chrome(executable_path=WEBDRIVER_PATH,
                                      service_args=service_args,
                                      service_log_path=WEBDRIVER_LOG)

        elif flavor == "phantomjs":
            driver = webdriver.PhantomJS(executable_path=WEBDRIVER_PATH)
        else:
            raise Exception("%s is not supported!" % flavor)
    else:
        driver = webdriver.Remote(command_executor=selenium_hub,
                                  desired_capabilities=DesiredCapabilities.FIREFOX)

    return driver
