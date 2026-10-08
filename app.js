const products=[
 ["یخچال فریزر نو","🏠","۳۲,۵۰۰,۰۰۰ تومان",32500000],
 ["چای‌ساز برقی","🍵","۲,۸۵۰,۰۰۰ تومان",2850000],
 ["تلویزیون هوشمند","📺","۱۸,۹۰۰,۰۰۰ تومان",18900000],
 ["جاروبرقی","🧹","۷,۴۰۰,۰۰۰ تومان",7400000],
 ["مایکروویو","🍽️","۹,۸۰۰,۰۰۰ تومان",9800000],
 ["دریل برقی","🔧","۳,۲۰۰,۰۰۰ تومان",3200000],
 ["ماشین لباسشویی","🧺","۲۶,۷۰۰,۰۰۰ تومان",26700000],
 ["پنکه برقی","🌀","۴,۶۰۰,۰۰۰ تومان",4600000]
];

let cart=[];
const grid=document.getElementById("productGrid");

products.forEach((p,i)=>{
 const el=document.createElement("article");
 el.className="product";
 el.innerHTML=`<div class="pic">${p[1]}</div><h3>${p[0]}</h3><div class="price">${p[2]}</div><button onclick="addCart(${i})">افزودن به سبد</button>`;
 grid.appendChild(el);
});

function faNumber(number){return Number(number).toLocaleString("fa-IR");}
function formatPrice(number){return faNumber(number)+" تومان";}

function addCart(index){
 const found=cart.find(item=>item.index===index);
 if(found) found.qty++;
 else cart.push({index,qty:1});
 updateCart();
 openCart();
}

function changeQty(index,amount){
 const item=cart.find(item=>item.index===index);
 if(!item)return;
 item.qty+=amount;
 if(item.qty<=0)cart=cart.filter(item=>item.index!==index);
 updateCart();
}

function removeCart(index){
 cart=cart.filter(item=>item.index!==index);
 updateCart();
}

function updateCart(){
 const count=cart.reduce((sum,item)=>sum+item.qty,0);
 document.getElementById("cartCount").textContent=faNumber(count);

 const box=document.getElementById("cartItems");
 const total=cart.reduce((sum,item)=>sum+(products[item.index][3]*item.qty),0);
 document.getElementById("cartTotal").textContent=formatPrice(total);

 if(cart.length===0){
  box.innerHTML='<div class="empty-cart">🛒<br><br>سبد خرید شما خالی است.</div>';
  return;
 }

 box.innerHTML=cart.map(item=>{
  const p=products[item.index];
  return `<div class="cart-item">
   <div class="cart-item-pic">${p[1]}</div>
   <div class="cart-item-info">
    <h3>${p[0]}</h3>
    <div class="cart-item-price">${formatPrice(p[3])}</div>
    <div class="qty">
     <button onclick="changeQty(${item.index},1)">+</button>
     <strong>${faNumber(item.qty)}</strong>
     <button onclick="changeQty(${item.index},-1)">−</button>
     <button class="remove" onclick="removeCart(${item.index})">حذف</button>
    </div>
   </div>
  </div>`;
 }).join("");
}

function openCart(){
 document.getElementById("cartOverlay").classList.add("open");
 updateCart();
}

function closeCart(event){
 if(event && event.target!==document.getElementById("cartOverlay"))return;
 document.getElementById("cartOverlay").classList.remove("open");
}

function checkout(){
  if(cart.length===0){
    alert("سبد خرید شما خالی است.");
    return;
  }

  const total=cart.reduce((sum,item)=>sum+(products[item.index][3]*item.qty),0);
  const count=cart.reduce((sum,item)=>sum+item.qty,0);

  document.getElementById("checkoutSummary").textContent=
    faNumber(count)+" کالا — "+formatPrice(total);

  document.getElementById("orderSubtotal").textContent=formatPrice(total);
  updateShippingCost();

  document.getElementById("cartOverlay").classList.remove("open");
  document.getElementById("checkoutOverlay").classList.add("open");
}

function updateShippingCost(){
  const shipping=document.getElementById("shippingMethod").value==="express" ? 150000 : 0;
  const subtotal=cart.reduce((sum,item)=>sum+(products[item.index][3]*item.qty),0);

  document.getElementById("shippingCost").textContent=
    shipping ? formatPrice(shipping) : "رایگان";

  document.getElementById("orderTotal").textContent=
    formatPrice(subtotal+shipping);
}

function closeCheckout(event){
  if(event && event.target!==document.getElementById("checkoutOverlay")) return;
  document.getElementById("checkoutOverlay").classList.remove("open");
}

function submitOrder(event){
  event.preventDefault();

  const phone=document.getElementById("customerPhone").value.trim();
  const postal=document.getElementById("customerPostal").value.trim();

  if(!/^09\d{9}$/.test(phone)){
    alert("لطفاً شماره موبایل ۱۱ رقمی را به شکل 09xxxxxxxxx وارد کنید.");
    return;
  }

  if(!/^\d{10}$/.test(postal)){
    alert("لطفاً کد پستی ۱۰ رقمی را وارد کنید.");
    return;
  }

  const orderNumber="HM-"+Date.now().toString().slice(-8);

  const order={
    number:orderNumber,
    customer:{
      name:document.getElementById("customerName").value.trim(),
      phone:phone,
      province:document.getElementById("customerProvince").value.trim(),
      city:document.getElementById("customerCity").value.trim(),
      address:document.getElementById("customerAddress").value.trim(),
      postal:postal
    },
    shipping:document.getElementById("shippingMethod").value,
    items:cart.map(item=>({
      name:products[item.index][0],
      price:products[item.index][3],
      qty:item.qty
    })),
    createdAt:new Date().toISOString()
  };

  localStorage.setItem("hamino_last_order",JSON.stringify(order));

  document.getElementById("checkoutFormWrap").style.display="none";
  document.getElementById("orderSuccess").style.display="block";
  document.getElementById("orderNumber").textContent=orderNumber;
}

function finishOrder(){
  cart=[];
  updateCart();
  document.getElementById("checkoutForm").reset();
  document.getElementById("checkoutFormWrap").style.display="block";
  document.getElementById("orderSuccess").style.display="none";
  document.getElementById("checkoutOverlay").classList.remove("open");
}

document.getElementById("search").addEventListener("input",e=>{
 const q=e.target.value.trim();
 [...document.querySelectorAll(".product")].forEach(el=>el.style.display=(!q||el.innerText.includes(q))?"block":"none");
});

updateCart();


document.getElementById("shippingMethod").addEventListener("change",updateShippingCost);
