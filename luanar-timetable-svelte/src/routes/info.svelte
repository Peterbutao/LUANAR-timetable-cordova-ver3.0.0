<script>
import {data} from "../stores/store.js"

let core  = $data.courses.filter((items)=>{
    return items.type == "CORE"
})
let len = core.length
    

</script>
<article>

    <div class="content">
        
        <main>
            <div class="mn">



                <table>
                    <tbody>
                        <tr>
                            <td style="background-color: var(--fb);">
                                {#each $data.common as cmn}
                                <span class="tp-sum">
                                    <p class="sum">year : { cmn.studyYear}</p>
                                    <p class="sum">|</p>
                                    <p class="sum">semester : {cmn.semester}</p>
                                </span>
                                {/each}
                                <p>___</p>
                                  
                                <h1>SUMMARY</h1>
                                <p class="sum">{$data.courses.length} COURSES</p>
                                <p class="sum">{len} CORES</p>
                                
                                
                            </td>
                            
                         
    
                        </tr>
                       {#each $data.courses as crs}
                        <tr>
                            <td>
                                <h1>{crs.course.toUpperCase()}</h1>
                                <h2>{crs.type}</h2>
                                <p>{crs.gpa} GPA</p>
                                <p>{crs.code}</p>
                                {#each crs.weekdays as cr}   
                                    <div class="details">

                                        <p>{cr.weekday}</p>
                                        <p>{cr.location}</p>
                                        <p>{cr.initialTime} : {cr.finalTime}</p>
                                        <p>{cr.type}</p>
                                        <p>{cr.hours}HRS</p>
                                        
                                    </div>

                            
                            
                                {/each}                       
                            </td>   
                         
    
                        </tr>
                        {/each}
                    </tbody>
                </table>
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
        min-height: 100vh;
        background: var(--bc);
        
      
        .content{
            padding-top: 15vh;
            padding-bottom: 10vh;
            main{
                .mn{
                    padding: 10px;
                    
                }
                padding-top: 8px ;
                padding-bottom: 10vh;
                table{
                    width: 100%;
                    border-spacing: 0 20px;
                    tbody{
                        tr{
                            background: var(--fb);
                            
                            
                            td{
                                padding: 0px 8px;
                                margin: 10px;
                                border: var(--bl) solid 1px;
                                span{
                                    display: flex;
                                    background:  rgba(255, 217, 0, 0.171);
                                    border-radius: 4rem;
                                    margin: 4px;
                                    padding:15px;
                                    box-shadow: rgba(0, 0, 0, 0.474) 0px 6px 4px 0px;
                                    
                                    p{
                                        margin:auto;
                                    }


                                }
                                h1{
                                    @include font(var(--tc), 1rem, 400 )
                                }
                                h2{
                                    @include font(var(--bl), 0.75rem, 600 )
                                }
                                p{
                                    @include font(var(--tc), 0.95rem, 400);
                                    text-align: right;
                                }
                                .details{
                                    background: #2698fb1c;
                                    padding:3px 10px;
                                    margin: 5px 0;
                                    border-left: solid 2px var(--bl);
                                    p{
                                        text-align: left;
                                    }
                                }
                            }
                        }
                    }
                }
            }

        }
    }
    .sum{
        color: var(--bl) !important;
        font-weight: 700 !important;
        font-size: 0.89rem !important;
        text-transform: uppercase;
    }
</style>