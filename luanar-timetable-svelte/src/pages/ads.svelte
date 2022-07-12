<script>
    import { data } from "../stores/store.js";
    import { blur } from "svelte/transition";
    import Carousel from "svelte-carousel";
    let tab = "all";

    $: filData = $data.ads.filter((item) => {
        if (tab === "all") {
            return item.catergory !== "all";
        }
        if (tab !== "all") {
            return item.catergory === tab;
        }
    });

    console.log(filData);
</script>

<article>
    <div class="ads">
        <header>
            <div class="head">
                <div class="title">
                    <h1>LUANAR<strong>OFFLINE</strong>ADS</h1>
                    <p>ADVERTISMENT BLOG</p>
                </div>

                <nav>
                    <div class="nv">
                        <ul>
                            <li
                                class:hlight={tab === "all"}
                                on:click={() => {
                                    tab = "all";
                                }}
                                class="nv-list"
                            >
                                <p>ALL</p>
                            </li>
                            <li
                                class:hlight={tab === "cosmetics"}
                                on:click={() => {
                                    tab = "cosmetics";
                                }}
                                class="nv-list"
                            >
                                <p>COSMETICS</p>
                            </li>
                            <li
                                class:hlight={tab === "service"}
                                on:click={() => {
                                    tab = "service";
                                }}
                                class="nv-list"
                            >
                                <p>SERVICES</p>
                            </li>
                            <!--
                            <li
                                class:hlight={tab === 'food'}
                                on:click={() => {
                                    tab = "food";
                                }}
                                class="nv-list"
                            >
                                <p>FOOD</p>
                            </li>
                        -->
                        </ul>
                    </div>
                </nav>
            </div>
        </header>

        <main>
            <div class="mn">
                <div class="cards">
                    {#each filData as ar}
                        <div transition:blur={{ duration: 600 }} class="card">
                            <div class="crd">
                                <div class="cd">
                                    <div class="title">
                                        <h1>{ar.title}</h1>
                                        <p>{ar.motto}.🔥</p>
                                    </div>

                                    <div class="carousel">
                                        <Carousel
                                            arrows={false}
                                            autoplay={true}
                                            autoplayDuration={4000}
                                        >
                                            {#each ar.image as arimg}
                                                <div class="crs">
                                                    <img
                                                        src={arimg.image}
                                                        alt="product"
                                                    />
                                                </div>
                                            {/each}
                                        </Carousel>
                                    </div>
                                    <div class="text">
                                        <p>
                                            {@html ar.text}
                                        </p>
                                    </div>
                                </div>
                                <div class="contact">
                                    <div class="cnt">
                                        <div class="title">
                                            <h1>CONTACT</h1>
                                        </div>
                                        <ul>
                                            <li>
                                                <span
                                                    ><a href="tel://0880164455"
                                                        >{ar.contact}</a
                                                    ></span
                                                ><span>📞</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <hr />
                                    <div class="loc">
                                        <div class="lc">
                                            <span><p>{ar.address}</p></span
                                            ><span>📍</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>
            </div>
        </main>

        <footer>
            <div class="foot">
                <div class="links">
                    <ul>
                        <li>
                            <a href="https://luanar.netlify.app/ads"
                                >view more <strong>online</strong></a
                            >
                        </li>
                        <li>
                            <a href="tel://0880164455">add your business</a>
                        </li>
                    </ul>
                </div>
                <div clas="line" />
                <div clas="line" />
                <div clas="line" />
            </div>
        </footer>
    </div>
</article>

<style lang="scss">
    @mixin font($c, $s, $w) {
        font-family: Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        color: $c;
        font-size: $s;
        font-weight: $w;
    }
    footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background: var(--ads-nv);

        .foot {
            .links {
                ul {
                    padding: 0;
                    margin: 0;
                    list-style: none;
                    padding: 0 10px;
                    li {
                        padding: 10px 0;
                        width: 100%;
                        a {
                            text-decoration: none;
                            display: block;

                            background: var(--fb);
                            border-radius: 5px;
                            padding: 10px;
                            @include font(var(--tc), 1rem, 600);
                            text-align: center;
                        }
                    }
                }
            }
        }
    }

    article {
        position: relative;
        z-index: 120;
        padding: 25vh 10px;
        background: var(--ads-bc);

        .ads {
            header {
                position: fixed;
                width: 100%;
                top: 0;
                left: 0;
                background: var(--ads-nv1);
                z-index: 100;
                box-shadow: rgba(0, 0, 0, 0.452) 0 4px 5px 0;
                border-bottom-left-radius: 1rem;
                border-bottom-right-radius: 1rem;
                .head {
                    padding: 10px;
                    .title {
                        padding: 20px 0;
                        padding-bottom: 0;
                        h1 {
                            @include font(var(--ads-h1), 1.1rem, 800);
                            margin: 5px 0;
                            padding: 0;
                            strong {
                                background-color: hsl(330, 100%, 45%);
                                color: var(--lc);
                                font-weight: 700;
                                margin: 0 4px;
                                padding: 5px 6px;
                                border-radius: 5px;
                            }
                        }
                        p {
                            text-align: end;
                            @include font(var(--tc), 0.8rem, 500);
                        }
                    }
                    nav {
                        background: var(--ads-nv);
                        box-shadow: rgba(0, 0, 0, 0.452) 0 4px 5px 0;
                        border-radius: 4px;

                        .nv {
                            padding: 3px 10px;
                            ul {
                                padding: 0;
                                list-style: none;
                                display: flex;
                                align-items: center;
                                justify-content: space-between;
                                padding: 0 10px;
                                margin-bottom: 0;
                                li {
                                    p {
                                        padding: 5px;
                                        margin: 0;
                                        @include font(var(--tc), 0.8rem, 500);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            main {
                .mn {
                    .cards {
                        display: flex;
                        flex-direction: column-reverse;
                        .card {
                            background: var(--ads-cd);
                            margin: 10px 0;
                            box-shadow: black 0px 4px 8px 1px;
                            .crd {
                                padding: 10px;
                                .cd {
                                    padding: 5px;
                                    position: relative;

                                    .title {
                                        h1 {
                                            padding: 10px;
                                            margin: 2px 0;
                                            border-radius: 4px;
                                            text-transform: uppercase;
                                            @include font(black, 1rem, 800);
                                            border-bottom: var(--bl) solid 1px;
                                            background: linear-gradient(
                                                to bottom right,
                                                hsl(200, 100%, 80%) 0%,
                                                hsl(300, 100%, 80%) 100%
                                            );
                                            box-shadow: #000000 4px 4px 5px 0px;
                                            text-align: center;
                                        }
                                        p {
                                            @include font(
                                                var(--tc),
                                                0.8rem,
                                                450
                                            );
                                        }
                                    }
                                    .carousel {
                                        .crs {
                                            max-height: 350px;
                                            img {
                                                width: 100%;
                                            }
                                        }
                                    }
                                    .text {
                                        p {
                                            @include font(
                                                var(--tc),
                                                0.9rem,
                                                600
                                            );
                                            padding: 0;
                                        }
                                    }
                                }
                                .contact {
                                    .cnt {
                                        .title {
                                            h1 {
                                                margin: 5px 0;
                                                padding: 0;
                                                @include font(
                                                    var(--bl),
                                                    1rem,
                                                    800
                                                );
                                            }
                                        }
                                        ul {
                                            padding: 0;
                                            margin: 0;
                                            list-style: none;
                                            span:nth-child(1) {
                                                flex: 1;
                                            }
                                            span:nth-child(2) {
                                                border-radius: 4rem;
                                                background: var(--fb);
                                                padding: 10px 15px;
                                                margin: 0 5px;
                                            }
                                            li {
                                                padding: 10px 0;
                                                display: flex;
                                                align-items: center;
                                                justify-content: space-between;
                                                a {
                                                    text-decoration: none;
                                                    padding: 10px;
                                                    display: block;
                                                    background: var(--fb);
                                                    border-radius: 4rem;
                                                    @include font(
                                                        var(--tc),
                                                        0.9rem,
                                                        500
                                                    );
                                                    border: solid var(--bl) 1px;
                                                }
                                            }
                                        }
                                    }
                                    .loc {
                                        text-align: end;
                                        .lc {
                                            @include font(var(--tc), 1rem, 500);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    .hlight {
        border-bottom: seashell solid 1px;
        background: transparent;
        border-radius: 4rem;
        padding: 5px 15px;
        animation: line cubic-bezier(0.455, 0.03, 0.515, 0.955) 0.75s infinite
            alternate;
    }
    @keyframes line {
        to {
            border-bottom: seashell solid 2px;
            background: rgba(255, 255, 255, 0.22);
        }
    }
</style>
