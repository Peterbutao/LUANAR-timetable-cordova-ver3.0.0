<script>

	import {data} from "../stores/store.js"
	
	let date = new Date()
   
    function datarow( timeP, dayP){
        
        const store = $data.courses.map(element => { return {...element, weekdays: element.weekdays.filter(weekdays => weekdays.initialTime == timeP)}}
         ).filter(item =>{ return item.weekdays.length !== 0 })

         let code = []
        

        store.forEach(item => {item.weekdays.forEach(element => {
            if(dayP == element.day){
                code = [...code, item.code]
                
            }

        })})
        return code
    }
    function readrow( timeP, dayP){
        
        const store = $data.reads.map(element => { return {...element, weekdays: element.weekdays.filter(weekdays => weekdays.initialTime == timeP)}}
         ).filter(item =>{ return item.weekdays.length !== 0 })

         let code = []
        

        store.forEach(item => {item.weekdays.forEach(element => {
            if(dayP == element.day){
                code = [...code, item.code]
                
            }

        })})
        return code
    }

  

</script>


<article id="timetable">
    <div class="time-t">
        <table class="table">
            <thead>
                <tr>
                    <th></th>
                    <th>MON</th>
                    <th>TUE</th>
                    <th>WED</th>
                    <th>THU</th>
                    <th>FRI</th>
                   
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="h06" >6 : 00</td>
                    <td class="mo6" ></td>
                    <td class="tu6"></td>
                    <td class="we6"></td>
                    <td class="th6"></td>
                    <td class="fr6"></td>
                   
                </tr>
                <tr>
                    <td class="h07" >7 : 00</td>
                    <td class="mo7">{datarow("07:00",1)}</td>
                    <td class="tu7">{datarow("07:00",2)}</td>
                    <td class="we7">{datarow("07:00",3)}</td>
                    <td class="th7">{datarow("07:00",4)}</td>
                    <td class="fr7">{datarow("07:00",5)}</td>
                   
                </tr>
                <tr>
                    <td class="h08">8 : 00</td>
                    <td class="mo8">{datarow("08:00",1)}</td>
                    <td class="tu8">{datarow("08:00",2)}</td>
                    <td class="we8">{datarow("08:00",3)}</td>
              
                    <td class="th8">{datarow("08:00",4)}</td>
                    <td class="fr8">{datarow("08:00",5)}</td>
                   
                </tr>
                <tr>
                    <td class="h09">9 : 00</td>
                    <td class="mo9">{datarow("09:00",1)}</td>
                    <td class="tu9">{datarow("09:00",2)}</td>
                    <td class="we9">{datarow("09:00",3)}</td>
                    <td class="th9">{datarow("09:00",4)}</td>
                    <td class="fr9">{datarow("09:00",5)}</td>
                  

                </tr>       
                <tr>
                    <td class="h10">10:00</td>
                    <td class="mo10">{datarow("10:00",1)}</td>
                    <td class="tu10">{datarow("10:00",2)}</td>
                    <td class="we10">{datarow("10:00",3)}</td>
                    <td class="th10">{datarow("10:00",4)}</td>
                    <td class="fr10">{datarow("10:00",5)}</td>
                  
                    
                </tr>
                <tr>
                    <td class="h11">11:00</td>
                    <td class="mo11">{datarow("11:00",1)}</td>
                    <td class="tu11">{datarow("11:00",2)}</td>
                    <td class="we11">{datarow("11:00",3)}</td>
                    <td class="th11">{datarow("11:00",4)}</td>
                    <td class="fr11">{datarow("11:00",5)}</td>
                   
                </tr>

                <tr>
                    <td class="h12">12:00</td>
                    <td class="mo12">{datarow("12:00",1)}</td>
                    <td class="tu12">{datarow("12:00",2)}</td>
                    <td class="we12">{datarow("12:00",3)}</td>
                    <td class="th12">{datarow("12:00",4)}</td>
                    <td class="fr12">{datarow("12:00",5)}</td>
                    
                </tr>
                <tr>
                    <td class="h12">12:50</td>
                    <td class="mo12-50"></td>
                    <td class="tu12-50"></td>
                    <td class="we12-50"></td>
                    <td class="th12-50"></td>
                    <td class="fr12-50"></td>

                </tr>
             
                <tr>
                    <td class="h12">___</td>
                    <td></td>
                    <td class="t_b12"></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    
                </tr>
                <tr>
                    <td class="h13">1 : 00</td>
                    <td class="mo13">{datarow("13:00",1)}</td>
                    <td class="tu13">{datarow("13:00",2)}</td>
                    <td class="we13">{datarow("13:00",3)}</td>
                    <td class="th13">{datarow("13:00",4)}</td>
                    <td class="fr13">{datarow("13:00",5)}</td>
                   
                </tr>
                <tr>
                    <td class="h14">2 : 00</td>
                    <td class="mo14">{datarow("14:00",1)}</td>
                    <td class="tu14">{datarow("14:00",2)}</td>
                    <td class="we14">{datarow("14:00",3)}</td>
                    <td class="th14">{datarow("14:00",4)}</td>
                    <td class="fr14">{datarow("14:00",5)}</td>
                   
                </tr>
                <tr>
                    <td class="h15">3 : 00</td>
                    <td class="mo15">{datarow("15:00",1)}</td>
                    <td class="tu15">{datarow("15:00",2)}</td>
                    <td class="we15">{datarow("15:00",3)}</td>
                    <td class="th15">{datarow("15:00",4)}</td>
                    <td class="fr15">{datarow("15:00",5)}</td>
                   
                </tr>
                <tr>
                    <td class="h16">4 : 00</td>
                    <td class="mo16">{datarow("16:00",1)}</td>
                    <td class="tu16">{datarow("16:00",2)}</td>
                    <td class="we16">{datarow("16:00",3)}</td>
                    <td class="th16">{datarow("16:00",4)}</td>
                    <td class="fr16">{datarow("16:00",5)}</td>
                   
                </tr>
                <tr>
                    <td class="h17">5 : 00</td>
                    <td class="mo17">{datarow("17:00",1)}</td>
                    <td class="tu17">{datarow("17:00",2)}</td>
                    <td class="we17">{datarow("17:00",3)}</td>
                    <td class="th17">{datarow("17:00",4)}</td>
                    <td class="fr17">{datarow("17:00",5)}</td>
                   
                </tr>
                <tr>
                    <td class="h18">6 : 00</td>
                    <td class="mo18">{datarow("18:00",1)}</td>
                    <td class="tu18">{datarow("18:00",2)}</td>
                    <td class="we18">{datarow("18:00",3)}</td>
                    <td class="th18">{datarow("18:00",4)}</td>
                    <td class="fr18">{datarow("18:00",5)}</td>
                    
                </tr>
                <tr>
                    <td class="h20">___</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                   
                    
                </tr>
                <!--

                <tr>
                    <td class="h20">8 : 00</td>
                    <td class="mo20">{readrow("20:00",1)}</td>
                    <td class="tu20">{readrow("20:00",2)}</td>
                    <td class="we20">{readrow("20:00",3)}</td>
                    <td class="th20">{readrow("20:00",4)}</td>
                    <td class="fr20">{readrow("20:00",5)}</td>
                  
                </tr>
            -->

                <tr>
                    <td class="h20">8 : 00</td>
                    <td class="mo20"></td>
                    <td class="tu20"></td>
                    <td class="we20"></td>
                    <td class="th20"></td>
                    <td class="fr20"></td>
                  
                </tr>
        
             
                
               

            </tbody>
        </table>
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
        min-height: 100vh;
        .time-t{
            padding-top: 15vh;
            padding-bottom: 10vh;
        }
    }
    table{
    border-spacing: 2px;
    width: 100%;
    padding: 0px 3px;
    padding-bottom: 20px;
    thead{
        tr{
            @include font(var(--tc), 13.5px, 700);
            th{
                width: 50px !important;
                height: 45px !important;
            }
            
        }
    }
    tbody{
        tr{
            background-color: var(--tbl);
            td{
                width: 50px !important;
                height: 45px !important;
                @include font(black, 13px, 450);
                
            }
            td:nth-child(1){
                box-shadow: hsl(208, 96%, 30%) -2px 1px 4px 0;
                color: var(--bl);
                font-size: 600;
            }
            
            text-align: center;
            
            td:nth-child(2),
            td:nth-child(3),
            td:nth-child(4),
            td:nth-child(5),
            td:nth-child(6)
            {
                @include font(var(--tc), 13px, 500);
            }

            

            
         
            
        }

    }
}
</style>