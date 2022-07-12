<script>
    import {data} from "../stores/store.js";
    
</script>
<article>
    <div class="content">
        <header>
            <div class="head">
                <a href="/#/">                
                    <div class="logo">
                        <img src="assets/logo.png" width="60px" alt="logo">
                    </div>
                </a>
                <div class="head-content">
                    <h1>{$data.common[0].programme} TIME TABLE</h1>
                    <h2>VERSION {$data.common[0].version}</h2>
                    <p>© COPYRIGHT | 2021 BUTAO PETER</p>
                    <p>in association with</p>
                    <p>
                        <a href="https://developerafrica,netlify.app">DEVELOPER AFRICA | 2022</a>
                    </p>
                    <hr>
                    <p>MAKA HOUSE 🐼 | 2022</p>
                </div>
            </div>
        </header>

        <main>
            <div class="main">

                <ul>
                    <li><h1>APP INFO</h1></li>
                    <!--<li><a href="./info/readme.html">Read Me</a></li>-->
                    <li><a href="./info/licence.html">Licence</a></li>
                </ul>
                <ul>
                    <li><h1>DEV</h1></li>
                    <p class="notfy"> get in touch with the development team</p>
                    <li><a href="mailto://peterethanbutao@gmail.com">peterethanbutao@gmail.com</a></li>
                    <li><a href="https://www.butaopeter.netlify.app">peterbutao.netlify.app</a></li>
                    <li><a href="tel://0880164455">0880164455</a></li>
                </ul>
                <ul>
                    <li><h1>RATING</h1></li>
                    <li><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="112" height="16" viewBox="0 0 112 16"><defs><clipPath id="a"><rect width="16" height="16" fill="none"/></clipPath><linearGradient id="e" x1="0.124" y1="0.42" x2="0.544" y2="0.454" gradientUnits="objectBoundingBox"><stop offset="0" stop-color="#2699fb"/><stop offset="0.498" stop-color="#175b95"/><stop offset="1"/></linearGradient></defs><g transform="translate(-54 -618)" opacity="0.52"><g transform="translate(54 618)" clip-path="url(#a)"><path d="M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z" fill="#2699fb"/><rect width="16" height="16" transform="translate(0 0)" fill="none"/></g><g transform="translate(78 618)" clip-path="url(#a)"><path d="M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z" fill="#2699fb"/><rect width="16" height="16" transform="translate(0 0)" fill="none"/></g><g transform="translate(102 618)" clip-path="url(#a)"><path d="M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z" fill="#2699fb"/><rect width="16" height="16" transform="translate(0 0)" fill="none"/></g><g transform="translate(126 618)" clip-path="url(#a)"><path d="M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z" fill="url(#e)"/><rect width="16" height="16" transform="translate(0 0)" fill="none"/></g><g transform="translate(150 618)" clip-path="url(#a)"><path d="M8,0l2.5,5,5.5.8L12,9.7l.9,5.5L8,12.6,3.1,15.2,4,9.7,0,5.8,5.5,5Z"/><rect width="16" height="16" transform="translate(0 0)" fill="none"/></g></g></svg></li>
                </ul>
                <ul>
                    <li><h1>READ ME</h1></li>
                    <li class="inst-msg">
                        {#each $data.message as dt}
                        <p class="instruct">{@html dt.messages}</p>
                        {/each}
                    </li>
                </ul>

            </div>
        </main>
    </div>
</article>


<style lang="scss">
    @mixin font($c, $s, $w) {
        font-family:Avenir, Helvetica, Arial, sans-serif;
        -webkit-font-smoothing:antialiased;
        -moz-osx-font-smoothing:grayscale;
        color:$c;
        font-size: $s;
        font-weight:$w;

    }
    article{
        background: var(--bc);

        position: relative;
        z-index: 150;
        width:100%;
        
        top:0;
        .content{
            padding-top: 5vh;
            padding-bottom: 10vh;
            main{
                .main{
                    ul{
                        padding:0;
                        margin:0;
                        .notfy{
                            padding: 10px;
                            @include font(var(--bl), 0.95rem, 450);
                            background: var(--fb);
                            border-radius: 4px;
                            margin: 10px;
                            box-shadow: rgba(0, 0, 0, 0.315) 3px 4px 4px 3px;
                        }
                        .inst-msg{

                            background: var(--fb);
                            border-radius: 4px;
                            margin: 10px;
                            padding: 10px;
                            box-shadow: rgba(0, 0, 0, 0.315) 3px 4px 4px 3px;
                            p{

                                @include font(var(--tc), 0.95rem, 450);
                                padding: 10px;
                            }
                        }
                                              
                        li{
                            list-style: none;
                            padding: 5px ;
                            h1{
                                @include font(var(--bl), 1rem, 500)
                            }
                            a{
                                @include font(var(--tc), 0.95rem, 500);
                                text-decoration: none;
                                padding: 10px;
                                
                            }
                            svg{
                                padding: 10px;
                            }
                        }
                    }
                }
            }
            header{
                .head{
                    display: flex;
                    align-items: center;
                    flex-direction: column;
                    justify-content: center;
                    text-align: center;
                 
                    h1{
                        @include font(var(--tc), 1rem, 500);
                    }
                    h2{
                        @include font(var(--tc), 0.75rem, 800);
                    }
                    p{
                        @include font(var(--tc), 0.85rem, 400);
                        padding-top: 10px;
                        a{
                            text-decoration: none;
                            @include font(var(--tc), 0.85rem, 400);

                        }
                    }
                }
            }
        }
    }
</style>