import socket
import sys
from requests.adapters import HTTPAdapter
from requests.compat import urlparse, unquote
import requests

try:
    from requests.packages import urllib3
except ImportError:
    import urllib3

DEFAULT_SCHEME = 'http+unix://'

# The following was adapted from requests_unixsocket
# https://github.com/msabramo/requests-unixsocket

class Session(requests.Session):
    def __init__(self, url_scheme=DEFAULT_SCHEME, *args, **kwargs):
        super(Session, self).__init__(*args, **kwargs)
        self.mount(url_scheme, UnixAdapter())

class monkeypatch(object):
    def __init__(self, url_scheme=DEFAULT_SCHEME):
        self.session = Session()
        requests = self._get_global_requests_module()

        # Methods to replace
        self.methods = ('request', 'get', 'head', 'post',
                        'patch', 'put', 'delete', 'options')
        # Store the original methods
        self.orig_methods = dict(
            (m, requests.__dict__[m]) for m in self.methods)
        # Monkey patch
        g = globals()
        for m in self.methods:
            requests.__dict__[m] = g[m]

    def _get_global_requests_module(self):
        return sys.modules['requests']

    def __enter__(self):
        return self

    def __exit__(self, *args):
        requests = self._get_global_requests_module()
        for m in self.methods:
            requests.__dict__[m] = self.orig_methods[m]


# These are the same methods defined for the global requests object
def request(method, url, **kwargs):
    session = Session()
    return session.request(method=method, url=url, **kwargs)


def get(url, **kwargs):
    kwargs.setdefault('allow_redirects', True)
    return request('get', url, **kwargs)


def head(url, **kwargs):
    kwargs.setdefault('allow_redirects', False)
    return request('head', url, **kwargs)


def post(url, data=None, json=None, **kwargs):
    return request('post', url, data=data, json=json, **kwargs)


def patch(url, data=None, **kwargs):
    return request('patch', url, data=data, **kwargs)


def put(url, data=None, **kwargs):
    return request('put', url, data=data, **kwargs)


def delete(url, **kwargs):
    return request('delete', url, **kwargs)


def options(url, **kwargs):
    kwargs.setdefault('allow_redirects', True)
    return request('options', url, **kwargs)


class UnixHTTPConnection(urllib3.connection.HTTPConnection, object):

    def __init__(self, unix_socket_url, timeout=60):
        """Create an HTTP connection to a unix domain socket

        :param unix_socket_url: A URL with a scheme of 'http+unix' and the
        netloc is a percent-encoded path to a unix domain socket. E.g.:
        'http+unix://%2Ftmp%2Fprofilesvc.sock/status/pid'
        """
        super(UnixHTTPConnection, self).__init__('localhost', timeout=timeout)
        self.unix_socket_url = unix_socket_url
        self.timeout = timeout
        self.sock = None

    def __del__(self):  # base class does not have d'tor
        if self.sock:
            self.sock.close()

    def connect(self):
        sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        sock.settimeout(self.timeout)
        socket_path = unquote(urlparse(self.unix_socket_url).netloc)
        sock.connect(socket_path)
        self.sock = sock


class UnixHTTPConnectionPool(urllib3.connectionpool.HTTPConnectionPool):

    def __init__(self, socket_path, timeout=60):
        super(UnixHTTPConnectionPool, self).__init__(
            'localhost', timeout=timeout)
        self.socket_path = socket_path
        self.timeout = timeout

    def _new_conn(self):
        return UnixHTTPConnection(self.socket_path, self.timeout)


class UnixAdapter(HTTPAdapter):

    def __init__(self, timeout=60, pool_connections=25, *args, **kwargs):
        super(UnixAdapter, self).__init__(*args, **kwargs)
        self.timeout = timeout
        self.pools = urllib3._collections.RecentlyUsedContainer(
            pool_connections, dispose_func=lambda p: p.close()
        )

    def get_connection(self, url, proxies=None):
        proxies = proxies or {}
        proxy = proxies.get(urlparse(url.lower()).scheme)

        if proxy:
            raise ValueError('%s does not support specifying proxies'
                             % self.__class__.__name__)

        with self.pools.lock:
            pool = self.pools.get(url)
            if pool:
                return pool

            pool = UnixHTTPConnectionPool(url, self.timeout)
            self.pools[url] = pool

        return pool

    def request_url(self, request, proxies):
        return request.path_url

    def close(self):
        self.pools.clear()
