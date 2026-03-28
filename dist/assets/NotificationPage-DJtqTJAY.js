import{n as T,o as E,r,p as o,j as t,q as L,L as R,E as O,s as b,t as U,v as I,w as $}from"./index-DgW5EV3o.js";import{P as G}from"./Pagination-8nWdf0qi.js";const Y=[{value:"all",label:"All"},{value:"unread",label:"Unread"},{value:"read",label:"Read"}],B=[{value:"all",label:"All Categories"},{value:"general",label:"General"},{value:"system",label:"System"},{value:"user",label:"User"},{value:"admin",label:"Admin"},{value:"security",label:"Security"},{value:"promotion",label:"Promotion"}],M=10;function q(a){return a.priority==="high"||a.type==="security"?t.jsx(U,{className:"w-5 h-5 text-accent-red"}):a.type==="admin"?t.jsx(I,{className:"w-5 h-5 text-accent-green"}):a.type==="system"?t.jsx($,{className:"w-5 h-5 text-accent-yellow"}):t.jsx(b,{className:"w-5 h-5 text-neutral-gray-500"})}function D(a){return a.priority==="high"||a.type==="security"?"bg-accent-red/10":a.type==="admin"?"bg-accent-green/10":a.type==="system"?"bg-accent-yellow/10":"bg-bg-light-blue"}const J=()=>{const{notifications:a,setNotifications:p,setUnreadCount:f,markAsRead:y,markAllAsRead:N,isLoading:g,setLoading:x}=T(),v=E(),[c,d]=r.useState(1),[m,j]=r.useState(1),[s,w]=r.useState("all"),[n,k]=r.useState("all"),u=r.useCallback(async()=>{x(!0);try{const e={page:c,per_page:M};n!=="all"&&(e.category=n),s==="unread"&&(e.unread_only=!0),s==="read"&&(e.read_only=!0);const l=(await o.getNotifications(e))?.data||{},F=(l.records||[]).map(h=>({...h,is_read:h.is_viewed===1}));p(F),j(l.last_page||1),typeof l.unread_count=="number"&&f(l.unread_count)}catch(e){v.error(e.message||"Failed to load notifications")}finally{x(!1)}},[c,s,n]);r.useEffect(()=>{u()},[u]);const _=e=>{w(e),d(1)},C=e=>{k(e),d(1)},S=async e=>{if(!e.is_read)try{await o.markNotificationClicked({id:e._id}),await o.changeNotificationStatus({id:e._id,status:1}),y(e._id)}catch{}},P=async()=>{const e=a.filter(i=>!i.is_read);if(e.length){try{await Promise.all(e.map(i=>o.changeNotificationStatus({id:i._id,status:1}))),N()}catch{}setTimeout(()=>u(),500)}},A=a.some(e=>!e.is_read);return t.jsxs("div",{className:"min-h-screen bg-bg-primary",children:[t.jsxs("div",{className:"bg-brand-primary px-6 py-5",children:[t.jsx("h1",{className:"text-xl font-display font-bold text-white tracking-wide",children:"Notifications"}),t.jsx("p",{className:"text-sm text-white/60 mt-0.5",children:"Your alerts, updates, and messages"})]}),t.jsxs("div",{className:"p-4 md:p-6 space-y-4 max-w-8xl",children:[t.jsxs("div",{className:"bg-bg-card border border-stroke-light rounded-xl p-4 space-y-3",children:[t.jsx("div",{className:"flex gap-1.5",children:Y.map(e=>t.jsx("button",{onClick:()=>_(e.value),className:`
                                    flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold
                                    transition-colors duration-150
                                    ${s===e.value?"bg-brand-primary text-white":"bg-bg-light-blue text-neutral-gray-500 hover:bg-brand-primary/20 hover:text-brand-text"}
                                `,children:e.label},e.value))}),t.jsxs("div",{className:"flex items-center gap-2",children:[t.jsx("select",{value:n,onChange:e=>C(e.target.value),className:`\r
                                flex-1 text-xs px-3 py-2 rounded-lg\r
                                border border-stroke-primary\r
                                bg-bg-card text-brand-text\r
                                focus:outline-none focus:border-brand-primary\r
                                transition-colors\r
                            `,children:B.map(e=>t.jsx("option",{value:e.value,className:"bg-bg-secondary text-brand-text",children:e.label},e.value))}),A&&t.jsxs("button",{onClick:P,className:`\r
                                    flex items-center gap-1.5 text-xs font-semibold\r
                                    text-brand-text whitespace-nowrap\r
                                    px-3 py-2 rounded-lg\r
                                    border border-stroke-light\r
                                    bg-bg-card\r
                                    hover:bg-accent-green hover:text-white\r
                                    hover:border-accent-green\r
                                    transition-colors duration-150\r
                                `,children:[t.jsx(L,{className:"w-3 h-3"}),"Mark all read"]})]})]}),g?t.jsx(R,{text:"Loading notifications..."}):a.length===0?t.jsx(O,{title:"No Notifications",description:"You have no notifications matching your current filters.",icon:t.jsx(b,{className:"w-12 h-12"})}):t.jsx("div",{className:"space-y-2",children:a.map(e=>t.jsx("div",{onClick:()=>S(e),className:`
                                    p-4 rounded-xl border transition-all duration-150
                                    ${e.is_read?"bg-bg-card border-stroke-light cursor-default":"bg-accent-green/5 border-accent-green/30 hover:border-accent-green/60 cursor-pointer"}
                                `,children:t.jsxs("div",{className:"flex items-start gap-3",children:[t.jsx("div",{className:`p-2 rounded-lg flex-shrink-0 mt-0.5 ${D(e)}`,children:q(e)}),t.jsxs("div",{className:"flex-1 min-w-0",children:[t.jsx("p",{className:`
                                            text-sm font-semibold leading-snug
                                            ${e.is_read?"text-neutral-gray-500":"text-brand-text"}
                                        `,children:e.title}),t.jsx("p",{className:"text-sm text-brand-text/80 mt-0.5 leading-relaxed",children:e.message}),t.jsxs("div",{className:"flex items-center gap-2 mt-2 flex-wrap",children:[t.jsx("span",{className:"text-xs text-neutral-gray-500",children:new Date(e.createdAt).toLocaleString()}),e.category&&t.jsx("span",{className:`\r
                                                    text-[10px] font-semibold px-1.5 py-0.5\r
                                                    rounded-full uppercase tracking-wider\r
                                                    bg-bg-light-blue text-neutral-gray-500\r
                                                    border border-stroke-light\r
                                                `,children:e.category}),e.priority==="high"&&t.jsx("span",{className:`\r
                                                    text-[10px] font-bold px-1.5 py-0.5\r
                                                    rounded-full uppercase tracking-wider\r
                                                    bg-accent-red/10 text-accent-red\r
                                                `,children:"High Priority"})]})]}),!e.is_read&&t.jsx("div",{className:"w-2.5 h-2.5 rounded-full bg-accent-green flex-shrink-0 mt-1"})]})},e._id))}),!g&&m>1&&t.jsx(G,{currentPage:c,totalPages:m,onPageChange:d,className:"mt-4"})]})]})};export{J as default};
