document.documentElement.classList.add('js');
(function(){
  var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  // true on phones, small tablets and any touch-only device
  var mobileMQ=matchMedia('(max-width: 900px), (hover: none)');
  function isMobile(){return mobileMQ.matches}

  // reveal on scroll (.rv everywhere, .mrv = project cards on phones), with a timed fallback so nothing stays hidden
  var revealEls=$$('.rv, .mrv');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -4% 0px'});
    revealEls.forEach(function(el){io.observe(el)});
  }else{revealEls.forEach(function(el){el.classList.add('in')})}
  setTimeout(function(){revealEls.forEach(function(el){var r=el.getBoundingClientRect();if(r.top<innerHeight)el.classList.add('in')})},400);
  setTimeout(function(){revealEls.forEach(function(el){el.classList.add('in')})},6000);

  // "active" glow on whatever sits in the middle of the screen (styled for phones in the CSS)
  if('IntersectionObserver' in window){
    var aio=new IntersectionObserver(function(es){es.forEach(function(e){e.target.classList.toggle('active',e.isIntersecting)})},{rootMargin:'-35% 0px -35% 0px',threshold:0});
    $$('.pcard,.tcard,.frame,.tl').forEach(function(el){aio.observe(el)});
  }

  // count-up stats
  var cio=new IntersectionObserver(function(es){es.forEach(function(e){if(!e.isIntersecting)return;cio.unobserve(e.target);
    var el=e.target,end=parseFloat(el.dataset.count),dec=+el.dataset.dec||0,suf=el.dataset.suffix||'',t0=performance.now(),d=1600;
    (function f(t){var p=Math.min(1,(t-t0)/d),v=end*(1-Math.pow(1-p,3));el.textContent=v.toFixed(dec)+suf;if(p<1)requestAnimationFrame(f)})(t0)})},{threshold:.6});
  $$('[data-count]').forEach(function(el){cio.observe(el)});

  // typing roles (also plays when "reduce motion" is on, it is a small effect)
  var roles=['Java Full Stack Developer','UI Designer','Web Developer, SQL Developer'],ri=0,ci=0,del=false,rt=$('#roleText');
  (function tick(){
    var w=roles[ri];ci+=del?-1:1;rt.textContent=w.slice(0,ci);var wait=del?40:85;
    if(!del&&ci===w.length){del=true;wait=1500}else if(del&&ci===0){del=false;ri=(ri+1)%roles.length;wait=300}
    setTimeout(tick,wait)})();

  // mobile menu
  var burger=$('#burger'),mmenu=$('#mmenu');
  function setMenu(open){
    document.body.classList.toggle('menu-open',open);
    burger.setAttribute('aria-expanded',open?'true':'false');
    burger.setAttribute('aria-label',open?'Close menu':'Open menu');
    mmenu.setAttribute('aria-hidden',open?'false':'true');
  }
  burger.addEventListener('click',function(){setMenu(!document.body.classList.contains('menu-open'))});
  $$('#mmenu a').forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
  addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
  addEventListener('resize',function(){if(innerWidth>860)setMenu(false)});

  // scroll-driven: nav, progress, stacked cards, timeline, hero parallax
  var nav=$('#nav'),prog=$('#progress'),cards=$$('.pcard-wrap'),tl=$('#timeline'),ticking=false;
  var fig=$('#heroFigure'),figImg=fig.firstElementChild,heroCopy=$('.hero-copy');
  var fx=0,fy=0,sy=0;   // fx, fy = mouse/touch tilt, sy = scroll parallax
  function placeFigure(){figImg.style.translate=fx+'px '+(fy+sy)+'px'}

  function update(){
    ticking=false;var y=Math.max(0,scrollY),h=document.documentElement.scrollHeight-innerHeight;
    nav.classList.toggle('stuck',y>40);prog.style.setProperty('--sp',h>0?Math.min(1,y/h):0);

    // project cards stacking (desktop / large tablets only)
    if(innerWidth>900&&!reduce){
      cards.forEach(function(w,i){var c=w.firstElementChild,next=cards[i+1];if(!next){c.style.transform='';return}
        var nt=next.getBoundingClientRect().top,st=parseFloat(getComputedStyle(w).top)||0,gap=Math.max(0,Math.min(1,1-(nt-st-20)/420));
        c.style.transform='scale('+(1-gap*.06)+')';c.style.filter='brightness('+(1-gap*.45)+')'})
    }else{
      cards.forEach(function(w){var c=w.firstElementChild;c.style.transform='';c.style.filter=''})
    }

    // hero scroll parallax: the photo and text drift and fade as you scroll (phones and touch devices)
    if(isMobile()&&!reduce){
      var s=Math.min(y,innerHeight*1.2);
      sy=s*.14;
      heroCopy.style.translate='0 '+(s*.08)+'px';
      heroCopy.style.opacity=Math.max(.25,1-s/(innerHeight*1.1));
    }else{
      sy=0;heroCopy.style.translate='';heroCopy.style.opacity='';
    }
    placeFigure();

    // timeline gold line
    var r=tl.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.6-r.top)/r.height));
    tl.style.setProperty('--p',(p*100)+'%');
    var rail=$('.rail i',tl);rail.style.setProperty('--p',(p*100)+'%');
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(update)}},{passive:true});
  addEventListener('resize',update);addEventListener('orientationchange',update);update();

  // custom cursor (mouse only)
  if(matchMedia('(hover:hover)').matches&&!reduce){
    var cur=$('#cur'),ring=$('#ring'),mx=0,my=0,rx=0,ry=0;
    addEventListener('mousemove',function(e){mx=e.clientX;my=e.clientY;cur.style.opacity=1;ring.style.opacity=1;cur.style.transform='translate('+mx+'px,'+my+'px)'},{passive:true});
    (function loop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;ring.style.transform='translate('+rx+'px,'+ry+'px)';requestAnimationFrame(loop)})();
    document.addEventListener('mouseover',function(e){ring.classList.toggle('big',!!e.target.closest('a,button,.chip,.tcard,.frame'))});
  }

  // hero figure tilt: follows the mouse on laptops, follows your finger on phones
  if(!reduce){
    addEventListener('mousemove',function(e){fx=(e.clientX/innerWidth-.5)*14;fy=(e.clientY/innerHeight-.5)*8;placeFigure()},{passive:true});
    addEventListener('touchmove',function(e){var t=e.touches[0];if(!t)return;fx=(t.clientX/innerWidth-.5)*14;fy=(t.clientY/innerHeight-.5)*8;placeFigure()},{passive:true});
  }

  // contact: copy email and copy message
  function copy(text,done){
    function fb(){var t=document.createElement('textarea');t.value=text;document.body.appendChild(t);t.select();try{document.execCommand('copy')}catch(e){}t.remove();done()}
    if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).then(done,fb)}else fb()}
  $('#copyMail').addEventListener('click',function(){var b=this;copy($('#mail').textContent,function(){b.textContent='Copied';setTimeout(function(){b.textContent='Copy'},1600)})});
  $('#form').addEventListener('submit',function(e){e.preventDefault();
    var msg='From: '+$('#fn').value+' <'+$('#fe').value+'>\n\n'+$('#fm').value;
    copy(msg,function(){$('#status').textContent='> Message copied. Paste it into an email to '+$('#mail').textContent})});
})();
