class UnknownEventProviderError(Exception):
    """URL is not for a recognized event provider website"""

    def __init__(self, url: str):
        super().__init__(url)


class NavigationError(Exception):
    """Failed to navigate to the URL in question"""

    def __init__(self, url: str):
        super().__init__(url)
