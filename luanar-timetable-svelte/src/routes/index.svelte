<script>
	import {data} from "../stores/store.js"
	
	let date = new Date();	
	let day = date.getDay();

	const arr = $data.courses.map((element) => {
	return {...element, weekdays: element.weekdays.filter((weekdays) => weekdays.day === day)}
	}).filter((item)=>{ return item.weekdays.length !== 0   })

	
	const todaycrs = arr.map((element) => {
		let time = ""
		element.weekdays.forEach((weekdays) => time = weekdays.initialTime.substring(0,2));      
		return {...element, time}
	}).sort((a,b)=>{
		return a.time.localeCompare(b.time)
	}).map((item)=>{
		return item
	})
	
</script>

	
	<article>
		
		<div class="content">
		<header>
			<p>TODAYS CLASSES</p>
			<p>{date.getHours()} : {date.getMinutes()}<p>
		</header>
		<main>
		{#if todaycrs.length === 0}
			<div class="card">
				<div class="title">
					<h1>No Course Avalable For <strong>{date.toLocaleDateString("en-US", {weekday: "long"}).toUpperCase()}</strong></h1>
					
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="a"><rect width="16" height="16" fill="none"/></clipPath></defs><g clip-path="url(#a)"><path d="M8,0a8,8,0,1,0,8,8A8.024,8.024,0,0,0,8,0ZM9.1,12.2H6.9V10.3H9.2v1.9Zm.1-7.4L8.6,9.2H7.4L6.8,4.8v-1H9.3v1Z" fill="#707070"/></g></svg>
				</div>
				
	
			</div>
		{/if}
		{#each todaycrs as crs}
			<div class="card">
				<div class="title">
					<h1>{crs.course.toUpperCase()}</h1>
	
					<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16"><defs><clipPath id="a"><rect width="16" height="16" fill="none"/></clipPath></defs><g clip-path="url(#a)"><path d="M8,0a8,8,0,1,0,8,8A8.024,8.024,0,0,0,8,0ZM9.1,12.2H6.9V10.3H9.2v1.9Zm.1-7.4L8.6,9.2H7.4L6.8,4.8v-1H9.3v1Z" fill="#707070"/></g></svg>
				</div>
				<div class="details">
					{#each crs.weekdays as rc}
					<p style="color: var(--bl); text-align: end;" >{rc.type}</p>
						<p>{rc.initialTime} | {rc.finalTime}</p>
						<p class="p-2" >{rc.hours}	HOURS</p>
						<p >{rc.location.toUpperCase()}</p>	
						<div class="space"> . . .</div>				
					{/each}				
				</div>
			</div>
		{/each}
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
		min-height: 100vh;
		.content{
			padding-top: 14vh;
			main{
				padding: 10px;
				padding-bottom: 100px;
				.card{
					padding: 5px 10px;
					margin: 15px 0px;
					background-color: var(--fb);
					box-shadow: #00000056 0px 8px 16px 2px;
					border-radius: 5px;
					.title{
						display: flex;
						line-height: 25px;
						justify-content: space-between;
						align-items: center;
						
						h1{
							border-left: var(--bl) solid 2px;
							@include font(var(--tc), 1rem, 550);
							padding-left: 8px;
						}
					}
				
					.details{
						@include font(var(--tc), 0.85rem, 700);
						padding-top: 30px;
						letter-spacing: 0.9 px;
						
						p{
							margin:0;
						}
						.space{
							padding: 10px;
							color: var(--bl);
						}
						.p-2{
							margin: 6px 0px;
						}
					}
				}
			}
			header{
				padding: 0px 10px;
				text-align: end;
				@include font(var(--tc), 0.89rem, 800);
				border-right: 2px solid var(--bl);
				
				
			}
		}


		
	}
</style>