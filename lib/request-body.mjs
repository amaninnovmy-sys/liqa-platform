/** Read a bounded JSON body without buffering an arbitrarily large payload. */
export async function readJson(request, maxBytes=16384) {
 const declared=Number(request.headers.get('content-length'));
 if(Number.isFinite(declared)&&declared>maxBytes)throw Object.assign(Error('حجم الطلب أكبر من المسموح.'),{status:413});
 if(!request.body)throw Error('محتوى الطلب مطلوب.');
 const reader=request.body.getReader();let size=0;const chunks=[];
 try {
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;
   if(size>maxBytes){await reader.cancel();throw Object.assign(Error('حجم الطلب أكبر من المسموح.'),{status:413});}chunks.push(value);}
 }finally{reader.releaseLock();}
 const buffer=new Uint8Array(size);let offset=0;for(const c of chunks){buffer.set(c,offset);offset+=c.length;}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(buffer));}catch{throw Error('محتوى JSON غير صالح.');}
}
