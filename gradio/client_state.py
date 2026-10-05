"""Keeps `gr.State` values in the browser, with the server's memory as a cache.

After an event changes a `gr.State`, the server serializes the value, seals it
into an encrypted, authenticated token and sends the token to the browser along
with a short reference to it. The browser stores both and sends the reference
(or, for small values, the token itself) with every event that reads or writes
that `gr.State`. The server looks the reference up in its cache and, if it is
not there (another replica served the last event, the server restarted, or the
entry was evicted), answers 409 so that the browser retries with the token.

Tokens are sealed with a key derived from `GRADIO_SECRET_KEY`, so every replica
of an app must share it. Without it each process makes a random key, which is
fine for a single process but means tokens do not survive a restart.

Clients that do not send any state (older JS clients, the Python client, the
`/call` API, MCP) keep the previous behavior, where values live in the
server's memory for the session.
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import os
import secrets
import struct
import threading
import time
import warnings
import zlib
from collections import OrderedDict
from collections.abc import Iterator, MutableMapping
from copy import copy
from typing import TYPE_CHECKING, Any

from gradio import state_serialization
from gradio.state_serialization import StateSerializationError

if TYPE_CHECKING:
    from gradio.blocks import BlockFunction, Blocks
    from gradio.components import State
    from gradio.state_holder import SessionState

TOKEN_PREFIX = "v1."
_FLAG_COMPRESSED = 1
_COMPRESS_ABOVE = 1024
_HEADER = struct.Struct(">Bd")  # flags, issued_at


class MissingStateError(Exception):
    """The client referred to state values this server does not have cached."""

    def __init__(self, ids: list[int]):
        super().__init__(f"Missing state for components {ids}")
        self.ids = ids


class InvalidStateTokenError(Exception):
    pass


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64decode(data: str) -> bytes:
    return base64.urlsafe_b64decode(data + "=" * (-len(data) % 4))


class StateSealer:
    """Seals serialized values into tokens, and computes their references."""

    def __init__(self, secret: bytes):
        from cryptography.hazmat.primitives.ciphers.aead import AESGCM

        self._aead = AESGCM(
            hmac.new(secret, b"gradio-state-encryption", hashlib.sha256).digest()
        )
        self._ref_key = hmac.new(
            secret, b"gradio-state-reference", hashlib.sha256
        ).digest()

    def ref(self, scope: bytes, serialized: bytes) -> str:
        # Keyed, so that a reference reveals nothing about the value (a plain
        # hash would let a user confirm a guess at a hidden value).
        mac = hmac.new(self._ref_key, scope + b"\0" + serialized, hashlib.sha256)
        return _b64encode(mac.digest()[:16])

    def seal(self, scope: bytes, serialized: bytes, issued_at: float) -> str:
        flags = 0
        payload = serialized
        if len(serialized) > _COMPRESS_ABOVE:
            compressed = zlib.compress(serialized, 6)
            if len(compressed) < len(serialized):
                flags |= _FLAG_COMPRESSED
                payload = compressed
        nonce = secrets.token_bytes(12)
        ciphertext = self._aead.encrypt(
            nonce, _HEADER.pack(flags, issued_at) + payload, scope
        )
        return TOKEN_PREFIX + _b64encode(nonce + ciphertext)

    def open(self, scope: bytes, token: str) -> tuple[bytes, float]:
        from cryptography.exceptions import InvalidTag

        if not token.startswith(TOKEN_PREFIX):
            raise InvalidStateTokenError("Unknown token version")
        try:
            raw = _b64decode(token[len(TOKEN_PREFIX) :])
            plaintext = self._aead.decrypt(raw[:12], raw[12:], scope)
        except (InvalidTag, ValueError) as err:
            raise InvalidStateTokenError("Token could not be verified") from err
        flags, issued_at = _HEADER.unpack_from(plaintext)
        payload = plaintext[_HEADER.size :]
        if flags & _FLAG_COMPRESSED:
            payload = zlib.decompress(payload)
        return payload, issued_at


_process_secret = secrets.token_bytes(32)
_sealers: dict[str | None, StateSealer] = {}
_sealer_lock = threading.Lock()


def get_sealer() -> StateSealer:
    configured = os.environ.get("GRADIO_SECRET_KEY") or None
    with _sealer_lock:
        sealer = _sealers.get(configured)
        if sealer is None:
            secret = configured.encode("utf-8") if configured else _process_secret
            sealer = _sealers[configured] = StateSealer(secret)
        return sealer


class StateCache:
    """A least-recently-used map from references to serialized values, bounded
    by the total size of the values it holds. Evicting an entry only means the
    next event that needs it costs the browser one more request."""

    def __init__(self, max_bytes: int | None = None):
        if max_bytes is None:
            max_bytes = int(
                float(os.environ.get("GRADIO_STATE_CACHE_SIZE_MB", "256")) * 1024**2
            )
        self.max_bytes = max_bytes
        self.size = 0
        self._entries: OrderedDict[str, tuple[bytes, float]] = OrderedDict()
        self._lock = threading.Lock()

    def get(self, ref: str) -> tuple[bytes, float] | None:
        with self._lock:
            entry = self._entries.get(ref)
            if entry is not None:
                self._entries.move_to_end(ref)
            return entry

    def put(self, ref: str, serialized: bytes, issued_at: float) -> None:
        with self._lock:
            old = self._entries.pop(ref, None)
            if old is not None:
                self.size -= len(old[0])
            if len(serialized) > self.max_bytes:
                return
            self._entries[ref] = (serialized, issued_at)
            self.size += len(serialized)
            while self.size > self.max_bytes:
                _, (evicted, _) = self._entries.popitem(last=False)
                self.size -= len(evicted)

    def clear(self) -> None:
        with self._lock:
            self._entries.clear()
            self.size = 0

    def __contains__(self, ref: str) -> bool:
        return ref in self._entries

    def __len__(self) -> int:
        return len(self._entries)


def app_fingerprint(blocks: Blocks, refresh: bool = False) -> str:
    """Identifies the structure of an app (its components and events), so that a
    token issued for one version of an app is not read by a different one where
    the same component id may mean something else. It is the same for every
    process that runs the same app, so browsers also use it (as the config's
    `app_key`) to tell whether saved outputs and run history belong to an app."""
    cached = getattr(blocks, "_state_fingerprint", None)
    if cached is not None and not refresh:
        return cached
    digest = hashlib.sha256()
    for _id in sorted(blocks.blocks):
        digest.update(f"b{_id}:{blocks.blocks[_id].get_block_name()};".encode())
    for _id in sorted(blocks.fns):
        fn = blocks.fns[_id]
        inputs = ",".join(str(b._id) for b in fn.inputs)
        outputs = ",".join(str(b._id) for b in fn.outputs)
        digest.update(f"f{_id}:{inputs}>{outputs};".encode())
    fingerprint = digest.hexdigest()[:16]
    blocks._state_fingerprint = fingerprint  # type: ignore[attr-defined]
    return fingerprint


def client_state_components(fn: BlockFunction) -> dict[int, State]:
    """The browser-stored `gr.State` components an event reads or writes."""
    from gradio.components import State

    return {
        block._id: block
        for block in [*fn.inputs, *fn.outputs]
        if isinstance(block, State) and block.storage == "browser"
    }


# What has been warned about already: component ids, or "invalid_token"
_warned: set[int | str] = set()


def _warn_unserializable(block: State, err: Exception) -> None:
    if block._id in _warned:
        return
    _warned.add(block._id)
    warnings.warn(
        f"A gr.State (component id {block._id}) holds a value that cannot be "
        f"stored in the browser ({err}), so it is being kept in this server's "
        "memory instead. It will be lost if the next request from this session "
        "reaches a different server, e.g. when running several replicas. Pass "
        "`storage='server'` to `gr.State` to silence this warning.",
        stacklevel=2,
    )


def _warn_invalid_token() -> None:
    if "invalid_token" in _warned:
        return
    _warned.add("invalid_token")
    warnings.warn(
        "Discarded a gr.State value sent by a browser because its token could not "
        "be verified, so the state was reset to its initial value. This is "
        "expected after the app's components or events change. Otherwise, it "
        "happens after a restart, or when the app runs on several replicas, "
        "unless GRADIO_SECRET_KEY is set to the same value for every process.",
        stacklevel=2,
    )


class ClientState:
    """The browser-held `gr.State` values for one event."""

    def __init__(
        self,
        components: dict[int, State],
        fingerprint: str,
        serialized: dict[int, bytes],
        client_refs: dict[int, str | None],
    ):
        self.components = components
        self.fingerprint = fingerprint
        # Values the client sent, not yet deserialized
        self.serialized = serialized
        # The reference the client holds for each id (None: it holds nothing usable)
        self.client_refs = client_refs
        # Deserialized values, which the event's functions read and write
        self.values: dict[int, Any] = {}

    def scope(self, _id: int) -> bytes:
        return f"{self.fingerprint}:{_id}".encode()

    @classmethod
    def resolve(
        cls,
        blocks: Blocks,
        fn: BlockFunction,
        entries: dict[str, dict[str, str]],
        cache: StateCache,
    ) -> ClientState:
        """Verifies the state a client sent for an event. Raises MissingStateError
        if the client sent only references that are not in the cache."""
        components = client_state_components(fn)
        sealer = get_sealer()
        fingerprint = app_fingerprint(blocks)
        serialized: dict[int, bytes] = {}
        client_refs: dict[int, str | None] = {}
        missing: list[int] = []
        now = time.time()
        for _id, block in components.items():
            entry = entries.get(str(_id))
            if not isinstance(entry, dict):
                continue
            scope = f"{fingerprint}:{_id}".encode()
            token = entry.get("token")
            ref = entry.get("ref")
            if isinstance(token, str):
                try:
                    value, issued_at = sealer.open(scope, token)
                except InvalidStateTokenError:
                    _warn_invalid_token()
                    client_refs[_id] = None
                    continue
                ref = sealer.ref(scope, value)
                cache.put(ref, value, issued_at)
            elif isinstance(ref, str):
                cached = cache.get(ref)
                if cached is None:
                    missing.append(_id)
                    continue
                value, issued_at = cached
            else:
                continue
            if now - issued_at > block.time_to_live:
                client_refs[_id] = None
                continue
            serialized[_id] = value
            client_refs[_id] = ref
        if missing:
            raise MissingStateError(missing)
        return cls(components, fingerprint, serialized, client_refs)

    def materialize(self, _id: int, session_state: SessionState) -> bool:
        """Deserializes the value for `_id` if there is one. Falls back to a value
        kept in the server's memory (for values that could not be serialized)."""
        if _id in self.values:
            return True
        if _id in self.serialized:
            data = self.serialized.pop(_id)
            try:
                self.values[_id] = state_serialization.loads(data)
                return True
            except Exception as err:
                warnings.warn(
                    f"Could not restore the value of gr.State (component id {_id}) "
                    f"sent by the browser, so it was reset: {err}",
                    stacklevel=2,
                )
                self.client_refs[_id] = None
        if _id in session_state.state_data:
            self.values[_id] = session_state.state_data[_id]
            return True
        return False

    def overlay(self, session_state: SessionState) -> SessionState:
        """A view of the session in which this event's browser-held values
        replace the ones in the session's memory."""
        view = copy(session_state)
        view.state_data = _StateData(self, session_state)  # type: ignore[assignment]
        return view

    def collect(
        self, session_state: SessionState, cache: StateCache
    ) -> dict[str, dict[str, str] | None]:
        """Serializes the values this event touched and returns, for each one
        that changed, the new token to send to the client (or None to tell it
        to drop its token, if the value is now kept on the server instead)."""
        sealer = get_sealer()
        updates: dict[str, dict[str, str] | None] = {}
        for _id, value in self.values.items():
            block = self.components[_id]
            try:
                serialized = state_serialization.dumps(value)
            except StateSerializationError as err:
                _warn_unserializable(block, err)
                session_state[_id] = value
                if self.client_refs.get(_id) is not None:
                    updates[str(_id)] = None
                    self.client_refs[_id] = None
                continue
            session_state.state_data.pop(_id, None)
            scope = self.scope(_id)
            ref = sealer.ref(scope, serialized)
            if ref == self.client_refs.get(_id):
                continue
            issued_at = time.time()
            token = sealer.seal(scope, serialized, issued_at)
            cache.put(ref, serialized, issued_at)
            self.client_refs[_id] = ref
            updates[str(_id)] = {"ref": ref, "token": token}
        return updates


class _StateData(MutableMapping):
    """Routes reads and writes of browser-held `gr.State` values to the event's
    ClientState, and everything else to the session's own `state_data`."""

    def __init__(self, client_state: ClientState, session_state: SessionState):
        self.client_state = client_state
        self.session_state = session_state
        self.shared = session_state.state_data

    def __contains__(self, key: object) -> bool:
        if key in self.client_state.components:
            return self.client_state.materialize(key, self.session_state)  # type: ignore[arg-type]
        return key in self.shared

    def __getitem__(self, key: int) -> Any:
        if key in self.client_state.components:
            if not self.client_state.materialize(key, self.session_state):
                raise KeyError(key)
            return self.client_state.values[key]
        return self.shared[key]

    def __setitem__(self, key: int, value: Any) -> None:
        if key in self.client_state.components:
            self.client_state.values[key] = value
        else:
            self.shared[key] = value

    def __delitem__(self, key: int) -> None:
        if key in self.client_state.components:
            del self.client_state.values[key]
        else:
            del self.shared[key]

    def __iter__(self) -> Iterator[int]:
        yield from self.shared
        yield from (k for k in self.client_state.values if k not in self.shared)

    def __len__(self) -> int:
        return len(set(self.shared) | set(self.client_state.values))
