from typing import Any, Optional


class AppError(Exception):
    """Base class for all application errors."""

    def __init__(
        self,
        message: str,
        status_code: int = 400,
        detail: Optional[Any] = None,
    ):
        self.message = message
        self.status_code = status_code
        self.detail = detail
        super().__init__(self.message)


class NotFoundError(AppError):
    """Raised when a resource is not found."""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            message=f"{resource} with identifier '{identifier}' not found.",
            status_code=404,
        )


class DuplicateError(AppError):
    """Raised when a resource already exists."""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            message=f"{resource} with identifier '{identifier}' already exists.",
            status_code=409,
        )


class ValidationError(AppError):
    """Raised when input validation fails."""

    def __init__(self, message: str, detail: Optional[Any] = None):
        super().__init__(message=message, status_code=400, detail=detail)


class AuthenticationError(AppError):
    """Raised when authentication fails."""

    def __init__(self, message: str = "Authentication failed."):
        super().__init__(message=message, status_code=401)


class ForbiddenError(AppError):
    """Raised when a user is not allowed to perform an action."""

    def __init__(self, message: str = "Access forbidden."):
        super().__init__(message=message, status_code=403)


class DatabaseError(AppError):
    """Raised when a database error occurs."""

    def __init__(self, message: str = "A database error occurred."):
        super().__init__(message=message, status_code=500)
