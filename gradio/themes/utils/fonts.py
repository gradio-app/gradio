from __future__ import annotations


class Font:
    def __init__(self, name: str):
        self.name = name

    def __str__(self) -> str:
        return (
            self.name
            if self.name in ["sans-serif", "serif", "monospace", "cursive", "fantasy"]
            else f"'{self.name}'"
        )

    def stylesheet(self) -> str:
        return None


class GoogleFont(Font):
    def stylesheet(self) -> str:
        return f'https://fonts.googleapis.com/css2?family={self.name.replace(" ", "+")}:wght@400;600&display=swap'
