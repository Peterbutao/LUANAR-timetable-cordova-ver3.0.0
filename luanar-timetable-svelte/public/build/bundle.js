
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function parse(str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules\svelte-spa-router\Router.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1$1, Object: Object_1, console: console_1$3 } = globals;

    // (251:0) {:else}
    function create_else_block(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(251:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (244:0) {#if componentParams}
    function create_if_block$3(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(244:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$d(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$3, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1$1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);
    const params = writable(undefined);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		const newState = { ...history.state };
    		delete newState["__svelte_spa_router_scrollX"];
    		delete newState["__svelte_spa_router_scrollY"];
    		window.history.replaceState(newState, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, opts) {
    	opts = linkOpts(opts);

    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, opts);

    	return {
    		update(updated) {
    			updated = linkOpts(updated);
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, opts) {
    	let href = opts.href || node.getAttribute("href");

    	// Destination must start with '/' or '#/'
    	if (href && href.charAt(0) == "/") {
    		// Add # to the href attribute
    		href = "#" + href;
    	} else if (!href || href.length < 2 || href.slice(0, 2) != "#/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	node.setAttribute("href", href);

    	node.addEventListener("click", event => {
    		// Prevent default anchor onclick behaviour
    		event.preventDefault();

    		if (!opts.disabled) {
    			scrollstateHistoryHandler(event.currentTarget.getAttribute("href"));
    		}
    	});
    }

    // Internal function that ensures the argument of the link action is always an object
    function linkOpts(val) {
    	if (val && typeof val == "string") {
    		return { href: val };
    	} else {
    		return val || {};
    	}
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {string} href - Destination
     */
    function scrollstateHistoryHandler(href) {
    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			...history.state,
    			__svelte_spa_router_scrollX: window.scrollX,
    			__svelte_spa_router_scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = parse(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {boolean} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	let popStateChanged = null;

    	if (restoreScrollState) {
    		popStateChanged = event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.__svelte_spa_router_scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		};

    		// This is removed in the destroy() invocation below
    		window.addEventListener("popstate", popStateChanged);

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.__svelte_spa_router_scrollX, previousScrollState.__svelte_spa_router_scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	const unsubscribeLoc = loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData,
    				params: match && typeof match == "object" && Object.keys(match).length
    				? match
    				: null
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    						component,
    						name: component.name,
    						params: componentParams
    					}));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, {
    				component,
    				name: component.name,
    				params: componentParams
    			})).then(() => {
    				params.set(componentParams);
    			});

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    		params.set(undefined);
    	});

    	onDestroy(() => {
    		unsubscribeLoc();
    		popStateChanged && window.removeEventListener("popstate", popStateChanged);
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$3.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		writable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		params,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		linkOpts,
    		scrollstateHistoryHandler,
    		onDestroy,
    		createEventDispatcher,
    		afterUpdate,
    		parse,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		popStateChanged,
    		lastLoc,
    		componentObj,
    		unsubscribeLoc
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("popStateChanged" in $$props) popStateChanged = $$props.popStateChanged;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$d.name
    		});
    	}

    	get routes() {
    		throw new Error_1$1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1$1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1$1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1$1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1$1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1$1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    class AdsObj {
        constructor(ti, mo, ca, te, co, ad, im) {
            this.catergory = ca;
            this.motto = mo;
            this.title = ti;
            this.text = `<ul>${te}</ul>`;
            this.contact = co;
            this.address = ad;
            this.image = im;
        }
    }

    class imgObj {
        constructor(im) {
            this.image = `assets/${im}.png`;
        }
    }

    const ads = [
        
        new AdsObj("i saint poems", "poems by i saint the poet", "service", "poem writting", "08801674455", "GWONDWE R1", [new imgObj('is1'), new imgObj('is2')]),       
        new AdsObj("cross avon", "AVON MW", "cosmetics", "<li>watches / male & female clothes</li><li>perfume / body sprays / avon lotion</li>", "0881430022", "BLANTYRE, CHICHIRI 3, GOLITI H83", [new imgObj('cr1'), new imgObj('cr2')]),
        new AdsObj("butao ux/ui dev", "custome made, technology to your malawian liking", "service", "<li>mobile / web application design</li><li>website development</li>", "08801674455", "BUNDA CAMPUS, HAVARD R32", [new imgObj('bt2'), new imgObj('bt1')]),
    ];

    var ads_1 = ads;

    const message = [
        {
            messages : "uninstall previous versions to install newwer versions"
            
        },
        {
            messages : `<strong> the timetable app</strong> may not work on older modile devices`
            
        },
        {       
             messages:   'the app is only valid for one semester, for subsequent semesters , request updates from the <a href="tel://0880164455">development team </a>'
        },
        {       
             messages:   'whatsapp the development <a href="tel://0880164455">@ 0880164455 </a>, to request personal features and report app problems '
        },
        {       
             messages:   'the app is open source, </ DEV > contact the <a href="tel://0880164455">development team </a> for contribitions  '
        },
        {       
            messages:  `<strong>the timetable app</strong> uses local storage to store your reminders`
        },
        {       
             messages:   '<p style="color: red; text-align: center;font-weight:600;">⚠ MAKE SURE YOUR JAVASCRIPT <strong> IS NOT </strong> DISABLED, IN YOUR BROWSER SETTINGS ! </p>'
        },
        {       
             messages:  `<p class="get" style="text-align:center">by, " getting started " your are agreeing to BUTAO UX/UI DEV terms and policies stated in the licence</p> `
        },
        {       
             messages:  `© COPYRIGHT | 2021 BUTAO UX / UI DEV `
        }
    ];

    var message_1 = message;

    class CourseObj$1 {
        constructor(crs, cd, typ, gpa, wd) {
            this.date = CourseObj$1.date();
            this.course = crs;
            this.type = typ;
            this.gpa = gpa;
            this.code = cd;
            this.weekdays = wd;
        }
        static date() {
            return new Date().getDate()
        }
    }

    class readObj {
        constructor(wd, dy) {

            this.weekday = wd,
            this.day = dy;
            this.initialTime = `20:00`,
            this.finalTime = `23:00`,
            this.location = `NORWAY / LIBRAY / CLASS`,
            this.type = `READ`,
            this.hours = 3;
        }
    }

    const reads = [
        //monday
        new CourseObj$1("plant physiology", "AGN321", "non-core", 0.0,
            [
                new readObj("Monday", 1)

            ]
        ),
        //tuesday
        new CourseObj$1("farm structures and facilities", "AGE323", "non-core", 0.0,
            [
                new readObj("Tuesday", 2)


            ]
        ),
        //wednesday
        new CourseObj$1("seed health", "SSY422", "core", 0.0,
            [
                new readObj("Wednesday", 3)

            ]
        ),

        //thursday

        new CourseObj$1("seed enterprise development, financing and planning", "SSY322", "core", 0.0,
            [
                new readObj("Thursday", 4)

            ]
        ),

        //friday
        new CourseObj$1("management of extension and rural development programmes", "EXT324", "non-core", 0.0,
            [
                new readObj("Friday", 5)

            ]
        )
    ];

    var reads_1 = reads;

    class UuidObj {

        static idOne() {

            const str = 'abcdefghijklm';
            const num = Math.floor(Math.random() * 13);
            const strNum = num - 1;

            const subStr = str.substring(strNum, num);
            const idNum = Math.floor(Math.random() * 9);

            return `${subStr}${idNum}`

        };
        static idTwo() {

            const str = 'nopqrstuvwxyz';
            const num = Math.floor(Math.random() * 13);
            const strNum = num - 1;

            const subStr = str.substring(strNum, num);
            const idNum = Math.floor(Math.random() * 9);

            return `${subStr}${idNum}`

        };
        static uuid() {
            const idOne = this.idOne();
            const idTwo = this.idTwo();

            const id = `${idOne}${idTwo}`;



            if (id.length == 3) {

                const num = `${Math.floor(Math.random() * 9)}`;

                const idMod = id + num;

                return idMod;

            } else if (id.length == 2) {

                const numM1 = `${Math.floor(Math.random() * 9)}`;
                const numM2 = `${Math.floor(Math.random() * 9)}`;

                const idMod2 = id + numM1 + numM2;

                return idMod2;


            } else {
                return id;
            }    };
    }
    var uuid  = UuidObj;

    //parameters
    let programmeName = "BAAE";
    let yearNumber = 3;
    let semesterNumber = 2;
    let versionNumber = "2.0.0";
    let siteName = "https://butaopeter.netlify.app";
    let mailName = "peterethanbutao:gmail.com";



    class CommonObj {
        constructor(prog, sy, sem, ver, aut, air, tnm, site, mail) {
            this.programme = prog;
            this.studyYear = sy;
            this.semester = sem;
            this.version = ver;
            this.authour = aut;
            this.phone = {
                airtel: air,
                tnm: tnm
            },
                this.website = site;
            this.gmail = mail;
        }
    }

    const common = [new CommonObj(programmeName, yearNumber, semesterNumber, versionNumber, "peter butao", "0991894703", "0880164455", siteName, mailName)];


    class WeekdayObj {
        constructor(wd, dy, intm, fntm, loc, typ) {
            this.weekday = wd;
                this.day = dy;
            this.initialTime = `${intm}:00`;
                this.finalTime = `${fntm}:00`;
                this.location = loc;
                this.type = typ;
                this.hours = fntm - intm;
        }
    }



    class CourseObj {
        constructor(crs, cd, typ, gpa, wd) {
            this.id = uuid.uuid();
            this.date = CourseObj.date();
            this.course = crs;
            this.type = typ;
            this.gpa = gpa;
            this.code = cd;
            this.weekdays = wd;
        }
        static date() {
            return new Date().getDate()
        }
        static idOne() {

            const str = 'abcdefghijklm';
            const num = Math.floor(Math.random() * 13);
            const strNum = num - 1;

            const subStr = str.substring(strNum, num);
            const idNum = Math.floor(Math.random() * 9);

            return `${subStr}${idNum}`

        };

    }






    const courses = [
        //monday
        new CourseObj("MACROECONOMIC THEORY","AAE321","CORE",2.0,
            [
                new WeekdayObj("Friday",5, "10", "12", "A36 HALL 1", "lecture"),
                //new WeekdayObj("Thursday",4, "09", "11", "MPH", "lecture")
                
            ] 
        ),
        new CourseObj("ECONOMETRICS II","AAE322","CORE",3.5,
            [
                new WeekdayObj("Monday",1, "13", "15", "A36 HALL 4", "lecture"),
                new WeekdayObj("Tuesday",2, "13", "16", "A36 HALL 3", "tutorial")
                
            ] 
        ),

        //wednesday
        new CourseObj("FARM BUSINESS MANAGEMENT II","AAE323","CORE",3.0,
            [
                new WeekdayObj("Wednesday",3, "10", "12", "A36 HALL 4", "lecture"),
                new WeekdayObj("Thursday",4, "07", "09", "A36 HALL 2", "tutorial")
                
            ] 
        ),


        //friday
        new CourseObj("MARKET AND PRICE ANALYSIS","AAE324","CORE",3.5,
            [
                new WeekdayObj("Thursday", 4, "14", "17", "MCH 3", "lecture"),
                new WeekdayObj("Friday", 5, "08", "09", "MCH 3", "tutorial")
                
            ] 
        ),

        
        new CourseObj("AGRICULTURAL TRADE THEORY AND POLICY","AAE325","CORE",2.5,
            [
                new WeekdayObj("Wednesday",3, "08", "09", "A36 HALL 2", "lecture"),
                new WeekdayObj("Wednesday",3, "09", "10", "A36 HALL 4", "lecture"),
                new WeekdayObj("Thursday",4, "09", "10", "A36 HALL 2", "tutorial"),
                
                
            ] 
        ),
        new CourseObj("INTRODUCTION TO STATISTICAL PACKAGES","AAE326","CORE",2.0,
            [
                new WeekdayObj("Monday",1, "08", "11", "A36 HALL 1", "lecture"),
                //new WeekdayObj("Tuesday",2, "17", "19", "HALL", "tutorial")
                
                
            ] 
        ),
        new CourseObj("THEORIES OF ECONOMIC GROWH AND DEVELOPMENT I","DEC321","NON-CORE",2.5,
            [
                new WeekdayObj("Friday",5, "13", "17", "A36 HALL 1", "lecture"),
                //new WeekdayObj("Tuesday",2, "17", "19", "HALL", "tutorial")
                
                
            ] 
        ),

    ];




    const data = writable({ courses, common, reads: reads_1, message: message_1, ads: ads_1 });

    /* src\routes\table.svelte generated by Svelte v3.38.2 */
    const file$b = "src\\routes\\table.svelte";

    function create_fragment$c(ctx) {
    	let article;
    	let div;
    	let table;
    	let thead;
    	let tr0;
    	let th0;
    	let t0;
    	let th1;
    	let t2;
    	let th2;
    	let t4;
    	let th3;
    	let t6;
    	let th4;
    	let t8;
    	let th5;
    	let t10;
    	let tbody;
    	let tr1;
    	let td0;
    	let t12;
    	let td1;
    	let t13;
    	let td2;
    	let t14;
    	let td3;
    	let t15;
    	let td4;
    	let t16;
    	let td5;
    	let t17;
    	let tr2;
    	let td6;
    	let t19;
    	let td7;
    	let t21;
    	let td8;
    	let t23;
    	let td9;
    	let t25;
    	let td10;
    	let t27;
    	let td11;
    	let t29;
    	let tr3;
    	let td12;
    	let t31;
    	let td13;
    	let t33;
    	let td14;
    	let t35;
    	let td15;
    	let t37;
    	let td16;
    	let t39;
    	let td17;
    	let t41;
    	let tr4;
    	let td18;
    	let t43;
    	let td19;
    	let t45;
    	let td20;
    	let t47;
    	let td21;
    	let t49;
    	let td22;
    	let t51;
    	let td23;
    	let t53;
    	let tr5;
    	let td24;
    	let t55;
    	let td25;
    	let t57;
    	let td26;
    	let t59;
    	let td27;
    	let t61;
    	let td28;
    	let t63;
    	let td29;
    	let t65;
    	let tr6;
    	let td30;
    	let t67;
    	let td31;
    	let t69;
    	let td32;
    	let t71;
    	let td33;
    	let t73;
    	let td34;
    	let t75;
    	let td35;
    	let t77;
    	let tr7;
    	let td36;
    	let t79;
    	let td37;
    	let t81;
    	let td38;
    	let t83;
    	let td39;
    	let t85;
    	let td40;
    	let t87;
    	let td41;
    	let t89;
    	let tr8;
    	let td42;
    	let t91;
    	let td43;
    	let t92;
    	let td44;
    	let t93;
    	let td45;
    	let t94;
    	let td46;
    	let t95;
    	let td47;
    	let t96;
    	let tr9;
    	let td48;
    	let t98;
    	let td49;
    	let t99;
    	let td50;
    	let t100;
    	let td51;
    	let t101;
    	let td52;
    	let t102;
    	let td53;
    	let t103;
    	let tr10;
    	let td54;
    	let t105;
    	let td55;
    	let t107;
    	let td56;
    	let t109;
    	let td57;
    	let t111;
    	let td58;
    	let t113;
    	let td59;
    	let t115;
    	let tr11;
    	let td60;
    	let t117;
    	let td61;
    	let t119;
    	let td62;
    	let t121;
    	let td63;
    	let t123;
    	let td64;
    	let t125;
    	let td65;
    	let t127;
    	let tr12;
    	let td66;
    	let t129;
    	let td67;
    	let t131;
    	let td68;
    	let t133;
    	let td69;
    	let t135;
    	let td70;
    	let t137;
    	let td71;
    	let t139;
    	let tr13;
    	let td72;
    	let t141;
    	let td73;
    	let t143;
    	let td74;
    	let t145;
    	let td75;
    	let t147;
    	let td76;
    	let t149;
    	let td77;
    	let t151;
    	let tr14;
    	let td78;
    	let t153;
    	let td79;
    	let t155;
    	let td80;
    	let t157;
    	let td81;
    	let t159;
    	let td82;
    	let t161;
    	let td83;
    	let t163;
    	let tr15;
    	let td84;
    	let t165;
    	let td85;
    	let t167;
    	let td86;
    	let t169;
    	let td87;
    	let t171;
    	let td88;
    	let t173;
    	let td89;
    	let t175;
    	let tr16;
    	let td90;
    	let t177;
    	let td91;
    	let t178;
    	let td92;
    	let t179;
    	let td93;
    	let t180;
    	let td94;
    	let t181;
    	let td95;
    	let t182;
    	let tr17;
    	let td96;
    	let t184;
    	let td97;
    	let t185;
    	let td98;
    	let t186;
    	let td99;
    	let t187;
    	let td100;
    	let t188;
    	let td101;

    	const block = {
    		c: function create() {
    			article = element("article");
    			div = element("div");
    			table = element("table");
    			thead = element("thead");
    			tr0 = element("tr");
    			th0 = element("th");
    			t0 = space();
    			th1 = element("th");
    			th1.textContent = "MON";
    			t2 = space();
    			th2 = element("th");
    			th2.textContent = "TUE";
    			t4 = space();
    			th3 = element("th");
    			th3.textContent = "WED";
    			t6 = space();
    			th4 = element("th");
    			th4.textContent = "THU";
    			t8 = space();
    			th5 = element("th");
    			th5.textContent = "FRI";
    			t10 = space();
    			tbody = element("tbody");
    			tr1 = element("tr");
    			td0 = element("td");
    			td0.textContent = "6 : 00";
    			t12 = space();
    			td1 = element("td");
    			t13 = space();
    			td2 = element("td");
    			t14 = space();
    			td3 = element("td");
    			t15 = space();
    			td4 = element("td");
    			t16 = space();
    			td5 = element("td");
    			t17 = space();
    			tr2 = element("tr");
    			td6 = element("td");
    			td6.textContent = "7 : 00";
    			t19 = space();
    			td7 = element("td");
    			td7.textContent = `${/*datarow*/ ctx[0]("07:00", 1)}`;
    			t21 = space();
    			td8 = element("td");
    			td8.textContent = `${/*datarow*/ ctx[0]("07:00", 2)}`;
    			t23 = space();
    			td9 = element("td");
    			td9.textContent = `${/*datarow*/ ctx[0]("07:00", 3)}`;
    			t25 = space();
    			td10 = element("td");
    			td10.textContent = `${/*datarow*/ ctx[0]("07:00", 4)}`;
    			t27 = space();
    			td11 = element("td");
    			td11.textContent = `${/*datarow*/ ctx[0]("07:00", 5)}`;
    			t29 = space();
    			tr3 = element("tr");
    			td12 = element("td");
    			td12.textContent = "8 : 00";
    			t31 = space();
    			td13 = element("td");
    			td13.textContent = `${/*datarow*/ ctx[0]("08:00", 1)}`;
    			t33 = space();
    			td14 = element("td");
    			td14.textContent = `${/*datarow*/ ctx[0]("08:00", 2)}`;
    			t35 = space();
    			td15 = element("td");
    			td15.textContent = `${/*datarow*/ ctx[0]("08:00", 3)}`;
    			t37 = space();
    			td16 = element("td");
    			td16.textContent = `${/*datarow*/ ctx[0]("08:00", 4)}`;
    			t39 = space();
    			td17 = element("td");
    			td17.textContent = `${/*datarow*/ ctx[0]("08:00", 5)}`;
    			t41 = space();
    			tr4 = element("tr");
    			td18 = element("td");
    			td18.textContent = "9 : 00";
    			t43 = space();
    			td19 = element("td");
    			td19.textContent = `${/*datarow*/ ctx[0]("09:00", 1)}`;
    			t45 = space();
    			td20 = element("td");
    			td20.textContent = `${/*datarow*/ ctx[0]("09:00", 2)}`;
    			t47 = space();
    			td21 = element("td");
    			td21.textContent = `${/*datarow*/ ctx[0]("09:00", 3)}`;
    			t49 = space();
    			td22 = element("td");
    			td22.textContent = `${/*datarow*/ ctx[0]("09:00", 4)}`;
    			t51 = space();
    			td23 = element("td");
    			td23.textContent = `${/*datarow*/ ctx[0]("09:00", 5)}`;
    			t53 = space();
    			tr5 = element("tr");
    			td24 = element("td");
    			td24.textContent = "10:00";
    			t55 = space();
    			td25 = element("td");
    			td25.textContent = `${/*datarow*/ ctx[0]("10:00", 1)}`;
    			t57 = space();
    			td26 = element("td");
    			td26.textContent = `${/*datarow*/ ctx[0]("10:00", 2)}`;
    			t59 = space();
    			td27 = element("td");
    			td27.textContent = `${/*datarow*/ ctx[0]("10:00", 3)}`;
    			t61 = space();
    			td28 = element("td");
    			td28.textContent = `${/*datarow*/ ctx[0]("10:00", 4)}`;
    			t63 = space();
    			td29 = element("td");
    			td29.textContent = `${/*datarow*/ ctx[0]("10:00", 5)}`;
    			t65 = space();
    			tr6 = element("tr");
    			td30 = element("td");
    			td30.textContent = "11:00";
    			t67 = space();
    			td31 = element("td");
    			td31.textContent = `${/*datarow*/ ctx[0]("11:00", 1)}`;
    			t69 = space();
    			td32 = element("td");
    			td32.textContent = `${/*datarow*/ ctx[0]("11:00", 2)}`;
    			t71 = space();
    			td33 = element("td");
    			td33.textContent = `${/*datarow*/ ctx[0]("11:00", 3)}`;
    			t73 = space();
    			td34 = element("td");
    			td34.textContent = `${/*datarow*/ ctx[0]("11:00", 4)}`;
    			t75 = space();
    			td35 = element("td");
    			td35.textContent = `${/*datarow*/ ctx[0]("11:00", 5)}`;
    			t77 = space();
    			tr7 = element("tr");
    			td36 = element("td");
    			td36.textContent = "12:00";
    			t79 = space();
    			td37 = element("td");
    			td37.textContent = `${/*datarow*/ ctx[0]("12:00", 1)}`;
    			t81 = space();
    			td38 = element("td");
    			td38.textContent = `${/*datarow*/ ctx[0]("12:00", 2)}`;
    			t83 = space();
    			td39 = element("td");
    			td39.textContent = `${/*datarow*/ ctx[0]("12:00", 3)}`;
    			t85 = space();
    			td40 = element("td");
    			td40.textContent = `${/*datarow*/ ctx[0]("12:00", 4)}`;
    			t87 = space();
    			td41 = element("td");
    			td41.textContent = `${/*datarow*/ ctx[0]("12:00", 5)}`;
    			t89 = space();
    			tr8 = element("tr");
    			td42 = element("td");
    			td42.textContent = "12:50";
    			t91 = space();
    			td43 = element("td");
    			t92 = space();
    			td44 = element("td");
    			t93 = space();
    			td45 = element("td");
    			t94 = space();
    			td46 = element("td");
    			t95 = space();
    			td47 = element("td");
    			t96 = space();
    			tr9 = element("tr");
    			td48 = element("td");
    			td48.textContent = "___";
    			t98 = space();
    			td49 = element("td");
    			t99 = space();
    			td50 = element("td");
    			t100 = space();
    			td51 = element("td");
    			t101 = space();
    			td52 = element("td");
    			t102 = space();
    			td53 = element("td");
    			t103 = space();
    			tr10 = element("tr");
    			td54 = element("td");
    			td54.textContent = "1 : 00";
    			t105 = space();
    			td55 = element("td");
    			td55.textContent = `${/*datarow*/ ctx[0]("13:00", 1)}`;
    			t107 = space();
    			td56 = element("td");
    			td56.textContent = `${/*datarow*/ ctx[0]("13:00", 2)}`;
    			t109 = space();
    			td57 = element("td");
    			td57.textContent = `${/*datarow*/ ctx[0]("13:00", 3)}`;
    			t111 = space();
    			td58 = element("td");
    			td58.textContent = `${/*datarow*/ ctx[0]("13:00", 4)}`;
    			t113 = space();
    			td59 = element("td");
    			td59.textContent = `${/*datarow*/ ctx[0]("13:00", 5)}`;
    			t115 = space();
    			tr11 = element("tr");
    			td60 = element("td");
    			td60.textContent = "2 : 00";
    			t117 = space();
    			td61 = element("td");
    			td61.textContent = `${/*datarow*/ ctx[0]("14:00", 1)}`;
    			t119 = space();
    			td62 = element("td");
    			td62.textContent = `${/*datarow*/ ctx[0]("14:00", 2)}`;
    			t121 = space();
    			td63 = element("td");
    			td63.textContent = `${/*datarow*/ ctx[0]("14:00", 3)}`;
    			t123 = space();
    			td64 = element("td");
    			td64.textContent = `${/*datarow*/ ctx[0]("14:00", 4)}`;
    			t125 = space();
    			td65 = element("td");
    			td65.textContent = `${/*datarow*/ ctx[0]("14:00", 5)}`;
    			t127 = space();
    			tr12 = element("tr");
    			td66 = element("td");
    			td66.textContent = "3 : 00";
    			t129 = space();
    			td67 = element("td");
    			td67.textContent = `${/*datarow*/ ctx[0]("15:00", 1)}`;
    			t131 = space();
    			td68 = element("td");
    			td68.textContent = `${/*datarow*/ ctx[0]("15:00", 2)}`;
    			t133 = space();
    			td69 = element("td");
    			td69.textContent = `${/*datarow*/ ctx[0]("15:00", 3)}`;
    			t135 = space();
    			td70 = element("td");
    			td70.textContent = `${/*datarow*/ ctx[0]("15:00", 4)}`;
    			t137 = space();
    			td71 = element("td");
    			td71.textContent = `${/*datarow*/ ctx[0]("15:00", 5)}`;
    			t139 = space();
    			tr13 = element("tr");
    			td72 = element("td");
    			td72.textContent = "4 : 00";
    			t141 = space();
    			td73 = element("td");
    			td73.textContent = `${/*datarow*/ ctx[0]("16:00", 1)}`;
    			t143 = space();
    			td74 = element("td");
    			td74.textContent = `${/*datarow*/ ctx[0]("16:00", 2)}`;
    			t145 = space();
    			td75 = element("td");
    			td75.textContent = `${/*datarow*/ ctx[0]("16:00", 3)}`;
    			t147 = space();
    			td76 = element("td");
    			td76.textContent = `${/*datarow*/ ctx[0]("16:00", 4)}`;
    			t149 = space();
    			td77 = element("td");
    			td77.textContent = `${/*datarow*/ ctx[0]("16:00", 5)}`;
    			t151 = space();
    			tr14 = element("tr");
    			td78 = element("td");
    			td78.textContent = "5 : 00";
    			t153 = space();
    			td79 = element("td");
    			td79.textContent = `${/*datarow*/ ctx[0]("17:00", 1)}`;
    			t155 = space();
    			td80 = element("td");
    			td80.textContent = `${/*datarow*/ ctx[0]("17:00", 2)}`;
    			t157 = space();
    			td81 = element("td");
    			td81.textContent = `${/*datarow*/ ctx[0]("17:00", 3)}`;
    			t159 = space();
    			td82 = element("td");
    			td82.textContent = `${/*datarow*/ ctx[0]("17:00", 4)}`;
    			t161 = space();
    			td83 = element("td");
    			td83.textContent = `${/*datarow*/ ctx[0]("17:00", 5)}`;
    			t163 = space();
    			tr15 = element("tr");
    			td84 = element("td");
    			td84.textContent = "6 : 00";
    			t165 = space();
    			td85 = element("td");
    			td85.textContent = `${/*datarow*/ ctx[0]("18:00", 1)}`;
    			t167 = space();
    			td86 = element("td");
    			td86.textContent = `${/*datarow*/ ctx[0]("18:00", 2)}`;
    			t169 = space();
    			td87 = element("td");
    			td87.textContent = `${/*datarow*/ ctx[0]("18:00", 3)}`;
    			t171 = space();
    			td88 = element("td");
    			td88.textContent = `${/*datarow*/ ctx[0]("18:00", 4)}`;
    			t173 = space();
    			td89 = element("td");
    			td89.textContent = `${/*datarow*/ ctx[0]("18:00", 5)}`;
    			t175 = space();
    			tr16 = element("tr");
    			td90 = element("td");
    			td90.textContent = "___";
    			t177 = space();
    			td91 = element("td");
    			t178 = space();
    			td92 = element("td");
    			t179 = space();
    			td93 = element("td");
    			t180 = space();
    			td94 = element("td");
    			t181 = space();
    			td95 = element("td");
    			t182 = space();
    			tr17 = element("tr");
    			td96 = element("td");
    			td96.textContent = "8 : 00";
    			t184 = space();
    			td97 = element("td");
    			t185 = space();
    			td98 = element("td");
    			t186 = space();
    			td99 = element("td");
    			t187 = space();
    			td100 = element("td");
    			t188 = space();
    			td101 = element("td");
    			attr_dev(th0, "class", "svelte-9kgd3s");
    			add_location(th0, file$b, 51, 20, 1313);
    			attr_dev(th1, "class", "svelte-9kgd3s");
    			add_location(th1, file$b, 52, 20, 1344);
    			attr_dev(th2, "class", "svelte-9kgd3s");
    			add_location(th2, file$b, 53, 20, 1378);
    			attr_dev(th3, "class", "svelte-9kgd3s");
    			add_location(th3, file$b, 54, 20, 1412);
    			attr_dev(th4, "class", "svelte-9kgd3s");
    			add_location(th4, file$b, 55, 20, 1446);
    			attr_dev(th5, "class", "svelte-9kgd3s");
    			add_location(th5, file$b, 56, 20, 1480);
    			attr_dev(tr0, "class", "svelte-9kgd3s");
    			add_location(tr0, file$b, 50, 16, 1287);
    			add_location(thead, file$b, 49, 12, 1262);
    			attr_dev(td0, "class", "h06 svelte-9kgd3s");
    			add_location(td0, file$b, 62, 20, 1623);
    			attr_dev(td1, "class", "mo6 svelte-9kgd3s");
    			add_location(td1, file$b, 63, 20, 1673);
    			attr_dev(td2, "class", "tu6 svelte-9kgd3s");
    			add_location(td2, file$b, 64, 20, 1717);
    			attr_dev(td3, "class", "we6 svelte-9kgd3s");
    			add_location(td3, file$b, 65, 20, 1760);
    			attr_dev(td4, "class", "th6 svelte-9kgd3s");
    			add_location(td4, file$b, 66, 20, 1803);
    			attr_dev(td5, "class", "fr6 svelte-9kgd3s");
    			add_location(td5, file$b, 67, 20, 1846);
    			attr_dev(tr1, "class", "svelte-9kgd3s");
    			add_location(tr1, file$b, 61, 16, 1597);
    			attr_dev(td6, "class", "h07 svelte-9kgd3s");
    			add_location(td6, file$b, 71, 20, 1955);
    			attr_dev(td7, "class", "mo7 svelte-9kgd3s");
    			add_location(td7, file$b, 72, 20, 2005);
    			attr_dev(td8, "class", "tu7 svelte-9kgd3s");
    			add_location(td8, file$b, 73, 20, 2068);
    			attr_dev(td9, "class", "we7 svelte-9kgd3s");
    			add_location(td9, file$b, 74, 20, 2131);
    			attr_dev(td10, "class", "th7 svelte-9kgd3s");
    			add_location(td10, file$b, 75, 20, 2194);
    			attr_dev(td11, "class", "fr7 svelte-9kgd3s");
    			add_location(td11, file$b, 76, 20, 2257);
    			attr_dev(tr2, "class", "svelte-9kgd3s");
    			add_location(tr2, file$b, 70, 16, 1929);
    			attr_dev(td12, "class", "h08 svelte-9kgd3s");
    			add_location(td12, file$b, 80, 20, 2386);
    			attr_dev(td13, "class", "mo8 svelte-9kgd3s");
    			add_location(td13, file$b, 81, 20, 2435);
    			attr_dev(td14, "class", "tu8 svelte-9kgd3s");
    			add_location(td14, file$b, 82, 20, 2498);
    			attr_dev(td15, "class", "we8 svelte-9kgd3s");
    			add_location(td15, file$b, 83, 20, 2561);
    			attr_dev(td16, "class", "th8 svelte-9kgd3s");
    			add_location(td16, file$b, 85, 20, 2640);
    			attr_dev(td17, "class", "fr8 svelte-9kgd3s");
    			add_location(td17, file$b, 86, 20, 2703);
    			attr_dev(tr3, "class", "svelte-9kgd3s");
    			add_location(tr3, file$b, 79, 16, 2360);
    			attr_dev(td18, "class", "h09 svelte-9kgd3s");
    			add_location(td18, file$b, 90, 20, 2832);
    			attr_dev(td19, "class", "mo9 svelte-9kgd3s");
    			add_location(td19, file$b, 91, 20, 2881);
    			attr_dev(td20, "class", "tu9 svelte-9kgd3s");
    			add_location(td20, file$b, 92, 20, 2944);
    			attr_dev(td21, "class", "we9 svelte-9kgd3s");
    			add_location(td21, file$b, 93, 20, 3007);
    			attr_dev(td22, "class", "th9 svelte-9kgd3s");
    			add_location(td22, file$b, 94, 20, 3070);
    			attr_dev(td23, "class", "fr9 svelte-9kgd3s");
    			add_location(td23, file$b, 95, 20, 3133);
    			attr_dev(tr4, "class", "svelte-9kgd3s");
    			add_location(tr4, file$b, 89, 16, 2806);
    			attr_dev(td24, "class", "h10 svelte-9kgd3s");
    			add_location(td24, file$b, 100, 20, 3270);
    			attr_dev(td25, "class", "mo10 svelte-9kgd3s");
    			add_location(td25, file$b, 101, 20, 3318);
    			attr_dev(td26, "class", "tu10 svelte-9kgd3s");
    			add_location(td26, file$b, 102, 20, 3382);
    			attr_dev(td27, "class", "we10 svelte-9kgd3s");
    			add_location(td27, file$b, 103, 20, 3446);
    			attr_dev(td28, "class", "th10 svelte-9kgd3s");
    			add_location(td28, file$b, 104, 20, 3510);
    			attr_dev(td29, "class", "fr10 svelte-9kgd3s");
    			add_location(td29, file$b, 105, 20, 3574);
    			attr_dev(tr5, "class", "svelte-9kgd3s");
    			add_location(tr5, file$b, 99, 16, 3244);
    			attr_dev(td30, "class", "h11 svelte-9kgd3s");
    			add_location(td30, file$b, 110, 20, 3725);
    			attr_dev(td31, "class", "mo11 svelte-9kgd3s");
    			add_location(td31, file$b, 111, 20, 3773);
    			attr_dev(td32, "class", "tu11 svelte-9kgd3s");
    			add_location(td32, file$b, 112, 20, 3837);
    			attr_dev(td33, "class", "we11 svelte-9kgd3s");
    			add_location(td33, file$b, 113, 20, 3901);
    			attr_dev(td34, "class", "th11 svelte-9kgd3s");
    			add_location(td34, file$b, 114, 20, 3965);
    			attr_dev(td35, "class", "fr11 svelte-9kgd3s");
    			add_location(td35, file$b, 115, 20, 4029);
    			attr_dev(tr6, "class", "svelte-9kgd3s");
    			add_location(tr6, file$b, 109, 16, 3699);
    			attr_dev(td36, "class", "h12 svelte-9kgd3s");
    			add_location(td36, file$b, 120, 20, 4161);
    			attr_dev(td37, "class", "mo12 svelte-9kgd3s");
    			add_location(td37, file$b, 121, 20, 4209);
    			attr_dev(td38, "class", "tu12 svelte-9kgd3s");
    			add_location(td38, file$b, 122, 20, 4273);
    			attr_dev(td39, "class", "we12 svelte-9kgd3s");
    			add_location(td39, file$b, 123, 20, 4337);
    			attr_dev(td40, "class", "th12 svelte-9kgd3s");
    			add_location(td40, file$b, 124, 20, 4401);
    			attr_dev(td41, "class", "fr12 svelte-9kgd3s");
    			add_location(td41, file$b, 125, 20, 4465);
    			attr_dev(tr7, "class", "svelte-9kgd3s");
    			add_location(tr7, file$b, 119, 16, 4135);
    			attr_dev(td42, "class", "h12 svelte-9kgd3s");
    			add_location(td42, file$b, 129, 20, 4596);
    			attr_dev(td43, "class", "mo12-50 svelte-9kgd3s");
    			add_location(td43, file$b, 130, 20, 4644);
    			attr_dev(td44, "class", "tu12-50 svelte-9kgd3s");
    			add_location(td44, file$b, 131, 20, 4691);
    			attr_dev(td45, "class", "we12-50 svelte-9kgd3s");
    			add_location(td45, file$b, 132, 20, 4738);
    			attr_dev(td46, "class", "th12-50 svelte-9kgd3s");
    			add_location(td46, file$b, 133, 20, 4785);
    			attr_dev(td47, "class", "fr12-50 svelte-9kgd3s");
    			add_location(td47, file$b, 134, 20, 4832);
    			attr_dev(tr8, "class", "svelte-9kgd3s");
    			add_location(tr8, file$b, 128, 16, 4570);
    			attr_dev(td48, "class", "h12 svelte-9kgd3s");
    			add_location(td48, file$b, 139, 20, 4941);
    			attr_dev(td49, "class", "svelte-9kgd3s");
    			add_location(td49, file$b, 140, 20, 4987);
    			attr_dev(td50, "class", "t_b12 svelte-9kgd3s");
    			add_location(td50, file$b, 141, 20, 5018);
    			attr_dev(td51, "class", "svelte-9kgd3s");
    			add_location(td51, file$b, 142, 20, 5063);
    			attr_dev(td52, "class", "svelte-9kgd3s");
    			add_location(td52, file$b, 143, 20, 5094);
    			attr_dev(td53, "class", "svelte-9kgd3s");
    			add_location(td53, file$b, 144, 20, 5125);
    			attr_dev(tr9, "class", "svelte-9kgd3s");
    			add_location(tr9, file$b, 138, 16, 4915);
    			attr_dev(td54, "class", "h13 svelte-9kgd3s");
    			add_location(td54, file$b, 148, 20, 5223);
    			attr_dev(td55, "class", "mo13 svelte-9kgd3s");
    			add_location(td55, file$b, 149, 20, 5272);
    			attr_dev(td56, "class", "tu13 svelte-9kgd3s");
    			add_location(td56, file$b, 150, 20, 5336);
    			attr_dev(td57, "class", "we13 svelte-9kgd3s");
    			add_location(td57, file$b, 151, 20, 5400);
    			attr_dev(td58, "class", "th13 svelte-9kgd3s");
    			add_location(td58, file$b, 152, 20, 5464);
    			attr_dev(td59, "class", "fr13 svelte-9kgd3s");
    			add_location(td59, file$b, 153, 20, 5528);
    			attr_dev(tr10, "class", "svelte-9kgd3s");
    			add_location(tr10, file$b, 147, 16, 5197);
    			attr_dev(td60, "class", "h14 svelte-9kgd3s");
    			add_location(td60, file$b, 157, 20, 5658);
    			attr_dev(td61, "class", "mo14 svelte-9kgd3s");
    			add_location(td61, file$b, 158, 20, 5707);
    			attr_dev(td62, "class", "tu14 svelte-9kgd3s");
    			add_location(td62, file$b, 159, 20, 5771);
    			attr_dev(td63, "class", "we14 svelte-9kgd3s");
    			add_location(td63, file$b, 160, 20, 5835);
    			attr_dev(td64, "class", "th14 svelte-9kgd3s");
    			add_location(td64, file$b, 161, 20, 5899);
    			attr_dev(td65, "class", "fr14 svelte-9kgd3s");
    			add_location(td65, file$b, 162, 20, 5963);
    			attr_dev(tr11, "class", "svelte-9kgd3s");
    			add_location(tr11, file$b, 156, 16, 5632);
    			attr_dev(td66, "class", "h15 svelte-9kgd3s");
    			add_location(td66, file$b, 166, 20, 6093);
    			attr_dev(td67, "class", "mo15 svelte-9kgd3s");
    			add_location(td67, file$b, 167, 20, 6142);
    			attr_dev(td68, "class", "tu15 svelte-9kgd3s");
    			add_location(td68, file$b, 168, 20, 6206);
    			attr_dev(td69, "class", "we15 svelte-9kgd3s");
    			add_location(td69, file$b, 169, 20, 6270);
    			attr_dev(td70, "class", "th15 svelte-9kgd3s");
    			add_location(td70, file$b, 170, 20, 6334);
    			attr_dev(td71, "class", "fr15 svelte-9kgd3s");
    			add_location(td71, file$b, 171, 20, 6398);
    			attr_dev(tr12, "class", "svelte-9kgd3s");
    			add_location(tr12, file$b, 165, 16, 6067);
    			attr_dev(td72, "class", "h16 svelte-9kgd3s");
    			add_location(td72, file$b, 175, 20, 6528);
    			attr_dev(td73, "class", "mo16 svelte-9kgd3s");
    			add_location(td73, file$b, 176, 20, 6577);
    			attr_dev(td74, "class", "tu16 svelte-9kgd3s");
    			add_location(td74, file$b, 177, 20, 6641);
    			attr_dev(td75, "class", "we16 svelte-9kgd3s");
    			add_location(td75, file$b, 178, 20, 6705);
    			attr_dev(td76, "class", "th16 svelte-9kgd3s");
    			add_location(td76, file$b, 179, 20, 6769);
    			attr_dev(td77, "class", "fr16 svelte-9kgd3s");
    			add_location(td77, file$b, 180, 20, 6833);
    			attr_dev(tr13, "class", "svelte-9kgd3s");
    			add_location(tr13, file$b, 174, 16, 6502);
    			attr_dev(td78, "class", "h17 svelte-9kgd3s");
    			add_location(td78, file$b, 184, 20, 6963);
    			attr_dev(td79, "class", "mo17 svelte-9kgd3s");
    			add_location(td79, file$b, 185, 20, 7012);
    			attr_dev(td80, "class", "tu17 svelte-9kgd3s");
    			add_location(td80, file$b, 186, 20, 7076);
    			attr_dev(td81, "class", "we17 svelte-9kgd3s");
    			add_location(td81, file$b, 187, 20, 7140);
    			attr_dev(td82, "class", "th17 svelte-9kgd3s");
    			add_location(td82, file$b, 188, 20, 7204);
    			attr_dev(td83, "class", "fr17 svelte-9kgd3s");
    			add_location(td83, file$b, 189, 20, 7268);
    			attr_dev(tr14, "class", "svelte-9kgd3s");
    			add_location(tr14, file$b, 183, 16, 6937);
    			attr_dev(td84, "class", "h18 svelte-9kgd3s");
    			add_location(td84, file$b, 193, 20, 7398);
    			attr_dev(td85, "class", "mo18 svelte-9kgd3s");
    			add_location(td85, file$b, 194, 20, 7447);
    			attr_dev(td86, "class", "tu18 svelte-9kgd3s");
    			add_location(td86, file$b, 195, 20, 7511);
    			attr_dev(td87, "class", "we18 svelte-9kgd3s");
    			add_location(td87, file$b, 196, 20, 7575);
    			attr_dev(td88, "class", "th18 svelte-9kgd3s");
    			add_location(td88, file$b, 197, 20, 7639);
    			attr_dev(td89, "class", "fr18 svelte-9kgd3s");
    			add_location(td89, file$b, 198, 20, 7703);
    			attr_dev(tr15, "class", "svelte-9kgd3s");
    			add_location(tr15, file$b, 192, 16, 7372);
    			attr_dev(td90, "class", "h20 svelte-9kgd3s");
    			add_location(td90, file$b, 202, 20, 7834);
    			attr_dev(td91, "class", "svelte-9kgd3s");
    			add_location(td91, file$b, 203, 20, 7880);
    			attr_dev(td92, "class", "svelte-9kgd3s");
    			add_location(td92, file$b, 204, 20, 7911);
    			attr_dev(td93, "class", "svelte-9kgd3s");
    			add_location(td93, file$b, 205, 20, 7942);
    			attr_dev(td94, "class", "svelte-9kgd3s");
    			add_location(td94, file$b, 206, 20, 7973);
    			attr_dev(td95, "class", "svelte-9kgd3s");
    			add_location(td95, file$b, 207, 20, 8004);
    			attr_dev(tr16, "class", "svelte-9kgd3s");
    			add_location(tr16, file$b, 201, 16, 7808);
    			attr_dev(td96, "class", "h20 svelte-9kgd3s");
    			add_location(td96, file$b, 225, 20, 8600);
    			attr_dev(td97, "class", "mo20 svelte-9kgd3s");
    			add_location(td97, file$b, 226, 20, 8649);
    			attr_dev(td98, "class", "tu20 svelte-9kgd3s");
    			add_location(td98, file$b, 227, 20, 8693);
    			attr_dev(td99, "class", "we20 svelte-9kgd3s");
    			add_location(td99, file$b, 228, 20, 8737);
    			attr_dev(td100, "class", "th20 svelte-9kgd3s");
    			add_location(td100, file$b, 229, 20, 8781);
    			attr_dev(td101, "class", "fr20 svelte-9kgd3s");
    			add_location(td101, file$b, 230, 20, 8825);
    			attr_dev(tr17, "class", "svelte-9kgd3s");
    			add_location(tr17, file$b, 224, 16, 8574);
    			add_location(tbody, file$b, 60, 12, 1572);
    			attr_dev(table, "class", "table svelte-9kgd3s");
    			add_location(table, file$b, 48, 8, 1227);
    			attr_dev(div, "class", "time-t svelte-9kgd3s");
    			add_location(div, file$b, 47, 4, 1197);
    			attr_dev(article, "id", "timetable");
    			attr_dev(article, "class", "svelte-9kgd3s");
    			add_location(article, file$b, 46, 0, 1167);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(div, table);
    			append_dev(table, thead);
    			append_dev(thead, tr0);
    			append_dev(tr0, th0);
    			append_dev(tr0, t0);
    			append_dev(tr0, th1);
    			append_dev(tr0, t2);
    			append_dev(tr0, th2);
    			append_dev(tr0, t4);
    			append_dev(tr0, th3);
    			append_dev(tr0, t6);
    			append_dev(tr0, th4);
    			append_dev(tr0, t8);
    			append_dev(tr0, th5);
    			append_dev(table, t10);
    			append_dev(table, tbody);
    			append_dev(tbody, tr1);
    			append_dev(tr1, td0);
    			append_dev(tr1, t12);
    			append_dev(tr1, td1);
    			append_dev(tr1, t13);
    			append_dev(tr1, td2);
    			append_dev(tr1, t14);
    			append_dev(tr1, td3);
    			append_dev(tr1, t15);
    			append_dev(tr1, td4);
    			append_dev(tr1, t16);
    			append_dev(tr1, td5);
    			append_dev(tbody, t17);
    			append_dev(tbody, tr2);
    			append_dev(tr2, td6);
    			append_dev(tr2, t19);
    			append_dev(tr2, td7);
    			append_dev(tr2, t21);
    			append_dev(tr2, td8);
    			append_dev(tr2, t23);
    			append_dev(tr2, td9);
    			append_dev(tr2, t25);
    			append_dev(tr2, td10);
    			append_dev(tr2, t27);
    			append_dev(tr2, td11);
    			append_dev(tbody, t29);
    			append_dev(tbody, tr3);
    			append_dev(tr3, td12);
    			append_dev(tr3, t31);
    			append_dev(tr3, td13);
    			append_dev(tr3, t33);
    			append_dev(tr3, td14);
    			append_dev(tr3, t35);
    			append_dev(tr3, td15);
    			append_dev(tr3, t37);
    			append_dev(tr3, td16);
    			append_dev(tr3, t39);
    			append_dev(tr3, td17);
    			append_dev(tbody, t41);
    			append_dev(tbody, tr4);
    			append_dev(tr4, td18);
    			append_dev(tr4, t43);
    			append_dev(tr4, td19);
    			append_dev(tr4, t45);
    			append_dev(tr4, td20);
    			append_dev(tr4, t47);
    			append_dev(tr4, td21);
    			append_dev(tr4, t49);
    			append_dev(tr4, td22);
    			append_dev(tr4, t51);
    			append_dev(tr4, td23);
    			append_dev(tbody, t53);
    			append_dev(tbody, tr5);
    			append_dev(tr5, td24);
    			append_dev(tr5, t55);
    			append_dev(tr5, td25);
    			append_dev(tr5, t57);
    			append_dev(tr5, td26);
    			append_dev(tr5, t59);
    			append_dev(tr5, td27);
    			append_dev(tr5, t61);
    			append_dev(tr5, td28);
    			append_dev(tr5, t63);
    			append_dev(tr5, td29);
    			append_dev(tbody, t65);
    			append_dev(tbody, tr6);
    			append_dev(tr6, td30);
    			append_dev(tr6, t67);
    			append_dev(tr6, td31);
    			append_dev(tr6, t69);
    			append_dev(tr6, td32);
    			append_dev(tr6, t71);
    			append_dev(tr6, td33);
    			append_dev(tr6, t73);
    			append_dev(tr6, td34);
    			append_dev(tr6, t75);
    			append_dev(tr6, td35);
    			append_dev(tbody, t77);
    			append_dev(tbody, tr7);
    			append_dev(tr7, td36);
    			append_dev(tr7, t79);
    			append_dev(tr7, td37);
    			append_dev(tr7, t81);
    			append_dev(tr7, td38);
    			append_dev(tr7, t83);
    			append_dev(tr7, td39);
    			append_dev(tr7, t85);
    			append_dev(tr7, td40);
    			append_dev(tr7, t87);
    			append_dev(tr7, td41);
    			append_dev(tbody, t89);
    			append_dev(tbody, tr8);
    			append_dev(tr8, td42);
    			append_dev(tr8, t91);
    			append_dev(tr8, td43);
    			append_dev(tr8, t92);
    			append_dev(tr8, td44);
    			append_dev(tr8, t93);
    			append_dev(tr8, td45);
    			append_dev(tr8, t94);
    			append_dev(tr8, td46);
    			append_dev(tr8, t95);
    			append_dev(tr8, td47);
    			append_dev(tbody, t96);
    			append_dev(tbody, tr9);
    			append_dev(tr9, td48);
    			append_dev(tr9, t98);
    			append_dev(tr9, td49);
    			append_dev(tr9, t99);
    			append_dev(tr9, td50);
    			append_dev(tr9, t100);
    			append_dev(tr9, td51);
    			append_dev(tr9, t101);
    			append_dev(tr9, td52);
    			append_dev(tr9, t102);
    			append_dev(tr9, td53);
    			append_dev(tbody, t103);
    			append_dev(tbody, tr10);
    			append_dev(tr10, td54);
    			append_dev(tr10, t105);
    			append_dev(tr10, td55);
    			append_dev(tr10, t107);
    			append_dev(tr10, td56);
    			append_dev(tr10, t109);
    			append_dev(tr10, td57);
    			append_dev(tr10, t111);
    			append_dev(tr10, td58);
    			append_dev(tr10, t113);
    			append_dev(tr10, td59);
    			append_dev(tbody, t115);
    			append_dev(tbody, tr11);
    			append_dev(tr11, td60);
    			append_dev(tr11, t117);
    			append_dev(tr11, td61);
    			append_dev(tr11, t119);
    			append_dev(tr11, td62);
    			append_dev(tr11, t121);
    			append_dev(tr11, td63);
    			append_dev(tr11, t123);
    			append_dev(tr11, td64);
    			append_dev(tr11, t125);
    			append_dev(tr11, td65);
    			append_dev(tbody, t127);
    			append_dev(tbody, tr12);
    			append_dev(tr12, td66);
    			append_dev(tr12, t129);
    			append_dev(tr12, td67);
    			append_dev(tr12, t131);
    			append_dev(tr12, td68);
    			append_dev(tr12, t133);
    			append_dev(tr12, td69);
    			append_dev(tr12, t135);
    			append_dev(tr12, td70);
    			append_dev(tr12, t137);
    			append_dev(tr12, td71);
    			append_dev(tbody, t139);
    			append_dev(tbody, tr13);
    			append_dev(tr13, td72);
    			append_dev(tr13, t141);
    			append_dev(tr13, td73);
    			append_dev(tr13, t143);
    			append_dev(tr13, td74);
    			append_dev(tr13, t145);
    			append_dev(tr13, td75);
    			append_dev(tr13, t147);
    			append_dev(tr13, td76);
    			append_dev(tr13, t149);
    			append_dev(tr13, td77);
    			append_dev(tbody, t151);
    			append_dev(tbody, tr14);
    			append_dev(tr14, td78);
    			append_dev(tr14, t153);
    			append_dev(tr14, td79);
    			append_dev(tr14, t155);
    			append_dev(tr14, td80);
    			append_dev(tr14, t157);
    			append_dev(tr14, td81);
    			append_dev(tr14, t159);
    			append_dev(tr14, td82);
    			append_dev(tr14, t161);
    			append_dev(tr14, td83);
    			append_dev(tbody, t163);
    			append_dev(tbody, tr15);
    			append_dev(tr15, td84);
    			append_dev(tr15, t165);
    			append_dev(tr15, td85);
    			append_dev(tr15, t167);
    			append_dev(tr15, td86);
    			append_dev(tr15, t169);
    			append_dev(tr15, td87);
    			append_dev(tr15, t171);
    			append_dev(tr15, td88);
    			append_dev(tr15, t173);
    			append_dev(tr15, td89);
    			append_dev(tbody, t175);
    			append_dev(tbody, tr16);
    			append_dev(tr16, td90);
    			append_dev(tr16, t177);
    			append_dev(tr16, td91);
    			append_dev(tr16, t178);
    			append_dev(tr16, td92);
    			append_dev(tr16, t179);
    			append_dev(tr16, td93);
    			append_dev(tr16, t180);
    			append_dev(tr16, td94);
    			append_dev(tr16, t181);
    			append_dev(tr16, td95);
    			append_dev(tbody, t182);
    			append_dev(tbody, tr17);
    			append_dev(tr17, td96);
    			append_dev(tr17, t184);
    			append_dev(tr17, td97);
    			append_dev(tr17, t185);
    			append_dev(tr17, td98);
    			append_dev(tr17, t186);
    			append_dev(tr17, td99);
    			append_dev(tr17, t187);
    			append_dev(tr17, td100);
    			append_dev(tr17, t188);
    			append_dev(tr17, td101);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $data;
    	validate_store(data, "data");
    	component_subscribe($$self, data, $$value => $$invalidate(1, $data = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Table", slots, []);
    	let date = new Date();

    	function datarow(timeP, dayP) {
    		const store = $data.courses.map(element => {
    			return {
    				...element,
    				weekdays: element.weekdays.filter(weekdays => weekdays.initialTime == timeP)
    			};
    		}).filter(item => {
    			return item.weekdays.length !== 0;
    		});

    		let code = [];

    		store.forEach(item => {
    			item.weekdays.forEach(element => {
    				if (dayP == element.day) {
    					code = [...code, item.code];
    				}
    			});
    		});

    		return code;
    	}

    	function readrow(timeP, dayP) {
    		const store = $data.reads.map(element => {
    			return {
    				...element,
    				weekdays: element.weekdays.filter(weekdays => weekdays.initialTime == timeP)
    			};
    		}).filter(item => {
    			return item.weekdays.length !== 0;
    		});

    		let code = [];

    		store.forEach(item => {
    			item.weekdays.forEach(element => {
    				if (dayP == element.day) {
    					code = [...code, item.code];
    				}
    			});
    		});

    		return code;
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Table> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ data, date, datarow, readrow, $data });

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) date = $$props.date;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [datarow];
    }

    class Table extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Table",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src\routes\index.svelte generated by Svelte v3.38.2 */
    const file$a = "src\\routes\\index.svelte";

    function get_each_context$6(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    // (33:2) {#if todaycrs.length === 0}
    function create_if_block$2(ctx) {
    	let div1;
    	let div0;
    	let h1;
    	let t0;
    	let strong;
    	let t2;
    	let svg;
    	let defs;
    	let clipPath;
    	let rect;
    	let g;
    	let path;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("No Course Avalable For ");
    			strong = element("strong");
    			strong.textContent = `${/*date*/ ctx[0].toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()}`;
    			t2 = space();
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect = svg_element("rect");
    			g = svg_element("g");
    			path = svg_element("path");
    			add_location(strong, file$a, 35, 32, 876);
    			attr_dev(h1, "class", "svelte-1bstkvn");
    			add_location(h1, file$a, 35, 5, 849);
    			attr_dev(rect, "width", "16");
    			attr_dev(rect, "height", "16");
    			attr_dev(rect, "fill", "none");
    			add_location(rect, file$a, 37, 154, 1128);
    			attr_dev(clipPath, "id", "a");
    			add_location(clipPath, file$a, 37, 137, 1111);
    			add_location(defs, file$a, 37, 131, 1105);
    			attr_dev(path, "d", "M8,0a8,8,0,1,0,8,8A8.024,8.024,0,0,0,8,0ZM9.1,12.2H6.9V10.3H9.2v1.9Zm.1-7.4L8.6,9.2H7.4L6.8,4.8v-1H9.3v1Z");
    			attr_dev(path, "fill", "#707070");
    			add_location(path, file$a, 37, 237, 1211);
    			attr_dev(g, "clip-path", "url(#a)");
    			add_location(g, file$a, 37, 214, 1188);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			add_location(svg, file$a, 37, 5, 979);
    			attr_dev(div0, "class", "title svelte-1bstkvn");
    			add_location(div0, file$a, 34, 4, 823);
    			attr_dev(div1, "class", "card svelte-1bstkvn");
    			add_location(div1, file$a, 33, 3, 799);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, strong);
    			append_dev(div0, t2);
    			append_dev(div0, svg);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect);
    			append_dev(svg, g);
    			append_dev(g, path);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(33:2) {#if todaycrs.length === 0}",
    		ctx
    	});

    	return block;
    }

    // (52:5) {#each crs.weekdays as rc}
    function create_each_block_1$3(ctx) {
    	let p0;
    	let t0_value = /*rc*/ ctx[8].type + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*rc*/ ctx[8].initialTime + "";
    	let t2;
    	let t3;
    	let t4_value = /*rc*/ ctx[8].finalTime + "";
    	let t4;
    	let t5;
    	let p2;
    	let t6_value = /*rc*/ ctx[8].hours + "";
    	let t6;
    	let t7;
    	let t8;
    	let p3;
    	let t9_value = /*rc*/ ctx[8].location.toUpperCase() + "";
    	let t9;
    	let t10;
    	let div;

    	const block = {
    		c: function create() {
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = text(" | ");
    			t4 = text(t4_value);
    			t5 = space();
    			p2 = element("p");
    			t6 = text(t6_value);
    			t7 = text("\tHOURS");
    			t8 = space();
    			p3 = element("p");
    			t9 = text(t9_value);
    			t10 = space();
    			div = element("div");
    			div.textContent = ". . .";
    			set_style(p0, "color", "var(--bl)");
    			set_style(p0, "text-align", "end");
    			attr_dev(p0, "class", "svelte-1bstkvn");
    			add_location(p0, file$a, 52, 5, 1974);
    			attr_dev(p1, "class", "svelte-1bstkvn");
    			add_location(p1, file$a, 53, 6, 2042);
    			attr_dev(p2, "class", "p-2 svelte-1bstkvn");
    			add_location(p2, file$a, 54, 6, 2090);
    			attr_dev(p3, "class", "svelte-1bstkvn");
    			add_location(p3, file$a, 55, 6, 2134);
    			attr_dev(div, "class", "space svelte-1bstkvn");
    			add_location(div, file$a, 56, 6, 2178);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p0, anchor);
    			append_dev(p0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, p1, anchor);
    			append_dev(p1, t2);
    			append_dev(p1, t3);
    			append_dev(p1, t4);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, p2, anchor);
    			append_dev(p2, t6);
    			append_dev(p2, t7);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, p3, anchor);
    			append_dev(p3, t9);
    			insert_dev(target, t10, anchor);
    			insert_dev(target, div, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(p1);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(p2);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(p3);
    			if (detaching) detach_dev(t10);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$3.name,
    		type: "each",
    		source: "(52:5) {#each crs.weekdays as rc}",
    		ctx
    	});

    	return block;
    }

    // (44:2) {#each todaycrs as crs}
    function create_each_block$6(ctx) {
    	let div2;
    	let div0;
    	let h1;
    	let t0_value = /*crs*/ ctx[5].course.toUpperCase() + "";
    	let t0;
    	let t1;
    	let svg;
    	let defs;
    	let clipPath;
    	let rect;
    	let g;
    	let path;
    	let t2;
    	let div1;
    	let t3;
    	let each_value_1 = /*crs*/ ctx[5].weekdays;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$3(get_each_context_1$3(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect = svg_element("rect");
    			g = svg_element("g");
    			path = svg_element("path");
    			t2 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			attr_dev(h1, "class", "svelte-1bstkvn");
    			add_location(h1, file$a, 46, 5, 1476);
    			attr_dev(rect, "width", "16");
    			attr_dev(rect, "height", "16");
    			attr_dev(rect, "fill", "none");
    			add_location(rect, file$a, 48, 154, 1670);
    			attr_dev(clipPath, "id", "a");
    			add_location(clipPath, file$a, 48, 137, 1653);
    			add_location(defs, file$a, 48, 131, 1647);
    			attr_dev(path, "d", "M8,0a8,8,0,1,0,8,8A8.024,8.024,0,0,0,8,0ZM9.1,12.2H6.9V10.3H9.2v1.9Zm.1-7.4L8.6,9.2H7.4L6.8,4.8v-1H9.3v1Z");
    			attr_dev(path, "fill", "#707070");
    			add_location(path, file$a, 48, 237, 1753);
    			attr_dev(g, "clip-path", "url(#a)");
    			add_location(g, file$a, 48, 214, 1730);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "16");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 16 16");
    			add_location(svg, file$a, 48, 5, 1521);
    			attr_dev(div0, "class", "title svelte-1bstkvn");
    			add_location(div0, file$a, 45, 4, 1450);
    			attr_dev(div1, "class", "details svelte-1bstkvn");
    			add_location(div1, file$a, 50, 4, 1913);
    			attr_dev(div2, "class", "card svelte-1bstkvn");
    			add_location(div2, file$a, 44, 3, 1426);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(div0, t1);
    			append_dev(div0, svg);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect);
    			append_dev(svg, g);
    			append_dev(g, path);
    			append_dev(div2, t2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t3);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*todaycrs*/ 2) {
    				each_value_1 = /*crs*/ ctx[5].weekdays;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$3(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$6.name,
    		type: "each",
    		source: "(44:2) {#each todaycrs as crs}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$b(ctx) {
    	let article;
    	let div;
    	let header;
    	let p0;
    	let t1;
    	let p1;
    	let p2;
    	let t5;
    	let main;
    	let t6;
    	let if_block = /*todaycrs*/ ctx[1].length === 0 && create_if_block$2(ctx);
    	let each_value = /*todaycrs*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$6(get_each_context$6(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div = element("div");
    			header = element("header");
    			p0 = element("p");
    			p0.textContent = "TODAYS CLASSES";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = `${/*date*/ ctx[0].getHours()} : ${/*date*/ ctx[0].getMinutes()}`;
    			p2 = element("p");
    			t5 = space();
    			main = element("main");
    			if (if_block) if_block.c();
    			t6 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p0, "class", "svelte-1bstkvn");
    			add_location(p0, file$a, 28, 3, 669);
    			attr_dev(p1, "class", "svelte-1bstkvn");
    			add_location(p1, file$a, 29, 3, 695);
    			attr_dev(p2, "class", "svelte-1bstkvn");
    			add_location(p2, file$a, 29, 45, 737);
    			attr_dev(header, "class", "svelte-1bstkvn");
    			add_location(header, file$a, 27, 2, 656);
    			attr_dev(main, "class", "svelte-1bstkvn");
    			add_location(main, file$a, 31, 2, 757);
    			attr_dev(div, "class", "content svelte-1bstkvn");
    			add_location(div, file$a, 26, 2, 631);
    			attr_dev(article, "class", "svelte-1bstkvn");
    			add_location(article, file$a, 24, 1, 614);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div);
    			append_dev(div, header);
    			append_dev(header, p0);
    			append_dev(header, t1);
    			append_dev(header, p1);
    			append_dev(header, p2);
    			append_dev(div, t5);
    			append_dev(div, main);
    			if (if_block) if_block.m(main, null);
    			append_dev(main, t6);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*todaycrs*/ ctx[1].length === 0) if_block.p(ctx, dirty);

    			if (dirty & /*todaycrs*/ 2) {
    				each_value = /*todaycrs*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$6(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$6(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			if (if_block) if_block.d();
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let $data;
    	validate_store(data, "data");
    	component_subscribe($$self, data, $$value => $$invalidate(2, $data = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Routes", slots, []);
    	let date = new Date();
    	let day = date.getDay();

    	const arr = $data.courses.map(element => {
    		return {
    			...element,
    			weekdays: element.weekdays.filter(weekdays => weekdays.day === day)
    		};
    	}).filter(item => {
    		return item.weekdays.length !== 0;
    	});

    	const todaycrs = arr.map(element => {
    		let time = "";
    		element.weekdays.forEach(weekdays => time = weekdays.initialTime.substring(0, 2));
    		return { ...element, time };
    	}).sort((a, b) => {
    		return a.time.localeCompare(b.time);
    	}).map(item => {
    		return item;
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Routes> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ data, date, day, arr, todaycrs, $data });

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(0, date = $$props.date);
    		if ("day" in $$props) day = $$props.day;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [date, todaycrs];
    }

    class Routes extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Routes",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src\routes\info.svelte generated by Svelte v3.38.2 */
    const file$9 = "src\\routes\\info.svelte";

    function get_each_context$5(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (24:32) {#each $data.common as cmn}
    function create_each_block_2(ctx) {
    	let span;
    	let p0;
    	let t0;
    	let t1_value = /*cmn*/ ctx[9].studyYear + "";
    	let t1;
    	let t2;
    	let p1;
    	let t4;
    	let p2;
    	let t5;
    	let t6_value = /*cmn*/ ctx[9].semester + "";
    	let t6;

    	const block = {
    		c: function create() {
    			span = element("span");
    			p0 = element("p");
    			t0 = text("year : ");
    			t1 = text(t1_value);
    			t2 = space();
    			p1 = element("p");
    			p1.textContent = "|";
    			t4 = space();
    			p2 = element("p");
    			t5 = text("semester : ");
    			t6 = text(t6_value);
    			attr_dev(p0, "class", "sum svelte-ongc3q");
    			add_location(p0, file$9, 25, 36, 586);
    			attr_dev(p1, "class", "sum svelte-ongc3q");
    			add_location(p1, file$9, 26, 36, 666);
    			attr_dev(p2, "class", "sum svelte-ongc3q");
    			add_location(p2, file$9, 27, 36, 724);
    			attr_dev(span, "class", "tp-sum svelte-ongc3q");
    			add_location(span, file$9, 24, 32, 527);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    			append_dev(span, p0);
    			append_dev(p0, t0);
    			append_dev(p0, t1);
    			append_dev(span, t2);
    			append_dev(span, p1);
    			append_dev(span, t4);
    			append_dev(span, p2);
    			append_dev(p2, t5);
    			append_dev(p2, t6);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 1 && t1_value !== (t1_value = /*cmn*/ ctx[9].studyYear + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$data*/ 1 && t6_value !== (t6_value = /*cmn*/ ctx[9].semester + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(24:32) {#each $data.common as cmn}",
    		ctx
    	});

    	return block;
    }

    // (50:32) {#each crs.weekdays as cr}
    function create_each_block_1$2(ctx) {
    	let div;
    	let p0;
    	let t0_value = /*cr*/ ctx[6].weekday + "";
    	let t0;
    	let t1;
    	let p1;
    	let t2_value = /*cr*/ ctx[6].location + "";
    	let t2;
    	let t3;
    	let p2;
    	let t4_value = /*cr*/ ctx[6].initialTime + "";
    	let t4;
    	let t5;
    	let t6_value = /*cr*/ ctx[6].finalTime + "";
    	let t6;
    	let t7;
    	let p3;
    	let t8_value = /*cr*/ ctx[6].type + "";
    	let t8;
    	let t9;
    	let p4;
    	let t10_value = /*cr*/ ctx[6].hours + "";
    	let t10;
    	let t11;
    	let t12;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p0 = element("p");
    			t0 = text(t0_value);
    			t1 = space();
    			p1 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p2 = element("p");
    			t4 = text(t4_value);
    			t5 = text(" : ");
    			t6 = text(t6_value);
    			t7 = space();
    			p3 = element("p");
    			t8 = text(t8_value);
    			t9 = space();
    			p4 = element("p");
    			t10 = text(t10_value);
    			t11 = text("HRS");
    			t12 = space();
    			attr_dev(p0, "class", "svelte-ongc3q");
    			add_location(p0, file$9, 52, 40, 1834);
    			attr_dev(p1, "class", "svelte-ongc3q");
    			add_location(p1, file$9, 53, 40, 1895);
    			attr_dev(p2, "class", "svelte-ongc3q");
    			add_location(p2, file$9, 54, 40, 1957);
    			attr_dev(p3, "class", "svelte-ongc3q");
    			add_location(p3, file$9, 55, 40, 2039);
    			attr_dev(p4, "class", "svelte-ongc3q");
    			add_location(p4, file$9, 56, 40, 2097);
    			attr_dev(div, "class", "details svelte-ongc3q");
    			add_location(div, file$9, 50, 36, 1769);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p0);
    			append_dev(p0, t0);
    			append_dev(div, t1);
    			append_dev(div, p1);
    			append_dev(p1, t2);
    			append_dev(div, t3);
    			append_dev(div, p2);
    			append_dev(p2, t4);
    			append_dev(p2, t5);
    			append_dev(p2, t6);
    			append_dev(div, t7);
    			append_dev(div, p3);
    			append_dev(p3, t8);
    			append_dev(div, t9);
    			append_dev(div, p4);
    			append_dev(p4, t10);
    			append_dev(p4, t11);
    			append_dev(div, t12);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 1 && t0_value !== (t0_value = /*cr*/ ctx[6].weekday + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$data*/ 1 && t2_value !== (t2_value = /*cr*/ ctx[6].location + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$data*/ 1 && t4_value !== (t4_value = /*cr*/ ctx[6].initialTime + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$data*/ 1 && t6_value !== (t6_value = /*cr*/ ctx[6].finalTime + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*$data*/ 1 && t8_value !== (t8_value = /*cr*/ ctx[6].type + "")) set_data_dev(t8, t8_value);
    			if (dirty & /*$data*/ 1 && t10_value !== (t10_value = /*cr*/ ctx[6].hours + "")) set_data_dev(t10, t10_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$2.name,
    		type: "each",
    		source: "(50:32) {#each crs.weekdays as cr}",
    		ctx
    	});

    	return block;
    }

    // (43:23) {#each $data.courses as crs}
    function create_each_block$5(ctx) {
    	let tr;
    	let td;
    	let h1;
    	let t0_value = /*crs*/ ctx[3].course.toUpperCase() + "";
    	let t0;
    	let t1;
    	let h2;
    	let t2_value = /*crs*/ ctx[3].type + "";
    	let t2;
    	let t3;
    	let p0;
    	let t4_value = /*crs*/ ctx[3].gpa + "";
    	let t4;
    	let t5;
    	let t6;
    	let p1;
    	let t7_value = /*crs*/ ctx[3].code + "";
    	let t7;
    	let t8;
    	let t9;
    	let each_value_1 = /*crs*/ ctx[3].weekdays;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$2(get_each_context_1$2(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			tr = element("tr");
    			td = element("td");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			h2 = element("h2");
    			t2 = text(t2_value);
    			t3 = space();
    			p0 = element("p");
    			t4 = text(t4_value);
    			t5 = text(" GPA");
    			t6 = space();
    			p1 = element("p");
    			t7 = text(t7_value);
    			t8 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			attr_dev(h1, "class", "svelte-ongc3q");
    			add_location(h1, file$9, 45, 32, 1475);
    			attr_dev(h2, "class", "svelte-ongc3q");
    			add_location(h2, file$9, 46, 32, 1544);
    			attr_dev(p0, "class", "svelte-ongc3q");
    			add_location(p0, file$9, 47, 32, 1597);
    			attr_dev(p1, "class", "svelte-ongc3q");
    			add_location(p1, file$9, 48, 32, 1651);
    			attr_dev(td, "class", "svelte-ongc3q");
    			add_location(td, file$9, 44, 28, 1437);
    			attr_dev(tr, "class", "svelte-ongc3q");
    			add_location(tr, file$9, 43, 24, 1403);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td);
    			append_dev(td, h1);
    			append_dev(h1, t0);
    			append_dev(td, t1);
    			append_dev(td, h2);
    			append_dev(h2, t2);
    			append_dev(td, t3);
    			append_dev(td, p0);
    			append_dev(p0, t4);
    			append_dev(p0, t5);
    			append_dev(td, t6);
    			append_dev(td, p1);
    			append_dev(p1, t7);
    			append_dev(td, t8);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(td, null);
    			}

    			append_dev(tr, t9);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 1 && t0_value !== (t0_value = /*crs*/ ctx[3].course.toUpperCase() + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*$data*/ 1 && t2_value !== (t2_value = /*crs*/ ctx[3].type + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$data*/ 1 && t4_value !== (t4_value = /*crs*/ ctx[3].gpa + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$data*/ 1 && t7_value !== (t7_value = /*crs*/ ctx[3].code + "")) set_data_dev(t7, t7_value);

    			if (dirty & /*$data*/ 1) {
    				each_value_1 = /*crs*/ ctx[3].weekdays;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$2(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(td, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$5.name,
    		type: "each",
    		source: "(43:23) {#each $data.courses as crs}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let article;
    	let div1;
    	let main;
    	let div0;
    	let table;
    	let tbody;
    	let tr;
    	let td;
    	let t0;
    	let p0;
    	let t2;
    	let h1;
    	let t4;
    	let p1;
    	let t5_value = /*$data*/ ctx[0].courses.length + "";
    	let t5;
    	let t6;
    	let t7;
    	let p2;
    	let t10;
    	let each_value_2 = /*$data*/ ctx[0].common;
    	validate_each_argument(each_value_2);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_1[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	let each_value = /*$data*/ ctx[0].courses;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$5(get_each_context$5(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div1 = element("div");
    			main = element("main");
    			div0 = element("div");
    			table = element("table");
    			tbody = element("tbody");
    			tr = element("tr");
    			td = element("td");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();
    			p0 = element("p");
    			p0.textContent = "___";
    			t2 = space();
    			h1 = element("h1");
    			h1.textContent = "SUMMARY";
    			t4 = space();
    			p1 = element("p");
    			t5 = text(t5_value);
    			t6 = text(" COURSES");
    			t7 = space();
    			p2 = element("p");
    			p2.textContent = `${/*len*/ ctx[1]} CORES`;
    			t10 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(p0, "class", "svelte-ongc3q");
    			add_location(p0, file$9, 30, 32, 884);
    			attr_dev(h1, "class", "svelte-ongc3q");
    			add_location(h1, file$9, 32, 32, 964);
    			attr_dev(p1, "class", "sum svelte-ongc3q");
    			add_location(p1, file$9, 33, 32, 1014);
    			attr_dev(p2, "class", "sum svelte-ongc3q");
    			add_location(p2, file$9, 34, 32, 1097);
    			set_style(td, "background-color", "var(--fb)");
    			attr_dev(td, "class", "svelte-ongc3q");
    			add_location(td, file$9, 22, 28, 391);
    			attr_dev(tr, "class", "svelte-ongc3q");
    			add_location(tr, file$9, 21, 24, 357);
    			add_location(tbody, file$9, 20, 20, 324);
    			attr_dev(table, "class", "svelte-ongc3q");
    			add_location(table, file$9, 19, 16, 295);
    			attr_dev(div0, "class", "mn svelte-ongc3q");
    			add_location(div0, file$9, 15, 12, 255);
    			attr_dev(main, "class", "svelte-ongc3q");
    			add_location(main, file$9, 14, 8, 235);
    			attr_dev(div1, "class", "content svelte-ongc3q");
    			add_location(div1, file$9, 12, 4, 194);
    			attr_dev(article, "class", "svelte-ongc3q");
    			add_location(article, file$9, 10, 0, 177);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div1);
    			append_dev(div1, main);
    			append_dev(main, div0);
    			append_dev(div0, table);
    			append_dev(table, tbody);
    			append_dev(tbody, tr);
    			append_dev(tr, td);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(td, null);
    			}

    			append_dev(td, t0);
    			append_dev(td, p0);
    			append_dev(td, t2);
    			append_dev(td, h1);
    			append_dev(td, t4);
    			append_dev(td, p1);
    			append_dev(p1, t5);
    			append_dev(p1, t6);
    			append_dev(td, t7);
    			append_dev(td, p2);
    			append_dev(tbody, t10);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$data*/ 1) {
    				each_value_2 = /*$data*/ ctx[0].common;
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_2(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(td, t0);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_2.length;
    			}

    			if (dirty & /*$data*/ 1 && t5_value !== (t5_value = /*$data*/ ctx[0].courses.length + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*$data*/ 1) {
    				each_value = /*$data*/ ctx[0].courses;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$5(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$5(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let $data;
    	validate_store(data, "data");
    	component_subscribe($$self, data, $$value => $$invalidate(0, $data = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Info", slots, []);

    	let core = $data.courses.filter(items => {
    		return items.type == "CORE";
    	});

    	let len = core.length;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ data, core, len, $data });

    	$$self.$inject_state = $$props => {
    		if ("core" in $$props) core = $$props.core;
    		if ("len" in $$props) $$invalidate(1, len = $$props.len);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$data, len];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src\routes\todo.svelte generated by Svelte v3.38.2 */

    const { console: console_1$2 } = globals;
    const file$8 = "src\\routes\\todo.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (166:36) {#each listData as dt}
    function create_each_block$4(ctx) {
    	let tr0;
    	let td0;
    	let div1;
    	let h1;
    	let t0_value = /*dt*/ ctx[15].title + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*dt*/ ctx[15].date + "";
    	let t2;
    	let t3;
    	let p1;
    	let t4_value = /*dt*/ ctx[15].location + "";
    	let t4;
    	let t5;
    	let p2;
    	let t6_value = /*dt*/ ctx[15].startTime + "";
    	let t6;
    	let t7;
    	let div0;
    	let button;
    	let t9;
    	let tr1;
    	let td1;
    	let p3;
    	let t11;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			tr0 = element("tr");
    			td0 = element("td");
    			div1 = element("div");
    			h1 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			p1 = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			p2 = element("p");
    			t6 = text(t6_value);
    			t7 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "DELETE";
    			t9 = space();
    			tr1 = element("tr");
    			td1 = element("td");
    			p3 = element("p");
    			p3.textContent = "____";
    			t11 = space();
    			attr_dev(h1, "class", "svelte-nf2zsb");
    			add_location(h1, file$8, 170, 52, 4686);
    			set_style(p0, "text-align", "end");
    			set_style(p0, "color", "var(--bl)");
    			set_style(p0, "font-weight", "700");
    			set_style(p0, "font-size", "0.9rem");
    			attr_dev(p0, "class", "svelte-nf2zsb");
    			add_location(p0, file$8, 171, 52, 4759);
    			attr_dev(p1, "class", "svelte-nf2zsb");
    			add_location(p1, file$8, 172, 52, 4905);
    			attr_dev(p2, "class", "svelte-nf2zsb");
    			add_location(p2, file$8, 173, 52, 4979);
    			attr_dev(button, "class", "svelte-nf2zsb");
    			add_location(button, file$8, 175, 56, 5129);
    			attr_dev(div0, "class", "del svelte-nf2zsb");
    			add_location(div0, file$8, 174, 52, 5054);
    			attr_dev(div1, "class", "row svelte-nf2zsb");
    			add_location(div1, file$8, 168, 48, 4613);
    			add_location(td0, file$8, 167, 44, 4559);
    			add_location(tr0, file$8, 166, 36, 4509);
    			set_style(p3, "padding", "0");
    			set_style(p3, "margin", "0");
    			attr_dev(p3, "class", "svelte-nf2zsb");
    			add_location(p3, file$8, 185, 44, 5676);
    			add_location(td1, file$8, 184, 40, 5626);
    			set_style(tr1, "opacity", "0");
    			add_location(tr1, file$8, 183, 36, 5562);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr0, anchor);
    			append_dev(tr0, td0);
    			append_dev(td0, div1);
    			append_dev(div1, h1);
    			append_dev(h1, t0);
    			append_dev(div1, t1);
    			append_dev(div1, p0);
    			append_dev(p0, t2);
    			append_dev(div1, t3);
    			append_dev(div1, p1);
    			append_dev(p1, t4);
    			append_dev(div1, t5);
    			append_dev(div1, p2);
    			append_dev(p2, t6);
    			append_dev(div1, t7);
    			append_dev(div1, div0);
    			append_dev(div0, button);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, tr1, anchor);
    			append_dev(tr1, td1);
    			append_dev(td1, p3);
    			append_dev(tr1, t11);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*dispatchdel*/ ctx[8](/*dt*/ ctx[15].id))) /*dispatchdel*/ ctx[8](/*dt*/ ctx[15].id).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*listData*/ 8 && t0_value !== (t0_value = /*dt*/ ctx[15].title + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*listData*/ 8 && t2_value !== (t2_value = /*dt*/ ctx[15].date + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*listData*/ 8 && t4_value !== (t4_value = /*dt*/ ctx[15].location + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*listData*/ 8 && t6_value !== (t6_value = /*dt*/ ctx[15].startTime + "")) set_data_dev(t6, t6_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr0);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(tr1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(166:36) {#each listData as dt}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let article;
    	let div15;
    	let div5;
    	let div4;
    	let header;
    	let div1;
    	let div0;
    	let button0;
    	let t1;
    	let main;
    	let div3;
    	let h1;
    	let t2;
    	let strong;
    	let t6;
    	let hr;
    	let t7;
    	let br;
    	let t8;
    	let div2;
    	let table;
    	let tbody;
    	let t9;
    	let div14;
    	let form;
    	let div13;
    	let div6;
    	let button1;
    	let t11;
    	let div7;
    	let p;
    	let t13;
    	let div12;
    	let div8;
    	let label0;
    	let t15;
    	let input0;
    	let t16;
    	let div9;
    	let label1;
    	let t18;
    	let input1;
    	let t19;
    	let div10;
    	let label2;
    	let input2;
    	let t21;
    	let div11;
    	let label3;
    	let button2;
    	let mounted;
    	let dispose;
    	let each_value = /*listData*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div15 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			header = element("header");
    			div1 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "SET REMINDER";
    			t1 = space();
    			main = element("main");
    			div3 = element("div");
    			h1 = element("h1");
    			t2 = text("reminders list ~ ");
    			strong = element("strong");
    			strong.textContent = `${/*date*/ ctx[6].getHours()} : ${/*date*/ ctx[6].getMinutes()}`;
    			t6 = space();
    			hr = element("hr");
    			t7 = space();
    			br = element("br");
    			t8 = space();
    			div2 = element("div");
    			table = element("table");
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t9 = space();
    			div14 = element("div");
    			form = element("form");
    			div13 = element("div");
    			div6 = element("div");
    			button1 = element("button");
    			button1.textContent = "CLOSE";
    			t11 = space();
    			div7 = element("div");
    			p = element("p");
    			p.textContent = "title field can not be empty ⚠";
    			t13 = space();
    			div12 = element("div");
    			div8 = element("div");
    			label0 = element("label");
    			label0.textContent = "title";
    			t15 = space();
    			input0 = element("input");
    			t16 = space();
    			div9 = element("div");
    			label1 = element("label");
    			label1.textContent = "start time";
    			t18 = space();
    			input1 = element("input");
    			t19 = space();
    			div10 = element("div");
    			label2 = element("label");
    			label2.textContent = "location";
    			input2 = element("input");
    			t21 = space();
    			div11 = element("div");
    			label3 = element("label");
    			label3.textContent = ". . .";
    			button2 = element("button");
    			button2.textContent = "SUBMIT";
    			attr_dev(button0, "class", "svelte-nf2zsb");
    			add_location(button0, file$8, 146, 28, 3645);
    			attr_dev(div0, "class", "add svelte-nf2zsb");
    			add_location(div0, file$8, 145, 24, 3598);
    			attr_dev(div1, "class", "head svelte-nf2zsb");
    			add_location(div1, file$8, 143, 20, 3528);
    			add_location(header, file$8, 142, 16, 3498);
    			add_location(strong, file$8, 159, 45, 4165);
    			attr_dev(h1, "class", "svelte-nf2zsb");
    			add_location(h1, file$8, 159, 24, 4144);
    			add_location(hr, file$8, 160, 24, 4254);
    			add_location(br, file$8, 161, 24, 4284);
    			add_location(tbody, file$8, 164, 32, 4404);
    			attr_dev(table, "class", "svelte-nf2zsb");
    			add_location(table, file$8, 163, 28, 4363);
    			attr_dev(div2, "class", "table");
    			add_location(div2, file$8, 162, 24, 4314);
    			attr_dev(div3, "class", "mn svelte-nf2zsb");
    			add_location(div3, file$8, 158, 20, 4102);
    			attr_dev(main, "class", "svelte-nf2zsb");
    			add_location(main, file$8, 157, 16, 4074);
    			attr_dev(div4, "class", "cnt");
    			add_location(div4, file$8, 141, 12, 3463);
    			attr_dev(div5, "class", "content");
    			add_location(div5, file$8, 140, 8, 3428);
    			attr_dev(button1, "class", "svelte-nf2zsb");
    			add_location(button1, file$8, 204, 24, 6235);
    			attr_dev(div6, "class", "close svelte-nf2zsb");
    			add_location(div6, file$8, 203, 20, 6190);
    			attr_dev(p, "class", "svelte-nf2zsb");
    			add_location(p, file$8, 212, 57, 6588);
    			attr_dev(div7, "class", "msg svelte-nf2zsb");
    			toggle_class(div7, "error", /*error*/ ctx[5]);
    			add_location(div7, file$8, 212, 20, 6551);
    			attr_dev(label0, "for", "title");
    			attr_dev(label0, "class", "svelte-nf2zsb");
    			add_location(label0, file$8, 215, 43, 6736);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "class", "svelte-nf2zsb");
    			add_location(input0, file$8, 215, 84, 6777);
    			attr_dev(div8, "class", "title");
    			add_location(div8, file$8, 215, 24, 6717);
    			attr_dev(label1, "for", "time");
    			attr_dev(label1, "class", "svelte-nf2zsb");
    			add_location(label1, file$8, 216, 42, 6862);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "class", "svelte-nf2zsb");
    			add_location(input1, file$8, 216, 84, 6904);
    			attr_dev(div9, "class", "time");
    			add_location(div9, file$8, 216, 24, 6844);
    			attr_dev(label2, "for", "location");
    			attr_dev(label2, "class", "svelte-nf2zsb");
    			add_location(label2, file$8, 217, 46, 6993);
    			attr_dev(input2, "type", "text");
    			attr_dev(input2, "class", "svelte-nf2zsb");
    			add_location(input2, file$8, 217, 84, 7031);
    			attr_dev(div10, "class", "location");
    			add_location(div10, file$8, 217, 24, 6971);
    			attr_dev(label3, "for", "submit");
    			attr_dev(label3, "class", "svelte-nf2zsb");
    			add_location(label3, file$8, 218, 44, 7118);
    			attr_dev(button2, "type", "submit");
    			attr_dev(button2, "class", "svelte-nf2zsb");
    			add_location(button2, file$8, 218, 77, 7151);
    			attr_dev(div11, "class", "submit");
    			add_location(div11, file$8, 218, 24, 7098);
    			attr_dev(div12, "class", "fm svelte-nf2zsb");
    			add_location(div12, file$8, 214, 20, 6675);
    			attr_dev(div13, "class", "fm-cont svelte-nf2zsb");
    			add_location(div13, file$8, 200, 16, 6143);
    			attr_dev(form, "class", "svelte-nf2zsb");
    			add_location(form, file$8, 199, 12, 6118);
    			attr_dev(div14, "class", "form svelte-nf2zsb");
    			toggle_class(div14, "toggle", /*toggle*/ ctx[4]);
    			add_location(div14, file$8, 198, 8, 6064);
    			attr_dev(div15, "class", "todo svelte-nf2zsb");
    			add_location(div15, file$8, 139, 4, 3400);
    			attr_dev(article, "class", "svelte-nf2zsb");
    			add_location(article, file$8, 137, 0, 3380);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div15);
    			append_dev(div15, div5);
    			append_dev(div5, div4);
    			append_dev(div4, header);
    			append_dev(header, div1);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div4, t1);
    			append_dev(div4, main);
    			append_dev(main, div3);
    			append_dev(div3, h1);
    			append_dev(h1, t2);
    			append_dev(h1, strong);
    			append_dev(div3, t6);
    			append_dev(div3, hr);
    			append_dev(div3, t7);
    			append_dev(div3, br);
    			append_dev(div3, t8);
    			append_dev(div3, div2);
    			append_dev(div2, table);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			append_dev(div15, t9);
    			append_dev(div15, div14);
    			append_dev(div14, form);
    			append_dev(form, div13);
    			append_dev(div13, div6);
    			append_dev(div6, button1);
    			append_dev(div13, t11);
    			append_dev(div13, div7);
    			append_dev(div7, p);
    			append_dev(div13, t13);
    			append_dev(div13, div12);
    			append_dev(div12, div8);
    			append_dev(div8, label0);
    			append_dev(div8, t15);
    			append_dev(div8, input0);
    			set_input_value(input0, /*ti*/ ctx[0]);
    			append_dev(div12, t16);
    			append_dev(div12, div9);
    			append_dev(div9, label1);
    			append_dev(div9, t18);
    			append_dev(div9, input1);
    			set_input_value(input1, /*st*/ ctx[1]);
    			append_dev(div12, t19);
    			append_dev(div12, div10);
    			append_dev(div10, label2);
    			append_dev(div10, input2);
    			set_input_value(input2, /*lc*/ ctx[2]);
    			append_dev(div12, t21);
    			append_dev(div12, div11);
    			append_dev(div11, label3);
    			append_dev(div11, button2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*click_handler*/ ctx[9], false, false, false),
    					listen_dev(button1, "click", /*click_handler_1*/ ctx[10], false, false, false),
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[11]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[12]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[13]),
    					listen_dev(button2, "click", /*submit*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*dispatchdel, listData*/ 264) {
    				each_value = /*listData*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(tbody, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*error*/ 32) {
    				toggle_class(div7, "error", /*error*/ ctx[5]);
    			}

    			if (dirty & /*ti*/ 1 && input0.value !== /*ti*/ ctx[0]) {
    				set_input_value(input0, /*ti*/ ctx[0]);
    			}

    			if (dirty & /*st*/ 2 && input1.value !== /*st*/ ctx[1]) {
    				set_input_value(input1, /*st*/ ctx[1]);
    			}

    			if (dirty & /*lc*/ 4 && input2.value !== /*lc*/ ctx[2]) {
    				set_input_value(input2, /*lc*/ ctx[2]);
    			}

    			if (dirty & /*toggle*/ 16) {
    				toggle_class(div14, "toggle", /*toggle*/ ctx[4]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const key$1 = "BUTAO-LTA-V1.2.1";

    function instance$9($$self, $$props, $$invalidate) {
    	let toggle;
    	let error;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Todo", slots, []);
    	let date = new Date();
    	let ti = "";
    	let st = "";
    	let lc = "";

    	class ReminderObj {
    		constructor(ti, st, lc) {
    			this.id = `${this.uuid()}-${this.uuid()}`;
    			this.date = this.date();
    			this.title = ti;
    			this.startTime = st;
    			this.location = lc;
    		}

    		date() {
    			const dateIn = new Date();
    			return dateIn.toLocaleDateString();
    		}

    		uuid() {
    			const str1 = "abcdefghijklm";
    			const num1 = Math.floor(Math.random() * 13);
    			const strNum1 = num1 - 1;
    			const subStr1 = str1.substring(strNum1, num1);
    			const idNum1 = Math.floor(Math.random() * 9);
    			const str = "nopqrstuvwxyz";
    			const num = Math.floor(Math.random() * 13);
    			const strNum = num - 1;
    			const subStr = str.substring(strNum, num);
    			const idNum = Math.floor(Math.random() * 9);
    			const id = `${subStr1}${idNum1}${subStr}${idNum}`;

    			if (id.length == 3) {
    				const num2 = `${Math.floor(Math.random() * 9)}`;
    				const idMod = id + num2;
    				return idMod;
    			} else if (id.length == 2) {
    				const numM1 = `${Math.floor(Math.random() * 9)}`;
    				const numM2 = `${Math.floor(Math.random() * 9)}`;
    				const idMod2 = id + numM1 + numM2;
    				return idMod2;
    			} else {
    				return id;
    			}

    			
    		}
    	}

    	let listData = [];

    	if (localStorage.getItem(key$1) !== null) {
    		const localdata = localStorage.getItem(key$1);
    		const newdata = JSON.parse(localdata);
    		listData = [...newdata];
    	}

    	function submit(e) {
    		e.preventDefault();

    		if (st == "") {
    			$$invalidate(1, st = "00:00 🕒");
    		}

    		

    		if (lc == "") {
    			$$invalidate(2, lc = "unset location 📍");
    		}

    		const data = new ReminderObj(ti, st, lc);
    		console.log(data);

    		if (ti == "") {
    			$$invalidate(5, error = true);

    			setTimeout(
    				() => {
    					$$invalidate(5, error = false);
    				},
    				5000
    			);
    		}

    		

    		if (ti !== "") {
    			if (localStorage.getItem(key$1) === null) {
    				$$invalidate(3, listData = [...listData, data]);
    				localStorage.setItem(key$1, JSON.stringify(listData));
    			} else {
    				$$invalidate(3, listData = JSON.parse(localStorage.getItem(key$1)));
    				$$invalidate(3, listData = [...listData, data]);
    				localStorage.setItem(key$1, JSON.stringify(listData));
    			}

    			$$invalidate(0, ti = "");
    		}

    		
    	}

    	function dispatchdel(e) {
    		console.log(e + "deleted");
    		$$invalidate(3, listData = JSON.parse(localStorage.getItem(key$1)));

    		const newListData = listData.filter(item => {
    			return item.id !== e;
    		});

    		localStorage.setItem(key$1, JSON.stringify(newListData));
    		$$invalidate(3, listData = [...newListData]);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Todo> was created with unknown prop '${key}'`);
    	});

    	const click_handler = e => {
    		e.preventDefault();
    		$$invalidate(4, toggle = !toggle);
    	};

    	const click_handler_1 = e => {
    		e.preventDefault();
    		$$invalidate(4, toggle = !toggle);
    	};

    	function input0_input_handler() {
    		ti = this.value;
    		$$invalidate(0, ti);
    	}

    	function input1_input_handler() {
    		st = this.value;
    		$$invalidate(1, st);
    	}

    	function input2_input_handler() {
    		lc = this.value;
    		$$invalidate(2, lc);
    	}

    	$$self.$capture_state = () => ({
    		date,
    		ti,
    		st,
    		lc,
    		ReminderObj,
    		key: key$1,
    		listData,
    		submit,
    		dispatchdel,
    		toggle,
    		error
    	});

    	$$self.$inject_state = $$props => {
    		if ("date" in $$props) $$invalidate(6, date = $$props.date);
    		if ("ti" in $$props) $$invalidate(0, ti = $$props.ti);
    		if ("st" in $$props) $$invalidate(1, st = $$props.st);
    		if ("lc" in $$props) $$invalidate(2, lc = $$props.lc);
    		if ("listData" in $$props) $$invalidate(3, listData = $$props.listData);
    		if ("toggle" in $$props) $$invalidate(4, toggle = $$props.toggle);
    		if ("error" in $$props) $$invalidate(5, error = $$props.error);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(4, toggle = false);
    	$$invalidate(5, error = false);

    	return [
    		ti,
    		st,
    		lc,
    		listData,
    		toggle,
    		error,
    		date,
    		submit,
    		dispatchdel,
    		click_handler,
    		click_handler_1,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler
    	];
    }

    class Todo extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Todo",
    			options,
    			id: create_fragment$9.name
    		});
    	}
    }

    /* src\pages\about.svelte generated by Svelte v3.38.2 */
    const file$7 = "src\\pages\\about.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[1] = list[i];
    	return child_ctx;
    }

    // (50:24) {#each $data.message as dt}
    function create_each_block$3(ctx) {
    	let p;
    	let raw_value = /*dt*/ ctx[1].messages + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "instruct svelte-1hkttt4");
    			add_location(p, file$7, 50, 24, 3569);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 1 && raw_value !== (raw_value = /*dt*/ ctx[1].messages + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(50:24) {#each $data.message as dt}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let article;
    	let div4;
    	let header;
    	let div2;
    	let a0;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div1;
    	let h10;
    	let t1_value = /*$data*/ ctx[0].common[0].programme + "";
    	let t1;
    	let t2;
    	let t3;
    	let h2;
    	let t4;
    	let t5_value = /*$data*/ ctx[0].common[0].version + "";
    	let t5;
    	let t6;
    	let p0;
    	let t8;
    	let p1;
    	let t10;
    	let p2;
    	let a1;
    	let t12;
    	let hr;
    	let t13;
    	let p3;
    	let t15;
    	let main;
    	let div3;
    	let ul0;
    	let li0;
    	let h11;
    	let t17;
    	let li1;
    	let a2;
    	let t19;
    	let ul1;
    	let li2;
    	let h12;
    	let t21;
    	let p4;
    	let t23;
    	let li3;
    	let a3;
    	let t25;
    	let li4;
    	let a4;
    	let t27;
    	let li5;
    	let a5;
    	let t29;
    	let ul2;
    	let li6;
    	let h13;
    	let t31;
    	let li7;
    	let svg;
    	let defs;
    	let clipPath;
    	let rect0;
    	let linearGradient;
    	let stop0;
    	let stop1;
    	let stop2;
    	let g5;
    	let g0;
    	let path0;
    	let rect1;
    	let g1;
    	let path1;
    	let rect2;
    	let g2;
    	let path2;
    	let rect3;
    	let g3;
    	let path3;
    	let rect4;
    	let g4;
    	let path4;
    	let rect5;
    	let t32;
    	let ul3;
    	let li8;
    	let h14;
    	let t34;
    	let li9;
    	let each_value = /*$data*/ ctx[0].message;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div4 = element("div");
    			header = element("header");
    			div2 = element("div");
    			a0 = element("a");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div1 = element("div");
    			h10 = element("h1");
    			t1 = text(t1_value);
    			t2 = text(" TIME TABLE");
    			t3 = space();
    			h2 = element("h2");
    			t4 = text("VERSION ");
    			t5 = text(t5_value);
    			t6 = space();
    			p0 = element("p");
    			p0.textContent = "© COPYRIGHT | 2021 BUTAO PETER";
    			t8 = space();
    			p1 = element("p");
    			p1.textContent = "in association with";
    			t10 = space();
    			p2 = element("p");
    			a1 = element("a");
    			a1.textContent = "DEVELOPER AFRICA | 2022";
    			t12 = space();
    			hr = element("hr");
    			t13 = space();
    			p3 = element("p");
    			p3.textContent = "MAKA HOUSE 🐼 | 2022";
    			t15 = space();
    			main = element("main");
    			div3 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			h11 = element("h1");
    			h11.textContent = "APP INFO";
    			t17 = space();
    			li1 = element("li");
    			a2 = element("a");
    			a2.textContent = "Licence";
    			t19 = space();
    			ul1 = element("ul");
    			li2 = element("li");
    			h12 = element("h1");
    			h12.textContent = "DEV";
    			t21 = space();
    			p4 = element("p");
    			p4.textContent = "get in touch with the development team";
    			t23 = space();
    			li3 = element("li");
    			a3 = element("a");
    			a3.textContent = "peterethanbutao@gmail.com";
    			t25 = space();
    			li4 = element("li");
    			a4 = element("a");
    			a4.textContent = "peterbutao.netlify.app";
    			t27 = space();
    			li5 = element("li");
    			a5 = element("a");
    			a5.textContent = "0880164455";
    			t29 = space();
    			ul2 = element("ul");
    			li6 = element("li");
    			h13 = element("h1");
    			h13.textContent = "RATING";
    			t31 = space();
    			li7 = element("li");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect0 = svg_element("rect");
    			linearGradient = svg_element("linearGradient");
    			stop0 = svg_element("stop");
    			stop1 = svg_element("stop");
    			stop2 = svg_element("stop");
    			g5 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			rect1 = svg_element("rect");
    			g1 = svg_element("g");
    			path1 = svg_element("path");
    			rect2 = svg_element("rect");
    			g2 = svg_element("g");
    			path2 = svg_element("path");
    			rect3 = svg_element("rect");
    			g3 = svg_element("g");
    			path3 = svg_element("path");
    			rect4 = svg_element("rect");
    			g4 = svg_element("g");
    			path4 = svg_element("path");
    			rect5 = svg_element("rect");
    			t32 = space();
    			ul3 = element("ul");
    			li8 = element("li");
    			h14 = element("h1");
    			h14.textContent = "READ ME";
    			t34 = space();
    			li9 = element("li");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (img.src !== (img_src_value = "assets/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "width", "60px");
    			attr_dev(img, "alt", "logo");
    			add_location(img, file$7, 10, 24, 273);
    			attr_dev(div0, "class", "logo");
    			add_location(div0, file$7, 9, 20, 229);
    			attr_dev(a0, "href", "/#/");
    			attr_dev(a0, "class", "svelte-1hkttt4");
    			add_location(a0, file$7, 8, 16, 177);
    			attr_dev(h10, "class", "svelte-1hkttt4");
    			add_location(h10, file$7, 14, 20, 440);
    			attr_dev(h2, "class", "svelte-1hkttt4");
    			add_location(h2, file$7, 15, 20, 509);
    			attr_dev(p0, "class", "svelte-1hkttt4");
    			add_location(p0, file$7, 16, 20, 573);
    			attr_dev(p1, "class", "svelte-1hkttt4");
    			add_location(p1, file$7, 17, 20, 632);
    			attr_dev(a1, "href", "https://developerafrica,netlify.app");
    			attr_dev(a1, "class", "svelte-1hkttt4");
    			add_location(a1, file$7, 19, 24, 709);
    			attr_dev(p2, "class", "svelte-1hkttt4");
    			add_location(p2, file$7, 18, 20, 680);
    			add_location(hr, file$7, 21, 20, 830);
    			attr_dev(p3, "class", "svelte-1hkttt4");
    			add_location(p3, file$7, 22, 20, 856);
    			attr_dev(div1, "class", "head-content");
    			add_location(div1, file$7, 13, 16, 392);
    			attr_dev(div2, "class", "head svelte-1hkttt4");
    			add_location(div2, file$7, 7, 12, 141);
    			add_location(header, file$7, 6, 8, 119);
    			attr_dev(h11, "class", "svelte-1hkttt4");
    			add_location(h11, file$7, 31, 24, 1046);
    			attr_dev(li0, "class", "svelte-1hkttt4");
    			add_location(li0, file$7, 31, 20, 1042);
    			attr_dev(a2, "href", "./info/licence.html");
    			attr_dev(a2, "class", "svelte-1hkttt4");
    			add_location(a2, file$7, 33, 24, 1172);
    			attr_dev(li1, "class", "svelte-1hkttt4");
    			add_location(li1, file$7, 33, 20, 1168);
    			attr_dev(ul0, "class", "svelte-1hkttt4");
    			add_location(ul0, file$7, 30, 16, 1016);
    			attr_dev(h12, "class", "svelte-1hkttt4");
    			add_location(h12, file$7, 36, 24, 1289);
    			attr_dev(li2, "class", "svelte-1hkttt4");
    			add_location(li2, file$7, 36, 20, 1285);
    			attr_dev(p4, "class", "notfy svelte-1hkttt4");
    			add_location(p4, file$7, 37, 20, 1328);
    			attr_dev(a3, "href", "mailto://peterethanbutao@gmail.com");
    			attr_dev(a3, "class", "svelte-1hkttt4");
    			add_location(a3, file$7, 38, 24, 1414);
    			attr_dev(li3, "class", "svelte-1hkttt4");
    			add_location(li3, file$7, 38, 20, 1410);
    			attr_dev(a4, "href", "https://www.butaopeter.netlify.app");
    			attr_dev(a4, "class", "svelte-1hkttt4");
    			add_location(a4, file$7, 39, 24, 1519);
    			attr_dev(li4, "class", "svelte-1hkttt4");
    			add_location(li4, file$7, 39, 20, 1515);
    			attr_dev(a5, "href", "tel://0880164455");
    			attr_dev(a5, "class", "svelte-1hkttt4");
    			add_location(a5, file$7, 40, 24, 1621);
    			attr_dev(li5, "class", "svelte-1hkttt4");
    			add_location(li5, file$7, 40, 20, 1617);
    			attr_dev(ul1, "class", "svelte-1hkttt4");
    			add_location(ul1, file$7, 35, 16, 1259);
    			attr_dev(h13, "class", "svelte-1hkttt4");
    			add_location(h13, file$7, 43, 24, 1738);
    			attr_dev(li6, "class", "svelte-1hkttt4");
    			add_location(li6, file$7, 43, 20, 1734);
    			attr_dev(rect0, "width", "16");
    			attr_dev(rect0, "height", "16");
    			attr_dev(rect0, "fill", "none");
    			add_location(rect0, file$7, 44, 175, 1935);
    			attr_dev(clipPath, "id", "a");
    			add_location(clipPath, file$7, 44, 158, 1918);
    			attr_dev(stop0, "offset", "0");
    			attr_dev(stop0, "stop-color", "#2699fb");
    			add_location(stop0, file$7, 44, 328, 2088);
    			attr_dev(stop1, "offset", "0.498");
    			attr_dev(stop1, "stop-color", "#175b95");
    			add_location(stop1, file$7, 44, 367, 2127);
    			attr_dev(stop2, "offset", "1");
    			add_location(stop2, file$7, 44, 410, 2170);
    			attr_dev(linearGradient, "id", "e");
    			attr_dev(linearGradient, "x1", "0.124");
    			attr_dev(linearGradient, "y1", "0.42");
    			attr_dev(linearGradient, "x2", "0.544");
    			attr_dev(linearGradient, "y2", "0.454");
    			attr_dev(linearGradient, "gradientUnits", "objectBoundingBox");
    			add_location(linearGradient, file$7, 44, 228, 1988);
    			add_location(defs, file$7, 44, 152, 1912);
    			attr_dev(path0, "d", "M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z");
    			attr_dev(path0, "fill", "#2699fb");
    			add_location(path0, file$7, 44, 555, 2315);
    			attr_dev(rect1, "width", "16");
    			attr_dev(rect1, "height", "16");
    			attr_dev(rect1, "transform", "translate(0 0)");
    			attr_dev(rect1, "fill", "none");
    			add_location(rect1, file$7, 44, 647, 2407);
    			attr_dev(g0, "transform", "translate(54 618)");
    			attr_dev(g0, "clip-path", "url(#a)");
    			add_location(g0, file$7, 44, 502, 2262);
    			attr_dev(path1, "d", "M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z");
    			attr_dev(path1, "fill", "#2699fb");
    			add_location(path1, file$7, 44, 773, 2533);
    			attr_dev(rect2, "width", "16");
    			attr_dev(rect2, "height", "16");
    			attr_dev(rect2, "transform", "translate(0 0)");
    			attr_dev(rect2, "fill", "none");
    			add_location(rect2, file$7, 44, 865, 2625);
    			attr_dev(g1, "transform", "translate(78 618)");
    			attr_dev(g1, "clip-path", "url(#a)");
    			add_location(g1, file$7, 44, 720, 2480);
    			attr_dev(path2, "d", "M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z");
    			attr_dev(path2, "fill", "#2699fb");
    			add_location(path2, file$7, 44, 992, 2752);
    			attr_dev(rect3, "width", "16");
    			attr_dev(rect3, "height", "16");
    			attr_dev(rect3, "transform", "translate(0 0)");
    			attr_dev(rect3, "fill", "none");
    			add_location(rect3, file$7, 44, 1084, 2844);
    			attr_dev(g2, "transform", "translate(102 618)");
    			attr_dev(g2, "clip-path", "url(#a)");
    			add_location(g2, file$7, 44, 938, 2698);
    			attr_dev(path3, "d", "M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z");
    			attr_dev(path3, "fill", "url(#e)");
    			add_location(path3, file$7, 44, 1211, 2971);
    			attr_dev(rect4, "width", "16");
    			attr_dev(rect4, "height", "16");
    			attr_dev(rect4, "transform", "translate(0 0)");
    			attr_dev(rect4, "fill", "none");
    			add_location(rect4, file$7, 44, 1303, 3063);
    			attr_dev(g3, "transform", "translate(126 618)");
    			attr_dev(g3, "clip-path", "url(#a)");
    			add_location(g3, file$7, 44, 1157, 2917);
    			attr_dev(path4, "d", "M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z");
    			add_location(path4, file$7, 44, 1430, 3190);
    			attr_dev(rect5, "width", "16");
    			attr_dev(rect5, "height", "16");
    			attr_dev(rect5, "transform", "translate(0 0)");
    			attr_dev(rect5, "fill", "none");
    			add_location(rect5, file$7, 44, 1507, 3267);
    			attr_dev(g4, "transform", "translate(150 618)");
    			attr_dev(g4, "clip-path", "url(#a)");
    			add_location(g4, file$7, 44, 1376, 3136);
    			attr_dev(g5, "transform", "translate(-54 -618)");
    			attr_dev(g5, "opacity", "0.52");
    			add_location(g5, file$7, 44, 452, 2212);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "112");
    			attr_dev(svg, "height", "16");
    			attr_dev(svg, "viewBox", "0 0 112 16");
    			attr_dev(svg, "class", "svelte-1hkttt4");
    			add_location(svg, file$7, 44, 24, 1784);
    			attr_dev(li7, "class", "svelte-1hkttt4");
    			add_location(li7, file$7, 44, 20, 1780);
    			attr_dev(ul2, "class", "svelte-1hkttt4");
    			add_location(ul2, file$7, 42, 16, 1708);
    			attr_dev(h14, "class", "svelte-1hkttt4");
    			add_location(h14, file$7, 47, 24, 3426);
    			attr_dev(li8, "class", "svelte-1hkttt4");
    			add_location(li8, file$7, 47, 20, 3422);
    			attr_dev(li9, "class", "inst-msg svelte-1hkttt4");
    			add_location(li9, file$7, 48, 20, 3469);
    			attr_dev(ul3, "class", "svelte-1hkttt4");
    			add_location(ul3, file$7, 46, 16, 3396);
    			attr_dev(div3, "class", "main");
    			add_location(div3, file$7, 28, 12, 978);
    			add_location(main, file$7, 27, 8, 958);
    			attr_dev(div4, "class", "content svelte-1hkttt4");
    			add_location(div4, file$7, 5, 4, 88);
    			attr_dev(article, "class", "svelte-1hkttt4");
    			add_location(article, file$7, 4, 0, 73);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div4);
    			append_dev(div4, header);
    			append_dev(header, div2);
    			append_dev(div2, a0);
    			append_dev(a0, div0);
    			append_dev(div0, img);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, h10);
    			append_dev(h10, t1);
    			append_dev(h10, t2);
    			append_dev(div1, t3);
    			append_dev(div1, h2);
    			append_dev(h2, t4);
    			append_dev(h2, t5);
    			append_dev(div1, t6);
    			append_dev(div1, p0);
    			append_dev(div1, t8);
    			append_dev(div1, p1);
    			append_dev(div1, t10);
    			append_dev(div1, p2);
    			append_dev(p2, a1);
    			append_dev(div1, t12);
    			append_dev(div1, hr);
    			append_dev(div1, t13);
    			append_dev(div1, p3);
    			append_dev(div4, t15);
    			append_dev(div4, main);
    			append_dev(main, div3);
    			append_dev(div3, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, h11);
    			append_dev(ul0, t17);
    			append_dev(ul0, li1);
    			append_dev(li1, a2);
    			append_dev(div3, t19);
    			append_dev(div3, ul1);
    			append_dev(ul1, li2);
    			append_dev(li2, h12);
    			append_dev(ul1, t21);
    			append_dev(ul1, p4);
    			append_dev(ul1, t23);
    			append_dev(ul1, li3);
    			append_dev(li3, a3);
    			append_dev(ul1, t25);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(ul1, t27);
    			append_dev(ul1, li5);
    			append_dev(li5, a5);
    			append_dev(div3, t29);
    			append_dev(div3, ul2);
    			append_dev(ul2, li6);
    			append_dev(li6, h13);
    			append_dev(ul2, t31);
    			append_dev(ul2, li7);
    			append_dev(li7, svg);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect0);
    			append_dev(defs, linearGradient);
    			append_dev(linearGradient, stop0);
    			append_dev(linearGradient, stop1);
    			append_dev(linearGradient, stop2);
    			append_dev(svg, g5);
    			append_dev(g5, g0);
    			append_dev(g0, path0);
    			append_dev(g0, rect1);
    			append_dev(g5, g1);
    			append_dev(g1, path1);
    			append_dev(g1, rect2);
    			append_dev(g5, g2);
    			append_dev(g2, path2);
    			append_dev(g2, rect3);
    			append_dev(g5, g3);
    			append_dev(g3, path3);
    			append_dev(g3, rect4);
    			append_dev(g5, g4);
    			append_dev(g4, path4);
    			append_dev(g4, rect5);
    			append_dev(div3, t32);
    			append_dev(div3, ul3);
    			append_dev(ul3, li8);
    			append_dev(li8, h14);
    			append_dev(ul3, t34);
    			append_dev(ul3, li9);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(li9, null);
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$data*/ 1 && t1_value !== (t1_value = /*$data*/ ctx[0].common[0].programme + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*$data*/ 1 && t5_value !== (t5_value = /*$data*/ ctx[0].common[0].version + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*$data*/ 1) {
    				each_value = /*$data*/ ctx[0].message;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(li9, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $data;
    	validate_store(data, "data");
    	component_subscribe($$self, data, $$value => $$invalidate(0, $data = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("About", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<About> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ data, $data });
    	return [$data];
    }

    class About extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "About",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    function cubicInOut(t) {
        return t < 0.5 ? 4.0 * t * t * t : 0.5 * Math.pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    function blur(node, { delay = 0, duration = 400, easing = cubicInOut, amount = 5, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const f = style.filter === 'none' ? '' : style.filter;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `opacity: ${target_opacity - (od * u)}; filter: ${f} blur(${u * amount}px);`
        };
    }

    /* node_modules\svelte-carousel\src\components\Dot\Dot.svelte generated by Svelte v3.38.2 */

    const file$6 = "node_modules\\svelte-carousel\\src\\components\\Dot\\Dot.svelte";

    function create_fragment$7(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "sc-carousel-dot__dot svelte-1uelw0b");
    			toggle_class(div, "sc-carousel-dot__dot_active", /*active*/ ctx[0]);
    			add_location(div, file$6, 7, 0, 99);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*active*/ 1) {
    				toggle_class(div, "sc-carousel-dot__dot_active", /*active*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dot", slots, []);
    	let { active = false } = $$props;
    	const writable_props = ["active"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dot> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	$$self.$capture_state = () => ({ active });

    	$$self.$inject_state = $$props => {
    		if ("active" in $$props) $$invalidate(0, active = $$props.active);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [active, click_handler];
    }

    class Dot extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { active: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dot",
    			options,
    			id: create_fragment$7.name
    		});
    	}

    	get active() {
    		throw new Error("<Dot>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set active(value) {
    		throw new Error("<Dot>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-carousel\src\components\Dots\Dots.svelte generated by Svelte v3.38.2 */
    const file$5 = "node_modules\\svelte-carousel\\src\\components\\Dots\\Dots.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (23:2) {#each Array(pagesCount) as _, pageIndex (pageIndex)}
    function create_each_block$2(key_1, ctx) {
    	let div;
    	let dot;
    	let t;
    	let current;

    	function click_handler() {
    		return /*click_handler*/ ctx[3](/*pageIndex*/ ctx[7]);
    	}

    	dot = new Dot({
    			props: {
    				active: /*currentPageIndex*/ ctx[1] === /*pageIndex*/ ctx[7]
    			},
    			$$inline: true
    		});

    	dot.$on("click", click_handler);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			create_component(dot.$$.fragment);
    			t = space();
    			attr_dev(div, "class", "sc-carousel-dots__dot-container svelte-1oj5bge");
    			add_location(div, file$5, 23, 4, 515);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(dot, div, null);
    			append_dev(div, t);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const dot_changes = {};
    			if (dirty & /*currentPageIndex, pagesCount*/ 3) dot_changes.active = /*currentPageIndex*/ ctx[1] === /*pageIndex*/ ctx[7];
    			dot.$set(dot_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dot.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dot.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(dot);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(23:2) {#each Array(pagesCount) as _, pageIndex (pageIndex)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let each_value = Array(/*pagesCount*/ ctx[0]);
    	validate_each_argument(each_value);
    	const get_key = ctx => /*pageIndex*/ ctx[7];
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "sc-carousel-dots__container svelte-1oj5bge");
    			add_location(div, file$5, 21, 0, 411);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*currentPageIndex, Array, pagesCount, handleDotClick*/ 7) {
    				each_value = Array(/*pagesCount*/ ctx[0]);
    				validate_each_argument(each_value);
    				group_outros();
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$2, null, get_each_context$2);
    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Dots", slots, []);
    	const dispatch = createEventDispatcher();
    	let { pagesCount = 1 } = $$props;
    	let { currentPageIndex = 0 } = $$props;

    	function handleDotClick(pageIndex) {
    		dispatch("pageChange", pageIndex);
    	}

    	const writable_props = ["pagesCount", "currentPageIndex"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dots> was created with unknown prop '${key}'`);
    	});

    	const click_handler = pageIndex => handleDotClick(pageIndex);

    	$$self.$$set = $$props => {
    		if ("pagesCount" in $$props) $$invalidate(0, pagesCount = $$props.pagesCount);
    		if ("currentPageIndex" in $$props) $$invalidate(1, currentPageIndex = $$props.currentPageIndex);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		Dot,
    		dispatch,
    		pagesCount,
    		currentPageIndex,
    		handleDotClick
    	});

    	$$self.$inject_state = $$props => {
    		if ("pagesCount" in $$props) $$invalidate(0, pagesCount = $$props.pagesCount);
    		if ("currentPageIndex" in $$props) $$invalidate(1, currentPageIndex = $$props.currentPageIndex);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [pagesCount, currentPageIndex, handleDotClick, click_handler];
    }

    class Dots extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { pagesCount: 0, currentPageIndex: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dots",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get pagesCount() {
    		throw new Error("<Dots>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pagesCount(value) {
    		throw new Error("<Dots>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get currentPageIndex() {
    		throw new Error("<Dots>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentPageIndex(value) {
    		throw new Error("<Dots>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const PREV = 'prev';
    const NEXT = 'next';

    /* node_modules\svelte-carousel\src\components\Arrow\Arrow.svelte generated by Svelte v3.38.2 */
    const file$4 = "node_modules\\svelte-carousel\\src\\components\\Arrow\\Arrow.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let i;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			attr_dev(i, "class", "sc-carousel-arrow__arrow svelte-9ztt4p");
    			toggle_class(i, "sc-carousel-arrow__arrow-next", /*direction*/ ctx[0] === NEXT);
    			toggle_class(i, "sc-carousel-arrow__arrow-prev", /*direction*/ ctx[0] === PREV);
    			add_location(i, file$4, 19, 2, 371);
    			attr_dev(div, "class", "sc-carousel-arrow__circle svelte-9ztt4p");
    			toggle_class(div, "sc-carousel-arrow__circle_disabled", /*disabled*/ ctx[1]);
    			add_location(div, file$4, 14, 0, 256);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*direction, NEXT*/ 1) {
    				toggle_class(i, "sc-carousel-arrow__arrow-next", /*direction*/ ctx[0] === NEXT);
    			}

    			if (dirty & /*direction, PREV*/ 1) {
    				toggle_class(i, "sc-carousel-arrow__arrow-prev", /*direction*/ ctx[0] === PREV);
    			}

    			if (dirty & /*disabled*/ 2) {
    				toggle_class(div, "sc-carousel-arrow__circle_disabled", /*disabled*/ ctx[1]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Arrow", slots, []);
    	let { direction = NEXT } = $$props;
    	let { disabled = false } = $$props;
    	const writable_props = ["direction", "disabled"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Arrow> was created with unknown prop '${key}'`);
    	});

    	function click_handler(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	$$self.$capture_state = () => ({ NEXT, PREV, direction, disabled });

    	$$self.$inject_state = $$props => {
    		if ("direction" in $$props) $$invalidate(0, direction = $$props.direction);
    		if ("disabled" in $$props) $$invalidate(1, disabled = $$props.disabled);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [direction, disabled, click_handler];
    }

    class Arrow extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { direction: 0, disabled: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Arrow",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get direction() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set direction(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get disabled() {
    		throw new Error("<Arrow>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set disabled(value) {
    		throw new Error("<Arrow>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* node_modules\svelte-carousel\src\components\Progress\Progress.svelte generated by Svelte v3.38.2 */

    const file$3 = "node_modules\\svelte-carousel\\src\\components\\Progress\\Progress.svelte";

    function create_fragment$4(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "sc-carousel-progress__indicator svelte-nuyenl");
    			set_style(div, "width", /*width*/ ctx[0] + "%");
    			add_location(div, file$3, 11, 0, 192);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*width*/ 1) {
    				set_style(div, "width", /*width*/ ctx[0] + "%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAX_PERCENT = 100;

    function instance$4($$self, $$props, $$invalidate) {
    	let width;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Progress", slots, []);
    	let { value = 0 } = $$props;
    	const writable_props = ["value"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Progress> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ MAX_PERCENT, value, width });

    	$$self.$inject_state = $$props => {
    		if ("value" in $$props) $$invalidate(1, value = $$props.value);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*value*/ 2) {
    			$$invalidate(0, width = Math.min(Math.max(value * MAX_PERCENT, 0), MAX_PERCENT));
    		}
    	};

    	return [width, value];
    }

    class Progress extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { value: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Progress",
    			options,
    			id: create_fragment$4.name
    		});
    	}

    	get value() {
    		throw new Error("<Progress>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Progress>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    // start event
    function addStartEventListener(source, cb) {
      source.addEventListener('mousedown', cb);
      source.addEventListener('touchstart', cb, { passive: true });
    }
    function removeStartEventListener(source, cb) {
      source.removeEventListener('mousedown', cb);
      source.removeEventListener('touchstart', cb);
    }

    // end event
    function addEndEventListener(source, cb) {
      source.addEventListener('mouseup', cb);
      source.addEventListener('touchend', cb);
    }
    function removeEndEventListener(source, cb) {
      source.removeEventListener('mouseup', cb);
      source.removeEventListener('touchend', cb);
    }

    // move event
    function addMoveEventListener(source, cb) {
      source.addEventListener('mousemove', cb);
      source.addEventListener('touchmove', cb);
    }
    function removeMoveEventListener(source, cb) {
      source.removeEventListener('mousemove', cb);
      source.removeEventListener('touchmove', cb);
    }

    function createDispatcher(source) {
      return function (event, data) {
        source.dispatchEvent(
          new CustomEvent(event, {
            detail: data,
          })
        );
      }
    }

    const TAP_DURATION_MS = 110;
    const TAP_MOVEMENT_PX = 9; // max movement during the tap, keep it small

    const SWIPE_MIN_DURATION_MS = 111;
    const SWIPE_MIN_DISTANCE_PX = 20;

    function getCoords(event) {
      if ('TouchEvent' in window && event instanceof TouchEvent) {
        const touch = event.touches[0];
        return {
          x: touch ? touch.clientX : 0,
          y: touch ? touch.clientY : 0,
        }
      }
      return {
        x: event.clientX,
        y: event.clientY,
      }
    }

    function swipeable(node, { thresholdProvider }) {
      const dispatch = createDispatcher(node);
      let x;
      let y;
      let moved = 0;
      let swipeStartedAt;
      let isTouching = false;

      function isValidSwipe() {
        const swipeDurationMs = Date.now() - swipeStartedAt;
        return swipeDurationMs >= SWIPE_MIN_DURATION_MS && Math.abs(moved) >= SWIPE_MIN_DISTANCE_PX
      }

      function handleDown(event) {
        swipeStartedAt = Date.now();
        moved = 0;
        isTouching = true;
        const coords = getCoords(event);
        x = coords.x;
        y = coords.y;
        dispatch('swipeStart', { x, y });
        addMoveEventListener(window, handleMove);
        addEndEventListener(window, handleUp);
      }

      function handleMove(event) {
        if (!isTouching) return
        const coords = getCoords(event);
        const dx = coords.x - x;
        const dy = coords.y - y;
        x = coords.x;
        y = coords.y;
        dispatch('swipeMove', { x, y, dx, dy });

        if (dx !== 0 && Math.sign(dx) !== Math.sign(moved)) {
          moved = 0;
        }
        moved += dx;
        if (Math.abs(moved) > thresholdProvider()) {
          dispatch('swipeThresholdReached', { direction: moved > 0 ? PREV : NEXT });
          removeEndEventListener(window, handleUp);
          removeMoveEventListener(window, handleMove);
        }
      }

      function handleUp(event) {
        event.preventDefault();
        removeEndEventListener(window, handleUp);
        removeMoveEventListener(window, handleMove);

        isTouching = false;

        if (!isValidSwipe()) {
          dispatch('swipeFailed');
          return
        }
        const coords = getCoords(event);
        dispatch('swipeEnd', { x: coords.x, y: coords.y });
      }

      addStartEventListener(node, handleDown);
      return {
        destroy() {
          removeStartEventListener(node, handleDown);
        },
      }
    }

    // in event
    function addHoverInEventListener(source, cb) {
      source.addEventListener('mouseenter', cb);
    }
    function removeHoverInEventListener(source, cb) {
      source.removeEventListener('mouseenter', cb);
    }

    // out event
    function addHoverOutEventListener(source, cb) {
      source.addEventListener('mouseleave', cb);
    }
    function removeHoverOutEventListener(source, cb) {
      source.removeEventListener('mouseleave', cb);
    }

    /**
     * hoverable events are for mouse events only
     */
    function hoverable(node) {
      const dispatch = createDispatcher(node);

      function handleHoverIn() {
        addHoverOutEventListener(node, handleHoverOut);
        dispatch('hovered', { value: true });
      }

      function handleHoverOut() {
        dispatch('hovered', { value: false });
        removeHoverOutEventListener(node, handleHoverOut);
      }

      addHoverInEventListener(node, handleHoverIn);
      
      return {
        destroy() {
          removeHoverInEventListener(node, handleHoverIn);
          removeHoverOutEventListener(node, handleHoverOut);
        },
      }
    }

    const getDistance = (p1, p2) => {
      const xDist = p2.x - p1.x;
      const yDist = p2.y - p1.y;

      return Math.sqrt((xDist * xDist) + (yDist * yDist));
    };

    function getValueInRange(min, value, max) {
      return Math.max(min, Math.min(value, max))
    }

    // tap start event
    function addFocusinEventListener(source, cb) {
      source.addEventListener('touchstart', cb, { passive: true });
    }
    function removeFocusinEventListener(source, cb) {
      source.removeEventListener('touchstart', cb);
    }

    // tap end event
    function addFocusoutEventListener(source, cb) {
      source.addEventListener('touchend', cb);
    }
    function removeFocusoutEventListener(source, cb) {
      source.removeEventListener('touchend', cb);
    }

    /**
     * tappable events are for touchable devices only
     */
    function tappable(node) {
      const dispatch = createDispatcher(node);

      let tapStartedAt = 0;
      let tapStartPos = { x: 0, y: 0 };

      function getIsValidTap({
        tapEndedAt,
        tapEndedPos
      }) {
        const tapTime = tapEndedAt - tapStartedAt;
        const tapDist = getDistance(tapStartPos, tapEndedPos);
        return (
          tapTime <= TAP_DURATION_MS &&
          tapDist <= TAP_MOVEMENT_PX
        )
      }

      function handleTapstart(event) {
        tapStartedAt = Date.now();

        const touch = event.touches[0];
        tapStartPos = { x: touch.clientX, y: touch.clientY };

        addFocusoutEventListener(node, handleTapend);
      }

      function handleTapend(event) {
        event.preventDefault();
        removeFocusoutEventListener(node, handleTapend);

        const touch = event.changedTouches[0];
        if (getIsValidTap({
          tapEndedAt: Date.now(),
          tapEndedPos: { x: touch.clientX, y: touch.clientY }
        })) {
          dispatch('tapped');
        }
      }

      addFocusinEventListener(node, handleTapstart);
      
      return {
        destroy() {
          removeFocusinEventListener(node, handleTapstart);
          removeFocusoutEventListener(node, handleTapend);
        },
      }
    }

    // getCurrentPageIndexByCurrentParticleIndex

    function _getCurrentPageIndexByCurrentParticleIndexInfinite({
      currentParticleIndex,
      particlesCount,
      clonesCountHead,
      clonesCountTotal,
      particlesToScroll,
    }) {
      if (currentParticleIndex === particlesCount - clonesCountHead) return 0
      if (currentParticleIndex === 0) return _getPagesCountByParticlesCountInfinite({
        particlesCountWithoutClones: particlesCount - clonesCountTotal,
        particlesToScroll,
      }) - 1
      return Math.floor((currentParticleIndex - clonesCountHead) / particlesToScroll)
    }

    function _getCurrentPageIndexByCurrentParticleIndexLimited({
      currentParticleIndex,
      particlesToScroll,
    }) {
      return Math.ceil(currentParticleIndex / particlesToScroll)
    }

    function getCurrentPageIndexByCurrentParticleIndex({
      currentParticleIndex,
      particlesCount,
      clonesCountHead,
      clonesCountTotal,
      infinite,
      particlesToScroll,
    }) {
      return infinite
        ? _getCurrentPageIndexByCurrentParticleIndexInfinite({
          currentParticleIndex,
          particlesCount,
          clonesCountHead,
          clonesCountTotal,
          particlesToScroll,
        })
        : _getCurrentPageIndexByCurrentParticleIndexLimited({
          currentParticleIndex,
          particlesToScroll,
        })
    }

    // getPagesCountByParticlesCount

    function _getPagesCountByParticlesCountInfinite({
      particlesCountWithoutClones,
      particlesToScroll,
    }) {
      return Math.ceil(particlesCountWithoutClones / particlesToScroll)
    }

    function _getPagesCountByParticlesCountLimited({
      particlesCountWithoutClones,
      particlesToScroll,
      particlesToShow,
    }) {
      const partialPageSize = getPartialPageSize({
        particlesCountWithoutClones,
        particlesToScroll,
        particlesToShow,
      });
      return Math.ceil(particlesCountWithoutClones / particlesToScroll) - partialPageSize
    }

    function getPagesCountByParticlesCount({
      infinite,
      particlesCountWithoutClones,
      particlesToScroll,
      particlesToShow,
    }) {
      return infinite
        ? _getPagesCountByParticlesCountInfinite({
          particlesCountWithoutClones,
          particlesToScroll,
        })
        : _getPagesCountByParticlesCountLimited({
          particlesCountWithoutClones,
          particlesToScroll,
          particlesToShow,
        })
    }

    // getParticleIndexByPageIndex

    function _getParticleIndexByPageIndexInfinite({
      pageIndex,
      clonesCountHead,
      clonesCountTail,
      particlesToScroll,
      particlesCount,
    }) {
      return getValueInRange(
        0,
        Math.min(clonesCountHead + pageIndex * particlesToScroll, particlesCount - clonesCountTail),
        particlesCount - 1
      )
    }

    function _getParticleIndexByPageIndexLimited({
      pageIndex,
      particlesToScroll,
      particlesCount,
      particlesToShow,
    }) {
      return getValueInRange(
        0,
        Math.min(pageIndex * particlesToScroll, particlesCount - particlesToShow),
        particlesCount - 1
      ) 
    }

    function getParticleIndexByPageIndex({
      infinite,
      pageIndex,
      clonesCountHead,
      clonesCountTail,
      particlesToScroll,
      particlesCount,
      particlesToShow,
    }) {
      return infinite
        ? _getParticleIndexByPageIndexInfinite({
          pageIndex,
          clonesCountHead,
          clonesCountTail,
          particlesToScroll,
          particlesCount,
        })
        : _getParticleIndexByPageIndexLimited({
          pageIndex,
          particlesToScroll,
          particlesCount,
          particlesToShow,
        })
    }

    function applyParticleSizes({
      particlesContainerChildren,
      particleWidth,
    }) {
      for (let particleIndex=0; particleIndex<particlesContainerChildren.length; particleIndex++) {
        particlesContainerChildren[particleIndex].style.minWidth = `${particleWidth}px`;
        particlesContainerChildren[particleIndex].style.maxWidth = `${particleWidth}px`;
      }
    }

    function getPartialPageSize({
      particlesToScroll,
      particlesToShow,
      particlesCountWithoutClones, 
    }) {
      const overlap = particlesToScroll - particlesToShow;
      let particlesCount = particlesToShow;

      while(true) {
        const diff = particlesCountWithoutClones - particlesCount - overlap;
        if (diff < particlesToShow) {
          return Math.max(diff, 0) // show: 2; scroll: 3, n: 5 => -1
        }
        particlesCount += particlesToShow + overlap;
      }
    }

    function createResizeObserver(onResize) {
      return new ResizeObserver(entries => {
        onResize({
          width: entries[0].contentRect.width,
        });
      });
    }

    function getClones({
      clonesCountHead,
      clonesCountTail,
      particlesContainerChildren,
    }) {
      // TODO: add fns to remove clones if needed
      const clonesToAppend = [];
      for (let i=0; i<clonesCountTail; i++) {
        clonesToAppend.push(particlesContainerChildren[i].cloneNode(true));
      }

      const clonesToPrepend = [];
      const len = particlesContainerChildren.length;
      for (let i=len-1; i>len-1-clonesCountHead; i--) {
        clonesToPrepend.push(particlesContainerChildren[i].cloneNode(true));
      }

      return {
        clonesToAppend,
        clonesToPrepend,
      }
    }

    function applyClones({
      particlesContainer,
      clonesToAppend,
      clonesToPrepend,
    }) {
      for (let i=0; i<clonesToAppend.length; i++) {
        particlesContainer.append(clonesToAppend[i]);
      }
      for (let i=0; i<clonesToPrepend.length; i++) {
        particlesContainer.prepend(clonesToPrepend[i]);
      }
    }

    function getClonesCount({
      infinite,
      particlesToShow,
      partialPageSize,
    }) {
      const clonesCount = infinite
        ? {
          // need to round with ceil as particlesToShow, particlesToShow can be floating (e.g. 1.5, 3.75)
          head: Math.ceil(partialPageSize || particlesToShow),
          tail: Math.ceil(particlesToShow),
        } : {
          head: 0,
          tail: 0,
        };

      return {
        ...clonesCount,
        total: clonesCount.head + clonesCount.tail,
      }
    }

    const get$1 = (object, fieldName, defaultValue) => {
      if (object && object.hasOwnProperty(fieldName)) {
        return object[fieldName]
      }
      if (defaultValue === undefined) {
        throw new Error(`Required arg "${fieldName}" was not provided`)
      }
      return defaultValue
    };

    const switcher = (description) => (key) => {
      description[key] && description[key]();
    };

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /**
     * lodash (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright jQuery Foundation and other contributors <https://jquery.org/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */

    /** Used as the `TypeError` message for "Functions" methods. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used as references for various `Number` constants. */
    var INFINITY = 1 / 0;

    /** `Object#toString` result references. */
    var funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        symbolTag = '[object Symbol]';

    /** Used to match property names within property paths. */
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
        reIsPlainProp = /^\w*$/,
        reLeadingDot = /^\./,
        rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to match backslashes in property paths. */
    var reEscapeChar = /\\(\\)?/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Checks if `value` is a host object in IE < 9.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
     */
    function isHostObject(value) {
      // Many host objects are `Object` objects that can coerce to strings
      // despite having improperly defined `toString` methods.
      var result = false;
      if (value != null && typeof value.toString != 'function') {
        try {
          result = !!(value + '');
        } catch (e) {}
      }
      return result;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto.toString;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Built-in value references. */
    var Symbol$1 = root.Symbol,
        splice = arrayProto.splice;

    /* Built-in method references that are verified to be native. */
    var Map$1 = getNative(root, 'Map'),
        nativeCreate = getNative(Object, 'create');

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol$1 ? Symbol$1.prototype : undefined,
        symbolToString = symbolProto ? symbolProto.toString : undefined;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
    }

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
      return this;
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
    }

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map$1 || ListCache),
        'string': new Hash
      };
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      return getMapData(this, key)['delete'](key);
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.get` without support for default values.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @returns {*} Returns the resolved value.
     */
    function baseGet(object, path) {
      path = isKey(path, object) ? [path] : castPath(path);

      var index = 0,
          length = path.length;

      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return (index && index == length) ? object : undefined;
    }

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * The base implementation of `_.toString` which doesn't convert nullish
     * values to empty strings.
     *
     * @private
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     */
    function baseToString(value) {
      // Exit early for strings to avoid a performance hit in some environments.
      if (typeof value == 'string') {
        return value;
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : '';
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * Casts `value` to a path array if it's not one.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {Array} Returns the cast property path array.
     */
    function castPath(value) {
      return isArray(value) ? value : stringToPath(value);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /**
     * Checks if `value` is a property name and not a property path.
     *
     * @private
     * @param {*} value The value to check.
     * @param {Object} [object] The object to query keys on.
     * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
     */
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == 'number' || type == 'symbol' || type == 'boolean' ||
          value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
        (object != null && value in Object(object));
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /**
     * Converts `string` to a property path array.
     *
     * @private
     * @param {string} string The string to convert.
     * @returns {Array} Returns the property path array.
     */
    var stringToPath = memoize(function(string) {
      string = toString(string);

      var result = [];
      if (reLeadingDot.test(string)) {
        result.push('');
      }
      string.replace(rePropName, function(match, number, quote, string) {
        result.push(quote ? string.replace(reEscapeChar, '$1') : (number || match));
      });
      return result;
    });

    /**
     * Converts `value` to a string key if it's not a string or symbol.
     *
     * @private
     * @param {*} value The value to inspect.
     * @returns {string|symbol} Returns the key.
     */
    function toKey(value) {
      if (typeof value == 'string' || isSymbol(value)) {
        return value;
      }
      var result = (value + '');
      return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
    }

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to process.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided, it determines the cache key for storing the result based on the
     * arguments provided to the memoized function. By default, the first argument
     * provided to the memoized function is used as the map cache key. The `func`
     * is invoked with the `this` binding of the memoized function.
     *
     * **Note:** The cache is exposed as the `cache` property on the memoized
     * function. Its creation may be customized by replacing the `_.memoize.Cache`
     * constructor with one whose instances implement the
     * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
     * method interface of `delete`, `get`, `has`, and `set`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] The function to resolve the cache key.
     * @returns {Function} Returns the new memoized function.
     * @example
     *
     * var object = { 'a': 1, 'b': 2 };
     * var other = { 'c': 3, 'd': 4 };
     *
     * var values = _.memoize(_.values);
     * values(object);
     * // => [1, 2]
     *
     * values(other);
     * // => [3, 4]
     *
     * object.a = 2;
     * values(object);
     * // => [1, 2]
     *
     * // Modify the result cache.
     * values.cache.set(object, ['a', 'b']);
     * values(object);
     * // => ['a', 'b']
     *
     * // Replace `_.memoize.Cache`.
     * _.memoize.Cache = WeakMap;
     */
    function memoize(func, resolver) {
      if (typeof func != 'function' || (resolver && typeof resolver != 'function')) {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments,
            key = resolver ? resolver.apply(this, args) : args[0],
            cache = memoized.cache;

        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result);
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache);
      return memoized;
    }

    // Assign cache to `_.memoize`.
    memoize.Cache = MapCache;

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 8-9 which returns 'object' for typed array and other constructors.
      var tag = isObject(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return !!value && typeof value == 'object';
    }

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && objectToString.call(value) == symbolTag);
    }

    /**
     * Converts `value` to a string. An empty string is returned for `null`
     * and `undefined` values. The sign of `-0` is preserved.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {string} Returns the string.
     * @example
     *
     * _.toString(null);
     * // => ''
     *
     * _.toString(-0);
     * // => '-0'
     *
     * _.toString([1, 2, 3]);
     * // => '1,2,3'
     */
    function toString(value) {
      return value == null ? '' : baseToString(value);
    }

    /**
     * Gets the value at `path` of `object`. If the resolved value is
     * `undefined`, the `defaultValue` is returned in its place.
     *
     * @static
     * @memberOf _
     * @since 3.7.0
     * @category Object
     * @param {Object} object The object to query.
     * @param {Array|string} path The path of the property to get.
     * @param {*} [defaultValue] The value returned for `undefined` resolved values.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = { 'a': [{ 'b': { 'c': 3 } }] };
     *
     * _.get(object, 'a[0].b.c');
     * // => 3
     *
     * _.get(object, ['a', '0', 'b', 'c']);
     * // => 3
     *
     * _.get(object, 'a.b.c', 'default');
     * // => 'default'
     */
    function get(object, path, defaultValue) {
      var result = object == null ? undefined : baseGet(object, path);
      return result === undefined ? defaultValue : result;
    }

    var lodash_get = get;

    /**
     * lodash (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright jQuery Foundation and other contributors <https://jquery.org/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */

    var lodash_clonedeep = createCommonjsModule(function (module, exports) {
    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        objectTag = '[object Object]',
        promiseTag = '[object Promise]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        symbolTag = '[object Symbol]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to match `RegExp` flags from their coerced string values. */
    var reFlags = /\w*$/;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /** Used to identify `toStringTag` values supported by `_.clone`. */
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] =
    cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] =
    cloneableTags[boolTag] = cloneableTags[dateTag] =
    cloneableTags[float32Tag] = cloneableTags[float64Tag] =
    cloneableTags[int8Tag] = cloneableTags[int16Tag] =
    cloneableTags[int32Tag] = cloneableTags[mapTag] =
    cloneableTags[numberTag] = cloneableTags[objectTag] =
    cloneableTags[regexpTag] = cloneableTags[setTag] =
    cloneableTags[stringTag] = cloneableTags[symbolTag] =
    cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] =
    cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] =
    cloneableTags[weakMapTag] = false;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /**
     * Adds the key-value `pair` to `map`.
     *
     * @private
     * @param {Object} map The map to modify.
     * @param {Array} pair The key-value pair to add.
     * @returns {Object} Returns `map`.
     */
    function addMapEntry(map, pair) {
      // Don't return `map.set` because it's not chainable in IE 11.
      map.set(pair[0], pair[1]);
      return map;
    }

    /**
     * Adds `value` to `set`.
     *
     * @private
     * @param {Object} set The set to modify.
     * @param {*} value The value to add.
     * @returns {Object} Returns `set`.
     */
    function addSetEntry(set, value) {
      // Don't return `set.add` because it's not chainable in IE 11.
      set.add(value);
      return set;
    }

    /**
     * A specialized version of `_.forEach` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns `array`.
     */
    function arrayEach(array, iteratee) {
      var index = -1,
          length = array ? array.length : 0;

      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /**
     * A specialized version of `_.reduce` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} iteratee The function invoked per iteration.
     * @param {*} [accumulator] The initial value.
     * @param {boolean} [initAccum] Specify using the first element of `array` as
     *  the initial value.
     * @returns {*} Returns the accumulated value.
     */
    function arrayReduce(array, iteratee, accumulator, initAccum) {
      var index = -1,
          length = array ? array.length : 0;

      if (initAccum && length) {
        accumulator = array[++index];
      }
      while (++index < length) {
        accumulator = iteratee(accumulator, array[index], index, array);
      }
      return accumulator;
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Checks if `value` is a host object in IE < 9.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a host object, else `false`.
     */
    function isHostObject(value) {
      // Many host objects are `Object` objects that can coerce to strings
      // despite having improperly defined `toString` methods.
      var result = false;
      if (value != null && typeof value.toString != 'function') {
        try {
          result = !!(value + '');
        } catch (e) {}
      }
      return result;
    }

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var objectToString = objectProto.toString;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Built-in value references. */
    var Buffer = moduleExports ? root.Buffer : undefined,
        Symbol = root.Symbol,
        Uint8Array = root.Uint8Array,
        getPrototype = overArg(Object.getPrototypeOf, Object),
        objectCreate = Object.create,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols,
        nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
        nativeKeys = overArg(Object.keys, Object);

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView'),
        Map = getNative(root, 'Map'),
        Promise = getNative(root, 'Promise'),
        Set = getNative(root, 'Set'),
        WeakMap = getNative(root, 'WeakMap'),
        nativeCreate = getNative(Object, 'create');

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map),
        promiseCtorString = toSource(Promise),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol ? Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      return this.has(key) && delete this.__data__[key];
    }

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
    }

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
      return this;
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
    }

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries ? entries.length : 0;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      return getMapData(this, key)['delete'](key);
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      getMapData(this, key).set(key, value);
      return this;
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      this.__data__ = new ListCache(entries);
    }

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      return this.__data__['delete'](key);
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var cache = this.__data__;
      if (cache instanceof ListCache) {
        var pairs = cache.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          return this;
        }
        cache = this.__data__ = new MapCache(pairs);
      }
      cache.set(key, value);
      return this;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
      // Safari 9 makes `arguments.length` enumerable in strict mode.
      var result = (isArray(value) || isArguments(value))
        ? baseTimes(value.length, String)
        : [];

      var length = result.length,
          skipIndexes = !!length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) &&
            !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Assigns `value` to `key` of `object` if the existing value is not equivalent
     * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * for equality comparisons.
     *
     * @private
     * @param {Object} object The object to modify.
     * @param {string} key The key of the property to assign.
     * @param {*} value The value to assign.
     */
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
          (value === undefined && !(key in object))) {
        object[key] = value;
      }
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `_.assign` without support for multiple sources
     * or `customizer` functions.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @returns {Object} Returns `object`.
     */
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }

    /**
     * The base implementation of `_.clone` and `_.cloneDeep` which tracks
     * traversed objects.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @param {boolean} [isFull] Specify a clone including symbols.
     * @param {Function} [customizer] The function to customize cloning.
     * @param {string} [key] The key of `value`.
     * @param {Object} [object] The parent object of `value`.
     * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, isFull, customizer, key, object, stack) {
      var result;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== undefined) {
        return result;
      }
      if (!isObject(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value),
            isFunc = tag == funcTag || tag == genTag;

        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
          if (isHostObject(value)) {
            return object ? value : {};
          }
          result = initCloneObject(isFunc ? {} : value);
          if (!isDeep) {
            return copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, baseClone, isDeep);
        }
      }
      // Check for circular references and return its corresponding clone.
      stack || (stack = new Stack);
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);

      if (!isArr) {
        var props = isFull ? getAllKeys(value) : keys(value);
      }
      arrayEach(props || value, function(subValue, key) {
        if (props) {
          key = subValue;
          subValue = value[key];
        }
        // Recursively populate clone (susceptible to call stack limits).
        assignValue(result, key, baseClone(subValue, isDeep, isFull, customizer, key, value, stack));
      });
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(proto) {
      return isObject(proto) ? objectCreate(proto) : {};
    }

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * The base implementation of `getTag`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      return objectToString.call(value);
    }

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = (isFunction(value) || isHostObject(value)) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Creates a clone of  `buffer`.
     *
     * @private
     * @param {Buffer} buffer The buffer to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Buffer} Returns the cloned buffer.
     */
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var result = new buffer.constructor(buffer.length);
      buffer.copy(result);
      return result;
    }

    /**
     * Creates a clone of `arrayBuffer`.
     *
     * @private
     * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
     * @returns {ArrayBuffer} Returns the cloned array buffer.
     */
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }

    /**
     * Creates a clone of `dataView`.
     *
     * @private
     * @param {Object} dataView The data view to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned data view.
     */
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }

    /**
     * Creates a clone of `map`.
     *
     * @private
     * @param {Object} map The map to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned map.
     */
    function cloneMap(map, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(mapToArray(map), true) : mapToArray(map);
      return arrayReduce(array, addMapEntry, new map.constructor);
    }

    /**
     * Creates a clone of `regexp`.
     *
     * @private
     * @param {Object} regexp The regexp to clone.
     * @returns {Object} Returns the cloned regexp.
     */
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }

    /**
     * Creates a clone of `set`.
     *
     * @private
     * @param {Object} set The set to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned set.
     */
    function cloneSet(set, isDeep, cloneFunc) {
      var array = isDeep ? cloneFunc(setToArray(set), true) : setToArray(set);
      return arrayReduce(array, addSetEntry, new set.constructor);
    }

    /**
     * Creates a clone of the `symbol` object.
     *
     * @private
     * @param {Object} symbol The symbol object to clone.
     * @returns {Object} Returns the cloned symbol object.
     */
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }

    /**
     * Creates a clone of `typedArray`.
     *
     * @private
     * @param {Object} typedArray The typed array to clone.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the cloned typed array.
     */
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }

    /**
     * Copies the values of `source` to `array`.
     *
     * @private
     * @param {Array} source The array to copy values from.
     * @param {Array} [array=[]] The array to copy values to.
     * @returns {Array} Returns `array`.
     */
    function copyArray(source, array) {
      var index = -1,
          length = source.length;

      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }

    /**
     * Copies properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy properties from.
     * @param {Array} props The property identifiers to copy.
     * @param {Object} [object={}] The object to copy properties to.
     * @param {Function} [customizer] The function to customize copied values.
     * @returns {Object} Returns `object`.
     */
    function copyObject(source, props, object, customizer) {
      object || (object = {});

      var index = -1,
          length = props.length;

      while (++index < length) {
        var key = props[index];

        var newValue = customizer
          ? customizer(object[key], source[key], key, object, source)
          : undefined;

        assignValue(object, key, newValue === undefined ? source[key] : newValue);
      }
      return object;
    }

    /**
     * Copies own symbol properties of `source` to `object`.
     *
     * @private
     * @param {Object} source The object to copy symbols from.
     * @param {Object} [object={}] The object to copy symbols to.
     * @returns {Object} Returns `object`.
     */
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /**
     * Creates an array of the own enumerable symbol properties of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = nativeGetSymbols ? overArg(nativeGetSymbols, Object) : stubArray;

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11,
    // for data views in Edge < 14, and promises in Node.js.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
        (Map && getTag(new Map) != mapTag) ||
        (Promise && getTag(Promise.resolve()) != promiseTag) ||
        (Set && getTag(new Set) != setTag) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = objectToString.call(value),
            Ctor = result == objectTag ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : undefined;

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    /**
     * Initializes an array clone.
     *
     * @private
     * @param {Array} array The array to clone.
     * @returns {Array} Returns the initialized clone.
     */
    function initCloneArray(array) {
      var length = array.length,
          result = array.constructor(length);

      // Add properties assigned by `RegExp#exec`.
      if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }

    /**
     * Initializes an object clone.
     *
     * @private
     * @param {Object} object The object to clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneObject(object) {
      return (typeof object.constructor == 'function' && !isPrototype(object))
        ? baseCreate(getPrototype(object))
        : {};
    }

    /**
     * Initializes an object clone based on its `toStringTag`.
     *
     * **Note:** This function only supports cloning values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to clone.
     * @param {string} tag The `toStringTag` of the object to clone.
     * @param {Function} cloneFunc The function to clone values.
     * @param {boolean} [isDeep] Specify a deep clone.
     * @returns {Object} Returns the initialized clone.
     */
    function initCloneByTag(object, tag, cloneFunc, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);

        case boolTag:
        case dateTag:
          return new Ctor(+object);

        case dataViewTag:
          return cloneDataView(object, isDeep);

        case float32Tag: case float64Tag:
        case int8Tag: case int16Tag: case int32Tag:
        case uint8Tag: case uint8ClampedTag: case uint16Tag: case uint32Tag:
          return cloneTypedArray(object, isDeep);

        case mapTag:
          return cloneMap(object, isDeep, cloneFunc);

        case numberTag:
        case stringTag:
          return new Ctor(object);

        case regexpTag:
          return cloneRegExp(object);

        case setTag:
          return cloneSet(object, isDeep, cloneFunc);

        case symbolTag:
          return cloneSymbol(object);
      }
    }

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length &&
        (typeof value == 'number' || reIsUint.test(value)) &&
        (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

      return value === proto;
    }

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to process.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * This method is like `_.clone` except that it recursively clones `value`.
     *
     * @static
     * @memberOf _
     * @since 1.0.0
     * @category Lang
     * @param {*} value The value to recursively clone.
     * @returns {*} Returns the deep cloned value.
     * @see _.clone
     * @example
     *
     * var objects = [{ 'a': 1 }, { 'b': 2 }];
     *
     * var deep = _.cloneDeep(objects);
     * console.log(deep[0] === objects[0]);
     * // => false
     */
    function cloneDeep(value) {
      return baseClone(value, true, true);
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
      return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
        (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
    }

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * This method is like `_.isArrayLike` except that it also checks if `value`
     * is an object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array-like object,
     *  else `false`.
     * @example
     *
     * _.isArrayLikeObject([1, 2, 3]);
     * // => true
     *
     * _.isArrayLikeObject(document.body.children);
     * // => true
     *
     * _.isArrayLikeObject('abc');
     * // => false
     *
     * _.isArrayLikeObject(_.noop);
     * // => false
     */
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 8-9 which returns 'object' for typed array and other constructors.
      var tag = isObject(value) ? objectToString.call(value) : '';
      return tag == funcTag || tag == genTag;
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return !!value && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return !!value && typeof value == 'object';
    }

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    module.exports = cloneDeep;
    });

    /**
     * Lodash (Custom Build) <https://lodash.com/>
     * Build: `lodash modularize exports="npm" -o ./`
     * Copyright JS Foundation and other contributors <https://js.foundation/>
     * Released under MIT license <https://lodash.com/license>
     * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
     * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
     */

    var lodash_isequal = createCommonjsModule(function (module, exports) {
    /** Used as the size to enable large array optimizations. */
    var LARGE_ARRAY_SIZE = 200;

    /** Used to stand-in for `undefined` hash values. */
    var HASH_UNDEFINED = '__lodash_hash_undefined__';

    /** Used to compose bitmasks for value comparisons. */
    var COMPARE_PARTIAL_FLAG = 1,
        COMPARE_UNORDERED_FLAG = 2;

    /** Used as references for various `Number` constants. */
    var MAX_SAFE_INTEGER = 9007199254740991;

    /** `Object#toString` result references. */
    var argsTag = '[object Arguments]',
        arrayTag = '[object Array]',
        asyncTag = '[object AsyncFunction]',
        boolTag = '[object Boolean]',
        dateTag = '[object Date]',
        errorTag = '[object Error]',
        funcTag = '[object Function]',
        genTag = '[object GeneratorFunction]',
        mapTag = '[object Map]',
        numberTag = '[object Number]',
        nullTag = '[object Null]',
        objectTag = '[object Object]',
        promiseTag = '[object Promise]',
        proxyTag = '[object Proxy]',
        regexpTag = '[object RegExp]',
        setTag = '[object Set]',
        stringTag = '[object String]',
        symbolTag = '[object Symbol]',
        undefinedTag = '[object Undefined]',
        weakMapTag = '[object WeakMap]';

    var arrayBufferTag = '[object ArrayBuffer]',
        dataViewTag = '[object DataView]',
        float32Tag = '[object Float32Array]',
        float64Tag = '[object Float64Array]',
        int8Tag = '[object Int8Array]',
        int16Tag = '[object Int16Array]',
        int32Tag = '[object Int32Array]',
        uint8Tag = '[object Uint8Array]',
        uint8ClampedTag = '[object Uint8ClampedArray]',
        uint16Tag = '[object Uint16Array]',
        uint32Tag = '[object Uint32Array]';

    /**
     * Used to match `RegExp`
     * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
     */
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

    /** Used to detect host constructors (Safari). */
    var reIsHostCtor = /^\[object .+?Constructor\]$/;

    /** Used to detect unsigned integer values. */
    var reIsUint = /^(?:0|[1-9]\d*)$/;

    /** Used to identify `toStringTag` values of typed arrays. */
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
    typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
    typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
    typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
    typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
    typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
    typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
    typedArrayTags[errorTag] = typedArrayTags[funcTag] =
    typedArrayTags[mapTag] = typedArrayTags[numberTag] =
    typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
    typedArrayTags[setTag] = typedArrayTags[stringTag] =
    typedArrayTags[weakMapTag] = false;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports = exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

    /** Detect the popular CommonJS extension `module.exports`. */
    var moduleExports = freeModule && freeModule.exports === freeExports;

    /** Detect free variable `process` from Node.js. */
    var freeProcess = moduleExports && freeGlobal.process;

    /** Used to access faster Node.js helpers. */
    var nodeUtil = (function() {
      try {
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());

    /* Node.js helper references. */
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;

    /**
     * A specialized version of `_.filter` for arrays without support for
     * iteratee shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {Array} Returns the new filtered array.
     */
    function arrayFilter(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length,
          resIndex = 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }

    /**
     * Appends the elements of `values` to `array`.
     *
     * @private
     * @param {Array} array The array to modify.
     * @param {Array} values The values to append.
     * @returns {Array} Returns `array`.
     */
    function arrayPush(array, values) {
      var index = -1,
          length = values.length,
          offset = array.length;

      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }

    /**
     * A specialized version of `_.some` for arrays without support for iteratee
     * shorthands.
     *
     * @private
     * @param {Array} [array] The array to iterate over.
     * @param {Function} predicate The function invoked per iteration.
     * @returns {boolean} Returns `true` if any element passes the predicate check,
     *  else `false`.
     */
    function arraySome(array, predicate) {
      var index = -1,
          length = array == null ? 0 : array.length;

      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }

    /**
     * The base implementation of `_.times` without support for iteratee shorthands
     * or max array length checks.
     *
     * @private
     * @param {number} n The number of times to invoke `iteratee`.
     * @param {Function} iteratee The function invoked per iteration.
     * @returns {Array} Returns the array of results.
     */
    function baseTimes(n, iteratee) {
      var index = -1,
          result = Array(n);

      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }

    /**
     * The base implementation of `_.unary` without support for storing metadata.
     *
     * @private
     * @param {Function} func The function to cap arguments for.
     * @returns {Function} Returns the new capped function.
     */
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }

    /**
     * Checks if a `cache` value for `key` exists.
     *
     * @private
     * @param {Object} cache The cache to query.
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function cacheHas(cache, key) {
      return cache.has(key);
    }

    /**
     * Gets the value at `key` of `object`.
     *
     * @private
     * @param {Object} [object] The object to query.
     * @param {string} key The key of the property to get.
     * @returns {*} Returns the property value.
     */
    function getValue(object, key) {
      return object == null ? undefined : object[key];
    }

    /**
     * Converts `map` to its key-value pairs.
     *
     * @private
     * @param {Object} map The map to convert.
     * @returns {Array} Returns the key-value pairs.
     */
    function mapToArray(map) {
      var index = -1,
          result = Array(map.size);

      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }

    /**
     * Creates a unary function that invokes `func` with its argument transformed.
     *
     * @private
     * @param {Function} func The function to wrap.
     * @param {Function} transform The argument transform.
     * @returns {Function} Returns the new function.
     */
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }

    /**
     * Converts `set` to an array of its values.
     *
     * @private
     * @param {Object} set The set to convert.
     * @returns {Array} Returns the values.
     */
    function setToArray(set) {
      var index = -1,
          result = Array(set.size);

      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }

    /** Used for built-in method references. */
    var arrayProto = Array.prototype,
        funcProto = Function.prototype,
        objectProto = Object.prototype;

    /** Used to detect overreaching core-js shims. */
    var coreJsData = root['__core-js_shared__'];

    /** Used to resolve the decompiled source of functions. */
    var funcToString = funcProto.toString;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /** Used to detect methods masquerading as native. */
    var maskSrcKey = (function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
      return uid ? ('Symbol(src)_1.' + uid) : '';
    }());

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Used to detect if a method is native. */
    var reIsNative = RegExp('^' +
      funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&')
      .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
    );

    /** Built-in value references. */
    var Buffer = moduleExports ? root.Buffer : undefined,
        Symbol = root.Symbol,
        Uint8Array = root.Uint8Array,
        propertyIsEnumerable = objectProto.propertyIsEnumerable,
        splice = arrayProto.splice,
        symToStringTag = Symbol ? Symbol.toStringTag : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeGetSymbols = Object.getOwnPropertySymbols,
        nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined,
        nativeKeys = overArg(Object.keys, Object);

    /* Built-in method references that are verified to be native. */
    var DataView = getNative(root, 'DataView'),
        Map = getNative(root, 'Map'),
        Promise = getNative(root, 'Promise'),
        Set = getNative(root, 'Set'),
        WeakMap = getNative(root, 'WeakMap'),
        nativeCreate = getNative(Object, 'create');

    /** Used to detect maps, sets, and weakmaps. */
    var dataViewCtorString = toSource(DataView),
        mapCtorString = toSource(Map),
        promiseCtorString = toSource(Promise),
        setCtorString = toSource(Set),
        weakMapCtorString = toSource(WeakMap);

    /** Used to convert symbols to primitives and strings. */
    var symbolProto = Symbol ? Symbol.prototype : undefined,
        symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

    /**
     * Creates a hash object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Hash(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the hash.
     *
     * @private
     * @name clear
     * @memberOf Hash
     */
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the hash.
     *
     * @private
     * @name delete
     * @memberOf Hash
     * @param {Object} hash The hash to modify.
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the hash value for `key`.
     *
     * @private
     * @name get
     * @memberOf Hash
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? undefined : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : undefined;
    }

    /**
     * Checks if a hash value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Hash
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
    }

    /**
     * Sets the hash `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Hash
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the hash instance.
     */
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
      return this;
    }

    // Add methods to `Hash`.
    Hash.prototype.clear = hashClear;
    Hash.prototype['delete'] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;

    /**
     * Creates an list cache object.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function ListCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the list cache.
     *
     * @private
     * @name clear
     * @memberOf ListCache
     */
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the list cache.
     *
     * @private
     * @name delete
     * @memberOf ListCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function listCacheDelete(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }

    /**
     * Gets the list cache value for `key`.
     *
     * @private
     * @name get
     * @memberOf ListCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function listCacheGet(key) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      return index < 0 ? undefined : data[index][1];
    }

    /**
     * Checks if a list cache value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf ListCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }

    /**
     * Sets the list cache `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf ListCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the list cache instance.
     */
    function listCacheSet(key, value) {
      var data = this.__data__,
          index = assocIndexOf(data, key);

      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }

    // Add methods to `ListCache`.
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype['delete'] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;

    /**
     * Creates a map cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function MapCache(entries) {
      var index = -1,
          length = entries == null ? 0 : entries.length;

      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }

    /**
     * Removes all key-value entries from the map.
     *
     * @private
     * @name clear
     * @memberOf MapCache
     */
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        'hash': new Hash,
        'map': new (Map || ListCache),
        'string': new Hash
      };
    }

    /**
     * Removes `key` and its value from the map.
     *
     * @private
     * @name delete
     * @memberOf MapCache
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function mapCacheDelete(key) {
      var result = getMapData(this, key)['delete'](key);
      this.size -= result ? 1 : 0;
      return result;
    }

    /**
     * Gets the map value for `key`.
     *
     * @private
     * @name get
     * @memberOf MapCache
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }

    /**
     * Checks if a map value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf MapCache
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }

    /**
     * Sets the map `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf MapCache
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the map cache instance.
     */
    function mapCacheSet(key, value) {
      var data = getMapData(this, key),
          size = data.size;

      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }

    // Add methods to `MapCache`.
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype['delete'] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;

    /**
     *
     * Creates an array cache object to store unique values.
     *
     * @private
     * @constructor
     * @param {Array} [values] The values to cache.
     */
    function SetCache(values) {
      var index = -1,
          length = values == null ? 0 : values.length;

      this.__data__ = new MapCache;
      while (++index < length) {
        this.add(values[index]);
      }
    }

    /**
     * Adds `value` to the array cache.
     *
     * @private
     * @name add
     * @memberOf SetCache
     * @alias push
     * @param {*} value The value to cache.
     * @returns {Object} Returns the cache instance.
     */
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }

    /**
     * Checks if `value` is in the array cache.
     *
     * @private
     * @name has
     * @memberOf SetCache
     * @param {*} value The value to search for.
     * @returns {number} Returns `true` if `value` is found, else `false`.
     */
    function setCacheHas(value) {
      return this.__data__.has(value);
    }

    // Add methods to `SetCache`.
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;

    /**
     * Creates a stack cache object to store key-value pairs.
     *
     * @private
     * @constructor
     * @param {Array} [entries] The key-value pairs to cache.
     */
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }

    /**
     * Removes all key-value entries from the stack.
     *
     * @private
     * @name clear
     * @memberOf Stack
     */
    function stackClear() {
      this.__data__ = new ListCache;
      this.size = 0;
    }

    /**
     * Removes `key` and its value from the stack.
     *
     * @private
     * @name delete
     * @memberOf Stack
     * @param {string} key The key of the value to remove.
     * @returns {boolean} Returns `true` if the entry was removed, else `false`.
     */
    function stackDelete(key) {
      var data = this.__data__,
          result = data['delete'](key);

      this.size = data.size;
      return result;
    }

    /**
     * Gets the stack value for `key`.
     *
     * @private
     * @name get
     * @memberOf Stack
     * @param {string} key The key of the value to get.
     * @returns {*} Returns the entry value.
     */
    function stackGet(key) {
      return this.__data__.get(key);
    }

    /**
     * Checks if a stack value for `key` exists.
     *
     * @private
     * @name has
     * @memberOf Stack
     * @param {string} key The key of the entry to check.
     * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
     */
    function stackHas(key) {
      return this.__data__.has(key);
    }

    /**
     * Sets the stack `key` to `value`.
     *
     * @private
     * @name set
     * @memberOf Stack
     * @param {string} key The key of the value to set.
     * @param {*} value The value to set.
     * @returns {Object} Returns the stack cache instance.
     */
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }

    // Add methods to `Stack`.
    Stack.prototype.clear = stackClear;
    Stack.prototype['delete'] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;

    /**
     * Creates an array of the enumerable property names of the array-like `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @param {boolean} inherited Specify returning inherited property names.
     * @returns {Array} Returns the array of property names.
     */
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value),
          isArg = !isArr && isArguments(value),
          isBuff = !isArr && !isArg && isBuffer(value),
          isType = !isArr && !isArg && !isBuff && isTypedArray(value),
          skipIndexes = isArr || isArg || isBuff || isType,
          result = skipIndexes ? baseTimes(value.length, String) : [],
          length = result.length;

      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) &&
            !(skipIndexes && (
               // Safari 9 has enumerable `arguments.length` in strict mode.
               key == 'length' ||
               // Node.js 0.10 has enumerable non-index properties on buffers.
               (isBuff && (key == 'offset' || key == 'parent')) ||
               // PhantomJS 2 has enumerable non-index properties on typed arrays.
               (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
               // Skip index properties.
               isIndex(key, length)
            ))) {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * Gets the index at which the `key` is found in `array` of key-value pairs.
     *
     * @private
     * @param {Array} array The array to inspect.
     * @param {*} key The key to search for.
     * @returns {number} Returns the index of the matched value, else `-1`.
     */
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
     * `keysFunc` and `symbolsFunc` to get the enumerable property names and
     * symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {Function} keysFunc The function to get the keys of `object`.
     * @param {Function} symbolsFunc The function to get the symbols of `object`.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag && symToStringTag in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * The base implementation of `_.isArguments`.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     */
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }

    /**
     * The base implementation of `_.isEqual` which supports partial comparisons
     * and tracks traversed objects.
     *
     * @private
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @param {boolean} bitmask The bitmask flags.
     *  1 - Unordered comparison
     *  2 - Partial comparison
     * @param {Function} [customizer] The function to customize comparisons.
     * @param {Object} [stack] Tracks traversed `value` and `other` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }

    /**
     * A specialized version of `baseIsEqual` for arrays and objects which performs
     * deep comparisons and tracks traversed objects enabling objects with circular
     * references to be compared.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} [stack] Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object),
          othIsArr = isArray(other),
          objTag = objIsArr ? arrayTag : getTag(object),
          othTag = othIsArr ? arrayTag : getTag(other);

      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;

      var objIsObj = objTag == objectTag,
          othIsObj = othTag == objectTag,
          isSameTag = objTag == othTag;

      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack);
        return (objIsArr || isTypedArray(object))
          ? equalArrays(object, other, bitmask, customizer, equalFunc, stack)
          : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
            othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object,
              othUnwrapped = othIsWrapped ? other.value() : other;

          stack || (stack = new Stack);
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack);
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }

    /**
     * The base implementation of `_.isNative` without bad shim checks.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a native function,
     *  else `false`.
     */
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }

    /**
     * The base implementation of `_.isTypedArray` without Node.js optimizations.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     */
    function baseIsTypedArray(value) {
      return isObjectLike(value) &&
        isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }

    /**
     * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     */
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty.call(object, key) && key != 'constructor') {
          result.push(key);
        }
      }
      return result;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for arrays with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Array} array The array to compare.
     * @param {Array} other The other array to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `array` and `other` objects.
     * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
     */
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          arrLength = array.length,
          othLength = other.length;

      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(array);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var index = -1,
          result = true,
          seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;

      stack.set(array, other);
      stack.set(other, array);

      // Ignore non-index properties.
      while (++index < arrLength) {
        var arrValue = array[index],
            othValue = other[index];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, arrValue, index, other, array, stack)
            : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== undefined) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        // Recursively compare arrays (susceptible to call stack limits).
        if (seen) {
          if (!arraySome(other, function(othValue, othIndex) {
                if (!cacheHas(seen, othIndex) &&
                    (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
                  return seen.push(othIndex);
                }
              })) {
            result = false;
            break;
          }
        } else if (!(
              arrValue === othValue ||
                equalFunc(arrValue, othValue, bitmask, customizer, stack)
            )) {
          result = false;
          break;
        }
      }
      stack['delete'](array);
      stack['delete'](other);
      return result;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for comparing objects of
     * the same `toStringTag`.
     *
     * **Note:** This function only supports comparing values with tags of
     * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {string} tag The `toStringTag` of the objects to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if ((object.byteLength != other.byteLength) ||
              (object.byteOffset != other.byteOffset)) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;

        case arrayBufferTag:
          if ((object.byteLength != other.byteLength) ||
              !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
            return false;
          }
          return true;

        case boolTag:
        case dateTag:
        case numberTag:
          // Coerce booleans to `1` or `0` and dates to milliseconds.
          // Invalid dates are coerced to `NaN`.
          return eq(+object, +other);

        case errorTag:
          return object.name == other.name && object.message == other.message;

        case regexpTag:
        case stringTag:
          // Coerce regexes to strings and treat strings, primitives and objects,
          // as equal. See http://www.ecma-international.org/ecma-262/7.0/#sec-regexp.prototype.tostring
          // for more details.
          return object == (other + '');

        case mapTag:
          var convert = mapToArray;

        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);

          if (object.size != other.size && !isPartial) {
            return false;
          }
          // Assume cyclic values are equal.
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;

          // Recursively compare objects (susceptible to call stack limits).
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack['delete'](object);
          return result;

        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }

    /**
     * A specialized version of `baseIsEqualDeep` for objects with support for
     * partial deep comparisons.
     *
     * @private
     * @param {Object} object The object to compare.
     * @param {Object} other The other object to compare.
     * @param {number} bitmask The bitmask flags. See `baseIsEqual` for more details.
     * @param {Function} customizer The function to customize comparisons.
     * @param {Function} equalFunc The function to determine equivalents of values.
     * @param {Object} stack Tracks traversed `object` and `other` objects.
     * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
     */
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
          objProps = getAllKeys(object),
          objLength = objProps.length,
          othProps = getAllKeys(other),
          othLength = othProps.length;

      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
          return false;
        }
      }
      // Assume cyclic values are equal.
      var stacked = stack.get(object);
      if (stacked && stack.get(other)) {
        return stacked == other;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);

      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key],
            othValue = other[key];

        if (customizer) {
          var compared = isPartial
            ? customizer(othValue, objValue, key, other, object, stack)
            : customizer(objValue, othValue, key, object, other, stack);
        }
        // Recursively compare objects (susceptible to call stack limits).
        if (!(compared === undefined
              ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack))
              : compared
            )) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == 'constructor');
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor,
            othCtor = other.constructor;

        // Non `Object` object instances with different constructors are not equal.
        if (objCtor != othCtor &&
            ('constructor' in object && 'constructor' in other) &&
            !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
              typeof othCtor == 'function' && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack['delete'](object);
      stack['delete'](other);
      return result;
    }

    /**
     * Creates an array of own enumerable property names and symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names and symbols.
     */
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }

    /**
     * Gets the data for `map`.
     *
     * @private
     * @param {Object} map The map to query.
     * @param {string} key The reference key.
     * @returns {*} Returns the map data.
     */
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key)
        ? data[typeof key == 'string' ? 'string' : 'hash']
        : data.map;
    }

    /**
     * Gets the native function at `key` of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @param {string} key The key of the method to get.
     * @returns {*} Returns the function if it's native, else `undefined`.
     */
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : undefined;
    }

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
        var unmasked = true;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /**
     * Creates an array of the own enumerable symbols of `object`.
     *
     * @private
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of symbols.
     */
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };

    /**
     * Gets the `toStringTag` of `value`.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    var getTag = baseGetTag;

    // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
    if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) ||
        (Map && getTag(new Map) != mapTag) ||
        (Promise && getTag(Promise.resolve()) != promiseTag) ||
        (Set && getTag(new Set) != setTag) ||
        (WeakMap && getTag(new WeakMap) != weakMapTag)) {
      getTag = function(value) {
        var result = baseGetTag(value),
            Ctor = result == objectTag ? value.constructor : undefined,
            ctorString = Ctor ? toSource(Ctor) : '';

        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString: return dataViewTag;
            case mapCtorString: return mapTag;
            case promiseCtorString: return promiseTag;
            case setCtorString: return setTag;
            case weakMapCtorString: return weakMapTag;
          }
        }
        return result;
      };
    }

    /**
     * Checks if `value` is a valid array-like index.
     *
     * @private
     * @param {*} value The value to check.
     * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
     * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
     */
    function isIndex(value, length) {
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length &&
        (typeof value == 'number' || reIsUint.test(value)) &&
        (value > -1 && value % 1 == 0 && value < length);
    }

    /**
     * Checks if `value` is suitable for use as unique object key.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
     */
    function isKeyable(value) {
      var type = typeof value;
      return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
        ? (value !== '__proto__')
        : (value === null);
    }

    /**
     * Checks if `func` has its source masked.
     *
     * @private
     * @param {Function} func The function to check.
     * @returns {boolean} Returns `true` if `func` is masked, else `false`.
     */
    function isMasked(func) {
      return !!maskSrcKey && (maskSrcKey in func);
    }

    /**
     * Checks if `value` is likely a prototype object.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
     */
    function isPrototype(value) {
      var Ctor = value && value.constructor,
          proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

      return value === proto;
    }

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }

    /**
     * Converts `func` to its source code.
     *
     * @private
     * @param {Function} func The function to convert.
     * @returns {string} Returns the source code.
     */
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {}
        try {
          return (func + '');
        } catch (e) {}
      }
      return '';
    }

    /**
     * Performs a
     * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
     * comparison between two values to determine if they are equivalent.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.eq(object, object);
     * // => true
     *
     * _.eq(object, other);
     * // => false
     *
     * _.eq('a', 'a');
     * // => true
     *
     * _.eq('a', Object('a'));
     * // => false
     *
     * _.eq(NaN, NaN);
     * // => true
     */
    function eq(value, other) {
      return value === other || (value !== value && other !== other);
    }

    /**
     * Checks if `value` is likely an `arguments` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an `arguments` object,
     *  else `false`.
     * @example
     *
     * _.isArguments(function() { return arguments; }());
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    var isArguments = baseIsArguments(function() { return arguments; }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, 'callee') &&
        !propertyIsEnumerable.call(value, 'callee');
    };

    /**
     * Checks if `value` is classified as an `Array` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an array, else `false`.
     * @example
     *
     * _.isArray([1, 2, 3]);
     * // => true
     *
     * _.isArray(document.body.children);
     * // => false
     *
     * _.isArray('abc');
     * // => false
     *
     * _.isArray(_.noop);
     * // => false
     */
    var isArray = Array.isArray;

    /**
     * Checks if `value` is array-like. A value is considered array-like if it's
     * not a function and has a `value.length` that's an integer greater than or
     * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
     * @example
     *
     * _.isArrayLike([1, 2, 3]);
     * // => true
     *
     * _.isArrayLike(document.body.children);
     * // => true
     *
     * _.isArrayLike('abc');
     * // => true
     *
     * _.isArrayLike(_.noop);
     * // => false
     */
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }

    /**
     * Checks if `value` is a buffer.
     *
     * @static
     * @memberOf _
     * @since 4.3.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
     * @example
     *
     * _.isBuffer(new Buffer(2));
     * // => true
     *
     * _.isBuffer(new Uint8Array(2));
     * // => false
     */
    var isBuffer = nativeIsBuffer || stubFalse;

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent.
     *
     * **Note:** This method supports comparing arrays, array buffers, booleans,
     * date objects, error objects, maps, numbers, `Object` objects, regexes,
     * sets, strings, symbols, and typed arrays. `Object` objects are compared
     * by their own, not inherited, enumerable properties. Functions and DOM
     * nodes are compared by strict equality, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to compare.
     * @param {*} other The other value to compare.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'a': 1 };
     * var other = { 'a': 1 };
     *
     * _.isEqual(object, other);
     * // => true
     *
     * object === other;
     * // => false
     */
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }

    /**
     * Checks if `value` is classified as a `Function` object.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     *
     * _.isFunction(/abc/);
     * // => false
     */
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      // The use of `Object#toString` avoids issues with the `typeof` operator
      // in Safari 9 which returns 'object' for typed arrays and other constructors.
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }

    /**
     * Checks if `value` is a valid array-like length.
     *
     * **Note:** This method is loosely based on
     * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
     * @example
     *
     * _.isLength(3);
     * // => true
     *
     * _.isLength(Number.MIN_VALUE);
     * // => false
     *
     * _.isLength(Infinity);
     * // => false
     *
     * _.isLength('3');
     * // => false
     */
    function isLength(value) {
      return typeof value == 'number' &&
        value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /**
     * Checks if `value` is classified as a typed array.
     *
     * @static
     * @memberOf _
     * @since 3.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
     * @example
     *
     * _.isTypedArray(new Uint8Array);
     * // => true
     *
     * _.isTypedArray([]);
     * // => false
     */
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;

    /**
     * Creates an array of the own enumerable property names of `object`.
     *
     * **Note:** Non-object values are coerced to objects. See the
     * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
     * for more details.
     *
     * @static
     * @since 0.1.0
     * @memberOf _
     * @category Object
     * @param {Object} object The object to query.
     * @returns {Array} Returns the array of property names.
     * @example
     *
     * function Foo() {
     *   this.a = 1;
     *   this.b = 2;
     * }
     *
     * Foo.prototype.c = 3;
     *
     * _.keys(new Foo);
     * // => ['a', 'b'] (iteration order is not guaranteed)
     *
     * _.keys('hi');
     * // => ['0', '1']
     */
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }

    /**
     * This method returns a new empty array.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {Array} Returns the new empty array.
     * @example
     *
     * var arrays = _.times(2, _.stubArray);
     *
     * console.log(arrays);
     * // => [[], []]
     *
     * console.log(arrays[0] === arrays[1]);
     * // => false
     */
    function stubArray() {
      return [];
    }

    /**
     * This method returns `false`.
     *
     * @static
     * @memberOf _
     * @since 4.13.0
     * @category Util
     * @returns {boolean} Returns `false`.
     * @example
     *
     * _.times(2, _.stubFalse);
     * // => [false, false]
     */
    function stubFalse() {
      return false;
    }

    module.exports = isEqual;
    });

    const depsAreEqual = (deps1, deps2) => {
      return lodash_isequal(deps1, deps2)
    };

    const getDepNames = (deps) => {
      return Object.keys(deps || {})
    };

    const getUpdatedDeps = (depNames, currentData) => {
      const updatedDeps = {};
      depNames.forEach((depName) => {
        updatedDeps[depName] = currentData[depName];
      });
      return updatedDeps
    };

    const createSubscription = () => {
      const subscribers = {};

      const memoDependency = (target, dep) => {
        const { watcherName, fn } = target;
        const { prop, value } = dep;

        if (!subscribers[watcherName]) {
          subscribers[watcherName] = {
            deps: {},
            fn,
          };
        }
        subscribers[watcherName].deps[prop] = value;
      };

      return {
        subscribers,
        subscribe(target, dep) {
          if (target) {
            memoDependency(target, dep);
          }
        },
        notify(data, prop) {
          Object.entries(subscribers).forEach(([watchName, { deps, fn }]) => {
            const depNames = getDepNames(deps);

            if (depNames.includes(prop)) {
              const updatedDeps = getUpdatedDeps(depNames, data);
              if (!depsAreEqual(deps, updatedDeps)) {
                subscribers[watchName].deps = updatedDeps;
                fn();
              }
            }
          });
        },
      }
    };

    const createTargetWatcher = () => {
      let target = null;

      return {
        targetWatcher(watcherName, fn) {
          target = {
            watcherName,
            fn,
          };
          target.fn();
          target = null;
        },
        getTarget() {
          return target
        },
      }
    };

    function simplyReactive(entities, options) {
      const data = lodash_get(entities, 'data', {});
      const watch = lodash_get(entities, 'watch', {});
      const methods = lodash_get(entities, 'methods', {});
      const onChange = lodash_get(options, 'onChange', () => {});

      const { subscribe, notify, subscribers } = createSubscription();
      const { targetWatcher, getTarget } = createTargetWatcher();

      let _data;
      const _methods = {};
      const getContext = () => ({
        data: _data,
        methods: _methods,
      });

      let callingMethod = false;
      const methodWithFlags = (fn) => (...args) => {
        callingMethod = true;
        const result = fn(...args);
        callingMethod = false;
        return result
      };

      // init methods before data, as methods may be used in data
      Object.entries(methods).forEach(([methodName, methodItem]) => {
        _methods[methodName] = methodWithFlags((...args) =>
          methodItem(getContext(), ...args)
        );
        Object.defineProperty(_methods[methodName], 'name', { value: methodName });
      });

      _data = new Proxy(lodash_clonedeep(data), {
        get(target, prop) {
          if (getTarget() && !callingMethod) {
            subscribe(getTarget(), { prop, value: target[prop] });
          }
          return Reflect.get(...arguments)
        },
        set(target, prop, value) {
          // if value is the same, do nothing
          if (target[prop] === value) {
            return true
          }

          Reflect.set(...arguments);

          if (!getTarget()) {
            onChange && onChange(prop, value);
            notify(_data, prop);
          }

          return true
        },
      });

      Object.entries(watch).forEach(([watchName, watchItem]) => {
        targetWatcher(watchName, () => {
          watchItem(getContext());
        });
      });

      const output = [_data, _methods];
      output._internal = {
        _getSubscribers() {
          return subscribers
        },
      };

      return output
    }

    function getIndexesOfParticlesWithoutClonesInPage({
      pageIndex,
      particlesToShow,
      particlesToScroll,
      particlesCount,
    }) {
      const overlap = pageIndex === 0 ? 0 : particlesToShow - particlesToScroll;
      const from = pageIndex * particlesToShow - pageIndex * overlap;
      const to = from + Math.max(particlesToShow, particlesToScroll) - 1;
      const indexes = [];
      for (let i=from; i<=Math.min(particlesCount - 1, to); i++) {
        indexes.push(i);
      }
      return indexes
    }

    function getAdjacentIndexes({
      infinite,
      pageIndex,
      pagesCount,
      particlesCount,
      particlesToShow,
      particlesToScroll,
    }) {
      const _pageIndex = getValueInRange(0, pageIndex, pagesCount - 1);

      let rangeStart = _pageIndex - 1;
      let rangeEnd = _pageIndex + 1;

      rangeStart = infinite
        ? rangeStart < 0 ? pagesCount - 1 : rangeStart
        : Math.max(0, rangeStart);

      rangeEnd = infinite
        ? rangeEnd > pagesCount - 1 ? 0 : rangeEnd
        : Math.min(pagesCount - 1, rangeEnd);

      const pageIndexes = [...new Set([
        rangeStart,
        _pageIndex,
        rangeEnd,

        // because of these values outputs for infinite/non-infinites are the same
        0, // needed to clone first page particles
        pagesCount - 1, // needed to clone last page particles
      ])].sort((a, b) => a - b);
      const particleIndexes = pageIndexes.flatMap(
        pageIndex => getIndexesOfParticlesWithoutClonesInPage({
          pageIndex,
          particlesToShow,
          particlesToScroll,
          particlesCount,
        })
      );
      return {
        pageIndexes,
        particleIndexes: [...new Set(particleIndexes)].sort((a, b) => a - b),
      }
    }

    const setIntervalImmediate = (fn, ms) => {
      fn();
      return setInterval(fn, ms);
    };

    const STEP_MS = 35;
    const MAX_VALUE = 1;

    class ProgressManager {
      constructor({ onProgressValueChange }) {
        this._onProgressValueChange = onProgressValueChange;

        this._autoplayDuration;
        this._onProgressValueChange;
      
        this._interval;
        this._paused = false;
      }

      setAutoplayDuration(autoplayDuration) {
        this._autoplayDuration = autoplayDuration;
      }

      start(onFinish) {
        return new Promise((resolve) => {
          this.reset();

          const stepMs = Math.min(STEP_MS, this._autoplayDuration);
          let progress = -stepMs;
      
          this._interval = setIntervalImmediate(async () => {
            if (this._paused) {
              return
            }
            progress += stepMs;
      
            const value = progress / this._autoplayDuration;
            this._onProgressValueChange(value);
      
            if (value > MAX_VALUE) {
              this.reset();
              await onFinish();
              resolve();
            }
          }, stepMs);
        })
      }

      pause() {
        this._paused = true;
      }

      resume() {
        this._paused = false;
      }

      reset() {
        clearInterval(this._interval);
        this._onProgressValueChange(MAX_VALUE);
      }
    }

    function createCarousel(onChange) {
      const progressManager = new ProgressManager({
        onProgressValueChange: (value) => {
          onChange('progressValue', 1 - value);
        },
      });

      const reactive = simplyReactive(
        {
          data: {
            particlesCountWithoutClones: 0,
            particlesToShow: 1, // normalized
            particlesToShowInit: 1, // initial value
            particlesToScroll: 1, // normalized
            particlesToScrollInit: 1, // initial value
            particlesCount: 1,
            currentParticleIndex: 1,
            infinite: false,
            autoplayDuration: 1000,
            clonesCountHead: 0,
            clonesCountTail: 0,
            clonesCountTotal: 0,
            partialPageSize: 1,
            currentPageIndex: 1,
            pagesCount: 1,
            pauseOnFocus: false,
            focused: false,
            autoplay: false,
            autoplayDirection: 'next',
            disabled: false, // disable page change while animation is in progress
            durationMsInit: 1000,
            durationMs: 1000,
            offset: 0,
            particleWidth: 0,
            loaded: [],
          },
          watch: {
            setLoaded({ data }) {
              data.loaded = getAdjacentIndexes({
                infinite: data.infinite,
                pageIndex: data.currentPageIndex,
                pagesCount: data.pagesCount,
                particlesCount: data.particlesCountWithoutClones,
                particlesToShow: data.particlesToShow,
                particlesToScroll: data.particlesToScroll,
              }).particleIndexes;
            },
            setCurrentPageIndex({ data }) {
              data.currentPageIndex = getCurrentPageIndexByCurrentParticleIndex({
                currentParticleIndex: data.currentParticleIndex,
                particlesCount: data.particlesCount,
                clonesCountHead: data.clonesCountHead,
                clonesCountTotal: data.clonesCountTotal,
                infinite: data.infinite,
                particlesToScroll: data.particlesToScroll,
              });
            },
            setPartialPageSize({ data }) {
              data.partialPageSize = getPartialPageSize({
                particlesToScroll: data.particlesToScroll,
                particlesToShow: data.particlesToShow,
                particlesCountWithoutClones: data.particlesCountWithoutClones,
              });
            },
            setClonesCount({ data }) {
              const { head, tail } = getClonesCount({
                infinite: data.infinite,
                particlesToShow: data.particlesToShow,
                partialPageSize: data.partialPageSize,
              });
              data.clonesCountHead = head;
              data.clonesCountTail = tail;
              data.clonesCountTotal = head + tail;
            },
            setProgressManagerAutoplayDuration({ data }) {
              progressManager.setAutoplayDuration(data.autoplayDuration);
            },
            toggleProgressManager({ data: { pauseOnFocus, focused } }) {
              // as focused is in if block, it will not be put to deps, read them in data: {}
              if (pauseOnFocus) {
                if (focused) {
                  progressManager.pause();
                } else {
                  progressManager.resume();
                }
              }
            },
            initDuration({ data }) {
              data.durationMs = data.durationMsInit;
            },
            applyAutoplay({ data, methods: { _applyAutoplayIfNeeded } }) {
              // prevent _applyAutoplayIfNeeded to be called with watcher
              // to prevent its data added to deps
              data.autoplay && _applyAutoplayIfNeeded(data.autoplay);
            },
            setPagesCount({ data }) {
              data.pagesCount = getPagesCountByParticlesCount({
                infinite: data.infinite,
                particlesCountWithoutClones: data.particlesCountWithoutClones,
                particlesToScroll: data.particlesToScroll,
                particlesToShow: data.particlesToShow,
              });
            },
            setParticlesToShow({ data }) {
              data.particlesToShow = getValueInRange(
                1,
                data.particlesToShowInit,
                data.particlesCountWithoutClones
              );
            },
            setParticlesToScroll({ data }) {
              data.particlesToScroll = getValueInRange(
                1,
                data.particlesToScrollInit,
                data.particlesCountWithoutClones
              );
            },
          },
          methods: {
            _prev({ data }) {
              data.currentParticleIndex = getParticleIndexByPageIndex({
                infinite: data.infinite,
                pageIndex: data.currentPageIndex - 1,
                clonesCountHead: data.clonesCountHead,
                clonesCountTail: data.clonesCountTail,
                particlesToScroll: data.particlesToScroll,
                particlesCount: data.particlesCount,
                particlesToShow: data.particlesToShow,
              });
            },
            _next({ data }) {
              data.currentParticleIndex = getParticleIndexByPageIndex({
                infinite: data.infinite,
                pageIndex: data.currentPageIndex + 1,
                clonesCountHead: data.clonesCountHead,
                clonesCountTail: data.clonesCountTail,
                particlesToScroll: data.particlesToScroll,
                particlesCount: data.particlesCount,
                particlesToShow: data.particlesToShow,
              });
            },
            _moveToParticle({ data }, particleIndex) {
              data.currentParticleIndex = getValueInRange(
                0,
                particleIndex,
                data.particlesCount - 1
              );
            },
            toggleFocused({ data }) {
              data.focused = !data.focused;
            },
            async _applyAutoplayIfNeeded({ data, methods }) {
              // prevent progress change if not infinite for first and last page
              if (
                !data.infinite &&
                ((data.autoplayDirection === NEXT &&
                  data.currentParticleIndex === data.particlesCount - 1) ||
                  (data.autoplayDirection === PREV &&
                    data.currentParticleIndex === 0))
              ) {
                progressManager.reset();
                return
              }

              if (data.autoplay) {
                const onFinish = () =>
                  switcher({
                    [NEXT]: async () => methods.showNextPage(),
                    [PREV]: async () => methods.showPrevPage(),
                  })(data.autoplayDirection);

                await progressManager.start(onFinish);
              }
            },
            // makes delayed jump to 1st or last element
            async _jumpIfNeeded({ data, methods }) {
              let jumped = false;
              if (data.infinite) {
                if (data.currentParticleIndex === 0) {
                  await methods.showParticle(
                    data.particlesCount - data.clonesCountTotal,
                    {
                      animated: false,
                    }
                  );
                  jumped = true;
                } else if (
                  data.currentParticleIndex ===
                  data.particlesCount - data.clonesCountTail
                ) {
                  await methods.showParticle(data.clonesCountHead, {
                    animated: false,
                  });
                  jumped = true;
                }
              }
              return jumped
            },
            async changePage({ data, methods }, updateStoreFn, options) {
              progressManager.reset();
              if (data.disabled) return
              data.disabled = true;

              updateStoreFn();
              await methods.offsetPage({ animated: get$1(options, 'animated', true) });
              data.disabled = false;

              const jumped = await methods._jumpIfNeeded();
              !jumped && methods._applyAutoplayIfNeeded(); // no need to wait it finishes
            },
            async showNextPage({ data, methods }, options) {
              if (data.disabled) return
              await methods.changePage(methods._next, options);
            },
            async showPrevPage({ data, methods }, options) {
              if (data.disabled) return
              await methods.changePage(methods._prev, options);
            },
            async showParticle({ methods }, particleIndex, options) {
              await methods.changePage(
                () => methods._moveToParticle(particleIndex),
                options
              );
            },
            _getParticleIndexByPageIndex({ data }, pageIndex) {
              return getParticleIndexByPageIndex({
                infinite: data.infinite,
                pageIndex,
                clonesCountHead: data.clonesCountHead,
                clonesCountTail: data.clonesCountTail,
                particlesToScroll: data.particlesToScroll,
                particlesCount: data.particlesCount,
                particlesToShow: data.particlesToShow,
              })
            },
            async showPage({ methods }, pageIndex, options) {
              const particleIndex = methods._getParticleIndexByPageIndex(pageIndex);
              await methods.showParticle(particleIndex, options);
            },
            offsetPage({ data }, options) {
              const animated = get$1(options, 'animated', true);
              return new Promise((resolve) => {
                // durationMs is an offset animation time
                data.durationMs = animated ? data.durationMsInit : 0;
                data.offset = -data.currentParticleIndex * data.particleWidth;
                setTimeout(() => {
                  resolve();
                }, data.durationMs);
              })
            },
          },
        },
        {
          onChange,
        }
      );
      const [data, methods] = reactive;

      return [{ data, progressManager }, methods, reactive._internal]
    }

    /* node_modules\svelte-carousel\src\components\Carousel\Carousel.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1 } = globals;
    const file$2 = "node_modules\\svelte-carousel\\src\\components\\Carousel\\Carousel.svelte";

    const get_dots_slot_changes = dirty => ({
    	currentPageIndex: dirty[0] & /*currentPageIndex*/ 64,
    	pagesCount: dirty[0] & /*pagesCount*/ 1024,
    	loaded: dirty[0] & /*loaded*/ 32
    });

    const get_dots_slot_context = ctx => ({
    	currentPageIndex: /*currentPageIndex*/ ctx[6],
    	pagesCount: /*pagesCount*/ ctx[10],
    	showPage: /*handlePageChange*/ ctx[15],
    	loaded: /*loaded*/ ctx[5]
    });

    const get_next_slot_changes = dirty => ({ loaded: dirty[0] & /*loaded*/ 32 });

    const get_next_slot_context = ctx => ({
    	showNextPage: /*methods*/ ctx[14].showNextPage,
    	loaded: /*loaded*/ ctx[5]
    });

    const get_default_slot_changes = dirty => ({ loaded: dirty[0] & /*loaded*/ 32 });
    const get_default_slot_context = ctx => ({ loaded: /*loaded*/ ctx[5] });
    const get_prev_slot_changes = dirty => ({ loaded: dirty[0] & /*loaded*/ 32 });

    const get_prev_slot_context = ctx => ({
    	showPrevPage: /*methods*/ ctx[14].showPrevPage,
    	loaded: /*loaded*/ ctx[5]
    });

    // (255:4) {#if arrows}
    function create_if_block_3$1(ctx) {
    	let current;
    	const prev_slot_template = /*#slots*/ ctx[37].prev;
    	const prev_slot = create_slot(prev_slot_template, ctx, /*$$scope*/ ctx[36], get_prev_slot_context);
    	const prev_slot_or_fallback = prev_slot || fallback_block_2(ctx);

    	const block = {
    		c: function create() {
    			if (prev_slot_or_fallback) prev_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (prev_slot_or_fallback) {
    				prev_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (prev_slot) {
    				if (prev_slot.p && (!current || dirty[0] & /*loaded*/ 32 | dirty[1] & /*$$scope*/ 32)) {
    					update_slot(prev_slot, prev_slot_template, ctx, /*$$scope*/ ctx[36], dirty, get_prev_slot_changes, get_prev_slot_context);
    				}
    			} else {
    				if (prev_slot_or_fallback && prev_slot_or_fallback.p && dirty[0] & /*infinite, currentPageIndex*/ 68) {
    					prev_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(prev_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(prev_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (prev_slot_or_fallback) prev_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(255:4) {#if arrows}",
    		ctx
    	});

    	return block;
    }

    // (256:60)           
    function fallback_block_2(ctx) {
    	let div;
    	let arrow;
    	let current;

    	arrow = new Arrow({
    			props: {
    				direction: "prev",
    				disabled: !/*infinite*/ ctx[2] && /*currentPageIndex*/ ctx[6] === 0
    			},
    			$$inline: true
    		});

    	arrow.$on("click", /*showPrevPage*/ ctx[23]);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(arrow.$$.fragment);
    			attr_dev(div, "class", "sc-carousel__arrow-container svelte-h7bw08");
    			add_location(div, file$2, 256, 8, 6291);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(arrow, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const arrow_changes = {};
    			if (dirty[0] & /*infinite, currentPageIndex*/ 68) arrow_changes.disabled = !/*infinite*/ ctx[2] && /*currentPageIndex*/ ctx[6] === 0;
    			arrow.$set(arrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(arrow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_2.name,
    		type: "fallback",
    		source: "(256:60)           ",
    		ctx
    	});

    	return block;
    }

    // (293:6) {#if autoplayProgressVisible}
    function create_if_block_2$1(ctx) {
    	let div;
    	let progress;
    	let current;

    	progress = new Progress({
    			props: { value: /*progressValue*/ ctx[7] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(progress.$$.fragment);
    			attr_dev(div, "class", "sc-carousel-progress__container svelte-h7bw08");
    			add_location(div, file$2, 293, 8, 7421);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(progress, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const progress_changes = {};
    			if (dirty[0] & /*progressValue*/ 128) progress_changes.value = /*progressValue*/ ctx[7];
    			progress.$set(progress_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(progress.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(progress.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(progress);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(293:6) {#if autoplayProgressVisible}",
    		ctx
    	});

    	return block;
    }

    // (299:4) {#if arrows}
    function create_if_block_1$1(ctx) {
    	let current;
    	const next_slot_template = /*#slots*/ ctx[37].next;
    	const next_slot = create_slot(next_slot_template, ctx, /*$$scope*/ ctx[36], get_next_slot_context);
    	const next_slot_or_fallback = next_slot || fallback_block_1(ctx);

    	const block = {
    		c: function create() {
    			if (next_slot_or_fallback) next_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (next_slot_or_fallback) {
    				next_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (next_slot) {
    				if (next_slot.p && (!current || dirty[0] & /*loaded*/ 32 | dirty[1] & /*$$scope*/ 32)) {
    					update_slot(next_slot, next_slot_template, ctx, /*$$scope*/ ctx[36], dirty, get_next_slot_changes, get_next_slot_context);
    				}
    			} else {
    				if (next_slot_or_fallback && next_slot_or_fallback.p && dirty[0] & /*infinite, currentPageIndex, pagesCount*/ 1092) {
    					next_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(next_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(next_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (next_slot_or_fallback) next_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(299:4) {#if arrows}",
    		ctx
    	});

    	return block;
    }

    // (300:60)           
    function fallback_block_1(ctx) {
    	let div;
    	let arrow;
    	let current;

    	arrow = new Arrow({
    			props: {
    				direction: "next",
    				disabled: !/*infinite*/ ctx[2] && /*currentPageIndex*/ ctx[6] === /*pagesCount*/ ctx[10] - 1
    			},
    			$$inline: true
    		});

    	arrow.$on("click", /*methods*/ ctx[14].showNextPage);

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(arrow.$$.fragment);
    			attr_dev(div, "class", "sc-carousel__arrow-container svelte-h7bw08");
    			add_location(div, file$2, 300, 8, 7643);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			mount_component(arrow, div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const arrow_changes = {};
    			if (dirty[0] & /*infinite, currentPageIndex, pagesCount*/ 1092) arrow_changes.disabled = !/*infinite*/ ctx[2] && /*currentPageIndex*/ ctx[6] === /*pagesCount*/ ctx[10] - 1;
    			arrow.$set(arrow_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(arrow.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(arrow.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(arrow);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block_1.name,
    		type: "fallback",
    		source: "(300:60)           ",
    		ctx
    	});

    	return block;
    }

    // (311:2) {#if dots}
    function create_if_block$1(ctx) {
    	let current;
    	const dots_slot_template = /*#slots*/ ctx[37].dots;
    	const dots_slot = create_slot(dots_slot_template, ctx, /*$$scope*/ ctx[36], get_dots_slot_context);
    	const dots_slot_or_fallback = dots_slot || fallback_block(ctx);

    	const block = {
    		c: function create() {
    			if (dots_slot_or_fallback) dots_slot_or_fallback.c();
    		},
    		m: function mount(target, anchor) {
    			if (dots_slot_or_fallback) {
    				dots_slot_or_fallback.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dots_slot) {
    				if (dots_slot.p && (!current || dirty[0] & /*currentPageIndex, pagesCount, loaded*/ 1120 | dirty[1] & /*$$scope*/ 32)) {
    					update_slot(dots_slot, dots_slot_template, ctx, /*$$scope*/ ctx[36], dirty, get_dots_slot_changes, get_dots_slot_context);
    				}
    			} else {
    				if (dots_slot_or_fallback && dots_slot_or_fallback.p && dirty[0] & /*pagesCount, currentPageIndex*/ 1088) {
    					dots_slot_or_fallback.p(ctx, dirty);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dots_slot_or_fallback, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dots_slot_or_fallback, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (dots_slot_or_fallback) dots_slot_or_fallback.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(311:2) {#if dots}",
    		ctx
    	});

    	return block;
    }

    // (317:5)         
    function fallback_block(ctx) {
    	let dots_1;
    	let current;

    	dots_1 = new Dots({
    			props: {
    				pagesCount: /*pagesCount*/ ctx[10],
    				currentPageIndex: /*currentPageIndex*/ ctx[6]
    			},
    			$$inline: true
    		});

    	dots_1.$on("pageChange", /*pageChange_handler*/ ctx[41]);

    	const block = {
    		c: function create() {
    			create_component(dots_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dots_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dots_1_changes = {};
    			if (dirty[0] & /*pagesCount*/ 1024) dots_1_changes.pagesCount = /*pagesCount*/ ctx[10];
    			if (dirty[0] & /*currentPageIndex*/ 64) dots_1_changes.currentPageIndex = /*currentPageIndex*/ ctx[6];
    			dots_1.$set(dots_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dots_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dots_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dots_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: fallback_block.name,
    		type: "fallback",
    		source: "(317:5)         ",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div3;
    	let div2;
    	let t0;
    	let div1;
    	let div0;
    	let swipeable_action;
    	let t1;
    	let t2;
    	let t3;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block0 = /*arrows*/ ctx[1] && create_if_block_3$1(ctx);
    	const default_slot_template = /*#slots*/ ctx[37].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[36], get_default_slot_context);
    	let if_block1 = /*autoplayProgressVisible*/ ctx[3] && create_if_block_2$1(ctx);
    	let if_block2 = /*arrows*/ ctx[1] && create_if_block_1$1(ctx);
    	let if_block3 = /*dots*/ ctx[4] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div1 = element("div");
    			div0 = element("div");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			if (if_block1) if_block1.c();
    			t2 = space();
    			if (if_block2) if_block2.c();
    			t3 = space();
    			if (if_block3) if_block3.c();
    			attr_dev(div0, "class", "sc-carousel__pages-container svelte-h7bw08");
    			set_style(div0, "transform", "translateX(" + /*offset*/ ctx[8] + "px)");
    			set_style(div0, "transition-duration", /*durationMs*/ ctx[9] + "ms");
    			set_style(div0, "transition-timing-function", /*timingFunction*/ ctx[0]);
    			add_location(div0, file$2, 275, 6, 6748);
    			attr_dev(div1, "class", "sc-carousel__pages-window svelte-h7bw08");
    			add_location(div1, file$2, 265, 4, 6540);
    			attr_dev(div2, "class", "sc-carousel__content-container svelte-h7bw08");
    			add_location(div2, file$2, 253, 2, 6157);
    			attr_dev(div3, "class", "sc-carousel__carousel-container svelte-h7bw08");
    			add_location(div3, file$2, 252, 0, 6108);
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			if (if_block0) if_block0.m(div2, null);
    			append_dev(div2, t0);
    			append_dev(div2, div1);
    			append_dev(div1, div0);

    			if (default_slot) {
    				default_slot.m(div0, null);
    			}

    			/*div0_binding*/ ctx[39](div0);
    			append_dev(div1, t1);
    			if (if_block1) if_block1.m(div1, null);
    			/*div1_binding*/ ctx[40](div1);
    			append_dev(div2, t2);
    			if (if_block2) if_block2.m(div2, null);
    			append_dev(div3, t3);
    			if (if_block3) if_block3.m(div3, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					action_destroyer(swipeable_action = swipeable.call(null, div0, {
    						thresholdProvider: /*swipeable_function*/ ctx[38]
    					})),
    					listen_dev(div0, "swipeStart", /*handleSwipeStart*/ ctx[16], false, false, false),
    					listen_dev(div0, "swipeMove", /*handleSwipeMove*/ ctx[18], false, false, false),
    					listen_dev(div0, "swipeEnd", /*handleSwipeEnd*/ ctx[19], false, false, false),
    					listen_dev(div0, "swipeFailed", /*handleSwipeFailed*/ ctx[20], false, false, false),
    					listen_dev(div0, "swipeThresholdReached", /*handleSwipeThresholdReached*/ ctx[17], false, false, false),
    					action_destroyer(hoverable.call(null, div1)),
    					listen_dev(div1, "hovered", /*handleHovered*/ ctx[21], false, false, false),
    					action_destroyer(tappable.call(null, div1)),
    					listen_dev(div1, "tapped", /*handleTapped*/ ctx[22], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (/*arrows*/ ctx[1]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);

    					if (dirty[0] & /*arrows*/ 2) {
    						transition_in(if_block0, 1);
    					}
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(div2, t0);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && (!current || dirty[0] & /*loaded*/ 32 | dirty[1] & /*$$scope*/ 32)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[36], dirty, get_default_slot_changes, get_default_slot_context);
    				}
    			}

    			if (!current || dirty[0] & /*offset*/ 256) {
    				set_style(div0, "transform", "translateX(" + /*offset*/ ctx[8] + "px)");
    			}

    			if (!current || dirty[0] & /*durationMs*/ 512) {
    				set_style(div0, "transition-duration", /*durationMs*/ ctx[9] + "ms");
    			}

    			if (!current || dirty[0] & /*timingFunction*/ 1) {
    				set_style(div0, "transition-timing-function", /*timingFunction*/ ctx[0]);
    			}

    			if (swipeable_action && is_function(swipeable_action.update) && dirty[0] & /*pageWindowWidth*/ 2048) swipeable_action.update.call(null, {
    				thresholdProvider: /*swipeable_function*/ ctx[38]
    			});

    			if (/*autoplayProgressVisible*/ ctx[3]) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);

    					if (dirty[0] & /*autoplayProgressVisible*/ 8) {
    						transition_in(if_block1, 1);
    					}
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					transition_in(if_block1, 1);
    					if_block1.m(div1, null);
    				}
    			} else if (if_block1) {
    				group_outros();

    				transition_out(if_block1, 1, 1, () => {
    					if_block1 = null;
    				});

    				check_outros();
    			}

    			if (/*arrows*/ ctx[1]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty[0] & /*arrows*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block_1$1(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(div2, null);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (/*dots*/ ctx[4]) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);

    					if (dirty[0] & /*dots*/ 16) {
    						transition_in(if_block3, 1);
    					}
    				} else {
    					if_block3 = create_if_block$1(ctx);
    					if_block3.c();
    					transition_in(if_block3, 1);
    					if_block3.m(div3, null);
    				}
    			} else if (if_block3) {
    				group_outros();

    				transition_out(if_block3, 1, 1, () => {
    					if_block3 = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			transition_in(default_slot, local);
    			transition_in(if_block1);
    			transition_in(if_block2);
    			transition_in(if_block3);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			transition_out(default_slot, local);
    			transition_out(if_block1);
    			transition_out(if_block2);
    			transition_out(if_block3);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block0) if_block0.d();
    			if (default_slot) default_slot.d(detaching);
    			/*div0_binding*/ ctx[39](null);
    			if (if_block1) if_block1.d();
    			/*div1_binding*/ ctx[40](null);
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Carousel", slots, ['prev','default','next','dots']);
    	let loaded = [];
    	let currentPageIndex;
    	let progressValue;
    	let offset = 0;
    	let durationMs = 0;
    	let pagesCount = 1;

    	const [{ data, progressManager }, methods, service] = createCarousel((key, value) => {
    		switcher({
    			"currentPageIndex": () => $$invalidate(6, currentPageIndex = value),
    			"progressValue": () => $$invalidate(7, progressValue = value),
    			"offset": () => $$invalidate(8, offset = value),
    			"durationMs": () => $$invalidate(9, durationMs = value),
    			"pagesCount": () => $$invalidate(10, pagesCount = value),
    			"loaded": () => $$invalidate(5, loaded = value)
    		})(key);
    	});

    	const dispatch = createEventDispatcher();
    	let { timingFunction = "ease-in-out" } = $$props;
    	let { arrows = true } = $$props;
    	let { infinite = true } = $$props;
    	let { initialPageIndex = 0 } = $$props;
    	let { duration = 500 } = $$props;
    	let { autoplay = false } = $$props;
    	let { autoplayDuration = 3000 } = $$props;
    	let { autoplayDirection = NEXT } = $$props;
    	let { pauseOnFocus = false } = $$props;
    	let { autoplayProgressVisible = false } = $$props;
    	let { dots = true } = $$props;
    	let { swiping = true } = $$props;
    	let { particlesToShow = 1 } = $$props;
    	let { particlesToScroll = 1 } = $$props;

    	async function goTo(pageIndex, options) {
    		const animated = get$1(options, "animated", true);

    		if (typeof pageIndex !== "number") {
    			throw new Error("pageIndex should be a number");
    		}

    		await methods.showPage(pageIndex, { animated });
    	}

    	async function goToPrev(options) {
    		const animated = get$1(options, "animated", true);
    		await methods.showPrevPage({ animated });
    	}

    	async function goToNext(options) {
    		const animated = get$1(options, "animated", true);
    		await methods.showNextPage({ animated });
    	}

    	let pageWindowWidth = 0;
    	let pageWindowElement;
    	let particlesContainer;

    	const pageWindowElementResizeObserver = createResizeObserver(({ width }) => {
    		$$invalidate(11, pageWindowWidth = width);
    		data.particleWidth = pageWindowWidth / data.particlesToShow;

    		applyParticleSizes({
    			particlesContainerChildren: particlesContainer.children,
    			particleWidth: data.particleWidth
    		});

    		methods.offsetPage({ animated: false });
    	});

    	function addClones() {
    		const { clonesToAppend, clonesToPrepend } = getClones({
    			clonesCountHead: data.clonesCountHead,
    			clonesCountTail: data.clonesCountTail,
    			particlesContainerChildren: particlesContainer.children
    		});

    		applyClones({
    			particlesContainer,
    			clonesToAppend,
    			clonesToPrepend
    		});
    	}

    	onMount(() => {
    		(async () => {
    			await tick();

    			if (particlesContainer && pageWindowElement) {
    				data.particlesCountWithoutClones = particlesContainer.children.length;
    				await tick();
    				data.infinite && addClones();

    				// call after adding clones
    				data.particlesCount = particlesContainer.children.length;

    				methods.showPage(initialPageIndex, { animated: false });
    				pageWindowElementResizeObserver.observe(pageWindowElement);
    			}
    		})();
    	});

    	onDestroy(() => {
    		pageWindowElementResizeObserver.disconnect();
    		progressManager.reset();
    	});

    	async function handlePageChange(pageIndex) {
    		await methods.showPage(pageIndex, { animated: true });
    	}

    	// gestures
    	function handleSwipeStart() {
    		if (!swiping) return;
    		data.durationMs = 0;
    	}

    	async function handleSwipeThresholdReached(event) {
    		if (!swiping) return;

    		await switcher({
    			[NEXT]: methods.showNextPage,
    			[PREV]: methods.showPrevPage
    		})(event.detail.direction);
    	}

    	function handleSwipeMove(event) {
    		if (!swiping) return;
    		data.offset += event.detail.dx;
    	}

    	function handleSwipeEnd() {
    		if (!swiping) return;
    		methods.showParticle(data.currentParticleIndex);
    	}

    	async function handleSwipeFailed() {
    		if (!swiping) return;
    		await methods.offsetPage({ animated: true });
    	}

    	function handleHovered(event) {
    		data.focused = event.detail.value;
    	}

    	function handleTapped() {
    		methods.toggleFocused();
    	}

    	function showPrevPage() {
    		methods.showPrevPage();
    	}

    	const writable_props = [
    		"timingFunction",
    		"arrows",
    		"infinite",
    		"initialPageIndex",
    		"duration",
    		"autoplay",
    		"autoplayDuration",
    		"autoplayDirection",
    		"pauseOnFocus",
    		"autoplayProgressVisible",
    		"dots",
    		"swiping",
    		"particlesToShow",
    		"particlesToScroll"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Carousel> was created with unknown prop '${key}'`);
    	});

    	const swipeable_function = () => pageWindowWidth / 3;

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			particlesContainer = $$value;
    			$$invalidate(13, particlesContainer);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			pageWindowElement = $$value;
    			$$invalidate(12, pageWindowElement);
    		});
    	}

    	const pageChange_handler = event => handlePageChange(event.detail);

    	$$self.$$set = $$props => {
    		if ("timingFunction" in $$props) $$invalidate(0, timingFunction = $$props.timingFunction);
    		if ("arrows" in $$props) $$invalidate(1, arrows = $$props.arrows);
    		if ("infinite" in $$props) $$invalidate(2, infinite = $$props.infinite);
    		if ("initialPageIndex" in $$props) $$invalidate(24, initialPageIndex = $$props.initialPageIndex);
    		if ("duration" in $$props) $$invalidate(25, duration = $$props.duration);
    		if ("autoplay" in $$props) $$invalidate(26, autoplay = $$props.autoplay);
    		if ("autoplayDuration" in $$props) $$invalidate(27, autoplayDuration = $$props.autoplayDuration);
    		if ("autoplayDirection" in $$props) $$invalidate(28, autoplayDirection = $$props.autoplayDirection);
    		if ("pauseOnFocus" in $$props) $$invalidate(29, pauseOnFocus = $$props.pauseOnFocus);
    		if ("autoplayProgressVisible" in $$props) $$invalidate(3, autoplayProgressVisible = $$props.autoplayProgressVisible);
    		if ("dots" in $$props) $$invalidate(4, dots = $$props.dots);
    		if ("swiping" in $$props) $$invalidate(30, swiping = $$props.swiping);
    		if ("particlesToShow" in $$props) $$invalidate(31, particlesToShow = $$props.particlesToShow);
    		if ("particlesToScroll" in $$props) $$invalidate(32, particlesToScroll = $$props.particlesToScroll);
    		if ("$$scope" in $$props) $$invalidate(36, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		onDestroy,
    		onMount,
    		tick,
    		createEventDispatcher,
    		Dots,
    		Arrow,
    		Progress,
    		NEXT,
    		PREV,
    		swipeable,
    		hoverable,
    		tappable,
    		applyParticleSizes,
    		createResizeObserver,
    		getClones,
    		applyClones,
    		get: get$1,
    		switcher,
    		createCarousel,
    		loaded,
    		currentPageIndex,
    		progressValue,
    		offset,
    		durationMs,
    		pagesCount,
    		data,
    		progressManager,
    		methods,
    		service,
    		dispatch,
    		timingFunction,
    		arrows,
    		infinite,
    		initialPageIndex,
    		duration,
    		autoplay,
    		autoplayDuration,
    		autoplayDirection,
    		pauseOnFocus,
    		autoplayProgressVisible,
    		dots,
    		swiping,
    		particlesToShow,
    		particlesToScroll,
    		goTo,
    		goToPrev,
    		goToNext,
    		pageWindowWidth,
    		pageWindowElement,
    		particlesContainer,
    		pageWindowElementResizeObserver,
    		addClones,
    		handlePageChange,
    		handleSwipeStart,
    		handleSwipeThresholdReached,
    		handleSwipeMove,
    		handleSwipeEnd,
    		handleSwipeFailed,
    		handleHovered,
    		handleTapped,
    		showPrevPage
    	});

    	$$self.$inject_state = $$props => {
    		if ("loaded" in $$props) $$invalidate(5, loaded = $$props.loaded);
    		if ("currentPageIndex" in $$props) $$invalidate(6, currentPageIndex = $$props.currentPageIndex);
    		if ("progressValue" in $$props) $$invalidate(7, progressValue = $$props.progressValue);
    		if ("offset" in $$props) $$invalidate(8, offset = $$props.offset);
    		if ("durationMs" in $$props) $$invalidate(9, durationMs = $$props.durationMs);
    		if ("pagesCount" in $$props) $$invalidate(10, pagesCount = $$props.pagesCount);
    		if ("timingFunction" in $$props) $$invalidate(0, timingFunction = $$props.timingFunction);
    		if ("arrows" in $$props) $$invalidate(1, arrows = $$props.arrows);
    		if ("infinite" in $$props) $$invalidate(2, infinite = $$props.infinite);
    		if ("initialPageIndex" in $$props) $$invalidate(24, initialPageIndex = $$props.initialPageIndex);
    		if ("duration" in $$props) $$invalidate(25, duration = $$props.duration);
    		if ("autoplay" in $$props) $$invalidate(26, autoplay = $$props.autoplay);
    		if ("autoplayDuration" in $$props) $$invalidate(27, autoplayDuration = $$props.autoplayDuration);
    		if ("autoplayDirection" in $$props) $$invalidate(28, autoplayDirection = $$props.autoplayDirection);
    		if ("pauseOnFocus" in $$props) $$invalidate(29, pauseOnFocus = $$props.pauseOnFocus);
    		if ("autoplayProgressVisible" in $$props) $$invalidate(3, autoplayProgressVisible = $$props.autoplayProgressVisible);
    		if ("dots" in $$props) $$invalidate(4, dots = $$props.dots);
    		if ("swiping" in $$props) $$invalidate(30, swiping = $$props.swiping);
    		if ("particlesToShow" in $$props) $$invalidate(31, particlesToShow = $$props.particlesToShow);
    		if ("particlesToScroll" in $$props) $$invalidate(32, particlesToScroll = $$props.particlesToScroll);
    		if ("pageWindowWidth" in $$props) $$invalidate(11, pageWindowWidth = $$props.pageWindowWidth);
    		if ("pageWindowElement" in $$props) $$invalidate(12, pageWindowElement = $$props.pageWindowElement);
    		if ("particlesContainer" in $$props) $$invalidate(13, particlesContainer = $$props.particlesContainer);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*infinite*/ 4) {
    			{
    				data.infinite = infinite;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*duration*/ 33554432) {
    			{
    				data.durationMsInit = duration;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*autoplay*/ 67108864) {
    			{
    				data.autoplay = autoplay;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*autoplayDuration*/ 134217728) {
    			{
    				data.autoplayDuration = autoplayDuration;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*autoplayDirection*/ 268435456) {
    			{
    				data.autoplayDirection = autoplayDirection;
    			}
    		}

    		if ($$self.$$.dirty[0] & /*pauseOnFocus*/ 536870912) {
    			{
    				data.pauseOnFocus = pauseOnFocus;
    			}
    		}

    		if ($$self.$$.dirty[1] & /*particlesToShow*/ 1) {
    			{
    				data.particlesToShowInit = particlesToShow;
    			}
    		}

    		if ($$self.$$.dirty[1] & /*particlesToScroll*/ 2) {
    			{
    				data.particlesToScrollInit = particlesToScroll;
    			}
    		}
    	};

    	return [
    		timingFunction,
    		arrows,
    		infinite,
    		autoplayProgressVisible,
    		dots,
    		loaded,
    		currentPageIndex,
    		progressValue,
    		offset,
    		durationMs,
    		pagesCount,
    		pageWindowWidth,
    		pageWindowElement,
    		particlesContainer,
    		methods,
    		handlePageChange,
    		handleSwipeStart,
    		handleSwipeThresholdReached,
    		handleSwipeMove,
    		handleSwipeEnd,
    		handleSwipeFailed,
    		handleHovered,
    		handleTapped,
    		showPrevPage,
    		initialPageIndex,
    		duration,
    		autoplay,
    		autoplayDuration,
    		autoplayDirection,
    		pauseOnFocus,
    		swiping,
    		particlesToShow,
    		particlesToScroll,
    		goTo,
    		goToPrev,
    		goToNext,
    		$$scope,
    		slots,
    		swipeable_function,
    		div0_binding,
    		div1_binding,
    		pageChange_handler
    	];
    }

    class Carousel extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				timingFunction: 0,
    				arrows: 1,
    				infinite: 2,
    				initialPageIndex: 24,
    				duration: 25,
    				autoplay: 26,
    				autoplayDuration: 27,
    				autoplayDirection: 28,
    				pauseOnFocus: 29,
    				autoplayProgressVisible: 3,
    				dots: 4,
    				swiping: 30,
    				particlesToShow: 31,
    				particlesToScroll: 32,
    				goTo: 33,
    				goToPrev: 34,
    				goToNext: 35
    			},
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Carousel",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get timingFunction() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timingFunction(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get arrows() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set arrows(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get infinite() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set infinite(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get initialPageIndex() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set initialPageIndex(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get duration() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set duration(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplay() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplay(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplayDuration() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplayDuration(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplayDirection() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplayDirection(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pauseOnFocus() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pauseOnFocus(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get autoplayProgressVisible() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set autoplayProgressVisible(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get dots() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set dots(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get swiping() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set swiping(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get particlesToShow() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set particlesToShow(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get particlesToScroll() {
    		throw new Error_1("<Carousel>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set particlesToScroll(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goTo() {
    		return this.$$.ctx[33];
    	}

    	set goTo(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goToPrev() {
    		return this.$$.ctx[34];
    	}

    	set goToPrev(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get goToNext() {
    		return this.$$.ctx[35];
    	}

    	set goToNext(value) {
    		throw new Error_1("<Carousel>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\pages\ads.svelte generated by Svelte v3.38.2 */

    const { console: console_1$1 } = globals;
    const file$1 = "src\\pages\\ads.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i];
    	return child_ctx;
    }

    // (93:44) {#each ar.image as arimg}
    function create_each_block_1$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (img.src !== (img_src_value = /*arimg*/ ctx[9].image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "product");
    			attr_dev(img, "class", "svelte-1n7ep5g");
    			add_location(img, file$1, 94, 52, 3640);
    			attr_dev(div, "class", "crs svelte-1n7ep5g");
    			add_location(div, file$1, 93, 48, 3569);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filData*/ 2 && img.src !== (img_src_value = /*arimg*/ ctx[9].image)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(93:44) {#each ar.image as arimg}",
    		ctx
    	});

    	return block;
    }

    // (88:40) <Carousel                                              arrows={false}                                              autoplay={true}                                              autoplayDuration={4000}                                          >
    function create_default_slot(ctx) {
    	let each_1_anchor;
    	let each_value_1 = /*ar*/ ctx[6].image;
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*filData*/ 2) {
    				each_value_1 = /*ar*/ ctx[6].image;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(88:40) <Carousel                                              arrows={false}                                              autoplay={true}                                              autoplayDuration={4000}                                          >",
    		ctx
    	});

    	return block;
    }

    // (78:20) {#each filData as ar}
    function create_each_block$1(ctx) {
    	let div10;
    	let div9;
    	let div3;
    	let div0;
    	let h10;
    	let t0_value = /*ar*/ ctx[6].title + "";
    	let t0;
    	let t1;
    	let p0;
    	let t2_value = /*ar*/ ctx[6].motto + "";
    	let t2;
    	let t3;
    	let t4;
    	let div1;
    	let carousel;
    	let t5;
    	let div2;
    	let p1;
    	let raw_value = /*ar*/ ctx[6].text + "";
    	let t6;
    	let div8;
    	let div5;
    	let div4;
    	let h11;
    	let t8;
    	let ul;
    	let li;
    	let span0;
    	let a;
    	let t9_value = /*ar*/ ctx[6].contact + "";
    	let t9;
    	let span1;
    	let t11;
    	let hr;
    	let t12;
    	let div7;
    	let div6;
    	let span2;
    	let p2;
    	let t13_value = /*ar*/ ctx[6].address + "";
    	let t13;
    	let span3;
    	let t15;
    	let div10_transition;
    	let current;

    	carousel = new Carousel({
    			props: {
    				arrows: false,
    				autoplay: true,
    				autoplayDuration: 4000,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div9 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			h10 = element("h1");
    			t0 = text(t0_value);
    			t1 = space();
    			p0 = element("p");
    			t2 = text(t2_value);
    			t3 = text(".🔥");
    			t4 = space();
    			div1 = element("div");
    			create_component(carousel.$$.fragment);
    			t5 = space();
    			div2 = element("div");
    			p1 = element("p");
    			t6 = space();
    			div8 = element("div");
    			div5 = element("div");
    			div4 = element("div");
    			h11 = element("h1");
    			h11.textContent = "CONTACT";
    			t8 = space();
    			ul = element("ul");
    			li = element("li");
    			span0 = element("span");
    			a = element("a");
    			t9 = text(t9_value);
    			span1 = element("span");
    			span1.textContent = "📞";
    			t11 = space();
    			hr = element("hr");
    			t12 = space();
    			div7 = element("div");
    			div6 = element("div");
    			span2 = element("span");
    			p2 = element("p");
    			t13 = text(t13_value);
    			span3 = element("span");
    			span3.textContent = "📍";
    			t15 = space();
    			attr_dev(h10, "class", "svelte-1n7ep5g");
    			add_location(h10, file$1, 82, 40, 2977);
    			attr_dev(p0, "class", "svelte-1n7ep5g");
    			add_location(p0, file$1, 83, 40, 3038);
    			attr_dev(div0, "class", "title svelte-1n7ep5g");
    			add_location(div0, file$1, 81, 36, 2916);
    			attr_dev(div1, "class", "carousel");
    			add_location(div1, file$1, 86, 36, 3142);
    			attr_dev(p1, "class", "svelte-1n7ep5g");
    			add_location(p1, file$1, 103, 40, 4150);
    			attr_dev(div2, "class", "text");
    			add_location(div2, file$1, 102, 36, 4090);
    			attr_dev(div3, "class", "cd svelte-1n7ep5g");
    			add_location(div3, file$1, 80, 32, 2862);
    			attr_dev(h11, "class", "svelte-1n7ep5g");
    			add_location(h11, file$1, 111, 44, 4561);
    			attr_dev(div4, "class", "title svelte-1n7ep5g");
    			add_location(div4, file$1, 110, 40, 4496);
    			attr_dev(a, "href", "tel://0880164455");
    			attr_dev(a, "class", "svelte-1n7ep5g");
    			add_location(a, file$1, 116, 53, 4831);
    			attr_dev(span0, "class", "svelte-1n7ep5g");
    			add_location(span0, file$1, 115, 48, 4771);
    			attr_dev(span1, "class", "svelte-1n7ep5g");
    			add_location(span1, file$1, 119, 49, 5043);
    			attr_dev(li, "class", "svelte-1n7ep5g");
    			add_location(li, file$1, 114, 44, 4717);
    			attr_dev(ul, "class", "svelte-1n7ep5g");
    			add_location(ul, file$1, 113, 40, 4667);
    			attr_dev(div5, "class", "cnt");
    			add_location(div5, file$1, 109, 36, 4437);
    			add_location(hr, file$1, 123, 36, 5238);
    			attr_dev(p2, "class", "svelte-1n7ep5g");
    			add_location(p2, file$1, 126, 50, 5409);
    			attr_dev(span2, "class", "svelte-1n7ep5g");
    			add_location(span2, file$1, 126, 44, 5403);
    			attr_dev(span3, "class", "svelte-1n7ep5g");
    			add_location(span3, file$1, 127, 45, 5481);
    			attr_dev(div6, "class", "lc svelte-1n7ep5g");
    			add_location(div6, file$1, 125, 40, 5341);
    			attr_dev(div7, "class", "loc svelte-1n7ep5g");
    			add_location(div7, file$1, 124, 36, 5282);
    			attr_dev(div8, "class", "contact");
    			add_location(div8, file$1, 108, 32, 4378);
    			attr_dev(div9, "class", "crd svelte-1n7ep5g");
    			add_location(div9, file$1, 79, 28, 2811);
    			attr_dev(div10, "class", "card svelte-1n7ep5g");
    			add_location(div10, file$1, 78, 24, 2727);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div9);
    			append_dev(div9, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h10);
    			append_dev(h10, t0);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(p0, t2);
    			append_dev(p0, t3);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			mount_component(carousel, div1, null);
    			append_dev(div3, t5);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			p1.innerHTML = raw_value;
    			append_dev(div9, t6);
    			append_dev(div9, div8);
    			append_dev(div8, div5);
    			append_dev(div5, div4);
    			append_dev(div4, h11);
    			append_dev(div5, t8);
    			append_dev(div5, ul);
    			append_dev(ul, li);
    			append_dev(li, span0);
    			append_dev(span0, a);
    			append_dev(a, t9);
    			append_dev(li, span1);
    			append_dev(div8, t11);
    			append_dev(div8, hr);
    			append_dev(div8, t12);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			append_dev(div6, span2);
    			append_dev(span2, p2);
    			append_dev(p2, t13);
    			append_dev(div6, span3);
    			append_dev(div10, t15);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*filData*/ 2) && t0_value !== (t0_value = /*ar*/ ctx[6].title + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*filData*/ 2) && t2_value !== (t2_value = /*ar*/ ctx[6].motto + "")) set_data_dev(t2, t2_value);
    			const carousel_changes = {};

    			if (dirty & /*$$scope, filData*/ 4098) {
    				carousel_changes.$$scope = { dirty, ctx };
    			}

    			carousel.$set(carousel_changes);
    			if ((!current || dirty & /*filData*/ 2) && raw_value !== (raw_value = /*ar*/ ctx[6].text + "")) p1.innerHTML = raw_value;			if ((!current || dirty & /*filData*/ 2) && t9_value !== (t9_value = /*ar*/ ctx[6].contact + "")) set_data_dev(t9, t9_value);
    			if ((!current || dirty & /*filData*/ 2) && t13_value !== (t13_value = /*ar*/ ctx[6].address + "")) set_data_dev(t13, t13_value);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(carousel.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div10_transition) div10_transition = create_bidirectional_transition(div10, blur, { duration: 600 }, true);
    				div10_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(carousel.$$.fragment, local);
    			if (!div10_transition) div10_transition = create_bidirectional_transition(div10, blur, { duration: 600 }, false);
    			div10_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			destroy_component(carousel);
    			if (detaching && div10_transition) div10_transition.end();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(78:20) {#each filData as ar}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let article;
    	let div10;
    	let header;
    	let div2;
    	let div0;
    	let h1;
    	let t0;
    	let strong0;
    	let t2;
    	let t3;
    	let p0;
    	let t5;
    	let nav;
    	let div1;
    	let ul0;
    	let li0;
    	let p1;
    	let t7;
    	let li1;
    	let p2;
    	let t9;
    	let li2;
    	let p3;
    	let t11;
    	let main;
    	let div4;
    	let div3;
    	let t12;
    	let footer;
    	let div9;
    	let div5;
    	let ul1;
    	let li3;
    	let a0;
    	let t13;
    	let strong1;
    	let t15;
    	let li4;
    	let a1;
    	let t17;
    	let div6;
    	let t18;
    	let div7;
    	let t19;
    	let div8;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*filData*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			article = element("article");
    			div10 = element("div");
    			header = element("header");
    			div2 = element("div");
    			div0 = element("div");
    			h1 = element("h1");
    			t0 = text("LUANAR");
    			strong0 = element("strong");
    			strong0.textContent = "OFFLINE";
    			t2 = text("ADS");
    			t3 = space();
    			p0 = element("p");
    			p0.textContent = "ADVERTISMENT BLOG";
    			t5 = space();
    			nav = element("nav");
    			div1 = element("div");
    			ul0 = element("ul");
    			li0 = element("li");
    			p1 = element("p");
    			p1.textContent = "ALL";
    			t7 = space();
    			li1 = element("li");
    			p2 = element("p");
    			p2.textContent = "COSMETICS";
    			t9 = space();
    			li2 = element("li");
    			p3 = element("p");
    			p3.textContent = "SERVICES";
    			t11 = space();
    			main = element("main");
    			div4 = element("div");
    			div3 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t12 = space();
    			footer = element("footer");
    			div9 = element("div");
    			div5 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			a0 = element("a");
    			t13 = text("view more ");
    			strong1 = element("strong");
    			strong1.textContent = "online";
    			t15 = space();
    			li4 = element("li");
    			a1 = element("a");
    			a1.textContent = "add your business";
    			t17 = space();
    			div6 = element("div");
    			t18 = space();
    			div7 = element("div");
    			t19 = space();
    			div8 = element("div");
    			attr_dev(strong0, "class", "svelte-1n7ep5g");
    			add_location(strong0, file$1, 23, 30, 595);
    			attr_dev(h1, "class", "svelte-1n7ep5g");
    			add_location(h1, file$1, 23, 20, 585);
    			attr_dev(p0, "class", "svelte-1n7ep5g");
    			add_location(p0, file$1, 24, 20, 649);
    			attr_dev(div0, "class", "title svelte-1n7ep5g");
    			add_location(div0, file$1, 22, 16, 544);
    			attr_dev(p1, "class", "svelte-1n7ep5g");
    			add_location(p1, file$1, 37, 32, 1136);
    			attr_dev(li0, "class", "nv-list svelte-1n7ep5g");
    			toggle_class(li0, "hlight", /*tab*/ ctx[0] === "all");
    			add_location(li0, file$1, 30, 28, 820);
    			attr_dev(p2, "class", "svelte-1n7ep5g");
    			add_location(p2, file$1, 46, 32, 1539);
    			attr_dev(li1, "class", "nv-list svelte-1n7ep5g");
    			toggle_class(li1, "hlight", /*tab*/ ctx[0] === "cosmetics");
    			add_location(li1, file$1, 39, 28, 1211);
    			attr_dev(p3, "class", "svelte-1n7ep5g");
    			add_location(p3, file$1, 55, 32, 1944);
    			attr_dev(li2, "class", "nv-list svelte-1n7ep5g");
    			toggle_class(li2, "hlight", /*tab*/ ctx[0] === "service");
    			add_location(li2, file$1, 48, 28, 1620);
    			attr_dev(ul0, "class", "svelte-1n7ep5g");
    			add_location(ul0, file$1, 29, 24, 786);
    			attr_dev(div1, "class", "nv svelte-1n7ep5g");
    			add_location(div1, file$1, 28, 20, 744);
    			attr_dev(nav, "class", "svelte-1n7ep5g");
    			add_location(nav, file$1, 27, 16, 717);
    			attr_dev(div2, "class", "head svelte-1n7ep5g");
    			add_location(div2, file$1, 21, 12, 508);
    			attr_dev(header, "class", "svelte-1n7ep5g");
    			add_location(header, file$1, 20, 8, 486);
    			attr_dev(div3, "class", "cards svelte-1n7ep5g");
    			add_location(div3, file$1, 76, 16, 2639);
    			attr_dev(div4, "class", "mn");
    			add_location(div4, file$1, 75, 12, 2605);
    			add_location(main, file$1, 74, 8, 2585);
    			attr_dev(strong1, "class", "svelte-1n7ep5g");
    			add_location(strong1, file$1, 144, 43, 6046);
    			attr_dev(a0, "href", "https://luanar.netlify.app/ads");
    			attr_dev(a0, "class", "svelte-1n7ep5g");
    			add_location(a0, file$1, 143, 28, 5961);
    			attr_dev(li3, "class", "svelte-1n7ep5g");
    			add_location(li3, file$1, 142, 24, 5927);
    			attr_dev(a1, "href", "tel://0880164455");
    			attr_dev(a1, "class", "svelte-1n7ep5g");
    			add_location(a1, file$1, 148, 28, 6194);
    			attr_dev(li4, "class", "svelte-1n7ep5g");
    			add_location(li4, file$1, 147, 24, 6160);
    			attr_dev(ul1, "class", "svelte-1n7ep5g");
    			add_location(ul1, file$1, 141, 20, 5897);
    			attr_dev(div5, "class", "links");
    			add_location(div5, file$1, 140, 16, 5856);
    			attr_dev(div6, "clas", "line");
    			add_location(div6, file$1, 152, 16, 6342);
    			attr_dev(div7, "clas", "line");
    			add_location(div7, file$1, 153, 16, 6379);
    			attr_dev(div8, "clas", "line");
    			add_location(div8, file$1, 154, 16, 6416);
    			attr_dev(div9, "class", "foot");
    			add_location(div9, file$1, 139, 12, 5820);
    			attr_dev(footer, "class", "svelte-1n7ep5g");
    			add_location(footer, file$1, 138, 8, 5798);
    			attr_dev(div10, "class", "ads");
    			add_location(div10, file$1, 19, 4, 459);
    			attr_dev(article, "class", "svelte-1n7ep5g");
    			add_location(article, file$1, 18, 0, 444);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div10);
    			append_dev(div10, header);
    			append_dev(header, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h1);
    			append_dev(h1, t0);
    			append_dev(h1, strong0);
    			append_dev(h1, t2);
    			append_dev(div0, t3);
    			append_dev(div0, p0);
    			append_dev(div2, t5);
    			append_dev(div2, nav);
    			append_dev(nav, div1);
    			append_dev(div1, ul0);
    			append_dev(ul0, li0);
    			append_dev(li0, p1);
    			append_dev(ul0, t7);
    			append_dev(ul0, li1);
    			append_dev(li1, p2);
    			append_dev(ul0, t9);
    			append_dev(ul0, li2);
    			append_dev(li2, p3);
    			append_dev(div10, t11);
    			append_dev(div10, main);
    			append_dev(main, div4);
    			append_dev(div4, div3);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			append_dev(div10, t12);
    			append_dev(div10, footer);
    			append_dev(footer, div9);
    			append_dev(div9, div5);
    			append_dev(div5, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a0);
    			append_dev(a0, t13);
    			append_dev(a0, strong1);
    			append_dev(ul1, t15);
    			append_dev(ul1, li4);
    			append_dev(li4, a1);
    			append_dev(div9, t17);
    			append_dev(div9, div6);
    			append_dev(div9, t18);
    			append_dev(div9, div7);
    			append_dev(div9, t19);
    			append_dev(div9, div8);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(li0, "click", /*click_handler*/ ctx[3], false, false, false),
    					listen_dev(li1, "click", /*click_handler_1*/ ctx[4], false, false, false),
    					listen_dev(li2, "click", /*click_handler_2*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tab*/ 1) {
    				toggle_class(li0, "hlight", /*tab*/ ctx[0] === "all");
    			}

    			if (dirty & /*tab*/ 1) {
    				toggle_class(li1, "hlight", /*tab*/ ctx[0] === "cosmetics");
    			}

    			if (dirty & /*tab*/ 1) {
    				toggle_class(li2, "hlight", /*tab*/ ctx[0] === "service");
    			}

    			if (dirty & /*filData*/ 2) {
    				each_value = /*filData*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let filData;
    	let $data;
    	validate_store(data, "data");
    	component_subscribe($$self, data, $$value => $$invalidate(2, $data = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Ads", slots, []);
    	let tab = "all";
    	console.log(filData);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Ads> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, tab = "all");
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, tab = "cosmetics");
    	};

    	const click_handler_2 = () => {
    		$$invalidate(0, tab = "service");
    	};

    	$$self.$capture_state = () => ({
    		data,
    		blur,
    		Carousel,
    		tab,
    		filData,
    		$data
    	});

    	$$self.$inject_state = $$props => {
    		if ("tab" in $$props) $$invalidate(0, tab = $$props.tab);
    		if ("filData" in $$props) $$invalidate(1, filData = $$props.filData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$data, tab*/ 5) {
    			$$invalidate(1, filData = $data.ads.filter(item => {
    				if (tab === "all") {
    					return item.catergory !== "all";
    				}

    				if (tab !== "all") {
    					return item.catergory === tab;
    				}
    			}));
    		}
    	};

    	return [tab, filData, $data, click_handler, click_handler_1, click_handler_2];
    }

    class Ads extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Ads",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\pages\blog.svelte generated by Svelte v3.38.2 */

    function create_fragment$1(ctx) {
    	const block = {
    		c: noop,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Blog", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Blog> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Blog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Blog",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (63:4) {#if dark === true}
    function create_if_block_5(ctx) {
    	let style;

    	const block = {
    		c: function create() {
    			style = element("style");
    			style.textContent = "html > body {\n                --bc: hsl(208, 96%, 5%) !important;\n                --hd: hsl(208, 96%, 5%) !important;\n                --nv: hsl(208, 96%, 10%) !important;\n                --tc: hsl(25, 100%, 97%) !important;\n                --tbl: hsl(207, 38%, 20%) !important;\n                --fb: hsl(207, 38%, 30%) !important;\n                --fm: hsl(207, 29%, 85%) !important;\n                --tbc: hsl(207, 38%, 30%) !important;\n\n                --ads-cd: hsl(207, 38%, 20%) !important;\n                --ads-bc: hsl(208, 96%, 5%) !important;        \n                --ads-nv1:  hsl(208, 96%, 10%) !important;\n                --ads-h1: hsl(195, 100%, 65%) !important;\n            }";
    			attr_dev(style, "class", "svelte-pvnjo");
    			add_location(style, file, 63, 8, 1654);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, style, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(style);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(63:4) {#if dark === true}",
    		ctx
    	});

    	return block;
    }

    // (170:28) {#if dark === true}
    function create_if_block_4(ctx) {
    	let span0;
    	let t1;
    	let span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "☀";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "LIGHT";
    			attr_dev(span0, "class", "svelte-pvnjo");
    			add_location(span0, file, 170, 32, 6251);
    			attr_dev(span1, "class", "svelte-pvnjo");
    			add_location(span1, file, 171, 32, 6299);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(170:28) {#if dark === true}",
    		ctx
    	});

    	return block;
    }

    // (174:28) {#if dark === false}
    function create_if_block_3(ctx) {
    	let span0;
    	let t1;
    	let span1;

    	const block = {
    		c: function create() {
    			span0 = element("span");
    			span0.textContent = "🌑";
    			t1 = space();
    			span1 = element("span");
    			span1.textContent = "DARK";
    			attr_dev(span0, "class", "svelte-pvnjo");
    			add_location(span0, file, 174, 32, 6434);
    			attr_dev(span1, "class", "svelte-pvnjo");
    			add_location(span1, file, 175, 32, 6482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span0, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, span1, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(span1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(174:28) {#if dark === false}",
    		ctx
    	});

    	return block;
    }

    // (218:4) {#if message === true}
    function create_if_block_2(ctx) {
    	let article;
    	let div2;
    	let div1;
    	let t0;
    	let t1;
    	let div0;
    	let button;
    	let mounted;
    	let dispose;
    	let each_value_1 = /*$data*/ ctx[2].common;
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	let each_value = /*$data*/ ctx[2].message;
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			article = element("article");
    			div2 = element("div");
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t0 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t1 = space();
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "GET STARTED 🚀";
    			attr_dev(button, "class", "svelte-pvnjo");
    			add_location(button, file, 236, 24, 9584);
    			attr_dev(div0, "class", "start svelte-pvnjo");
    			add_location(div0, file, 235, 20, 9540);
    			attr_dev(div1, "class", "msg svelte-pvnjo");
    			add_location(div1, file, 220, 16, 8908);
    			attr_dev(div2, "class", "message svelte-pvnjo");
    			add_location(div2, file, 219, 12, 8870);
    			attr_dev(article, "class", "svelte-pvnjo");
    			add_location(article, file, 218, 8, 8848);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, div2);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			append_dev(div1, t0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div1, t1);
    			append_dev(div1, div0);
    			append_dev(div0, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*getStarted*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 4) {
    				each_value_1 = /*$data*/ ctx[2].common;
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div1, t0);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*$data*/ 4) {
    				each_value = /*$data*/ ctx[2].message;
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, t1);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(218:4) {#if message === true}",
    		ctx
    	});

    	return block;
    }

    // (222:20) {#each $data.common as cm}
    function create_each_block_1(ctx) {
    	let h1;
    	let span0;
    	let t1;
    	let span1;
    	let t2_value = /*cm*/ ctx[15].programme + "";
    	let t2;
    	let t3;
    	let span2;
    	let t4_value = /*cm*/ ctx[15].version + "";
    	let t4;
    	let t5;
    	let span3;
    	let t7;
    	let span4;
    	let t8;
    	let t9_value = /*cm*/ ctx[15].studyYear + "";
    	let t9;
    	let t10;
    	let span5;
    	let t11;
    	let t12_value = /*cm*/ ctx[15].semester + "";
    	let t12;

    	const block = {
    		c: function create() {
    			h1 = element("h1");
    			span0 = element("span");
    			span0.textContent = "welcome to";
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			span2 = element("span");
    			t4 = text(t4_value);
    			t5 = space();
    			span3 = element("span");
    			span3.textContent = "|";
    			t7 = space();
    			span4 = element("span");
    			t8 = text("year ");
    			t9 = text(t9_value);
    			t10 = space();
    			span5 = element("span");
    			t11 = text("semester ");
    			t12 = text(t12_value);
    			attr_dev(span0, "class", "svelte-pvnjo");
    			add_location(span0, file, 223, 28, 9030);
    			attr_dev(span1, "class", "svelte-pvnjo");
    			add_location(span1, file, 224, 28, 9082);
    			attr_dev(span2, "class", "svelte-pvnjo");
    			add_location(span2, file, 226, 28, 9139);
    			attr_dev(span3, "class", "svelte-pvnjo");
    			add_location(span3, file, 227, 28, 9193);
    			attr_dev(span4, "class", "svelte-pvnjo");
    			add_location(span4, file, 228, 28, 9236);
    			attr_dev(span5, "class", "svelte-pvnjo");
    			add_location(span5, file, 229, 28, 9297);
    			attr_dev(h1, "class", "svelte-pvnjo");
    			add_location(h1, file, 222, 24, 8997);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h1, anchor);
    			append_dev(h1, span0);
    			append_dev(h1, t1);
    			append_dev(h1, span1);
    			append_dev(span1, t2);
    			append_dev(h1, t3);
    			append_dev(h1, span2);
    			append_dev(span2, t4);
    			append_dev(h1, t5);
    			append_dev(h1, span3);
    			append_dev(h1, t7);
    			append_dev(h1, span4);
    			append_dev(span4, t8);
    			append_dev(span4, t9);
    			append_dev(h1, t10);
    			append_dev(h1, span5);
    			append_dev(span5, t11);
    			append_dev(span5, t12);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 4 && t2_value !== (t2_value = /*cm*/ ctx[15].programme + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*$data*/ 4 && t4_value !== (t4_value = /*cm*/ ctx[15].version + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*$data*/ 4 && t9_value !== (t9_value = /*cm*/ ctx[15].studyYear + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*$data*/ 4 && t12_value !== (t12_value = /*cm*/ ctx[15].semester + "")) set_data_dev(t12, t12_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(222:20) {#each $data.common as cm}",
    		ctx
    	});

    	return block;
    }

    // (233:20) {#each $data.message as msg}
    function create_each_block(ctx) {
    	let p;
    	let raw_value = /*msg*/ ctx[12].messages + "";

    	const block = {
    		c: function create() {
    			p = element("p");
    			attr_dev(p, "class", "svelte-pvnjo");
    			add_location(p, file, 233, 24, 9464);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			p.innerHTML = raw_value;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$data*/ 4 && raw_value !== (raw_value = /*msg*/ ctx[12].messages + "")) p.innerHTML = raw_value;		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(233:20) {#each $data.message as msg}",
    		ctx
    	});

    	return block;
    }

    // (310:28) {#if dark === true}
    function create_if_block_1(ctx) {
    	let svg;
    	let defs;
    	let clipPath;
    	let rect0;
    	let g1;
    	let rect1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect0 = svg_element("rect");
    			g1 = svg_element("g");
    			rect1 = svg_element("rect");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(rect0, "width", "16");
    			attr_dev(rect0, "height", "15.999");
    			attr_dev(rect0, "fill", "none");
    			attr_dev(rect0, "class", "svelte-pvnjo");
    			add_location(rect0, file, 318, 45, 13744);
    			attr_dev(clipPath, "id", "a");
    			attr_dev(clipPath, "class", "svelte-pvnjo");
    			add_location(clipPath, file, 317, 41, 13682);
    			attr_dev(defs, "class", "svelte-pvnjo");
    			add_location(defs, file, 316, 37, 13635);
    			attr_dev(rect1, "width", "63");
    			attr_dev(rect1, "height", "39");
    			attr_dev(rect1, "rx", "11");
    			attr_dev(rect1, "transform", "translate(151 757)");
    			attr_dev(rect1, "fill", "#fff");
    			attr_dev(rect1, "class", "svelte-pvnjo");
    			add_location(rect1, file, 325, 41, 14152);
    			attr_dev(path, "d", "M-4613,16V9h-7V7h7V0h2V7h7V9h-7v7Z");
    			attr_dev(path, "transform", "translate(4620)");
    			attr_dev(path, "fill", "#0197f0");
    			attr_dev(path, "class", "svelte-pvnjo");
    			add_location(path, file, 334, 45, 14681);
    			attr_dev(g0, "transform", "translate(173 768)");
    			attr_dev(g0, "clip-path", "url(#a)");
    			attr_dev(g0, "class", "svelte-pvnjo");
    			add_location(g0, file, 331, 42, 14494);
    			attr_dev(g1, "transform", "translate(-151 -757)");
    			attr_dev(g1, "class", "svelte-pvnjo");
    			add_location(g1, file, 324, 37, 14075);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "63");
    			attr_dev(svg, "height", "39");
    			attr_dev(svg, "viewBox", "0 0 63 39");
    			attr_dev(svg, "class", "svelte-pvnjo");
    			add_location(svg, file, 310, 32, 13292);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect0);
    			append_dev(svg, g1);
    			append_dev(g1, rect1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(310:28) {#if dark === true}",
    		ctx
    	});

    	return block;
    }

    // (344:28) {#if dark === false}
    function create_if_block(ctx) {
    	let svg;
    	let defs;
    	let clipPath;
    	let rect0;
    	let g1;
    	let rect1;
    	let g0;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			clipPath = svg_element("clipPath");
    			rect0 = svg_element("rect");
    			g1 = svg_element("g");
    			rect1 = svg_element("rect");
    			g0 = svg_element("g");
    			path = svg_element("path");
    			attr_dev(rect0, "width", "16");
    			attr_dev(rect0, "height", "15.999");
    			attr_dev(rect0, "fill", "none");
    			attr_dev(rect0, "class", "svelte-pvnjo");
    			add_location(rect0, file, 352, 45, 15652);
    			attr_dev(clipPath, "id", "a");
    			attr_dev(clipPath, "class", "svelte-pvnjo");
    			add_location(clipPath, file, 351, 41, 15590);
    			attr_dev(defs, "class", "svelte-pvnjo");
    			add_location(defs, file, 350, 37, 15543);
    			attr_dev(rect1, "width", "63");
    			attr_dev(rect1, "height", "39");
    			attr_dev(rect1, "rx", "11");
    			attr_dev(rect1, "transform", "translate(151 757)");
    			attr_dev(rect1, "fill", "var(--bl)");
    			attr_dev(rect1, "class", "svelte-pvnjo");
    			add_location(rect1, file, 359, 41, 16060);
    			attr_dev(path, "d", "M-4613,16V9h-7V7h7V0h2V7h7V9h-7v7Z");
    			attr_dev(path, "transform", "translate(4620)");
    			attr_dev(path, "fill", "#fff");
    			attr_dev(path, "class", "svelte-pvnjo");
    			add_location(path, file, 368, 45, 16594);
    			attr_dev(g0, "transform", "translate(173 768)");
    			attr_dev(g0, "clip-path", "url(#a)");
    			attr_dev(g0, "class", "svelte-pvnjo");
    			add_location(g0, file, 365, 42, 16407);
    			attr_dev(g1, "transform", "translate(-151 -757)");
    			attr_dev(g1, "class", "svelte-pvnjo");
    			add_location(g1, file, 358, 37, 15983);
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg, "width", "63");
    			attr_dev(svg, "height", "39");
    			attr_dev(svg, "viewBox", "0 0 63 39");
    			attr_dev(svg, "class", "svelte-pvnjo");
    			add_location(svg, file, 344, 32, 15200);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, defs);
    			append_dev(defs, clipPath);
    			append_dev(clipPath, rect0);
    			append_dev(svg, g1);
    			append_dev(g1, rect1);
    			append_dev(g1, g0);
    			append_dev(g0, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(344:28) {#if dark === false}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let router;
    	let t0;
    	let if_block0_anchor;
    	let t1;
    	let section;
    	let nav0;
    	let div9;
    	let div3;
    	let div0;
    	let t2;
    	let div1;
    	let t3;
    	let div2;
    	let t4;
    	let div4;
    	let a0;
    	let span0;
    	let img0;
    	let img0_src_value;
    	let t5;
    	let span1;
    	let h10;
    	let t6_value = /*$data*/ ctx[2].common[0].programme + "";
    	let t6;
    	let t7;
    	let div6;
    	let div5;
    	let p0;
    	let t11;
    	let div8;
    	let ul0;
    	let div7;
    	let img1;
    	let img1_src_value;
    	let t12;
    	let h11;
    	let t13_value = /*$data*/ ctx[2].common[0].programme + "";
    	let t13;
    	let t14;
    	let t15;
    	let li0;
    	let a1;
    	let span2;
    	let svg0;
    	let defs0;
    	let clipPath0;
    	let rect0;
    	let g0;
    	let rect1;
    	let path0;
    	let span3;
    	let t17;
    	let li1;
    	let p1;
    	let t18;
    	let t19;
    	let li2;
    	let a2;
    	let span4;
    	let svg1;
    	let defs1;
    	let clipPath1;
    	let rect2;
    	let g1;
    	let rect3;
    	let path1;
    	let span5;
    	let t21;
    	let t22;
    	let nav1;
    	let div11;
    	let div10;
    	let ul1;
    	let li3;
    	let a3;
    	let svg2;
    	let defs2;
    	let clipPath2;
    	let rect4;
    	let g2;
    	let rect5;
    	let path2;
    	let t23;
    	let li4;
    	let a4;
    	let svg3;
    	let defs3;
    	let clipPath3;
    	let rect6;
    	let g3;
    	let rect7;
    	let path3;
    	let t24;
    	let li5;
    	let a5;
    	let t25;
    	let t26;
    	let li6;
    	let a6;
    	let svg4;
    	let defs4;
    	let clipPath4;
    	let rect8;
    	let g4;
    	let path4;
    	let t27;
    	let li7;
    	let a7;
    	let svg5;
    	let defs5;
    	let clipPath5;
    	let rect9;
    	let g5;
    	let rect10;
    	let path5;
    	let t28;
    	let div13;
    	let div12;
    	let a8;
    	let strong;
    	let t30;
    	let current;
    	let mounted;
    	let dispose;

    	router = new Router({
    			props: {
    				routes: {
    					"/": Routes,
    					"/table": Table,
    					"/info": Info,
    					"/todo": Todo,
    					"/about": About,
    					"/ads": Ads,
    					"/blog": Blog
    				}
    			},
    			$$inline: true
    		});

    	let if_block0 = /*dark*/ ctx[1] === true && create_if_block_5(ctx);
    	let if_block1 = /*dark*/ ctx[1] === true && create_if_block_4(ctx);
    	let if_block2 = /*dark*/ ctx[1] === false && create_if_block_3(ctx);
    	let if_block3 = /*message*/ ctx[0] === true && create_if_block_2(ctx);
    	let if_block4 = /*dark*/ ctx[1] === true && create_if_block_1(ctx);
    	let if_block5 = /*dark*/ ctx[1] === false && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    			t0 = space();
    			if (if_block0) if_block0.c();
    			if_block0_anchor = empty();
    			t1 = space();
    			section = element("section");
    			nav0 = element("nav");
    			div9 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div2 = element("div");
    			t4 = space();
    			div4 = element("div");
    			a0 = element("a");
    			span0 = element("span");
    			img0 = element("img");
    			t5 = space();
    			span1 = element("span");
    			h10 = element("h1");
    			t6 = text(t6_value);
    			t7 = space();
    			div6 = element("div");
    			div5 = element("div");
    			p0 = element("p");
    			p0.textContent = `${/*day*/ ctx[4]} | ${/*weekday*/ ctx[5]}`;
    			t11 = space();
    			div8 = element("div");
    			ul0 = element("ul");
    			div7 = element("div");
    			img1 = element("img");
    			t12 = space();
    			h11 = element("h1");
    			t13 = text(t13_value);
    			t14 = text(" STUDENT");
    			t15 = space();
    			li0 = element("li");
    			a1 = element("a");
    			span2 = element("span");
    			svg0 = svg_element("svg");
    			defs0 = svg_element("defs");
    			clipPath0 = svg_element("clipPath");
    			rect0 = svg_element("rect");
    			g0 = svg_element("g");
    			rect1 = svg_element("rect");
    			path0 = svg_element("path");
    			span3 = element("span");
    			span3.textContent = "LUANAR ADS";
    			t17 = space();
    			li1 = element("li");
    			p1 = element("p");
    			if (if_block1) if_block1.c();
    			t18 = space();
    			if (if_block2) if_block2.c();
    			t19 = space();
    			li2 = element("li");
    			a2 = element("a");
    			span4 = element("span");
    			svg1 = svg_element("svg");
    			defs1 = svg_element("defs");
    			clipPath1 = svg_element("clipPath");
    			rect2 = svg_element("rect");
    			g1 = svg_element("g");
    			rect3 = svg_element("rect");
    			path1 = svg_element("path");
    			span5 = element("span");
    			span5.textContent = "UPDATES";
    			t21 = space();
    			if (if_block3) if_block3.c();
    			t22 = space();
    			nav1 = element("nav");
    			div11 = element("div");
    			div10 = element("div");
    			ul1 = element("ul");
    			li3 = element("li");
    			a3 = element("a");
    			svg2 = svg_element("svg");
    			defs2 = svg_element("defs");
    			clipPath2 = svg_element("clipPath");
    			rect4 = svg_element("rect");
    			g2 = svg_element("g");
    			rect5 = svg_element("rect");
    			path2 = svg_element("path");
    			t23 = space();
    			li4 = element("li");
    			a4 = element("a");
    			svg3 = svg_element("svg");
    			defs3 = svg_element("defs");
    			clipPath3 = svg_element("clipPath");
    			rect6 = svg_element("rect");
    			g3 = svg_element("g");
    			rect7 = svg_element("rect");
    			path3 = svg_element("path");
    			t24 = space();
    			li5 = element("li");
    			a5 = element("a");
    			if (if_block4) if_block4.c();
    			t25 = space();
    			if (if_block5) if_block5.c();
    			t26 = space();
    			li6 = element("li");
    			a6 = element("a");
    			svg4 = svg_element("svg");
    			defs4 = svg_element("defs");
    			clipPath4 = svg_element("clipPath");
    			rect8 = svg_element("rect");
    			g4 = svg_element("g");
    			path4 = svg_element("path");
    			t27 = space();
    			li7 = element("li");
    			a7 = element("a");
    			svg5 = svg_element("svg");
    			defs5 = svg_element("defs");
    			clipPath5 = svg_element("clipPath");
    			rect9 = svg_element("rect");
    			g5 = svg_element("g");
    			rect10 = svg_element("rect");
    			path5 = svg_element("path");
    			t28 = space();
    			div13 = element("div");
    			div12 = element("div");
    			a8 = element("a");
    			strong = element("strong");
    			strong.textContent = "©";
    			t30 = text(" 2021 BUTAO UX | UI DEV");
    			attr_dev(div0, "class", "line-1 svelte-pvnjo");
    			add_location(div0, file, 91, 16, 2643);
    			attr_dev(div1, "class", "line-2 svelte-pvnjo");
    			add_location(div1, file, 92, 16, 2682);
    			attr_dev(div2, "class", "line-3 svelte-pvnjo");
    			add_location(div2, file, 93, 16, 2721);
    			attr_dev(div3, "class", "menu svelte-pvnjo");
    			add_location(div3, file, 85, 12, 2492);
    			if (img0.src !== (img0_src_value = "assets/logo.png")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "width", "50px");
    			attr_dev(img0, "alt", "logo");
    			attr_dev(img0, "class", "svelte-pvnjo");
    			add_location(img0, file, 98, 24, 2884);
    			attr_dev(span0, "class", "svelte-pvnjo");
    			add_location(span0, file, 97, 20, 2853);
    			attr_dev(h10, "class", "svelte-pvnjo");
    			add_location(h10, file, 101, 24, 3017);
    			attr_dev(span1, "class", "svelte-pvnjo");
    			add_location(span1, file, 100, 20, 2986);
    			attr_dev(a0, "href", "/");
    			attr_dev(a0, "class", "svelte-pvnjo");
    			add_location(a0, file, 96, 16, 2811);
    			attr_dev(div4, "class", "brand svelte-pvnjo");
    			add_location(div4, file, 95, 12, 2775);
    			attr_dev(p0, "class", "svelte-pvnjo");
    			add_location(p0, file, 107, 20, 3213);
    			attr_dev(div5, "class", "date svelte-pvnjo");
    			add_location(div5, file, 106, 16, 3174);
    			attr_dev(div6, "class", "date-time svelte-pvnjo");
    			add_location(div6, file, 105, 12, 3134);
    			if (img1.src !== (img1_src_value = "assets/head.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "width", "60px");
    			attr_dev(img1, "alt", "avatar");
    			attr_dev(img1, "class", "svelte-pvnjo");
    			add_location(img1, file, 127, 24, 3816);
    			attr_dev(h11, "class", "svelte-pvnjo");
    			add_location(h11, file, 128, 24, 3896);
    			set_style(div7, "background-image", "url('assets/draw.png')");
    			attr_dev(div7, "class", "navDisplay svelte-pvnjo");
    			add_location(div7, file, 123, 20, 3649);
    			attr_dev(rect0, "width", "16");
    			attr_dev(rect0, "height", "16");
    			attr_dev(rect0, "fill", "none");
    			attr_dev(rect0, "class", "svelte-pvnjo");
    			add_location(rect0, file, 144, 45, 4564);
    			attr_dev(clipPath0, "id", "a");
    			attr_dev(clipPath0, "class", "svelte-pvnjo");
    			add_location(clipPath0, file, 143, 41, 4502);
    			attr_dev(defs0, "class", "svelte-pvnjo");
    			add_location(defs0, file, 142, 37, 4455);
    			attr_dev(rect1, "width", "16");
    			attr_dev(rect1, "height", "16");
    			attr_dev(rect1, "fill", "none");
    			attr_dev(rect1, "class", "svelte-pvnjo");
    			add_location(rect1, file, 151, 41, 4955);
    			attr_dev(path0, "d", "M-937.766-17060.707h-1.411a4.815,4.815,0,0,1-4.234-2.637l-1.694-3.295a2.783,2.783,0,0,0-2.544-1.6H-950v-1.881h2.351a4.817,4.817,0,0,1,4.238,2.637l1.694,3.293a2.773,2.773,0,0,0,2.54,1.6h1.411v-1.883l3.766,2.826-3.766,2.822Zm-12.234,0v-1.883h2.351a2.766,2.766,0,0,0,2.073-.848l.375.941a5.282,5.282,0,0,0,.472.754,4.414,4.414,0,0,1-2.919,1.035Zm12.234-7.529h-1.411a2.78,2.78,0,0,0-2.073.848l-.375-.939a5.184,5.184,0,0,0-.472-.754,4.414,4.414,0,0,1,2.919-1.035h1.411V-17072l3.766,2.82-3.766,2.828Z");
    			attr_dev(path0, "transform", "translate(950 17074)");
    			attr_dev(path0, "fill", "var(--tc)");
    			attr_dev(path0, "class", "svelte-pvnjo");
    			add_location(path0, file, 155, 42, 5170);
    			attr_dev(g0, "clip-path", "url(#a)");
    			attr_dev(g0, "class", "svelte-pvnjo");
    			add_location(g0, file, 150, 37, 4891);
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg0, "width", "16");
    			attr_dev(svg0, "height", "16");
    			attr_dev(svg0, "viewBox", "0 0 16 16");
    			attr_dev(svg0, "class", "svelte-pvnjo");
    			add_location(svg0, file, 136, 33, 4112);
    			attr_dev(span2, "class", "svelte-pvnjo");
    			add_location(span2, file, 135, 29, 4073);
    			attr_dev(span3, "class", "svelte-pvnjo");
    			add_location(span3, file, 162, 29, 6014);
    			attr_dev(a1, "href", "/ads");
    			attr_dev(a1, "class", "svelte-pvnjo");
    			add_location(a1, file, 134, 24, 4020);
    			attr_dev(li0, "class", "svelte-pvnjo");
    			add_location(li0, file, 133, 20, 3991);
    			attr_dev(p1, "class", "svelte-pvnjo");
    			add_location(p1, file, 168, 24, 6167);
    			attr_dev(li1, "class", "svelte-pvnjo");
    			add_location(li1, file, 167, 20, 6115);
    			attr_dev(rect2, "width", "16");
    			attr_dev(rect2, "height", "16");
    			attr_dev(rect2, "fill", "none");
    			attr_dev(rect2, "class", "svelte-pvnjo");
    			add_location(rect2, file, 192, 45, 7222);
    			attr_dev(clipPath1, "id", "a");
    			attr_dev(clipPath1, "class", "svelte-pvnjo");
    			add_location(clipPath1, file, 191, 41, 7160);
    			attr_dev(defs1, "class", "svelte-pvnjo");
    			add_location(defs1, file, 190, 37, 7113);
    			attr_dev(rect3, "width", "16");
    			attr_dev(rect3, "height", "16");
    			attr_dev(rect3, "fill", "none");
    			attr_dev(rect3, "class", "svelte-pvnjo");
    			add_location(rect3, file, 199, 41, 7613);
    			attr_dev(path1, "d", "M-937.766-17060.707h-1.411a4.815,4.815,0,0,1-4.234-2.637l-1.694-3.295a2.783,2.783,0,0,0-2.544-1.6H-950v-1.881h2.351a4.817,4.817,0,0,1,4.238,2.637l1.694,3.293a2.773,2.773,0,0,0,2.54,1.6h1.411v-1.883l3.766,2.826-3.766,2.822Zm-12.234,0v-1.883h2.351a2.766,2.766,0,0,0,2.073-.848l.375.941a5.282,5.282,0,0,0,.472.754,4.414,4.414,0,0,1-2.919,1.035Zm12.234-7.529h-1.411a2.78,2.78,0,0,0-2.073.848l-.375-.939a5.184,5.184,0,0,0-.472-.754,4.414,4.414,0,0,1,2.919-1.035h1.411V-17072l3.766,2.82-3.766,2.828Z");
    			attr_dev(path1, "transform", "translate(950 17074)");
    			attr_dev(path1, "fill", "#2699fb");
    			attr_dev(path1, "class", "svelte-pvnjo");
    			add_location(path1, file, 203, 42, 7828);
    			attr_dev(g1, "clip-path", "url(#a)");
    			attr_dev(g1, "class", "svelte-pvnjo");
    			add_location(g1, file, 198, 37, 7549);
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg1, "width", "16");
    			attr_dev(svg1, "height", "16");
    			attr_dev(svg1, "viewBox", "0 0 16 16");
    			attr_dev(svg1, "class", "svelte-pvnjo");
    			add_location(svg1, file, 184, 33, 6770);
    			attr_dev(span4, "class", "svelte-pvnjo");
    			add_location(span4, file, 183, 29, 6731);
    			attr_dev(span5, "class", "svelte-pvnjo");
    			add_location(span5, file, 210, 29, 8670);
    			attr_dev(a2, "href", "https://www.luanar.netlify.app");
    			attr_dev(a2, "class", "svelte-pvnjo");
    			add_location(a2, file, 182, 24, 6661);
    			attr_dev(li2, "class", "svelte-pvnjo");
    			add_location(li2, file, 181, 20, 6632);
    			attr_dev(ul0, "class", "navlist svelte-pvnjo");
    			add_location(ul0, file, 117, 16, 3473);
    			attr_dev(div8, "class", "nav-bar svelte-pvnjo");
    			toggle_class(div8, "open", /*open*/ ctx[3]);
    			add_location(div8, file, 110, 12, 3292);
    			attr_dev(div9, "class", "nv svelte-pvnjo");
    			add_location(div9, file, 84, 8, 2463);
    			attr_dev(nav0, "class", "nav-one svelte-pvnjo");
    			add_location(nav0, file, 83, 4, 2433);
    			attr_dev(rect4, "width", "16");
    			attr_dev(rect4, "height", "16");
    			attr_dev(rect4, "fill", "none");
    			attr_dev(rect4, "class", "svelte-pvnjo");
    			add_location(rect4, file, 257, 41, 10381);
    			attr_dev(clipPath2, "id", "a");
    			attr_dev(clipPath2, "class", "svelte-pvnjo");
    			add_location(clipPath2, file, 256, 37, 10323);
    			attr_dev(defs2, "class", "svelte-pvnjo");
    			add_location(defs2, file, 255, 33, 10280);
    			attr_dev(rect5, "width", "16");
    			attr_dev(rect5, "height", "16");
    			attr_dev(rect5, "fill", "none");
    			attr_dev(rect5, "class", "svelte-pvnjo");
    			add_location(rect5, file, 264, 37, 10744);
    			attr_dev(path2, "d", "M12,16a2,2,0,0,1-2-2V12a2,2,0,0,1,2-2h2a2,2,0,0,1,2,2v2a2,2,0,0,1-2,2ZM2,16a2,2,0,0,1-2-2V12a2,2,0,0,1,2-2H4a2,2,0,0,1,2,2v2a2,2,0,0,1-2,2ZM12,6a2,2,0,0,1-2-2V2a2,2,0,0,1,2-2h2a2,2,0,0,1,2,2V4a2,2,0,0,1-2,2ZM2,6A2,2,0,0,1,0,4V2A2,2,0,0,1,2,0H4A2,2,0,0,1,6,2V4A2,2,0,0,1,4,6Z");
    			attr_dev(path2, "fill", "#2699fb");
    			attr_dev(path2, "class", "svelte-pvnjo");
    			add_location(path2, file, 268, 38, 10943);
    			attr_dev(g2, "clip-path", "url(#a)");
    			attr_dev(g2, "class", "svelte-pvnjo");
    			add_location(g2, file, 263, 33, 10684);
    			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg2, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg2, "width", "16");
    			attr_dev(svg2, "height", "16");
    			attr_dev(svg2, "viewBox", "0 0 16 16");
    			attr_dev(svg2, "class", "svelte-pvnjo");
    			add_location(svg2, file, 249, 28, 9961);
    			attr_dev(a3, "href", "/");
    			attr_dev(a3, "class", "svelte-pvnjo");
    			add_location(a3, file, 248, 24, 9911);
    			attr_dev(li3, "class", "svelte-pvnjo");
    			add_location(li3, file, 247, 20, 9882);
    			attr_dev(rect6, "width", "16");
    			attr_dev(rect6, "height", "16");
    			attr_dev(rect6, "fill", "none");
    			attr_dev(rect6, "class", "svelte-pvnjo");
    			add_location(rect6, file, 287, 41, 12014);
    			attr_dev(clipPath3, "id", "a");
    			attr_dev(clipPath3, "class", "svelte-pvnjo");
    			add_location(clipPath3, file, 286, 37, 11956);
    			attr_dev(defs3, "class", "svelte-pvnjo");
    			add_location(defs3, file, 285, 33, 11913);
    			attr_dev(rect7, "width", "16");
    			attr_dev(rect7, "height", "16");
    			attr_dev(rect7, "fill", "none");
    			attr_dev(rect7, "class", "svelte-pvnjo");
    			add_location(rect7, file, 294, 37, 12377);
    			attr_dev(path3, "d", "M2,5v9H14V5ZM13,2h2a.945.945,0,0,1,1,1V15a.945.945,0,0,1-1,1H1a.945.945,0,0,1-1-1V3A.945.945,0,0,1,1,2H3V1A.945.945,0,0,1,4,0,.945.945,0,0,1,5,1V2h6V1a1,1,0,0,1,2,0ZM12,12H10V10h2ZM9,12H7V10H9Zm3-3H10V7h2ZM9,9H7V7H9ZM6,12H4V10H6Z");
    			attr_dev(path3, "fill", "#2699fb");
    			attr_dev(path3, "fill-rule", "evenodd");
    			attr_dev(path3, "class", "svelte-pvnjo");
    			add_location(path3, file, 298, 38, 12576);
    			attr_dev(g3, "clip-path", "url(#a)");
    			attr_dev(g3, "class", "svelte-pvnjo");
    			add_location(g3, file, 293, 33, 12317);
    			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg3, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg3, "width", "16");
    			attr_dev(svg3, "height", "16");
    			attr_dev(svg3, "viewBox", "0 0 16 16");
    			attr_dev(svg3, "class", "svelte-pvnjo");
    			add_location(svg3, file, 279, 28, 11594);
    			attr_dev(a4, "href", "/table");
    			attr_dev(a4, "class", "svelte-pvnjo");
    			add_location(a4, file, 278, 24, 11539);
    			attr_dev(li4, "class", "svelte-pvnjo");
    			add_location(li4, file, 277, 20, 11510);
    			attr_dev(a5, "href", "/todo");
    			attr_dev(a5, "class", "svelte-pvnjo");
    			add_location(a5, file, 308, 24, 13186);
    			attr_dev(li5, "class", "svelte-pvnjo");
    			add_location(li5, file, 307, 20, 13157);
    			attr_dev(rect8, "width", "16.003");
    			attr_dev(rect8, "height", "16.002");
    			attr_dev(rect8, "fill", "none");
    			attr_dev(rect8, "class", "svelte-pvnjo");
    			add_location(rect8, file, 389, 41, 17623);
    			attr_dev(clipPath4, "id", "a");
    			attr_dev(clipPath4, "class", "svelte-pvnjo");
    			add_location(clipPath4, file, 388, 37, 17565);
    			attr_dev(defs4, "class", "svelte-pvnjo");
    			add_location(defs4, file, 387, 33, 17522);
    			attr_dev(path4, "d", "M12,16V4h4V16ZM6,16V0h4V16ZM0,16V8H4v8Z");
    			attr_dev(path4, "fill", "#2699fb");
    			attr_dev(path4, "class", "svelte-pvnjo");
    			add_location(path4, file, 396, 37, 17994);
    			attr_dev(g4, "clip-path", "url(#a)");
    			attr_dev(g4, "class", "svelte-pvnjo");
    			add_location(g4, file, 395, 33, 17934);
    			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg4, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg4, "width", "16.003");
    			attr_dev(svg4, "height", "16.002");
    			attr_dev(svg4, "viewBox", "0 0 16.003 16.002");
    			attr_dev(svg4, "class", "svelte-pvnjo");
    			add_location(svg4, file, 381, 28, 17187);
    			attr_dev(a6, "href", "/info");
    			attr_dev(a6, "class", "svelte-pvnjo");
    			add_location(a6, file, 380, 24, 17133);
    			attr_dev(li6, "class", "svelte-pvnjo");
    			add_location(li6, file, 379, 20, 17104);
    			attr_dev(rect9, "width", "16");
    			attr_dev(rect9, "height", "16");
    			attr_dev(rect9, "fill", "none");
    			attr_dev(rect9, "class", "svelte-pvnjo");
    			add_location(rect9, file, 415, 41, 18830);
    			attr_dev(clipPath5, "id", "a");
    			attr_dev(clipPath5, "class", "svelte-pvnjo");
    			add_location(clipPath5, file, 414, 37, 18772);
    			attr_dev(defs5, "class", "svelte-pvnjo");
    			add_location(defs5, file, 413, 33, 18729);
    			attr_dev(rect10, "width", "16");
    			attr_dev(rect10, "height", "16");
    			attr_dev(rect10, "fill", "none");
    			attr_dev(rect10, "class", "svelte-pvnjo");
    			add_location(rect10, file, 422, 37, 19193);
    			attr_dev(path5, "d", "M8,0a8,8,0,1,0,8,8A8.024,8.024,0,0,0,8,0ZM7.92,13.28a1.12,1.12,0,1,1,1.12-1.12A1.094,1.094,0,0,1,7.92,13.28Zm2.16-6.24L9.2,8a.977.977,0,0,0-.32.72.973.973,0,0,1-.96.96.924.924,0,0,1-.96-.96A1.785,1.785,0,0,1,7.6,7.28l.72-.88a1.816,1.816,0,0,0,.56-1.12A.839.839,0,0,0,8,4.4a.941.941,0,0,0-.96.72,1.045,1.045,0,0,1-.96.56A.839.839,0,0,1,5.2,4.8a.87.87,0,0,1,.08-.4A2.666,2.666,0,0,1,8,2.72a2.592,2.592,0,0,1,2.8,2.56A2.625,2.625,0,0,1,10.08,7.04Z");
    			attr_dev(path5, "fill", "#2699fb");
    			attr_dev(path5, "class", "svelte-pvnjo");
    			add_location(path5, file, 426, 38, 19392);
    			attr_dev(g5, "clip-path", "url(#a)");
    			attr_dev(g5, "class", "svelte-pvnjo");
    			add_location(g5, file, 421, 33, 19133);
    			attr_dev(svg5, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg5, "xmlns:xlink", "http://www.w3.org/1999/xlink");
    			attr_dev(svg5, "width", "16");
    			attr_dev(svg5, "height", "16");
    			attr_dev(svg5, "viewBox", "0 0 16 16");
    			attr_dev(svg5, "class", "svelte-pvnjo");
    			add_location(svg5, file, 407, 28, 18410);
    			attr_dev(a7, "href", "/about");
    			attr_dev(a7, "class", "svelte-pvnjo");
    			add_location(a7, file, 406, 24, 18355);
    			attr_dev(li7, "class", "svelte-pvnjo");
    			add_location(li7, file, 405, 20, 18326);
    			attr_dev(ul1, "class", "nav-links svelte-pvnjo");
    			add_location(ul1, file, 246, 16, 9839);
    			attr_dev(div10, "class", "nv-tools svelte-pvnjo");
    			add_location(div10, file, 245, 12, 9800);
    			attr_dev(div11, "class", "nv svelte-pvnjo");
    			add_location(div11, file, 244, 8, 9771);
    			set_style(strong, "color", "black");
    			attr_dev(strong, "class", "svelte-pvnjo");
    			add_location(strong, file, 440, 21, 20288);
    			attr_dev(a8, "href", "/about");
    			attr_dev(a8, "class", "svelte-pvnjo");
    			add_location(a8, file, 439, 16, 20241);
    			attr_dev(div12, "class", "auth svelte-pvnjo");
    			add_location(div12, file, 438, 12, 20206);
    			attr_dev(div13, "class", "aurthur svelte-pvnjo");
    			add_location(div13, file, 437, 8, 20172);
    			attr_dev(nav1, "class", "nav-two svelte-pvnjo");
    			add_location(nav1, file, 243, 4, 9741);
    			attr_dev(section, "id", "layout");
    			attr_dev(section, "class", "svelte-pvnjo");
    			add_location(section, file, 82, 0, 2407);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			insert_dev(target, t0, anchor);
    			if (if_block0) if_block0.m(document.head, null);
    			append_dev(document.head, if_block0_anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, nav0);
    			append_dev(nav0, div9);
    			append_dev(div9, div3);
    			append_dev(div3, div0);
    			append_dev(div3, t2);
    			append_dev(div3, div1);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div9, t4);
    			append_dev(div9, div4);
    			append_dev(div4, a0);
    			append_dev(a0, span0);
    			append_dev(span0, img0);
    			append_dev(a0, t5);
    			append_dev(a0, span1);
    			append_dev(span1, h10);
    			append_dev(h10, t6);
    			append_dev(div9, t7);
    			append_dev(div9, div6);
    			append_dev(div6, div5);
    			append_dev(div5, p0);
    			append_dev(div9, t11);
    			append_dev(div9, div8);
    			append_dev(div8, ul0);
    			append_dev(ul0, div7);
    			append_dev(div7, img1);
    			append_dev(div7, t12);
    			append_dev(div7, h11);
    			append_dev(h11, t13);
    			append_dev(h11, t14);
    			append_dev(ul0, t15);
    			append_dev(ul0, li0);
    			append_dev(li0, a1);
    			append_dev(a1, span2);
    			append_dev(span2, svg0);
    			append_dev(svg0, defs0);
    			append_dev(defs0, clipPath0);
    			append_dev(clipPath0, rect0);
    			append_dev(svg0, g0);
    			append_dev(g0, rect1);
    			append_dev(g0, path0);
    			append_dev(a1, span3);
    			append_dev(ul0, t17);
    			append_dev(ul0, li1);
    			append_dev(li1, p1);
    			if (if_block1) if_block1.m(p1, null);
    			append_dev(p1, t18);
    			if (if_block2) if_block2.m(p1, null);
    			append_dev(ul0, t19);
    			append_dev(ul0, li2);
    			append_dev(li2, a2);
    			append_dev(a2, span4);
    			append_dev(span4, svg1);
    			append_dev(svg1, defs1);
    			append_dev(defs1, clipPath1);
    			append_dev(clipPath1, rect2);
    			append_dev(svg1, g1);
    			append_dev(g1, rect3);
    			append_dev(g1, path1);
    			append_dev(a2, span5);
    			append_dev(section, t21);
    			if (if_block3) if_block3.m(section, null);
    			append_dev(section, t22);
    			append_dev(section, nav1);
    			append_dev(nav1, div11);
    			append_dev(div11, div10);
    			append_dev(div10, ul1);
    			append_dev(ul1, li3);
    			append_dev(li3, a3);
    			append_dev(a3, svg2);
    			append_dev(svg2, defs2);
    			append_dev(defs2, clipPath2);
    			append_dev(clipPath2, rect4);
    			append_dev(svg2, g2);
    			append_dev(g2, rect5);
    			append_dev(g2, path2);
    			append_dev(ul1, t23);
    			append_dev(ul1, li4);
    			append_dev(li4, a4);
    			append_dev(a4, svg3);
    			append_dev(svg3, defs3);
    			append_dev(defs3, clipPath3);
    			append_dev(clipPath3, rect6);
    			append_dev(svg3, g3);
    			append_dev(g3, rect7);
    			append_dev(g3, path3);
    			append_dev(ul1, t24);
    			append_dev(ul1, li5);
    			append_dev(li5, a5);
    			if (if_block4) if_block4.m(a5, null);
    			append_dev(a5, t25);
    			if (if_block5) if_block5.m(a5, null);
    			append_dev(ul1, t26);
    			append_dev(ul1, li6);
    			append_dev(li6, a6);
    			append_dev(a6, svg4);
    			append_dev(svg4, defs4);
    			append_dev(defs4, clipPath4);
    			append_dev(clipPath4, rect8);
    			append_dev(svg4, g4);
    			append_dev(g4, path4);
    			append_dev(ul1, t27);
    			append_dev(ul1, li7);
    			append_dev(li7, a7);
    			append_dev(a7, svg5);
    			append_dev(svg5, defs5);
    			append_dev(defs5, clipPath5);
    			append_dev(clipPath5, rect9);
    			append_dev(svg5, g5);
    			append_dev(g5, rect10);
    			append_dev(g5, path5);
    			append_dev(nav1, t28);
    			append_dev(nav1, div13);
    			append_dev(div13, div12);
    			append_dev(div12, a8);
    			append_dev(a8, strong);
    			append_dev(a8, t30);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(div3, "click", /*click_handler*/ ctx[8], false, false, false),
    					action_destroyer(link.call(null, a0)),
    					action_destroyer(link.call(null, a1)),
    					listen_dev(li1, "click", /*darkTogggle*/ ctx[7], false, false, false),
    					listen_dev(ul0, "click", /*click_handler_1*/ ctx[9], false, false, false),
    					listen_dev(div8, "click", /*click_handler_2*/ ctx[10], false, false, false),
    					action_destroyer(link.call(null, a3)),
    					action_destroyer(link.call(null, a4)),
    					action_destroyer(link.call(null, a5)),
    					action_destroyer(link.call(null, a6)),
    					action_destroyer(link.call(null, a7)),
    					action_destroyer(link.call(null, a8))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*dark*/ ctx[1] === true) {
    				if (if_block0) ; else {
    					if_block0 = create_if_block_5(ctx);
    					if_block0.c();
    					if_block0.m(if_block0_anchor.parentNode, if_block0_anchor);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if ((!current || dirty & /*$data*/ 4) && t6_value !== (t6_value = /*$data*/ ctx[2].common[0].programme + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*$data*/ 4) && t13_value !== (t13_value = /*$data*/ ctx[2].common[0].programme + "")) set_data_dev(t13, t13_value);

    			if (/*dark*/ ctx[1] === true) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_4(ctx);
    					if_block1.c();
    					if_block1.m(p1, t18);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*dark*/ ctx[1] === false) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_3(ctx);
    					if_block2.c();
    					if_block2.m(p1, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			if (dirty & /*open*/ 8) {
    				toggle_class(div8, "open", /*open*/ ctx[3]);
    			}

    			if (/*message*/ ctx[0] === true) {
    				if (if_block3) {
    					if_block3.p(ctx, dirty);
    				} else {
    					if_block3 = create_if_block_2(ctx);
    					if_block3.c();
    					if_block3.m(section, t22);
    				}
    			} else if (if_block3) {
    				if_block3.d(1);
    				if_block3 = null;
    			}

    			if (/*dark*/ ctx[1] === true) {
    				if (if_block4) ; else {
    					if_block4 = create_if_block_1(ctx);
    					if_block4.c();
    					if_block4.m(a5, t25);
    				}
    			} else if (if_block4) {
    				if_block4.d(1);
    				if_block4 = null;
    			}

    			if (/*dark*/ ctx[1] === false) {
    				if (if_block5) ; else {
    					if_block5 = create_if_block(ctx);
    					if_block5.c();
    					if_block5.m(a5, null);
    				}
    			} else if (if_block5) {
    				if_block5.d(1);
    				if_block5 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    			if (detaching) detach_dev(t0);
    			if (if_block0) if_block0.d(detaching);
    			detach_dev(if_block0_anchor);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(section);
    			if (if_block1) if_block1.d();
    			if (if_block2) if_block2.d();
    			if (if_block3) if_block3.d();
    			if (if_block4) if_block4.d();
    			if (if_block5) if_block5.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const key = "BUTAO-LTA-GETSTARTED-MESSAGE";
    const darkKey = "BUTAO-LTA-TOGGLE-DARK-LIGHT";

    function instance($$self, $$props, $$invalidate) {
    	let open;
    	let $data;
    	validate_store(data, "data");
    	component_subscribe($$self, data, $$value => $$invalidate(2, $data = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	console.log($data);
    	const date = new Date();
    	let day = date.toLocaleDateString("en-US", { day: "numeric" });
    	let weekday = date.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
    	let message = true;

    	if (localStorage.getItem(key) !== null) {
    		const localdata = localStorage.getItem(key);
    		message = JSON.parse(localdata);
    	}

    	function getStarted(e) {
    		$$invalidate(0, message = false);
    		localStorage.setItem(key, JSON.stringify(message));
    	}

    	let dark = false;

    	if (localStorage.getItem(darkKey) !== null) {
    		const localdata = localStorage.getItem(darkKey);
    		dark = JSON.parse(localdata);
    	}

    	function darkTogggle(e) {
    		$$invalidate(1, dark = !dark);
    		localStorage.setItem(darkKey, JSON.stringify(dark));
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(3, open = !open);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(3, open);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(3, open = !open);
    	};

    	$$self.$capture_state = () => ({
    		Router,
    		link,
    		Table,
    		Home: Routes,
    		Info,
    		Todo,
    		About,
    		Ads,
    		Blog,
    		data,
    		date,
    		day,
    		weekday,
    		message,
    		key,
    		getStarted,
    		dark,
    		darkKey,
    		darkTogggle,
    		$data,
    		open
    	});

    	$$self.$inject_state = $$props => {
    		if ("day" in $$props) $$invalidate(4, day = $$props.day);
    		if ("weekday" in $$props) $$invalidate(5, weekday = $$props.weekday);
    		if ("message" in $$props) $$invalidate(0, message = $$props.message);
    		if ("dark" in $$props) $$invalidate(1, dark = $$props.dark);
    		if ("open" in $$props) $$invalidate(3, open = $$props.open);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(3, open = false);

    	return [
    		message,
    		dark,
    		$data,
    		open,
    		day,
    		weekday,
    		getStarted,
    		darkTogggle,
    		click_handler,
    		click_handler_1,
    		click_handler_2
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
      target: document.body,
      props: {
        name: "world",
      },
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
