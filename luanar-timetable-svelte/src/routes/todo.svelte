<script>
    $: toggle = false;
    $: error = false;
    
    let date = new Date;

    let ti = '';
    let st = '';
    let lc = '';

 
    class ReminderObj{
        constructor(ti,st,lc){
            this.id = `${this.uuid()}-${this.uuid()}`;
            this.date = this.date();
            this.title = ti;
            this.startTime = st;
            this.location = lc;
        };
        date () {
            const dateIn = new Date();
            return dateIn.toLocaleDateString();
        };



        uuid() {

            const str1 = 'abcdefghijklm';
            const num1 = Math.floor(Math.random() * 13);
            const strNum1 = num1 - 1
            const subStr1 = str1.substring(strNum1, num1);
            const idNum1 = Math.floor(Math.random() * 9);
            const str = 'nopqrstuvwxyz';
            const num = Math.floor(Math.random() * 13);
            const strNum = num - 1

            const subStr = str.substring(strNum, num);
            const idNum = Math.floor(Math.random() * 9);

            

            const id  = `${subStr1}${idNum1}${subStr}${idNum}`;



            if (id.length == 3) {

                const num2 = `${Math.floor(Math.random() * 9)}`;

                const idMod = id + num2 ;

                return idMod;

            }else if(id.length == 2){

                const numM1 = `${Math.floor(Math.random() * 9)}`;
                const numM2 = `${Math.floor(Math.random() * 9)}`;

                const idMod2 = id + numM1 + numM2 ;

                return idMod2;

                
            }else{
                return id;
            };
        };
    }
    const key =  "BUTAO-LTA-V1.2.1";
    let listData = [];

    if(localStorage.getItem(key) !== null){
        const localdata  = localStorage.getItem(key);
        const newdata = JSON.parse(localdata) 
        
        listData = [...newdata]                     
    }

    function submit(e){
        e.preventDefault();
            if (st == ""){
                st = "00:00 🕒"
            };
            if (lc == ""){
                lc = "unset location 📍"
            }
        

        const data =  new ReminderObj(ti,st,lc);
        console.log(data)
        
        if (ti == "" ){
            error = true
            setTimeout(() => {
                error  = false                
            }, 5000);
        };


        
        
        if (ti !== ""){ 


          
            
            if(localStorage.getItem(key) === null) {
                listData = [...listData, data];
                localStorage.setItem(key, JSON.stringify(listData))
            }else{
                listData = JSON.parse(localStorage.getItem(key))
                listData = [...listData, data]
                localStorage.setItem(key, JSON.stringify(listData))
            }

            ti = "";
            
        };
    }
    function dispatchdel(e){
        console.log(e + "deleted")
        
       
        listData = JSON.parse(localStorage.getItem(key))
        const newListData = listData.filter(item =>{ return item.id !== e });
        
        localStorage.setItem(key, JSON.stringify(newListData))
        listData = [...newListData];
        
        

    }

    
</script>

<article>
   
    <div class="todo">
        <div class="content">
            <div class="cnt">
                <header>
                    <div class="head">
                        
                        <div class="add">
                            <button on:click={
                                (e)=>{ 
                                    e.preventDefault();
                                    toggle = !toggle
                                    }} >
                                SET REMINDER
                            </button>
                         
                        </div>
                    </div>
                </header>
                <main>
                    <div class="mn">
                        <h1>reminders list ~ <strong> {date.getHours()} : {date.getMinutes()} </strong></h1>
                        <hr>
                        <br>
                        <div class="table">
                            <table>
                                <tbody>
                                    {#each listData as dt}
                                    <tr>
                                            <td>
                                                <div class="row">

                                                    <h1>{dt.title}</h1>
                                                    <p style="text-align:end;color: var(--bl); font-weight:700; font-size:0.9rem;">{dt.date}</p>
                                                    <p>{dt.location}</p>
                                                    <p>{dt.startTime}</p>
                                                    <div class="del">
                                                        <button on:click={dispatchdel(dt.id)}>DELETE</button>
                                                    </div>
                                                </div>
                                            </td>
                                           
                                           
                                        
                                    </tr>
                                    <tr style="opacity:0">
                                        <td>
                                            <p style="padding:0;margin:0">____</p>
                                        </td>
                                    </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>

                    </div>
                </main>

            </div>
        </div>
        <div class="form" class:toggle={toggle}>
            <form >
                <div class="fm-cont">


                    <div class="close">
                        <button on:click={
                            (e)=>{ 
                                e.preventDefault();
                                toggle = !toggle
                                }} >
                            CLOSE
                        </button>
                    </div>
                    <div class:error={error} class="msg"><p>title field can not be empty ⚠</p></div>
                    
                    <div class="fm">
                        <div class="title"><label for="title">title</label>         <input bind:value={ti} type="text"></div>
                        <div class="time"><label for="time">start time</label>      <input bind:value={st} type="text"></div>
                        <div class="location"><label for="location">location</label><input bind:value={lc} type="text"></div>
                        <div class="submit"><label for="submit">. . .</label><button on:click={submit} type="submit">SUBMIT</button></div>
                    </div>
                </div>
            </form>
        </div>
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
    .toggle{
        clip-path: circle(1500px) !important;
    }
    .error{
        opacity:100% !important;
        transition: 0.5s all ease-in;
    }
    article{
        background: var(--bc);
        min-height: 100vh;
        .todo{
            padding-bottom: 10vh;
            .content{
                .cnt{
                    header{
                        
                        .head{
                            text-align: end;
                            margin:5px;
                            padding: 10px;

                           
                            .add{
                                padding: 0;
                                padding-bottom: 12vh;
                                background: transparent;
                                position: fixed;
                                width: 100%;
                                left:0;
                                text-align: start;
                                bottom:0;
                            
                                button{
                                    background: var(--fb);
                                    @include font(var(--tc), 0.9rem, 550);
                                    padding: 10px;
                                    margin: 0 10px;
                                    border-radius: 4px;
                                    box-shadow: rgba(0, 0, 0, 0.529) 2px 3px 3px 0;

                                }
                            }
                        }
                    }
                    main{
                        padding-top: 25vh;
                        .mn{
                            padding: 10px;
                            h1{
                                @include font(var(--bl), 0.9rem, 450);
                                letter-spacing: 2px;
                                margin: 5px ;
                            }
                            .table{
                                table{
                                    width: 100%;
                                    tbody{
                                        tr{
                                            td{
                                                .row{
                                                    background: var(--crd);
                                                    padding: 10px;
                                                    .del{
                                                        text-align: end;
                                                        button{
                                                            border:none;
                                                            background: var(--bl);
                                                            border-radius: 1px;
                                                            padding: 10px 30px;
                                                            @include font(var(--lc), 1rem, 550);
                                                            box-shadow: black 5px 3px 6px 0px;
                                                        }                                                       
                                                    }
                                                    h1{
                                                        letter-spacing: 0.5px;
                                                        @include font(var(--tc), 1rem, 600);
                                                        text-transform: uppercase;
                                                        border-left: solid 2px var(--bl);
                                                        padding: 0 10px;
                                                        margin:0;
                                                    }
                                                    p{
                                                        @include font(var(--tc), 0.9rem, 500);
                                                        padding:5px 15px;
                                                        margin:0;
                                                        
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
            }
            .form{
                background: rgba(0, 0, 0, 0.459);
                position: fixed;
                width: 100%;
                left:0;
                top: 0;
                min-height: 100vh;
                z-index: 100;
                display: flex;
                align-items: center;
                clip-path:circle(0);
                
                form{
                    width: 100%;  
                    padding:10px;
                    .fm-cont{
                        background: hsl(208, 96%, 12%);
                        padding: 10px;
                        min-height: 95vh;
                    }
                    .close{
                        display: flex;
                        button{
                            margin-left: auto;
                            background: red;
                            border: none;
                            box-shadow: black 0px 5px 3px 0px;
                            @include font(var(--lc), 1rem, 500);

                        }
                    }
                    .msg{
                        margin:5px;
                        opacity:0;
                        
                        p{
                            //background: hsl(120, 100%, 85%);
                            background: rgba(255, 0, 0, 0.474);

                            text-align: center;
                            @include font(var(--lc), 1rem, 550);
                            padding: 10px;

                        }
                    }
                    .fm{
                        padding:5px;
                        div{
                            label{
                            @include font(var(--lc), 0.9rem, 450);
                            padding: 5px 0;
                            text-transform: uppercase;
                            
                            }
                            input{
                                width: 100%;
                            }
                            button{
                                border: none;
                                background: var(--tbc);
                                width: 100%;
                                margin: 5px 0;
                                padding: 10px;
                                @include font(var(--tc), 1rem, 500);
                            }
                        }

                    }

                }

            }
        }
    }
</style>