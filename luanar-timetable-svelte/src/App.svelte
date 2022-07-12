<script>
    import Router from "svelte-spa-router";
    import { link } from "svelte-spa-router";
    import Table from "./routes/table.svelte";
    import Home from "./routes/index.svelte";
    import Info from "./routes/info.svelte";
    import Todo from "./routes/todo.svelte";
    import About from "./pages/about.svelte";
    import Ads from "./pages/ads.svelte";
    import Blog from "./pages/blog.svelte";

    import { data } from "./stores/store.js";
    console.log($data);

    const date = new Date();
    let day = date.toLocaleDateString("en-US", { day: "numeric" });
    let weekday = date
        .toLocaleDateString("en-US", { weekday: "long" })
        .toUpperCase();

    $: open = false;

    let message = true;
    const key = "BUTAO-LTA-GETSTARTED-MESSAGE";

    if (localStorage.getItem(key) !== null) {
        const localdata = localStorage.getItem(key);
        message = JSON.parse(localdata);
        
    }
    function getStarted(e) {
        message = false;
        localStorage.setItem(key, JSON.stringify(message));
    }

    let dark = false;
    const darkKey = "BUTAO-LTA-TOGGLE-DARK-LIGHT";

    if (localStorage.getItem(darkKey) !== null) {
        const localdata = localStorage.getItem(darkKey);
        dark = JSON.parse(localdata);
    }

    function darkTogggle(e) {
        dark = !dark;
        localStorage.setItem(darkKey, JSON.stringify(dark));
    }
</script>

<Router
    routes={{
        "/": Home,
        "/table": Table,
        "/info": Info,
        "/todo": Todo,
        "/about": About,
        "/ads": Ads,
        "/blog": Blog,
    }}
/>

<svelte:head>
    {#if dark === true}
        <style>
            html > body {
                --bc: hsl(208, 96%, 5%) !important;
                --hd: hsl(208, 96%, 5%) !important;
                --nv: hsl(208, 96%, 10%) !important;
                --tc: hsl(25, 100%, 97%) !important;
                --tbl: hsl(207, 38%, 20%) !important;
                --fb: hsl(207, 38%, 30%) !important;
                --fm: hsl(207, 29%, 85%) !important;
                --tbc: hsl(207, 38%, 30%) !important;

                --ads-cd: hsl(207, 38%, 20%) !important;
                --ads-bc: hsl(208, 96%, 5%) !important;        
                --ads-nv1:  hsl(208, 96%, 10%) !important;
                --ads-h1: hsl(195, 100%, 65%) !important;
            }
        </style>
    {/if}
</svelte:head>
<section id="layout">
    <nav class="nav-one">
        <div class="nv">
            <div
                on:click={() => {
                    open = !open;
                }}
                class="menu"
            >
                <div class="line-1" />
                <div class="line-2" />
                <div class="line-3" />
            </div>
            <div class="brand">
                <a use:link href="/">
                    <span>
                        <img src="assets/logo.png" width="50px" alt="logo" />
                    </span>
                    <span>
                        <h1>{$data.common[0].programme}</h1>
                    </span>
                </a>
            </div>
            <div class="date-time">
                <div class="date">
                    <p>{day} | {weekday}</p>
                </div>
            </div>
            <div
                class:open
                on:click={() => {
                    open = !open;
                }}
                class="nav-bar"
            >
                <ul
                    on:click={() => {
                        open = open;
                    }}
                    class="navlist"
                >
                    <div
                        style="background-image: url('assets/draw.png')"
                        class="navDisplay"
                    >
                        <img src="assets/head.svg" width="60px" alt="avatar" />
                        <h1>{$data.common[0].programme} STUDENT</h1>
                    </div>



                    <li>
                        <a use:link href="/ads"
                            ><span
                                ><svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    ><defs
                                        ><clipPath id="a"
                                            ><rect
                                                width="16"
                                                height="16"
                                                fill="none"
                                            /></clipPath
                                        ></defs
                                    ><g clip-path="url(#a)"
                                        ><rect
                                            width="16"
                                            height="16"
                                            fill="none"
                                        /><path
                                            d="M-937.766-17060.707h-1.411a4.815,4.815,0,0,1-4.234-2.637l-1.694-3.295a2.783,2.783,0,0,0-2.544-1.6H-950v-1.881h2.351a4.817,4.817,0,0,1,4.238,2.637l1.694,3.293a2.773,2.773,0,0,0,2.54,1.6h1.411v-1.883l3.766,2.826-3.766,2.822Zm-12.234,0v-1.883h2.351a2.766,2.766,0,0,0,2.073-.848l.375.941a5.282,5.282,0,0,0,.472.754,4.414,4.414,0,0,1-2.919,1.035Zm12.234-7.529h-1.411a2.78,2.78,0,0,0-2.073.848l-.375-.939a5.184,5.184,0,0,0-.472-.754,4.414,4.414,0,0,1,2.919-1.035h1.411V-17072l3.766,2.82-3.766,2.828Z"
                                            transform="translate(950 17074)"
                                            fill="var(--tc)"
                                        /></g
                                    ></svg
                                ></span
                            ><span>LUANAR ADS</span></a
                        >
                    </li>


                    <li on:click={darkTogggle}>
                        <p>
                            {#if dark === true}
                                <span>☀ </span>
                                <span> LIGHT</span>
                            {/if}
                            {#if dark === false}
                                <span>🌑</span>
                                <span> DARK</span>
                            {/if}
                        </p>
                    </li>

                    
                    <li>
                        <a href="https://www.luanar.netlify.app"
                            ><span
                                ><svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    ><defs
                                        ><clipPath id="a"
                                            ><rect
                                                width="16"
                                                height="16"
                                                fill="none"
                                            /></clipPath
                                        ></defs
                                    ><g clip-path="url(#a)"
                                        ><rect
                                            width="16"
                                            height="16"
                                            fill="none"
                                        /><path
                                            d="M-937.766-17060.707h-1.411a4.815,4.815,0,0,1-4.234-2.637l-1.694-3.295a2.783,2.783,0,0,0-2.544-1.6H-950v-1.881h2.351a4.817,4.817,0,0,1,4.238,2.637l1.694,3.293a2.773,2.773,0,0,0,2.54,1.6h1.411v-1.883l3.766,2.826-3.766,2.822Zm-12.234,0v-1.883h2.351a2.766,2.766,0,0,0,2.073-.848l.375.941a5.282,5.282,0,0,0,.472.754,4.414,4.414,0,0,1-2.919,1.035Zm12.234-7.529h-1.411a2.78,2.78,0,0,0-2.073.848l-.375-.939a5.184,5.184,0,0,0-.472-.754,4.414,4.414,0,0,1,2.919-1.035h1.411V-17072l3.766,2.82-3.766,2.828Z"
                                            transform="translate(950 17074)"
                                            fill="#2699fb"
                                        /></g
                                    ></svg
                                ></span
                            ><span>UPDATES</span></a
                        >
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    {#if message === true}
        <article>
            <div class="message">
                <div class="msg">
                    {#each $data.common as cm}
                        <h1>
                            <span>welcome to</span>
                            <span>{cm.programme}</span>

                            <span>{cm.version}</span>
                            <span>|</span>
                            <span>year {cm.studyYear}</span>
                            <span>semester {cm.semester}</span>
                        </h1>
                    {/each}
                    {#each $data.message as msg}
                        <p>{@html msg.messages}</p>
                    {/each}
                    <div class="start">
                        <button on:click={getStarted}>GET STARTED 🚀</button>
                    </div>
                </div>
            </div>
        </article>
    {/if}

    <nav class="nav-two">
        <div class="nv">
            <div class="nv-tools">
                <ul class="nav-links">
                    <li>
                        <a use:link href="/">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                ><defs
                                    ><clipPath id="a"
                                        ><rect
                                            width="16"
                                            height="16"
                                            fill="none"
                                        /></clipPath
                                    ></defs
                                ><g clip-path="url(#a)"
                                    ><rect
                                        width="16"
                                        height="16"
                                        fill="none"
                                    /><path
                                        d="M12,16a2,2,0,0,1-2-2V12a2,2,0,0,1,2-2h2a2,2,0,0,1,2,2v2a2,2,0,0,1-2,2ZM2,16a2,2,0,0,1-2-2V12a2,2,0,0,1,2-2H4a2,2,0,0,1,2,2v2a2,2,0,0,1-2,2ZM12,6a2,2,0,0,1-2-2V2a2,2,0,0,1,2-2h2a2,2,0,0,1,2,2V4a2,2,0,0,1-2,2ZM2,6A2,2,0,0,1,0,4V2A2,2,0,0,1,2,0H4A2,2,0,0,1,6,2V4A2,2,0,0,1,4,6Z"
                                        fill="#2699fb"
                                    /></g
                                ></svg
                            >
                        </a>
                    </li>

                    <li>
                        <a use:link href="/table">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                ><defs
                                    ><clipPath id="a"
                                        ><rect
                                            width="16"
                                            height="16"
                                            fill="none"
                                        /></clipPath
                                    ></defs
                                ><g clip-path="url(#a)"
                                    ><rect
                                        width="16"
                                        height="16"
                                        fill="none"
                                    /><path
                                        d="M2,5v9H14V5ZM13,2h2a.945.945,0,0,1,1,1V15a.945.945,0,0,1-1,1H1a.945.945,0,0,1-1-1V3A.945.945,0,0,1,1,2H3V1A.945.945,0,0,1,4,0,.945.945,0,0,1,5,1V2h6V1a1,1,0,0,1,2,0ZM12,12H10V10h2ZM9,12H7V10H9Zm3-3H10V7h2ZM9,9H7V7H9ZM6,12H4V10H6Z"
                                        fill="#2699fb"
                                        fill-rule="evenodd"
                                    /></g
                                ></svg
                            >
                        </a>
                    </li>
                    <li>
                        <a use:link href="/todo">
                            {#if dark === true}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="63"
                                    height="39"
                                    viewBox="0 0 63 39"
                                    ><defs
                                        ><clipPath id="a"
                                            ><rect
                                                width="16"
                                                height="15.999"
                                                fill="none"
                                            /></clipPath
                                        ></defs
                                    ><g transform="translate(-151 -757)"
                                        ><rect
                                            width="63"
                                            height="39"
                                            rx="11"
                                            transform="translate(151 757)"
                                            fill="#fff"
                                        /><g
                                            transform="translate(173 768)"
                                            clip-path="url(#a)"
                                            ><path
                                                d="M-4613,16V9h-7V7h7V0h2V7h7V9h-7v7Z"
                                                transform="translate(4620)"
                                                fill="#0197f0"
                                            /></g
                                        ></g
                                    ></svg
                                >
                            {/if}
                            {#if dark === false}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    xmlns:xlink="http://www.w3.org/1999/xlink"
                                    width="63"
                                    height="39"
                                    viewBox="0 0 63 39"
                                    ><defs
                                        ><clipPath id="a"
                                            ><rect
                                                width="16"
                                                height="15.999"
                                                fill="none"
                                            /></clipPath
                                        ></defs
                                    ><g transform="translate(-151 -757)"
                                        ><rect
                                            width="63"
                                            height="39"
                                            rx="11"
                                            transform="translate(151 757)"
                                            fill="var(--bl)"
                                        /><g
                                            transform="translate(173 768)"
                                            clip-path="url(#a)"
                                            ><path
                                                d="M-4613,16V9h-7V7h7V0h2V7h7V9h-7v7Z"
                                                transform="translate(4620)"
                                                fill="#fff"
                                            /></g
                                        ></g
                                    ></svg
                                >
                            {/if}
                        </a>
                    </li>
                    <li>
                        <a use:link href="/info">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="16.003"
                                height="16.002"
                                viewBox="0 0 16.003 16.002"
                                ><defs
                                    ><clipPath id="a"
                                        ><rect
                                            width="16.003"
                                            height="16.002"
                                            fill="none"
                                        /></clipPath
                                    ></defs
                                ><g clip-path="url(#a)"
                                    ><path
                                        d="M12,16V4h4V16ZM6,16V0h4V16ZM0,16V8H4v8Z"
                                        fill="#2699fb"
                                    /></g
                                ></svg
                            >
                        </a>
                    </li>

                    <li>
                        <a use:link href="/about">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                xmlns:xlink="http://www.w3.org/1999/xlink"
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                ><defs
                                    ><clipPath id="a"
                                        ><rect
                                            width="16"
                                            height="16"
                                            fill="none"
                                        /></clipPath
                                    ></defs
                                ><g clip-path="url(#a)"
                                    ><rect
                                        width="16"
                                        height="16"
                                        fill="none"
                                    /><path
                                        d="M8,0a8,8,0,1,0,8,8A8.024,8.024,0,0,0,8,0ZM7.92,13.28a1.12,1.12,0,1,1,1.12-1.12A1.094,1.094,0,0,1,7.92,13.28Zm2.16-6.24L9.2,8a.977.977,0,0,0-.32.72.973.973,0,0,1-.96.96.924.924,0,0,1-.96-.96A1.785,1.785,0,0,1,7.6,7.28l.72-.88a1.816,1.816,0,0,0,.56-1.12A.839.839,0,0,0,8,4.4a.941.941,0,0,0-.96.72,1.045,1.045,0,0,1-.96.56A.839.839,0,0,1,5.2,4.8a.87.87,0,0,1,.08-.4A2.666,2.666,0,0,1,8,2.72a2.592,2.592,0,0,1,2.8,2.56A2.625,2.625,0,0,1,10.08,7.04Z"
                                        fill="#2699fb"
                                    /></g
                                ></svg
                            >
                        </a>
                    </li>
                </ul>
            </div>
        </div>
        <div class="aurthur">
            <div class="auth">
                <a use:link href="/about"
                    ><strong style="color:black">©</strong> 2021 BUTAO UX | UI DEV</a
                >
            </div>
        </div>
    </nav>
</section>

<style lang="scss">
    :global(body) {
        color: blue;
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }

    :root {
        --bc: linear-gradient(to bottom, #f5f5f5, #2698fb4a);
        //ads section
        --ads-cd: white;
        --ads-bc: linear-gradient(to bottom, white, seashell);        
        --ads-h1: hsl(195, 100%, 30%);
        --ads-nv: linear-gradient(to bottom right, #33ccff 0%, #ff99cc 100%);
        --ads-nv1: white;

        //all
        --bc: #f5f5f5;
        --nv: #f5f5f5;
        --tc: #404040;
        --lc: hsl(25, 100%, 97%);
        --bl: hsl(208, 96%, 57%);
        --fb: #ebf1f6;
        --fm: #d3dee7;
        --tbc: #d3dee7;
        --crd: #2698fb4a;
        --tbl: white;
        --hd: #d3dee7;
    }

    @mixin font($c, $s, $w) {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: $c;
        font-size: $s;
        font-weight: $w;
    }
    #layout {
        .nav-one {
            z-index: 99;
            position: fixed;
            width: 100%;
            background: var(--bc);
            top: 0;
            left: 0;
            .nv {
                box-shadow: #0000002c 0px 3px 11px 0px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                background: var(--nv);
                .menu {
                    padding: 20px;
                    position: relative;
                    z-index: 100;
                    background: #00000007;
                    border-radius: 4px;
                    div {
                        width: 20px;
                        height: 3px;
                        background: var(--tc);
                    }
                    .line-2 {
                        margin: 5px 0px;
                        width: 12px;
                    }
                }
                .brand {
                    padding: 0px 10px;
                    a {
                        display: flex;
                        align-items: center;
                        padding: 3px 15px;
                        text-decoration: none;
                        h1 {
                            padding: 0px 15px;
                            @include font(var(--tc), 1rem, 500);
                        }
                    }
                }
                .date-time {
                    padding: 0 5px;
                    .date {
                        background: gold;
                        border-radius: 4rem;
                        padding: 5px 8px;
                        box-shadow: black 3px 4px 13px 0px;
                        p {
                            @include font(black, 0.75rem, 800);
                            padding: 0;
                            margin: 0;
                        }
                    }
                }
                .open {
                    width: 100% !important;
                    transition: all 1s ease !important;
                    opacity: 100% !important;
                    pointer-events: all !important;
                }
                .nav-bar {
                    z-index: 99;
                    position: fixed;
                    top: 0;
                    left: 0;
                    background: #0000001e;
                    opacity: 0;
                    width: 0;
                    height: 100vh;
                    overflow: hidden;
                    padding: 0;
                    transition: all 0.5s ease;
                    pointer-events: none;
                    .navlist {
                        .navDisplay {
                            background: #00000085;
                            background-blend-mode: multiply;
                            display: flex;
                            padding-top: 105px;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            background-size: contain;
                            background-repeat: no-repeat;
                            h1 {
                                @include font(var(--lc), 0.6rem, 450);
                            }
                        }
                        background: var(--fb);
                        height: 100vh;
                        width: 65%;
                    }
                    ul {
                        display: flex;
                        flex-direction: column;
                        margin: 0;
                        padding: 0;
                        li {
                            list-style: none;
                            overflow: hidden;
                            margin: 10px 0;
                            padding: 5px;
                            p {
                                @include font(var(--tc), 0.95rem, 700);
                                margin: 0;
                                border-radius: 4px;
                                border: var(--bl) solid 0.9px;
                                display: flex;
                                justify-content: space-between;
                                align-items: center;
                                span{
                                    border: red solid 1px;
                                    padding: 20px;
                                }
                            
                            }

                            a {
                                border-radius: 2.5px;
                                border: var(--bl) solid 0.9px;
                                text-decoration: none;
                                display: block;
                                padding: 25px 0;
                                @include font(var(--tc), 0.95rem, 500);
                                
                                display: flex;
                                justify-content: center;
                                align-items: center;

                                span {
                                    padding: 0px 5px;
                                    svg {
                                        filter: grayscale(50%);
                                    }
                                }
                            }
                            &:hover {
                                background: #2699fb;
                            }
                        }
                        li:nth-child(4){
                            margin-top: auto;
                            a{
                                margin: 5px;
                                background: var(--fb);
                                border-radius: 4px;
                                color: var(--lc) !important;
                            }
                        }
                    }
                }
            }
        }

        article {
            background: rgba(0, 0, 0, 0.438);
            position: fixed;
            height: 100vh;
            width: 100%;
            top: 0;
            left: 0;
            z-index: 110;
            display: flex;
            align-items: center;
            justify-content: center;

            .message {
                background-image: url("/assets/draw.png");
                background-blend-mode: multiply;
                background-color: rgba(0, 0, 0, 0.871);
                background-repeat: no-repeat;
                background-position: center;
                background-size: cover;
                padding: 5px;
                margin: 10px;
                .msg {
                    letter-spacing: 1px;
                    h1 {
                        text-align: center;
                        margin: 10px 0;
                        @include font(var(--bl), 1rem, 800);
                        text-transform: uppercase;
                    }
                    p {
                        margin: 20px 0;
                        @include font(var(--lc), 0.9rem, 450);
                    }
                    .start {
                        button {
                            @include font(var(--tc), 1rem, 550);
                            width: 100%;
                            border: none;
                            background: var(--tbc);
                        }
                    }
                }
            }
        }
        .nav-two {
            border-top-left-radius: 1.6rem;
            border-top-right-radius: 1.6rem;
            box-shadow: #00000040 0px -3px 9px;
            background: var(--nv);
            position: fixed;
            z-index: 2;
            left: 0;
            bottom: 0;
            width: 100%;
            .aurthur {
                text-align: center;
                padding: 5px 10px;
                .auth {
                    display: none;
                    pointer-events: none;
                    border-top: solid 0.9px #2699fb;
                    a {
                        @include font(hsl(208, 96%, 20%), 0.8rem, 400);
                        letter-spacing: 1px;
                        padding: 5px;
                        text-decoration: none;
                    }
                }
            }
            .nv {
                display: flex;
                justify-content: space-between;
                align-items: center;
                .nv-tools {
                    flex: 1;
                    height: auto;
                    ul {
                        padding: 10px;
                        margin: 0;
                    }
                    .nav-links {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;

                        li {
                            list-style: none;
                            padding: 0;
                            margin: 0;
                            a {
                                filter: grayscale(35%);
                                display: block;
                                padding: 10px 15px;
                                height: 100%;
                                border-radius: 6px;
                                background: transparent;
                                box-shadow: 0 0 20px rgba(0, 0, 0, 0.07);
                                animation: bouncer
                                    cubic-bezier(0.455, 0.03, 0.515, 0.955)
                                    0.75s infinite alternate;

                                svg {
                                    animation: bouncer
                                        cubic-bezier(0.455, 0.03, 0.515, 0.955)
                                        0.75s infinite alternate;
                                }
                            }
                        }
                        li:nth-child(1) {
                            a {
                                animation-delay: calc(0s + (0.1s * 4));
                                svg {
                                    animation-delay: calc(0s + (0.1s * 4));
                                    box-shadow: none !important;
                                }
                            }
                        }
                        li:nth-child(2) {
                            a {
                                animation-delay: calc(0s + (0.1s * 6));
                                svg {
                                    animation-delay: calc(0s + (0.1s * 6));
                                    box-shadow: none !important;
                                }
                            }
                        }
                        li:nth-child(3) {
                            a {
                                animation-delay: calc(0s + (0.1s * 8));
                                padding: 4px;
                                box-shadow: none !important;
                                svg {
                                    animation-delay: calc(0s + (0.1s * 8));
                                }
                            }
                        }
                        li:nth-child(4) {
                            a {
                                animation-delay: calc(0s + (0.1s * 10));
                                svg {
                                    box-shadow: none !important;
                                    animation-delay: calc(0s + (0.1s * 10));
                                }
                            }
                        }
                        li:nth-child(5) {
                            a {
                                animation-delay: calc(0s + (0.1s * 12));
                                svg {
                                    box-shadow: none !important;
                                    animation-delay: calc(0s + (0.1s * 12));
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    @keyframes bouncer {
        to {
            box-shadow: 0 0 15px rgba(0, 0, 0, 0.474);
            transform: scale(1) translateY(-3.4px);
        }
    }
</style>
