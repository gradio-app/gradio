import { g as getDefaultExportFromCjs } from './index-30423ace.js';
import './svelte/svelte-internal.js';

const createAddUniqueNumber = (generateUniqueNumber) => {
    return (set) => {
        const number = generateUniqueNumber(set);
        set.add(number);
        return number;
    };
};

const createCache = (lastNumberWeakMap) => {
    return (collection, nextNumber) => {
        lastNumberWeakMap.set(collection, nextNumber);
        return nextNumber;
    };
};

/*
 * The value of the constant Number.MAX_SAFE_INTEGER equals (2 ** 53 - 1) but it
 * is fairly new.
 */
const MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER === undefined ? 9007199254740991 : Number.MAX_SAFE_INTEGER;
const TWO_TO_THE_POWER_OF_TWENTY_NINE = 536870912;
const TWO_TO_THE_POWER_OF_THIRTY = TWO_TO_THE_POWER_OF_TWENTY_NINE * 2;
const createGenerateUniqueNumber = (cache, lastNumberWeakMap) => {
    return (collection) => {
        const lastNumber = lastNumberWeakMap.get(collection);
        /*
         * Let's try the cheapest algorithm first. It might fail to produce a new
         * number, but it is so cheap that it is okay to take the risk. Just
         * increase the last number by one or reset it to 0 if we reached the upper
         * bound of SMIs (which stands for small integers). When the last number is
         * unknown it is assumed that the collection contains zero based consecutive
         * numbers.
         */
        let nextNumber = lastNumber === undefined ? collection.size : lastNumber < TWO_TO_THE_POWER_OF_THIRTY ? lastNumber + 1 : 0;
        if (!collection.has(nextNumber)) {
            return cache(collection, nextNumber);
        }
        /*
         * If there are less than half of 2 ** 30 numbers stored in the collection,
         * the chance to generate a new random number in the range from 0 to 2 ** 30
         * is at least 50%. It's benifitial to use only SMIs because they perform
         * much better in any environment based on V8.
         */
        if (collection.size < TWO_TO_THE_POWER_OF_TWENTY_NINE) {
            while (collection.has(nextNumber)) {
                nextNumber = Math.floor(Math.random() * TWO_TO_THE_POWER_OF_THIRTY);
            }
            return cache(collection, nextNumber);
        }
        // Quickly check if there is a theoretical chance to generate a new number.
        if (collection.size > MAX_SAFE_INTEGER) {
            throw new Error('Congratulations, you created a collection of unique numbers which uses all available integers!');
        }
        // Otherwise use the full scale of safely usable integers.
        while (collection.has(nextNumber)) {
            nextNumber = Math.floor(Math.random() * MAX_SAFE_INTEGER);
        }
        return cache(collection, nextNumber);
    };
};

const LAST_NUMBER_WEAK_MAP = new WeakMap();
const cache = createCache(LAST_NUMBER_WEAK_MAP);
const generateUniqueNumber = createGenerateUniqueNumber(cache, LAST_NUMBER_WEAK_MAP);
const addUniqueNumber = createAddUniqueNumber(generateUniqueNumber);

const isMessagePort = (sender) => {
    return typeof sender.start === 'function';
};

const PORT_MAP = new WeakMap();

const extendBrokerImplementation = (partialBrokerImplementation) => ({
    ...partialBrokerImplementation,
    connect: ({ call }) => {
        return async () => {
            const { port1, port2 } = new MessageChannel();
            const portId = await call('connect', { port: port1 }, [port1]);
            PORT_MAP.set(port2, portId);
            return port2;
        };
    },
    disconnect: ({ call }) => {
        return async (port) => {
            const portId = PORT_MAP.get(port);
            if (portId === undefined) {
                throw new Error('The given port is not connected.');
            }
            await call('disconnect', { portId });
        };
    },
    isSupported: ({ call }) => {
        return () => call('isSupported');
    }
});

const ONGOING_REQUESTS = new WeakMap();
const createOrGetOngoingRequests = (sender) => {
    if (ONGOING_REQUESTS.has(sender)) {
        // @todo TypeScript needs to be convinced that has() works as expected.
        return ONGOING_REQUESTS.get(sender);
    }
    const ongoingRequests = new Map();
    ONGOING_REQUESTS.set(sender, ongoingRequests);
    return ongoingRequests;
};
const createBroker = (brokerImplementation) => {
    const fullBrokerImplementation = extendBrokerImplementation(brokerImplementation);
    return (sender) => {
        const ongoingRequests = createOrGetOngoingRequests(sender);
        sender.addEventListener('message', (({ data: message }) => {
            const { id } = message;
            if (id !== null && ongoingRequests.has(id)) {
                const { reject, resolve } = ongoingRequests.get(id);
                ongoingRequests.delete(id);
                if (message.error === undefined) {
                    resolve(message.result);
                }
                else {
                    reject(new Error(message.error.message));
                }
            }
        }));
        if (isMessagePort(sender)) {
            sender.start();
        }
        const call = (method, params = null, transferables = []) => {
            return new Promise((resolve, reject) => {
                const id = generateUniqueNumber(ongoingRequests);
                ongoingRequests.set(id, { reject, resolve });
                if (params === null) {
                    sender.postMessage({ id, method }, transferables);
                }
                else {
                    sender.postMessage({ id, method, params }, transferables);
                }
            });
        };
        const notify = (method, params, transferables = []) => {
            sender.postMessage({ id: null, method, params }, transferables);
        };
        let functions = {};
        for (const [key, handler] of Object.entries(fullBrokerImplementation)) {
            functions = { ...functions, [key]: handler({ call, notify }) };
        }
        return { ...functions };
    };
};

const encoderIds = new Set();
const wrap = createBroker({
    encode: ({ call }) => {
        return async (encoderId, timeslice) => {
            const arrayBuffers = await call('encode', { encoderId, timeslice });
            encoderIds.delete(encoderId);
            return arrayBuffers;
        };
    },
    instantiate: ({ call }) => {
        return async (mimeType, sampleRate) => {
            const encoderId = addUniqueNumber(encoderIds);
            const port = await call('instantiate', { encoderId, mimeType, sampleRate });
            return { encoderId, port };
        };
    },
    register: ({ call }) => {
        return (port) => {
            return call('register', { port }, [port]);
        };
    }
});
const load = (url) => {
    const worker = new Worker(url);
    return wrap(worker);
};

// This is the minified and stringified code of the media-encoder-host-worker package.
const worker = `(()=>{var e={881:e=>{"use strict";e.exports=(e,t)=>{if("string"!=typeof e)throw new TypeError("expected a string");return e.trim().replace(/([a-z])([A-Z])/g,"$1-$2").replace(/\\W/g,(e=>/[À-ž]/.test(e)?e:"-")).replace(/^-+|-+$/g,"").replace(/-{2,}/g,(e=>t&&t.condense?"-":e)).toLowerCase()}},507:e=>{var t=function(e){var t,r,n=/\\w+/.exec(e);if(!n)return"an";var o=(r=n[0]).toLowerCase(),s=["honest","hour","hono"];for(t in s)if(0==o.indexOf(s[t]))return"an";if(1==o.length)return"aedhilmnorsx".indexOf(o)>=0?"an":"a";if(r.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/))return"an";var a=[/^e[uw]/,/^onc?e\\b/,/^uni([^nmd]|mo)/,/^u[bcfhjkqrst][aeiou]/];for(t=0;t<a.length;t++)if(o.match(a[t]))return"a";return r.match(/^U[NK][AIEO]/)?"a":r==r.toUpperCase()?"aedhilmnorsx".indexOf(o[0])>=0?"an":"a":"aeiou".indexOf(o[0])>=0||o.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/)?"an":"a"};void 0!==e.exports?e.exports=t:window.indefiniteArticle=t}},t={};function r(n){var o=t[n];if(void 0!==o)return o.exports;var s=t[n]={exports:{}};return e[n](s,s.exports,r),s.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{"use strict";var e=r(881),t=r.n(e),n=r(507),o=r.n(n);const s=(e,r)=>void 0===r?e:r.reduce(((e,r)=>{if("capitalize"===r){const t=e.charAt(0).toUpperCase(),r=e.slice(1);return"".concat(t).concat(r)}return"dashify"===r?t()(e):"prependIndefiniteArticle"===r?"".concat(o()(e)," ").concat(e):e}),e),a=(e,t)=>{const r=/\\\${([^.}]+)((\\.[^(]+\\(\\))*)}/g,n=[];let o=r.exec(e);for(;null!==o;){const t={modifiers:[],name:o[1]};if(void 0!==o[3]){const e=/\\.[^(]+\\(\\)/g;let r=e.exec(o[2]);for(;null!==r;)t.modifiers.push(r[0].slice(1,-2)),r=e.exec(o[2])}n.push(t),o=r.exec(e)}const a=n.reduce(((e,r)=>e.map((e=>"string"==typeof e?e.split((e=>{const t=e.name+e.modifiers.map((e=>"\\\\.".concat(e,"\\\\(\\\\)"))).join("");return new RegExp("\\\\$\\\\{".concat(t,"}"),"g")})(r)).reduce(((e,n,o)=>0===o?[n]:r.name in t?[...e,s(t[r.name],r.modifiers),n]:[...e,e=>s(e[r.name],r.modifiers),n]),[]):[e])).reduce(((e,t)=>[...e,...t]),[])),[e]);return e=>a.reduce(((t,r)=>"string"==typeof r?[...t,r]:[...t,r(e)]),[]).join("")},i=function(e){let t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{};const r=void 0===e.code?void 0:a(e.code,t),n=void 0===e.message?void 0:a(e.message,t);return function(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=arguments.length>1?arguments[1]:void 0;const s=void 0===o&&(t instanceof Error||void 0!==t.code&&"Exception"===t.code.slice(-9)),{cause:a,missingParameters:i}=s?{cause:t,missingParameters:{}}:{cause:o,missingParameters:t},c=void 0===n?new Error:new Error(n(i));return null!==a&&(c.cause=a),void 0!==r&&(c.code=r(i)),void 0!==e.status&&(c.status=e.status),c}},c=-32603,d=-32602,l=i({message:'The requested method called "\${method}" is not supported.',status:-32601}),u=i({message:'The handler of the method called "\${method}" returned no required result.',status:c}),h=i({message:'The handler of the method called "\${method}" returned an unexpected result.',status:c}),m=i({message:'The specified parameter called "portId" with the given value "\${portId}" does not identify a port connected to this worker.',status:d}),p=void 0===Number.MAX_SAFE_INTEGER?9007199254740991:Number.MAX_SAFE_INTEGER,f=536870912,g=1073741824,w=new WeakMap;var v;const y=((e,t)=>r=>{const n=t.get(r);let o=void 0===n?r.size:n<g?n+1:0;if(!r.has(o))return e(r,o);if(r.size<f){for(;r.has(o);)o=Math.floor(Math.random()*g);return e(r,o)}if(r.size>p)throw new Error("Congratulations, you created a collection of unique numbers which uses all available integers!");for(;r.has(o);)o=Math.floor(Math.random()*p);return e(r,o)})((v=w,(e,t)=>(v.set(e,t),t)),w),M=((e=>{})(y),new Map),E=(e,t,r)=>({...t,connect:r=>{let{port:n}=r;n.start();const o=e(n,t),s=y(M);return M.set(s,(()=>{o(),n.close(),M.delete(s)})),{result:s}},disconnect:e=>{let{portId:t}=e;const r=M.get(t);if(void 0===r)throw m({portId:t.toString()});return r(),{result:null}},isSupported:async()=>{if(await new Promise((e=>{const t=new ArrayBuffer(0),{port1:r,port2:n}=new MessageChannel;r.onmessage=t=>{let{data:r}=t;return e(null!==r)},n.postMessage(t,[t])}))){const e=r();return{result:e instanceof Promise?await e:e}}return{result:!1}}}),x=function(e,t){const r=E(x,t,arguments.length>2&&void 0!==arguments[2]?arguments[2]:()=>!0),n=((e,t)=>async r=>{let{data:{id:n,method:o,params:s}}=r;const a=t[o];try{if(void 0===a)throw l({method:o});const t=void 0===s?a():a(s);if(void 0===t)throw u({method:o});const r=t instanceof Promise?await t:t;if(null===n){if(void 0!==r.result)throw h({method:o})}else{if(void 0===r.result)throw h({method:o});const{result:t,transferables:s=[]}=r;e.postMessage({id:n,result:t},s)}}catch(t){const{message:r,status:o=-32603}=t;e.postMessage({error:{code:o,message:r},id:n})}})(e,r);return e.addEventListener("message",n),()=>e.removeEventListener("message",n)},b=e=>{e.onmessage=null,e.close()},A=new WeakMap,T=new WeakMap,I=(e=>{const t=(r=e,{...r,connect:e=>{let{call:t}=e;return async()=>{const{port1:e,port2:r}=new MessageChannel,n=await t("connect",{port:e},[e]);return A.set(r,n),r}},disconnect:e=>{let{call:t}=e;return async e=>{const r=A.get(e);if(void 0===r)throw new Error("The given port is not connected.");await t("disconnect",{portId:r})}},isSupported:e=>{let{call:t}=e;return()=>t("isSupported")}});var r;return e=>{const r=(e=>{if(T.has(e))return T.get(e);const t=new Map;return T.set(e,t),t})(e);e.addEventListener("message",(e=>{let{data:t}=e;const{id:n}=t;if(null!==n&&r.has(n)){const{reject:e,resolve:o}=r.get(n);r.delete(n),void 0===t.error?o(t.result):e(new Error(t.error.message))}})),(e=>"function"==typeof e.start)(e)&&e.start();const n=function(t){let n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];return new Promise(((s,a)=>{const i=y(r);r.set(i,{reject:a,resolve:s}),null===n?e.postMessage({id:i,method:t},o):e.postMessage({id:i,method:t,params:n},o)}))},o=function(t,r){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:[];e.postMessage({id:null,method:t,params:r},n)};let s={};for(const[e,r]of Object.entries(t))s={...s,[e]:r({call:n,notify:o})};return{...s}}})({characterize:e=>{let{call:t}=e;return()=>t("characterize")},encode:e=>{let{call:t}=e;return(e,r)=>t("encode",{recordingId:e,timeslice:r})},record:e=>{let{call:t}=e;return async(e,r,n)=>{await t("record",{recordingId:e,sampleRate:r,typedArrays:n},n.map((e=>{let{buffer:t}=e;return t})))}}}),O=async(e,t)=>{const r=I(t),n=await r.characterize(),o=n.toString();if(e.has(o))throw new Error("There is already an encoder stored which handles exactly the same mime types.");return e.set(o,[n,r]),n},L=new Map,P=(e=>t=>{const r=e.get(t);if(void 0===r)throw new Error("There was no instance of an encoder stored with the given id.");return r})(L),S=((e,t)=>r=>{const n=t(r);return e.delete(r),n})(L,P),N=new Map,C=((e,t)=>r=>{const[n,o,s,a]=t(r);return s?new Promise((t=>{o.onmessage=s=>{let{data:i}=s;0===i.length?(e(o),t(n.encode(r,null))):n.record(r,a,i)}})):n.encode(r,null)})(b,S),R=(e=>t=>{for(const[r,n]of Array.from(e.values()))if(r.test(t))return n;throw new Error("There is no encoder registered which could handle the given mimeType.")})(N),$=((e,t,r)=>(n,o,s)=>{if(t.has(n))throw new Error('There is already an encoder registered with an id called "'.concat(n,'".'));const a=r(o),{port1:i,port2:c}=new MessageChannel,d=[a,i,!0,s];return t.set(n,d),i.onmessage=t=>{let{data:r}=t;0===r.length?(e(i),d[2]=!1):a.record(n,s,r.map((e=>"number"==typeof e?new Float32Array(e):e)))},c})(b,L,R),j=(e=>(t,r)=>{const[n]=e(t);return n.encode(t,r)})(P);x(self,{encode:async e=>{let{encoderId:t,timeslice:r}=e;const n=null===r?await C(t):await j(t,r);return{result:n,transferables:n}},instantiate:e=>{let{encoderId:t,mimeType:r,sampleRate:n}=e;const o=$(t,r,n);return{result:o,transferables:[o]}},register:async e=>{let{port:t}=e;return{result:await O(N,t)}}})})()})();`; // tslint:disable-line:max-line-length

const blob = new Blob([worker], { type: 'application/javascript; charset=utf-8' });
const url = URL.createObjectURL(blob);
const mediaEncoderHost = load(url);
const encode = mediaEncoderHost.encode;
const instantiate = mediaEncoderHost.instantiate;
const register$1 = mediaEncoderHost.register;
URL.revokeObjectURL(url);

const createBlobEventFactory = (nativeBlobEventConstructor) => {
    return (type, blobEventInit) => {
        if (nativeBlobEventConstructor === null) {
            throw new Error('A native BlobEvent could not be created.');
        }
        return new nativeBlobEventConstructor(type, blobEventInit);
    };
};

const createDecodeWebMChunk = (readElementContent, readElementType) => {
    return (dataView, elementType, channelCount) => {
        const contents = [];
        let currentElementType = elementType;
        let offset = 0;
        while (offset < dataView.byteLength) {
            if (currentElementType === null) {
                const lengthAndType = readElementType(dataView, offset);
                if (lengthAndType === null) {
                    break;
                }
                const { length, type } = lengthAndType;
                currentElementType = type;
                offset += length;
            }
            else {
                const contentAndLength = readElementContent(dataView, offset, currentElementType, channelCount);
                if (contentAndLength === null) {
                    break;
                }
                const { content, length } = contentAndLength;
                currentElementType = null;
                offset += length;
                if (content !== null) {
                    contents.push(content);
                }
            }
        }
        return { contents, currentElementType, offset };
    };
};

const createEventTargetConstructor$1 = (createEventTarget, wrapEventListener) => {
    return class EventTarget {
        constructor(nativeEventTarget = null) {
            this._listeners = new WeakMap();
            this._nativeEventTarget = nativeEventTarget === null ? createEventTarget() : nativeEventTarget;
        }
        addEventListener(type, listener, options) {
            if (listener !== null) {
                let wrappedEventListener = this._listeners.get(listener);
                if (wrappedEventListener === undefined) {
                    wrappedEventListener = wrapEventListener(this, listener);
                    if (typeof listener === 'function') {
                        this._listeners.set(listener, wrappedEventListener);
                    }
                }
                this._nativeEventTarget.addEventListener(type, wrappedEventListener, options);
            }
        }
        dispatchEvent(event) {
            return this._nativeEventTarget.dispatchEvent(event);
        }
        removeEventListener(type, listener, options) {
            const wrappedEventListener = listener === null ? undefined : this._listeners.get(listener);
            this._nativeEventTarget.removeEventListener(type, wrappedEventListener === undefined ? null : wrappedEventListener, options);
        }
    };
};

const createEventTargetFactory = (window) => {
    return () => {
        if (window === null) {
            throw new Error('A native EventTarget could not be created.');
        }
        return window.document.createElement('p');
    };
};

const createInvalidModificationError = (message = '') => {
    try {
        return new DOMException(message, 'InvalidModificationError');
    }
    catch (err) {
        // @todo Edge is the only browser that does not yet allow to construct a DOMException.
        err.code = 13;
        err.message = message;
        err.name = 'InvalidModificationError';
        return err;
    }
};

const createInvalidStateError$1 = () => {
    try {
        return new DOMException('', 'InvalidStateError');
    }
    catch (err) {
        // Bug #122: Edge is the only browser that does not yet allow to construct a DOMException.
        err.code = 11;
        err.name = 'InvalidStateError';
        return err;
    }
};

const createIsSupportedPromise = (window) => {
    if (window !== null &&
        // Bug #14: Before v14.1 Safari did not support the BlobEvent.
        window.BlobEvent !== undefined &&
        window.MediaStream !== undefined &&
        /*
         * Bug #10: An early experimental implemenation in Safari v14 did not provide the isTypeSupported() function.
         *
         * Bug #17: Safari up to v14.1.2 throttled the processing on hidden tabs if there was no active audio output. This is not tested
         * here but should be covered by the following test, too.
         */
        (window.MediaRecorder === undefined || window.MediaRecorder.isTypeSupported !== undefined)) {
        // Bug #11 Safari up to v14.1.2 did not support the MediaRecorder but that isn't tested here.
        if (window.MediaRecorder === undefined) {
            return Promise.resolve(true);
        }
        const canvasElement = window.document.createElement('canvas');
        const context = canvasElement.getContext('2d');
        if (context === null || typeof canvasElement.captureStream !== 'function') {
            return Promise.resolve(false);
        }
        const mediaStream = canvasElement.captureStream();
        return Promise.all([
            /*
             * Bug #5: Up until v70 Firefox did emit a blob of type video/webm when asked to encode a MediaStream with a video track into an
             * audio codec.
             */
            new Promise((resolve) => {
                const mimeType = 'audio/webm';
                try {
                    const mediaRecorder = new window.MediaRecorder(mediaStream, { mimeType });
                    mediaRecorder.addEventListener('dataavailable', ({ data }) => resolve(data.type === mimeType));
                    mediaRecorder.start();
                    setTimeout(() => mediaRecorder.stop(), 10);
                }
                catch (err) {
                    resolve(err.name === 'NotSupportedError');
                }
            }),
            /*
             * Bug #1 & #2: Up until v83 Firefox fired an error event with an UnknownError when adding or removing a track.
             *
             * Bug #3 & #4: Up until v112 Chrome dispatched an error event without any error.
             *
             * Bug #6: Up until v113 Chrome emitted a blob without any data when asked to encode a MediaStream with a video track as audio.
             * This is not directly tested here as it can only be tested by recording something for a short time. It got fixed at the same
             * time as #7 and #8.
             *
             * Bug #7 & #8: Up until v113 Chrome dispatched the dataavailable and stop events before it dispatched the error event.
             */
            new Promise((resolve) => {
                const mediaRecorder = new window.MediaRecorder(mediaStream);
                let hasDispatchedDataAvailableEvent = false;
                let hasDispatchedStopEvent = false;
                mediaRecorder.addEventListener('dataavailable', () => (hasDispatchedDataAvailableEvent = true));
                mediaRecorder.addEventListener('error', (event) => {
                    resolve(!hasDispatchedDataAvailableEvent &&
                        !hasDispatchedStopEvent &&
                        'error' in event &&
                        event.error !== null &&
                        typeof event.error === 'object' &&
                        'name' in event.error &&
                        event.error.name !== 'UnknownError');
                });
                mediaRecorder.addEventListener('stop', () => (hasDispatchedStopEvent = true));
                mediaRecorder.start();
                context.fillRect(0, 0, 1, 1);
                mediaStream.removeTrack(mediaStream.getVideoTracks()[0]);
            })
        ]).then((results) => results.every((result) => result));
    }
    return Promise.resolve(false);
};

const createMediaRecorderConstructor = (createNativeMediaRecorder, createNotSupportedError, createWebAudioMediaRecorder, createWebmPcmMediaRecorder, encoderRegexes, eventTargetConstructor, nativeMediaRecorderConstructor) => {
    return class MediaRecorder extends eventTargetConstructor {
        constructor(stream, options = {}) {
            const { mimeType } = options;
            if (nativeMediaRecorderConstructor !== null &&
                // Bug #10: Safari does not yet implement the isTypeSupported() method.
                (mimeType === undefined ||
                    (nativeMediaRecorderConstructor.isTypeSupported !== undefined &&
                        nativeMediaRecorderConstructor.isTypeSupported(mimeType)))) {
                const internalMediaRecorder = createNativeMediaRecorder(nativeMediaRecorderConstructor, stream, options);
                super(internalMediaRecorder);
                this._internalMediaRecorder = internalMediaRecorder;
            }
            else if (mimeType !== undefined && encoderRegexes.some((regex) => regex.test(mimeType))) {
                super();
                // Bug #10: Safari does not yet implement the isTypeSupported() method.
                if (nativeMediaRecorderConstructor !== null &&
                    nativeMediaRecorderConstructor.isTypeSupported !== undefined &&
                    nativeMediaRecorderConstructor.isTypeSupported('audio/webm;codecs=pcm')) {
                    this._internalMediaRecorder = createWebmPcmMediaRecorder(this, nativeMediaRecorderConstructor, stream, mimeType);
                }
                else {
                    this._internalMediaRecorder = createWebAudioMediaRecorder(this, stream, mimeType);
                }
            }
            else {
                // This is creating a native MediaRecorder just to provoke it to throw an error.
                if (nativeMediaRecorderConstructor !== null) {
                    createNativeMediaRecorder(nativeMediaRecorderConstructor, stream, options);
                }
                throw createNotSupportedError();
            }
            this._ondataavailable = null;
            this._onerror = null;
            this._onpause = null;
            this._onresume = null;
            this._onstart = null;
            this._onstop = null;
        }
        get mimeType() {
            return this._internalMediaRecorder.mimeType;
        }
        get ondataavailable() {
            return this._ondataavailable === null ? this._ondataavailable : this._ondataavailable[0];
        }
        set ondataavailable(value) {
            if (this._ondataavailable !== null) {
                this.removeEventListener('dataavailable', this._ondataavailable[1]);
            }
            if (typeof value === 'function') {
                const boundListener = value.bind(this);
                this.addEventListener('dataavailable', boundListener);
                this._ondataavailable = [value, boundListener];
            }
            else {
                this._ondataavailable = null;
            }
        }
        get onerror() {
            return this._onerror === null ? this._onerror : this._onerror[0];
        }
        set onerror(value) {
            if (this._onerror !== null) {
                this.removeEventListener('error', this._onerror[1]);
            }
            if (typeof value === 'function') {
                const boundListener = value.bind(this);
                this.addEventListener('error', boundListener);
                this._onerror = [value, boundListener];
            }
            else {
                this._onerror = null;
            }
        }
        get onpause() {
            return this._onpause === null ? this._onpause : this._onpause[0];
        }
        set onpause(value) {
            if (this._onpause !== null) {
                this.removeEventListener('pause', this._onpause[1]);
            }
            if (typeof value === 'function') {
                const boundListener = value.bind(this);
                this.addEventListener('pause', boundListener);
                this._onpause = [value, boundListener];
            }
            else {
                this._onpause = null;
            }
        }
        get onresume() {
            return this._onresume === null ? this._onresume : this._onresume[0];
        }
        set onresume(value) {
            if (this._onresume !== null) {
                this.removeEventListener('resume', this._onresume[1]);
            }
            if (typeof value === 'function') {
                const boundListener = value.bind(this);
                this.addEventListener('resume', boundListener);
                this._onresume = [value, boundListener];
            }
            else {
                this._onresume = null;
            }
        }
        get onstart() {
            return this._onstart === null ? this._onstart : this._onstart[0];
        }
        set onstart(value) {
            if (this._onstart !== null) {
                this.removeEventListener('start', this._onstart[1]);
            }
            if (typeof value === 'function') {
                const boundListener = value.bind(this);
                this.addEventListener('start', boundListener);
                this._onstart = [value, boundListener];
            }
            else {
                this._onstart = null;
            }
        }
        get onstop() {
            return this._onstop === null ? this._onstop : this._onstop[0];
        }
        set onstop(value) {
            if (this._onstop !== null) {
                this.removeEventListener('stop', this._onstop[1]);
            }
            if (typeof value === 'function') {
                const boundListener = value.bind(this);
                this.addEventListener('stop', boundListener);
                this._onstop = [value, boundListener];
            }
            else {
                this._onstop = null;
            }
        }
        get state() {
            return this._internalMediaRecorder.state;
        }
        pause() {
            return this._internalMediaRecorder.pause();
        }
        resume() {
            return this._internalMediaRecorder.resume();
        }
        start(timeslice) {
            return this._internalMediaRecorder.start(timeslice);
        }
        stop() {
            return this._internalMediaRecorder.stop();
        }
        static isTypeSupported(mimeType) {
            return ((nativeMediaRecorderConstructor !== null &&
                // Bug #10: Safari does not yet implement the isTypeSupported() method.
                nativeMediaRecorderConstructor.isTypeSupported !== undefined &&
                nativeMediaRecorderConstructor.isTypeSupported(mimeType)) ||
                encoderRegexes.some((regex) => regex.test(mimeType)));
        }
    };
};

const createNativeBlobEventConstructor = (window) => {
    if (window !== null && window.BlobEvent !== undefined) {
        return window.BlobEvent;
    }
    return null;
};

const createNativeMediaRecorder = (nativeMediaRecorderConstructor, stream, mediaRecorderOptions) => {
    const bufferedBlobEventListeners = new Map();
    const dataAvailableListeners = new WeakMap();
    const errorListeners = new WeakMap();
    const nativeMediaRecorder = new nativeMediaRecorderConstructor(stream, mediaRecorderOptions);
    const stopListeners = new WeakMap();
    let isSliced = false;
    nativeMediaRecorder.addEventListener = ((addEventListener) => {
        return (type, listener, options) => {
            let patchedEventListener = listener;
            if (typeof listener === 'function') {
                if (type === 'dataavailable') {
                    const bufferedBlobEvents = [];
                    // Bug #20: Firefox dispatches multiple dataavailable events while being inactive.
                    patchedEventListener = (event) => {
                        if (isSliced && nativeMediaRecorder.state === 'inactive') {
                            bufferedBlobEvents.push(event);
                        }
                        else {
                            listener.call(nativeMediaRecorder, event);
                        }
                    };
                    bufferedBlobEventListeners.set(listener, bufferedBlobEvents);
                    dataAvailableListeners.set(listener, patchedEventListener);
                }
                else if (type === 'error') {
                    // Bug #12 & #13: Firefox fires a regular event with an error property.
                    patchedEventListener = (event) => {
                        if (event instanceof ErrorEvent) {
                            listener.call(nativeMediaRecorder, event);
                        }
                        else {
                            listener.call(nativeMediaRecorder, new ErrorEvent('error', { error: event.error }));
                        }
                    };
                    errorListeners.set(listener, patchedEventListener);
                }
                else if (type === 'stop') {
                    // Bug #20: Firefox dispatches multiple dataavailable events while being inactive.
                    patchedEventListener = (event) => {
                        for (const [dataAvailableListener, bufferedBlobEvents] of bufferedBlobEventListeners.entries()) {
                            if (bufferedBlobEvents.length > 0) {
                                const [blobEvent] = bufferedBlobEvents;
                                if (bufferedBlobEvents.length > 1) {
                                    Object.defineProperty(blobEvent, 'data', {
                                        value: new Blob(bufferedBlobEvents.map(({ data }) => data), { type: blobEvent.data.type })
                                    });
                                }
                                bufferedBlobEvents.length = 0;
                                dataAvailableListener.call(nativeMediaRecorder, blobEvent);
                            }
                        }
                        isSliced = false;
                        listener.call(nativeMediaRecorder, event);
                    };
                    stopListeners.set(listener, patchedEventListener);
                }
            }
            return addEventListener.call(nativeMediaRecorder, type, patchedEventListener, options);
        };
    })(nativeMediaRecorder.addEventListener);
    nativeMediaRecorder.removeEventListener = ((removeEventListener) => {
        return (type, listener, options) => {
            let patchedEventListener = listener;
            if (typeof listener === 'function') {
                if (type === 'dataavailable') {
                    bufferedBlobEventListeners.delete(listener);
                    const dataAvailableListener = dataAvailableListeners.get(listener);
                    if (dataAvailableListener !== undefined) {
                        patchedEventListener = dataAvailableListener;
                    }
                }
                else if (type === 'error') {
                    const errorListener = errorListeners.get(listener);
                    if (errorListener !== undefined) {
                        patchedEventListener = errorListener;
                    }
                }
                else if (type === 'stop') {
                    const stopListener = stopListeners.get(listener);
                    if (stopListener !== undefined) {
                        patchedEventListener = stopListener;
                    }
                }
            }
            return removeEventListener.call(nativeMediaRecorder, type, patchedEventListener, options);
        };
    })(nativeMediaRecorder.removeEventListener);
    nativeMediaRecorder.start = ((start) => {
        return (timeslice) => {
            isSliced = timeslice !== undefined;
            return timeslice === undefined ? start.call(nativeMediaRecorder) : start.call(nativeMediaRecorder, timeslice);
        };
    })(nativeMediaRecorder.start);
    return nativeMediaRecorder;
};

const createNativeMediaRecorderConstructor = (window) => {
    if (window === null) {
        return null;
    }
    return window.MediaRecorder === undefined ? null : window.MediaRecorder;
};

const createNotSupportedError$1 = () => {
    try {
        return new DOMException('', 'NotSupportedError');
    }
    catch (err) {
        // @todo Edge is the only browser that does not yet allow to construct a DOMException.
        err.code = 9;
        err.name = 'NotSupportedError';
        return err;
    }
};

const createReadElementContent = (readVariableSizeInteger) => {
    return (dataView, offset, type, channelCount = 2) => {
        const lengthAndValue = readVariableSizeInteger(dataView, offset);
        if (lengthAndValue === null) {
            return lengthAndValue;
        }
        const { length, value } = lengthAndValue;
        if (type === 'master') {
            return { content: null, length };
        }
        if (offset + length + value > dataView.byteLength) {
            return null;
        }
        if (type === 'binary') {
            const numberOfSamples = (value / Float32Array.BYTES_PER_ELEMENT - 1) / channelCount;
            const content = Array.from({ length: channelCount }, () => new Float32Array(numberOfSamples));
            for (let i = 0; i < numberOfSamples; i += 1) {
                const elementOffset = i * channelCount + 1;
                for (let j = 0; j < channelCount; j += 1) {
                    content[j][i] = dataView.getFloat32(offset + length + (elementOffset + j) * Float32Array.BYTES_PER_ELEMENT, true);
                }
            }
            return { content, length: length + value };
        }
        return { content: null, length: length + value };
    };
};

const createReadElementType = (readVariableSizeInteger) => {
    return (dataView, offset) => {
        const lengthAndValue = readVariableSizeInteger(dataView, offset);
        if (lengthAndValue === null) {
            return lengthAndValue;
        }
        const { length, value } = lengthAndValue;
        if (value === 35) {
            return { length, type: 'binary' };
        }
        if (value === 46 ||
            value === 97 ||
            value === 88713574 ||
            value === 106212971 ||
            value === 139690087 ||
            value === 172351395 ||
            value === 256095861) {
            return { length, type: 'master' };
        }
        return { length, type: 'unknown' };
    };
};

const createReadVariableSizeInteger = (readVariableSizeIntegerLength) => {
    return (dataView, offset) => {
        const length = readVariableSizeIntegerLength(dataView, offset);
        if (length === null) {
            return length;
        }
        const firstDataByteOffset = offset + Math.floor((length - 1) / 8);
        if (firstDataByteOffset + length > dataView.byteLength) {
            return null;
        }
        const firstDataByte = dataView.getUint8(firstDataByteOffset);
        let value = firstDataByte & ((1 << (8 - (length % 8))) - 1); // tslint:disable-line:no-bitwise
        for (let i = 1; i < length; i += 1) {
            value = (value << 8) + dataView.getUint8(firstDataByteOffset + i); // tslint:disable-line:no-bitwise
        }
        return { length, value };
    };
};

const observable = Symbol.observable || "@@observable";

function patch(arg) {
    if (!Symbol.observable) {
        if (typeof arg === "function" &&
            arg.prototype &&
            arg.prototype[Symbol.observable]) {
            arg.prototype[observable] = arg.prototype[Symbol.observable];
            delete arg.prototype[Symbol.observable];
        }
        else {
            arg[observable] = arg[Symbol.observable];
            delete arg[Symbol.observable];
        }
    }
    return arg;
}

const noop = () => { };
const rethrow = (error) => {
    throw error;
};
function toObserver(observer) {
    if (observer) {
        if (observer.next && observer.error && observer.complete) {
            return observer;
        }
        return {
            complete: (observer.complete ?? noop).bind(observer),
            error: (observer.error ?? rethrow).bind(observer),
            next: (observer.next ?? noop).bind(observer),
        };
    }
    return {
        complete: noop,
        error: rethrow,
        next: noop,
    };
}

const createOn = (wrapSubscribeFunction) => {
    return (target, type, options) => wrapSubscribeFunction((observer) => {
        const listener = (event) => observer.next(event);
        target.addEventListener(type, listener, options);
        return () => target.removeEventListener(type, listener, options);
    });
};

const createWrapSubscribeFunction = (patch, toObserver) => {
    const emptyFunction = () => { }; // tslint:disable-line:no-empty
    const isNextFunction = (args) => typeof args[0] === 'function';
    return (innerSubscribe) => {
        const subscribe = ((...args) => {
            const unsubscribe = innerSubscribe(isNextFunction(args) ? toObserver({ next: args[0] }) : toObserver(...args));
            if (unsubscribe !== undefined) {
                return unsubscribe;
            }
            return emptyFunction;
        });
        subscribe[Symbol.observable] = () => ({
            subscribe: (...args) => ({ unsubscribe: subscribe(...args) })
        });
        return patch(subscribe);
    };
};

const wrapSubscribeFunction = createWrapSubscribeFunction(patch, toObserver);
const on = createOn(wrapSubscribeFunction);

/*!
 * dashify <https://github.com/jonschlinkert/dashify>
 *
 * Copyright (c) 2015-2017, Jon Schlinkert.
 * Released under the MIT License.
 */

var dashify = (str, options) => {
  if (typeof str !== 'string') throw new TypeError('expected a string');
  return str.trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\W/g, m => /[À-ž]/.test(m) ? m : '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, m => options && options.condense ? '-' : m)
    .toLowerCase();
};

const dashify$1 = /*@__PURE__*/getDefaultExportFromCjs(dashify);

var indefiniteArticle$1 = {exports: {}};

/*
 * indefinite-article.js v1.0.0, 12-18-2011
 *
 * @author: Rodrigo Neri (@rigoneri)
 *
 * (The MIT License)
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

(function (module) {
	var indefiniteArticle = function(phrase) {
	    var i, word;

	    // Getting the first word
	    var match = /\w+/.exec(phrase);
	    if (match)
	        word = match[0];
	    else
	        return "an";

	    var l_word = word.toLowerCase();
	    // Specific start of words that should be preceeded by 'an'
	    var alt_cases = ["honest", "hour", "hono"];
	    for (i in alt_cases) {
	        if (l_word.indexOf(alt_cases[i]) == 0)
	            return "an";
	    }

	    // Single letter word which should be preceeded by 'an'
	    if (l_word.length == 1) {
	        if ("aedhilmnorsx".indexOf(l_word) >= 0)
	            return "an";
	        else
	            return "a";
	    }

	    // Capital words which should likely be preceeded by 'an'
	    if (word.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/)) {
	        return "an";
	    }

	    // Special cases where a word that begins with a vowel should be preceeded by 'a'
	    var regexes = [/^e[uw]/, /^onc?e\b/, /^uni([^nmd]|mo)/, /^u[bcfhjkqrst][aeiou]/];
	    for (i = 0; i < regexes.length; i++) {
	        if (l_word.match(regexes[i]))
	            return "a"
	    }

	    // Special capital words (UK, UN)
	    if (word.match(/^U[NK][AIEO]/)) {
	        return "a";
	    }
	    else if (word == word.toUpperCase()) {
	        if ("aedhilmnorsx".indexOf(l_word[0]) >= 0)
	            return "an";
	        else
	            return "a";
	    }

	    // Basic method of words that begin with a vowel being preceeded by 'an'
	    if ("aeiou".indexOf(l_word[0]) >= 0)
	        return "an";

	    // Instances where y follwed by specific letters is preceeded by 'an'
	    if (l_word.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/))
	        return "an";

	    return "a";
	};

	{
	    module.exports = indefiniteArticle;
	} 
} (indefiniteArticle$1));

var indefiniteArticleExports = indefiniteArticle$1.exports;
const indefiniteArticle = /*@__PURE__*/getDefaultExportFromCjs(indefiniteArticleExports);

const applyModifiers = (name, modifiers) => {
    if (modifiers === undefined) {
        return name;
    }
    return modifiers.reduce((modifiedName, modifier) => {
        if (modifier === 'capitalize') {
            const head = modifiedName.charAt(0).toUpperCase();
            const tail = modifiedName.slice(1);
            return `${head}${tail}`;
        }
        if (modifier === 'dashify') {
            return dashify$1(modifiedName);
        }
        if (modifier === 'prependIndefiniteArticle') {
            return `${indefiniteArticle(modifiedName)} ${modifiedName}`;
        }
        return modifiedName;
    }, name);
};
const buildRegex = (variable) => {
    const expression = variable.name + variable.modifiers.map((modifier) => `\\.${modifier}\\(\\)`).join('');
    return new RegExp(`\\$\\{${expression}}`, 'g');
};
const preRenderString = (string, parameters) => {
    const expressionRegex = /\${([^.}]+)((\.[^(]+\(\))*)}/g;
    const variables = [];
    let expressionResult = expressionRegex.exec(string);
    while (expressionResult !== null) {
        const variable = {
            modifiers: [],
            name: expressionResult[1]
        };
        if (expressionResult[3] !== undefined) {
            const modifiersRegex = /\.[^(]+\(\)/g;
            let modifiersRegexResult = modifiersRegex.exec(expressionResult[2]);
            while (modifiersRegexResult !== null) {
                variable.modifiers.push(modifiersRegexResult[0].slice(1, -2));
                modifiersRegexResult = modifiersRegex.exec(expressionResult[2]);
            }
        }
        variables.push(variable);
        expressionResult = expressionRegex.exec(string);
    }
    const preRenderedParts = variables.reduce((parts, variable) => parts
        .map((part) => {
        if (typeof part === 'string') {
            return part.split(buildRegex(variable)).reduce((prts, prt, index) => {
                if (index === 0) {
                    return [prt];
                }
                if (variable.name in parameters) {
                    return [...prts, applyModifiers(parameters[variable.name], variable.modifiers), prt];
                }
                return [...prts, (prmtrs) => applyModifiers(prmtrs[variable.name], variable.modifiers), prt];
            }, []);
        }
        return [part];
    })
        .reduce((prts, part) => [...prts, ...part], []), [string]);
    return (missingParameters) => preRenderedParts
        .reduce((renderedParts, preRenderedPart) => {
        if (typeof preRenderedPart === 'string') {
            return [...renderedParts, preRenderedPart];
        }
        return [...renderedParts, preRenderedPart(missingParameters)];
    }, [])
        .join('');
};
const compile = (template, knownParameters = {}) => {
    const renderCode = template.code === undefined ? undefined : preRenderString(template.code, knownParameters);
    const renderMessage = template.message === undefined ? undefined : preRenderString(template.message, knownParameters);
    function render(causeOrMissingParameters = {}, optionalCause) {
        const hasNoOptionalCause = optionalCause === undefined &&
            (causeOrMissingParameters instanceof Error ||
                (causeOrMissingParameters.code !== undefined &&
                    causeOrMissingParameters.code.slice(-9) === 'Exception'));
        const { cause, missingParameters } = hasNoOptionalCause
            ? {
                cause: causeOrMissingParameters,
                missingParameters: {}
            }
            : {
                cause: optionalCause,
                missingParameters: causeOrMissingParameters
            };
        const err = ((renderMessage === undefined ? new Error() : new Error(renderMessage(missingParameters))));
        if (cause !== null) {
            err.cause = cause;
        }
        if (renderCode !== undefined) {
            err.code = renderCode(missingParameters);
        }
        if (template.status !== undefined) {
            err.status = template.status;
        }
        return err;
    }
    return render;
};

const JSON_RPC_ERROR_CODES = { INTERNAL_ERROR: -32603, INVALID_PARAMS: -32602, METHOD_NOT_FOUND: -32601 };
compile({
    message: 'The requested method called "${method}" is not supported.',
    status: JSON_RPC_ERROR_CODES.METHOD_NOT_FOUND
});
compile({
    message: 'The handler of the method called "${method}" returned no required result.',
    status: JSON_RPC_ERROR_CODES.INTERNAL_ERROR
});
compile({
    message: 'The handler of the method called "${method}" returned an unexpected result.',
    status: JSON_RPC_ERROR_CODES.INTERNAL_ERROR
});
compile({
    message: 'The specified parameter called "portId" with the given value "${portId}" does not identify a port connected to this worker.',
    status: JSON_RPC_ERROR_CODES.INVALID_PARAMS
});

const createAddRecorderAudioWorkletModule = (blobConstructor, urlConstructor, worklet) => {
    return async (addAudioWorkletModule) => {
        const blob = new blobConstructor([worklet], { type: 'application/javascript; charset=utf-8' });
        const url = urlConstructor.createObjectURL(blob);
        try {
            await addAudioWorkletModule(url);
        }
        finally {
            urlConstructor.revokeObjectURL(url);
        }
    };
};

const createListener = (ongoingRequests) => {
    return ({ data: message }) => {
        const { id } = message;
        if (id !== null) {
            const ongoingRequest = ongoingRequests.get(id);
            if (ongoingRequest !== undefined) {
                const { reject, resolve } = ongoingRequest;
                ongoingRequests.delete(id);
                if (message.error === undefined) {
                    resolve(message.result);
                }
                else {
                    reject(new Error(message.error.message));
                }
            }
        }
    };
};

const createPostMessageFactory = (generateUniqueNumber) => {
    return (ongoingRequests, port) => {
        return (message, transferables = []) => {
            return new Promise((resolve, reject) => {
                const id = generateUniqueNumber(ongoingRequests);
                ongoingRequests.set(id, { reject, resolve });
                port.postMessage({ id, ...message }, transferables);
            });
        };
    };
};

const createRecorderAudioWorkletNodeFactory = (createListener, createPostMessage, on, validateState) => {
    return (audioWorkletNodeConstructor, context, options = {}) => {
        const audioWorkletNode = new audioWorkletNodeConstructor(context, 'recorder-audio-worklet-processor', {
            ...options,
            channelCountMode: 'explicit',
            numberOfInputs: 1,
            numberOfOutputs: 0
        });
        const ongoingRequests = new Map();
        const postMessage = createPostMessage(ongoingRequests, audioWorkletNode.port);
        const unsubscribe = on(audioWorkletNode.port, 'message')(createListener(ongoingRequests));
        audioWorkletNode.port.start();
        let state = 'inactive';
        Object.defineProperties(audioWorkletNode, {
            pause: {
                get() {
                    return async () => {
                        validateState(['recording'], state);
                        state = 'paused';
                        return postMessage({
                            method: 'pause'
                        });
                    };
                }
            },
            port: {
                get() {
                    throw new Error("The port of a RecorderAudioWorkletNode can't be accessed.");
                }
            },
            record: {
                get() {
                    return async (encoderPort) => {
                        validateState(['inactive'], state);
                        state = 'recording';
                        return postMessage({
                            method: 'record',
                            params: { encoderPort }
                        }, [encoderPort]);
                    };
                }
            },
            resume: {
                get() {
                    return async () => {
                        validateState(['paused'], state);
                        state = 'recording';
                        return postMessage({
                            method: 'resume'
                        });
                    };
                }
            },
            stop: {
                get() {
                    return async () => {
                        validateState(['paused', 'recording'], state);
                        state = 'stopped';
                        try {
                            await postMessage({ method: 'stop' });
                        }
                        finally {
                            unsubscribe();
                        }
                    };
                }
            }
        });
        return audioWorkletNode;
    };
};

const validateState = (expectedStates, currentState) => {
    if (!expectedStates.includes(currentState)) {
        throw new Error(`Expected the state to be ${expectedStates
            .map((expectedState) => `"${expectedState}"`)
            .join(' or ')} but it was "${currentState}".`);
    }
};

// This is the minified and stringified code of the recorder-audio-worklet-processor package.
const worklet = `(()=>{"use strict";class e extends AudioWorkletProcessor{constructor(){super(),this._encoderPort=null,this._numberOfChannels=0,this._state="inactive",this.port.onmessage=e=>{let{data:t}=e;"pause"===t.method?"active"===this._state||"recording"===this._state?(this._state="paused",this._sendAcknowledgement(t.id)):this._sendUnexpectedStateError(t.id):"record"===t.method?"inactive"===this._state?(this._encoderPort=t.params.encoderPort,this._state="active",this._sendAcknowledgement(t.id)):this._sendUnexpectedStateError(t.id):"resume"===t.method?"paused"===this._state?(this._state="active",this._sendAcknowledgement(t.id)):this._sendUnexpectedStateError(t.id):"stop"===t.method?"active"!==this._state&&"paused"!==this._state&&"recording"!==this._state||null===this._encoderPort?this._sendUnexpectedStateError(t.id):(this._stop(this._encoderPort),this._sendAcknowledgement(t.id)):"number"==typeof t.id&&this.port.postMessage({error:{code:-32601,message:"The requested method is not supported."},id:t.id})}}process(e){let[t]=e;if("inactive"===this._state||"paused"===this._state)return!0;if("active"===this._state){if(void 0===t)throw new Error("No channelData was received for the first input.");if(0===t.length)return!0;this._state="recording"}if("recording"===this._state&&null!==this._encoderPort){if(void 0===t)throw new Error("No channelData was received for the first input.");return 0===t.length?this._encoderPort.postMessage(Array.from({length:this._numberOfChannels},(()=>128))):(this._encoderPort.postMessage(t,t.map((e=>{let{buffer:t}=e;return t}))),this._numberOfChannels=t.length),!0}return!1}_sendAcknowledgement(e){this.port.postMessage({id:e,result:null})}_sendUnexpectedStateError(e){this.port.postMessage({error:{code:-32603,message:"The internal state does not allow to process the given message."},id:e})}_stop(e){e.postMessage([]),e.close(),this._encoderPort=null,this._state="stopped"}}e.parameterDescriptors=[],registerProcessor("recorder-audio-worklet-processor",e)})();`; // tslint:disable-line:max-line-length

const addRecorderAudioWorkletModule = createAddRecorderAudioWorkletModule(Blob, URL, worklet);
const createRecorderAudioWorkletNode = createRecorderAudioWorkletNodeFactory(createListener, createPostMessageFactory(generateUniqueNumber), on, validateState);

const createExtendedExponentialRampToValueAutomationEvent = (value, endTime, insertTime) => {
    return { endTime, insertTime, type: 'exponentialRampToValue', value };
};

const createExtendedLinearRampToValueAutomationEvent = (value, endTime, insertTime) => {
    return { endTime, insertTime, type: 'linearRampToValue', value };
};

const createSetValueAutomationEvent = (value, startTime) => {
    return { startTime, type: 'setValue', value };
};

const createSetValueCurveAutomationEvent = (values, startTime, duration) => {
    return { duration, startTime, type: 'setValueCurve', values };
};

const getTargetValueAtTime = (time, valueAtStartTime, { startTime, target, timeConstant }) => {
    return target + (valueAtStartTime - target) * Math.exp((startTime - time) / timeConstant);
};

const isExponentialRampToValueAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'exponentialRampToValue';
};

const isLinearRampToValueAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'linearRampToValue';
};

const isAnyRampToValueAutomationEvent = (automationEvent) => {
    return isExponentialRampToValueAutomationEvent(automationEvent) || isLinearRampToValueAutomationEvent(automationEvent);
};

const isSetValueAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'setValue';
};

const isSetValueCurveAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'setValueCurve';
};

const getValueOfAutomationEventAtIndexAtTime = (automationEvents, index, time, defaultValue) => {
    const automationEvent = automationEvents[index];
    return automationEvent === undefined
        ? defaultValue
        : isAnyRampToValueAutomationEvent(automationEvent) || isSetValueAutomationEvent(automationEvent)
            ? automationEvent.value
            : isSetValueCurveAutomationEvent(automationEvent)
                ? automationEvent.values[automationEvent.values.length - 1]
                : getTargetValueAtTime(time, getValueOfAutomationEventAtIndexAtTime(automationEvents, index - 1, automationEvent.startTime, defaultValue), automationEvent);
};

const getEndTimeAndValueOfPreviousAutomationEvent = (automationEvents, index, currentAutomationEvent, nextAutomationEvent, defaultValue) => {
    return currentAutomationEvent === undefined
        ? [nextAutomationEvent.insertTime, defaultValue]
        : isAnyRampToValueAutomationEvent(currentAutomationEvent)
            ? [currentAutomationEvent.endTime, currentAutomationEvent.value]
            : isSetValueAutomationEvent(currentAutomationEvent)
                ? [currentAutomationEvent.startTime, currentAutomationEvent.value]
                : isSetValueCurveAutomationEvent(currentAutomationEvent)
                    ? [
                        currentAutomationEvent.startTime + currentAutomationEvent.duration,
                        currentAutomationEvent.values[currentAutomationEvent.values.length - 1]
                    ]
                    : [
                        currentAutomationEvent.startTime,
                        getValueOfAutomationEventAtIndexAtTime(automationEvents, index - 1, currentAutomationEvent.startTime, defaultValue)
                    ];
};

const isCancelAndHoldAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'cancelAndHold';
};

const isCancelScheduledValuesAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'cancelScheduledValues';
};

const getEventTime = (automationEvent) => {
    if (isCancelAndHoldAutomationEvent(automationEvent) || isCancelScheduledValuesAutomationEvent(automationEvent)) {
        return automationEvent.cancelTime;
    }
    if (isExponentialRampToValueAutomationEvent(automationEvent) || isLinearRampToValueAutomationEvent(automationEvent)) {
        return automationEvent.endTime;
    }
    return automationEvent.startTime;
};

const getExponentialRampValueAtTime = (time, startTime, valueAtStartTime, { endTime, value }) => {
    if (valueAtStartTime === value) {
        return value;
    }
    if ((0 < valueAtStartTime && 0 < value) || (valueAtStartTime < 0 && value < 0)) {
        return valueAtStartTime * (value / valueAtStartTime) ** ((time - startTime) / (endTime - startTime));
    }
    return 0;
};

const getLinearRampValueAtTime = (time, startTime, valueAtStartTime, { endTime, value }) => {
    return valueAtStartTime + ((time - startTime) / (endTime - startTime)) * (value - valueAtStartTime);
};

const interpolateValue = (values, theoreticIndex) => {
    const lowerIndex = Math.floor(theoreticIndex);
    const upperIndex = Math.ceil(theoreticIndex);
    if (lowerIndex === upperIndex) {
        return values[lowerIndex];
    }
    return (1 - (theoreticIndex - lowerIndex)) * values[lowerIndex] + (1 - (upperIndex - theoreticIndex)) * values[upperIndex];
};

const getValueCurveValueAtTime = (time, { duration, startTime, values }) => {
    const theoreticIndex = ((time - startTime) / duration) * (values.length - 1);
    return interpolateValue(values, theoreticIndex);
};

const isSetTargetAutomationEvent = (automationEvent) => {
    return automationEvent.type === 'setTarget';
};

class AutomationEventList {
    constructor(defaultValue) {
        this._automationEvents = [];
        this._currenTime = 0;
        this._defaultValue = defaultValue;
    }
    [Symbol.iterator]() {
        return this._automationEvents[Symbol.iterator]();
    }
    add(automationEvent) {
        const eventTime = getEventTime(automationEvent);
        if (isCancelAndHoldAutomationEvent(automationEvent) || isCancelScheduledValuesAutomationEvent(automationEvent)) {
            const index = this._automationEvents.findIndex((currentAutomationEvent) => {
                if (isCancelScheduledValuesAutomationEvent(automationEvent) && isSetValueCurveAutomationEvent(currentAutomationEvent)) {
                    return currentAutomationEvent.startTime + currentAutomationEvent.duration >= eventTime;
                }
                return getEventTime(currentAutomationEvent) >= eventTime;
            });
            const removedAutomationEvent = this._automationEvents[index];
            if (index !== -1) {
                this._automationEvents = this._automationEvents.slice(0, index);
            }
            if (isCancelAndHoldAutomationEvent(automationEvent)) {
                const lastAutomationEvent = this._automationEvents[this._automationEvents.length - 1];
                if (removedAutomationEvent !== undefined && isAnyRampToValueAutomationEvent(removedAutomationEvent)) {
                    if (lastAutomationEvent !== undefined && isSetTargetAutomationEvent(lastAutomationEvent)) {
                        throw new Error('The internal list is malformed.');
                    }
                    const startTime = lastAutomationEvent === undefined
                        ? removedAutomationEvent.insertTime
                        : isSetValueCurveAutomationEvent(lastAutomationEvent)
                            ? lastAutomationEvent.startTime + lastAutomationEvent.duration
                            : getEventTime(lastAutomationEvent);
                    const startValue = lastAutomationEvent === undefined
                        ? this._defaultValue
                        : isSetValueCurveAutomationEvent(lastAutomationEvent)
                            ? lastAutomationEvent.values[lastAutomationEvent.values.length - 1]
                            : lastAutomationEvent.value;
                    const value = isExponentialRampToValueAutomationEvent(removedAutomationEvent)
                        ? getExponentialRampValueAtTime(eventTime, startTime, startValue, removedAutomationEvent)
                        : getLinearRampValueAtTime(eventTime, startTime, startValue, removedAutomationEvent);
                    const truncatedAutomationEvent = isExponentialRampToValueAutomationEvent(removedAutomationEvent)
                        ? createExtendedExponentialRampToValueAutomationEvent(value, eventTime, this._currenTime)
                        : createExtendedLinearRampToValueAutomationEvent(value, eventTime, this._currenTime);
                    this._automationEvents.push(truncatedAutomationEvent);
                }
                if (lastAutomationEvent !== undefined && isSetTargetAutomationEvent(lastAutomationEvent)) {
                    this._automationEvents.push(createSetValueAutomationEvent(this.getValue(eventTime), eventTime));
                }
                if (lastAutomationEvent !== undefined &&
                    isSetValueCurveAutomationEvent(lastAutomationEvent) &&
                    lastAutomationEvent.startTime + lastAutomationEvent.duration > eventTime) {
                    const duration = eventTime - lastAutomationEvent.startTime;
                    const ratio = (lastAutomationEvent.values.length - 1) / lastAutomationEvent.duration;
                    const length = Math.max(2, 1 + Math.ceil(duration * ratio));
                    const fraction = (duration / (length - 1)) * ratio;
                    const values = lastAutomationEvent.values.slice(0, length);
                    if (fraction < 1) {
                        for (let i = 1; i < length; i += 1) {
                            const factor = (fraction * i) % 1;
                            values[i] = lastAutomationEvent.values[i - 1] * (1 - factor) + lastAutomationEvent.values[i] * factor;
                        }
                    }
                    this._automationEvents[this._automationEvents.length - 1] = createSetValueCurveAutomationEvent(values, lastAutomationEvent.startTime, duration);
                }
            }
        }
        else {
            const index = this._automationEvents.findIndex((currentAutomationEvent) => getEventTime(currentAutomationEvent) > eventTime);
            const previousAutomationEvent = index === -1 ? this._automationEvents[this._automationEvents.length - 1] : this._automationEvents[index - 1];
            if (previousAutomationEvent !== undefined &&
                isSetValueCurveAutomationEvent(previousAutomationEvent) &&
                getEventTime(previousAutomationEvent) + previousAutomationEvent.duration > eventTime) {
                return false;
            }
            const persistentAutomationEvent = isExponentialRampToValueAutomationEvent(automationEvent)
                ? createExtendedExponentialRampToValueAutomationEvent(automationEvent.value, automationEvent.endTime, this._currenTime)
                : isLinearRampToValueAutomationEvent(automationEvent)
                    ? createExtendedLinearRampToValueAutomationEvent(automationEvent.value, eventTime, this._currenTime)
                    : automationEvent;
            if (index === -1) {
                this._automationEvents.push(persistentAutomationEvent);
            }
            else {
                if (isSetValueCurveAutomationEvent(automationEvent) &&
                    eventTime + automationEvent.duration > getEventTime(this._automationEvents[index])) {
                    return false;
                }
                this._automationEvents.splice(index, 0, persistentAutomationEvent);
            }
        }
        return true;
    }
    flush(time) {
        const index = this._automationEvents.findIndex((currentAutomationEvent) => getEventTime(currentAutomationEvent) > time);
        if (index > 1) {
            const remainingAutomationEvents = this._automationEvents.slice(index - 1);
            const firstRemainingAutomationEvent = remainingAutomationEvents[0];
            if (isSetTargetAutomationEvent(firstRemainingAutomationEvent)) {
                remainingAutomationEvents.unshift(createSetValueAutomationEvent(getValueOfAutomationEventAtIndexAtTime(this._automationEvents, index - 2, firstRemainingAutomationEvent.startTime, this._defaultValue), firstRemainingAutomationEvent.startTime));
            }
            this._automationEvents = remainingAutomationEvents;
        }
    }
    getValue(time) {
        if (this._automationEvents.length === 0) {
            return this._defaultValue;
        }
        const indexOfNextEvent = this._automationEvents.findIndex((automationEvent) => getEventTime(automationEvent) > time);
        const nextAutomationEvent = this._automationEvents[indexOfNextEvent];
        const indexOfCurrentEvent = (indexOfNextEvent === -1 ? this._automationEvents.length : indexOfNextEvent) - 1;
        const currentAutomationEvent = this._automationEvents[indexOfCurrentEvent];
        if (currentAutomationEvent !== undefined &&
            isSetTargetAutomationEvent(currentAutomationEvent) &&
            (nextAutomationEvent === undefined ||
                !isAnyRampToValueAutomationEvent(nextAutomationEvent) ||
                nextAutomationEvent.insertTime > time)) {
            return getTargetValueAtTime(time, getValueOfAutomationEventAtIndexAtTime(this._automationEvents, indexOfCurrentEvent - 1, currentAutomationEvent.startTime, this._defaultValue), currentAutomationEvent);
        }
        if (currentAutomationEvent !== undefined &&
            isSetValueAutomationEvent(currentAutomationEvent) &&
            (nextAutomationEvent === undefined || !isAnyRampToValueAutomationEvent(nextAutomationEvent))) {
            return currentAutomationEvent.value;
        }
        if (currentAutomationEvent !== undefined &&
            isSetValueCurveAutomationEvent(currentAutomationEvent) &&
            (nextAutomationEvent === undefined ||
                !isAnyRampToValueAutomationEvent(nextAutomationEvent) ||
                currentAutomationEvent.startTime + currentAutomationEvent.duration > time)) {
            if (time < currentAutomationEvent.startTime + currentAutomationEvent.duration) {
                return getValueCurveValueAtTime(time, currentAutomationEvent);
            }
            return currentAutomationEvent.values[currentAutomationEvent.values.length - 1];
        }
        if (currentAutomationEvent !== undefined &&
            isAnyRampToValueAutomationEvent(currentAutomationEvent) &&
            (nextAutomationEvent === undefined || !isAnyRampToValueAutomationEvent(nextAutomationEvent))) {
            return currentAutomationEvent.value;
        }
        if (nextAutomationEvent !== undefined && isExponentialRampToValueAutomationEvent(nextAutomationEvent)) {
            const [startTime, value] = getEndTimeAndValueOfPreviousAutomationEvent(this._automationEvents, indexOfCurrentEvent, currentAutomationEvent, nextAutomationEvent, this._defaultValue);
            return getExponentialRampValueAtTime(time, startTime, value, nextAutomationEvent);
        }
        if (nextAutomationEvent !== undefined && isLinearRampToValueAutomationEvent(nextAutomationEvent)) {
            const [startTime, value] = getEndTimeAndValueOfPreviousAutomationEvent(this._automationEvents, indexOfCurrentEvent, currentAutomationEvent, nextAutomationEvent, this._defaultValue);
            return getLinearRampValueAtTime(time, startTime, value, nextAutomationEvent);
        }
        return this._defaultValue;
    }
}

const createCancelAndHoldAutomationEvent = (cancelTime) => {
    return { cancelTime, type: 'cancelAndHold' };
};

const createCancelScheduledValuesAutomationEvent = (cancelTime) => {
    return { cancelTime, type: 'cancelScheduledValues' };
};

const createExponentialRampToValueAutomationEvent = (value, endTime) => {
    return { endTime, type: 'exponentialRampToValue', value };
};

const createLinearRampToValueAutomationEvent = (value, endTime) => {
    return { endTime, type: 'linearRampToValue', value };
};

const createSetTargetAutomationEvent = (target, startTime, timeConstant) => {
    return { startTime, target, timeConstant, type: 'setTarget' };
};

const createAbortError = () => new DOMException('', 'AbortError');

const createAddActiveInputConnectionToAudioNode = (insertElementInSet) => {
    return (activeInputs, source, [output, input, eventListener], ignoreDuplicates) => {
        insertElementInSet(activeInputs[input], [source, output, eventListener], (activeInputConnection) => activeInputConnection[0] === source && activeInputConnection[1] === output, ignoreDuplicates);
    };
};

const createAddAudioNodeConnections = (audioNodeConnectionsStore) => {
    return (audioNode, audioNodeRenderer, nativeAudioNode) => {
        const activeInputs = [];
        for (let i = 0; i < nativeAudioNode.numberOfInputs; i += 1) {
            activeInputs.push(new Set());
        }
        audioNodeConnectionsStore.set(audioNode, {
            activeInputs,
            outputs: new Set(),
            passiveInputs: new WeakMap(),
            renderer: audioNodeRenderer
        });
    };
};

const createAddAudioParamConnections = (audioParamConnectionsStore) => {
    return (audioParam, audioParamRenderer) => {
        audioParamConnectionsStore.set(audioParam, { activeInputs: new Set(), passiveInputs: new WeakMap(), renderer: audioParamRenderer });
    };
};

const ACTIVE_AUDIO_NODE_STORE = new WeakSet();
const AUDIO_NODE_CONNECTIONS_STORE = new WeakMap();
const AUDIO_NODE_STORE = new WeakMap();
const AUDIO_PARAM_CONNECTIONS_STORE = new WeakMap();
const AUDIO_PARAM_STORE = new WeakMap();
const CONTEXT_STORE = new WeakMap();
const EVENT_LISTENERS = new WeakMap();
const CYCLE_COUNTERS = new WeakMap();
// This clunky name is borrowed from the spec. :-)
const NODE_NAME_TO_PROCESSOR_CONSTRUCTOR_MAPS = new WeakMap();
const NODE_TO_PROCESSOR_MAPS = new WeakMap();

const handler = {
    construct() {
        return handler;
    }
};
const isConstructible = (constructible) => {
    try {
        const proxy = new Proxy(constructible, handler);
        new proxy(); // tslint:disable-line:no-unused-expression
    }
    catch {
        return false;
    }
    return true;
};

/*
 * This massive regex tries to cover all the following cases.
 *
 * import './path';
 * import defaultImport from './path';
 * import { namedImport } from './path';
 * import { namedImport as renamendImport } from './path';
 * import * as namespaceImport from './path';
 * import defaultImport, { namedImport } from './path';
 * import defaultImport, { namedImport as renamendImport } from './path';
 * import defaultImport, * as namespaceImport from './path';
 */
const IMPORT_STATEMENT_REGEX = /^import(?:(?:[\s]+[\w]+|(?:[\s]+[\w]+[\s]*,)?[\s]*\{[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?(?:[\s]*,[\s]*[\w]+(?:[\s]+as[\s]+[\w]+)?)*[\s]*}|(?:[\s]+[\w]+[\s]*,)?[\s]*\*[\s]+as[\s]+[\w]+)[\s]+from)?(?:[\s]*)("([^"\\]|\\.)+"|'([^'\\]|\\.)+')(?:[\s]*);?/; // tslint:disable-line:max-line-length
const splitImportStatements = (source, url) => {
    const importStatements = [];
    let sourceWithoutImportStatements = source.replace(/^[\s]+/, '');
    let result = sourceWithoutImportStatements.match(IMPORT_STATEMENT_REGEX);
    while (result !== null) {
        const unresolvedUrl = result[1].slice(1, -1);
        const importStatementWithResolvedUrl = result[0]
            .replace(/([\s]+)?;?$/, '')
            .replace(unresolvedUrl, new URL(unresolvedUrl, url).toString());
        importStatements.push(importStatementWithResolvedUrl);
        sourceWithoutImportStatements = sourceWithoutImportStatements.slice(result[0].length).replace(/^[\s]+/, '');
        result = sourceWithoutImportStatements.match(IMPORT_STATEMENT_REGEX);
    }
    return [importStatements.join(';'), sourceWithoutImportStatements];
};

const verifyParameterDescriptors = (parameterDescriptors) => {
    if (parameterDescriptors !== undefined && !Array.isArray(parameterDescriptors)) {
        throw new TypeError('The parameterDescriptors property of given value for processorCtor is not an array.');
    }
};
const verifyProcessorCtor = (processorCtor) => {
    if (!isConstructible(processorCtor)) {
        throw new TypeError('The given value for processorCtor should be a constructor.');
    }
    if (processorCtor.prototype === null || typeof processorCtor.prototype !== 'object') {
        throw new TypeError('The given value for processorCtor should have a prototype.');
    }
};
const createAddAudioWorkletModule = (cacheTestResult, createNotSupportedError, evaluateSource, exposeCurrentFrameAndCurrentTime, fetchSource, getNativeContext, getOrCreateBackupOfflineAudioContext, isNativeOfflineAudioContext, nativeAudioWorkletNodeConstructor, ongoingRequests, resolvedRequests, testAudioWorkletProcessorPostMessageSupport, window) => {
    let index = 0;
    return (context, moduleURL, options = { credentials: 'omit' }) => {
        const resolvedRequestsOfContext = resolvedRequests.get(context);
        if (resolvedRequestsOfContext !== undefined && resolvedRequestsOfContext.has(moduleURL)) {
            return Promise.resolve();
        }
        const ongoingRequestsOfContext = ongoingRequests.get(context);
        if (ongoingRequestsOfContext !== undefined) {
            const promiseOfOngoingRequest = ongoingRequestsOfContext.get(moduleURL);
            if (promiseOfOngoingRequest !== undefined) {
                return promiseOfOngoingRequest;
            }
        }
        const nativeContext = getNativeContext(context);
        // Bug #59: Safari does not implement the audioWorklet property.
        const promise = nativeContext.audioWorklet === undefined
            ? fetchSource(moduleURL)
                .then(([source, absoluteUrl]) => {
                const [importStatements, sourceWithoutImportStatements] = splitImportStatements(source, absoluteUrl);
                /*
                 * This is the unminified version of the code used below:
                 *
                 * ```js
                 * ${ importStatements };
                 * ((a, b) => {
                 *     (a[b] = a[b] || [ ]).push(
                 *         (AudioWorkletProcessor, global, registerProcessor, sampleRate, self, window) => {
                 *             ${ sourceWithoutImportStatements }
                 *         }
                 *     );
                 * })(window, '_AWGS');
                 * ```
                 */
                // tslint:disable-next-line:max-line-length
                const wrappedSource = `${importStatements};((a,b)=>{(a[b]=a[b]||[]).push((AudioWorkletProcessor,global,registerProcessor,sampleRate,self,window)=>{${sourceWithoutImportStatements}
})})(window,'_AWGS')`;
                // @todo Evaluating the given source code is a possible security problem.
                return evaluateSource(wrappedSource);
            })
                .then(() => {
                const evaluateAudioWorkletGlobalScope = window._AWGS.pop();
                if (evaluateAudioWorkletGlobalScope === undefined) {
                    // Bug #182 Chrome and Edge do throw an instance of a SyntaxError instead of a DOMException.
                    throw new SyntaxError();
                }
                exposeCurrentFrameAndCurrentTime(nativeContext.currentTime, nativeContext.sampleRate, () => evaluateAudioWorkletGlobalScope(class AudioWorkletProcessor {
                }, undefined, (name, processorCtor) => {
                    if (name.trim() === '') {
                        throw createNotSupportedError();
                    }
                    const nodeNameToProcessorConstructorMap = NODE_NAME_TO_PROCESSOR_CONSTRUCTOR_MAPS.get(nativeContext);
                    if (nodeNameToProcessorConstructorMap !== undefined) {
                        if (nodeNameToProcessorConstructorMap.has(name)) {
                            throw createNotSupportedError();
                        }
                        verifyProcessorCtor(processorCtor);
                        verifyParameterDescriptors(processorCtor.parameterDescriptors);
                        nodeNameToProcessorConstructorMap.set(name, processorCtor);
                    }
                    else {
                        verifyProcessorCtor(processorCtor);
                        verifyParameterDescriptors(processorCtor.parameterDescriptors);
                        NODE_NAME_TO_PROCESSOR_CONSTRUCTOR_MAPS.set(nativeContext, new Map([[name, processorCtor]]));
                    }
                }, nativeContext.sampleRate, undefined, undefined));
            })
            : Promise.all([
                fetchSource(moduleURL),
                Promise.resolve(cacheTestResult(testAudioWorkletProcessorPostMessageSupport, testAudioWorkletProcessorPostMessageSupport))
            ]).then(([[source, absoluteUrl], isSupportingPostMessage]) => {
                const currentIndex = index + 1;
                index = currentIndex;
                const [importStatements, sourceWithoutImportStatements] = splitImportStatements(source, absoluteUrl);
                /*
                 * Bug #179: Firefox does not allow to transfer any buffer which has been passed to the process() method as an argument.
                 *
                 * This is the unminified version of the code used below.
                 *
                 * ```js
                 * class extends AudioWorkletProcessor {
                 *
                 *     __buffers = new WeakSet();
                 *
                 *     constructor () {
                 *         super();
                 *
                 *         this.port.postMessage = ((postMessage) => {
                 *             return (message, transferables) => {
                 *                 const filteredTransferables = (transferables)
                 *                     ? transferables.filter((transferable) => !this.__buffers.has(transferable))
                 *                     : transferables;
                 *
                 *                 return postMessage.call(this.port, message, filteredTransferables);
                 *              };
                 *         })(this.port.postMessage);
                 *     }
                 * }
                 * ```
                 */
                const patchedAudioWorkletProcessor = isSupportingPostMessage
                    ? 'AudioWorkletProcessor'
                    : 'class extends AudioWorkletProcessor {__b=new WeakSet();constructor(){super();(p=>p.postMessage=(q=>(m,t)=>q.call(p,m,t?t.filter(u=>!this.__b.has(u)):t))(p.postMessage))(this.port)}}';
                /*
                 * Bug #170: Chrome and Edge do call process() with an array with empty channelData for each input if no input is connected.
                 *
                 * Bug #179: Firefox does not allow to transfer any buffer which has been passed to the process() method as an argument.
                 *
                 * Bug #190: Safari doesn't throw an error when loading an unparsable module.
                 *
                 * This is the unminified version of the code used below:
                 *
                 * ```js
                 * `${ importStatements };
                 * ((AudioWorkletProcessor, registerProcessor) => {${ sourceWithoutImportStatements }
                 * })(
                 *     ${ patchedAudioWorkletProcessor },
                 *     (name, processorCtor) => registerProcessor(name, class extends processorCtor {
                 *
                 *         __collectBuffers = (array) => {
                 *             array.forEach((element) => this.__buffers.add(element.buffer));
                 *         };
                 *
                 *         process (inputs, outputs, parameters) {
                 *             inputs.forEach(this.__collectBuffers);
                 *             outputs.forEach(this.__collectBuffers);
                 *             this.__collectBuffers(Object.values(parameters));
                 *
                 *             return super.process(
                 *                 (inputs.map((input) => input.some((channelData) => channelData.length === 0)) ? [ ] : input),
                 *                 outputs,
                 *                 parameters
                 *             );
                 *         }
                 *
                 *     })
                 * );
                 *
                 * registerProcessor(`__sac${currentIndex}`, class extends AudioWorkletProcessor{
                 *
                 *     process () {
                 *         return false;
                 *     }
                 *
                 * })`
                 * ```
                 */
                const memberDefinition = isSupportingPostMessage ? '' : '__c = (a) => a.forEach(e=>this.__b.add(e.buffer));';
                const bufferRegistration = isSupportingPostMessage
                    ? ''
                    : 'i.forEach(this.__c);o.forEach(this.__c);this.__c(Object.values(p));';
                const wrappedSource = `${importStatements};((AudioWorkletProcessor,registerProcessor)=>{${sourceWithoutImportStatements}
})(${patchedAudioWorkletProcessor},(n,p)=>registerProcessor(n,class extends p{${memberDefinition}process(i,o,p){${bufferRegistration}return super.process(i.map(j=>j.some(k=>k.length===0)?[]:j),o,p)}}));registerProcessor('__sac${currentIndex}',class extends AudioWorkletProcessor{process(){return !1}})`;
                const blob = new Blob([wrappedSource], { type: 'application/javascript; charset=utf-8' });
                const url = URL.createObjectURL(blob);
                return nativeContext.audioWorklet
                    .addModule(url, options)
                    .then(() => {
                    if (isNativeOfflineAudioContext(nativeContext)) {
                        return nativeContext;
                    }
                    // Bug #186: Chrome and Edge do not allow to create an AudioWorkletNode on a closed AudioContext.
                    const backupOfflineAudioContext = getOrCreateBackupOfflineAudioContext(nativeContext);
                    return backupOfflineAudioContext.audioWorklet.addModule(url, options).then(() => backupOfflineAudioContext);
                })
                    .then((nativeContextOrBackupOfflineAudioContext) => {
                    if (nativeAudioWorkletNodeConstructor === null) {
                        throw new SyntaxError();
                    }
                    try {
                        // Bug #190: Safari doesn't throw an error when loading an unparsable module.
                        new nativeAudioWorkletNodeConstructor(nativeContextOrBackupOfflineAudioContext, `__sac${currentIndex}`); // tslint:disable-line:no-unused-expression
                    }
                    catch {
                        throw new SyntaxError();
                    }
                })
                    .finally(() => URL.revokeObjectURL(url));
            });
        if (ongoingRequestsOfContext === undefined) {
            ongoingRequests.set(context, new Map([[moduleURL, promise]]));
        }
        else {
            ongoingRequestsOfContext.set(moduleURL, promise);
        }
        promise
            .then(() => {
            const updatedResolvedRequestsOfContext = resolvedRequests.get(context);
            if (updatedResolvedRequestsOfContext === undefined) {
                resolvedRequests.set(context, new Set([moduleURL]));
            }
            else {
                updatedResolvedRequestsOfContext.add(moduleURL);
            }
        })
            .finally(() => {
            const updatedOngoingRequestsOfContext = ongoingRequests.get(context);
            if (updatedOngoingRequestsOfContext !== undefined) {
                updatedOngoingRequestsOfContext.delete(moduleURL);
            }
        });
        return promise;
    };
};

const getValueForKey = (map, key) => {
    const value = map.get(key);
    if (value === undefined) {
        throw new Error('A value with the given key could not be found.');
    }
    return value;
};

const pickElementFromSet = (set, predicate) => {
    const matchingElements = Array.from(set).filter(predicate);
    if (matchingElements.length > 1) {
        throw Error('More than one element was found.');
    }
    if (matchingElements.length === 0) {
        throw Error('No element was found.');
    }
    const [matchingElement] = matchingElements;
    set.delete(matchingElement);
    return matchingElement;
};

const deletePassiveInputConnectionToAudioNode = (passiveInputs, source, output, input) => {
    const passiveInputConnections = getValueForKey(passiveInputs, source);
    const matchingConnection = pickElementFromSet(passiveInputConnections, (passiveInputConnection) => passiveInputConnection[0] === output && passiveInputConnection[1] === input);
    if (passiveInputConnections.size === 0) {
        passiveInputs.delete(source);
    }
    return matchingConnection;
};

const getEventListenersOfAudioNode = (audioNode) => {
    return getValueForKey(EVENT_LISTENERS, audioNode);
};

const setInternalStateToActive = (audioNode) => {
    if (ACTIVE_AUDIO_NODE_STORE.has(audioNode)) {
        throw new Error('The AudioNode is already stored.');
    }
    ACTIVE_AUDIO_NODE_STORE.add(audioNode);
    getEventListenersOfAudioNode(audioNode).forEach((eventListener) => eventListener(true));
};

const isAudioWorkletNode = (audioNode) => {
    return 'port' in audioNode;
};

const setInternalStateToPassive = (audioNode) => {
    if (!ACTIVE_AUDIO_NODE_STORE.has(audioNode)) {
        throw new Error('The AudioNode is not stored.');
    }
    ACTIVE_AUDIO_NODE_STORE.delete(audioNode);
    getEventListenersOfAudioNode(audioNode).forEach((eventListener) => eventListener(false));
};

// Set the internalState of the audioNode to 'passive' if it is not an AudioWorkletNode and if it has no 'active' input connections.
const setInternalStateToPassiveWhenNecessary = (audioNode, activeInputs) => {
    if (!isAudioWorkletNode(audioNode) && activeInputs.every((connections) => connections.size === 0)) {
        setInternalStateToPassive(audioNode);
    }
};

const createAddConnectionToAudioNode = (addActiveInputConnectionToAudioNode, addPassiveInputConnectionToAudioNode, connectNativeAudioNodeToNativeAudioNode, deleteActiveInputConnectionToAudioNode, disconnectNativeAudioNodeFromNativeAudioNode, getAudioNodeConnections, getAudioNodeTailTime, getEventListenersOfAudioNode, getNativeAudioNode, insertElementInSet, isActiveAudioNode, isPartOfACycle, isPassiveAudioNode) => {
    const tailTimeTimeoutIds = new WeakMap();
    return (source, destination, output, input, isOffline) => {
        const { activeInputs, passiveInputs } = getAudioNodeConnections(destination);
        const { outputs } = getAudioNodeConnections(source);
        const eventListeners = getEventListenersOfAudioNode(source);
        const eventListener = (isActive) => {
            const nativeDestinationAudioNode = getNativeAudioNode(destination);
            const nativeSourceAudioNode = getNativeAudioNode(source);
            if (isActive) {
                const partialConnection = deletePassiveInputConnectionToAudioNode(passiveInputs, source, output, input);
                addActiveInputConnectionToAudioNode(activeInputs, source, partialConnection, false);
                if (!isOffline && !isPartOfACycle(source)) {
                    connectNativeAudioNodeToNativeAudioNode(nativeSourceAudioNode, nativeDestinationAudioNode, output, input);
                }
                if (isPassiveAudioNode(destination)) {
                    setInternalStateToActive(destination);
                }
            }
            else {
                const partialConnection = deleteActiveInputConnectionToAudioNode(activeInputs, source, output, input);
                addPassiveInputConnectionToAudioNode(passiveInputs, input, partialConnection, false);
                if (!isOffline && !isPartOfACycle(source)) {
                    disconnectNativeAudioNodeFromNativeAudioNode(nativeSourceAudioNode, nativeDestinationAudioNode, output, input);
                }
                const tailTime = getAudioNodeTailTime(destination);
                if (tailTime === 0) {
                    if (isActiveAudioNode(destination)) {
                        setInternalStateToPassiveWhenNecessary(destination, activeInputs);
                    }
                }
                else {
                    const tailTimeTimeoutId = tailTimeTimeoutIds.get(destination);
                    if (tailTimeTimeoutId !== undefined) {
                        clearTimeout(tailTimeTimeoutId);
                    }
                    tailTimeTimeoutIds.set(destination, setTimeout(() => {
                        if (isActiveAudioNode(destination)) {
                            setInternalStateToPassiveWhenNecessary(destination, activeInputs);
                        }
                    }, tailTime * 1000));
                }
            }
        };
        if (insertElementInSet(outputs, [destination, output, input], (outputConnection) => outputConnection[0] === destination && outputConnection[1] === output && outputConnection[2] === input, true)) {
            eventListeners.add(eventListener);
            if (isActiveAudioNode(source)) {
                addActiveInputConnectionToAudioNode(activeInputs, source, [output, input, eventListener], true);
            }
            else {
                addPassiveInputConnectionToAudioNode(passiveInputs, input, [source, output, eventListener], true);
            }
            return true;
        }
        return false;
    };
};

const createAddPassiveInputConnectionToAudioNode = (insertElementInSet) => {
    return (passiveInputs, input, [source, output, eventListener], ignoreDuplicates) => {
        const passiveInputConnections = passiveInputs.get(source);
        if (passiveInputConnections === undefined) {
            passiveInputs.set(source, new Set([[output, input, eventListener]]));
        }
        else {
            insertElementInSet(passiveInputConnections, [output, input, eventListener], (passiveInputConnection) => passiveInputConnection[0] === output && passiveInputConnection[1] === input, ignoreDuplicates);
        }
    };
};

const createAddSilentConnection = (createNativeGainNode) => {
    return (nativeContext, nativeAudioScheduledSourceNode) => {
        const nativeGainNode = createNativeGainNode(nativeContext, {
            channelCount: 1,
            channelCountMode: 'explicit',
            channelInterpretation: 'discrete',
            gain: 0
        });
        nativeAudioScheduledSourceNode.connect(nativeGainNode).connect(nativeContext.destination);
        const disconnect = () => {
            nativeAudioScheduledSourceNode.removeEventListener('ended', disconnect);
            nativeAudioScheduledSourceNode.disconnect(nativeGainNode);
            nativeGainNode.disconnect();
        };
        nativeAudioScheduledSourceNode.addEventListener('ended', disconnect);
    };
};

const createAddUnrenderedAudioWorkletNode = (getUnrenderedAudioWorkletNodes) => {
    return (nativeContext, audioWorkletNode) => {
        getUnrenderedAudioWorkletNodes(nativeContext).add(audioWorkletNode);
    };
};

const isOwnedByContext = (nativeAudioNode, nativeContext) => {
    return nativeAudioNode.context === nativeContext;
};

const testAudioBufferCopyChannelMethodsOutOfBoundsSupport = (nativeAudioBuffer) => {
    try {
        nativeAudioBuffer.copyToChannel(new Float32Array(1), 0, -1);
    }
    catch {
        return false;
    }
    return true;
};

const createIndexSizeError = () => new DOMException('', 'IndexSizeError');

const wrapAudioBufferGetChannelDataMethod = (audioBuffer) => {
    audioBuffer.getChannelData = ((getChannelData) => {
        return (channel) => {
            try {
                return getChannelData.call(audioBuffer, channel);
            }
            catch (err) {
                if (err.code === 12) {
                    throw createIndexSizeError();
                }
                throw err;
            }
        };
    })(audioBuffer.getChannelData);
};

const DEFAULT_OPTIONS$2 = {
    numberOfChannels: 1
};
const createAudioBufferConstructor = (audioBufferStore, cacheTestResult, createNotSupportedError, nativeAudioBufferConstructor, nativeOfflineAudioContextConstructor, testNativeAudioBufferConstructorSupport, wrapAudioBufferCopyChannelMethods, wrapAudioBufferCopyChannelMethodsOutOfBounds) => {
    let nativeOfflineAudioContext = null;
    return class AudioBuffer {
        constructor(options) {
            if (nativeOfflineAudioContextConstructor === null) {
                throw new Error('Missing the native OfflineAudioContext constructor.');
            }
            const { length, numberOfChannels, sampleRate } = { ...DEFAULT_OPTIONS$2, ...options };
            if (nativeOfflineAudioContext === null) {
                nativeOfflineAudioContext = new nativeOfflineAudioContextConstructor(1, 1, 44100);
            }
            /*
             * Bug #99: Firefox does not throw a NotSupportedError when the numberOfChannels is zero. But it only does it when using the
             * factory function. But since Firefox also supports the constructor everything should be fine.
             */
            const audioBuffer = nativeAudioBufferConstructor !== null &&
                cacheTestResult(testNativeAudioBufferConstructorSupport, testNativeAudioBufferConstructorSupport)
                ? new nativeAudioBufferConstructor({ length, numberOfChannels, sampleRate })
                : nativeOfflineAudioContext.createBuffer(numberOfChannels, length, sampleRate);
            // Bug #99: Safari does not throw an error when the numberOfChannels is zero.
            if (audioBuffer.numberOfChannels === 0) {
                throw createNotSupportedError();
            }
            // Bug #5: Safari does not support copyFromChannel() and copyToChannel().
            // Bug #100: Safari does throw a wrong error when calling getChannelData() with an out-of-bounds value.
            if (typeof audioBuffer.copyFromChannel !== 'function') {
                wrapAudioBufferCopyChannelMethods(audioBuffer);
                wrapAudioBufferGetChannelDataMethod(audioBuffer);
                // Bug #157: Firefox does not allow the bufferOffset to be out-of-bounds.
            }
            else if (!cacheTestResult(testAudioBufferCopyChannelMethodsOutOfBoundsSupport, () => testAudioBufferCopyChannelMethodsOutOfBoundsSupport(audioBuffer))) {
                wrapAudioBufferCopyChannelMethodsOutOfBounds(audioBuffer);
            }
            audioBufferStore.add(audioBuffer);
            /*
             * This does violate all good pratices but it is necessary to allow this AudioBuffer to be used with native
             * (Offline)AudioContexts.
             */
            return audioBuffer;
        }
        static [Symbol.hasInstance](instance) {
            return ((instance !== null && typeof instance === 'object' && Object.getPrototypeOf(instance) === AudioBuffer.prototype) ||
                audioBufferStore.has(instance));
        }
    };
};

const MOST_NEGATIVE_SINGLE_FLOAT = -3.4028234663852886e38;
const MOST_POSITIVE_SINGLE_FLOAT = -MOST_NEGATIVE_SINGLE_FLOAT;

const isActiveAudioNode = (audioNode) => ACTIVE_AUDIO_NODE_STORE.has(audioNode);

const DEFAULT_OPTIONS$1 = {
    buffer: null,
    channelCount: 2,
    channelCountMode: 'max',
    channelInterpretation: 'speakers',
    // Bug #149: Safari does not yet support the detune AudioParam.
    loop: false,
    loopEnd: 0,
    loopStart: 0,
    playbackRate: 1
};
const createAudioBufferSourceNodeConstructor = (audioNodeConstructor, createAudioBufferSourceNodeRenderer, createAudioParam, createInvalidStateError, createNativeAudioBufferSourceNode, getNativeContext, isNativeOfflineAudioContext, wrapEventListener) => {
    return class AudioBufferSourceNode extends audioNodeConstructor {
        constructor(context, options) {
            const nativeContext = getNativeContext(context);
            const mergedOptions = { ...DEFAULT_OPTIONS$1, ...options };
            const nativeAudioBufferSourceNode = createNativeAudioBufferSourceNode(nativeContext, mergedOptions);
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            const audioBufferSourceNodeRenderer = ((isOffline ? createAudioBufferSourceNodeRenderer() : null));
            super(context, false, nativeAudioBufferSourceNode, audioBufferSourceNodeRenderer);
            this._audioBufferSourceNodeRenderer = audioBufferSourceNodeRenderer;
            this._isBufferNullified = false;
            this._isBufferSet = mergedOptions.buffer !== null;
            this._nativeAudioBufferSourceNode = nativeAudioBufferSourceNode;
            this._onended = null;
            // Bug #73: Safari does not export the correct values for maxValue and minValue.
            this._playbackRate = createAudioParam(this, isOffline, nativeAudioBufferSourceNode.playbackRate, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
        }
        get buffer() {
            if (this._isBufferNullified) {
                return null;
            }
            return this._nativeAudioBufferSourceNode.buffer;
        }
        set buffer(value) {
            this._nativeAudioBufferSourceNode.buffer = value;
            // Bug #72: Only Chrome & Edge do not allow to reassign the buffer yet.
            if (value !== null) {
                if (this._isBufferSet) {
                    throw createInvalidStateError();
                }
                this._isBufferSet = true;
            }
        }
        get loop() {
            return this._nativeAudioBufferSourceNode.loop;
        }
        set loop(value) {
            this._nativeAudioBufferSourceNode.loop = value;
        }
        get loopEnd() {
            return this._nativeAudioBufferSourceNode.loopEnd;
        }
        set loopEnd(value) {
            this._nativeAudioBufferSourceNode.loopEnd = value;
        }
        get loopStart() {
            return this._nativeAudioBufferSourceNode.loopStart;
        }
        set loopStart(value) {
            this._nativeAudioBufferSourceNode.loopStart = value;
        }
        get onended() {
            return this._onended;
        }
        set onended(value) {
            const wrappedListener = typeof value === 'function' ? wrapEventListener(this, value) : null;
            this._nativeAudioBufferSourceNode.onended = wrappedListener;
            const nativeOnEnded = this._nativeAudioBufferSourceNode.onended;
            this._onended = nativeOnEnded !== null && nativeOnEnded === wrappedListener ? value : nativeOnEnded;
        }
        get playbackRate() {
            return this._playbackRate;
        }
        start(when = 0, offset = 0, duration) {
            this._nativeAudioBufferSourceNode.start(when, offset, duration);
            if (this._audioBufferSourceNodeRenderer !== null) {
                this._audioBufferSourceNodeRenderer.start = duration === undefined ? [when, offset] : [when, offset, duration];
            }
            if (this.context.state !== 'closed') {
                setInternalStateToActive(this);
                const resetInternalStateToPassive = () => {
                    this._nativeAudioBufferSourceNode.removeEventListener('ended', resetInternalStateToPassive);
                    if (isActiveAudioNode(this)) {
                        setInternalStateToPassive(this);
                    }
                };
                this._nativeAudioBufferSourceNode.addEventListener('ended', resetInternalStateToPassive);
            }
        }
        stop(when = 0) {
            this._nativeAudioBufferSourceNode.stop(when);
            if (this._audioBufferSourceNodeRenderer !== null) {
                this._audioBufferSourceNodeRenderer.stop = when;
            }
        }
    };
};

const createAudioBufferSourceNodeRendererFactory = (connectAudioParam, createNativeAudioBufferSourceNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode) => {
    return () => {
        const renderedNativeAudioBufferSourceNodes = new WeakMap();
        let start = null;
        let stop = null;
        const createAudioBufferSourceNode = async (proxy, nativeOfflineAudioContext) => {
            let nativeAudioBufferSourceNode = getNativeAudioNode(proxy);
            /*
             * If the initially used nativeAudioBufferSourceNode was not constructed on the same OfflineAudioContext it needs to be created
             * again.
             */
            const nativeAudioBufferSourceNodeIsOwnedByContext = isOwnedByContext(nativeAudioBufferSourceNode, nativeOfflineAudioContext);
            if (!nativeAudioBufferSourceNodeIsOwnedByContext) {
                const options = {
                    buffer: nativeAudioBufferSourceNode.buffer,
                    channelCount: nativeAudioBufferSourceNode.channelCount,
                    channelCountMode: nativeAudioBufferSourceNode.channelCountMode,
                    channelInterpretation: nativeAudioBufferSourceNode.channelInterpretation,
                    // Bug #149: Safari does not yet support the detune AudioParam.
                    loop: nativeAudioBufferSourceNode.loop,
                    loopEnd: nativeAudioBufferSourceNode.loopEnd,
                    loopStart: nativeAudioBufferSourceNode.loopStart,
                    playbackRate: nativeAudioBufferSourceNode.playbackRate.value
                };
                nativeAudioBufferSourceNode = createNativeAudioBufferSourceNode(nativeOfflineAudioContext, options);
                if (start !== null) {
                    nativeAudioBufferSourceNode.start(...start);
                }
                if (stop !== null) {
                    nativeAudioBufferSourceNode.stop(stop);
                }
            }
            renderedNativeAudioBufferSourceNodes.set(nativeOfflineAudioContext, nativeAudioBufferSourceNode);
            if (!nativeAudioBufferSourceNodeIsOwnedByContext) {
                // Bug #149: Safari does not yet support the detune AudioParam.
                await renderAutomation(nativeOfflineAudioContext, proxy.playbackRate, nativeAudioBufferSourceNode.playbackRate);
            }
            else {
                // Bug #149: Safari does not yet support the detune AudioParam.
                await connectAudioParam(nativeOfflineAudioContext, proxy.playbackRate, nativeAudioBufferSourceNode.playbackRate);
            }
            await renderInputsOfAudioNode(proxy, nativeOfflineAudioContext, nativeAudioBufferSourceNode);
            return nativeAudioBufferSourceNode;
        };
        return {
            set start(value) {
                start = value;
            },
            set stop(value) {
                stop = value;
            },
            render(proxy, nativeOfflineAudioContext) {
                const renderedNativeAudioBufferSourceNode = renderedNativeAudioBufferSourceNodes.get(nativeOfflineAudioContext);
                if (renderedNativeAudioBufferSourceNode !== undefined) {
                    return Promise.resolve(renderedNativeAudioBufferSourceNode);
                }
                return createAudioBufferSourceNode(proxy, nativeOfflineAudioContext);
            }
        };
    };
};

const isAudioBufferSourceNode = (audioNode) => {
    return 'playbackRate' in audioNode;
};

const isBiquadFilterNode = (audioNode) => {
    return 'frequency' in audioNode && 'gain' in audioNode;
};

const isConstantSourceNode = (audioNode) => {
    return 'offset' in audioNode;
};

const isGainNode = (audioNode) => {
    return !('frequency' in audioNode) && 'gain' in audioNode;
};

const isOscillatorNode = (audioNode) => {
    return 'detune' in audioNode && 'frequency' in audioNode;
};

const isStereoPannerNode = (audioNode) => {
    return 'pan' in audioNode;
};

const getAudioNodeConnections = (audioNode) => {
    return getValueForKey(AUDIO_NODE_CONNECTIONS_STORE, audioNode);
};

const getAudioParamConnections = (audioParam) => {
    return getValueForKey(AUDIO_PARAM_CONNECTIONS_STORE, audioParam);
};

const deactivateActiveAudioNodeInputConnections = (audioNode, trace) => {
    const { activeInputs } = getAudioNodeConnections(audioNode);
    activeInputs.forEach((connections) => connections.forEach(([source]) => {
        if (!trace.includes(audioNode)) {
            deactivateActiveAudioNodeInputConnections(source, [...trace, audioNode]);
        }
    }));
    const audioParams = isAudioBufferSourceNode(audioNode)
        ? [
            // Bug #149: Safari does not yet support the detune AudioParam.
            audioNode.playbackRate
        ]
        : isAudioWorkletNode(audioNode)
            ? Array.from(audioNode.parameters.values())
            : isBiquadFilterNode(audioNode)
                ? [audioNode.Q, audioNode.detune, audioNode.frequency, audioNode.gain]
                : isConstantSourceNode(audioNode)
                    ? [audioNode.offset]
                    : isGainNode(audioNode)
                        ? [audioNode.gain]
                        : isOscillatorNode(audioNode)
                            ? [audioNode.detune, audioNode.frequency]
                            : isStereoPannerNode(audioNode)
                                ? [audioNode.pan]
                                : [];
    for (const audioParam of audioParams) {
        const audioParamConnections = getAudioParamConnections(audioParam);
        if (audioParamConnections !== undefined) {
            audioParamConnections.activeInputs.forEach(([source]) => deactivateActiveAudioNodeInputConnections(source, trace));
        }
    }
    if (isActiveAudioNode(audioNode)) {
        setInternalStateToPassive(audioNode);
    }
};

const deactivateAudioGraph = (context) => {
    deactivateActiveAudioNodeInputConnections(context.destination, []);
};

const isValidLatencyHint = (latencyHint) => {
    return (latencyHint === undefined ||
        typeof latencyHint === 'number' ||
        (typeof latencyHint === 'string' && (latencyHint === 'balanced' || latencyHint === 'interactive' || latencyHint === 'playback')));
};

const createAudioDestinationNodeConstructor = (audioNodeConstructor, createAudioDestinationNodeRenderer, createIndexSizeError, createInvalidStateError, createNativeAudioDestinationNode, getNativeContext, isNativeOfflineAudioContext, renderInputsOfAudioNode) => {
    return class AudioDestinationNode extends audioNodeConstructor {
        constructor(context, channelCount) {
            const nativeContext = getNativeContext(context);
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            const nativeAudioDestinationNode = createNativeAudioDestinationNode(nativeContext, channelCount, isOffline);
            const audioDestinationNodeRenderer = ((isOffline ? createAudioDestinationNodeRenderer(renderInputsOfAudioNode) : null));
            super(context, false, nativeAudioDestinationNode, audioDestinationNodeRenderer);
            this._isNodeOfNativeOfflineAudioContext = isOffline;
            this._nativeAudioDestinationNode = nativeAudioDestinationNode;
        }
        get channelCount() {
            return this._nativeAudioDestinationNode.channelCount;
        }
        set channelCount(value) {
            // Bug #52: Chrome, Edge & Safari do not throw an exception at all.
            // Bug #54: Firefox does throw an IndexSizeError.
            if (this._isNodeOfNativeOfflineAudioContext) {
                throw createInvalidStateError();
            }
            // Bug #47: The AudioDestinationNode in Safari does not initialize the maxChannelCount property correctly.
            if (value > this._nativeAudioDestinationNode.maxChannelCount) {
                throw createIndexSizeError();
            }
            this._nativeAudioDestinationNode.channelCount = value;
        }
        get channelCountMode() {
            return this._nativeAudioDestinationNode.channelCountMode;
        }
        set channelCountMode(value) {
            // Bug #53: No browser does throw an exception yet.
            if (this._isNodeOfNativeOfflineAudioContext) {
                throw createInvalidStateError();
            }
            this._nativeAudioDestinationNode.channelCountMode = value;
        }
        get maxChannelCount() {
            return this._nativeAudioDestinationNode.maxChannelCount;
        }
    };
};

const createAudioDestinationNodeRenderer = (renderInputsOfAudioNode) => {
    const renderedNativeAudioDestinationNodes = new WeakMap();
    const createAudioDestinationNode = async (proxy, nativeOfflineAudioContext) => {
        const nativeAudioDestinationNode = nativeOfflineAudioContext.destination;
        renderedNativeAudioDestinationNodes.set(nativeOfflineAudioContext, nativeAudioDestinationNode);
        await renderInputsOfAudioNode(proxy, nativeOfflineAudioContext, nativeAudioDestinationNode);
        return nativeAudioDestinationNode;
    };
    return {
        render(proxy, nativeOfflineAudioContext) {
            const renderedNativeAudioDestinationNode = renderedNativeAudioDestinationNodes.get(nativeOfflineAudioContext);
            if (renderedNativeAudioDestinationNode !== undefined) {
                return Promise.resolve(renderedNativeAudioDestinationNode);
            }
            return createAudioDestinationNode(proxy, nativeOfflineAudioContext);
        }
    };
};

const createAudioListenerFactory = (createAudioParam, createNativeChannelMergerNode, createNativeConstantSourceNode, createNativeScriptProcessorNode, createNotSupportedError, getFirstSample, isNativeOfflineAudioContext, overwriteAccessors) => {
    return (context, nativeContext) => {
        const nativeListener = nativeContext.listener;
        // Bug #117: Only Chrome & Edge support the new interface already.
        const createFakeAudioParams = () => {
            const buffer = new Float32Array(1);
            const channelMergerNode = createNativeChannelMergerNode(nativeContext, {
                channelCount: 1,
                channelCountMode: 'explicit',
                channelInterpretation: 'speakers',
                numberOfInputs: 9
            });
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            let isScriptProcessorNodeCreated = false;
            let lastOrientation = [0, 0, -1, 0, 1, 0];
            let lastPosition = [0, 0, 0];
            const createScriptProcessorNode = () => {
                if (isScriptProcessorNodeCreated) {
                    return;
                }
                isScriptProcessorNodeCreated = true;
                const scriptProcessorNode = createNativeScriptProcessorNode(nativeContext, 256, 9, 0);
                // tslint:disable-next-line:deprecation
                scriptProcessorNode.onaudioprocess = ({ inputBuffer }) => {
                    const orientation = [
                        getFirstSample(inputBuffer, buffer, 0),
                        getFirstSample(inputBuffer, buffer, 1),
                        getFirstSample(inputBuffer, buffer, 2),
                        getFirstSample(inputBuffer, buffer, 3),
                        getFirstSample(inputBuffer, buffer, 4),
                        getFirstSample(inputBuffer, buffer, 5)
                    ];
                    if (orientation.some((value, index) => value !== lastOrientation[index])) {
                        nativeListener.setOrientation(...orientation); // tslint:disable-line:deprecation
                        lastOrientation = orientation;
                    }
                    const positon = [
                        getFirstSample(inputBuffer, buffer, 6),
                        getFirstSample(inputBuffer, buffer, 7),
                        getFirstSample(inputBuffer, buffer, 8)
                    ];
                    if (positon.some((value, index) => value !== lastPosition[index])) {
                        nativeListener.setPosition(...positon); // tslint:disable-line:deprecation
                        lastPosition = positon;
                    }
                };
                channelMergerNode.connect(scriptProcessorNode);
            };
            const createSetOrientation = (index) => (value) => {
                if (value !== lastOrientation[index]) {
                    lastOrientation[index] = value;
                    nativeListener.setOrientation(...lastOrientation); // tslint:disable-line:deprecation
                }
            };
            const createSetPosition = (index) => (value) => {
                if (value !== lastPosition[index]) {
                    lastPosition[index] = value;
                    nativeListener.setPosition(...lastPosition); // tslint:disable-line:deprecation
                }
            };
            const createFakeAudioParam = (input, initialValue, setValue) => {
                const constantSourceNode = createNativeConstantSourceNode(nativeContext, {
                    channelCount: 1,
                    channelCountMode: 'explicit',
                    channelInterpretation: 'discrete',
                    offset: initialValue
                });
                constantSourceNode.connect(channelMergerNode, 0, input);
                // @todo This should be stopped when the context is closed.
                constantSourceNode.start();
                Object.defineProperty(constantSourceNode.offset, 'defaultValue', {
                    get() {
                        return initialValue;
                    }
                });
                /*
                 * Bug #62 & #74: Safari does not support ConstantSourceNodes and does not export the correct values for maxValue and
                 * minValue for GainNodes.
                 */
                const audioParam = createAudioParam({ context }, isOffline, constantSourceNode.offset, MOST_POSITIVE_SINGLE_FLOAT, MOST_NEGATIVE_SINGLE_FLOAT);
                overwriteAccessors(audioParam, 'value', (get) => () => get.call(audioParam), (set) => (value) => {
                    try {
                        set.call(audioParam, value);
                    }
                    catch (err) {
                        if (err.code !== 9) {
                            throw err;
                        }
                    }
                    createScriptProcessorNode();
                    if (isOffline) {
                        // Bug #117: Using setOrientation() and setPosition() doesn't work with an OfflineAudioContext.
                        setValue(value);
                    }
                });
                audioParam.cancelAndHoldAtTime = ((cancelAndHoldAtTime) => {
                    if (isOffline) {
                        return () => {
                            throw createNotSupportedError();
                        };
                    }
                    return (...args) => {
                        const value = cancelAndHoldAtTime.apply(audioParam, args);
                        createScriptProcessorNode();
                        return value;
                    };
                })(audioParam.cancelAndHoldAtTime);
                audioParam.cancelScheduledValues = ((cancelScheduledValues) => {
                    if (isOffline) {
                        return () => {
                            throw createNotSupportedError();
                        };
                    }
                    return (...args) => {
                        const value = cancelScheduledValues.apply(audioParam, args);
                        createScriptProcessorNode();
                        return value;
                    };
                })(audioParam.cancelScheduledValues);
                audioParam.exponentialRampToValueAtTime = ((exponentialRampToValueAtTime) => {
                    if (isOffline) {
                        return () => {
                            throw createNotSupportedError();
                        };
                    }
                    return (...args) => {
                        const value = exponentialRampToValueAtTime.apply(audioParam, args);
                        createScriptProcessorNode();
                        return value;
                    };
                })(audioParam.exponentialRampToValueAtTime);
                audioParam.linearRampToValueAtTime = ((linearRampToValueAtTime) => {
                    if (isOffline) {
                        return () => {
                            throw createNotSupportedError();
                        };
                    }
                    return (...args) => {
                        const value = linearRampToValueAtTime.apply(audioParam, args);
                        createScriptProcessorNode();
                        return value;
                    };
                })(audioParam.linearRampToValueAtTime);
                audioParam.setTargetAtTime = ((setTargetAtTime) => {
                    if (isOffline) {
                        return () => {
                            throw createNotSupportedError();
                        };
                    }
                    return (...args) => {
                        const value = setTargetAtTime.apply(audioParam, args);
                        createScriptProcessorNode();
                        return value;
                    };
                })(audioParam.setTargetAtTime);
                audioParam.setValueAtTime = ((setValueAtTime) => {
                    if (isOffline) {
                        return () => {
                            throw createNotSupportedError();
                        };
                    }
                    return (...args) => {
                        const value = setValueAtTime.apply(audioParam, args);
                        createScriptProcessorNode();
                        return value;
                    };
                })(audioParam.setValueAtTime);
                audioParam.setValueCurveAtTime = ((setValueCurveAtTime) => {
                    if (isOffline) {
                        return () => {
                            throw createNotSupportedError();
                        };
                    }
                    return (...args) => {
                        const value = setValueCurveAtTime.apply(audioParam, args);
                        createScriptProcessorNode();
                        return value;
                    };
                })(audioParam.setValueCurveAtTime);
                return audioParam;
            };
            return {
                forwardX: createFakeAudioParam(0, 0, createSetOrientation(0)),
                forwardY: createFakeAudioParam(1, 0, createSetOrientation(1)),
                forwardZ: createFakeAudioParam(2, -1, createSetOrientation(2)),
                positionX: createFakeAudioParam(6, 0, createSetPosition(0)),
                positionY: createFakeAudioParam(7, 0, createSetPosition(1)),
                positionZ: createFakeAudioParam(8, 0, createSetPosition(2)),
                upX: createFakeAudioParam(3, 0, createSetOrientation(3)),
                upY: createFakeAudioParam(4, 1, createSetOrientation(4)),
                upZ: createFakeAudioParam(5, 0, createSetOrientation(5))
            };
        };
        const { forwardX, forwardY, forwardZ, positionX, positionY, positionZ, upX, upY, upZ } = nativeListener.forwardX === undefined ? createFakeAudioParams() : nativeListener;
        return {
            get forwardX() {
                return forwardX;
            },
            get forwardY() {
                return forwardY;
            },
            get forwardZ() {
                return forwardZ;
            },
            get positionX() {
                return positionX;
            },
            get positionY() {
                return positionY;
            },
            get positionZ() {
                return positionZ;
            },
            get upX() {
                return upX;
            },
            get upY() {
                return upY;
            },
            get upZ() {
                return upZ;
            }
        };
    };
};

const isAudioNode = (audioNodeOrAudioParam) => {
    return 'context' in audioNodeOrAudioParam;
};

const isAudioNodeOutputConnection = (outputConnection) => {
    return isAudioNode(outputConnection[0]);
};

const insertElementInSet = (set, element, predicate, ignoreDuplicates) => {
    for (const lmnt of set) {
        if (predicate(lmnt)) {
            if (ignoreDuplicates) {
                return false;
            }
            throw Error('The set contains at least one similar element.');
        }
    }
    set.add(element);
    return true;
};

const addActiveInputConnectionToAudioParam = (activeInputs, source, [output, eventListener], ignoreDuplicates) => {
    insertElementInSet(activeInputs, [source, output, eventListener], (activeInputConnection) => activeInputConnection[0] === source && activeInputConnection[1] === output, ignoreDuplicates);
};

const addPassiveInputConnectionToAudioParam = (passiveInputs, [source, output, eventListener], ignoreDuplicates) => {
    const passiveInputConnections = passiveInputs.get(source);
    if (passiveInputConnections === undefined) {
        passiveInputs.set(source, new Set([[output, eventListener]]));
    }
    else {
        insertElementInSet(passiveInputConnections, [output, eventListener], (passiveInputConnection) => passiveInputConnection[0] === output, ignoreDuplicates);
    }
};

const isNativeAudioNodeFaker = (nativeAudioNodeOrNativeAudioNodeFaker) => {
    return 'inputs' in nativeAudioNodeOrNativeAudioNodeFaker;
};

const connectNativeAudioNodeToNativeAudioNode = (nativeSourceAudioNode, nativeDestinationAudioNode, output, input) => {
    if (isNativeAudioNodeFaker(nativeDestinationAudioNode)) {
        const fakeNativeDestinationAudioNode = nativeDestinationAudioNode.inputs[input];
        nativeSourceAudioNode.connect(fakeNativeDestinationAudioNode, output, 0);
        return [fakeNativeDestinationAudioNode, output, 0];
    }
    nativeSourceAudioNode.connect(nativeDestinationAudioNode, output, input);
    return [nativeDestinationAudioNode, output, input];
};

const deleteActiveInputConnection = (activeInputConnections, source, output) => {
    for (const activeInputConnection of activeInputConnections) {
        if (activeInputConnection[0] === source && activeInputConnection[1] === output) {
            activeInputConnections.delete(activeInputConnection);
            return activeInputConnection;
        }
    }
    return null;
};

const deleteActiveInputConnectionToAudioParam = (activeInputs, source, output) => {
    return pickElementFromSet(activeInputs, (activeInputConnection) => activeInputConnection[0] === source && activeInputConnection[1] === output);
};

const deleteEventListenerOfAudioNode = (audioNode, eventListener) => {
    const eventListeners = getEventListenersOfAudioNode(audioNode);
    if (!eventListeners.delete(eventListener)) {
        throw new Error('Missing the expected event listener.');
    }
};

const deletePassiveInputConnectionToAudioParam = (passiveInputs, source, output) => {
    const passiveInputConnections = getValueForKey(passiveInputs, source);
    const matchingConnection = pickElementFromSet(passiveInputConnections, (passiveInputConnection) => passiveInputConnection[0] === output);
    if (passiveInputConnections.size === 0) {
        passiveInputs.delete(source);
    }
    return matchingConnection;
};

const disconnectNativeAudioNodeFromNativeAudioNode = (nativeSourceAudioNode, nativeDestinationAudioNode, output, input) => {
    if (isNativeAudioNodeFaker(nativeDestinationAudioNode)) {
        nativeSourceAudioNode.disconnect(nativeDestinationAudioNode.inputs[input], output, 0);
    }
    else {
        nativeSourceAudioNode.disconnect(nativeDestinationAudioNode, output, input);
    }
};

const getNativeAudioNode = (audioNode) => {
    return getValueForKey(AUDIO_NODE_STORE, audioNode);
};

const getNativeAudioParam = (audioParam) => {
    return getValueForKey(AUDIO_PARAM_STORE, audioParam);
};

const isPartOfACycle = (audioNode) => {
    return CYCLE_COUNTERS.has(audioNode);
};

const isPassiveAudioNode = (audioNode) => {
    return !ACTIVE_AUDIO_NODE_STORE.has(audioNode);
};

const testAudioNodeDisconnectMethodSupport = (nativeAudioContext, nativeAudioWorkletNodeConstructor) => {
    return new Promise((resolve) => {
        /*
         * This bug existed in Safari up until v14.0.2. Since AudioWorklets were not supported in Safari until v14.1 the presence of the
         * constructor for an AudioWorkletNode can be used here to skip the test.
         */
        if (nativeAudioWorkletNodeConstructor !== null) {
            resolve(true);
        }
        else {
            const analyzer = nativeAudioContext.createScriptProcessor(256, 1, 1); // tslint:disable-line deprecation
            const dummy = nativeAudioContext.createGain();
            // Bug #95: Safari does not play one sample buffers.
            const ones = nativeAudioContext.createBuffer(1, 2, 44100);
            const channelData = ones.getChannelData(0);
            channelData[0] = 1;
            channelData[1] = 1;
            const source = nativeAudioContext.createBufferSource();
            source.buffer = ones;
            source.loop = true;
            source.connect(analyzer).connect(nativeAudioContext.destination);
            source.connect(dummy);
            source.disconnect(dummy);
            // tslint:disable-next-line:deprecation
            analyzer.onaudioprocess = (event) => {
                const chnnlDt = event.inputBuffer.getChannelData(0); // tslint:disable-line deprecation
                if (Array.prototype.some.call(chnnlDt, (sample) => sample === 1)) {
                    resolve(true);
                }
                else {
                    resolve(false);
                }
                source.stop();
                analyzer.onaudioprocess = null; // tslint:disable-line:deprecation
                source.disconnect(analyzer);
                analyzer.disconnect(nativeAudioContext.destination);
            };
            source.start();
        }
    });
};

const visitEachAudioNodeOnce = (cycles, visitor) => {
    const counts = new Map();
    for (const cycle of cycles) {
        for (const audioNode of cycle) {
            const count = counts.get(audioNode);
            counts.set(audioNode, count === undefined ? 1 : count + 1);
        }
    }
    counts.forEach((count, audioNode) => visitor(audioNode, count));
};

const isNativeAudioNode$1 = (nativeAudioNodeOrAudioParam) => {
    return 'context' in nativeAudioNodeOrAudioParam;
};

const wrapAudioNodeDisconnectMethod = (nativeAudioNode) => {
    const connections = new Map();
    nativeAudioNode.connect = ((connect) => {
        // tslint:disable-next-line:invalid-void no-inferrable-types
        return (destination, output = 0, input = 0) => {
            const returnValue = isNativeAudioNode$1(destination) ? connect(destination, output, input) : connect(destination, output);
            // Save the new connection only if the calls to connect above didn't throw an error.
            const connectionsToDestination = connections.get(destination);
            if (connectionsToDestination === undefined) {
                connections.set(destination, [{ input, output }]);
            }
            else {
                if (connectionsToDestination.every((connection) => connection.input !== input || connection.output !== output)) {
                    connectionsToDestination.push({ input, output });
                }
            }
            return returnValue;
        };
    })(nativeAudioNode.connect.bind(nativeAudioNode));
    nativeAudioNode.disconnect = ((disconnect) => {
        return (destinationOrOutput, output, input) => {
            disconnect.apply(nativeAudioNode);
            if (destinationOrOutput === undefined) {
                connections.clear();
            }
            else if (typeof destinationOrOutput === 'number') {
                for (const [destination, connectionsToDestination] of connections) {
                    const filteredConnections = connectionsToDestination.filter((connection) => connection.output !== destinationOrOutput);
                    if (filteredConnections.length === 0) {
                        connections.delete(destination);
                    }
                    else {
                        connections.set(destination, filteredConnections);
                    }
                }
            }
            else if (connections.has(destinationOrOutput)) {
                if (output === undefined) {
                    connections.delete(destinationOrOutput);
                }
                else {
                    const connectionsToDestination = connections.get(destinationOrOutput);
                    if (connectionsToDestination !== undefined) {
                        const filteredConnections = connectionsToDestination.filter((connection) => connection.output !== output && (connection.input !== input || input === undefined));
                        if (filteredConnections.length === 0) {
                            connections.delete(destinationOrOutput);
                        }
                        else {
                            connections.set(destinationOrOutput, filteredConnections);
                        }
                    }
                }
            }
            for (const [destination, connectionsToDestination] of connections) {
                connectionsToDestination.forEach((connection) => {
                    if (isNativeAudioNode$1(destination)) {
                        nativeAudioNode.connect(destination, connection.output, connection.input);
                    }
                    else {
                        nativeAudioNode.connect(destination, connection.output);
                    }
                });
            }
        };
    })(nativeAudioNode.disconnect);
};

const addConnectionToAudioParamOfAudioContext = (source, destination, output, isOffline) => {
    const { activeInputs, passiveInputs } = getAudioParamConnections(destination);
    const { outputs } = getAudioNodeConnections(source);
    const eventListeners = getEventListenersOfAudioNode(source);
    const eventListener = (isActive) => {
        const nativeAudioNode = getNativeAudioNode(source);
        const nativeAudioParam = getNativeAudioParam(destination);
        if (isActive) {
            const partialConnection = deletePassiveInputConnectionToAudioParam(passiveInputs, source, output);
            addActiveInputConnectionToAudioParam(activeInputs, source, partialConnection, false);
            if (!isOffline && !isPartOfACycle(source)) {
                nativeAudioNode.connect(nativeAudioParam, output);
            }
        }
        else {
            const partialConnection = deleteActiveInputConnectionToAudioParam(activeInputs, source, output);
            addPassiveInputConnectionToAudioParam(passiveInputs, partialConnection, false);
            if (!isOffline && !isPartOfACycle(source)) {
                nativeAudioNode.disconnect(nativeAudioParam, output);
            }
        }
    };
    if (insertElementInSet(outputs, [destination, output], (outputConnection) => outputConnection[0] === destination && outputConnection[1] === output, true)) {
        eventListeners.add(eventListener);
        if (isActiveAudioNode(source)) {
            addActiveInputConnectionToAudioParam(activeInputs, source, [output, eventListener], true);
        }
        else {
            addPassiveInputConnectionToAudioParam(passiveInputs, [source, output, eventListener], true);
        }
        return true;
    }
    return false;
};
const deleteInputConnectionOfAudioNode = (source, destination, output, input) => {
    const { activeInputs, passiveInputs } = getAudioNodeConnections(destination);
    const activeInputConnection = deleteActiveInputConnection(activeInputs[input], source, output);
    if (activeInputConnection === null) {
        const passiveInputConnection = deletePassiveInputConnectionToAudioNode(passiveInputs, source, output, input);
        return [passiveInputConnection[2], false];
    }
    return [activeInputConnection[2], true];
};
const deleteInputConnectionOfAudioParam = (source, destination, output) => {
    const { activeInputs, passiveInputs } = getAudioParamConnections(destination);
    const activeInputConnection = deleteActiveInputConnection(activeInputs, source, output);
    if (activeInputConnection === null) {
        const passiveInputConnection = deletePassiveInputConnectionToAudioParam(passiveInputs, source, output);
        return [passiveInputConnection[1], false];
    }
    return [activeInputConnection[2], true];
};
const deleteInputsOfAudioNode = (source, isOffline, destination, output, input) => {
    const [listener, isActive] = deleteInputConnectionOfAudioNode(source, destination, output, input);
    if (listener !== null) {
        deleteEventListenerOfAudioNode(source, listener);
        if (isActive && !isOffline && !isPartOfACycle(source)) {
            disconnectNativeAudioNodeFromNativeAudioNode(getNativeAudioNode(source), getNativeAudioNode(destination), output, input);
        }
    }
    if (isActiveAudioNode(destination)) {
        const { activeInputs } = getAudioNodeConnections(destination);
        setInternalStateToPassiveWhenNecessary(destination, activeInputs);
    }
};
const deleteInputsOfAudioParam = (source, isOffline, destination, output) => {
    const [listener, isActive] = deleteInputConnectionOfAudioParam(source, destination, output);
    if (listener !== null) {
        deleteEventListenerOfAudioNode(source, listener);
        if (isActive && !isOffline && !isPartOfACycle(source)) {
            getNativeAudioNode(source).disconnect(getNativeAudioParam(destination), output);
        }
    }
};
const deleteAnyConnection = (source, isOffline) => {
    const audioNodeConnectionsOfSource = getAudioNodeConnections(source);
    const destinations = [];
    for (const outputConnection of audioNodeConnectionsOfSource.outputs) {
        if (isAudioNodeOutputConnection(outputConnection)) {
            deleteInputsOfAudioNode(source, isOffline, ...outputConnection);
        }
        else {
            deleteInputsOfAudioParam(source, isOffline, ...outputConnection);
        }
        destinations.push(outputConnection[0]);
    }
    audioNodeConnectionsOfSource.outputs.clear();
    return destinations;
};
const deleteConnectionAtOutput = (source, isOffline, output) => {
    const audioNodeConnectionsOfSource = getAudioNodeConnections(source);
    const destinations = [];
    for (const outputConnection of audioNodeConnectionsOfSource.outputs) {
        if (outputConnection[1] === output) {
            if (isAudioNodeOutputConnection(outputConnection)) {
                deleteInputsOfAudioNode(source, isOffline, ...outputConnection);
            }
            else {
                deleteInputsOfAudioParam(source, isOffline, ...outputConnection);
            }
            destinations.push(outputConnection[0]);
            audioNodeConnectionsOfSource.outputs.delete(outputConnection);
        }
    }
    return destinations;
};
const deleteConnectionToDestination = (source, isOffline, destination, output, input) => {
    const audioNodeConnectionsOfSource = getAudioNodeConnections(source);
    return Array.from(audioNodeConnectionsOfSource.outputs)
        .filter((outputConnection) => outputConnection[0] === destination &&
        (output === undefined || outputConnection[1] === output) &&
        (input === undefined || outputConnection[2] === input))
        .map((outputConnection) => {
        if (isAudioNodeOutputConnection(outputConnection)) {
            deleteInputsOfAudioNode(source, isOffline, ...outputConnection);
        }
        else {
            deleteInputsOfAudioParam(source, isOffline, ...outputConnection);
        }
        audioNodeConnectionsOfSource.outputs.delete(outputConnection);
        return outputConnection[0];
    });
};
const createAudioNodeConstructor = (addAudioNodeConnections, addConnectionToAudioNode, cacheTestResult, createIncrementCycleCounter, createIndexSizeError, createInvalidAccessError, createNotSupportedError, decrementCycleCounter, detectCycles, eventTargetConstructor, getNativeContext, isNativeAudioContext, isNativeAudioNode, isNativeAudioParam, isNativeOfflineAudioContext, nativeAudioWorkletNodeConstructor) => {
    return class AudioNode extends eventTargetConstructor {
        constructor(context, isActive, nativeAudioNode, audioNodeRenderer) {
            super(nativeAudioNode);
            this._context = context;
            this._nativeAudioNode = nativeAudioNode;
            const nativeContext = getNativeContext(context);
            // Bug #12: Safari does not support to disconnect a specific destination.
            if (isNativeAudioContext(nativeContext) &&
                true !==
                    cacheTestResult(testAudioNodeDisconnectMethodSupport, () => {
                        return testAudioNodeDisconnectMethodSupport(nativeContext, nativeAudioWorkletNodeConstructor);
                    })) {
                wrapAudioNodeDisconnectMethod(nativeAudioNode);
            }
            AUDIO_NODE_STORE.set(this, nativeAudioNode);
            EVENT_LISTENERS.set(this, new Set());
            if (context.state !== 'closed' && isActive) {
                setInternalStateToActive(this);
            }
            addAudioNodeConnections(this, audioNodeRenderer, nativeAudioNode);
        }
        get channelCount() {
            return this._nativeAudioNode.channelCount;
        }
        set channelCount(value) {
            this._nativeAudioNode.channelCount = value;
        }
        get channelCountMode() {
            return this._nativeAudioNode.channelCountMode;
        }
        set channelCountMode(value) {
            this._nativeAudioNode.channelCountMode = value;
        }
        get channelInterpretation() {
            return this._nativeAudioNode.channelInterpretation;
        }
        set channelInterpretation(value) {
            this._nativeAudioNode.channelInterpretation = value;
        }
        get context() {
            return this._context;
        }
        get numberOfInputs() {
            return this._nativeAudioNode.numberOfInputs;
        }
        get numberOfOutputs() {
            return this._nativeAudioNode.numberOfOutputs;
        }
        // tslint:disable-next-line:invalid-void
        connect(destination, output = 0, input = 0) {
            // Bug #174: Safari does expose a wrong numberOfOutputs for MediaStreamAudioDestinationNodes.
            if (output < 0 || output >= this._nativeAudioNode.numberOfOutputs) {
                throw createIndexSizeError();
            }
            const nativeContext = getNativeContext(this._context);
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            if (isNativeAudioNode(destination) || isNativeAudioParam(destination)) {
                throw createInvalidAccessError();
            }
            if (isAudioNode(destination)) {
                const nativeDestinationAudioNode = getNativeAudioNode(destination);
                try {
                    const connection = connectNativeAudioNodeToNativeAudioNode(this._nativeAudioNode, nativeDestinationAudioNode, output, input);
                    const isPassive = isPassiveAudioNode(this);
                    if (isOffline || isPassive) {
                        this._nativeAudioNode.disconnect(...connection);
                    }
                    if (this.context.state !== 'closed' && !isPassive && isPassiveAudioNode(destination)) {
                        setInternalStateToActive(destination);
                    }
                }
                catch (err) {
                    // Bug #41: Safari does not throw the correct exception so far.
                    if (err.code === 12) {
                        throw createInvalidAccessError();
                    }
                    throw err;
                }
                const isNewConnectionToAudioNode = addConnectionToAudioNode(this, destination, output, input, isOffline);
                // Bug #164: Only Firefox detects cycles so far.
                if (isNewConnectionToAudioNode) {
                    const cycles = detectCycles([this], destination);
                    visitEachAudioNodeOnce(cycles, createIncrementCycleCounter(isOffline));
                }
                return destination;
            }
            const nativeAudioParam = getNativeAudioParam(destination);
            /*
             * Bug #73, #147 & #153: Safari does not support to connect an input signal to the playbackRate AudioParam of an
             * AudioBufferSourceNode. This can't be easily detected and that's why the outdated name property is used here to identify
             * Safari. In addition to that the maxValue property is used to only detect the affected versions below v14.0.2.
             */
            if (nativeAudioParam.name === 'playbackRate' && nativeAudioParam.maxValue === 1024) {
                throw createNotSupportedError();
            }
            try {
                this._nativeAudioNode.connect(nativeAudioParam, output);
                if (isOffline || isPassiveAudioNode(this)) {
                    this._nativeAudioNode.disconnect(nativeAudioParam, output);
                }
            }
            catch (err) {
                // Bug #58: Safari doesn't throw an InvalidAccessError yet.
                if (err.code === 12) {
                    throw createInvalidAccessError();
                }
                throw err;
            }
            const isNewConnectionToAudioParam = addConnectionToAudioParamOfAudioContext(this, destination, output, isOffline);
            // Bug #164: Only Firefox detects cycles so far.
            if (isNewConnectionToAudioParam) {
                const cycles = detectCycles([this], destination);
                visitEachAudioNodeOnce(cycles, createIncrementCycleCounter(isOffline));
            }
        }
        disconnect(destinationOrOutput, output, input) {
            let destinations;
            const nativeContext = getNativeContext(this._context);
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            if (destinationOrOutput === undefined) {
                destinations = deleteAnyConnection(this, isOffline);
            }
            else if (typeof destinationOrOutput === 'number') {
                if (destinationOrOutput < 0 || destinationOrOutput >= this.numberOfOutputs) {
                    throw createIndexSizeError();
                }
                destinations = deleteConnectionAtOutput(this, isOffline, destinationOrOutput);
            }
            else {
                if (output !== undefined && (output < 0 || output >= this.numberOfOutputs)) {
                    throw createIndexSizeError();
                }
                if (isAudioNode(destinationOrOutput) && input !== undefined && (input < 0 || input >= destinationOrOutput.numberOfInputs)) {
                    throw createIndexSizeError();
                }
                destinations = deleteConnectionToDestination(this, isOffline, destinationOrOutput, output, input);
                if (destinations.length === 0) {
                    throw createInvalidAccessError();
                }
            }
            // Bug #164: Only Firefox detects cycles so far.
            for (const destination of destinations) {
                const cycles = detectCycles([this], destination);
                visitEachAudioNodeOnce(cycles, decrementCycleCounter);
            }
        }
    };
};

const createAudioParamFactory = (addAudioParamConnections, audioParamAudioNodeStore, audioParamStore, createAudioParamRenderer, createCancelAndHoldAutomationEvent, createCancelScheduledValuesAutomationEvent, createExponentialRampToValueAutomationEvent, createLinearRampToValueAutomationEvent, createSetTargetAutomationEvent, createSetValueAutomationEvent, createSetValueCurveAutomationEvent, nativeAudioContextConstructor, setValueAtTimeUntilPossible) => {
    return (audioNode, isAudioParamOfOfflineAudioContext, nativeAudioParam, maxValue = null, minValue = null) => {
        // Bug #196 Only Safari sets the defaultValue to the initial value.
        const defaultValue = nativeAudioParam.value;
        const automationEventList = new AutomationEventList(defaultValue);
        const audioParamRenderer = isAudioParamOfOfflineAudioContext ? createAudioParamRenderer(automationEventList) : null;
        const audioParam = {
            get defaultValue() {
                return defaultValue;
            },
            get maxValue() {
                return maxValue === null ? nativeAudioParam.maxValue : maxValue;
            },
            get minValue() {
                return minValue === null ? nativeAudioParam.minValue : minValue;
            },
            get value() {
                return nativeAudioParam.value;
            },
            set value(value) {
                nativeAudioParam.value = value;
                // Bug #98: Firefox & Safari do not yet treat the value setter like a call to setValueAtTime().
                audioParam.setValueAtTime(value, audioNode.context.currentTime);
            },
            cancelAndHoldAtTime(cancelTime) {
                // Bug #28: Firefox & Safari do not yet implement cancelAndHoldAtTime().
                if (typeof nativeAudioParam.cancelAndHoldAtTime === 'function') {
                    if (audioParamRenderer === null) {
                        automationEventList.flush(audioNode.context.currentTime);
                    }
                    automationEventList.add(createCancelAndHoldAutomationEvent(cancelTime));
                    nativeAudioParam.cancelAndHoldAtTime(cancelTime);
                }
                else {
                    const previousLastEvent = Array.from(automationEventList).pop();
                    if (audioParamRenderer === null) {
                        automationEventList.flush(audioNode.context.currentTime);
                    }
                    automationEventList.add(createCancelAndHoldAutomationEvent(cancelTime));
                    const currentLastEvent = Array.from(automationEventList).pop();
                    nativeAudioParam.cancelScheduledValues(cancelTime);
                    if (previousLastEvent !== currentLastEvent && currentLastEvent !== undefined) {
                        if (currentLastEvent.type === 'exponentialRampToValue') {
                            nativeAudioParam.exponentialRampToValueAtTime(currentLastEvent.value, currentLastEvent.endTime);
                        }
                        else if (currentLastEvent.type === 'linearRampToValue') {
                            nativeAudioParam.linearRampToValueAtTime(currentLastEvent.value, currentLastEvent.endTime);
                        }
                        else if (currentLastEvent.type === 'setValue') {
                            nativeAudioParam.setValueAtTime(currentLastEvent.value, currentLastEvent.startTime);
                        }
                        else if (currentLastEvent.type === 'setValueCurve') {
                            nativeAudioParam.setValueCurveAtTime(currentLastEvent.values, currentLastEvent.startTime, currentLastEvent.duration);
                        }
                    }
                }
                return audioParam;
            },
            cancelScheduledValues(cancelTime) {
                if (audioParamRenderer === null) {
                    automationEventList.flush(audioNode.context.currentTime);
                }
                automationEventList.add(createCancelScheduledValuesAutomationEvent(cancelTime));
                nativeAudioParam.cancelScheduledValues(cancelTime);
                return audioParam;
            },
            exponentialRampToValueAtTime(value, endTime) {
                // Bug #45: Safari does not throw an error yet.
                if (value === 0) {
                    throw new RangeError();
                }
                // Bug #187: Safari does not throw an error yet.
                if (!Number.isFinite(endTime) || endTime < 0) {
                    throw new RangeError();
                }
                const currentTime = audioNode.context.currentTime;
                if (audioParamRenderer === null) {
                    automationEventList.flush(currentTime);
                }
                // Bug #194: Firefox does not implicitly call setValueAtTime() if there is no previous event.
                if (Array.from(automationEventList).length === 0) {
                    automationEventList.add(createSetValueAutomationEvent(defaultValue, currentTime));
                    nativeAudioParam.setValueAtTime(defaultValue, currentTime);
                }
                automationEventList.add(createExponentialRampToValueAutomationEvent(value, endTime));
                nativeAudioParam.exponentialRampToValueAtTime(value, endTime);
                return audioParam;
            },
            linearRampToValueAtTime(value, endTime) {
                const currentTime = audioNode.context.currentTime;
                if (audioParamRenderer === null) {
                    automationEventList.flush(currentTime);
                }
                // Bug #195: Firefox does not implicitly call setValueAtTime() if there is no previous event.
                if (Array.from(automationEventList).length === 0) {
                    automationEventList.add(createSetValueAutomationEvent(defaultValue, currentTime));
                    nativeAudioParam.setValueAtTime(defaultValue, currentTime);
                }
                automationEventList.add(createLinearRampToValueAutomationEvent(value, endTime));
                nativeAudioParam.linearRampToValueAtTime(value, endTime);
                return audioParam;
            },
            setTargetAtTime(target, startTime, timeConstant) {
                if (audioParamRenderer === null) {
                    automationEventList.flush(audioNode.context.currentTime);
                }
                automationEventList.add(createSetTargetAutomationEvent(target, startTime, timeConstant));
                nativeAudioParam.setTargetAtTime(target, startTime, timeConstant);
                return audioParam;
            },
            setValueAtTime(value, startTime) {
                if (audioParamRenderer === null) {
                    automationEventList.flush(audioNode.context.currentTime);
                }
                automationEventList.add(createSetValueAutomationEvent(value, startTime));
                nativeAudioParam.setValueAtTime(value, startTime);
                return audioParam;
            },
            setValueCurveAtTime(values, startTime, duration) {
                // Bug 183: Safari only accepts a Float32Array.
                const convertedValues = values instanceof Float32Array ? values : new Float32Array(values);
                /*
                 * Bug #152: Safari does not correctly interpolate the values of the curve.
                 * @todo Unfortunately there is no way to test for this behavior in a synchronous fashion which is why testing for the
                 * existence of the webkitAudioContext is used as a workaround here.
                 */
                if (nativeAudioContextConstructor !== null && nativeAudioContextConstructor.name === 'webkitAudioContext') {
                    const endTime = startTime + duration;
                    const sampleRate = audioNode.context.sampleRate;
                    const firstSample = Math.ceil(startTime * sampleRate);
                    const lastSample = Math.floor(endTime * sampleRate);
                    const numberOfInterpolatedValues = lastSample - firstSample;
                    const interpolatedValues = new Float32Array(numberOfInterpolatedValues);
                    for (let i = 0; i < numberOfInterpolatedValues; i += 1) {
                        const theoreticIndex = ((convertedValues.length - 1) / duration) * ((firstSample + i) / sampleRate - startTime);
                        const lowerIndex = Math.floor(theoreticIndex);
                        const upperIndex = Math.ceil(theoreticIndex);
                        interpolatedValues[i] =
                            lowerIndex === upperIndex
                                ? convertedValues[lowerIndex]
                                : (1 - (theoreticIndex - lowerIndex)) * convertedValues[lowerIndex] +
                                    (1 - (upperIndex - theoreticIndex)) * convertedValues[upperIndex];
                    }
                    if (audioParamRenderer === null) {
                        automationEventList.flush(audioNode.context.currentTime);
                    }
                    automationEventList.add(createSetValueCurveAutomationEvent(interpolatedValues, startTime, duration));
                    nativeAudioParam.setValueCurveAtTime(interpolatedValues, startTime, duration);
                    const timeOfLastSample = lastSample / sampleRate;
                    if (timeOfLastSample < endTime) {
                        setValueAtTimeUntilPossible(audioParam, interpolatedValues[interpolatedValues.length - 1], timeOfLastSample);
                    }
                    setValueAtTimeUntilPossible(audioParam, convertedValues[convertedValues.length - 1], endTime);
                }
                else {
                    if (audioParamRenderer === null) {
                        automationEventList.flush(audioNode.context.currentTime);
                    }
                    automationEventList.add(createSetValueCurveAutomationEvent(convertedValues, startTime, duration));
                    nativeAudioParam.setValueCurveAtTime(convertedValues, startTime, duration);
                }
                return audioParam;
            }
        };
        audioParamStore.set(audioParam, nativeAudioParam);
        audioParamAudioNodeStore.set(audioParam, audioNode);
        addAudioParamConnections(audioParam, audioParamRenderer);
        return audioParam;
    };
};

const createAudioParamRenderer = (automationEventList) => {
    return {
        replay(audioParam) {
            for (const automationEvent of automationEventList) {
                if (automationEvent.type === 'exponentialRampToValue') {
                    const { endTime, value } = automationEvent;
                    audioParam.exponentialRampToValueAtTime(value, endTime);
                }
                else if (automationEvent.type === 'linearRampToValue') {
                    const { endTime, value } = automationEvent;
                    audioParam.linearRampToValueAtTime(value, endTime);
                }
                else if (automationEvent.type === 'setTarget') {
                    const { startTime, target, timeConstant } = automationEvent;
                    audioParam.setTargetAtTime(target, startTime, timeConstant);
                }
                else if (automationEvent.type === 'setValue') {
                    const { startTime, value } = automationEvent;
                    audioParam.setValueAtTime(value, startTime);
                }
                else if (automationEvent.type === 'setValueCurve') {
                    const { duration, startTime, values } = automationEvent;
                    audioParam.setValueCurveAtTime(values, startTime, duration);
                }
                else {
                    throw new Error("Can't apply an unknown automation.");
                }
            }
        }
    };
};

class ReadOnlyMap {
    constructor(parameters) {
        this._map = new Map(parameters);
    }
    get size() {
        return this._map.size;
    }
    entries() {
        return this._map.entries();
    }
    forEach(callback, thisArg = null) {
        return this._map.forEach((value, key) => callback.call(thisArg, value, key, this));
    }
    get(name) {
        return this._map.get(name);
    }
    has(name) {
        return this._map.has(name);
    }
    keys() {
        return this._map.keys();
    }
    values() {
        return this._map.values();
    }
}

const DEFAULT_OPTIONS = {
    channelCount: 2,
    // Bug #61: The channelCountMode should be 'max' according to the spec but is set to 'explicit' to achieve consistent behavior.
    channelCountMode: 'explicit',
    channelInterpretation: 'speakers',
    numberOfInputs: 1,
    numberOfOutputs: 1,
    parameterData: {},
    processorOptions: {}
};
const createAudioWorkletNodeConstructor = (addUnrenderedAudioWorkletNode, audioNodeConstructor, createAudioParam, createAudioWorkletNodeRenderer, createNativeAudioWorkletNode, getAudioNodeConnections, getBackupOfflineAudioContext, getNativeContext, isNativeOfflineAudioContext, nativeAudioWorkletNodeConstructor, sanitizeAudioWorkletNodeOptions, setActiveAudioWorkletNodeInputs, testAudioWorkletNodeOptionsClonability, wrapEventListener) => {
    return class AudioWorkletNode extends audioNodeConstructor {
        constructor(context, name, options) {
            var _a;
            const nativeContext = getNativeContext(context);
            const isOffline = isNativeOfflineAudioContext(nativeContext);
            const mergedOptions = sanitizeAudioWorkletNodeOptions({ ...DEFAULT_OPTIONS, ...options });
            // Bug #191: Safari doesn't throw an error if the options aren't clonable.
            testAudioWorkletNodeOptionsClonability(mergedOptions);
            const nodeNameToProcessorConstructorMap = NODE_NAME_TO_PROCESSOR_CONSTRUCTOR_MAPS.get(nativeContext);
            const processorConstructor = nodeNameToProcessorConstructorMap === null || nodeNameToProcessorConstructorMap === void 0 ? void 0 : nodeNameToProcessorConstructorMap.get(name);
            // Bug #186: Chrome and Edge do not allow to create an AudioWorkletNode on a closed AudioContext.
            const nativeContextOrBackupOfflineAudioContext = isOffline || nativeContext.state !== 'closed'
                ? nativeContext
                : (_a = getBackupOfflineAudioContext(nativeContext)) !== null && _a !== void 0 ? _a : nativeContext;
            const nativeAudioWorkletNode = createNativeAudioWorkletNode(nativeContextOrBackupOfflineAudioContext, isOffline ? null : context.baseLatency, nativeAudioWorkletNodeConstructor, name, processorConstructor, mergedOptions);
            const audioWorkletNodeRenderer = ((isOffline ? createAudioWorkletNodeRenderer(name, mergedOptions, processorConstructor) : null));
            /*
             * @todo Add a mechanism to switch an AudioWorkletNode to passive once the process() function of the AudioWorkletProcessor
             * returns false.
             */
            super(context, true, nativeAudioWorkletNode, audioWorkletNodeRenderer);
            const parameters = [];
            nativeAudioWorkletNode.parameters.forEach((nativeAudioParam, nm) => {
                const audioParam = createAudioParam(this, isOffline, nativeAudioParam);
                parameters.push([nm, audioParam]);
            });
            this._nativeAudioWorkletNode = nativeAudioWorkletNode;
            this._onprocessorerror = null;
            this._parameters = new ReadOnlyMap(parameters);
            /*
             * Bug #86 & #87: Invoking the renderer of an AudioWorkletNode might be necessary if it has no direct or indirect connection to
             * the destination.
             */
            if (isOffline) {
                addUnrenderedAudioWorkletNode(nativeContext, this);
            }
            const { activeInputs } = getAudioNodeConnections(this);
            setActiveAudioWorkletNodeInputs(nativeAudioWorkletNode, activeInputs);
        }
        get onprocessorerror() {
            return this._onprocessorerror;
        }
        set onprocessorerror(value) {
            const wrappedListener = typeof value === 'function' ? wrapEventListener(this, value) : null;
            this._nativeAudioWorkletNode.onprocessorerror = wrappedListener;
            const nativeOnProcessorError = this._nativeAudioWorkletNode.onprocessorerror;
            this._onprocessorerror =
                nativeOnProcessorError !== null && nativeOnProcessorError === wrappedListener
                    ? value
                    : nativeOnProcessorError;
        }
        get parameters() {
            if (this._parameters === null) {
                // @todo The definition that TypeScript uses of the AudioParamMap is lacking many methods.
                return this._nativeAudioWorkletNode.parameters;
            }
            return this._parameters;
        }
        get port() {
            return this._nativeAudioWorkletNode.port;
        }
    };
};

function copyFromChannel(audioBuffer, 
// @todo There is currently no way to define something like { [ key: number | string ]: Float32Array }
parent, key, channelNumber, bufferOffset) {
    if (typeof audioBuffer.copyFromChannel === 'function') {
        // The byteLength will be 0 when the ArrayBuffer was transferred.
        if (parent[key].byteLength === 0) {
            parent[key] = new Float32Array(128);
        }
        audioBuffer.copyFromChannel(parent[key], channelNumber, bufferOffset);
        // Bug #5: Safari does not support copyFromChannel().
    }
    else {
        const channelData = audioBuffer.getChannelData(channelNumber);
        // The byteLength will be 0 when the ArrayBuffer was transferred.
        if (parent[key].byteLength === 0) {
            parent[key] = channelData.slice(bufferOffset, bufferOffset + 128);
        }
        else {
            const slicedInput = new Float32Array(channelData.buffer, bufferOffset * Float32Array.BYTES_PER_ELEMENT, 128);
            parent[key].set(slicedInput);
        }
    }
}

const copyToChannel = (audioBuffer, parent, key, channelNumber, bufferOffset) => {
    if (typeof audioBuffer.copyToChannel === 'function') {
        // The byteLength will be 0 when the ArrayBuffer was transferred.
        if (parent[key].byteLength !== 0) {
            audioBuffer.copyToChannel(parent[key], channelNumber, bufferOffset);
        }
        // Bug #5: Safari does not support copyToChannel().
    }
    else {
        // The byteLength will be 0 when the ArrayBuffer was transferred.
        if (parent[key].byteLength !== 0) {
            audioBuffer.getChannelData(channelNumber).set(parent[key], bufferOffset);
        }
    }
};

const createNestedArrays = (x, y) => {
    const arrays = [];
    for (let i = 0; i < x; i += 1) {
        const array = [];
        const length = typeof y === 'number' ? y : y[i];
        for (let j = 0; j < length; j += 1) {
            array.push(new Float32Array(128));
        }
        arrays.push(array);
    }
    return arrays;
};

const getAudioWorkletProcessor = (nativeOfflineAudioContext, proxy) => {
    const nodeToProcessorMap = getValueForKey(NODE_TO_PROCESSOR_MAPS, nativeOfflineAudioContext);
    const nativeAudioWorkletNode = getNativeAudioNode(proxy);
    return getValueForKey(nodeToProcessorMap, nativeAudioWorkletNode);
};

const processBuffer = async (proxy, renderedBuffer, nativeOfflineAudioContext, options, outputChannelCount, processorConstructor, exposeCurrentFrameAndCurrentTime) => {
    // Ceil the length to the next full render quantum.
    // Bug #17: Safari does not yet expose the length.
    const length = renderedBuffer === null ? Math.ceil(proxy.context.length / 128) * 128 : renderedBuffer.length;
    const numberOfInputChannels = options.channelCount * options.numberOfInputs;
    const numberOfOutputChannels = outputChannelCount.reduce((sum, value) => sum + value, 0);
    const processedBuffer = numberOfOutputChannels === 0
        ? null
        : nativeOfflineAudioContext.createBuffer(numberOfOutputChannels, length, nativeOfflineAudioContext.sampleRate);
    if (processorConstructor === undefined) {
        throw new Error('Missing the processor constructor.');
    }
    const audioNodeConnections = getAudioNodeConnections(proxy);
    const audioWorkletProcessor = await getAudioWorkletProcessor(nativeOfflineAudioContext, proxy);
    const inputs = createNestedArrays(options.numberOfInputs, options.channelCount);
    const outputs = createNestedArrays(options.numberOfOutputs, outputChannelCount);
    const parameters = Array.from(proxy.parameters.keys()).reduce((prmtrs, name) => ({ ...prmtrs, [name]: new Float32Array(128) }), {});
    for (let i = 0; i < length; i += 128) {
        if (options.numberOfInputs > 0 && renderedBuffer !== null) {
            for (let j = 0; j < options.numberOfInputs; j += 1) {
                for (let k = 0; k < options.channelCount; k += 1) {
                    copyFromChannel(renderedBuffer, inputs[j], k, k, i);
                }
            }
        }
        if (processorConstructor.parameterDescriptors !== undefined && renderedBuffer !== null) {
            processorConstructor.parameterDescriptors.forEach(({ name }, index) => {
                copyFromChannel(renderedBuffer, parameters, name, numberOfInputChannels + index, i);
            });
        }
        for (let j = 0; j < options.numberOfInputs; j += 1) {
            for (let k = 0; k < outputChannelCount[j]; k += 1) {
                // The byteLength will be 0 when the ArrayBuffer was transferred.
                if (outputs[j][k].byteLength === 0) {
                    outputs[j][k] = new Float32Array(128);
                }
            }
        }
        try {
            const potentiallyEmptyInputs = inputs.map((input, index) => {
                if (audioNodeConnections.activeInputs[index].size === 0) {
                    return [];
                }
                return input;
            });
            const activeSourceFlag = exposeCurrentFrameAndCurrentTime(i / nativeOfflineAudioContext.sampleRate, nativeOfflineAudioContext.sampleRate, () => audioWorkletProcessor.process(potentiallyEmptyInputs, outputs, parameters));
            if (processedBuffer !== null) {
                for (let j = 0, outputChannelSplitterNodeOutput = 0; j < options.numberOfOutputs; j += 1) {
                    for (let k = 0; k < outputChannelCount[j]; k += 1) {
                        copyToChannel(processedBuffer, outputs[j], k, outputChannelSplitterNodeOutput + k, i);
                    }
                    outputChannelSplitterNodeOutput += outputChannelCount[j];
                }
            }
            if (!activeSourceFlag) {
                break;
            }
        }
        catch (error) {
            proxy.dispatchEvent(new ErrorEvent('processorerror', {
                colno: error.colno,
                filename: error.filename,
                lineno: error.lineno,
                message: error.message
            }));
            break;
        }
    }
    return processedBuffer;
};
const createAudioWorkletNodeRendererFactory = (connectAudioParam, connectMultipleOutputs, createNativeAudioBufferSourceNode, createNativeChannelMergerNode, createNativeChannelSplitterNode, createNativeConstantSourceNode, createNativeGainNode, deleteUnrenderedAudioWorkletNode, disconnectMultipleOutputs, exposeCurrentFrameAndCurrentTime, getNativeAudioNode, nativeAudioWorkletNodeConstructor, nativeOfflineAudioContextConstructor, renderAutomation, renderInputsOfAudioNode, renderNativeOfflineAudioContext) => {
    return (name, options, processorConstructor) => {
        const renderedNativeAudioNodes = new WeakMap();
        let processedBufferPromise = null;
        const createAudioNode = async (proxy, nativeOfflineAudioContext) => {
            let nativeAudioWorkletNode = getNativeAudioNode(proxy);
            let nativeOutputNodes = null;
            const nativeAudioWorkletNodeIsOwnedByContext = isOwnedByContext(nativeAudioWorkletNode, nativeOfflineAudioContext);
            const outputChannelCount = Array.isArray(options.outputChannelCount)
                ? options.outputChannelCount
                : Array.from(options.outputChannelCount);
            // Bug #61: Only Chrome, Edge & Firefox have an implementation of the AudioWorkletNode yet.
            if (nativeAudioWorkletNodeConstructor === null) {
                const numberOfOutputChannels = outputChannelCount.reduce((sum, value) => sum + value, 0);
                const outputChannelSplitterNode = createNativeChannelSplitterNode(nativeOfflineAudioContext, {
                    channelCount: Math.max(1, numberOfOutputChannels),
                    channelCountMode: 'explicit',
                    channelInterpretation: 'discrete',
                    numberOfOutputs: Math.max(1, numberOfOutputChannels)
                });
                const outputChannelMergerNodes = [];
                for (let i = 0; i < proxy.numberOfOutputs; i += 1) {
                    outputChannelMergerNodes.push(createNativeChannelMergerNode(nativeOfflineAudioContext, {
                        channelCount: 1,
                        channelCountMode: 'explicit',
                        channelInterpretation: 'speakers',
                        numberOfInputs: outputChannelCount[i]
                    }));
                }
                const outputGainNode = createNativeGainNode(nativeOfflineAudioContext, {
                    channelCount: options.channelCount,
                    channelCountMode: options.channelCountMode,
                    channelInterpretation: options.channelInterpretation,
                    gain: 1
                });
                outputGainNode.connect = connectMultipleOutputs.bind(null, outputChannelMergerNodes);
                outputGainNode.disconnect = disconnectMultipleOutputs.bind(null, outputChannelMergerNodes);
                nativeOutputNodes = [outputChannelSplitterNode, outputChannelMergerNodes, outputGainNode];
            }
            else if (!nativeAudioWorkletNodeIsOwnedByContext) {
                nativeAudioWorkletNode = new nativeAudioWorkletNodeConstructor(nativeOfflineAudioContext, name);
            }
            renderedNativeAudioNodes.set(nativeOfflineAudioContext, nativeOutputNodes === null ? nativeAudioWorkletNode : nativeOutputNodes[2]);
            if (nativeOutputNodes !== null) {
                if (processedBufferPromise === null) {
                    if (processorConstructor === undefined) {
                        throw new Error('Missing the processor constructor.');
                    }
                    if (nativeOfflineAudioContextConstructor === null) {
                        throw new Error('Missing the native OfflineAudioContext constructor.');
                    }
                    // Bug #47: The AudioDestinationNode in Safari gets not initialized correctly.
                    const numberOfInputChannels = proxy.channelCount * proxy.numberOfInputs;
                    const numberOfParameters = processorConstructor.parameterDescriptors === undefined ? 0 : processorConstructor.parameterDescriptors.length;
                    const numberOfChannels = numberOfInputChannels + numberOfParameters;
                    const renderBuffer = async () => {
                        const partialOfflineAudioContext = new nativeOfflineAudioContextConstructor(numberOfChannels, 
                        // Ceil the length to the next full render quantum.
                        // Bug #17: Safari does not yet expose the length.
                        Math.ceil(proxy.context.length / 128) * 128, nativeOfflineAudioContext.sampleRate);
                        const gainNodes = [];
                        const inputChannelSplitterNodes = [];
                        for (let i = 0; i < options.numberOfInputs; i += 1) {
                            gainNodes.push(createNativeGainNode(partialOfflineAudioContext, {
                                channelCount: options.channelCount,
                                channelCountMode: options.channelCountMode,
                                channelInterpretation: options.channelInterpretation,
                                gain: 1
                            }));
                            inputChannelSplitterNodes.push(createNativeChannelSplitterNode(partialOfflineAudioContext, {
                                channelCount: options.channelCount,
                                channelCountMode: 'explicit',
                                channelInterpretation: 'discrete',
                                numberOfOutputs: options.channelCount
                            }));
                        }
                        const constantSourceNodes = await Promise.all(Array.from(proxy.parameters.values()).map(async (audioParam) => {
                            const constantSourceNode = createNativeConstantSourceNode(partialOfflineAudioContext, {
                                channelCount: 1,
                                channelCountMode: 'explicit',
                                channelInterpretation: 'discrete',
                                offset: audioParam.value
                            });
                            await renderAutomation(partialOfflineAudioContext, audioParam, constantSourceNode.offset);
                            return constantSourceNode;
                        }));
                        const inputChannelMergerNode = createNativeChannelMergerNode(partialOfflineAudioContext, {
                            channelCount: 1,
                            channelCountMode: 'explicit',
                            channelInterpretation: 'speakers',
                            numberOfInputs: Math.max(1, numberOfInputChannels + numberOfParameters)
                        });
                        for (let i = 0; i < options.numberOfInputs; i += 1) {
                            gainNodes[i].connect(inputChannelSplitterNodes[i]);
                            for (let j = 0; j < options.channelCount; j += 1) {
                                inputChannelSplitterNodes[i].connect(inputChannelMergerNode, j, i * options.channelCount + j);
                            }
                        }
                        for (const [index, constantSourceNode] of constantSourceNodes.entries()) {
                            constantSourceNode.connect(inputChannelMergerNode, 0, numberOfInputChannels + index);
                            constantSourceNode.start(0);
                        }
                        inputChannelMergerNode.connect(partialOfflineAudioContext.destination);
                        await Promise.all(gainNodes.map((gainNode) => renderInputsOfAudioNode(proxy, partialOfflineAudioContext, gainNode)));
                        return renderNativeOfflineAudioContext(partialOfflineAudioContext);
                    };
                    processedBufferPromise = processBuffer(proxy, numberOfChannels === 0 ? null : await renderBuffer(), nativeOfflineAudioContext, options, outputChannelCount, processorConstructor, exposeCurrentFrameAndCurrentTime);
                }
                const processedBuffer = await processedBufferPromise;
                const audioBufferSourceNode = createNativeAudioBufferSourceNode(nativeOfflineAudioContext, {
                    buffer: null,
                    channelCount: 2,
                    channelCountMode: 'max',
                    channelInterpretation: 'speakers',
                    loop: false,
                    loopEnd: 0,
                    loopStart: 0,
                    playbackRate: 1
                });
                const [outputChannelSplitterNode, outputChannelMergerNodes, outputGainNode] = nativeOutputNodes;
                if (processedBuffer !== null) {
                    audioBufferSourceNode.buffer = processedBuffer;
                    audioBufferSourceNode.start(0);
                }
                audioBufferSourceNode.connect(outputChannelSplitterNode);
                for (let i = 0, outputChannelSplitterNodeOutput = 0; i < proxy.numberOfOutputs; i += 1) {
                    const outputChannelMergerNode = outputChannelMergerNodes[i];
                    for (let j = 0; j < outputChannelCount[i]; j += 1) {
                        outputChannelSplitterNode.connect(outputChannelMergerNode, outputChannelSplitterNodeOutput + j, j);
                    }
                    outputChannelSplitterNodeOutput += outputChannelCount[i];
                }
                return outputGainNode;
            }
            if (!nativeAudioWorkletNodeIsOwnedByContext) {
                for (const [nm, audioParam] of proxy.parameters.entries()) {
                    await renderAutomation(nativeOfflineAudioContext, audioParam, 
                    // @todo The definition that TypeScript uses of the AudioParamMap is lacking many methods.
                    nativeAudioWorkletNode.parameters.get(nm));
                }
            }
            else {
                for (const [nm, audioParam] of proxy.parameters.entries()) {
                    await connectAudioParam(nativeOfflineAudioContext, audioParam, 
                    // @todo The definition that TypeScript uses of the AudioParamMap is lacking many methods.
                    nativeAudioWorkletNode.parameters.get(nm));
                }
            }
            await renderInputsOfAudioNode(proxy, nativeOfflineAudioContext, nativeAudioWorkletNode);
            return nativeAudioWorkletNode;
        };
        return {
            render(proxy, nativeOfflineAudioContext) {
                deleteUnrenderedAudioWorkletNode(nativeOfflineAudioContext, proxy);
                const renderedNativeAudioWorkletNodeOrGainNode = renderedNativeAudioNodes.get(nativeOfflineAudioContext);
                if (renderedNativeAudioWorkletNodeOrGainNode !== undefined) {
                    return Promise.resolve(renderedNativeAudioWorkletNodeOrGainNode);
                }
                return createAudioNode(proxy, nativeOfflineAudioContext);
            }
        };
    };
};

const createCacheTestResult = (ongoingTests, testResults) => {
    return (tester, test) => {
        const cachedTestResult = testResults.get(tester);
        if (cachedTestResult !== undefined) {
            return cachedTestResult;
        }
        const ongoingTest = ongoingTests.get(tester);
        if (ongoingTest !== undefined) {
            return ongoingTest;
        }
        try {
            const synchronousTestResult = test();
            if (synchronousTestResult instanceof Promise) {
                ongoingTests.set(tester, synchronousTestResult);
                return synchronousTestResult
                    .catch(() => false)
                    .then((finalTestResult) => {
                    ongoingTests.delete(tester);
                    testResults.set(tester, finalTestResult);
                    return finalTestResult;
                });
            }
            testResults.set(tester, synchronousTestResult);
            return synchronousTestResult;
        }
        catch {
            testResults.set(tester, false);
            return false;
        }
    };
};

const createConnectAudioParam = (renderInputsOfAudioParam) => {
    return (nativeOfflineAudioContext, audioParam, nativeAudioParam) => {
        return renderInputsOfAudioParam(audioParam, nativeOfflineAudioContext, nativeAudioParam);
    };
};

const createConnectMultipleOutputs = (createIndexSizeError) => {
    return (outputAudioNodes, destination, output = 0, input = 0) => {
        const outputAudioNode = outputAudioNodes[output];
        if (outputAudioNode === undefined) {
            throw createIndexSizeError();
        }
        if (isNativeAudioNode$1(destination)) {
            return outputAudioNode.connect(destination, 0, input);
        }
        return outputAudioNode.connect(destination, 0);
    };
};

const createConvertNumberToUnsignedLong = (unit32Array) => {
    return (value) => {
        unit32Array[0] = value;
        return unit32Array[0];
    };
};

const createDecrementCycleCounter = (connectNativeAudioNodeToNativeAudioNode, cycleCounters, getAudioNodeConnections, getNativeAudioNode, getNativeAudioParam, getNativeContext, isActiveAudioNode, isNativeOfflineAudioContext) => {
    return (audioNode, count) => {
        const cycleCounter = cycleCounters.get(audioNode);
        if (cycleCounter === undefined) {
            throw new Error('Missing the expected cycle count.');
        }
        const nativeContext = getNativeContext(audioNode.context);
        const isOffline = isNativeOfflineAudioContext(nativeContext);
        if (cycleCounter === count) {
            cycleCounters.delete(audioNode);
            if (!isOffline && isActiveAudioNode(audioNode)) {
                const nativeSourceAudioNode = getNativeAudioNode(audioNode);
                const { outputs } = getAudioNodeConnections(audioNode);
                for (const output of outputs) {
                    if (isAudioNodeOutputConnection(output)) {
                        const nativeDestinationAudioNode = getNativeAudioNode(output[0]);
                        connectNativeAudioNodeToNativeAudioNode(nativeSourceAudioNode, nativeDestinationAudioNode, output[1], output[2]);
                    }
                    else {
                        const nativeDestinationAudioParam = getNativeAudioParam(output[0]);
                        nativeSourceAudioNode.connect(nativeDestinationAudioParam, output[1]);
                    }
                }
            }
        }
        else {
            cycleCounters.set(audioNode, cycleCounter - count);
        }
    };
};

const createDeleteActiveInputConnectionToAudioNode = (pickElementFromSet) => {
    return (activeInputs, source, output, input) => {
        return pickElementFromSet(activeInputs[input], (activeInputConnection) => activeInputConnection[0] === source && activeInputConnection[1] === output);
    };
};

const createDeleteUnrenderedAudioWorkletNode = (getUnrenderedAudioWorkletNodes) => {
    return (nativeContext, audioWorkletNode) => {
        getUnrenderedAudioWorkletNodes(nativeContext).delete(audioWorkletNode);
    };
};

const isDelayNode = (audioNode) => {
    return 'delayTime' in audioNode;
};

const createDetectCycles = (audioParamAudioNodeStore, getAudioNodeConnections, getValueForKey) => {
    return function detectCycles(chain, nextLink) {
        const audioNode = isAudioNode(nextLink) ? nextLink : getValueForKey(audioParamAudioNodeStore, nextLink);
        if (isDelayNode(audioNode)) {
            return [];
        }
        if (chain[0] === audioNode) {
            return [chain];
        }
        if (chain.includes(audioNode)) {
            return [];
        }
        const { outputs } = getAudioNodeConnections(audioNode);
        return Array.from(outputs)
            .map((outputConnection) => detectCycles([...chain, audioNode], outputConnection[0]))
            .reduce((mergedCycles, nestedCycles) => mergedCycles.concat(nestedCycles), []);
    };
};

const getOutputAudioNodeAtIndex = (createIndexSizeError, outputAudioNodes, output) => {
    const outputAudioNode = outputAudioNodes[output];
    if (outputAudioNode === undefined) {
        throw createIndexSizeError();
    }
    return outputAudioNode;
};
const createDisconnectMultipleOutputs = (createIndexSizeError) => {
    return (outputAudioNodes, destinationOrOutput = undefined, output = undefined, input = 0) => {
        if (destinationOrOutput === undefined) {
            return outputAudioNodes.forEach((outputAudioNode) => outputAudioNode.disconnect());
        }
        if (typeof destinationOrOutput === 'number') {
            return getOutputAudioNodeAtIndex(createIndexSizeError, outputAudioNodes, destinationOrOutput).disconnect();
        }
        if (isNativeAudioNode$1(destinationOrOutput)) {
            if (output === undefined) {
                return outputAudioNodes.forEach((outputAudioNode) => outputAudioNode.disconnect(destinationOrOutput));
            }
            if (input === undefined) {
                return getOutputAudioNodeAtIndex(createIndexSizeError, outputAudioNodes, output).disconnect(destinationOrOutput, 0);
            }
            return getOutputAudioNodeAtIndex(createIndexSizeError, outputAudioNodes, output).disconnect(destinationOrOutput, 0, input);
        }
        if (output === undefined) {
            return outputAudioNodes.forEach((outputAudioNode) => outputAudioNode.disconnect(destinationOrOutput));
        }
        return getOutputAudioNodeAtIndex(createIndexSizeError, outputAudioNodes, output).disconnect(destinationOrOutput, 0);
    };
};

const createEvaluateSource = (window) => {
    return (source) => new Promise((resolve, reject) => {
        if (window === null) {
            // Bug #182 Chrome and Edge do throw an instance of a SyntaxError instead of a DOMException.
            reject(new SyntaxError());
            return;
        }
        const head = window.document.head;
        if (head === null) {
            // Bug #182 Chrome and Edge do throw an instance of a SyntaxError instead of a DOMException.
            reject(new SyntaxError());
        }
        else {
            const script = window.document.createElement('script');
            // @todo Safari doesn't like URLs with a type of 'application/javascript; charset=utf-8'.
            const blob = new Blob([source], { type: 'application/javascript' });
            const url = URL.createObjectURL(blob);
            const originalOnErrorHandler = window.onerror;
            const removeErrorEventListenerAndRevokeUrl = () => {
                window.onerror = originalOnErrorHandler;
                URL.revokeObjectURL(url);
            };
            window.onerror = (message, src, lineno, colno, error) => {
                // @todo Edge thinks the source is the one of the html document.
                if (src === url || (src === window.location.href && lineno === 1 && colno === 1)) {
                    removeErrorEventListenerAndRevokeUrl();
                    reject(error);
                    return false;
                }
                if (originalOnErrorHandler !== null) {
                    return originalOnErrorHandler(message, src, lineno, colno, error);
                }
            };
            script.onerror = () => {
                removeErrorEventListenerAndRevokeUrl();
                // Bug #182 Chrome and Edge do throw an instance of a SyntaxError instead of a DOMException.
                reject(new SyntaxError());
            };
            script.onload = () => {
                removeErrorEventListenerAndRevokeUrl();
                resolve();
            };
            script.src = url;
            script.type = 'module';
            head.appendChild(script);
        }
    });
};

const createEventTargetConstructor = (wrapEventListener) => {
    return class EventTarget {
        constructor(_nativeEventTarget) {
            this._nativeEventTarget = _nativeEventTarget;
            this._listeners = new WeakMap();
        }
        addEventListener(type, listener, options) {
            if (listener !== null) {
                let wrappedEventListener = this._listeners.get(listener);
                if (wrappedEventListener === undefined) {
                    wrappedEventListener = wrapEventListener(this, listener);
                    if (typeof listener === 'function') {
                        this._listeners.set(listener, wrappedEventListener);
                    }
                }
                this._nativeEventTarget.addEventListener(type, wrappedEventListener, options);
            }
        }
        dispatchEvent(event) {
            return this._nativeEventTarget.dispatchEvent(event);
        }
        removeEventListener(type, listener, options) {
            const wrappedEventListener = listener === null ? undefined : this._listeners.get(listener);
            this._nativeEventTarget.removeEventListener(type, wrappedEventListener === undefined ? null : wrappedEventListener, options);
        }
    };
};

const createExposeCurrentFrameAndCurrentTime = (window) => {
    return (currentTime, sampleRate, fn) => {
        Object.defineProperties(window, {
            currentFrame: {
                configurable: true,
                get() {
                    return Math.round(currentTime * sampleRate);
                }
            },
            currentTime: {
                configurable: true,
                get() {
                    return currentTime;
                }
            }
        });
        try {
            return fn();
        }
        finally {
            if (window !== null) {
                delete window.currentFrame;
                delete window.currentTime;
            }
        }
    };
};

const createFetchSource = (createAbortError) => {
    return async (url) => {
        try {
            const response = await fetch(url);
            if (response.ok) {
                return [await response.text(), response.url];
            }
        }
        catch {
            // Ignore errors.
        } // tslint:disable-line:no-empty
        throw createAbortError();
    };
};

const createGetActiveAudioWorkletNodeInputs = (activeAudioWorkletNodeInputsStore, getValueForKey) => {
    return (nativeAudioWorkletNode) => getValueForKey(activeAudioWorkletNodeInputsStore, nativeAudioWorkletNode);
};

const createGetAudioNodeRenderer = (getAudioNodeConnections) => {
    return (audioNode) => {
        const audioNodeConnections = getAudioNodeConnections(audioNode);
        if (audioNodeConnections.renderer === null) {
            throw new Error('Missing the renderer of the given AudioNode in the audio graph.');
        }
        return audioNodeConnections.renderer;
    };
};

const createGetAudioNodeTailTime = (audioNodeTailTimeStore) => {
    return (audioNode) => { var _a; return (_a = audioNodeTailTimeStore.get(audioNode)) !== null && _a !== void 0 ? _a : 0; };
};

const createGetAudioParamRenderer = (getAudioParamConnections) => {
    return (audioParam) => {
        const audioParamConnections = getAudioParamConnections(audioParam);
        if (audioParamConnections.renderer === null) {
            throw new Error('Missing the renderer of the given AudioParam in the audio graph.');
        }
        return audioParamConnections.renderer;
    };
};

const createGetBackupOfflineAudioContext = (backupOfflineAudioContextStore) => {
    return (nativeContext) => {
        return backupOfflineAudioContextStore.get(nativeContext);
    };
};

const createInvalidStateError = () => new DOMException('', 'InvalidStateError');

const createGetNativeContext = (contextStore) => {
    return (context) => {
        const nativeContext = contextStore.get(context);
        if (nativeContext === undefined) {
            throw createInvalidStateError();
        }
        return (nativeContext);
    };
};

const createGetOrCreateBackupOfflineAudioContext = (backupOfflineAudioContextStore, nativeOfflineAudioContextConstructor) => {
    return (nativeContext) => {
        let backupOfflineAudioContext = backupOfflineAudioContextStore.get(nativeContext);
        if (backupOfflineAudioContext !== undefined) {
            return backupOfflineAudioContext;
        }
        if (nativeOfflineAudioContextConstructor === null) {
            throw new Error('Missing the native OfflineAudioContext constructor.');
        }
        // Bug #141: Safari does not support creating an OfflineAudioContext with less than 44100 Hz.
        backupOfflineAudioContext = new nativeOfflineAudioContextConstructor(1, 1, 44100);
        backupOfflineAudioContextStore.set(nativeContext, backupOfflineAudioContext);
        return backupOfflineAudioContext;
    };
};

const createGetUnrenderedAudioWorkletNodes = (unrenderedAudioWorkletNodeStore) => {
    return (nativeContext) => {
        const unrenderedAudioWorkletNodes = unrenderedAudioWorkletNodeStore.get(nativeContext);
        if (unrenderedAudioWorkletNodes === undefined) {
            throw new Error('The context has no set of AudioWorkletNodes.');
        }
        return unrenderedAudioWorkletNodes;
    };
};

const createInvalidAccessError = () => new DOMException('', 'InvalidAccessError');

const createIncrementCycleCounterFactory = (cycleCounters, disconnectNativeAudioNodeFromNativeAudioNode, getAudioNodeConnections, getNativeAudioNode, getNativeAudioParam, isActiveAudioNode) => {
    return (isOffline) => {
        return (audioNode, count) => {
            const cycleCounter = cycleCounters.get(audioNode);
            if (cycleCounter === undefined) {
                if (!isOffline && isActiveAudioNode(audioNode)) {
                    const nativeSourceAudioNode = getNativeAudioNode(audioNode);
                    const { outputs } = getAudioNodeConnections(audioNode);
                    for (const output of outputs) {
                        if (isAudioNodeOutputConnection(output)) {
                            const nativeDestinationAudioNode = getNativeAudioNode(output[0]);
                            disconnectNativeAudioNodeFromNativeAudioNode(nativeSourceAudioNode, nativeDestinationAudioNode, output[1], output[2]);
                        }
                        else {
                            const nativeDestinationAudioParam = getNativeAudioParam(output[0]);
                            nativeSourceAudioNode.disconnect(nativeDestinationAudioParam, output[1]);
                        }
                    }
                }
                cycleCounters.set(audioNode, count);
            }
            else {
                cycleCounters.set(audioNode, cycleCounter + count);
            }
        };
    };
};

const createIsNativeAudioContext = (nativeAudioContextConstructor) => {
    return (anything) => {
        return nativeAudioContextConstructor !== null && anything instanceof nativeAudioContextConstructor;
    };
};

const createIsNativeAudioNode = (window) => {
    return (anything) => {
        return window !== null && typeof window.AudioNode === 'function' && anything instanceof window.AudioNode;
    };
};

const createIsNativeAudioParam = (window) => {
    return (anything) => {
        return window !== null && typeof window.AudioParam === 'function' && anything instanceof window.AudioParam;
    };
};

const createIsNativeOfflineAudioContext = (nativeOfflineAudioContextConstructor) => {
    return (anything) => {
        return nativeOfflineAudioContextConstructor !== null && anything instanceof nativeOfflineAudioContextConstructor;
    };
};

const createIsSecureContext = (window) => window !== null && window.isSecureContext;

const createMediaStreamAudioSourceNodeConstructor = (audioNodeConstructor, createNativeMediaStreamAudioSourceNode, getNativeContext, isNativeOfflineAudioContext) => {
    return class MediaStreamAudioSourceNode extends audioNodeConstructor {
        constructor(context, options) {
            const nativeContext = getNativeContext(context);
            const nativeMediaStreamAudioSourceNode = createNativeMediaStreamAudioSourceNode(nativeContext, options);
            // Bug #172: Safari allows to create a MediaStreamAudioSourceNode with an OfflineAudioContext.
            if (isNativeOfflineAudioContext(nativeContext)) {
                throw new TypeError();
            }
            super(context, true, nativeMediaStreamAudioSourceNode, null);
            this._nativeMediaStreamAudioSourceNode = nativeMediaStreamAudioSourceNode;
        }
        get mediaStream() {
            return this._nativeMediaStreamAudioSourceNode.mediaStream;
        }
    };
};

const createMinimalAudioContextConstructor = (createInvalidStateError, createNotSupportedError, createUnknownError, minimalBaseAudioContextConstructor, nativeAudioContextConstructor) => {
    return class MinimalAudioContext extends minimalBaseAudioContextConstructor {
        constructor(options = {}) {
            if (nativeAudioContextConstructor === null) {
                throw new Error('Missing the native AudioContext constructor.');
            }
            let nativeAudioContext;
            try {
                nativeAudioContext = new nativeAudioContextConstructor(options);
            }
            catch (err) {
                // Bug #192 Safari does throw a SyntaxError if the sampleRate is not supported.
                if (err.code === 12 && err.message === 'sampleRate is not in range') {
                    throw createNotSupportedError();
                }
                throw err;
            }
            // Bug #131 Safari returns null when there are four other AudioContexts running already.
            if (nativeAudioContext === null) {
                throw createUnknownError();
            }
            // Bug #51 Only Chrome and Edge throw an error if the given latencyHint is invalid.
            if (!isValidLatencyHint(options.latencyHint)) {
                throw new TypeError(`The provided value '${options.latencyHint}' is not a valid enum value of type AudioContextLatencyCategory.`);
            }
            // Bug #150 Safari does not support setting the sampleRate.
            if (options.sampleRate !== undefined && nativeAudioContext.sampleRate !== options.sampleRate) {
                throw createNotSupportedError();
            }
            super(nativeAudioContext, 2);
            const { latencyHint } = options;
            const { sampleRate } = nativeAudioContext;
            // @todo The values for 'balanced', 'interactive' and 'playback' are just copied from Chrome's implementation.
            this._baseLatency =
                typeof nativeAudioContext.baseLatency === 'number'
                    ? nativeAudioContext.baseLatency
                    : latencyHint === 'balanced'
                        ? 512 / sampleRate
                        : latencyHint === 'interactive' || latencyHint === undefined
                            ? 256 / sampleRate
                            : latencyHint === 'playback'
                                ? 1024 / sampleRate
                                : /*
                                   * @todo The min (256) and max (16384) values are taken from the allowed bufferSize values of a
                                   * ScriptProcessorNode.
                                   */
                                    (Math.max(2, Math.min(128, Math.round((latencyHint * sampleRate) / 128))) * 128) / sampleRate;
            this._nativeAudioContext = nativeAudioContext;
            // Bug #188: Safari will set the context's state to 'interrupted' in case the user switches tabs.
            if (nativeAudioContextConstructor.name === 'webkitAudioContext') {
                this._nativeGainNode = nativeAudioContext.createGain();
                this._nativeOscillatorNode = nativeAudioContext.createOscillator();
                this._nativeGainNode.gain.value = 1e-37;
                this._nativeOscillatorNode.connect(this._nativeGainNode).connect(nativeAudioContext.destination);
                this._nativeOscillatorNode.start();
            }
            else {
                this._nativeGainNode = null;
                this._nativeOscillatorNode = null;
            }
            this._state = null;
            /*
             * Bug #34: Chrome and Edge pretend to be running right away, but fire an onstatechange event when the state actually changes
             * to 'running'.
             */
            if (nativeAudioContext.state === 'running') {
                this._state = 'suspended';
                const revokeState = () => {
                    if (this._state === 'suspended') {
                        this._state = null;
                    }
                    nativeAudioContext.removeEventListener('statechange', revokeState);
                };
                nativeAudioContext.addEventListener('statechange', revokeState);
            }
        }
        get baseLatency() {
            return this._baseLatency;
        }
        get state() {
            return this._state !== null ? this._state : this._nativeAudioContext.state;
        }
        close() {
            // Bug #35: Firefox does not throw an error if the AudioContext was closed before.
            if (this.state === 'closed') {
                return this._nativeAudioContext.close().then(() => {
                    throw createInvalidStateError();
                });
            }
            // Bug #34: If the state was set to suspended before it should be revoked now.
            if (this._state === 'suspended') {
                this._state = null;
            }
            return this._nativeAudioContext.close().then(() => {
                if (this._nativeGainNode !== null && this._nativeOscillatorNode !== null) {
                    this._nativeOscillatorNode.stop();
                    this._nativeGainNode.disconnect();
                    this._nativeOscillatorNode.disconnect();
                }
                deactivateAudioGraph(this);
            });
        }
        resume() {
            if (this._state === 'suspended') {
                return new Promise((resolve, reject) => {
                    const resolvePromise = () => {
                        this._nativeAudioContext.removeEventListener('statechange', resolvePromise);
                        if (this._nativeAudioContext.state === 'running') {
                            resolve();
                        }
                        else {
                            this.resume().then(resolve, reject);
                        }
                    };
                    this._nativeAudioContext.addEventListener('statechange', resolvePromise);
                });
            }
            return this._nativeAudioContext.resume().catch((err) => {
                // Bug #55: Chrome and Edge do throw an InvalidAccessError instead of an InvalidStateError.
                // Bug #56: Safari invokes the catch handler but without an error.
                if (err === undefined || err.code === 15) {
                    throw createInvalidStateError();
                }
                throw err;
            });
        }
        suspend() {
            return this._nativeAudioContext.suspend().catch((err) => {
                // Bug #56: Safari invokes the catch handler but without an error.
                if (err === undefined) {
                    throw createInvalidStateError();
                }
                throw err;
            });
        }
    };
};

const createMinimalBaseAudioContextConstructor = (audioDestinationNodeConstructor, createAudioListener, eventTargetConstructor, isNativeOfflineAudioContext, unrenderedAudioWorkletNodeStore, wrapEventListener) => {
    return class MinimalBaseAudioContext extends eventTargetConstructor {
        constructor(_nativeContext, numberOfChannels) {
            super(_nativeContext);
            this._nativeContext = _nativeContext;
            CONTEXT_STORE.set(this, _nativeContext);
            if (isNativeOfflineAudioContext(_nativeContext)) {
                unrenderedAudioWorkletNodeStore.set(_nativeContext, new Set());
            }
            this._destination = new audioDestinationNodeConstructor(this, numberOfChannels);
            this._listener = createAudioListener(this, _nativeContext);
            this._onstatechange = null;
        }
        get currentTime() {
            return this._nativeContext.currentTime;
        }
        get destination() {
            return this._destination;
        }
        get listener() {
            return this._listener;
        }
        get onstatechange() {
            return this._onstatechange;
        }
        set onstatechange(value) {
            const wrappedListener = typeof value === 'function' ? wrapEventListener(this, value) : null;
            this._nativeContext.onstatechange = wrappedListener;
            const nativeOnStateChange = this._nativeContext.onstatechange;
            this._onstatechange = nativeOnStateChange !== null && nativeOnStateChange === wrappedListener ? value : nativeOnStateChange;
        }
        get sampleRate() {
            return this._nativeContext.sampleRate;
        }
        get state() {
            return this._nativeContext.state;
        }
    };
};

const testPromiseSupport = (nativeContext) => {
    // This 12 numbers represent the 48 bytes of an empty WAVE file with a single sample.
    const uint32Array = new Uint32Array([1179011410, 40, 1163280727, 544501094, 16, 131073, 44100, 176400, 1048580, 1635017060, 4, 0]);
    try {
        // Bug #1: Safari requires a successCallback.
        const promise = nativeContext.decodeAudioData(uint32Array.buffer, () => {
            // Ignore the success callback.
        });
        if (promise === undefined) {
            return false;
        }
        promise.catch(() => {
            // Ignore rejected errors.
        });
        return true;
    }
    catch {
        // Ignore errors.
    }
    return false;
};

const createMonitorConnections = (insertElementInSet, isNativeAudioNode) => {
    return (nativeAudioNode, whenConnected, whenDisconnected) => {
        const connections = new Set();
        nativeAudioNode.connect = ((connect) => {
            // tslint:disable-next-line:invalid-void no-inferrable-types
            return (destination, output = 0, input = 0) => {
                const wasDisconnected = connections.size === 0;
                if (isNativeAudioNode(destination)) {
                    // @todo TypeScript cannot infer the overloaded signature with 3 arguments yet.
                    connect.call(nativeAudioNode, destination, output, input);
                    insertElementInSet(connections, [destination, output, input], (connection) => connection[0] === destination && connection[1] === output && connection[2] === input, true);
                    if (wasDisconnected) {
                        whenConnected();
                    }
                    return destination;
                }
                connect.call(nativeAudioNode, destination, output);
                insertElementInSet(connections, [destination, output], (connection) => connection[0] === destination && connection[1] === output, true);
                if (wasDisconnected) {
                    whenConnected();
                }
                return;
            };
        })(nativeAudioNode.connect);
        nativeAudioNode.disconnect = ((disconnect) => {
            return (destinationOrOutput, output, input) => {
                const wasConnected = connections.size > 0;
                if (destinationOrOutput === undefined) {
                    disconnect.apply(nativeAudioNode);
                    connections.clear();
                }
                else if (typeof destinationOrOutput === 'number') {
                    // @todo TypeScript cannot infer the overloaded signature with 1 argument yet.
                    disconnect.call(nativeAudioNode, destinationOrOutput);
                    for (const connection of connections) {
                        if (connection[1] === destinationOrOutput) {
                            connections.delete(connection);
                        }
                    }
                }
                else {
                    if (isNativeAudioNode(destinationOrOutput)) {
                        // @todo TypeScript cannot infer the overloaded signature with 3 arguments yet.
                        disconnect.call(nativeAudioNode, destinationOrOutput, output, input);
                    }
                    else {
                        // @todo TypeScript cannot infer the overloaded signature with 2 arguments yet.
                        disconnect.call(nativeAudioNode, destinationOrOutput, output);
                    }
                    for (const connection of connections) {
                        if (connection[0] === destinationOrOutput &&
                            (output === undefined || connection[1] === output) &&
                            (input === undefined || connection[2] === input)) {
                            connections.delete(connection);
                        }
                    }
                }
                const isDisconnected = connections.size === 0;
                if (wasConnected && isDisconnected) {
                    whenDisconnected();
                }
            };
        })(nativeAudioNode.disconnect);
        return nativeAudioNode;
    };
};

const assignNativeAudioNodeOption = (nativeAudioNode, options, option) => {
    const value = options[option];
    if (value !== undefined && value !== nativeAudioNode[option]) {
        nativeAudioNode[option] = value;
    }
};

const assignNativeAudioNodeOptions = (nativeAudioNode, options) => {
    assignNativeAudioNodeOption(nativeAudioNode, options, 'channelCount');
    assignNativeAudioNodeOption(nativeAudioNode, options, 'channelCountMode');
    assignNativeAudioNodeOption(nativeAudioNode, options, 'channelInterpretation');
};

const createNativeAudioBufferConstructor = (window) => {
    if (window === null) {
        return null;
    }
    if (window.hasOwnProperty('AudioBuffer')) {
        return window.AudioBuffer;
    }
    return null;
};

const assignNativeAudioNodeAudioParamValue = (nativeAudioNode, options, audioParam) => {
    const value = options[audioParam];
    if (value !== undefined && value !== nativeAudioNode[audioParam].value) {
        nativeAudioNode[audioParam].value = value;
    }
};

const wrapAudioBufferSourceNodeStartMethodConsecutiveCalls = (nativeAudioBufferSourceNode) => {
    nativeAudioBufferSourceNode.start = ((start) => {
        let isScheduled = false;
        return (when = 0, offset = 0, duration) => {
            if (isScheduled) {
                throw createInvalidStateError();
            }
            start.call(nativeAudioBufferSourceNode, when, offset, duration);
            isScheduled = true;
        };
    })(nativeAudioBufferSourceNode.start);
};

const wrapAudioScheduledSourceNodeStartMethodNegativeParameters = (nativeAudioScheduledSourceNode) => {
    nativeAudioScheduledSourceNode.start = ((start) => {
        return (when = 0, offset = 0, duration) => {
            if ((typeof duration === 'number' && duration < 0) || offset < 0 || when < 0) {
                throw new RangeError("The parameters can't be negative.");
            }
            // @todo TypeScript cannot infer the overloaded signature with 3 arguments yet.
            start.call(nativeAudioScheduledSourceNode, when, offset, duration);
        };
    })(nativeAudioScheduledSourceNode.start);
};

const wrapAudioScheduledSourceNodeStopMethodNegativeParameters = (nativeAudioScheduledSourceNode) => {
    nativeAudioScheduledSourceNode.stop = ((stop) => {
        return (when = 0) => {
            if (when < 0) {
                throw new RangeError("The parameter can't be negative.");
            }
            stop.call(nativeAudioScheduledSourceNode, when);
        };
    })(nativeAudioScheduledSourceNode.stop);
};

const createNativeAudioBufferSourceNodeFactory = (addSilentConnection, cacheTestResult, testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport, testAudioBufferSourceNodeStartMethodOffsetClampingSupport, testAudioBufferSourceNodeStopMethodNullifiedBufferSupport, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport, wrapAudioBufferSourceNodeStartMethodOffsetClampling, wrapAudioBufferSourceNodeStopMethodNullifiedBuffer, wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls) => {
    return (nativeContext, options) => {
        const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
        assignNativeAudioNodeOptions(nativeAudioBufferSourceNode, options);
        assignNativeAudioNodeAudioParamValue(nativeAudioBufferSourceNode, options, 'playbackRate');
        assignNativeAudioNodeOption(nativeAudioBufferSourceNode, options, 'buffer');
        // Bug #149: Safari does not yet support the detune AudioParam.
        assignNativeAudioNodeOption(nativeAudioBufferSourceNode, options, 'loop');
        assignNativeAudioNodeOption(nativeAudioBufferSourceNode, options, 'loopEnd');
        assignNativeAudioNodeOption(nativeAudioBufferSourceNode, options, 'loopStart');
        // Bug #69: Safari does allow calls to start() of an already scheduled AudioBufferSourceNode.
        if (!cacheTestResult(testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport, () => testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport(nativeContext))) {
            wrapAudioBufferSourceNodeStartMethodConsecutiveCalls(nativeAudioBufferSourceNode);
        }
        // Bug #154 & #155: Safari does not handle offsets which are equal to or greater than the duration of the buffer.
        if (!cacheTestResult(testAudioBufferSourceNodeStartMethodOffsetClampingSupport, () => testAudioBufferSourceNodeStartMethodOffsetClampingSupport(nativeContext))) {
            wrapAudioBufferSourceNodeStartMethodOffsetClampling(nativeAudioBufferSourceNode);
        }
        // Bug #162: Safari does throw an error when stop() is called on an AudioBufferSourceNode which has no buffer assigned to it.
        if (!cacheTestResult(testAudioBufferSourceNodeStopMethodNullifiedBufferSupport, () => testAudioBufferSourceNodeStopMethodNullifiedBufferSupport(nativeContext))) {
            wrapAudioBufferSourceNodeStopMethodNullifiedBuffer(nativeAudioBufferSourceNode, nativeContext);
        }
        // Bug #44: Safari does not throw a RangeError yet.
        if (!cacheTestResult(testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, () => testAudioScheduledSourceNodeStartMethodNegativeParametersSupport(nativeContext))) {
            wrapAudioScheduledSourceNodeStartMethodNegativeParameters(nativeAudioBufferSourceNode);
        }
        // Bug #19: Safari does not ignore calls to stop() of an already stopped AudioBufferSourceNode.
        if (!cacheTestResult(testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport, () => testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport(nativeContext))) {
            wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls(nativeAudioBufferSourceNode, nativeContext);
        }
        // Bug #44: Only Firefox does not throw a RangeError yet.
        if (!cacheTestResult(testAudioScheduledSourceNodeStopMethodNegativeParametersSupport, () => testAudioScheduledSourceNodeStopMethodNegativeParametersSupport(nativeContext))) {
            wrapAudioScheduledSourceNodeStopMethodNegativeParameters(nativeAudioBufferSourceNode);
        }
        // Bug #175: Safari will not fire an ended event if the AudioBufferSourceNode is unconnected.
        addSilentConnection(nativeContext, nativeAudioBufferSourceNode);
        return nativeAudioBufferSourceNode;
    };
};

const createNativeAudioContextConstructor = (window) => {
    if (window === null) {
        return null;
    }
    if (window.hasOwnProperty('AudioContext')) {
        return window.AudioContext;
    }
    return window.hasOwnProperty('webkitAudioContext') ? window.webkitAudioContext : null;
};

const createNativeAudioDestinationNodeFactory = (createNativeGainNode, overwriteAccessors) => {
    return (nativeContext, channelCount, isNodeOfNativeOfflineAudioContext) => {
        const nativeAudioDestinationNode = nativeContext.destination;
        // Bug #132: Safari does not have the correct channelCount.
        if (nativeAudioDestinationNode.channelCount !== channelCount) {
            try {
                nativeAudioDestinationNode.channelCount = channelCount;
            }
            catch {
                // Bug #169: Safari throws an error on each attempt to change the channelCount.
            }
        }
        // Bug #83: Safari does not have the correct channelCountMode.
        if (isNodeOfNativeOfflineAudioContext && nativeAudioDestinationNode.channelCountMode !== 'explicit') {
            nativeAudioDestinationNode.channelCountMode = 'explicit';
        }
        // Bug #47: The AudioDestinationNode in Safari does not initialize the maxChannelCount property correctly.
        if (nativeAudioDestinationNode.maxChannelCount === 0) {
            Object.defineProperty(nativeAudioDestinationNode, 'maxChannelCount', {
                value: channelCount
            });
        }
        // Bug #168: No browser does yet have an AudioDestinationNode with an output.
        const gainNode = createNativeGainNode(nativeContext, {
            channelCount,
            channelCountMode: nativeAudioDestinationNode.channelCountMode,
            channelInterpretation: nativeAudioDestinationNode.channelInterpretation,
            gain: 1
        });
        overwriteAccessors(gainNode, 'channelCount', (get) => () => get.call(gainNode), (set) => (value) => {
            set.call(gainNode, value);
            try {
                nativeAudioDestinationNode.channelCount = value;
            }
            catch (err) {
                // Bug #169: Safari throws an error on each attempt to change the channelCount.
                if (value > nativeAudioDestinationNode.maxChannelCount) {
                    throw err;
                }
            }
        });
        overwriteAccessors(gainNode, 'channelCountMode', (get) => () => get.call(gainNode), (set) => (value) => {
            set.call(gainNode, value);
            nativeAudioDestinationNode.channelCountMode = value;
        });
        overwriteAccessors(gainNode, 'channelInterpretation', (get) => () => get.call(gainNode), (set) => (value) => {
            set.call(gainNode, value);
            nativeAudioDestinationNode.channelInterpretation = value;
        });
        Object.defineProperty(gainNode, 'maxChannelCount', {
            get: () => nativeAudioDestinationNode.maxChannelCount
        });
        // @todo This should be disconnected when the context is closed.
        gainNode.connect(nativeAudioDestinationNode);
        return gainNode;
    };
};

const createNativeAudioWorkletNodeConstructor = (window) => {
    if (window === null) {
        return null;
    }
    return window.hasOwnProperty('AudioWorkletNode') ? window.AudioWorkletNode : null;
};

const testClonabilityOfAudioWorkletNodeOptions = (audioWorkletNodeOptions) => {
    const { port1 } = new MessageChannel();
    try {
        // This will throw an error if the audioWorkletNodeOptions are not clonable.
        port1.postMessage(audioWorkletNodeOptions);
    }
    finally {
        port1.close();
    }
};

const createNativeAudioWorkletNodeFactory = (createInvalidStateError, createNativeAudioWorkletNodeFaker, createNativeGainNode, createNotSupportedError, monitorConnections) => {
    return (nativeContext, baseLatency, nativeAudioWorkletNodeConstructor, name, processorConstructor, options) => {
        if (nativeAudioWorkletNodeConstructor !== null) {
            try {
                const nativeAudioWorkletNode = new nativeAudioWorkletNodeConstructor(nativeContext, name, options);
                const patchedEventListeners = new Map();
                let onprocessorerror = null;
                Object.defineProperties(nativeAudioWorkletNode, {
                    /*
                     * Bug #61: Overwriting the property accessors for channelCount and channelCountMode is necessary as long as some
                     * browsers have no native implementation to achieve a consistent behavior.
                     */
                    channelCount: {
                        get: () => options.channelCount,
                        set: () => {
                            throw createInvalidStateError();
                        }
                    },
                    channelCountMode: {
                        get: () => 'explicit',
                        set: () => {
                            throw createInvalidStateError();
                        }
                    },
                    // Bug #156: Chrome and Edge do not yet fire an ErrorEvent.
                    onprocessorerror: {
                        get: () => onprocessorerror,
                        set: (value) => {
                            if (typeof onprocessorerror === 'function') {
                                nativeAudioWorkletNode.removeEventListener('processorerror', onprocessorerror);
                            }
                            onprocessorerror = typeof value === 'function' ? value : null;
                            if (typeof onprocessorerror === 'function') {
                                nativeAudioWorkletNode.addEventListener('processorerror', onprocessorerror);
                            }
                        }
                    }
                });
                nativeAudioWorkletNode.addEventListener = ((addEventListener) => {
                    return (...args) => {
                        if (args[0] === 'processorerror') {
                            const unpatchedEventListener = typeof args[1] === 'function'
                                ? args[1]
                                : typeof args[1] === 'object' && args[1] !== null && typeof args[1].handleEvent === 'function'
                                    ? args[1].handleEvent
                                    : null;
                            if (unpatchedEventListener !== null) {
                                const patchedEventListener = patchedEventListeners.get(args[1]);
                                if (patchedEventListener !== undefined) {
                                    args[1] = patchedEventListener;
                                }
                                else {
                                    args[1] = (event) => {
                                        // Bug #178: Chrome and Edge do fire an event of type error.
                                        if (event.type === 'error') {
                                            Object.defineProperties(event, {
                                                type: { value: 'processorerror' }
                                            });
                                            unpatchedEventListener(event);
                                        }
                                        else {
                                            unpatchedEventListener(new ErrorEvent(args[0], { ...event }));
                                        }
                                    };
                                    patchedEventListeners.set(unpatchedEventListener, args[1]);
                                }
                            }
                        }
                        // Bug #178: Chrome and Edge do fire an event of type error.
                        addEventListener.call(nativeAudioWorkletNode, 'error', args[1], args[2]);
                        return addEventListener.call(nativeAudioWorkletNode, ...args);
                    };
                })(nativeAudioWorkletNode.addEventListener);
                nativeAudioWorkletNode.removeEventListener = ((removeEventListener) => {
                    return (...args) => {
                        if (args[0] === 'processorerror') {
                            const patchedEventListener = patchedEventListeners.get(args[1]);
                            if (patchedEventListener !== undefined) {
                                patchedEventListeners.delete(args[1]);
                                args[1] = patchedEventListener;
                            }
                        }
                        // Bug #178: Chrome and Edge do fire an event of type error.
                        removeEventListener.call(nativeAudioWorkletNode, 'error', args[1], args[2]);
                        return removeEventListener.call(nativeAudioWorkletNode, args[0], args[1], args[2]);
                    };
                })(nativeAudioWorkletNode.removeEventListener);
                /*
                 * Bug #86: Chrome and Edge do not invoke the process() function if the corresponding AudioWorkletNode is unconnected but
                 * has an output.
                 */
                if (options.numberOfOutputs !== 0) {
                    const nativeGainNode = createNativeGainNode(nativeContext, {
                        channelCount: 1,
                        channelCountMode: 'explicit',
                        channelInterpretation: 'discrete',
                        gain: 0
                    });
                    nativeAudioWorkletNode.connect(nativeGainNode).connect(nativeContext.destination);
                    const whenConnected = () => nativeGainNode.disconnect();
                    const whenDisconnected = () => nativeGainNode.connect(nativeContext.destination);
                    // @todo Disconnect the connection when the process() function of the AudioWorkletNode returns false.
                    return monitorConnections(nativeAudioWorkletNode, whenConnected, whenDisconnected);
                }
                return nativeAudioWorkletNode;
            }
            catch (err) {
                // Bug #60: Chrome & Edge throw an InvalidStateError instead of a NotSupportedError.
                if (err.code === 11) {
                    throw createNotSupportedError();
                }
                throw err;
            }
        }
        // Bug #61: Only Chrome & Edge have an implementation of the AudioWorkletNode yet.
        if (processorConstructor === undefined) {
            throw createNotSupportedError();
        }
        testClonabilityOfAudioWorkletNodeOptions(options);
        return createNativeAudioWorkletNodeFaker(nativeContext, baseLatency, processorConstructor, options);
    };
};

const computeBufferSize = (baseLatency, sampleRate) => {
    if (baseLatency === null) {
        return 512;
    }
    return Math.max(512, Math.min(16384, Math.pow(2, Math.round(Math.log2(baseLatency * sampleRate)))));
};

const cloneAudioWorkletNodeOptions = (audioWorkletNodeOptions) => {
    return new Promise((resolve, reject) => {
        const { port1, port2 } = new MessageChannel();
        port1.onmessage = ({ data }) => {
            port1.close();
            port2.close();
            resolve(data);
        };
        port1.onmessageerror = ({ data }) => {
            port1.close();
            port2.close();
            reject(data);
        };
        // This will throw an error if the audioWorkletNodeOptions are not clonable.
        port2.postMessage(audioWorkletNodeOptions);
    });
};

const createAudioWorkletProcessorPromise = async (processorConstructor, audioWorkletNodeOptions) => {
    const clonedAudioWorkletNodeOptions = await cloneAudioWorkletNodeOptions(audioWorkletNodeOptions);
    return new processorConstructor(clonedAudioWorkletNodeOptions);
};

const createAudioWorkletProcessor = (nativeContext, nativeAudioWorkletNode, processorConstructor, audioWorkletNodeOptions) => {
    let nodeToProcessorMap = NODE_TO_PROCESSOR_MAPS.get(nativeContext);
    if (nodeToProcessorMap === undefined) {
        nodeToProcessorMap = new WeakMap();
        NODE_TO_PROCESSOR_MAPS.set(nativeContext, nodeToProcessorMap);
    }
    const audioWorkletProcessorPromise = createAudioWorkletProcessorPromise(processorConstructor, audioWorkletNodeOptions);
    nodeToProcessorMap.set(nativeAudioWorkletNode, audioWorkletProcessorPromise);
    return audioWorkletProcessorPromise;
};

const createNativeAudioWorkletNodeFakerFactory = (connectMultipleOutputs, createIndexSizeError, createInvalidStateError, createNativeChannelMergerNode, createNativeChannelSplitterNode, createNativeConstantSourceNode, createNativeGainNode, createNativeScriptProcessorNode, createNotSupportedError, disconnectMultipleOutputs, exposeCurrentFrameAndCurrentTime, getActiveAudioWorkletNodeInputs, monitorConnections) => {
    return (nativeContext, baseLatency, processorConstructor, options) => {
        if (options.numberOfInputs === 0 && options.numberOfOutputs === 0) {
            throw createNotSupportedError();
        }
        const outputChannelCount = Array.isArray(options.outputChannelCount)
            ? options.outputChannelCount
            : Array.from(options.outputChannelCount);
        // @todo Check if any of the channelCount values is greater than the implementation's maximum number of channels.
        if (outputChannelCount.some((channelCount) => channelCount < 1)) {
            throw createNotSupportedError();
        }
        if (outputChannelCount.length !== options.numberOfOutputs) {
            throw createIndexSizeError();
        }
        // Bug #61: This is not part of the standard but required for the faker to work.
        if (options.channelCountMode !== 'explicit') {
            throw createNotSupportedError();
        }
        const numberOfInputChannels = options.channelCount * options.numberOfInputs;
        const numberOfOutputChannels = outputChannelCount.reduce((sum, value) => sum + value, 0);
        const numberOfParameters = processorConstructor.parameterDescriptors === undefined ? 0 : processorConstructor.parameterDescriptors.length;
        // Bug #61: This is not part of the standard but required for the faker to work.
        if (numberOfInputChannels + numberOfParameters > 6 || numberOfOutputChannels > 6) {
            throw createNotSupportedError();
        }
        const messageChannel = new MessageChannel();
        const gainNodes = [];
        const inputChannelSplitterNodes = [];
        for (let i = 0; i < options.numberOfInputs; i += 1) {
            gainNodes.push(createNativeGainNode(nativeContext, {
                channelCount: options.channelCount,
                channelCountMode: options.channelCountMode,
                channelInterpretation: options.channelInterpretation,
                gain: 1
            }));
            inputChannelSplitterNodes.push(createNativeChannelSplitterNode(nativeContext, {
                channelCount: options.channelCount,
                channelCountMode: 'explicit',
                channelInterpretation: 'discrete',
                numberOfOutputs: options.channelCount
            }));
        }
        const constantSourceNodes = [];
        if (processorConstructor.parameterDescriptors !== undefined) {
            for (const { defaultValue, maxValue, minValue, name } of processorConstructor.parameterDescriptors) {
                const constantSourceNode = createNativeConstantSourceNode(nativeContext, {
                    channelCount: 1,
                    channelCountMode: 'explicit',
                    channelInterpretation: 'discrete',
                    offset: options.parameterData[name] !== undefined
                        ? options.parameterData[name]
                        : defaultValue === undefined
                            ? 0
                            : defaultValue
                });
                Object.defineProperties(constantSourceNode.offset, {
                    defaultValue: {
                        get: () => (defaultValue === undefined ? 0 : defaultValue)
                    },
                    maxValue: {
                        get: () => (maxValue === undefined ? MOST_POSITIVE_SINGLE_FLOAT : maxValue)
                    },
                    minValue: {
                        get: () => (minValue === undefined ? MOST_NEGATIVE_SINGLE_FLOAT : minValue)
                    }
                });
                constantSourceNodes.push(constantSourceNode);
            }
        }
        const inputChannelMergerNode = createNativeChannelMergerNode(nativeContext, {
            channelCount: 1,
            channelCountMode: 'explicit',
            channelInterpretation: 'speakers',
            numberOfInputs: Math.max(1, numberOfInputChannels + numberOfParameters)
        });
        const bufferSize = computeBufferSize(baseLatency, nativeContext.sampleRate);
        const scriptProcessorNode = createNativeScriptProcessorNode(nativeContext, bufferSize, numberOfInputChannels + numberOfParameters, 
        // Bug #87: Only Firefox will fire an AudioProcessingEvent if there is no connected output.
        Math.max(1, numberOfOutputChannels));
        const outputChannelSplitterNode = createNativeChannelSplitterNode(nativeContext, {
            channelCount: Math.max(1, numberOfOutputChannels),
            channelCountMode: 'explicit',
            channelInterpretation: 'discrete',
            numberOfOutputs: Math.max(1, numberOfOutputChannels)
        });
        const outputChannelMergerNodes = [];
        for (let i = 0; i < options.numberOfOutputs; i += 1) {
            outputChannelMergerNodes.push(createNativeChannelMergerNode(nativeContext, {
                channelCount: 1,
                channelCountMode: 'explicit',
                channelInterpretation: 'speakers',
                numberOfInputs: outputChannelCount[i]
            }));
        }
        for (let i = 0; i < options.numberOfInputs; i += 1) {
            gainNodes[i].connect(inputChannelSplitterNodes[i]);
            for (let j = 0; j < options.channelCount; j += 1) {
                inputChannelSplitterNodes[i].connect(inputChannelMergerNode, j, i * options.channelCount + j);
            }
        }
        const parameterMap = new ReadOnlyMap(processorConstructor.parameterDescriptors === undefined
            ? []
            : processorConstructor.parameterDescriptors.map(({ name }, index) => {
                const constantSourceNode = constantSourceNodes[index];
                constantSourceNode.connect(inputChannelMergerNode, 0, numberOfInputChannels + index);
                constantSourceNode.start(0);
                return [name, constantSourceNode.offset];
            }));
        inputChannelMergerNode.connect(scriptProcessorNode);
        let channelInterpretation = options.channelInterpretation;
        let onprocessorerror = null;
        // Bug #87: Expose at least one output to make this node connectable.
        const outputAudioNodes = options.numberOfOutputs === 0 ? [scriptProcessorNode] : outputChannelMergerNodes;
        const nativeAudioWorkletNodeFaker = {
            get bufferSize() {
                return bufferSize;
            },
            get channelCount() {
                return options.channelCount;
            },
            set channelCount(_) {
                // Bug #61: This is not part of the standard but required for the faker to work.
                throw createInvalidStateError();
            },
            get channelCountMode() {
                return options.channelCountMode;
            },
            set channelCountMode(_) {
                // Bug #61: This is not part of the standard but required for the faker to work.
                throw createInvalidStateError();
            },
            get channelInterpretation() {
                return channelInterpretation;
            },
            set channelInterpretation(value) {
                for (const gainNode of gainNodes) {
                    gainNode.channelInterpretation = value;
                }
                channelInterpretation = value;
            },
            get context() {
                return scriptProcessorNode.context;
            },
            get inputs() {
                return gainNodes;
            },
            get numberOfInputs() {
                return options.numberOfInputs;
            },
            get numberOfOutputs() {
                return options.numberOfOutputs;
            },
            get onprocessorerror() {
                return onprocessorerror;
            },
            set onprocessorerror(value) {
                if (typeof onprocessorerror === 'function') {
                    nativeAudioWorkletNodeFaker.removeEventListener('processorerror', onprocessorerror);
                }
                onprocessorerror = typeof value === 'function' ? value : null;
                if (typeof onprocessorerror === 'function') {
                    nativeAudioWorkletNodeFaker.addEventListener('processorerror', onprocessorerror);
                }
            },
            get parameters() {
                return parameterMap;
            },
            get port() {
                return messageChannel.port2;
            },
            addEventListener(...args) {
                return scriptProcessorNode.addEventListener(args[0], args[1], args[2]);
            },
            connect: connectMultipleOutputs.bind(null, outputAudioNodes),
            disconnect: disconnectMultipleOutputs.bind(null, outputAudioNodes),
            dispatchEvent(...args) {
                return scriptProcessorNode.dispatchEvent(args[0]);
            },
            removeEventListener(...args) {
                return scriptProcessorNode.removeEventListener(args[0], args[1], args[2]);
            }
        };
        const patchedEventListeners = new Map();
        messageChannel.port1.addEventListener = ((addEventListener) => {
            return (...args) => {
                if (args[0] === 'message') {
                    const unpatchedEventListener = typeof args[1] === 'function'
                        ? args[1]
                        : typeof args[1] === 'object' && args[1] !== null && typeof args[1].handleEvent === 'function'
                            ? args[1].handleEvent
                            : null;
                    if (unpatchedEventListener !== null) {
                        const patchedEventListener = patchedEventListeners.get(args[1]);
                        if (patchedEventListener !== undefined) {
                            args[1] = patchedEventListener;
                        }
                        else {
                            args[1] = (event) => {
                                exposeCurrentFrameAndCurrentTime(nativeContext.currentTime, nativeContext.sampleRate, () => unpatchedEventListener(event));
                            };
                            patchedEventListeners.set(unpatchedEventListener, args[1]);
                        }
                    }
                }
                return addEventListener.call(messageChannel.port1, args[0], args[1], args[2]);
            };
        })(messageChannel.port1.addEventListener);
        messageChannel.port1.removeEventListener = ((removeEventListener) => {
            return (...args) => {
                if (args[0] === 'message') {
                    const patchedEventListener = patchedEventListeners.get(args[1]);
                    if (patchedEventListener !== undefined) {
                        patchedEventListeners.delete(args[1]);
                        args[1] = patchedEventListener;
                    }
                }
                return removeEventListener.call(messageChannel.port1, args[0], args[1], args[2]);
            };
        })(messageChannel.port1.removeEventListener);
        let onmessage = null;
        Object.defineProperty(messageChannel.port1, 'onmessage', {
            get: () => onmessage,
            set: (value) => {
                if (typeof onmessage === 'function') {
                    messageChannel.port1.removeEventListener('message', onmessage);
                }
                onmessage = typeof value === 'function' ? value : null;
                if (typeof onmessage === 'function') {
                    messageChannel.port1.addEventListener('message', onmessage);
                    messageChannel.port1.start();
                }
            }
        });
        processorConstructor.prototype.port = messageChannel.port1;
        let audioWorkletProcessor = null;
        const audioWorkletProcessorPromise = createAudioWorkletProcessor(nativeContext, nativeAudioWorkletNodeFaker, processorConstructor, options);
        audioWorkletProcessorPromise.then((dWrkltPrcssr) => (audioWorkletProcessor = dWrkltPrcssr));
        const inputs = createNestedArrays(options.numberOfInputs, options.channelCount);
        const outputs = createNestedArrays(options.numberOfOutputs, outputChannelCount);
        const parameters = processorConstructor.parameterDescriptors === undefined
            ? []
            : processorConstructor.parameterDescriptors.reduce((prmtrs, { name }) => ({ ...prmtrs, [name]: new Float32Array(128) }), {});
        let isActive = true;
        const disconnectOutputsGraph = () => {
            if (options.numberOfOutputs > 0) {
                scriptProcessorNode.disconnect(outputChannelSplitterNode);
            }
            for (let i = 0, outputChannelSplitterNodeOutput = 0; i < options.numberOfOutputs; i += 1) {
                const outputChannelMergerNode = outputChannelMergerNodes[i];
                for (let j = 0; j < outputChannelCount[i]; j += 1) {
                    outputChannelSplitterNode.disconnect(outputChannelMergerNode, outputChannelSplitterNodeOutput + j, j);
                }
                outputChannelSplitterNodeOutput += outputChannelCount[i];
            }
        };
        const activeInputIndexes = new Map();
        // tslint:disable-next-line:deprecation
        scriptProcessorNode.onaudioprocess = ({ inputBuffer, outputBuffer }) => {
            if (audioWorkletProcessor !== null) {
                const activeInputs = getActiveAudioWorkletNodeInputs(nativeAudioWorkletNodeFaker);
                for (let i = 0; i < bufferSize; i += 128) {
                    for (let j = 0; j < options.numberOfInputs; j += 1) {
                        for (let k = 0; k < options.channelCount; k += 1) {
                            copyFromChannel(inputBuffer, inputs[j], k, k, i);
                        }
                    }
                    if (processorConstructor.parameterDescriptors !== undefined) {
                        processorConstructor.parameterDescriptors.forEach(({ name }, index) => {
                            copyFromChannel(inputBuffer, parameters, name, numberOfInputChannels + index, i);
                        });
                    }
                    for (let j = 0; j < options.numberOfInputs; j += 1) {
                        for (let k = 0; k < outputChannelCount[j]; k += 1) {
                            // The byteLength will be 0 when the ArrayBuffer was transferred.
                            if (outputs[j][k].byteLength === 0) {
                                outputs[j][k] = new Float32Array(128);
                            }
                        }
                    }
                    try {
                        const potentiallyEmptyInputs = inputs.map((input, index) => {
                            const activeInput = activeInputs[index];
                            if (activeInput.size > 0) {
                                activeInputIndexes.set(index, bufferSize / 128);
                                return input;
                            }
                            const count = activeInputIndexes.get(index);
                            if (count === undefined) {
                                return [];
                            }
                            if (input.every((channelData) => channelData.every((sample) => sample === 0))) {
                                if (count === 1) {
                                    activeInputIndexes.delete(index);
                                }
                                else {
                                    activeInputIndexes.set(index, count - 1);
                                }
                            }
                            return input;
                        });
                        const activeSourceFlag = exposeCurrentFrameAndCurrentTime(nativeContext.currentTime + i / nativeContext.sampleRate, nativeContext.sampleRate, () => audioWorkletProcessor.process(potentiallyEmptyInputs, outputs, parameters));
                        isActive = activeSourceFlag;
                        for (let j = 0, outputChannelSplitterNodeOutput = 0; j < options.numberOfOutputs; j += 1) {
                            for (let k = 0; k < outputChannelCount[j]; k += 1) {
                                copyToChannel(outputBuffer, outputs[j], k, outputChannelSplitterNodeOutput + k, i);
                            }
                            outputChannelSplitterNodeOutput += outputChannelCount[j];
                        }
                    }
                    catch (error) {
                        isActive = false;
                        nativeAudioWorkletNodeFaker.dispatchEvent(new ErrorEvent('processorerror', {
                            colno: error.colno,
                            filename: error.filename,
                            lineno: error.lineno,
                            message: error.message
                        }));
                    }
                    if (!isActive) {
                        for (let j = 0; j < options.numberOfInputs; j += 1) {
                            gainNodes[j].disconnect(inputChannelSplitterNodes[j]);
                            for (let k = 0; k < options.channelCount; k += 1) {
                                inputChannelSplitterNodes[i].disconnect(inputChannelMergerNode, k, j * options.channelCount + k);
                            }
                        }
                        if (processorConstructor.parameterDescriptors !== undefined) {
                            const length = processorConstructor.parameterDescriptors.length;
                            for (let j = 0; j < length; j += 1) {
                                const constantSourceNode = constantSourceNodes[j];
                                constantSourceNode.disconnect(inputChannelMergerNode, 0, numberOfInputChannels + j);
                                constantSourceNode.stop();
                            }
                        }
                        inputChannelMergerNode.disconnect(scriptProcessorNode);
                        scriptProcessorNode.onaudioprocess = null; // tslint:disable-line:deprecation
                        if (isConnected) {
                            disconnectOutputsGraph();
                        }
                        else {
                            disconnectFakeGraph();
                        }
                        break;
                    }
                }
            }
        };
        let isConnected = false;
        // Bug #87: Only Firefox will fire an AudioProcessingEvent if there is no connected output.
        const nativeGainNode = createNativeGainNode(nativeContext, {
            channelCount: 1,
            channelCountMode: 'explicit',
            channelInterpretation: 'discrete',
            gain: 0
        });
        const connectFakeGraph = () => scriptProcessorNode.connect(nativeGainNode).connect(nativeContext.destination);
        const disconnectFakeGraph = () => {
            scriptProcessorNode.disconnect(nativeGainNode);
            nativeGainNode.disconnect();
        };
        const whenConnected = () => {
            if (isActive) {
                disconnectFakeGraph();
                if (options.numberOfOutputs > 0) {
                    scriptProcessorNode.connect(outputChannelSplitterNode);
                }
                for (let i = 0, outputChannelSplitterNodeOutput = 0; i < options.numberOfOutputs; i += 1) {
                    const outputChannelMergerNode = outputChannelMergerNodes[i];
                    for (let j = 0; j < outputChannelCount[i]; j += 1) {
                        outputChannelSplitterNode.connect(outputChannelMergerNode, outputChannelSplitterNodeOutput + j, j);
                    }
                    outputChannelSplitterNodeOutput += outputChannelCount[i];
                }
            }
            isConnected = true;
        };
        const whenDisconnected = () => {
            if (isActive) {
                connectFakeGraph();
                disconnectOutputsGraph();
            }
            isConnected = false;
        };
        connectFakeGraph();
        return monitorConnections(nativeAudioWorkletNodeFaker, whenConnected, whenDisconnected);
    };
};

const createNativeChannelMergerNodeFactory = (nativeAudioContextConstructor, wrapChannelMergerNode) => {
    return (nativeContext, options) => {
        const nativeChannelMergerNode = nativeContext.createChannelMerger(options.numberOfInputs);
        /*
         * Bug #20: Safari requires a connection of any kind to treat the input signal correctly.
         * @todo Unfortunately there is no way to test for this behavior in a synchronous fashion which is why testing for the existence of
         * the webkitAudioContext is used as a workaround here.
         */
        if (nativeAudioContextConstructor !== null && nativeAudioContextConstructor.name === 'webkitAudioContext') {
            wrapChannelMergerNode(nativeContext, nativeChannelMergerNode);
        }
        assignNativeAudioNodeOptions(nativeChannelMergerNode, options);
        return nativeChannelMergerNode;
    };
};

const wrapChannelSplitterNode = (channelSplitterNode) => {
    const channelCount = channelSplitterNode.numberOfOutputs;
    // Bug #97: Safari does not throw an error when attempting to change the channelCount to something other than its initial value.
    Object.defineProperty(channelSplitterNode, 'channelCount', {
        get: () => channelCount,
        set: (value) => {
            if (value !== channelCount) {
                throw createInvalidStateError();
            }
        }
    });
    // Bug #30: Safari does not throw an error when attempting to change the channelCountMode to something other than explicit.
    Object.defineProperty(channelSplitterNode, 'channelCountMode', {
        get: () => 'explicit',
        set: (value) => {
            if (value !== 'explicit') {
                throw createInvalidStateError();
            }
        }
    });
    // Bug #32: Safari does not throw an error when attempting to change the channelInterpretation to something other than discrete.
    Object.defineProperty(channelSplitterNode, 'channelInterpretation', {
        get: () => 'discrete',
        set: (value) => {
            if (value !== 'discrete') {
                throw createInvalidStateError();
            }
        }
    });
};

const createNativeChannelSplitterNode = (nativeContext, options) => {
    const nativeChannelSplitterNode = nativeContext.createChannelSplitter(options.numberOfOutputs);
    // Bug #96: Safari does not have the correct channelCount.
    // Bug #29: Safari does not have the correct channelCountMode.
    // Bug #31: Safari does not have the correct channelInterpretation.
    assignNativeAudioNodeOptions(nativeChannelSplitterNode, options);
    // Bug #29, #30, #31, #32, #96 & #97: Only Chrome, Edge & Firefox partially support the spec yet.
    wrapChannelSplitterNode(nativeChannelSplitterNode);
    return nativeChannelSplitterNode;
};

const createNativeConstantSourceNodeFactory = (addSilentConnection, cacheTestResult, createNativeConstantSourceNodeFaker, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport) => {
    return (nativeContext, options) => {
        // Bug #62: Safari does not support ConstantSourceNodes.
        if (nativeContext.createConstantSource === undefined) {
            return createNativeConstantSourceNodeFaker(nativeContext, options);
        }
        const nativeConstantSourceNode = nativeContext.createConstantSource();
        assignNativeAudioNodeOptions(nativeConstantSourceNode, options);
        assignNativeAudioNodeAudioParamValue(nativeConstantSourceNode, options, 'offset');
        // Bug #44: Safari does not throw a RangeError yet.
        if (!cacheTestResult(testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, () => testAudioScheduledSourceNodeStartMethodNegativeParametersSupport(nativeContext))) {
            wrapAudioScheduledSourceNodeStartMethodNegativeParameters(nativeConstantSourceNode);
        }
        // Bug #44: Only Firefox does not throw a RangeError yet.
        if (!cacheTestResult(testAudioScheduledSourceNodeStopMethodNegativeParametersSupport, () => testAudioScheduledSourceNodeStopMethodNegativeParametersSupport(nativeContext))) {
            wrapAudioScheduledSourceNodeStopMethodNegativeParameters(nativeConstantSourceNode);
        }
        // Bug #175: Safari will not fire an ended event if the ConstantSourceNode is unconnected.
        addSilentConnection(nativeContext, nativeConstantSourceNode);
        return nativeConstantSourceNode;
    };
};

const interceptConnections = (original, interceptor) => {
    original.connect = interceptor.connect.bind(interceptor);
    original.disconnect = interceptor.disconnect.bind(interceptor);
    return original;
};

const createNativeConstantSourceNodeFakerFactory = (addSilentConnection, createNativeAudioBufferSourceNode, createNativeGainNode, monitorConnections) => {
    return (nativeContext, { offset, ...audioNodeOptions }) => {
        const audioBuffer = nativeContext.createBuffer(1, 2, 44100);
        const audioBufferSourceNode = createNativeAudioBufferSourceNode(nativeContext, {
            buffer: null,
            channelCount: 2,
            channelCountMode: 'max',
            channelInterpretation: 'speakers',
            loop: false,
            loopEnd: 0,
            loopStart: 0,
            playbackRate: 1
        });
        const gainNode = createNativeGainNode(nativeContext, { ...audioNodeOptions, gain: offset });
        // Bug #5: Safari does not support copyFromChannel() and copyToChannel().
        const channelData = audioBuffer.getChannelData(0);
        // Bug #95: Safari does not play or loop one sample buffers.
        channelData[0] = 1;
        channelData[1] = 1;
        audioBufferSourceNode.buffer = audioBuffer;
        audioBufferSourceNode.loop = true;
        const nativeConstantSourceNodeFaker = {
            get bufferSize() {
                return undefined;
            },
            get channelCount() {
                return gainNode.channelCount;
            },
            set channelCount(value) {
                gainNode.channelCount = value;
            },
            get channelCountMode() {
                return gainNode.channelCountMode;
            },
            set channelCountMode(value) {
                gainNode.channelCountMode = value;
            },
            get channelInterpretation() {
                return gainNode.channelInterpretation;
            },
            set channelInterpretation(value) {
                gainNode.channelInterpretation = value;
            },
            get context() {
                return gainNode.context;
            },
            get inputs() {
                return [];
            },
            get numberOfInputs() {
                return audioBufferSourceNode.numberOfInputs;
            },
            get numberOfOutputs() {
                return gainNode.numberOfOutputs;
            },
            get offset() {
                return gainNode.gain;
            },
            get onended() {
                return audioBufferSourceNode.onended;
            },
            set onended(value) {
                audioBufferSourceNode.onended = value;
            },
            addEventListener(...args) {
                return audioBufferSourceNode.addEventListener(args[0], args[1], args[2]);
            },
            dispatchEvent(...args) {
                return audioBufferSourceNode.dispatchEvent(args[0]);
            },
            removeEventListener(...args) {
                return audioBufferSourceNode.removeEventListener(args[0], args[1], args[2]);
            },
            start(when = 0) {
                audioBufferSourceNode.start.call(audioBufferSourceNode, when);
            },
            stop(when = 0) {
                audioBufferSourceNode.stop.call(audioBufferSourceNode, when);
            }
        };
        const whenConnected = () => audioBufferSourceNode.connect(gainNode);
        const whenDisconnected = () => audioBufferSourceNode.disconnect(gainNode);
        // Bug #175: Safari will not fire an ended event if the AudioBufferSourceNode is unconnected.
        addSilentConnection(nativeContext, audioBufferSourceNode);
        return monitorConnections(interceptConnections(nativeConstantSourceNodeFaker, gainNode), whenConnected, whenDisconnected);
    };
};

const createNativeGainNode = (nativeContext, options) => {
    const nativeGainNode = nativeContext.createGain();
    assignNativeAudioNodeOptions(nativeGainNode, options);
    assignNativeAudioNodeAudioParamValue(nativeGainNode, options, 'gain');
    return nativeGainNode;
};

const createNativeMediaStreamAudioSourceNode = (nativeAudioContext, { mediaStream }) => {
    const audioStreamTracks = mediaStream.getAudioTracks();
    /*
     * Bug #151: Safari does not use the audio track as input anymore if it gets removed from the mediaStream after construction.
     * Bug #159: Safari picks the first audio track if the MediaStream has more than one audio track.
     */
    audioStreamTracks.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const filteredAudioStreamTracks = audioStreamTracks.slice(0, 1);
    const nativeMediaStreamAudioSourceNode = nativeAudioContext.createMediaStreamSource(new MediaStream(filteredAudioStreamTracks));
    /*
     * Bug #151 & #159: The given mediaStream gets reconstructed before it gets passed to the native node which is why the accessor needs
     * to be overwritten as it would otherwise expose the reconstructed version.
     */
    Object.defineProperty(nativeMediaStreamAudioSourceNode, 'mediaStream', { value: mediaStream });
    return nativeMediaStreamAudioSourceNode;
};

const createNativeOfflineAudioContextConstructor = (window) => {
    if (window === null) {
        return null;
    }
    if (window.hasOwnProperty('OfflineAudioContext')) {
        return window.OfflineAudioContext;
    }
    return window.hasOwnProperty('webkitOfflineAudioContext') ? window.webkitOfflineAudioContext : null;
};

const createNativeScriptProcessorNode = (nativeContext, bufferSize, numberOfInputChannels, numberOfOutputChannels) => {
    return nativeContext.createScriptProcessor(bufferSize, numberOfInputChannels, numberOfOutputChannels); // tslint:disable-line deprecation
};

const createNotSupportedError = () => new DOMException('', 'NotSupportedError');

const createRenderAutomation = (getAudioParamRenderer, renderInputsOfAudioParam) => {
    return (nativeOfflineAudioContext, audioParam, nativeAudioParam) => {
        const audioParamRenderer = getAudioParamRenderer(audioParam);
        audioParamRenderer.replay(nativeAudioParam);
        return renderInputsOfAudioParam(audioParam, nativeOfflineAudioContext, nativeAudioParam);
    };
};

const createRenderInputsOfAudioNode = (getAudioNodeConnections, getAudioNodeRenderer, isPartOfACycle) => {
    return async (audioNode, nativeOfflineAudioContext, nativeAudioNode) => {
        const audioNodeConnections = getAudioNodeConnections(audioNode);
        await Promise.all(audioNodeConnections.activeInputs
            .map((connections, input) => Array.from(connections).map(async ([source, output]) => {
            const audioNodeRenderer = getAudioNodeRenderer(source);
            const renderedNativeAudioNode = await audioNodeRenderer.render(source, nativeOfflineAudioContext);
            const destination = audioNode.context.destination;
            if (!isPartOfACycle(source) && (audioNode !== destination || !isPartOfACycle(audioNode))) {
                renderedNativeAudioNode.connect(nativeAudioNode, output, input);
            }
        }))
            .reduce((allRenderingPromises, renderingPromises) => [...allRenderingPromises, ...renderingPromises], []));
    };
};

const createRenderInputsOfAudioParam = (getAudioNodeRenderer, getAudioParamConnections, isPartOfACycle) => {
    return async (audioParam, nativeOfflineAudioContext, nativeAudioParam) => {
        const audioParamConnections = getAudioParamConnections(audioParam);
        await Promise.all(Array.from(audioParamConnections.activeInputs).map(async ([source, output]) => {
            const audioNodeRenderer = getAudioNodeRenderer(source);
            const renderedNativeAudioNode = await audioNodeRenderer.render(source, nativeOfflineAudioContext);
            if (!isPartOfACycle(source)) {
                renderedNativeAudioNode.connect(nativeAudioParam, output);
            }
        }));
    };
};

const createRenderNativeOfflineAudioContext = (cacheTestResult, createNativeGainNode, createNativeScriptProcessorNode, testOfflineAudioContextCurrentTimeSupport) => {
    return (nativeOfflineAudioContext) => {
        // Bug #21: Safari does not support promises yet.
        if (cacheTestResult(testPromiseSupport, () => testPromiseSupport(nativeOfflineAudioContext))) {
            // Bug #158: Chrome and Edge do not advance currentTime if it is not accessed while rendering the audio.
            return Promise.resolve(cacheTestResult(testOfflineAudioContextCurrentTimeSupport, testOfflineAudioContextCurrentTimeSupport)).then((isOfflineAudioContextCurrentTimeSupported) => {
                if (!isOfflineAudioContextCurrentTimeSupported) {
                    const scriptProcessorNode = createNativeScriptProcessorNode(nativeOfflineAudioContext, 512, 0, 1);
                    nativeOfflineAudioContext.oncomplete = () => {
                        scriptProcessorNode.onaudioprocess = null; // tslint:disable-line:deprecation
                        scriptProcessorNode.disconnect();
                    };
                    scriptProcessorNode.onaudioprocess = () => nativeOfflineAudioContext.currentTime; // tslint:disable-line:deprecation
                    scriptProcessorNode.connect(nativeOfflineAudioContext.destination);
                }
                return nativeOfflineAudioContext.startRendering();
            });
        }
        return new Promise((resolve) => {
            // Bug #48: Safari does not render an OfflineAudioContext without any connected node.
            const gainNode = createNativeGainNode(nativeOfflineAudioContext, {
                channelCount: 1,
                channelCountMode: 'explicit',
                channelInterpretation: 'discrete',
                gain: 0
            });
            nativeOfflineAudioContext.oncomplete = (event) => {
                gainNode.disconnect();
                resolve(event.renderedBuffer);
            };
            gainNode.connect(nativeOfflineAudioContext.destination);
            nativeOfflineAudioContext.startRendering();
        });
    };
};

const createSetActiveAudioWorkletNodeInputs = (activeAudioWorkletNodeInputsStore) => {
    return (nativeAudioWorkletNode, activeInputs) => {
        activeAudioWorkletNodeInputsStore.set(nativeAudioWorkletNode, activeInputs);
    };
};

// Bug #33: Safari exposes an AudioBuffer but it can't be used as a constructor.
const createTestAudioBufferConstructorSupport = (nativeAudioBufferConstructor) => {
    return () => {
        if (nativeAudioBufferConstructor === null) {
            return false;
        }
        try {
            new nativeAudioBufferConstructor({ length: 1, sampleRate: 44100 }); // tslint:disable-line:no-unused-expression
        }
        catch {
            return false;
        }
        return true;
    };
};

// Bug #179: Firefox does not allow to transfer any buffer which has been passed to the process() method as an argument.
const createTestAudioWorkletProcessorPostMessageSupport = (nativeAudioWorkletNodeConstructor, nativeOfflineAudioContextConstructor) => {
    return async () => {
        // Bug #61: If there is no native AudioWorkletNode it gets faked and therefore it is no problem if the it doesn't exist.
        if (nativeAudioWorkletNodeConstructor === null) {
            return true;
        }
        if (nativeOfflineAudioContextConstructor === null) {
            return false;
        }
        const blob = new Blob(['class A extends AudioWorkletProcessor{process(i){this.port.postMessage(i,[i[0][0].buffer])}}registerProcessor("a",A)'], {
            type: 'application/javascript; charset=utf-8'
        });
        // Bug #141: Safari does not support creating an OfflineAudioContext with less than 44100 Hz.
        const offlineAudioContext = new nativeOfflineAudioContextConstructor(1, 128, 44100);
        const url = URL.createObjectURL(blob);
        let isEmittingMessageEvents = false;
        let isEmittingProcessorErrorEvents = false;
        try {
            await offlineAudioContext.audioWorklet.addModule(url);
            const audioWorkletNode = new nativeAudioWorkletNodeConstructor(offlineAudioContext, 'a', { numberOfOutputs: 0 });
            const oscillator = offlineAudioContext.createOscillator();
            audioWorkletNode.port.onmessage = () => (isEmittingMessageEvents = true);
            audioWorkletNode.onprocessorerror = () => (isEmittingProcessorErrorEvents = true);
            oscillator.connect(audioWorkletNode);
            oscillator.start(0);
            await offlineAudioContext.startRendering();
            // Bug #197: Safari does not deliver the messages before the promise returned by startRendering() resolves.
            await new Promise((resolve) => setTimeout(resolve));
        }
        catch {
            // Ignore errors.
        }
        finally {
            URL.revokeObjectURL(url);
        }
        return isEmittingMessageEvents && !isEmittingProcessorErrorEvents;
    };
};

const createTestOfflineAudioContextCurrentTimeSupport = (createNativeGainNode, nativeOfflineAudioContextConstructor) => {
    return () => {
        if (nativeOfflineAudioContextConstructor === null) {
            return Promise.resolve(false);
        }
        const nativeOfflineAudioContext = new nativeOfflineAudioContextConstructor(1, 1, 44100);
        // Bug #48: Safari does not render an OfflineAudioContext without any connected node.
        const gainNode = createNativeGainNode(nativeOfflineAudioContext, {
            channelCount: 1,
            channelCountMode: 'explicit',
            channelInterpretation: 'discrete',
            gain: 0
        });
        // Bug #21: Safari does not support promises yet.
        return new Promise((resolve) => {
            nativeOfflineAudioContext.oncomplete = () => {
                gainNode.disconnect();
                resolve(nativeOfflineAudioContext.currentTime !== 0);
            };
            nativeOfflineAudioContext.startRendering();
        });
    };
};

const createUnknownError = () => new DOMException('', 'UnknownError');

const createWindow$1 = () => (typeof window === 'undefined' ? null : window);

const createWrapAudioBufferCopyChannelMethods = (convertNumberToUnsignedLong, createIndexSizeError) => {
    return (audioBuffer) => {
        audioBuffer.copyFromChannel = (destination, channelNumberAsNumber, bufferOffsetAsNumber = 0) => {
            const bufferOffset = convertNumberToUnsignedLong(bufferOffsetAsNumber);
            const channelNumber = convertNumberToUnsignedLong(channelNumberAsNumber);
            if (channelNumber >= audioBuffer.numberOfChannels) {
                throw createIndexSizeError();
            }
            const audioBufferLength = audioBuffer.length;
            const channelData = audioBuffer.getChannelData(channelNumber);
            const destinationLength = destination.length;
            for (let i = bufferOffset < 0 ? -bufferOffset : 0; i + bufferOffset < audioBufferLength && i < destinationLength; i += 1) {
                destination[i] = channelData[i + bufferOffset];
            }
        };
        audioBuffer.copyToChannel = (source, channelNumberAsNumber, bufferOffsetAsNumber = 0) => {
            const bufferOffset = convertNumberToUnsignedLong(bufferOffsetAsNumber);
            const channelNumber = convertNumberToUnsignedLong(channelNumberAsNumber);
            if (channelNumber >= audioBuffer.numberOfChannels) {
                throw createIndexSizeError();
            }
            const audioBufferLength = audioBuffer.length;
            const channelData = audioBuffer.getChannelData(channelNumber);
            const sourceLength = source.length;
            for (let i = bufferOffset < 0 ? -bufferOffset : 0; i + bufferOffset < audioBufferLength && i < sourceLength; i += 1) {
                channelData[i + bufferOffset] = source[i];
            }
        };
    };
};

const createWrapAudioBufferCopyChannelMethodsOutOfBounds = (convertNumberToUnsignedLong) => {
    return (audioBuffer) => {
        audioBuffer.copyFromChannel = ((copyFromChannel) => {
            return (destination, channelNumberAsNumber, bufferOffsetAsNumber = 0) => {
                const bufferOffset = convertNumberToUnsignedLong(bufferOffsetAsNumber);
                const channelNumber = convertNumberToUnsignedLong(channelNumberAsNumber);
                if (bufferOffset < audioBuffer.length) {
                    return copyFromChannel.call(audioBuffer, destination, channelNumber, bufferOffset);
                }
            };
        })(audioBuffer.copyFromChannel);
        audioBuffer.copyToChannel = ((copyToChannel) => {
            return (source, channelNumberAsNumber, bufferOffsetAsNumber = 0) => {
                const bufferOffset = convertNumberToUnsignedLong(bufferOffsetAsNumber);
                const channelNumber = convertNumberToUnsignedLong(channelNumberAsNumber);
                if (bufferOffset < audioBuffer.length) {
                    return copyToChannel.call(audioBuffer, source, channelNumber, bufferOffset);
                }
            };
        })(audioBuffer.copyToChannel);
    };
};

const createWrapAudioBufferSourceNodeStopMethodNullifiedBuffer = (overwriteAccessors) => {
    return (nativeAudioBufferSourceNode, nativeContext) => {
        const nullifiedBuffer = nativeContext.createBuffer(1, 1, 44100);
        if (nativeAudioBufferSourceNode.buffer === null) {
            nativeAudioBufferSourceNode.buffer = nullifiedBuffer;
        }
        overwriteAccessors(nativeAudioBufferSourceNode, 'buffer', (get) => () => {
            const value = get.call(nativeAudioBufferSourceNode);
            return value === nullifiedBuffer ? null : value;
        }, (set) => (value) => {
            return set.call(nativeAudioBufferSourceNode, value === null ? nullifiedBuffer : value);
        });
    };
};

const createWrapChannelMergerNode = (createInvalidStateError, monitorConnections) => {
    return (nativeContext, channelMergerNode) => {
        // Bug #15: Safari does not return the default properties.
        channelMergerNode.channelCount = 1;
        channelMergerNode.channelCountMode = 'explicit';
        // Bug #16: Safari does not throw an error when setting a different channelCount or channelCountMode.
        Object.defineProperty(channelMergerNode, 'channelCount', {
            get: () => 1,
            set: () => {
                throw createInvalidStateError();
            }
        });
        Object.defineProperty(channelMergerNode, 'channelCountMode', {
            get: () => 'explicit',
            set: () => {
                throw createInvalidStateError();
            }
        });
        // Bug #20: Safari requires a connection of any kind to treat the input signal correctly.
        const audioBufferSourceNode = nativeContext.createBufferSource();
        const whenConnected = () => {
            const length = channelMergerNode.numberOfInputs;
            for (let i = 0; i < length; i += 1) {
                audioBufferSourceNode.connect(channelMergerNode, 0, i);
            }
        };
        const whenDisconnected = () => audioBufferSourceNode.disconnect(channelMergerNode);
        monitorConnections(channelMergerNode, whenConnected, whenDisconnected);
    };
};

const getFirstSample = (audioBuffer, buffer, channelNumber) => {
    // Bug #5: Safari does not support copyFromChannel() and copyToChannel().
    if (audioBuffer.copyFromChannel === undefined) {
        return audioBuffer.getChannelData(channelNumber)[0];
    }
    audioBuffer.copyFromChannel(buffer, channelNumber);
    return buffer[0];
};

const overwriteAccessors = (object, property, createGetter, createSetter) => {
    let prototype = object;
    while (!prototype.hasOwnProperty(property)) {
        prototype = Object.getPrototypeOf(prototype);
    }
    const { get, set } = Object.getOwnPropertyDescriptor(prototype, property);
    Object.defineProperty(object, property, { get: createGetter(get), set: createSetter(set) });
};

const sanitizeAudioWorkletNodeOptions = (options) => {
    return {
        ...options,
        outputChannelCount: options.outputChannelCount !== undefined
            ? options.outputChannelCount
            : options.numberOfInputs === 1 && options.numberOfOutputs === 1
                ? /*
                   * Bug #61: This should be the computedNumberOfChannels, but unfortunately that is almost impossible to fake. That's why
                   * the channelCountMode is required to be 'explicit' as long as there is not a native implementation in every browser. That
                   * makes sure the computedNumberOfChannels is equivilant to the channelCount which makes it much easier to compute.
                   */
                    [options.channelCount]
                : Array.from({ length: options.numberOfOutputs }, () => 1)
    };
};

const setValueAtTimeUntilPossible = (audioParam, value, startTime) => {
    try {
        audioParam.setValueAtTime(value, startTime);
    }
    catch (err) {
        if (err.code !== 9) {
            throw err;
        }
        setValueAtTimeUntilPossible(audioParam, value, startTime + 1e-7);
    }
};

const testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport = (nativeContext) => {
    const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
    nativeAudioBufferSourceNode.start();
    try {
        nativeAudioBufferSourceNode.start();
    }
    catch {
        return true;
    }
    return false;
};

const testAudioBufferSourceNodeStartMethodOffsetClampingSupport = (nativeContext) => {
    const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
    const nativeAudioBuffer = nativeContext.createBuffer(1, 1, 44100);
    nativeAudioBufferSourceNode.buffer = nativeAudioBuffer;
    try {
        nativeAudioBufferSourceNode.start(0, 1);
    }
    catch {
        return false;
    }
    return true;
};

const testAudioBufferSourceNodeStopMethodNullifiedBufferSupport = (nativeContext) => {
    const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
    nativeAudioBufferSourceNode.start();
    try {
        nativeAudioBufferSourceNode.stop();
    }
    catch {
        return false;
    }
    return true;
};

const testAudioScheduledSourceNodeStartMethodNegativeParametersSupport = (nativeContext) => {
    const nativeAudioBufferSourceNode = nativeContext.createOscillator();
    try {
        nativeAudioBufferSourceNode.start(-1);
    }
    catch (err) {
        return err instanceof RangeError;
    }
    return false;
};

const testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport = (nativeContext) => {
    const nativeAudioBuffer = nativeContext.createBuffer(1, 1, 44100);
    const nativeAudioBufferSourceNode = nativeContext.createBufferSource();
    nativeAudioBufferSourceNode.buffer = nativeAudioBuffer;
    nativeAudioBufferSourceNode.start();
    nativeAudioBufferSourceNode.stop();
    try {
        nativeAudioBufferSourceNode.stop();
        return true;
    }
    catch {
        return false;
    }
};

const testAudioScheduledSourceNodeStopMethodNegativeParametersSupport = (nativeContext) => {
    const nativeAudioBufferSourceNode = nativeContext.createOscillator();
    try {
        nativeAudioBufferSourceNode.stop(-1);
    }
    catch (err) {
        return err instanceof RangeError;
    }
    return false;
};

const testAudioWorkletNodeOptionsClonability = (audioWorkletNodeOptions) => {
    const { port1, port2 } = new MessageChannel();
    try {
        // This will throw an error if the audioWorkletNodeOptions are not clonable.
        port1.postMessage(audioWorkletNodeOptions);
    }
    finally {
        port1.close();
        port2.close();
    }
};

const wrapAudioBufferSourceNodeStartMethodOffsetClamping = (nativeAudioBufferSourceNode) => {
    nativeAudioBufferSourceNode.start = ((start) => {
        return (when = 0, offset = 0, duration) => {
            const buffer = nativeAudioBufferSourceNode.buffer;
            // Bug #154: Safari does not clamp the offset if it is equal to or greater than the duration of the buffer.
            const clampedOffset = buffer === null ? offset : Math.min(buffer.duration, offset);
            // Bug #155: Safari does not handle the offset correctly if it would cause the buffer to be not be played at all.
            if (buffer !== null && clampedOffset > buffer.duration - 0.5 / nativeAudioBufferSourceNode.context.sampleRate) {
                start.call(nativeAudioBufferSourceNode, when, 0, 0);
            }
            else {
                start.call(nativeAudioBufferSourceNode, when, clampedOffset, duration);
            }
        };
    })(nativeAudioBufferSourceNode.start);
};

const wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls = (nativeAudioScheduledSourceNode, nativeContext) => {
    const nativeGainNode = nativeContext.createGain();
    nativeAudioScheduledSourceNode.connect(nativeGainNode);
    const disconnectGainNode = ((disconnect) => {
        return () => {
            // @todo TypeScript cannot infer the overloaded signature with 1 argument yet.
            disconnect.call(nativeAudioScheduledSourceNode, nativeGainNode);
            nativeAudioScheduledSourceNode.removeEventListener('ended', disconnectGainNode);
        };
    })(nativeAudioScheduledSourceNode.disconnect);
    nativeAudioScheduledSourceNode.addEventListener('ended', disconnectGainNode);
    interceptConnections(nativeAudioScheduledSourceNode, nativeGainNode);
    nativeAudioScheduledSourceNode.stop = ((stop) => {
        let isStopped = false;
        return (when = 0) => {
            if (isStopped) {
                try {
                    stop.call(nativeAudioScheduledSourceNode, when);
                }
                catch {
                    nativeGainNode.gain.setValueAtTime(0, when);
                }
            }
            else {
                stop.call(nativeAudioScheduledSourceNode, when);
                isStopped = true;
            }
        };
    })(nativeAudioScheduledSourceNode.stop);
};

const wrapEventListener$1 = (target, eventListener) => {
    return (event) => {
        const descriptor = { value: target };
        Object.defineProperties(event, {
            currentTarget: descriptor,
            target: descriptor
        });
        if (typeof eventListener === 'function') {
            return eventListener.call(target, event);
        }
        return eventListener.handleEvent.call(target, event);
    };
};

const addActiveInputConnectionToAudioNode = createAddActiveInputConnectionToAudioNode(insertElementInSet);
const addPassiveInputConnectionToAudioNode = createAddPassiveInputConnectionToAudioNode(insertElementInSet);
const deleteActiveInputConnectionToAudioNode = createDeleteActiveInputConnectionToAudioNode(pickElementFromSet);
const audioNodeTailTimeStore = new WeakMap();
const getAudioNodeTailTime = createGetAudioNodeTailTime(audioNodeTailTimeStore);
const cacheTestResult = createCacheTestResult(new Map(), new WeakMap());
const window$2 = createWindow$1();
const getAudioNodeRenderer = createGetAudioNodeRenderer(getAudioNodeConnections);
const renderInputsOfAudioNode = createRenderInputsOfAudioNode(getAudioNodeConnections, getAudioNodeRenderer, isPartOfACycle);
const getNativeContext = createGetNativeContext(CONTEXT_STORE);
const nativeOfflineAudioContextConstructor = createNativeOfflineAudioContextConstructor(window$2);
const isNativeOfflineAudioContext = createIsNativeOfflineAudioContext(nativeOfflineAudioContextConstructor);
const audioParamAudioNodeStore = new WeakMap();
const eventTargetConstructor = createEventTargetConstructor(wrapEventListener$1);
const nativeAudioContextConstructor = createNativeAudioContextConstructor(window$2);
const isNativeAudioContext = createIsNativeAudioContext(nativeAudioContextConstructor);
const isNativeAudioNode = createIsNativeAudioNode(window$2);
const isNativeAudioParam = createIsNativeAudioParam(window$2);
const nativeAudioWorkletNodeConstructor = createNativeAudioWorkletNodeConstructor(window$2);
const audioNodeConstructor = createAudioNodeConstructor(createAddAudioNodeConnections(AUDIO_NODE_CONNECTIONS_STORE), createAddConnectionToAudioNode(addActiveInputConnectionToAudioNode, addPassiveInputConnectionToAudioNode, connectNativeAudioNodeToNativeAudioNode, deleteActiveInputConnectionToAudioNode, disconnectNativeAudioNodeFromNativeAudioNode, getAudioNodeConnections, getAudioNodeTailTime, getEventListenersOfAudioNode, getNativeAudioNode, insertElementInSet, isActiveAudioNode, isPartOfACycle, isPassiveAudioNode), cacheTestResult, createIncrementCycleCounterFactory(CYCLE_COUNTERS, disconnectNativeAudioNodeFromNativeAudioNode, getAudioNodeConnections, getNativeAudioNode, getNativeAudioParam, isActiveAudioNode), createIndexSizeError, createInvalidAccessError, createNotSupportedError, createDecrementCycleCounter(connectNativeAudioNodeToNativeAudioNode, CYCLE_COUNTERS, getAudioNodeConnections, getNativeAudioNode, getNativeAudioParam, getNativeContext, isActiveAudioNode, isNativeOfflineAudioContext), createDetectCycles(audioParamAudioNodeStore, getAudioNodeConnections, getValueForKey), eventTargetConstructor, getNativeContext, isNativeAudioContext, isNativeAudioNode, isNativeAudioParam, isNativeOfflineAudioContext, nativeAudioWorkletNodeConstructor);
const audioBufferStore = new WeakSet();
const nativeAudioBufferConstructor = createNativeAudioBufferConstructor(window$2);
const convertNumberToUnsignedLong = createConvertNumberToUnsignedLong(new Uint32Array(1));
const wrapAudioBufferCopyChannelMethods = createWrapAudioBufferCopyChannelMethods(convertNumberToUnsignedLong, createIndexSizeError);
const wrapAudioBufferCopyChannelMethodsOutOfBounds = createWrapAudioBufferCopyChannelMethodsOutOfBounds(convertNumberToUnsignedLong);
const audioBufferConstructor = createAudioBufferConstructor(audioBufferStore, cacheTestResult, createNotSupportedError, nativeAudioBufferConstructor, nativeOfflineAudioContextConstructor, createTestAudioBufferConstructorSupport(nativeAudioBufferConstructor), wrapAudioBufferCopyChannelMethods, wrapAudioBufferCopyChannelMethodsOutOfBounds);
const addSilentConnection = createAddSilentConnection(createNativeGainNode);
const renderInputsOfAudioParam = createRenderInputsOfAudioParam(getAudioNodeRenderer, getAudioParamConnections, isPartOfACycle);
const connectAudioParam = createConnectAudioParam(renderInputsOfAudioParam);
const createNativeAudioBufferSourceNode = createNativeAudioBufferSourceNodeFactory(addSilentConnection, cacheTestResult, testAudioBufferSourceNodeStartMethodConsecutiveCallsSupport, testAudioBufferSourceNodeStartMethodOffsetClampingSupport, testAudioBufferSourceNodeStopMethodNullifiedBufferSupport, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, testAudioScheduledSourceNodeStopMethodConsecutiveCallsSupport, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport, wrapAudioBufferSourceNodeStartMethodOffsetClamping, createWrapAudioBufferSourceNodeStopMethodNullifiedBuffer(overwriteAccessors), wrapAudioScheduledSourceNodeStopMethodConsecutiveCalls);
const renderAutomation = createRenderAutomation(createGetAudioParamRenderer(getAudioParamConnections), renderInputsOfAudioParam);
const createAudioBufferSourceNodeRenderer = createAudioBufferSourceNodeRendererFactory(connectAudioParam, createNativeAudioBufferSourceNode, getNativeAudioNode, renderAutomation, renderInputsOfAudioNode);
const createAudioParam = createAudioParamFactory(createAddAudioParamConnections(AUDIO_PARAM_CONNECTIONS_STORE), audioParamAudioNodeStore, AUDIO_PARAM_STORE, createAudioParamRenderer, createCancelAndHoldAutomationEvent, createCancelScheduledValuesAutomationEvent, createExponentialRampToValueAutomationEvent, createLinearRampToValueAutomationEvent, createSetTargetAutomationEvent, createSetValueAutomationEvent, createSetValueCurveAutomationEvent, nativeAudioContextConstructor, setValueAtTimeUntilPossible);
const audioBufferSourceNodeConstructor = createAudioBufferSourceNodeConstructor(audioNodeConstructor, createAudioBufferSourceNodeRenderer, createAudioParam, createInvalidStateError, createNativeAudioBufferSourceNode, getNativeContext, isNativeOfflineAudioContext, wrapEventListener$1);
const audioDestinationNodeConstructor = createAudioDestinationNodeConstructor(audioNodeConstructor, createAudioDestinationNodeRenderer, createIndexSizeError, createInvalidStateError, createNativeAudioDestinationNodeFactory(createNativeGainNode, overwriteAccessors), getNativeContext, isNativeOfflineAudioContext, renderInputsOfAudioNode);
const monitorConnections = createMonitorConnections(insertElementInSet, isNativeAudioNode);
const wrapChannelMergerNode = createWrapChannelMergerNode(createInvalidStateError, monitorConnections);
const createNativeChannelMergerNode = createNativeChannelMergerNodeFactory(nativeAudioContextConstructor, wrapChannelMergerNode);
const createNativeConstantSourceNodeFaker = createNativeConstantSourceNodeFakerFactory(addSilentConnection, createNativeAudioBufferSourceNode, createNativeGainNode, monitorConnections);
const createNativeConstantSourceNode = createNativeConstantSourceNodeFactory(addSilentConnection, cacheTestResult, createNativeConstantSourceNodeFaker, testAudioScheduledSourceNodeStartMethodNegativeParametersSupport, testAudioScheduledSourceNodeStopMethodNegativeParametersSupport);
const renderNativeOfflineAudioContext = createRenderNativeOfflineAudioContext(cacheTestResult, createNativeGainNode, createNativeScriptProcessorNode, createTestOfflineAudioContextCurrentTimeSupport(createNativeGainNode, nativeOfflineAudioContextConstructor));
const createAudioListener = createAudioListenerFactory(createAudioParam, createNativeChannelMergerNode, createNativeConstantSourceNode, createNativeScriptProcessorNode, createNotSupportedError, getFirstSample, isNativeOfflineAudioContext, overwriteAccessors);
const unrenderedAudioWorkletNodeStore = new WeakMap();
const minimalBaseAudioContextConstructor = createMinimalBaseAudioContextConstructor(audioDestinationNodeConstructor, createAudioListener, eventTargetConstructor, isNativeOfflineAudioContext, unrenderedAudioWorkletNodeStore, wrapEventListener$1);
const isSecureContext = createIsSecureContext(window$2);
const exposeCurrentFrameAndCurrentTime = createExposeCurrentFrameAndCurrentTime(window$2);
const backupOfflineAudioContextStore = new WeakMap();
const getOrCreateBackupOfflineAudioContext = createGetOrCreateBackupOfflineAudioContext(backupOfflineAudioContextStore, nativeOfflineAudioContextConstructor);
// The addAudioWorkletModule() function is only available in a SecureContext.
const addAudioWorkletModule = isSecureContext
    ? createAddAudioWorkletModule(cacheTestResult, createNotSupportedError, createEvaluateSource(window$2), exposeCurrentFrameAndCurrentTime, createFetchSource(createAbortError), getNativeContext, getOrCreateBackupOfflineAudioContext, isNativeOfflineAudioContext, nativeAudioWorkletNodeConstructor, new WeakMap(), new WeakMap(), createTestAudioWorkletProcessorPostMessageSupport(nativeAudioWorkletNodeConstructor, nativeOfflineAudioContextConstructor), 
    // @todo window is guaranteed to be defined because isSecureContext checks that as well.
    window$2)
    : undefined;
const mediaStreamAudioSourceNodeConstructor = createMediaStreamAudioSourceNodeConstructor(audioNodeConstructor, createNativeMediaStreamAudioSourceNode, getNativeContext, isNativeOfflineAudioContext);
const getUnrenderedAudioWorkletNodes = createGetUnrenderedAudioWorkletNodes(unrenderedAudioWorkletNodeStore);
const addUnrenderedAudioWorkletNode = createAddUnrenderedAudioWorkletNode(getUnrenderedAudioWorkletNodes);
const connectMultipleOutputs = createConnectMultipleOutputs(createIndexSizeError);
const deleteUnrenderedAudioWorkletNode = createDeleteUnrenderedAudioWorkletNode(getUnrenderedAudioWorkletNodes);
const disconnectMultipleOutputs = createDisconnectMultipleOutputs(createIndexSizeError);
const activeAudioWorkletNodeInputsStore = new WeakMap();
const getActiveAudioWorkletNodeInputs = createGetActiveAudioWorkletNodeInputs(activeAudioWorkletNodeInputsStore, getValueForKey);
const createNativeAudioWorkletNodeFaker = createNativeAudioWorkletNodeFakerFactory(connectMultipleOutputs, createIndexSizeError, createInvalidStateError, createNativeChannelMergerNode, createNativeChannelSplitterNode, createNativeConstantSourceNode, createNativeGainNode, createNativeScriptProcessorNode, createNotSupportedError, disconnectMultipleOutputs, exposeCurrentFrameAndCurrentTime, getActiveAudioWorkletNodeInputs, monitorConnections);
const createNativeAudioWorkletNode = createNativeAudioWorkletNodeFactory(createInvalidStateError, createNativeAudioWorkletNodeFaker, createNativeGainNode, createNotSupportedError, monitorConnections);
const createAudioWorkletNodeRenderer = createAudioWorkletNodeRendererFactory(connectAudioParam, connectMultipleOutputs, createNativeAudioBufferSourceNode, createNativeChannelMergerNode, createNativeChannelSplitterNode, createNativeConstantSourceNode, createNativeGainNode, deleteUnrenderedAudioWorkletNode, disconnectMultipleOutputs, exposeCurrentFrameAndCurrentTime, getNativeAudioNode, nativeAudioWorkletNodeConstructor, nativeOfflineAudioContextConstructor, renderAutomation, renderInputsOfAudioNode, renderNativeOfflineAudioContext);
const getBackupOfflineAudioContext = createGetBackupOfflineAudioContext(backupOfflineAudioContextStore);
const setActiveAudioWorkletNodeInputs = createSetActiveAudioWorkletNodeInputs(activeAudioWorkletNodeInputsStore);
// The AudioWorkletNode constructor is only available in a SecureContext.
const audioWorkletNodeConstructor = isSecureContext
    ? createAudioWorkletNodeConstructor(addUnrenderedAudioWorkletNode, audioNodeConstructor, createAudioParam, createAudioWorkletNodeRenderer, createNativeAudioWorkletNode, getAudioNodeConnections, getBackupOfflineAudioContext, getNativeContext, isNativeOfflineAudioContext, nativeAudioWorkletNodeConstructor, sanitizeAudioWorkletNodeOptions, setActiveAudioWorkletNodeInputs, testAudioWorkletNodeOptionsClonability, wrapEventListener$1)
    : undefined;
const minimalAudioContextConstructor = createMinimalAudioContextConstructor(createInvalidStateError, createNotSupportedError, createUnknownError, minimalBaseAudioContextConstructor, nativeAudioContextConstructor);

const ERROR_MESSAGE = 'Missing AudioWorklet support. Maybe this is not running in a secure context.';
// @todo This should live in a separate file.
const createPromisedAudioNodesEncoderIdAndPort = async (audioBuffer, audioContext, channelCount, mediaStream, mimeType) => {
    const { encoderId, port } = await instantiate(mimeType, audioContext.sampleRate);
    if (audioWorkletNodeConstructor === undefined) {
        throw new Error(ERROR_MESSAGE);
    }
    const audioBufferSourceNode = new audioBufferSourceNodeConstructor(audioContext, { buffer: audioBuffer });
    const mediaStreamAudioSourceNode = new mediaStreamAudioSourceNodeConstructor(audioContext, { mediaStream });
    const recorderAudioWorkletNode = createRecorderAudioWorkletNode(audioWorkletNodeConstructor, audioContext, { channelCount });
    return { audioBufferSourceNode, encoderId, mediaStreamAudioSourceNode, port, recorderAudioWorkletNode };
};
const createWebAudioMediaRecorderFactory = (createBlobEvent, createInvalidModificationError, createInvalidStateError, createNotSupportedError) => {
    return (eventTarget, mediaStream, mimeType) => {
        var _a;
        const sampleRate = (_a = mediaStream.getAudioTracks()[0]) === null || _a === void 0 ? void 0 : _a.getSettings().sampleRate;
        const audioContext = new minimalAudioContextConstructor({ latencyHint: 'playback', sampleRate });
        const length = Math.max(1024, Math.ceil(audioContext.baseLatency * audioContext.sampleRate));
        const audioBuffer = new audioBufferConstructor({ length, sampleRate: audioContext.sampleRate });
        const bufferedArrayBuffers = [];
        const promisedAudioWorkletModule = addRecorderAudioWorkletModule((url) => {
            if (addAudioWorkletModule === undefined) {
                throw new Error(ERROR_MESSAGE);
            }
            return addAudioWorkletModule(audioContext, url);
        });
        let abortRecording = null;
        let intervalId = null;
        let promisedAudioNodesAndEncoderId = null;
        let promisedPartialRecording = null;
        let isAudioContextRunning = true;
        const dispatchDataAvailableEvent = (arrayBuffers) => {
            eventTarget.dispatchEvent(createBlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
        };
        const requestNextPartialRecording = async (encoderId, timeslice) => {
            const arrayBuffers = await encode(encoderId, timeslice);
            if (promisedAudioNodesAndEncoderId === null) {
                bufferedArrayBuffers.push(...arrayBuffers);
            }
            else {
                dispatchDataAvailableEvent(arrayBuffers);
                promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
            }
        };
        const resume = () => {
            isAudioContextRunning = true;
            return audioContext.resume();
        };
        const stop = () => {
            if (promisedAudioNodesAndEncoderId === null) {
                return;
            }
            if (abortRecording !== null) {
                mediaStream.removeEventListener('addtrack', abortRecording);
                mediaStream.removeEventListener('removetrack', abortRecording);
            }
            if (intervalId !== null) {
                clearTimeout(intervalId);
            }
            promisedAudioNodesAndEncoderId.then(async ({ encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode }) => {
                if (promisedPartialRecording !== null) {
                    promisedPartialRecording.catch(() => {
                        /* @todo Only catch the errors caused by a duplicate call to encode. */
                    });
                    promisedPartialRecording = null;
                }
                await recorderAudioWorkletNode.stop();
                mediaStreamAudioSourceNode.disconnect(recorderAudioWorkletNode);
                const arrayBuffers = await encode(encoderId, null);
                if (promisedAudioNodesAndEncoderId === null) {
                    await suspend();
                }
                dispatchDataAvailableEvent([...bufferedArrayBuffers, ...arrayBuffers]);
                bufferedArrayBuffers.length = 0;
                eventTarget.dispatchEvent(new Event('stop'));
            });
            promisedAudioNodesAndEncoderId = null;
        };
        const suspend = () => {
            isAudioContextRunning = false;
            return audioContext.suspend();
        };
        suspend();
        return {
            get mimeType() {
                return mimeType;
            },
            get state() {
                return promisedAudioNodesAndEncoderId === null ? 'inactive' : isAudioContextRunning ? 'recording' : 'paused';
            },
            pause() {
                if (promisedAudioNodesAndEncoderId === null) {
                    throw createInvalidStateError();
                }
                if (isAudioContextRunning) {
                    suspend();
                    eventTarget.dispatchEvent(new Event('pause'));
                }
            },
            resume() {
                if (promisedAudioNodesAndEncoderId === null) {
                    throw createInvalidStateError();
                }
                if (!isAudioContextRunning) {
                    resume();
                    eventTarget.dispatchEvent(new Event('resume'));
                }
            },
            start(timeslice) {
                var _a;
                if (promisedAudioNodesAndEncoderId !== null) {
                    throw createInvalidStateError();
                }
                if (mediaStream.getVideoTracks().length > 0) {
                    throw createNotSupportedError();
                }
                eventTarget.dispatchEvent(new Event('start'));
                const audioTracks = mediaStream.getAudioTracks();
                const channelCount = audioTracks.length === 0 ? 2 : (_a = audioTracks[0].getSettings().channelCount) !== null && _a !== void 0 ? _a : 2;
                promisedAudioNodesAndEncoderId = Promise.all([
                    resume(),
                    promisedAudioWorkletModule.then(() => createPromisedAudioNodesEncoderIdAndPort(audioBuffer, audioContext, channelCount, mediaStream, mimeType))
                ]).then(async ([, { audioBufferSourceNode, encoderId, mediaStreamAudioSourceNode, port, recorderAudioWorkletNode }]) => {
                    mediaStreamAudioSourceNode.connect(recorderAudioWorkletNode);
                    await new Promise((resolve) => {
                        audioBufferSourceNode.onended = resolve;
                        audioBufferSourceNode.connect(recorderAudioWorkletNode);
                        audioBufferSourceNode.start(audioContext.currentTime + length / audioContext.sampleRate);
                    });
                    audioBufferSourceNode.disconnect(recorderAudioWorkletNode);
                    await recorderAudioWorkletNode.record(port);
                    if (timeslice !== undefined) {
                        promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
                    }
                    return { encoderId, mediaStreamAudioSourceNode, recorderAudioWorkletNode };
                });
                const tracks = mediaStream.getTracks();
                abortRecording = () => {
                    stop();
                    eventTarget.dispatchEvent(new ErrorEvent('error', { error: createInvalidModificationError() }));
                };
                mediaStream.addEventListener('addtrack', abortRecording);
                mediaStream.addEventListener('removetrack', abortRecording);
                intervalId = setInterval(() => {
                    const currentTracks = mediaStream.getTracks();
                    if ((currentTracks.length !== tracks.length || currentTracks.some((track, index) => track !== tracks[index])) &&
                        abortRecording !== null) {
                        abortRecording();
                    }
                }, 1000);
            },
            stop
        };
    };
};

class MultiBufferDataView {
    constructor(buffers, byteOffset = 0, byteLength) {
        if (byteOffset < 0 || (byteLength !== undefined && byteLength < 0)) {
            throw new RangeError();
        }
        const availableBytes = buffers.reduce((length, buffer) => length + buffer.byteLength, 0);
        if (byteOffset > availableBytes || (byteLength !== undefined && byteOffset + byteLength > availableBytes)) {
            throw new RangeError();
        }
        const dataViews = [];
        const effectiveByteLength = byteLength === undefined ? availableBytes - byteOffset : byteLength;
        const truncatedBuffers = [];
        let consumedByteLength = 0;
        let truncatedByteOffset = byteOffset;
        for (const buffer of buffers) {
            if (truncatedBuffers.length === 0) {
                if (buffer.byteLength > truncatedByteOffset) {
                    consumedByteLength = buffer.byteLength - truncatedByteOffset;
                    const byteLengthOfDataView = consumedByteLength > effectiveByteLength ? effectiveByteLength : consumedByteLength;
                    dataViews.push(new DataView(buffer, truncatedByteOffset, byteLengthOfDataView));
                    truncatedBuffers.push(buffer);
                }
                else {
                    truncatedByteOffset -= buffer.byteLength;
                }
            }
            else if (consumedByteLength < effectiveByteLength) {
                consumedByteLength += buffer.byteLength;
                const byteLengthOfDataView = consumedByteLength > effectiveByteLength
                    ? buffer.byteLength - consumedByteLength + effectiveByteLength
                    : buffer.byteLength;
                dataViews.push(new DataView(buffer, 0, byteLengthOfDataView));
                truncatedBuffers.push(buffer);
            }
        }
        this._buffers = truncatedBuffers;
        this._byteLength = effectiveByteLength;
        this._byteOffset = truncatedByteOffset;
        this._dataViews = dataViews;
        this._internalBuffer = new DataView(new ArrayBuffer(8));
    }
    get buffers() {
        return this._buffers;
    }
    get byteLength() {
        return this._byteLength;
    }
    get byteOffset() {
        return this._byteOffset;
    }
    getFloat32(byteOffset, littleEndian) {
        this._internalBuffer.setUint8(0, this.getUint8(byteOffset + 0));
        this._internalBuffer.setUint8(1, this.getUint8(byteOffset + 1));
        this._internalBuffer.setUint8(2, this.getUint8(byteOffset + 2));
        this._internalBuffer.setUint8(3, this.getUint8(byteOffset + 3));
        return this._internalBuffer.getFloat32(0, littleEndian);
    }
    getFloat64(byteOffset, littleEndian) {
        this._internalBuffer.setUint8(0, this.getUint8(byteOffset + 0));
        this._internalBuffer.setUint8(1, this.getUint8(byteOffset + 1));
        this._internalBuffer.setUint8(2, this.getUint8(byteOffset + 2));
        this._internalBuffer.setUint8(3, this.getUint8(byteOffset + 3));
        this._internalBuffer.setUint8(4, this.getUint8(byteOffset + 4));
        this._internalBuffer.setUint8(5, this.getUint8(byteOffset + 5));
        this._internalBuffer.setUint8(6, this.getUint8(byteOffset + 6));
        this._internalBuffer.setUint8(7, this.getUint8(byteOffset + 7));
        return this._internalBuffer.getFloat64(0, littleEndian);
    }
    getInt16(byteOffset, littleEndian) {
        this._internalBuffer.setUint8(0, this.getUint8(byteOffset + 0));
        this._internalBuffer.setUint8(1, this.getUint8(byteOffset + 1));
        return this._internalBuffer.getInt16(0, littleEndian);
    }
    getInt32(byteOffset, littleEndian) {
        this._internalBuffer.setUint8(0, this.getUint8(byteOffset + 0));
        this._internalBuffer.setUint8(1, this.getUint8(byteOffset + 1));
        this._internalBuffer.setUint8(2, this.getUint8(byteOffset + 2));
        this._internalBuffer.setUint8(3, this.getUint8(byteOffset + 3));
        return this._internalBuffer.getInt32(0, littleEndian);
    }
    getInt8(byteOffset) {
        const [dataView, byteOffsetOfDataView] = this._findDataViewWithOffset(byteOffset);
        return dataView.getInt8(byteOffset - byteOffsetOfDataView);
    }
    getUint16(byteOffset, littleEndian) {
        this._internalBuffer.setUint8(0, this.getUint8(byteOffset + 0));
        this._internalBuffer.setUint8(1, this.getUint8(byteOffset + 1));
        return this._internalBuffer.getUint16(0, littleEndian);
    }
    getUint32(byteOffset, littleEndian) {
        this._internalBuffer.setUint8(0, this.getUint8(byteOffset + 0));
        this._internalBuffer.setUint8(1, this.getUint8(byteOffset + 1));
        this._internalBuffer.setUint8(2, this.getUint8(byteOffset + 2));
        this._internalBuffer.setUint8(3, this.getUint8(byteOffset + 3));
        return this._internalBuffer.getUint32(0, littleEndian);
    }
    getUint8(byteOffset) {
        const [dataView, byteOffsetOfDataView] = this._findDataViewWithOffset(byteOffset);
        return dataView.getUint8(byteOffset - byteOffsetOfDataView);
    }
    setFloat32(byteOffset, value, littleEndian) {
        this._internalBuffer.setFloat32(0, value, littleEndian);
        this.setUint8(byteOffset, this._internalBuffer.getUint8(0));
        this.setUint8(byteOffset + 1, this._internalBuffer.getUint8(1));
        this.setUint8(byteOffset + 2, this._internalBuffer.getUint8(2));
        this.setUint8(byteOffset + 3, this._internalBuffer.getUint8(3));
    }
    setFloat64(byteOffset, value, littleEndian) {
        this._internalBuffer.setFloat64(0, value, littleEndian);
        this.setUint8(byteOffset, this._internalBuffer.getUint8(0));
        this.setUint8(byteOffset + 1, this._internalBuffer.getUint8(1));
        this.setUint8(byteOffset + 2, this._internalBuffer.getUint8(2));
        this.setUint8(byteOffset + 3, this._internalBuffer.getUint8(3));
        this.setUint8(byteOffset + 4, this._internalBuffer.getUint8(4));
        this.setUint8(byteOffset + 5, this._internalBuffer.getUint8(5));
        this.setUint8(byteOffset + 6, this._internalBuffer.getUint8(6));
        this.setUint8(byteOffset + 7, this._internalBuffer.getUint8(7));
    }
    setInt16(byteOffset, value, littleEndian) {
        this._internalBuffer.setInt16(0, value, littleEndian);
        this.setUint8(byteOffset, this._internalBuffer.getUint8(0));
        this.setUint8(byteOffset + 1, this._internalBuffer.getUint8(1));
    }
    setInt32(byteOffset, value, littleEndian) {
        this._internalBuffer.setInt32(0, value, littleEndian);
        this.setUint8(byteOffset, this._internalBuffer.getUint8(0));
        this.setUint8(byteOffset + 1, this._internalBuffer.getUint8(1));
        this.setUint8(byteOffset + 2, this._internalBuffer.getUint8(2));
        this.setUint8(byteOffset + 3, this._internalBuffer.getUint8(3));
    }
    setInt8(byteOffset, value) {
        const [dataView, byteOffsetOfDataView] = this._findDataViewWithOffset(byteOffset);
        dataView.setInt8(byteOffset - byteOffsetOfDataView, value);
    }
    setUint16(byteOffset, value, littleEndian) {
        this._internalBuffer.setUint16(0, value, littleEndian);
        this.setUint8(byteOffset, this._internalBuffer.getUint8(0));
        this.setUint8(byteOffset + 1, this._internalBuffer.getUint8(1));
    }
    setUint32(byteOffset, value, littleEndian) {
        this._internalBuffer.setUint32(0, value, littleEndian);
        this.setUint8(byteOffset, this._internalBuffer.getUint8(0));
        this.setUint8(byteOffset + 1, this._internalBuffer.getUint8(1));
        this.setUint8(byteOffset + 2, this._internalBuffer.getUint8(2));
        this.setUint8(byteOffset + 3, this._internalBuffer.getUint8(3));
    }
    setUint8(byteOffset, value) {
        const [dataView, byteOffsetOfDataView] = this._findDataViewWithOffset(byteOffset);
        dataView.setUint8(byteOffset - byteOffsetOfDataView, value);
    }
    _findDataViewWithOffset(byteOffset) {
        let byteOffsetOfDataView = 0;
        for (const dataView of this._dataViews) {
            const byteOffsetOfNextDataView = byteOffsetOfDataView + dataView.byteLength;
            if (byteOffset >= byteOffsetOfDataView && byteOffset < byteOffsetOfNextDataView) {
                return [dataView, byteOffsetOfDataView];
            }
            byteOffsetOfDataView = byteOffsetOfNextDataView;
        }
        throw new RangeError();
    }
}

const createWebmPcmMediaRecorderFactory = (createBlobEvent, decodeWebMChunk, readVariableSizeInteger) => {
    return (eventTarget, nativeMediaRecorderConstructor, mediaStream, mimeType) => {
        const bufferedArrayBuffers = [];
        const nativeMediaRecorder = new nativeMediaRecorderConstructor(mediaStream, { mimeType: 'audio/webm;codecs=pcm' });
        let promisedPartialRecording = null;
        let stopRecording = () => { }; // tslint:disable-line:no-empty
        const dispatchDataAvailableEvent = (arrayBuffers) => {
            eventTarget.dispatchEvent(createBlobEvent('dataavailable', { data: new Blob(arrayBuffers, { type: mimeType }) }));
        };
        const requestNextPartialRecording = async (encoderId, timeslice) => {
            const arrayBuffers = await encode(encoderId, timeslice);
            if (nativeMediaRecorder.state === 'inactive') {
                bufferedArrayBuffers.push(...arrayBuffers);
            }
            else {
                dispatchDataAvailableEvent(arrayBuffers);
                promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice);
            }
        };
        const stop = () => {
            if (nativeMediaRecorder.state === 'inactive') {
                return;
            }
            if (promisedPartialRecording !== null) {
                promisedPartialRecording.catch(() => {
                    /* @todo Only catch the errors caused by a duplicate call to encode. */
                });
                promisedPartialRecording = null;
            }
            stopRecording();
            stopRecording = () => { }; // tslint:disable-line:no-empty
            nativeMediaRecorder.stop();
        };
        nativeMediaRecorder.addEventListener('error', (event) => {
            stop();
            eventTarget.dispatchEvent(new ErrorEvent('error', {
                error: event.error
            }));
        });
        nativeMediaRecorder.addEventListener('pause', () => eventTarget.dispatchEvent(new Event('pause')));
        nativeMediaRecorder.addEventListener('resume', () => eventTarget.dispatchEvent(new Event('resume')));
        nativeMediaRecorder.addEventListener('start', () => eventTarget.dispatchEvent(new Event('start')));
        return {
            get mimeType() {
                return mimeType;
            },
            get state() {
                return nativeMediaRecorder.state;
            },
            pause() {
                return nativeMediaRecorder.pause();
            },
            resume() {
                return nativeMediaRecorder.resume();
            },
            start(timeslice) {
                const [audioTrack] = mediaStream.getAudioTracks();
                if (audioTrack !== undefined && nativeMediaRecorder.state === 'inactive') {
                    // Bug #19: Chrome does not expose the correct channelCount property right away.
                    const { channelCount, sampleRate } = audioTrack.getSettings();
                    if (channelCount === undefined) {
                        throw new Error('The channelCount is not defined.');
                    }
                    if (sampleRate === undefined) {
                        throw new Error('The sampleRate is not defined.');
                    }
                    let isRecording = false;
                    let isStopped = false;
                    // Bug #9: Chrome sometimes fires more than one dataavailable event while being inactive.
                    let pendingInvocations = 0;
                    let promisedDataViewElementTypeEncoderIdAndPort = instantiate(mimeType, sampleRate);
                    stopRecording = () => {
                        isStopped = true;
                    };
                    const removeEventListener = on(nativeMediaRecorder, 'dataavailable')(({ data }) => {
                        pendingInvocations += 1;
                        promisedDataViewElementTypeEncoderIdAndPort = promisedDataViewElementTypeEncoderIdAndPort.then(async ({ dataView = null, elementType = null, encoderId, port }) => {
                            const arrayBuffer = await data.arrayBuffer();
                            pendingInvocations -= 1;
                            const currentDataView = dataView === null
                                ? new MultiBufferDataView([arrayBuffer])
                                : new MultiBufferDataView([...dataView.buffers, arrayBuffer], dataView.byteOffset);
                            if (!isRecording && nativeMediaRecorder.state === 'recording' && !isStopped) {
                                const lengthAndValue = readVariableSizeInteger(currentDataView, 0);
                                if (lengthAndValue === null) {
                                    return { dataView: currentDataView, elementType, encoderId, port };
                                }
                                const { value } = lengthAndValue;
                                if (value !== 172351395) {
                                    return { dataView, elementType, encoderId, port };
                                }
                                isRecording = true;
                            }
                            const { currentElementType, offset, contents } = decodeWebMChunk(currentDataView, elementType, channelCount);
                            const remainingDataView = offset < currentDataView.byteLength
                                ? new MultiBufferDataView(currentDataView.buffers, currentDataView.byteOffset + offset)
                                : null;
                            contents.forEach((content) => port.postMessage(content, content.map(({ buffer }) => buffer)));
                            if (pendingInvocations === 0 && (nativeMediaRecorder.state === 'inactive' || isStopped)) {
                                encode(encoderId, null).then((arrayBuffers) => {
                                    dispatchDataAvailableEvent([...bufferedArrayBuffers, ...arrayBuffers]);
                                    bufferedArrayBuffers.length = 0;
                                    eventTarget.dispatchEvent(new Event('stop'));
                                });
                                port.postMessage([]);
                                port.close();
                                removeEventListener();
                            }
                            return { dataView: remainingDataView, elementType: currentElementType, encoderId, port };
                        });
                    });
                    if (timeslice !== undefined) {
                        promisedDataViewElementTypeEncoderIdAndPort.then(({ encoderId }) => (promisedPartialRecording = requestNextPartialRecording(encoderId, timeslice)));
                    }
                }
                nativeMediaRecorder.start(100);
            },
            stop
        };
    };
};

const createWindow = () => (typeof window === 'undefined' ? null : window);

const readVariableSizeIntegerLength = (dataView, offset) => {
    if (offset >= dataView.byteLength) {
        return null;
    }
    const byte = dataView.getUint8(offset);
    if (byte > 127) {
        return 1;
    }
    if (byte > 63) {
        return 2;
    }
    if (byte > 31) {
        return 3;
    }
    if (byte > 15) {
        return 4;
    }
    if (byte > 7) {
        return 5;
    }
    if (byte > 3) {
        return 6;
    }
    if (byte > 1) {
        return 7;
    }
    if (byte > 0) {
        return 8;
    }
    const length = readVariableSizeIntegerLength(dataView, offset + 1);
    return length === null ? null : length + 8;
};

const wrapEventListener = (target, eventListener) => {
    return (event) => {
        const descriptor = { value: target };
        Object.defineProperties(event, {
            currentTarget: descriptor,
            target: descriptor
        });
        if (typeof eventListener === 'function') {
            return eventListener.call(target, event);
        }
        return eventListener.handleEvent.call(target, event);
    };
};

const encoderRegexes = [];
const window$1 = createWindow();
const nativeBlobEventConstructor = createNativeBlobEventConstructor(window$1);
const createBlobEvent = createBlobEventFactory(nativeBlobEventConstructor);
const createWebAudioMediaRecorder = createWebAudioMediaRecorderFactory(createBlobEvent, createInvalidModificationError, createInvalidStateError$1, createNotSupportedError$1);
const readVariableSizeInteger = createReadVariableSizeInteger(readVariableSizeIntegerLength);
const readElementContent = createReadElementContent(readVariableSizeInteger);
const readElementType = createReadElementType(readVariableSizeInteger);
const decodeWebMChunk = createDecodeWebMChunk(readElementContent, readElementType);
const createWebmPcmMediaRecorder = createWebmPcmMediaRecorderFactory(createBlobEvent, decodeWebMChunk, readVariableSizeInteger);
const createEventTarget = createEventTargetFactory(window$1);
const nativeMediaRecorderConstructor = createNativeMediaRecorderConstructor(window$1);
const mediaRecorderConstructor = createMediaRecorderConstructor(createNativeMediaRecorder, createNotSupportedError$1, createWebAudioMediaRecorder, createWebmPcmMediaRecorder, encoderRegexes, createEventTargetConstructor$1(createEventTarget, wrapEventListener), nativeMediaRecorderConstructor);
const isSupported = () => createIsSupportedPromise(window$1);
const register = async (port) => {
    encoderRegexes.push(await register$1(port));
};

export { mediaRecorderConstructor as MediaRecorder, isSupported, register };
//# sourceMappingURL=module-a40c6965.js.map
