import{j as e,_ as n,F as d}from"./index-DgW5EV3o.js";const x=({fromDate:a,toDate:t,onFromChange:s,onToChange:i,onApply:l,className:o})=>e.jsxs("div",{className:`flex flex-wrap items-end gap-3 ${o??""}`,children:[e.jsxs("div",{className:"flex flex-col gap-1 min-w-0",children:[e.jsx("label",{className:"text-xs font-semibold text-brand-text/60 uppercase tracking-wide",children:"From"}),e.jsxs("div",{className:"relative flex items-center",children:[e.jsx(n,{className:"absolute left-2.5 w-3.5 h-3.5 text-brand-text/40 pointer-events-none"}),e.jsx("input",{type:"date",value:a,onChange:r=>s(r.target.value),className:`\r
                            pl-8 pr-3 py-2 text-sm rounded-lg\r
                            bg-bg-card border border-stroke-primary\r
                            text-brand-text\r
                            focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary\r
                            transition-colors duration-150\r
                            [color-scheme:dark]\r
                        `})]})]}),e.jsxs("div",{className:"flex flex-col gap-1 min-w-0",children:[e.jsx("label",{className:"text-xs font-semibold text-brand-text/60 uppercase tracking-wide",children:"To"}),e.jsxs("div",{className:"relative flex items-center",children:[e.jsx(n,{className:"absolute left-2.5 w-3.5 h-3.5 text-brand-text/40 pointer-events-none"}),e.jsx("input",{type:"date",value:t,onChange:r=>i(r.target.value),className:`\r
                            pl-8 pr-3 py-2 text-sm rounded-lg\r
                            bg-bg-card border border-stroke-primary\r
                            text-brand-text\r
                            focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary\r
                            transition-colors duration-150\r
                            [color-scheme:dark]\r
                        `})]})]}),e.jsxs("button",{onClick:l,className:`\r
                    flex items-center gap-1.5\r
                    px-4 py-2 rounded-lg text-sm font-semibold\r
                    bg-brand-primary text-white\r
                    hover:bg-brand-primary-light\r
                    active:bg-brand-primary-dark\r
                    transition-colors duration-150\r
                    whitespace-nowrap\r
                `,children:[e.jsx(d,{className:"w-3.5 h-3.5"}),"Apply"]})]});export{x as D};
