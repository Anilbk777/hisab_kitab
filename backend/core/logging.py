from loguru import logger
import sys


def configure_logging():
    # Remove default logger
    logger.remove()

    # Terminal (Console) Logging Only - Beautiful & Clean
    logger.add(
        sys.stdout,
        level="INFO",  # Change to "INFO" in production if you want less noise
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | {message}",
        colorize=True,
        enqueue=True,  # Thread-safe
        backtrace=True,  # For debugging
        catch=True,  # Catch exceptions
    )

    return logger


# Global logger instance
log = configure_logging()


# Convenience function
def get_logger():
    return log
