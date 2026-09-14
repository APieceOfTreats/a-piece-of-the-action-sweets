
const PRODUCTS={
  "cinnamon-single":{name:"The Original Cinnamon Piece",amount:700},
  "cinnamon-box4":{name:"The Original Cinnamon Piece — Box of 4",amount:2499},
  "og-cookie-single":{name:"The OG Chocolate Chip",amount:500},
  "og-cookie-box4":{name:"The OG Chocolate Chip — Box of 4",amount:1699},
  "snickerdoodle-single":{name:"Signature Snickerdoodle",amount:500},
  "snickerdoodle-box4":{name:"Signature Snickerdoodle — Box of 4",amount:1699},
  "smore-single":{name:"S’more of the Action",amount:500},
  "smore-box4":{name:"S’more of the Action — Box of 4",amount:1699},
  "strawberry-single":{name:"Strawberry Cakesicle",amount:400},
  "strawberry-box4":{name:"Strawberry Cakesicle — Box of 4",amount:1399},
  "confetti-single":{name:"Confetti Cakesicle",amount:400},
  "confetti-box4":{name:"Confetti Cakesicle — Box of 4",amount:1399},
  "cosmic-single":{name:"Cosmic Chocolate Cakesicle",amount:400},
  "cosmic-box4":{name:"Cosmic Chocolate Cakesicle — Box of 4",amount:1399},
  "apple-single":{name:"Classic Caramel Apple Crunch",amount:700},
  "apple-box4":{name:"Classic Caramel Apple Crunch — Box of 4",amount:2499},
  "cookie-surprise-box4":{name:"Surprise Me! Cookie Box of 4",amount:1699},
  "cakesicle-surprise-box4":{name:"Surprise Me! Cakesicle Box of 4",amount:1399}
};

export async function onRequest(context){
  if(context.request.method==="GET"){
    return json({
      ok:true,
      message:"A Piece of the Action Square checkout endpoint is online.",
      environment:(context.env.SQUARE_ENVIRONMENT||"sandbox")
    });
  }
  if(context.request.method!=="POST"){
    return json({error:"Method not allowed."},405);
  }

  try{
    const {env,request}=context;
    if(!env.SQUARE_ACCESS_TOKEN || !env.SQUARE_LOCATION_ID){
      return json({error:"Square is not configured. Add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID in Cloudflare Pages."},500);
    }

    const body=await request.json();
    if(!body || !Array.isArray(body.items) || !body.items.length){
      return json({error:"Your cart is empty."},400);
    }

    const line_items=[];
    let quantityTotal=0;

    for(const item of body.items){
      const p=PRODUCTS[item.sku];
      const qty=Number(item.quantity);
      if(!p || !Number.isInteger(qty) || qty<1 || qty>20){
        return json({error:"Invalid cart item or quantity."},400);
      }
      quantityTotal+=qty;
      line_items.push({
        name:p.name,
        quantity:String(qty),
        base_price_money:{amount:p.amount,currency:"USD"}
      });
    }

    if(quantityTotal>50){
      return json({error:"Please contact orders@apiecetreats.com for larger orders."},400);
    }

    const environment=(env.SQUARE_ENVIRONMENT||"sandbox").toLowerCase();
    const base=environment==="production" ? "https://connect.squareup.com" : "https://connect.squareupsandbox.com";
    const origin=new URL(request.url).origin;

    const payload={
      idempotency_key:crypto.randomUUID(),
      order:{
        location_id:env.SQUARE_LOCATION_ID,
        line_items
      },
      checkout_options:{
        redirect_url:`${origin}/?checkout=complete`,
        merchant_support_email:"orders@apiecetreats.com",
        ask_for_shipping_address:false,
        allow_tipping:false
      },
      payment_note:"A Piece of the Action Sweets — Santa Clarita Friday bake"
    };

    const squareResponse=await fetch(`${base}/v2/online-checkout/payment-links`,{
      method:"POST",
      headers:{
        "Authorization":`Bearer ${env.SQUARE_ACCESS_TOKEN}`,
        "Content-Type":"application/json",
        "Square-Version":"2026-08-19"
      },
      body:JSON.stringify(payload)
    });

    const raw=await squareResponse.text();
    let squareData={};
    try{ squareData=raw ? JSON.parse(raw) : {}; }
    catch{
      return json({error:`Square returned a non-JSON response (${squareResponse.status}).`},502);
    }

    if(!squareResponse.ok){
      console.error("Square error:",raw);
      const detail=squareData?.errors?.[0]?.detail || "Square could not create checkout.";
      return json({error:detail},502);
    }

    const url=squareData?.payment_link?.url;
    if(!url)return json({error:"Square did not return a payment link."},502);
    return json({url});
  }catch(error){
    console.error(error);
    return json({error:"Unable to start checkout right now."},500);
  }
}

function json(data,status=200){
  return new Response(JSON.stringify(data),{
    status,
    headers:{"Content-Type":"application/json; charset=utf-8"}
  });
}
