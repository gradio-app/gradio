import asyncio
import ipaddress
from pathlib import Path
import socket
from functools import lru_cache, wraps
from typing import Any, Awaitable, Callable, Coroutine, Literal, T, Tuple

import httpx

def get_version():
    version_file = Path(__file__).parent / 'version.txt'
    with open(version_file, 'r') as f:
        return f.read().strip()

__version__ = get_version() 

def is_public_ip(ip: str) -> bool:
    try:
        ip_obj = ipaddress.ip_address(ip)
        return not (
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_link_local
            or ip_obj.is_multicast
            or ip_obj.is_reserved
        )
    except ValueError:
        return False


def lru_cache_async(maxsize: int = 256):
    def decorator(
        async_func: Callable[..., Coroutine[Any, Any, T]],
    ) -> Callable[..., Awaitable[T]]:
        @lru_cache(maxsize=maxsize)
        @wraps(async_func)
        def wrapper(*args: Any, **kwargs: Any) -> Awaitable[T]:
            return asyncio.create_task(async_func(*args, **kwargs))

        return wrapper

    return decorator


@lru_cache_async()
async def async_resolve_hostname_google(hostname: str) -> list[str]:
    async with httpx.AsyncClient() as client:
        try:
            response_v4 = await client.get(
                f"https://dns.google/resolve?name={hostname}&type=A"
            )
            response_v6 = await client.get(
                f"https://dns.google/resolve?name={hostname}&type=AAAA"
            )

            ips = []
            for response in [response_v4.json(), response_v6.json()]:
                ips.extend([answer["data"] for answer in response.get("Answer", [])])
            return ips
        except Exception:
            return []


async def async_validate_url(hostname: str) -> str:
    try:
        loop = asyncio.get_event_loop()
        addrinfo = await loop.getaddrinfo(hostname, None)
    except socket.gaierror as e:
        raise ValueError(f"Unable to resolve hostname {hostname}: {e}") from e

    for family, _, _, _, sockaddr in addrinfo:
        ip_address = sockaddr[0]
        if family in (socket.AF_INET, socket.AF_INET6) and is_public_ip(ip_address):
            return ip_address

    for ip_address in await async_resolve_hostname_google(hostname):
        if is_public_ip(ip_address):
            return ip_address

    raise ValueError(f"Hostname {hostname} failed validation")


class AsyncSecureTransport(httpx.AsyncHTTPTransport):
    def __init__(self, verified_ip: str):
        self.verified_ip = verified_ip
        super().__init__()

    async def handle_async_request(
        self,
        request: httpx.Request
    ) -> Tuple[int, bytes, bytes, httpx.Headers]:
        original_url = request.url
        original_host = original_url.host
        new_url = original_url.copy_with(host=self.verified_ip)
        request.url = new_url
        request.headers['Host'] = original_host
        request.extensions = {"sni_hostname": original_host}
        return await super().handle_async_request(request)

async def get(
    url: str,
    domain_whitelist: list[str] | None = None,
    _transport: httpx.AsyncBaseTransport | Literal[False] | None = None,
    **kwargs,
) -> httpx.Response:
    """
    This is the main function that should be used to make async HTTP GET requests.
    It will automatically use a secure transport for non-whitelisted domains.

    Parameters:
    - url (str): The URL to make a GET request to.
    - domain_whitelist (list[str] | None): A list of domains to whitelist, which will not use a secure transport.
    - _transport (httpx.AsyncBaseTransport | Literal[False] | None): A custom transport to use for the request. Takes precedence over domain_whitelist. Set to False to use no transport.
    - **kwargs: Additional keyword arguments to pass to the httpx.AsyncClient.get() function.
    """
    parsed_url = httpx.URL(url)
    hostname = parsed_url.host
    if not hostname:
        raise ValueError(f"URL {url} does not have a valid hostname")
    if domain_whitelist is None:
        domain_whitelist = []

    if _transport:
        transport = _transport
    elif _transport is False or hostname in domain_whitelist:
        transport = None
    else:
        verified_ip = await async_validate_url(hostname)
        transport = AsyncSecureTransport(verified_ip)

    async with httpx.AsyncClient(transport=transport) as client:
        return await client.get(url, follow_redirects=False, **kwargs)
