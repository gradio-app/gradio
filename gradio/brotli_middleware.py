"""AGSI Brotli middleware build on top of starlette.

Code is based on GZipMiddleware shipped with starlette.
"""

import io
import re
from typing import NoReturn

from brotli import MODE_FONT, MODE_GENERIC, MODE_TEXT, Compressor  # type: ignore
from starlette.datastructures import Headers, MutableHeaders
from starlette.middleware.gzip import GZipResponder
from starlette.types import ASGIApp, Message, Receive, Scope, Send


class Mode:
    """Brotli available modes."""

    generic = MODE_GENERIC
    text = MODE_TEXT
    font = MODE_FONT


class BrotliMiddleware:
    """Brotli middleware public interface."""

    def __init__(
        self,
        app: ASGIApp,
        quality: int = 4,
        mode: str = "text",
        lgwin: int = 22,
        lgblock: int = 0,
        minimum_size: int = 400,
        gzip_fallback: bool = True,
        excluded_handlers: list[str] | None = None,
    ) -> None:
        """
        Arguments.

        mode: The compression mode can be:
            generic, text (*default*. Used for UTF-8 format text input)
            or font (for WOFF 2.0).
        quality: Controls the compression-speed vs compression-
            density tradeoff. The higher the quality, the slower the compression.
            Range is 0 to 11.
        lgwin: Base 2 logarithm of the sliding window size. Range
            is 10 to 24.
        lgblock: Base 2 logarithm of the maximum input block size.
            Range is 16 to 24. If set to 0, the value will be set based on the
            quality.
        minimum_size: Only compress responses that are bigger than this value in bytes.
        gzip_fallback: If True, uses gzip encoding if br is not in the Accept-Encoding header.
        excluded_handlers: List of handlers to be excluded from being compressed.
        """
        self.app = app
        self.quality = quality
        self.mode = getattr(Mode, mode)
        self.minimum_size = minimum_size
        self.lgwin = lgwin
        self.lgblock = lgblock
        self.gzip_fallback = gzip_fallback
        if excluded_handlers:
            self.excluded_handlers = [re.compile(path) for path in excluded_handlers]
        else:
            self.excluded_handlers = []

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if (
            self._is_handler_excluded(scope)
            or scope["type"] != "http"
            or not self._is_compressible_file_type(scope)
        ):
            return await self.app(scope, receive, send)
        headers = Headers(scope=scope)
        if "br" in headers.get("Accept-Encoding", ""):
            br_responder = BrotliResponder(
                self.app,
                self.quality,
                self.mode,
                self.lgwin,
                self.lgblock,
                self.minimum_size,
            )
            await br_responder(scope, receive, send)
            return
        if self.gzip_fallback and "gzip" in headers.get("Accept-Encoding", ""):
            gzip_responder = GZipResponder(self.app, self.minimum_size)
            await gzip_responder(scope, receive, send)
            return
        await self.app(scope, receive, send)

    def _is_handler_excluded(self, scope: Scope) -> bool:
        handler = scope.get("path", "")

        return any(pattern.search(handler) for pattern in self.excluded_handlers)

    # explicitly handle html, js, css, json via a whitelist. woff2 files are already compressed.
    # we don't want to compress binary files as they do not benefit much and it can cause bugs
    def _is_compressible_file_type(self, scope: Scope) -> bool:
        """Check if the requested file has a compressible file extension."""
        path = scope.get("path", "")
        compressible_extensions = {
            ".html",
            ".htm",
            ".js",
            ".css",
            ".json",
            ".md",
            ".txt",
            ".csv",
            ".tsv",
            ".xml",
            ".svg",
        }
        if "." in path:
            extension = "." + path.split(".")[-1].lower()
            return extension in compressible_extensions

        return False


class BrotliResponder:
    """Brotli Interface."""

    def __init__(
        self,
        app: ASGIApp,
        quality: int,
        mode: Mode,
        lgwin: int,
        lgblock: int,
        minimum_size: int,
    ) -> None:  # noqa
        self.app = app
        self.quality = quality
        self.mode = mode
        self.lgwin = lgwin
        self.lgblock = lgblock
        self.minimum_size = minimum_size
        self.send: Send = unattached_send
        self.initial_message: Message = {}
        self.started = False
        self.content_encoding_set = False
        self.br_file = Compressor(
            quality=self.quality, mode=self.mode, lgwin=self.lgwin, lgblock=self.lgblock
        )
        self.br_buffer = io.BytesIO()

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:  # noqa
        self.send = send
        await self.app(scope, receive, self.send_with_brotli)

    async def send_with_brotli(self, message: Message) -> None:
        """Apply compression using brotli."""
        message_type = message["type"]
        if message_type == "http.response.start":
            # Don't send the initial message until we've determined how to
            # modify the outgoing headers correctly.
            self.initial_message = message
            headers = Headers(raw=self.initial_message["headers"])
            self.content_encoding_set = "content-encoding" in headers
        elif message_type == "http.response.body" and self.content_encoding_set:
            if not self.started:
                self.started = True
                await self.send(self.initial_message)
            await self.send(message)
        elif message_type == "http.response.body" and not self.started:
            self.started = True
            body = message.get("body", b"")
            more_body = message.get("more_body", False)
            if len(body) < self.minimum_size and not more_body:
                # Don't apply Brotli to small outgoing responses.
                await self.send(self.initial_message)
                await self.send(message)
            elif not more_body:
                # Standard Brotli response.
                body = self._process(body) + self.br_file.finish()
                headers = MutableHeaders(raw=self.initial_message["headers"])
                headers["Content-Encoding"] = "br"
                headers["Content-Length"] = str(len(body))
                headers.add_vary_header("Accept-Encoding")
                message["body"] = body
                await self.send(self.initial_message)
                await self.send(message)
            else:
                # Initial body in streaming Brotli response.
                headers = MutableHeaders(raw=self.initial_message["headers"])
                headers["Content-Encoding"] = "br"
                headers.add_vary_header("Accept-Encoding")
                del headers["Content-Length"]
                self.br_buffer.write(self._process(body) + self.br_file.flush())

                message["body"] = self.br_buffer.getvalue()
                self.br_buffer.seek(0)
                self.br_buffer.truncate()
                await self.send(self.initial_message)
                await self.send(message)

        elif message_type == "http.response.body":
            # Remaining body in streaming Brotli response.
            body = message.get("body", b"")
            more_body = message.get("more_body", False)
            self.br_buffer.write(self._process(body) + self.br_file.flush())
            if not more_body:
                self.br_buffer.write(self.br_file.finish())
                message["body"] = self.br_buffer.getvalue()
                self.br_buffer.close()
                await self.send(message)
                return
            message["body"] = self.br_buffer.getvalue()
            self.br_buffer.seek(0)
            self.br_buffer.truncate()
            await self.send(message)

    def _process(self, body):
        """Workaround to support both brotli and brotlipy

        Before the official Google brotli repository offered a Python version,
        there was a separate package to connect to brotli. These APIs are nearly
        identical except that the official Google API has Compressor.process
        while the brotlipy API has Compress.compress
        """
        if hasattr(self.br_file, "process"):
            return self.br_file.process(body)

        return self.br_file.compress(body)


async def unattached_send(_: Message) -> NoReturn:
    raise RuntimeError("send awaitable not set")  # pragma: no cover
