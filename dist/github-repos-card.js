/*! github-repos-card 1.1.0 | MIT License */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i5 = decorators.length - 1, decorator; i5 >= 0; i5--)
    if (decorator = decorators[i5])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// node_modules/@lit/reactive-element/css-tag.js
var t = globalThis;
var e = t.ShadowRoot && (void 0 === t.ShadyCSS || t.ShadyCSS.nativeShadow) && "adoptedStyleSheets" in Document.prototype && "replace" in CSSStyleSheet.prototype;
var s = /* @__PURE__ */ Symbol();
var o = /* @__PURE__ */ new WeakMap();
var n = class {
  constructor(t4, e5, o6) {
    if (this._$cssResult$ = true, o6 !== s) throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");
    this.cssText = t4, this.t = e5;
  }
  get styleSheet() {
    let t4 = this.o;
    const s4 = this.t;
    if (e && void 0 === t4) {
      const e5 = void 0 !== s4 && 1 === s4.length;
      e5 && (t4 = o.get(s4)), void 0 === t4 && ((this.o = t4 = new CSSStyleSheet()).replaceSync(this.cssText), e5 && o.set(s4, t4));
    }
    return t4;
  }
  toString() {
    return this.cssText;
  }
};
var r = (t4) => new n("string" == typeof t4 ? t4 : t4 + "", void 0, s);
var i = (t4, ...e5) => {
  const o6 = 1 === t4.length ? t4[0] : e5.reduce((e6, s4, o7) => e6 + ((t5) => {
    if (true === t5._$cssResult$) return t5.cssText;
    if ("number" == typeof t5) return t5;
    throw Error("Value passed to 'css' function must be a 'css' function result: " + t5 + ". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.");
  })(s4) + t4[o7 + 1], t4[0]);
  return new n(o6, t4, s);
};
var S = (s4, o6) => {
  if (e) s4.adoptedStyleSheets = o6.map((t4) => t4 instanceof CSSStyleSheet ? t4 : t4.styleSheet);
  else for (const e5 of o6) {
    const o7 = document.createElement("style"), n5 = t.litNonce;
    void 0 !== n5 && o7.setAttribute("nonce", n5), o7.textContent = e5.cssText, s4.appendChild(o7);
  }
};
var c = e ? (t4) => t4 : (t4) => t4 instanceof CSSStyleSheet ? ((t5) => {
  let e5 = "";
  for (const s4 of t5.cssRules) e5 += s4.cssText;
  return r(e5);
})(t4) : t4;

// node_modules/@lit/reactive-element/reactive-element.js
var { is: i2, defineProperty: e2, getOwnPropertyDescriptor: h, getOwnPropertyNames: r2, getOwnPropertySymbols: o2, getPrototypeOf: n2 } = Object;
var a = globalThis;
var c2 = a.trustedTypes;
var l = c2 ? c2.emptyScript : "";
var p = a.reactiveElementPolyfillSupport;
var d = (t4, s4) => t4;
var u = { toAttribute(t4, s4) {
  switch (s4) {
    case Boolean:
      t4 = t4 ? l : null;
      break;
    case Object:
    case Array:
      t4 = null == t4 ? t4 : JSON.stringify(t4);
  }
  return t4;
}, fromAttribute(t4, s4) {
  let i5 = t4;
  switch (s4) {
    case Boolean:
      i5 = null !== t4;
      break;
    case Number:
      i5 = null === t4 ? null : Number(t4);
      break;
    case Object:
    case Array:
      try {
        i5 = JSON.parse(t4);
      } catch (t5) {
        i5 = null;
      }
  }
  return i5;
} };
var f = (t4, s4) => !i2(t4, s4);
var b = { attribute: true, type: String, converter: u, reflect: false, useDefault: false, hasChanged: f };
Symbol.metadata ?? (Symbol.metadata = /* @__PURE__ */ Symbol("metadata")), a.litPropertyMetadata ?? (a.litPropertyMetadata = /* @__PURE__ */ new WeakMap());
var y = class extends HTMLElement {
  static addInitializer(t4) {
    this._$Ei(), (this.l ?? (this.l = [])).push(t4);
  }
  static get observedAttributes() {
    return this.finalize(), this._$Eh && [...this._$Eh.keys()];
  }
  static createProperty(t4, s4 = b) {
    if (s4.state && (s4.attribute = false), this._$Ei(), this.prototype.hasOwnProperty(t4) && ((s4 = Object.create(s4)).wrapped = true), this.elementProperties.set(t4, s4), !s4.noAccessor) {
      const i5 = /* @__PURE__ */ Symbol(), h3 = this.getPropertyDescriptor(t4, i5, s4);
      void 0 !== h3 && e2(this.prototype, t4, h3);
    }
  }
  static getPropertyDescriptor(t4, s4, i5) {
    const { get: e5, set: r6 } = h(this.prototype, t4) ?? { get() {
      return this[s4];
    }, set(t5) {
      this[s4] = t5;
    } };
    return { get: e5, set(s5) {
      const h3 = e5?.call(this);
      r6?.call(this, s5), this.requestUpdate(t4, h3, i5);
    }, configurable: true, enumerable: true };
  }
  static getPropertyOptions(t4) {
    return this.elementProperties.get(t4) ?? b;
  }
  static _$Ei() {
    if (this.hasOwnProperty(d("elementProperties"))) return;
    const t4 = n2(this);
    t4.finalize(), void 0 !== t4.l && (this.l = [...t4.l]), this.elementProperties = new Map(t4.elementProperties);
  }
  static finalize() {
    if (this.hasOwnProperty(d("finalized"))) return;
    if (this.finalized = true, this._$Ei(), this.hasOwnProperty(d("properties"))) {
      const t5 = this.properties, s4 = [...r2(t5), ...o2(t5)];
      for (const i5 of s4) this.createProperty(i5, t5[i5]);
    }
    const t4 = this[Symbol.metadata];
    if (null !== t4) {
      const s4 = litPropertyMetadata.get(t4);
      if (void 0 !== s4) for (const [t5, i5] of s4) this.elementProperties.set(t5, i5);
    }
    this._$Eh = /* @__PURE__ */ new Map();
    for (const [t5, s4] of this.elementProperties) {
      const i5 = this._$Eu(t5, s4);
      void 0 !== i5 && this._$Eh.set(i5, t5);
    }
    this.elementStyles = this.finalizeStyles(this.styles);
  }
  static finalizeStyles(s4) {
    const i5 = [];
    if (Array.isArray(s4)) {
      const e5 = new Set(s4.flat(1 / 0).reverse());
      for (const s5 of e5) i5.unshift(c(s5));
    } else void 0 !== s4 && i5.push(c(s4));
    return i5;
  }
  static _$Eu(t4, s4) {
    const i5 = s4.attribute;
    return false === i5 ? void 0 : "string" == typeof i5 ? i5 : "string" == typeof t4 ? t4.toLowerCase() : void 0;
  }
  constructor() {
    super(), this._$Ep = void 0, this.isUpdatePending = false, this.hasUpdated = false, this._$Em = null, this._$Ev();
  }
  _$Ev() {
    this._$ES = new Promise((t4) => this.enableUpdating = t4), this._$AL = /* @__PURE__ */ new Map(), this._$E_(), this.requestUpdate(), this.constructor.l?.forEach((t4) => t4(this));
  }
  addController(t4) {
    (this._$EO ?? (this._$EO = /* @__PURE__ */ new Set())).add(t4), void 0 !== this.renderRoot && this.isConnected && t4.hostConnected?.();
  }
  removeController(t4) {
    this._$EO?.delete(t4);
  }
  _$E_() {
    const t4 = /* @__PURE__ */ new Map(), s4 = this.constructor.elementProperties;
    for (const i5 of s4.keys()) this.hasOwnProperty(i5) && (t4.set(i5, this[i5]), delete this[i5]);
    t4.size > 0 && (this._$Ep = t4);
  }
  createRenderRoot() {
    const t4 = this.shadowRoot ?? this.attachShadow(this.constructor.shadowRootOptions);
    return S(t4, this.constructor.elementStyles), t4;
  }
  connectedCallback() {
    this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this.enableUpdating(true), this._$EO?.forEach((t4) => t4.hostConnected?.());
  }
  enableUpdating(t4) {
  }
  disconnectedCallback() {
    this._$EO?.forEach((t4) => t4.hostDisconnected?.());
  }
  attributeChangedCallback(t4, s4, i5) {
    this._$AK(t4, i5);
  }
  _$ET(t4, s4) {
    const i5 = this.constructor.elementProperties.get(t4), e5 = this.constructor._$Eu(t4, i5);
    if (void 0 !== e5 && true === i5.reflect) {
      const h3 = (void 0 !== i5.converter?.toAttribute ? i5.converter : u).toAttribute(s4, i5.type);
      this._$Em = t4, null == h3 ? this.removeAttribute(e5) : this.setAttribute(e5, h3), this._$Em = null;
    }
  }
  _$AK(t4, s4) {
    const i5 = this.constructor, e5 = i5._$Eh.get(t4);
    if (void 0 !== e5 && this._$Em !== e5) {
      const t5 = i5.getPropertyOptions(e5), h3 = "function" == typeof t5.converter ? { fromAttribute: t5.converter } : void 0 !== t5.converter?.fromAttribute ? t5.converter : u;
      this._$Em = e5;
      const r6 = h3.fromAttribute(s4, t5.type);
      this[e5] = r6 ?? this._$Ej?.get(e5) ?? r6, this._$Em = null;
    }
  }
  requestUpdate(t4, s4, i5, e5 = false, h3) {
    if (void 0 !== t4) {
      const r6 = this.constructor;
      if (false === e5 && (h3 = this[t4]), i5 ?? (i5 = r6.getPropertyOptions(t4)), !((i5.hasChanged ?? f)(h3, s4) || i5.useDefault && i5.reflect && h3 === this._$Ej?.get(t4) && !this.hasAttribute(r6._$Eu(t4, i5)))) return;
      this.C(t4, s4, i5);
    }
    false === this.isUpdatePending && (this._$ES = this._$EP());
  }
  C(t4, s4, { useDefault: i5, reflect: e5, wrapped: h3 }, r6) {
    i5 && !(this._$Ej ?? (this._$Ej = /* @__PURE__ */ new Map())).has(t4) && (this._$Ej.set(t4, r6 ?? s4 ?? this[t4]), true !== h3 || void 0 !== r6) || (this._$AL.has(t4) || (this.hasUpdated || i5 || (s4 = void 0), this._$AL.set(t4, s4)), true === e5 && this._$Em !== t4 && (this._$Eq ?? (this._$Eq = /* @__PURE__ */ new Set())).add(t4));
  }
  async _$EP() {
    this.isUpdatePending = true;
    try {
      await this._$ES;
    } catch (t5) {
      Promise.reject(t5);
    }
    const t4 = this.scheduleUpdate();
    return null != t4 && await t4, !this.isUpdatePending;
  }
  scheduleUpdate() {
    return this.performUpdate();
  }
  performUpdate() {
    if (!this.isUpdatePending) return;
    if (!this.hasUpdated) {
      if (this.renderRoot ?? (this.renderRoot = this.createRenderRoot()), this._$Ep) {
        for (const [t6, s5] of this._$Ep) this[t6] = s5;
        this._$Ep = void 0;
      }
      const t5 = this.constructor.elementProperties;
      if (t5.size > 0) for (const [s5, i5] of t5) {
        const { wrapped: t6 } = i5, e5 = this[s5];
        true !== t6 || this._$AL.has(s5) || void 0 === e5 || this.C(s5, void 0, i5, e5);
      }
    }
    let t4 = false;
    const s4 = this._$AL;
    try {
      t4 = this.shouldUpdate(s4), t4 ? (this.willUpdate(s4), this._$EO?.forEach((t5) => t5.hostUpdate?.()), this.update(s4)) : this._$EM();
    } catch (s5) {
      throw t4 = false, this._$EM(), s5;
    }
    t4 && this._$AE(s4);
  }
  willUpdate(t4) {
  }
  _$AE(t4) {
    this._$EO?.forEach((t5) => t5.hostUpdated?.()), this.hasUpdated || (this.hasUpdated = true, this.firstUpdated(t4)), this.updated(t4);
  }
  _$EM() {
    this._$AL = /* @__PURE__ */ new Map(), this.isUpdatePending = false;
  }
  get updateComplete() {
    return this.getUpdateComplete();
  }
  getUpdateComplete() {
    return this._$ES;
  }
  shouldUpdate(t4) {
    return true;
  }
  update(t4) {
    this._$Eq && (this._$Eq = this._$Eq.forEach((t5) => this._$ET(t5, this[t5]))), this._$EM();
  }
  updated(t4) {
  }
  firstUpdated(t4) {
  }
};
y.elementStyles = [], y.shadowRootOptions = { mode: "open" }, y[d("elementProperties")] = /* @__PURE__ */ new Map(), y[d("finalized")] = /* @__PURE__ */ new Map(), p?.({ ReactiveElement: y }), (a.reactiveElementVersions ?? (a.reactiveElementVersions = [])).push("2.1.2");

// node_modules/lit-html/lit-html.js
var t2 = globalThis;
var i3 = (t4) => t4;
var s2 = t2.trustedTypes;
var e3 = s2 ? s2.createPolicy("lit-html", { createHTML: (t4) => t4 }) : void 0;
var h2 = "$lit$";
var o3 = `lit$${Math.random().toFixed(9).slice(2)}$`;
var n3 = "?" + o3;
var r3 = `<${n3}>`;
var l2 = document;
var c3 = () => l2.createComment("");
var a2 = (t4) => null === t4 || "object" != typeof t4 && "function" != typeof t4;
var u2 = Array.isArray;
var d2 = (t4) => u2(t4) || "function" == typeof t4?.[Symbol.iterator];
var f2 = "[ 	\n\f\r]";
var v = /<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g;
var _ = /-->/g;
var m = />/g;
var p2 = RegExp(`>|${f2}(?:([^\\s"'>=/]+)(${f2}*=${f2}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`, "g");
var g = /'/g;
var $ = /"/g;
var y2 = /^(?:script|style|textarea|title)$/i;
var x = (t4) => (i5, ...s4) => ({ _$litType$: t4, strings: i5, values: s4 });
var b2 = x(1);
var w = x(2);
var T = x(3);
var E = /* @__PURE__ */ Symbol.for("lit-noChange");
var A = /* @__PURE__ */ Symbol.for("lit-nothing");
var C = /* @__PURE__ */ new WeakMap();
var P = l2.createTreeWalker(l2, 129);
function V(t4, i5) {
  if (!u2(t4) || !t4.hasOwnProperty("raw")) throw Error("invalid template strings array");
  return void 0 !== e3 ? e3.createHTML(i5) : i5;
}
var N = (t4, i5) => {
  const s4 = t4.length - 1, e5 = [];
  let n5, l3 = 2 === i5 ? "<svg>" : 3 === i5 ? "<math>" : "", c4 = v;
  for (let i6 = 0; i6 < s4; i6++) {
    const s5 = t4[i6];
    let a3, u3, d3 = -1, f3 = 0;
    for (; f3 < s5.length && (c4.lastIndex = f3, u3 = c4.exec(s5), null !== u3); ) f3 = c4.lastIndex, c4 === v ? "!--" === u3[1] ? c4 = _ : void 0 !== u3[1] ? c4 = m : void 0 !== u3[2] ? (y2.test(u3[2]) && (n5 = RegExp("</" + u3[2], "g")), c4 = p2) : void 0 !== u3[3] && (c4 = p2) : c4 === p2 ? ">" === u3[0] ? (c4 = n5 ?? v, d3 = -1) : void 0 === u3[1] ? d3 = -2 : (d3 = c4.lastIndex - u3[2].length, a3 = u3[1], c4 = void 0 === u3[3] ? p2 : '"' === u3[3] ? $ : g) : c4 === $ || c4 === g ? c4 = p2 : c4 === _ || c4 === m ? c4 = v : (c4 = p2, n5 = void 0);
    const x2 = c4 === p2 && t4[i6 + 1].startsWith("/>") ? " " : "";
    l3 += c4 === v ? s5 + r3 : d3 >= 0 ? (e5.push(a3), s5.slice(0, d3) + h2 + s5.slice(d3) + o3 + x2) : s5 + o3 + (-2 === d3 ? i6 : x2);
  }
  return [V(t4, l3 + (t4[s4] || "<?>") + (2 === i5 ? "</svg>" : 3 === i5 ? "</math>" : "")), e5];
};
var S2 = class _S {
  constructor({ strings: t4, _$litType$: i5 }, e5) {
    let r6;
    this.parts = [];
    let l3 = 0, a3 = 0;
    const u3 = t4.length - 1, d3 = this.parts, [f3, v2] = N(t4, i5);
    if (this.el = _S.createElement(f3, e5), P.currentNode = this.el.content, 2 === i5 || 3 === i5) {
      const t5 = this.el.content.firstChild;
      t5.replaceWith(...t5.childNodes);
    }
    for (; null !== (r6 = P.nextNode()) && d3.length < u3; ) {
      if (1 === r6.nodeType) {
        if (r6.hasAttributes()) for (const t5 of r6.getAttributeNames()) if (t5.endsWith(h2)) {
          const i6 = v2[a3++], s4 = r6.getAttribute(t5).split(o3), e6 = /([.?@])?(.*)/.exec(i6);
          d3.push({ type: 1, index: l3, name: e6[2], strings: s4, ctor: "." === e6[1] ? I : "?" === e6[1] ? L : "@" === e6[1] ? z : H }), r6.removeAttribute(t5);
        } else t5.startsWith(o3) && (d3.push({ type: 6, index: l3 }), r6.removeAttribute(t5));
        if (y2.test(r6.tagName)) {
          const t5 = r6.textContent.split(o3), i6 = t5.length - 1;
          if (i6 > 0) {
            r6.textContent = s2 ? s2.emptyScript : "";
            for (let s4 = 0; s4 < i6; s4++) r6.append(t5[s4], c3()), P.nextNode(), d3.push({ type: 2, index: ++l3 });
            r6.append(t5[i6], c3());
          }
        }
      } else if (8 === r6.nodeType) if (r6.data === n3) d3.push({ type: 2, index: l3 });
      else {
        let t5 = -1;
        for (; -1 !== (t5 = r6.data.indexOf(o3, t5 + 1)); ) d3.push({ type: 7, index: l3 }), t5 += o3.length - 1;
      }
      l3++;
    }
  }
  static createElement(t4, i5) {
    const s4 = l2.createElement("template");
    return s4.innerHTML = t4, s4;
  }
};
function M(t4, i5, s4 = t4, e5) {
  if (i5 === E) return i5;
  let h3 = void 0 !== e5 ? s4._$Co?.[e5] : s4._$Cl;
  const o6 = a2(i5) ? void 0 : i5._$litDirective$;
  return h3?.constructor !== o6 && (h3?._$AO?.(false), void 0 === o6 ? h3 = void 0 : (h3 = new o6(t4), h3._$AT(t4, s4, e5)), void 0 !== e5 ? (s4._$Co ?? (s4._$Co = []))[e5] = h3 : s4._$Cl = h3), void 0 !== h3 && (i5 = M(t4, h3._$AS(t4, i5.values), h3, e5)), i5;
}
var R = class {
  constructor(t4, i5) {
    this._$AV = [], this._$AN = void 0, this._$AD = t4, this._$AM = i5;
  }
  get parentNode() {
    return this._$AM.parentNode;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  u(t4) {
    const { el: { content: i5 }, parts: s4 } = this._$AD, e5 = (t4?.creationScope ?? l2).importNode(i5, true);
    P.currentNode = e5;
    let h3 = P.nextNode(), o6 = 0, n5 = 0, r6 = s4[0];
    for (; void 0 !== r6; ) {
      if (o6 === r6.index) {
        let i6;
        2 === r6.type ? i6 = new k(h3, h3.nextSibling, this, t4) : 1 === r6.type ? i6 = new r6.ctor(h3, r6.name, r6.strings, this, t4) : 6 === r6.type && (i6 = new Z(h3, this, t4)), this._$AV.push(i6), r6 = s4[++n5];
      }
      o6 !== r6?.index && (h3 = P.nextNode(), o6++);
    }
    return P.currentNode = l2, e5;
  }
  p(t4) {
    let i5 = 0;
    for (const s4 of this._$AV) void 0 !== s4 && (void 0 !== s4.strings ? (s4._$AI(t4, s4, i5), i5 += s4.strings.length - 2) : s4._$AI(t4[i5])), i5++;
  }
};
var k = class _k {
  get _$AU() {
    return this._$AM?._$AU ?? this._$Cv;
  }
  constructor(t4, i5, s4, e5) {
    this.type = 2, this._$AH = A, this._$AN = void 0, this._$AA = t4, this._$AB = i5, this._$AM = s4, this.options = e5, this._$Cv = e5?.isConnected ?? true;
  }
  get parentNode() {
    let t4 = this._$AA.parentNode;
    const i5 = this._$AM;
    return void 0 !== i5 && 11 === t4?.nodeType && (t4 = i5.parentNode), t4;
  }
  get startNode() {
    return this._$AA;
  }
  get endNode() {
    return this._$AB;
  }
  _$AI(t4, i5 = this) {
    t4 = M(this, t4, i5), a2(t4) ? t4 === A || null == t4 || "" === t4 ? (this._$AH !== A && this._$AR(), this._$AH = A) : t4 !== this._$AH && t4 !== E && this._(t4) : void 0 !== t4._$litType$ ? this.$(t4) : void 0 !== t4.nodeType ? this.T(t4) : d2(t4) ? this.k(t4) : this._(t4);
  }
  O(t4) {
    return this._$AA.parentNode.insertBefore(t4, this._$AB);
  }
  T(t4) {
    this._$AH !== t4 && (this._$AR(), this._$AH = this.O(t4));
  }
  _(t4) {
    this._$AH !== A && a2(this._$AH) ? this._$AA.nextSibling.data = t4 : this.T(l2.createTextNode(t4)), this._$AH = t4;
  }
  $(t4) {
    const { values: i5, _$litType$: s4 } = t4, e5 = "number" == typeof s4 ? this._$AC(t4) : (void 0 === s4.el && (s4.el = S2.createElement(V(s4.h, s4.h[0]), this.options)), s4);
    if (this._$AH?._$AD === e5) this._$AH.p(i5);
    else {
      const t5 = new R(e5, this), s5 = t5.u(this.options);
      t5.p(i5), this.T(s5), this._$AH = t5;
    }
  }
  _$AC(t4) {
    let i5 = C.get(t4.strings);
    return void 0 === i5 && C.set(t4.strings, i5 = new S2(t4)), i5;
  }
  k(t4) {
    u2(this._$AH) || (this._$AH = [], this._$AR());
    const i5 = this._$AH;
    let s4, e5 = 0;
    for (const h3 of t4) e5 === i5.length ? i5.push(s4 = new _k(this.O(c3()), this.O(c3()), this, this.options)) : s4 = i5[e5], s4._$AI(h3), e5++;
    e5 < i5.length && (this._$AR(s4 && s4._$AB.nextSibling, e5), i5.length = e5);
  }
  _$AR(t4 = this._$AA.nextSibling, s4) {
    for (this._$AP?.(false, true, s4); t4 !== this._$AB; ) {
      const s5 = i3(t4).nextSibling;
      i3(t4).remove(), t4 = s5;
    }
  }
  setConnected(t4) {
    void 0 === this._$AM && (this._$Cv = t4, this._$AP?.(t4));
  }
};
var H = class {
  get tagName() {
    return this.element.tagName;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  constructor(t4, i5, s4, e5, h3) {
    this.type = 1, this._$AH = A, this._$AN = void 0, this.element = t4, this.name = i5, this._$AM = e5, this.options = h3, s4.length > 2 || "" !== s4[0] || "" !== s4[1] ? (this._$AH = Array(s4.length - 1).fill(new String()), this.strings = s4) : this._$AH = A;
  }
  _$AI(t4, i5 = this, s4, e5) {
    const h3 = this.strings;
    let o6 = false;
    if (void 0 === h3) t4 = M(this, t4, i5, 0), o6 = !a2(t4) || t4 !== this._$AH && t4 !== E, o6 && (this._$AH = t4);
    else {
      const e6 = t4;
      let n5, r6;
      for (t4 = h3[0], n5 = 0; n5 < h3.length - 1; n5++) r6 = M(this, e6[s4 + n5], i5, n5), r6 === E && (r6 = this._$AH[n5]), o6 || (o6 = !a2(r6) || r6 !== this._$AH[n5]), r6 === A ? t4 = A : t4 !== A && (t4 += (r6 ?? "") + h3[n5 + 1]), this._$AH[n5] = r6;
    }
    o6 && !e5 && this.j(t4);
  }
  j(t4) {
    t4 === A ? this.element.removeAttribute(this.name) : this.element.setAttribute(this.name, t4 ?? "");
  }
};
var I = class extends H {
  constructor() {
    super(...arguments), this.type = 3;
  }
  j(t4) {
    this.element[this.name] = t4 === A ? void 0 : t4;
  }
};
var L = class extends H {
  constructor() {
    super(...arguments), this.type = 4;
  }
  j(t4) {
    this.element.toggleAttribute(this.name, !!t4 && t4 !== A);
  }
};
var z = class extends H {
  constructor(t4, i5, s4, e5, h3) {
    super(t4, i5, s4, e5, h3), this.type = 5;
  }
  _$AI(t4, i5 = this) {
    if ((t4 = M(this, t4, i5, 0) ?? A) === E) return;
    const s4 = this._$AH, e5 = t4 === A && s4 !== A || t4.capture !== s4.capture || t4.once !== s4.once || t4.passive !== s4.passive, h3 = t4 !== A && (s4 === A || e5);
    e5 && this.element.removeEventListener(this.name, this, s4), h3 && this.element.addEventListener(this.name, this, t4), this._$AH = t4;
  }
  handleEvent(t4) {
    "function" == typeof this._$AH ? this._$AH.call(this.options?.host ?? this.element, t4) : this._$AH.handleEvent(t4);
  }
};
var Z = class {
  constructor(t4, i5, s4) {
    this.element = t4, this.type = 6, this._$AN = void 0, this._$AM = i5, this.options = s4;
  }
  get _$AU() {
    return this._$AM._$AU;
  }
  _$AI(t4) {
    M(this, t4);
  }
};
var B = t2.litHtmlPolyfillSupport;
B?.(S2, k), (t2.litHtmlVersions ?? (t2.litHtmlVersions = [])).push("3.3.3");
var D = (t4, i5, s4) => {
  const e5 = s4?.renderBefore ?? i5;
  let h3 = e5._$litPart$;
  if (void 0 === h3) {
    const t5 = s4?.renderBefore ?? null;
    e5._$litPart$ = h3 = new k(i5.insertBefore(c3(), t5), t5, void 0, s4 ?? {});
  }
  return h3._$AI(t4), h3;
};

// node_modules/lit-element/lit-element.js
var s3 = globalThis;
var i4 = class extends y {
  constructor() {
    super(...arguments), this.renderOptions = { host: this }, this._$Do = void 0;
  }
  createRenderRoot() {
    var _a;
    const t4 = super.createRenderRoot();
    return (_a = this.renderOptions).renderBefore ?? (_a.renderBefore = t4.firstChild), t4;
  }
  update(t4) {
    const r6 = this.render();
    this.hasUpdated || (this.renderOptions.isConnected = this.isConnected), super.update(t4), this._$Do = D(r6, this.renderRoot, this.renderOptions);
  }
  connectedCallback() {
    super.connectedCallback(), this._$Do?.setConnected(true);
  }
  disconnectedCallback() {
    super.disconnectedCallback(), this._$Do?.setConnected(false);
  }
  render() {
    return E;
  }
};
i4._$litElement$ = true, i4["finalized"] = true, s3.litElementHydrateSupport?.({ LitElement: i4 });
var o4 = s3.litElementPolyfillSupport;
o4?.({ LitElement: i4 });
(s3.litElementVersions ?? (s3.litElementVersions = [])).push("4.2.2");

// node_modules/@lit/reactive-element/decorators/custom-element.js
var t3 = (t4) => (e5, o6) => {
  void 0 !== o6 ? o6.addInitializer(() => {
    customElements.define(t4, e5);
  }) : customElements.define(t4, e5);
};

// node_modules/@lit/reactive-element/decorators/property.js
var o5 = { attribute: true, type: String, converter: u, reflect: false, hasChanged: f };
var r4 = (t4 = o5, e5, r6) => {
  const { kind: n5, metadata: i5 } = r6;
  let s4 = globalThis.litPropertyMetadata.get(i5);
  if (void 0 === s4 && globalThis.litPropertyMetadata.set(i5, s4 = /* @__PURE__ */ new Map()), "setter" === n5 && ((t4 = Object.create(t4)).wrapped = true), s4.set(r6.name, t4), "accessor" === n5) {
    const { name: o6 } = r6;
    return { set(r7) {
      const n6 = e5.get.call(this);
      e5.set.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    }, init(e6) {
      return void 0 !== e6 && this.C(o6, void 0, t4, e6), e6;
    } };
  }
  if ("setter" === n5) {
    const { name: o6 } = r6;
    return function(r7) {
      const n6 = this[o6];
      e5.call(this, r7), this.requestUpdate(o6, n6, t4, true, r7);
    };
  }
  throw Error("Unsupported decorator location: " + n5);
};
function n4(t4) {
  return (e5, o6) => "object" == typeof o6 ? r4(t4, e5, o6) : ((t5, e6, o7) => {
    const r6 = e6.hasOwnProperty(o7);
    return e6.constructor.createProperty(o7, t5), r6 ? Object.getOwnPropertyDescriptor(e6, o7) : void 0;
  })(t4, e5, o6);
}

// node_modules/@lit/reactive-element/decorators/state.js
function r5(r6) {
  return n4({ ...r6, state: true, attribute: false });
}

// src/const.ts
var CARD_VERSION = "1.1.0";
var NUMBERS = [
  { option: "show_issues", key: "issues_count", icon: "mdi:alert-circle-outline", shown: true },
  { option: "show_pull_requests", key: "pulls_count", icon: "mdi:source-pull", shown: true },
  { option: "show_merged_pull_requests", key: "merged_pulls_count", icon: "mdi:source-merge", shown: false },
  { option: "show_discussions", key: "discussions_count", icon: "mdi:forum-outline", shown: false },
  { option: "show_stars", key: "stargazers_count", icon: "mdi:star-outline", shown: true },
  { option: "show_forks", key: "forks_count", icon: "mdi:source-fork", shown: true },
  { option: "show_watchers", key: "subscribers_count", icon: "mdi:eye-outline", shown: true },
  { option: "show_downloads", key: "latest_release_downloads", icon: "mdi:download-outline", shown: false }
];
var TODOS = ["todo_issues", "todo_pull_requests", "todo_unreleased"];
var DEFAULT_TAP = "github";

// src/height.ts
var HEIGHT_MODES = ["auto", "fixed", "max"];
var pixels = (value) => value == null || typeof value === "number" && Number.isFinite(value) && value > 0;
function validHeight(config) {
  return (config.height_mode == null || HEIGHT_MODES.includes(config.height_mode)) && pixels(config.height) && pixels(config.max_height);
}
function heightMode(config) {
  return config.height_mode ?? (config.height ? "fixed" : config.max_height ? "max" : "auto");
}
var ROW_HEIGHT = 56;
var ROW_GAP = 8;
function heightStyle(config, layout, minimum = 0) {
  const rows = config.grid_options ? config.grid_options.rows : config.layout_options?.grid_rows;
  if (layout === "grid" && typeof rows === "number") {
    return "height: 100%";
  }
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return `height: ${Math.max(config.height, minimum)}px`;
  }
  return mode === "max" && config.max_height ? `max-height: ${Math.max(config.max_height, minimum)}px` : "";
}
function gridMinRows(minimum) {
  return Math.max(1, Math.ceil((minimum + ROW_GAP) / (ROW_HEIGHT + ROW_GAP)));
}
function heightCardSize(config, content, minimum = 0) {
  const mode = heightMode(config);
  if (mode === "fixed" && config.height) {
    return Math.max(1, Math.round(Math.max(config.height, minimum) / 50));
  }
  return mode === "max" && config.max_height ? Math.max(1, Math.min(content, Math.round(Math.max(config.max_height, minimum) / 50))) : content;
}
function heightSchema(config, text) {
  const mode = heightMode(config);
  const field = (name) => ({
    name,
    selector: { number: { min: 100, max: 2e3, step: 10, unit_of_measurement: "px", mode: "box" } }
  });
  return [
    {
      name: "height_mode",
      selector: {
        select: { mode: "dropdown", options: HEIGHT_MODES.map((value) => ({ value, label: text(`editor.height_mode_${value}`) })) }
      }
    },
    ...mode === "fixed" ? [field("height")] : mode === "max" ? [field("max_height")] : []
  ];
}
function heightData(config) {
  return { ...config, height_mode: heightMode(config) };
}
function tidyHeight(config) {
  const mode = heightMode(config);
  const tidied = { ...config };
  if (mode !== "fixed" || !tidied.height) {
    delete tidied.height;
  }
  if (mode !== "max" || !tidied.max_height) {
    delete tidied.max_height;
  }
  if (!tidied.height_mode || heightMode({ ...tidied, height_mode: void 0 }) === mode) {
    delete tidied.height_mode;
  }
  return tidied;
}

// src/localize/languages/en.json
var en_default = {
  common: {
    name: "GitHub repos card",
    description: "The repositories the GitHub integration follows, with their versions, issues, pull requests and unreleased commits.",
    invalid_configuration: "Invalid configuration. repos and exclude are lists of owner/repo names.",
    invalid_height: "Invalid height. height and max_height must be positive numbers of pixels, and height_mode auto, fixed or max.",
    no_repos: "No repositories. Add them to the GitHub integration in Home Assistant.",
    none_shown: "No repositories to show.",
    not_followed: "{repo} isn't followed by the GitHub integration.",
    latest_release: "Latest release",
    unreleased: "Commits after this release",
    quiet_one: "{count} repo with nothing to do",
    quiet_other: "{count} repos with nothing to do"
  },
  numbers: {
    issues_count: "Open issues",
    pulls_count: "Open pull requests",
    merged_pulls_count: "Merged pull requests",
    discussions_count: "Discussions",
    stargazers_count: "Stars",
    forks_count: "Forks",
    subscribers_count: "Watchers",
    latest_release_downloads: "Downloads of the latest release"
  },
  editor: {
    title: "Title",
    repos: "Repositories",
    repos_helper: "Only these, as owner/repo. All followed repositories when left empty.",
    exclude: "Leave out",
    exclude_helper: "Repositories the card doesn't show.",
    numbers: "Numbers",
    show_issues: "Open issues",
    show_pull_requests: "Open pull requests",
    show_merged_pull_requests: "Merged pull requests",
    show_discussions: "Discussions",
    show_stars: "Stars",
    show_forks: "Forks",
    show_watchers: "Watchers",
    show_downloads: "Downloads of the latest release",
    folding: "Folding",
    fold_quiet: "Fold the repositories with nothing to do",
    fold_quiet_helper: "Those with something to do come first, and the rest fold into one line that opens on a tap.",
    todo_issues: "An open issue is something to do",
    todo_pull_requests: "An open pull request is something to do",
    todo_unreleased: "Commits after the latest release are something to do",
    tap: "Tap",
    tap_github: "Open the repository on GitHub",
    tap_more_info: "Show more info",
    language: "Language",
    language_helper: "Home Assistant's language when left empty.",
    height_mode: "Height",
    height_mode_helper: "A height set in the layout tab of a sections view is used instead.",
    height_mode_auto: "Fits the content",
    height_mode_fixed: "Fixed",
    height_mode_max: "Grows up to a limit",
    height: "Fixed height",
    height_helper: "The card is always this tall, and the list scrolls inside it.",
    max_height: "Maximum height",
    max_height_helper: "The card grows with its content up to this height, and then the list scrolls."
  }
};

// src/localize/languages/fi.json
var fi_default = {
  common: {
    name: "GitHub-repokortti",
    description: "GitHub-integraation seuraamat repot, niiden versiot, seikat, vetopyynn\xF6t ja julkaisemattomat muutokset.",
    invalid_configuration: "Virheelliset asetukset. repos ja exclude ovat listoja muodossa omistaja/repo.",
    invalid_height: "Virheellinen korkeus. Korkeuksien (height ja max_height) on oltava positiivisia lukuja pikselein\xE4, ja korkeustilan (height_mode) auto, fixed tai max.",
    no_repos: "Ei repoja. Lis\xE4\xE4 ne Home Assistantin GitHub-integraatioon.",
    none_shown: "Ei n\xE4ytett\xE4vi\xE4 repoja.",
    not_followed: "GitHub-integraatio ei seuraa repoa {repo}.",
    latest_release: "Viimeisin julkaisu",
    unreleased: "Muutoksia t\xE4m\xE4n julkaisun j\xE4lkeen",
    quiet_one: "{count} repo ilman teht\xE4v\xE4\xE4",
    quiet_other: "{count} repoa ilman teht\xE4v\xE4\xE4"
  },
  numbers: {
    issues_count: "Avoimet seikat",
    pulls_count: "Avoimet vetopyynn\xF6t",
    merged_pulls_count: "Yhdistetyt vetopyynn\xF6t",
    discussions_count: "Keskustelut",
    stargazers_count: "T\xE4hdet",
    forks_count: "Haaraumat",
    subscribers_count: "Seuraajat",
    latest_release_downloads: "Viimeisimm\xE4n julkaisun lataukset"
  },
  editor: {
    title: "Otsikko",
    repos: "Repot",
    repos_helper: "Vain n\xE4m\xE4, muodossa omistaja/repo. Tyhj\xE4n\xE4 kaikki seuratut repot.",
    exclude: "J\xE4t\xE4 pois",
    exclude_helper: "Repot, joita kortti ei n\xE4yt\xE4.",
    numbers: "Luvut",
    show_issues: "Avoimet seikat",
    show_pull_requests: "Avoimet vetopyynn\xF6t",
    show_merged_pull_requests: "Yhdistetyt vetopyynn\xF6t",
    show_discussions: "Keskustelut",
    show_stars: "T\xE4hdet",
    show_forks: "Haaraumat",
    show_watchers: "Seuraajat",
    show_downloads: "Viimeisimm\xE4n julkaisun lataukset",
    folding: "Taitto",
    fold_quiet: "Taita repot, joilla ei ole teht\xE4v\xE4\xE4",
    fold_quiet_helper: "Repot, joilla on teht\xE4v\xE4\xE4, tulevat ensin, ja muut taittuvat yhdeksi riviksi, joka avautuu napautuksella.",
    todo_issues: "Avoin seikka on teht\xE4v\xE4",
    todo_pull_requests: "Avoin vetopyynt\xF6 on teht\xE4v\xE4",
    todo_unreleased: "Muutokset viimeisimm\xE4n julkaisun j\xE4lkeen ovat teht\xE4v\xE4",
    tap: "Napautus",
    tap_github: "Avaa repo GitHubissa",
    tap_more_info: "N\xE4yt\xE4 lis\xE4tiedot",
    language: "Kieli",
    language_helper: "Tyhj\xE4n\xE4 Home Assistantin kieli.",
    height_mode: "Korkeus",
    height_mode_helper: "Osioihin jaetun n\xE4kym\xE4n asettelu-v\xE4lilehdell\xE4 asetettu korkeus ohittaa t\xE4m\xE4n.",
    height_mode_auto: "Sis\xE4ll\xF6n mukaan",
    height_mode_fixed: "Kiinte\xE4",
    height_mode_max: "Kasvaa rajaan asti",
    height: "Kiinte\xE4 korkeus",
    height_helper: "Kortti on aina n\xE4in korkea, ja lista vierii sen sis\xE4ll\xE4.",
    max_height: "Enimm\xE4iskorkeus",
    max_height_helper: "Kortti kasvaa sis\xE4lt\xF6ns\xE4 mukana t\xE4h\xE4n korkeuteen asti, ja sen j\xE4lkeen lista vierii."
  }
};

// src/localize/localize.ts
var FILES = { "./languages/en.json": en_default, "./languages/fi.json": fi_default };
var LANGUAGES = Object.fromEntries(
  Object.entries(FILES).map(([path, table]) => [path.replace(/^.*\/|\.json$/g, "").toLowerCase(), table])
);
var LANGUAGE_CODES = Object.keys(LANGUAGES).sort();
function translate(language, key) {
  const code = (language ?? "en").split(/[-_]/)[0].toLowerCase();
  return read(LANGUAGES[code], key) ?? read(LANGUAGES.en, key) ?? key;
}
function read(table, key) {
  let value = table;
  for (const part of key.split(".")) {
    if (value === null || typeof value !== "object") {
      return void 0;
    }
    value = value[part];
  }
  return typeof value === "string" ? value : void 0;
}
function browserLanguage() {
  return document.documentElement.lang || navigator.language || "en";
}

// src/repos.ts
var FULL_NAME = /^([^/\s]+)\/([^/\s]+)$/;
var COMMIT_URL = /\/commit\/([0-9a-f]{40})$/i;
function githubSensors(hass) {
  const devices = /* @__PURE__ */ new Map();
  for (const entry of Object.values(hass.entities ?? {})) {
    if (!entry || entry.platform !== "github" || !entry.device_id || !entry.translation_key) {
      continue;
    }
    const keys = devices.get(entry.device_id) ?? /* @__PURE__ */ new Map();
    keys.set(entry.translation_key, entry.entity_id);
    devices.set(entry.device_id, keys);
  }
  return devices;
}
function reposOf(hass) {
  const repos = [];
  for (const [deviceId, keys] of githubSensors(hass)) {
    const match = FULL_NAME.exec(hass.devices?.[deviceId]?.name ?? "");
    if (!match) {
      continue;
    }
    const [fullName, owner, name] = match;
    const state = (key) => known(hass.states[keys.get(key) ?? ""]);
    const numbers = {};
    for (const { key } of NUMBERS) {
      const value = Number(state(key)?.state);
      if (state(key) && Number.isFinite(value)) {
        numbers[key] = value;
      }
    }
    const release = state("latest_release");
    const version = typeof release?.attributes.tag === "string" ? release.attributes.tag : void 0;
    repos.push({
      owner,
      name,
      fullName,
      url: `https://github.com/${fullName}`,
      version,
      unreleased: !!version && hasUnreleased(state("latest_tag"), state("latest_commit")),
      numbers,
      // A repo with no release would open on a sensor that only says it is unavailable.
      entity: (release ? keys.get("latest_release") : void 0) ?? keys.get("latest_commit") ?? [...keys.values()][0]
    });
  }
  return sortRepos(repos);
}
function hasUnreleased(tag, commit) {
  const tagCommit = COMMIT_URL.exec(String(tag?.attributes.url ?? ""))?.[1];
  const head = commit?.attributes.sha;
  return !!tagCommit && typeof head === "string" && tagCommit.toLowerCase() !== head.toLowerCase();
}
function sortRepos(repos) {
  const compare = (a3, b3) => a3.localeCompare(b3, "en", { sensitivity: "base", numeric: true });
  return [...repos].sort((a3, b3) => compare(a3.name, b3.name) || compare(a3.owner, b3.owner));
}
function selectRepos(repos, config) {
  const key = (name) => name.trim().toLowerCase();
  const excluded = new Set((config.exclude ?? []).map(key));
  let shown = repos;
  let missing = [];
  if (config.repos?.length) {
    const wanted = new Set(config.repos.map(key));
    shown = repos.filter((repo) => wanted.has(key(repo.fullName)));
    const found = new Set(shown.map((repo) => key(repo.fullName)));
    missing = config.repos.filter((name) => !found.has(key(name)) && !excluded.has(key(name)));
  }
  return { shown: shown.filter((repo) => !excluded.has(key(repo.fullName))), missing };
}
function hasTodo(repo, config) {
  if (!Object.keys(repo.numbers).length) {
    return true;
  }
  return config.todo_issues !== false && (repo.numbers.issues_count ?? 0) > 0 || config.todo_pull_requests !== false && (repo.numbers.pulls_count ?? 0) > 0 || config.todo_unreleased !== false && repo.unreleased;
}
function shownNumbers(config) {
  return NUMBERS.filter(({ option, shown }) => config[option] ?? shown);
}
function formatNumber(value, language) {
  const options = value < 1e3 ? {} : { notation: "compact", maximumFractionDigits: 1 };
  try {
    return new Intl.NumberFormat(language.replace(/_/g, "-"), options).format(value);
  } catch {
    return new Intl.NumberFormat(void 0, options).format(value);
  }
}
function known(entity) {
  return entity && entity.state !== "unavailable" && entity.state !== "unknown" ? entity : void 0;
}

// src/editor.ts
var DEFAULTS = {
  ...Object.fromEntries(NUMBERS.map(({ option, shown }) => [option, shown])),
  fold_quiet: false,
  ...Object.fromEntries(TODOS.map((option) => [option, true])),
  tap: DEFAULT_TAP
};
function languageName(code, viewer) {
  try {
    const name = new Intl.DisplayNames([viewer], { type: "language" }).of(code);
    return name ? name.charAt(0).toUpperCase() + name.slice(1) : code;
  } catch {
    return code;
  }
}
function schema(hass, config, language, text) {
  const repos = { select: { multiple: true, custom_value: true, options: reposOf(hass).map((repo) => repo.fullName) } };
  const booleans = (names) => names.map((name) => ({ name, selector: { boolean: {} } }));
  return [
    { name: "title", selector: { text: {} } },
    { name: "repos", selector: repos },
    { name: "exclude", selector: repos },
    {
      type: "expandable",
      name: "numbers",
      flatten: true,
      schema: [{ type: "grid", name: "", schema: booleans(NUMBERS.map(({ option }) => option)) }]
    },
    { type: "expandable", name: "folding", flatten: true, schema: booleans(["fold_quiet", ...TODOS]) },
    {
      name: "tap",
      selector: {
        select: {
          mode: "dropdown",
          options: ["github", "more_info"].map((value) => ({ value, label: text(`editor.tap_${value}`) }))
        }
      }
    },
    {
      name: "language",
      selector: {
        select: {
          mode: "dropdown",
          options: LANGUAGE_CODES.map((code) => ({ value: code, label: languageName(code, language) }))
        }
      }
    },
    ...heightSchema(config, text)
  ];
}
var GithubReposCardEditor = class extends i4 {
  constructor() {
    super(...arguments);
    this.config = { type: "custom:github-repos-card" };
  }
  setConfig(config) {
    this.config = { ...config };
  }
  render() {
    if (!this.hass) {
      return A;
    }
    return b2`
            <ha-form
                .hass=${this.hass}
                .data=${{ ...DEFAULTS, ...heightData(this.config) }}
                .schema=${schema(this.hass, this.config, this.language(), (key) => this.text(key))}
                .computeLabel=${(entry) => this.text(`editor.${entry.name}`)}
                .computeHelper=${(entry) => this.helper(entry.name)}
                @value-changed=${this.valueChanged}
            ></ha-form>
        `;
  }
  valueChanged(event) {
    const config = tidyHeight(event.detail.value);
    for (const key of Object.keys(config)) {
      const value = config[key];
      if (value === DEFAULTS[key] || value === void 0 || value === null || value === "" || Array.isArray(value) && !value.length) {
        delete config[key];
      }
    }
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  text(key) {
    return translate(this.language(), key);
  }
  helper(name) {
    const key = `editor.${name}_helper`;
    const helper = translate(this.language(), key);
    return helper === key ? void 0 : helper;
  }
  language() {
    return this.hass?.locale?.language ?? this.hass?.language ?? browserLanguage();
  }
};
__decorateClass([
  n4({ attribute: false })
], GithubReposCardEditor.prototype, "hass", 2);
__decorateClass([
  r5()
], GithubReposCardEditor.prototype, "config", 2);
GithubReposCardEditor = __decorateClass([
  t3("github-repos-card-editor")
], GithubReposCardEditor);

// src/fade.ts
var fadeStyles = i`
    .fades {
        --fade-length: min(24px, 25%);
        scroll-padding-block: calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px)) var(--fade-length, 24px);
    }

    .fade-top {
        mask-image: linear-gradient(
            to bottom,
            #000 var(--fade-top-offset, 0px),
            transparent var(--fade-top-offset, 0px),
            #000 calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px))
        );
    }

    .fade-bottom {
        mask-image: linear-gradient(to top, transparent, #000 var(--fade-length, 24px));
    }

    .fade-top.fade-bottom {
        mask-image: linear-gradient(
            to bottom,
            #000 var(--fade-top-offset, 0px),
            transparent var(--fade-top-offset, 0px),
            #000 calc(var(--fade-top-offset, 0px) + var(--fade-length, 24px)),
            #000 calc(100% - var(--fade-length, 24px)),
            transparent
        );
    }
`;
function markFade(part) {
  const hidden = part.scrollHeight - part.clientHeight;
  part.classList.toggle("fade-top", hidden > 1 && part.scrollTop > 1);
  part.classList.toggle("fade-bottom", hidden > 1 && hidden - part.scrollTop > 1);
}
var onScroll = (event) => markFade(event.currentTarget);
var ScrollFade = class {
  constructor(host, parts) {
    this.host = host;
    this.parts = parts;
    /** Each followed part with the children whose size it watches. */
    this.followed = /* @__PURE__ */ new Map();
    this.resized = typeof ResizeObserver === "undefined" ? void 0 : new ResizeObserver((entries) => {
      for (const { target } of entries) {
        const part = this.followed.has(target) ? target : target.parentElement;
        if (part && this.followed.has(part)) {
          markFade(part);
        }
      }
    });
    host.addController(this);
  }
  hostConnected() {
    if (this.host.hasUpdated) {
      this.follow();
    }
  }
  hostUpdated() {
    if (this.host.isConnected) {
      this.follow();
    }
  }
  hostDisconnected() {
    for (const part of [...this.followed.keys()]) {
      this.forget(part);
    }
  }
  follow() {
    const now = new Set(this.parts());
    for (const part of [...this.followed.keys()]) {
      if (!now.has(part)) {
        this.forget(part);
      }
    }
    for (const part of now) {
      if (!this.followed.has(part)) {
        part.addEventListener("scroll", onScroll, { passive: true });
        this.resized?.observe(part);
      }
      part.classList.add("fades");
      const before = this.followed.get(part) ?? [];
      const children = [...part.children];
      before.filter((child) => !children.includes(child)).forEach((child) => this.resized?.unobserve(child));
      children.filter((child) => !before.includes(child)).forEach((child) => this.resized?.observe(child));
      this.followed.set(part, children);
      markFade(part);
    }
  }
  forget(part) {
    this.followed.get(part)?.forEach((child) => this.resized?.unobserve(child));
    this.followed.delete(part);
    part.removeEventListener("scroll", onScroll);
    this.resized?.unobserve(part);
    part.classList.remove("fades", "fade-top", "fade-bottom");
  }
};

// src/github-repos-card.ts
console.info(
  `%c  GITHUB-REPOS-CARD 
%c  ${CARD_VERSION}    `,
  "color: orange; font-weight: bold; background: black",
  "color: white; font-weight: bold; background: dimgray"
);
var registry = window;
registry.customCards = registry.customCards ?? [];
registry.customCards.push({
  type: "github-repos-card",
  name: translate(browserLanguage(), "common.name"),
  description: translate(browserLanguage(), "common.description"),
  documentationURL: "https://github.com/jesmak/github-repos-card",
  preview: true
});
var GithubReposCard = class extends i4 {
  constructor() {
    super();
    this.open = false;
    this.sensors = [];
    new ScrollFade(this, () => this.heightStyle() ? this.renderRoot.querySelectorAll(".repos") : []);
  }
  static getConfigElement() {
    return document.createElement("github-repos-card-editor");
  }
  /** Every followed repo, so the card shows something the moment it is added from the picker. */
  static getStubConfig() {
    return {};
  }
  setConfig(config) {
    const lists = [config?.repos, config?.exclude];
    if (!config || lists.some((list) => list !== void 0 && (!Array.isArray(list) || list.some((name) => typeof name !== "string")))) {
      throw new Error(translate(browserLanguage(), "common.invalid_configuration"));
    }
    if (!validHeight(config)) {
      throw new Error(translate(browserLanguage(), "common.invalid_height"));
    }
    this.config = { ...config };
  }
  getCardSize() {
    return heightCardSize(
      this.config ?? {},
      1 + (this.hass && this.config ? selectRepos(reposOf(this.hass), this.config).shown.length : 3),
      this.minimumHeight()
    );
  }
  /** In a sections view the card takes a whole section by default and is never narrower than half of one. */
  getGridOptions() {
    return { columns: 12, min_columns: 6, rows: "auto", min_rows: gridMinRows(this.minimumHeight()) };
  }
  // In pixels, the lowest a card held to a height gets: its padding, the title when it has one, and one repo with its
  // line of numbers when any are shown, as measured on a full section's width.
  minimumHeight() {
    const title = this.config?.title ? 35 : 0;
    const numbers = this.config && shownNumbers(this.config).length ? 23 : 0;
    return 18 + title + 36 + numbers;
  }
  heightStyle() {
    return heightStyle(this.config ?? {}, this.layout, this.minimumHeight());
  }
  shouldUpdate(changed) {
    const previous = changed.get("hass");
    if (!changed.has("hass") || changed.size > 1 || !previous || !this.hass) {
      return true;
    }
    if (previous.entities !== this.hass.entities || previous.devices !== this.hass.devices || previous.locale !== this.hass.locale) {
      return true;
    }
    if (this.sensorsOf !== this.hass.entities) {
      this.sensorsOf = this.hass.entities;
      this.sensors = [...githubSensors(this.hass).values()].flatMap((keys) => [...keys.values()]);
    }
    return this.sensors.some((entity) => previous.states[entity] !== this.hass?.states[entity]);
  }
  render() {
    if (!this.hass || !this.config) {
      return A;
    }
    const followed = reposOf(this.hass);
    const { shown, missing } = selectRepos(followed, this.config);
    const config = this.config;
    const empty = shown.length || missing.length ? void 0 : followed.length ? "common.none_shown" : "common.no_repos";
    const busy = config.fold_quiet ? shown.filter((repo) => hasTodo(repo, config)) : shown;
    const quiet = config.fold_quiet ? shown.filter((repo) => !hasTodo(repo, config)) : [];
    const columns = this.columns(shown);
    return b2`
            <ha-card style=${this.heightStyle()}>
                ${config.title ? b2`<h1 class="card-title">${config.title}</h1>` : A}
                ${missing.map((name) => b2`<div class="message">${this.text("common.not_followed", { repo: name })}</div>`)}
                ${empty ? b2`<div class="message">${this.text(empty)}</div>` : A}
                <div class="repos">
                    ${busy.map((repo) => this.repo(repo, columns))} ${quiet.length ? this.fold(quiet.length) : A}
                    ${this.open ? quiet.map((repo) => this.repo(repo, columns)) : A}
                </div>
            </ha-card>
        `;
  }
  /** One repo: its owner and name with the version on the right, and its numbers under them. */
  repo(repo, columns) {
    const body = b2`
            <div class="top">
                <span class="full-name" title=${repo.fullName}>
                    <span class="owner">${repo.owner}/</span><span class="name">${repo.name}</span>
                </span>
                ${repo.version ? b2`<span
                              class="version ${repo.unreleased ? "unreleased" : ""}"
                              title=${this.text(repo.unreleased ? "common.unreleased" : "common.latest_release")}
                              >${repo.version}</span
                          >` : A}
            </div>
            ${columns.length ? b2`<div class="numbers">${columns.map((column) => this.number(repo, column))}</div>` : A}
        `;
    if ((this.config?.tap ?? DEFAULT_TAP) === "more_info") {
      return b2`<button class="repo" @click=${() => this.moreInfo(repo.entity)}>${body}</button>`;
    }
    return b2`<a class="repo" href=${repo.url} target="_blank" rel="noopener noreferrer">${body}</a>`;
  }
  /** A number in its column. Issues and pull requests are coloured when there are some; a missing number is a dash. */
  number(repo, column) {
    const value = repo.numbers[column.key];
    const kind = column.key === "issues_count" ? "issues" : column.key === "pulls_count" ? "pulls" : "";
    return b2`<span
            class="number ${value ? kind : "zero"}"
            style="--chars:${column.chars}"
            title=${this.text(`numbers.${column.key}`)}
        >
            <ha-icon icon=${column.icon}></ha-icon>${value === void 0 ? "\u2013" : formatNumber(value, this.language())}
        </span>`;
  }
  fold(count) {
    return b2`<button class="fold ${this.open ? "open" : ""}" aria-expanded=${this.open} @click=${() => this.open = !this.open}>
            <ha-icon icon="mdi:check"></ha-icon>
            <span>${this.text(count === 1 ? "common.quiet_one" : "common.quiet_other", { count: String(count) })}</span>
            <ha-icon class="chevron" icon="mdi:chevron-down"></ha-icon>
        </button>`;
  }
  /**
   * The shown numbers' columns. Each is as wide as its widest number needs, so the numbers line up down the list,
   * and never narrower than the card's own minimum for a column.
   */
  columns(repos) {
    const language = this.language();
    return shownNumbers(this.config ?? { type: "" }).map(({ key, icon }) => {
      return { key, icon, chars: Math.max(1, ...repos.map((repo) => formatNumber(repo.numbers[key] ?? 0, language).length)) };
    });
  }
  moreInfo(entityId) {
    this.dispatchEvent(new CustomEvent("hass-more-info", { detail: { entityId }, bubbles: true, composed: true }));
  }
  /** A text in the card's language, with `{name}` in it replaced, so a translation can put the value where it reads right. */
  text(key, values = {}) {
    return translate(this.language(), key).replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
  }
  language() {
    return this.config?.language || this.hass?.locale?.language || this.hass?.language || browserLanguage();
  }
  static get styles() {
    return [
      i`
                /* A column, so that with a height of its own the title and the messages stay put and the list scrolls. */
                ha-card {
                    box-sizing: border-box;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    container-type: inline-size;
                    padding: 12px 0 6px;
                    font-variant-numeric: tabular-nums;
                    --column-width: 52px;
                    --github-repos-issues: var(--github-repos-issues-color, #2da44e);
                    --github-repos-pulls: var(--github-repos-pulls-color, #8957e5);
                    --github-repos-unreleased: var(--github-repos-unreleased-color, var(--warning-color, #ff9800));
                }

                .card-title,
                .message {
                    flex: none;
                }

                .repos {
                    flex: 1 1 auto;
                    min-height: 0;
                    overflow-y: auto;
                    overscroll-behavior: contain;
                    scrollbar-width: thin;
                }

                .card-title {
                    margin: 0 16px 6px;
                    font-size: var(--ha-card-header-font-size, 24px);
                    font-weight: var(--ha-font-weight-normal, 400);
                    line-height: 1.2;
                }

                .message {
                    padding: 6px 16px;
                    color: var(--secondary-text-color);
                }

                .repo,
                .fold {
                    display: block;
                    box-sizing: border-box;
                    width: 100%;
                    padding: 7px 16px 8px;
                    border: none;
                    border-top: 1px solid var(--divider-color);
                    background: none;
                    color: inherit;
                    font: inherit;
                    text-align: left;
                    text-decoration: none;
                    cursor: pointer;
                }

                /* Inside the row, as the list scrolls and so clips whatever is drawn outside it. */
                .repo:focus-visible,
                .fold:focus-visible {
                    outline: 2px solid var(--primary-color);
                    outline-offset: -2px;
                }

                .repos > :first-child {
                    border-top: none;
                }

                .repo:hover,
                .fold:hover {
                    background: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
                }

                .top {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                /* The owner gives way first, cut short, and the name last, wrapping rather than cut: a name cut short is another repo. */
                .full-name {
                    flex: 1;
                    min-width: 0;
                    display: flex;
                    font-size: 14px;
                }

                .owner {
                    flex: 0 1 auto;
                    min-width: 1.2em;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: var(--secondary-text-color);
                    opacity: 0.8;
                }

                /* The name never shrinks, so only the owner does, and it wraps only once the owner is down to its minimum. */
                .name {
                    flex: none;
                    max-width: calc(100% - 1.2em);
                    font-weight: var(--ha-font-weight-medium, 500);
                    overflow-wrap: anywhere;
                }

                .version {
                    flex: none;
                    min-width: 44px;
                    box-sizing: border-box;
                    padding: 1px 7px;
                    border-radius: 10px;
                    background: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
                    font-size: 12px;
                    text-align: center;
                    white-space: nowrap;
                }

                .version.unreleased {
                    background: color-mix(in srgb, var(--github-repos-unreleased) 22%, transparent);
                    color: color-mix(in srgb, var(--github-repos-unreleased) 75%, var(--primary-text-color));
                }

                /* Fixed widths, the same in every entry, so the numbers line up down the list and wrap alike on a narrow card. */
                .numbers {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 2px 4px;
                    margin-top: 3px;
                }

                /* As wide as the column's widest number and its icon need, never narrower than a column's minimum. */
                .number {
                    box-sizing: border-box;
                    width: max(var(--column-width), calc(var(--chars) * 1ch + 20px));
                    display: inline-flex;
                    align-items: center;
                    gap: 3px;
                    font-size: 13px;
                    white-space: nowrap;
                    color: var(--secondary-text-color);
                }

                .number ha-icon {
                    --mdc-icon-size: 16px;
                    width: 16px;
                    height: 16px;
                    display: inline-flex;
                    flex: none;
                }

                .number.zero {
                    opacity: 0.6;
                }

                .number.issues {
                    color: var(--github-repos-issues);
                }

                .number.pulls {
                    color: var(--github-repos-pulls);
                }

                .fold {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 9px 16px;
                    font-size: 13px;
                    color: var(--secondary-text-color);
                }

                .fold ha-icon {
                    --mdc-icon-size: 16px;
                    width: 16px;
                    height: 16px;
                    display: inline-flex;
                    flex: none;
                }

                .fold .chevron {
                    margin-left: auto;
                    transition: transform 0.2s;
                }

                .fold.open .chevron {
                    transform: rotate(180deg);
                }

                /* The card is the container, so the narrow layout styles what is inside it, never ha-card itself. */
                @container (max-width: 299px) {
                    .numbers {
                        --column-width: 34px;
                    }

                    .repo,
                    .fold,
                    .message {
                        padding-left: 12px;
                        padding-right: 12px;
                    }

                    .card-title {
                        margin-left: 12px;
                        margin-right: 12px;
                    }
                }
            `,
      fadeStyles
    ];
  }
};
__decorateClass([
  n4({ attribute: false })
], GithubReposCard.prototype, "hass", 2);
__decorateClass([
  n4({ attribute: false })
], GithubReposCard.prototype, "layout", 2);
__decorateClass([
  r5()
], GithubReposCard.prototype, "config", 2);
__decorateClass([
  r5()
], GithubReposCard.prototype, "open", 2);
GithubReposCard = __decorateClass([
  t3("github-repos-card")
], GithubReposCard);
export {
  GithubReposCard
};
