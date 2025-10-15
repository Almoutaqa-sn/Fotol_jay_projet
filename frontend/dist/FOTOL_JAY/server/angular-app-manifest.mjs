
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "redirectTo": "/products",
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/register"
  },
  {
    "renderMode": 2,
    "route": "/products"
  },
  {
    "renderMode": 2,
    "route": "/vendor/products"
  },
  {
    "renderMode": 2,
    "route": "/admin/dashboard"
  },
  {
    "renderMode": 2,
    "redirectTo": "/products",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 487, hash: '171894463e96eb9213b75ef4f81d9c0d363d116fd836a8737b0170f47dd541db', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1000, hash: '2a488c3da15ca8f035bca19a5aff4190a753004b7fdc8c39e390b571af06efc3', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'vendor/products/index.html': {size: 7673, hash: '983100ebec5b89c22eba278061ae1bcf02a3660c8b5e994f2f41d775ba72b676', text: () => import('./assets-chunks/vendor_products_index_html.mjs').then(m => m.default)},
    'admin/dashboard/index.html': {size: 9974, hash: '7d5ff5310745bf3b4917cbd5908cd38be3347f3c52d90d28153b8e0f9e2bae85', text: () => import('./assets-chunks/admin_dashboard_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 7319, hash: '03e337761b00088512d965496423846c6744ff50f3fc98045e71aefa4147f4fb', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'products/index.html': {size: 8252, hash: 'ab2f54fe2a639d8e5058a10da1834b6bad1b738f64f8fadd4b4af6c5faae840f', text: () => import('./assets-chunks/products_index_html.mjs').then(m => m.default)},
    'register/index.html': {size: 8657, hash: 'a964f74b34e27ddcd6b052aa5fef3d596542ac67a4444c3ef341e1c6b803b8f0', text: () => import('./assets-chunks/register_index_html.mjs').then(m => m.default)},
    'styles-5INURTSO.css': {size: 0, hash: 'menYUTfbRu8', text: () => import('./assets-chunks/styles-5INURTSO_css.mjs').then(m => m.default)}
  },
};
