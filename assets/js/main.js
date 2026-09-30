/* PROMAXDEAL LLC — site scripts */
(function(){
  var SALES_EMAIL='sales@promaxdeals.com';

  /* Mobile menu */
  var menuBtn=document.querySelector('.menu-btn'),nav=document.getElementById('site-nav');
  if(menuBtn&&nav){
    menuBtn.addEventListener('click',function(){
      var open=menuBtn.getAttribute('aria-expanded')==='true';
      menuBtn.setAttribute('aria-expanded',String(!open));
      nav.classList.toggle('open',!open);
    });
    nav.addEventListener('click',function(e){
      if(e.target.closest('a')){menuBtn.setAttribute('aria-expanded','false');nav.classList.remove('open');}
    });
    document.addEventListener('keydown',function(e){
      if(e.key==='Escape'&&nav.classList.contains('open')){menuBtn.setAttribute('aria-expanded','false');nav.classList.remove('open');menuBtn.focus();}
    });
  }

  /* Footer year */
  var y=document.getElementById('year');
  if(y)y.textContent=new Date().getFullYear();

  /* Back to top */
  var top=document.querySelector('.to-top');
  if(top){
    var onScroll=function(){top.classList.toggle('show',window.scrollY>600);};
    window.addEventListener('scroll',onScroll,{passive:true});onScroll();
    top.addEventListener('click',function(){window.scrollTo({top:0});});
  }

  /* Quote form */
  var f=document.getElementById('quote');
  if(!f)return;
  var msg=document.getElementById('q-msg'),res=document.getElementById('q-result'),
      sum=document.getElementById('q-summary'),mail=document.getElementById('q-mail'),
      copy=document.getElementById('q-copy'),submitBtn=f.querySelector('button[type=submit]');

  // Prefill from links such as contact.html?cat=CAT-01 or ?type=supplier
  try{
    var qs=new URLSearchParams(location.search);
    var pick=function(id,val){
      var sel=document.getElementById(id);if(!val||!sel)return;
      for(var i=0;i<sel.options.length;i++){
        var o=sel.options[i];
        if(o.value===val||o.getAttribute('data-key')===val){sel.selectedIndex=i;return;}
      }
    };
    pick('q-cat',qs.get('cat'));
    pick('q-type',qs.get('type'));
  }catch(err){}

  var need=['name','company','email','items'];
  var emailRe=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setMsg(t,cls){msg.textContent=t;msg.className='note'+(cls?' '+cls:'');}

  f.addEventListener('input',function(e){if(e.target.getAttribute('aria-invalid'))e.target.removeAttribute('aria-invalid');});

  f.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(f);
    if(String(d.get('website')||'').trim())return; // honeypot

    for(var i=0;i<need.length;i++){
      var el=f.elements[need[i]],v=String(d.get(need[i])||'').trim();
      if(!v||(need[i]==='email'&&!emailRe.test(v))){
        el.setAttribute('aria-invalid','true');
        setMsg(need[i]==='email'&&v?'Please enter a valid email address.':'Please fill in '+el.labels[0].firstChild.textContent.trim().toLowerCase()+'.','err');
        el.focus();return;
      }
    }

    var text='Quote request\n'+
      'Name: '+d.get('name')+'\n'+
      'Company: '+d.get('company')+'\n'+
      'Email: '+d.get('email')+'\n'+
      'Phone: '+(String(d.get('phone')||'').trim()||'-')+'\n'+
      'Buyer type: '+d.get('type')+'\n'+
      'Category: '+d.get('category')+'\n'+
      'Needed by: '+(String(d.get('timeline')||'').trim()||'-')+'\n\n'+
      'Items:\n'+d.get('items');

    function showFallback(){
      sum.textContent=text;
      mail.href='mailto:'+SALES_EMAIL+'?subject='+encodeURIComponent('Quote request - '+d.get('company'))+'&body='+encodeURIComponent(text);
      res.hidden=false;setMsg('');
      res.scrollIntoView({block:'nearest'});
    }

    // If a form endpoint is configured (e.g. Formspree), post to it; otherwise use the email fallback.
    var endpoint=f.getAttribute('data-endpoint');
    if(endpoint){
      submitBtn.disabled=true;setMsg('Sending…');
      fetch(endpoint,{method:'POST',body:d,headers:{'Accept':'application/json'}})
        .then(function(r){
          if(!r.ok)throw new Error(r.status);
          f.reset();setMsg('Thank you. Your request was sent and our sales team will reply within one business day.','ok');
        })
        .catch(function(){showFallback();setMsg('We could not send the form automatically. Please email or copy the request below.','err');})
        .then(function(){submitBtn.disabled=false;});
    }else{
      showFallback();
    }
  });

  if(copy){
    copy.addEventListener('click',function(){
      var b=this,t=sum.textContent;
      function sel(){var r=document.createRange();r.selectNodeContents(sum);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='Selected, press Ctrl+C';}
      try{navigator.clipboard.writeText(t).then(function(){b.textContent='Copied';},sel);}catch(err){sel();}
    });
  }
})();
