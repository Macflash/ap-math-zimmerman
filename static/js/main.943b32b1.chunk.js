(this["webpackJsonpap-math-zimmerman"]=this["webpackJsonpap-math-zimmerman"]||[]).push([[0],{11:function(n,t,e){},12:function(n,t,e){},14:function(n,t,e){"use strict";e.r(t);var r=e(1),o=e.n(r),i=e(4),c=e.n(i),u=(e(11),e(2)),a=(e(12),e(5)),l=e(6);var s=function(){function n(t,e){Object(a.a)(this,n),this.x=t,this.y=e}return Object(l.a)(n,[{key:"toString",value:function(){return"".concat(this.x,", ").concat(this.y)}},{key:"toRowAndColumn",value:function(){return{row:this.x,col:(this.y+this.x)/2}}}],[{key:"FromRowAndColumn",value:function(t,e){return new n(t,2*e-t)}},{key:"add",value:function(t,e){return new n(t.x+e.x,t.y+e.y)}},{key:"subtract",value:function(t,e){return new n(t.x-e.x,t.y-e.y)}},{key:"multiply",value:function(t,e){return new n(t.x*e,t.y*e)}}]),n}(),f=e(0);function d(n){for(var t=[],e=n,r=0;r<n;r++){t[r]=[];for(var o=0;o<e;o++)t[r][o]=0;e++}for(var i=0,c=n;c<2*n-1;c++){t[c]=[],i++,e--;for(var u=0;u<e+i-1;u++)t[c][u]=0,u<i&&(t[c][u]=-1)}return t}var h=d(4);function v(n,t,e){var r=t.toRowAndColumn();n[r.row]&&n[r.row][r.col]>=0&&(n[r.row][r.col]=e)}function j(n,t,e){if(0==n[t][e]){console.log("Adding dot",t,e);var r=s.FromRowAndColumn(t,e);n.forEach((function(t,e){t.forEach((function(t,o){if(1===t){var i=s.FromRowAndColumn(e,o),c=s.subtract(r,i),u=s.add(r,c),a=s.add(i,s.multiply(c,-1));v(n,u,3),v(n,a,3);var l=s.multiply(s.add(i,r),.5);l.toRowAndColumn();v(n,l,2)}}))})),n[t][e]=1}}function b(n,t){n.forEach((function(e,r){e.forEach((function(e,o){t(e,r,o,n)}))}))}function m(n){var t=0;return b(n,(function(n){n>1&&t++})),t}function p(n){b(n,(function(t,e,r){t>0&&(n[e][r]=0)}))}function y(n){var t=[];return b(n,(function(n,e,r){t[e]=t[e]||[],t[e][r]=n})),t}function x(n){return n.map((function(n){var t=[],e=0;return n.forEach((function(n,r){-1===n&&e++,1===n&&t.push(r-e)})),"{".concat(t.join(","),"}")})).join(", ")}function g(n){var t={row:0,col:0},e=-1,r=!0;if(b(n,(function(n,o,i){if(0===n){r=!1;var c=Math.random();c>e&&(e=c,t={row:o,col:i})}})),r)throw"FULL!";return t}function w(n){for(var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:10,e=999999999999999,r=n,o=0;o<t;o++){var i=g(n),c=y(n);j(c,i.row,i.col);var u=m(c);u<e&&(e=u,r=c)}return r}var C=0,O=[];var k=function(){var n=o.a.useState(10),t=Object(u.a)(n,2),e=t[0],r=t[1],i=o.a.useState(4),c=Object(u.a)(i,2),a=c[0],l=c[1];o.a.useEffect((function(){h=d(a),C=0,g()}),[a,l]);var v=o.a.useState(Math.random()),m=Object(u.a)(v,2)[1],g=o.a.useCallback((function(){return m(Math.random())}),[m]),k=function(n){var t=0;return b(n,(function(n){1===n&&t++})),t}(h);return k>C&&(C=k,O=y(h)),Object(f.jsxs)("div",{className:"App",children:[Object(f.jsxs)("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-around",padding:10},children:[Object(f.jsx)("button",{onClick:function(){p(h),g()},children:"Clear"}),Object(f.jsxs)("span",{children:["Order: ",Object(f.jsx)("input",{type:"number",value:a,onChange:function(n){l(Number.parseInt(n.target.value)),g()}})]}),Object(f.jsxs)("span",{children:[" Score: ",k]}),Object(f.jsxs)("span",{children:[" Best: ",C]})]}),Object(f.jsxs)("div",{children:["Current: ",Object(f.jsx)("input",{style:{maxWidth:2e3},value:x(h),onChange:function(n){var t=function(n){console.log("entered!");var t=n.split("},"),e=(h.length+1)/2,r=d(e);return t.forEach((function(n,t){n=(n=n.replace("{","")).replace("}",""),console.log("row",n);var e=n.split(",").map((function(n){return Number.parseInt(n.trim())})).filter((function(n){return!isNaN(n)}));console.log(e);var o=r[t].filter((function(n){return-1===n})).length;e.forEach((function(n){j(r,t,n+o)}))})),{order:e,rows:r}}(n.target.value);h=t.rows,l(t.order),g()}}),"  Best",Object(f.jsx)("input",{style:{maxWidth:200},value:x(O)})]}),Object(f.jsxs)("div",{children:["Tries: ",Object(f.jsx)("input",{type:"number",value:e,style:{width:50},onChange:function(n){return r(Number.parseInt(n.target.value))}}),Object(f.jsx)("button",{onClick:function(){try{h=w(h,e),g()}catch(n){}},children:"Fill NEXT"}),Object(f.jsx)("button",{onClick:function(){!function n(){try{h=w(h,e),g(),setTimeout(n,0)}catch(t){}}()},children:"Fill All"}),Object(f.jsx)("button",{onClick:function(){var n=0;!function t(){if(!(n>10))try{h=w(h,e),g(),setTimeout(t,0)}catch(r){n++,p(h),setTimeout(t,0)}}()},children:"Fill 10"})]}),Object(f.jsxs)("div",{style:{position:"relative"},children:[a>50?"Sorry this is too big right now. Set order to 50 or less.":null,a<=50?h.map((function(n,t){return Object(f.jsx)("div",{style:{display:"flex",justifyContent:"center"},children:n.map((function(n,e){var r="white";switch(n){case-1:r="lightgrey";break;case 1:r="red";break;case 2:case 3:r="grey"}return Object(f.jsx)("div",{style:{width:50,height:50,display:-1===n?"none":"flex",alignItems:"center",textAlign:"center",justifyContent:"center",userSelect:"none",backgroundColor:r,border:"1px solid black",borderRadius:100,position:"absolute",top:50*s.FromRowAndColumn(t,e).x,left:55*(s.FromRowAndColumn(t,e).y+a)/2},onClick:h[t][e]<=1?function(){1===h[t][e]?h[t][e]=0:0===h[t][e]&&j(h,t,e),g()}:void 0,children:s.FromRowAndColumn(t,e).toString()},e)}))},t)})):null]})]})},F=function(n){n&&n instanceof Function&&e.e(3).then(e.bind(null,15)).then((function(t){var e=t.getCLS,r=t.getFID,o=t.getFCP,i=t.getLCP,c=t.getTTFB;e(n),r(n),o(n),i(n),c(n)}))};c.a.render(Object(f.jsx)(o.a.StrictMode,{children:Object(f.jsx)(k,{})}),document.getElementById("root")),F()}},[[14,1,2]]]);
//# sourceMappingURL=main.943b32b1.chunk.js.map