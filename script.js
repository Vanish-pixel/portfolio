const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
document.querySelector("#year").textContent=new Date().getFullYear();
const progress=document.querySelector(".progress span"),glow=document.querySelector(".cursor-glow");
addEventListener("scroll",()=>{const m=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${m?scrollY/m:0})`},{passive:true});
if(!reduced&&matchMedia("(pointer:fine)").matches){
 addEventListener("pointermove",e=>{glow.style.left=e.clientX+"px";glow.style.top=e.clientY+"px"},{passive:true});
 document.querySelectorAll(".tilt").forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`perspective(1000px) rotateX(${-y*7}deg) rotateY(${x*9}deg)`});el.addEventListener("pointerleave",()=>el.style.transform="")});
 document.querySelectorAll(".magnetic").forEach(el=>{el.addEventListener("pointermove",e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.16}px,${(e.clientY-r.top-r.height/2)*.16}px)`});el.addEventListener("pointerleave",()=>el.style.transform="")});
}
const reveals=document.querySelectorAll(".reveal,.manifesto-text,.stats>div,.work-head,.project-copy,.experience-row");
if(reduced||!("IntersectionObserver"in window))reveals.forEach(x=>x.classList.add("reveal","visible"));
else{reveals.forEach(x=>x.classList.add("reveal"));const o=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");o.unobserve(e.target)}}),{threshold:.14});reveals.forEach(x=>o.observe(x))}
addEventListener("load",()=>{const canvas=document.querySelector("#skin-viewer");if(!canvas||!window.skinview3d)return;try{const v=new skinview3d.SkinViewer({canvas,width:Math.max(300,canvas.clientWidth),height:Math.max(500,canvas.clientHeight),skin:"skin.png"});v.background=null;v.zoom=.82;v.fov=45;v.autoRotate=!reduced;v.autoRotateSpeed=.4;v.controls.enablePan=false;v.globalLight.intensity=2.1;v.cameraLight.intensity=.9;if(!reduced){v.animation=new skinview3d.IdleAnimation();v.animation.speed=.65}addEventListener("resize",()=>{v.width=Math.max(300,canvas.clientWidth);v.height=Math.max(480,canvas.clientHeight)})}catch(e){canvas.hidden=true}});
