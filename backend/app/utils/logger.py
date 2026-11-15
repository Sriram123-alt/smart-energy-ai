"""
Smart Energy AI - Enterprise Structured Logging Service
"""
import sys
import logging

class ColoredFormatter(logging.Formatter):
    """Custom ANSI formatter providing startup-grade colored log streams."""
    
    GREY = "\x1b[38;20m"
    CYAN = "\x1b[36;20m"
    GREEN = "\x1b[32;20m"
    YELLOW = "\x1b[33;20m"
    RED = "\x1b[31;20m"
    BOLD_RED = "\x1b[31;1m"
    RESET = "\x1b[0m"
    FORMAT = "%(asctime)s | %(levelname)-8s | [%(name)s] %(message)s"

    FORMATS = {
        logging.DEBUG: CYAN + FORMAT + RESET,
        logging.INFO: GREEN + FORMAT + RESET,
        logging.WARNING: YELLOW + FORMAT + RESET,
        logging.ERROR: RED + FORMAT + RESET,
        logging.CRITICAL: BOLD_RED + FORMAT + RESET,
    }

    def format(self, record):
        log_fmt = self.FORMATS.get(record.levelno, self.FORMAT)
        formatter = logging.Formatter(log_fmt, datefmt="%Y-%m-%d %H:%M:%S")
        return formatter.format(record)


def setup_logger(name: str = "SmartEnergyAI", level: int = logging.INFO) -> logging.Logger:
    """Configures and returns a structured singleton logger instance."""
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(level)
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(level)
        handler.setFormatter(ColoredFormatter())
        logger.addHandler(handler)
        logger.propagate = False
    return logger

# Default application logger
app_logger = setup_logger("SmartEnergyAI")
