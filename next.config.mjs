// Standard Node server build: npm run build, then npm run start.
// A standalone container export may be configured later with its own start script.
const config={trailingSlash:true,poweredByHeader:false,images:{unoptimized:true},async headers(){return [{source:'/:path*',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]}]}};
export default config;
