
const PRODUCTS={
  "cinnamon-single":{name:"The Original Cinnamon Piece",price:700},
  "cinnamon-box4":{name:"The Original Cinnamon Piece — Box of 4",price:2499},
  "og-cookie-single":{name:"The OG Chocolate Chip",price:500},
  "og-cookie-box4":{name:"The OG Chocolate Chip — Box of 4",price:1699},
  "snickerdoodle-single":{name:"Signature Snickerdoodle",price:500},
  "snickerdoodle-box4":{name:"Signature Snickerdoodle — Box of 4",price:1699},
  "smore-single":{name:"S’more of the Action",price:500},
  "smore-box4":{name:"S’more of the Action — Box of 4",price:1699},
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
const nav=document.getElementById("nav");
const menuToggle=document.getElementById("menuToggle");
const cartDrawer=document.getElementById("cartDrawer");
const cartOverlay=document.getElementById("cartOverlay");
const cartItems=document.getElementById("cartItems");
const cartEmpty=document.getElementById("cartEmpty");
const cartTotal=document.getElementById("cartTotal");
const cartCount=document.getElementById("cartCount");
const checkoutButton=document.getElementById("checkoutButton");
const toast=document.getElementById("toast");

menuToggle.addEventListener("click",()=>{
  const open=nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded",String(open));
  menuToggle.textContent=open?"✕":"☰";
});
document.querySelectorAll("nav a").forEach(a=>a.addEventListener("click",()=>{nav.classList.remove("open");menuToggle.textContent="☰";}));

function openCart(){cartDrawer.classList.add("open");cartDrawer.setAttribute("aria-hidden","false");cartOverlay.hidden=false}
function closeCart(){cartDrawer.classList.remove("open");cartDrawer.setAttribute("aria-hidden","true");cartOverlay.hidden=true}
document.getElementById("cartButton").addEventListener("click",openCart);
document.getElementById("closeCart").addEventListener("click",closeCart);
cartOverlay.addEventListener("click",closeCart);

function notify(message){
  toast.textContent=message;
  toast.classList.add("show");
  clearTimeout(window.__toastTimer);
  window.__toastTimer=setTimeout(()=>toast.classList.remove("show"),1600);
}

function renderCart(){
  cartItems.innerHTML="";
  let total=0,count=0;
  Object.entries(cart).forEach(([sku,qty])=>{
    if(qty<1)return;
    const p=PRODUCTS[sku];
    total+=p.price*qty;
    count+=qty;
    const row=document.createElement("div");
    row.className="cart-item";
    row.innerHTML=`<div class="cart-item-top"><strong>${p.name}</strong><b>${money(p.price*qty)}</b></div>
      <div class="qty">
        <button data-action="minus" data-sku="${sku}">−</button>
        <span>${qty}</span>
        <button data-action="plus" data-sku="${sku}">+</button>
        <button class="remove" data-action="remove" data-sku="${sku}">Remove</button>
      </div>`;
    cartItems.appendChild(row);
  });
  cartEmpty.style.display=count?"none":"block";
  cartTotal.textContent=money(total);
  cartCount.textContent=count;
  checkoutButton.disabled=!count;
}

document.querySelectorAll(".add").forEach(btn=>btn.addEventListener("click",()=>{
  const sku=btn.dataset.sku;
  cart[sku]=(cart[sku]||0)+1;
  renderCart();
  notify(`${PRODUCTS[sku].name} added`);
  openCart();
}));

cartItems.addEventListener("click",e=>{
  const btn=e.target.closest("button[data-action]");
  if(!btn)return;
  const sku=btn.dataset.sku;
  if(btn.dataset.action==="plus")cart[sku]=(cart[sku]||0)+1;
  if(btn.dataset.action==="minus")cart[sku]=Math.max(0,(cart[sku]||0)-1);
  if(btn.dataset.action==="remove")delete cart[sku];
  if(cart[sku]===0)delete cart[sku];
  renderCart();
});

checkoutButton.addEventListener("click",async()=>{
  const items=Object.entries(cart).filter(([,quantity])=>quantity>0).map(([sku,quantity])=>({sku,quantity}));
  if(!items.length)return;
  checkoutButton.disabled=true;
  checkoutButton.textContent="Opening Square checkout…";
  try{
    const response=await fetch("/api/checkout",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({items})
    });

    const raw=await response.text();
    let data={};
    try{ data=raw ? JSON.parse(raw) : {}; }
    catch{
      throw new Error(`Checkout server returned a non-JSON response (${response.status}).`);
    }

    if(!response.ok)throw new Error(data.error||`Checkout could not be created (${response.status}).`);
    if(!data.url)throw new Error("Square did not return a checkout URL.");
    window.location.href=data.url;
  }catch(err){
    alert(err.message);
    checkoutButton.disabled=false;
    checkoutButton.textContent="Checkout securely with Square";
  }
});

document.getElementById("year").textContent=new Date().getFullYear();
renderCart();
