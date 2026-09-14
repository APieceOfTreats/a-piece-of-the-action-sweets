const PRODUCTS={
  "cinnamon-single":{name:"The Original Cinnamon Piece",price:700},
  "cinnamon-box4":{name:"The Original Cinnamon Piece — Box of 4",price:2499},
  "og-cookie-single":{name:"The OG Chocolate Chip",price:500},
  "og-cookie-box4":{name:"The OG Chocolate Chip — Box of 4",price:1699},
  "snickerdoodle-single":{name:"Signature Snickerdoodle",price:500},
  "snickerdoodle-box4":{name:"Signature Snickerdoodle — Box of 4",price:1699},
  "smore-single":{name:"S'more of the Action",price:500},
  "smore-box4":{name:"S'more of the Action — Box of 4",price:1699},
  "strawberry-single":{name:"Strawberry Cakesicle",price:400},
  "strawberry-box4":{name:"Strawberry Cakesicle — Box of 4",price:1399},
  "confetti-single":{name:"Confetti Cakesicle",price:400},
  "confetti-box4":{name:"Confetti Cakesicle — Box of 4",price:1399},
  "cosmic-single":{name:"Cosmic Chocolate Cakesicle",price:400},
  "cosmic-box4":{name:"Cosmic Chocolate Cakesicle — Box of 4",price:1399},
  "apple-single":{name:"Classic Caramel Apple Crunch",price:700},
  "apple-box4":{name:"Classic Caramel Apple Crunch — Box of 4",price:2499},
  "cookie-surprise-box4":{name:"Surprise Me! Cookie Box of 4",price:1699},
  "cakesicle-surprise-box4":{name:"Surprise Me! Cakesicle Box of 4",price:1399}
};
const cart={};
const money=c=>new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(c/100);
const drawer=document.getElementById("cartDrawer"),overlay=document.getElementById("cartOverlay");
const cartItems=document.getElementById("cartItems"),cartEmpty=document.getElementById("cartEmpty");
const totalEl=document.getElementById("cartTotal"),countEl=document.getElementById("cartCount"),checkoutBtn=document.getElementById("checkoutBtn");
const toast=document.getElementById("toast");
const nav=document.getElementById("nav");

document.getElementById("navBtn").addEventListener("click",()=>nav.classList.toggle("open"));
document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>nav.classList.remove("open")));
function openCart(){drawer.classList.add("open");drawer.setAttribute("aria-hidden","false");overlay.hidden=false}
function closeCart(){drawer.classList.remove("open");drawer.setAttribute("aria-hidden","true");overlay.hidden=true}
document.getElementById("cartButton").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
overlay.addEventListener("click",closeCart);
function notify(msg){toast.textContent=msg;toast.classList.add("show");clearTimeout(window.__t);window.__t=setTimeout(()=>toast.classList.remove("show"),1600)}
function render(){
  cartItems.innerHTML="";
  let total=0,count=0;
  Object.entries(cart).forEach(([sku,qty])=>{
    if(qty<=0)return;
    const p=PRODUCTS[sku]; total+=p.price*qty; count+=qty;
    const div=document.createElement("div");div.className="cartItem";
    div.innerHTML=`<div class="cartItemTop"><strong>${p.name}</strong><b>${money(p.price*qty)}</b></div>
      <div class="qty"><button data-act="minus" data-sku="${sku}">−</button><span>${qty}</span><button data-act="plus" data-sku="${sku}">+</button><button class="remove" data-act="remove" data-sku="${sku}">Remove</button></div>`;
    cartItems.appendChild(div);
  });
  cartEmpty.style.display=count?"none":"block"; totalEl.textContent=money(total);countEl.textContent=count;checkoutBtn.disabled=!count;
}
document.querySelectorAll(".add").forEach(btn=>btn.addEventListener("click",()=>{
  const sku=btn.dataset.sku;cart[sku]=(cart[sku]||0)+1;render();notify(`${PRODUCTS[sku].name} added`);openCart();
}));
cartItems.addEventListener("click",e=>{
  const b=e.target.closest("button[data-act]");if(!b)return;const sku=b.dataset.sku;
  if(b.dataset.act==="plus")cart[sku]=(cart[sku]||0)+1;
  if(b.dataset.act==="minus")cart[sku]=Math.max(0,(cart[sku]||0)-1);
  if(b.dataset.act==="remove")delete cart[sku];
  if(cart[sku]===0)delete cart[sku];render();
});
checkoutBtn.addEventListener("click",async()=>{
  const items=Object.entries(cart).filter(([,qty])=>qty>0).map(([sku,quantity])=>({sku,quantity}));
  if(!items.length)return;
  checkoutBtn.disabled=true;checkoutBtn.textContent="Opening Square checkout…";
  try{
    const r=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({items})});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||"Checkout could not be created.");
    window.location.href=data.url;
  }catch(err){
    alert(err.message);checkoutBtn.disabled=false;checkoutBtn.textContent="Checkout securely with Square";
  }
});
render();
