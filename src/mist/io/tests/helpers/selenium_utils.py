from selenium import webdriver
from selenium.webdriver.common.desired_capabilities import DesiredCapabilities

import logging

log = logging.getLogger(__name__)


def choose_driver(flavor=None):
    """
    Returns an instance of a remote selenium driver
    """
    import mist.io.tests.settings as settings

    flavor = flavor if flavor is not None else settings.BROWSER_FLAVOR

    log.info("Choosing driver")
    if settings.BROWSER_LOCAL:
        if flavor == "firefox":
            driver = webdriver.Firefox()
        elif flavor == "chrome":
            service_args = ['--verbose']
            driver = webdriver.Chrome(executable_path=settings.WEBDRIVER_PATH,
                                      service_args=service_args,
                                      service_log_path=settings.WEBDRIVER_LOG)

        elif flavor == "phantomjs":
            driver = webdriver.PhantomJS(executable_path=settings.WEBDRIVER_PATH)
        else:
            raise Exception("%s is not supported!" % flavor)
    else:
        driver = webdriver.Remote(command_executor=settings.selenium_hub,
                                  desired_capabilities=DesiredCapabilities.FIREFOX)

    return driver
