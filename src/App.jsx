import { useState, useRef, useEffect } from "react";

// ─── ADVISORS with AI-style avatar colors ──────────────────────────────────────
const ADVISORS = [
  { name: "Elena",  avatar: "EL", bg: "#1D4ED8", role: "Gestora administrativa" },
  { name: "Luna",   avatar: "LU", bg: "#0891B2", role: "Especialista en trámites" },
  { name: "María",  avatar: "MA", bg: "#7C3AED", role: "Asesora administrativa" },
];
const ADVISOR = ADVISORS[Math.floor(Math.random() * ADVISORS.length)];

// ─── GREETING by hour ─────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 20) return "Buenas tardes";
  return "Buenas noches";
};

const isOnline = () => {
  const h = new Date().getHours();
  const d = new Date().getDay();
  return d >= 1 && d <= 6 && h >= 9 && h < 19;
};

// ─── THEME ────────────────────────────────────────────────────────────────────
const DARK = {
  bg: "#0B1120", card: "#111827", card2: "#162032", line: "#1E2D45",
  blue: "#3B82F6", cyan: "#22D3EE", text: "#F0F6FF", muted: "#64748B",
  mut2: "#94A3B8", green: "#22C55E", name: "dark"
};
const LIGHT = {
  bg: "#F1F5F9", card: "#FFFFFF", card2: "#F8FAFC", line: "#E2E8F0",
  blue: "#2563EB", cyan: "#0891B2", text: "#0F172A", muted: "#64748B",
  mut2: "#475569", green: "#16A34A", name: "light"
};

// ─── SYSTEM PROMPT ────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Eres ${ADVISOR.name}, gestora administrativa de GestiFR.

REGLAS:
1. Nunca digas que eres IA. Eres gestora del equipo.
2. No uses frases de espera. Responde directo.
3. Máximo 3 frases por respuesta.
4. Ir al grano: confirma lo que necesita, da precio, ofrece gestión.

HORARIO: Lunes a sábado 9h-19h. Fuera de horario: "Te responderemos mañana a primera hora."

SALUDO: Usa "${getGreeting()}" al inicio si es el primer mensaje.

PRECIOS:
- Carta oficial (traducción + explicación): 79€
- Carta + respuesta/reclamación: 129€
- Correspondencia oficial completa: 120€
- Cita médica: 9€
- Inscripción France Travail: 59€
- Actualización France Travail: 29€/mes
- N° Sécurité Sociale (NIR): 59€
- Prestación desempleo: 79€
- RSA: 69€ | APL: 69€ | Carte Vitale: 59€
- Carte de Séjour: próximamente
- Declaración impuestos: 99€
- CV desde cero: 89€ | Adaptación CV: 59€
- Casier judiciaire: 49€
- Création compte CAF: 49€ | Ameli: 39€
- Traducción contrato: 49€
- Canje carnet conducir: 69€
- Inscripción escolar: 39€
- Compte impots.gouv: 39€ | France Connect: 29€
- Rupture conventionnelle: 89€ (incluye: explicación del proceso en español + traducción de documentos + ayuda con formulario CERFA)
- Dossier alquiler: 59€

FILOSOFÍA: Confirma en 1 frase, da precio, ofrece gestión con [MOSTRAR_CITA].
FRANCE TRAVAIL: Requiere ser europeo O tener documentación legal.
CONTACTO: WhatsApp para contratar. Pago por tarjeta próximamente.`;

// ─── SERVICES ─────────────────────────────────────────────────────────────────
const SERVICES = [
  { id:"carta",        icon:"📨", title:"Carta Oficial",            sub:"Traducción y explicación",         price:"desde 79€", hot:false, cat:"documentos",
    docs:["La carta original","DNI o pasaporte"], time:"24-48h", status:"" },
  { id:"correspondencia",icon:"✉️",title:"Correspondencia Oficial", sub:"Traducción + respuesta",           price:"120€",      hot:false, cat:"documentos",
    docs:["El documento original","DNI o pasaporte"], time:"48-72h", status:"" },
  { id:"medico",       icon:"🏥", title:"Cita Médica",             sub:"Médecin traitant / especialista",  price:"9€",        hot:true,  cat:"salud",
    docs:["Carte Vitale o attestation","Nombre del médico si lo tienes"], time:"Mismo día", status:"" },
  { id:"francetravail",icon:"🏢", title:"Inscripción France Travail",sub:"Registro en el INEM francés",    price:"59€",       hot:true,  cat:"empleo",
    docs:["DNI o pasaporte","Titre de séjour (si no eres europeo)","Último contrato de trabajo"], time:"2-3 días", status:"" },
  { id:"actualizacion",icon:"🔄", title:"Actualización France Travail",sub:"Mensual obligatoria",          price:"29€",       hot:false, cat:"empleo",
    docs:["Número de dossier France Travail","Situación actual (en busca de empleo)"], time:"Mismo día", status:"" },
  { id:"segsocial",    icon:"🏥", title:"N° Sécurité Sociale",     sub:"Demande NIR",                      price:"59€",       hot:false, cat:"salud",
    docs:["Pasaporte o DNI","Acta de nacimiento (traducida)","Justificatif de domicile"], time:"2-4 semanas", status:"" },
  { id:"paro",         icon:"💼", title:"Prestación Desempleo",    sub:"Trámite solicitud",                price:"79€",       hot:false, cat:"empleo",
    docs:["Attestation France Travail","Últimas 3 nóminas","Contrato y carta de despido"], time:"3-5 días", status:"" },
  { id:"rsa",          icon:"🤝", title:"RSA",                     sub:"Revenu de Solidarité Active",      price:"69€",       hot:false, cat:"ayudas",
    docs:["DNI o pasaporte","Justificatif de domicile","Extracto bancario 3 meses"], time:"2-3 días", status:"" },
  { id:"apl",          icon:"🏠", title:"APL",                     sub:"Ayuda al alquiler CAF",            price:"69€",       hot:false, cat:"ayudas",
    docs:["Contrato de alquiler","DNI o pasaporte","RIB (número de cuenta francesa)"], time:"2-3 días", status:"" },
  { id:"alquiler",     icon:"🏠", title:"Dossier de Alquiler",     sub:"Dossier complet para alquilar",    price:"59€",       hot:true,  cat:"vivienda",
    docs:["3 últimas nóminas","Contrato de trabajo","DNI o pasaporte","RIB"], time:"24-48h", status:"" },
  { id:"cartevitale",  icon:"💳", title:"Carte Vitale",            sub:"Tarjeta sanitaria",                price:"59€",       hot:false, cat:"salud",
    docs:["NIR o attestation CPAM","DNI o pasaporte","Justificatif de domicile"], time:"1-2 semanas", status:"" },
  { id:"sejour",       icon:"📋", title:"Carte de Séjour",         sub:"Prochainement",                    price:"—",         hot:false, cat:"residencia", soon:true,
    docs:[], time:"", status:"" },
  { id:"impots",       icon:"📊", title:"Declaración Impuestos",   sub:"Déclaration d'impôts",             price:"99€",       hot:false, cat:"fiscal",
    docs:["Avis d'imposition anterior","Todas las nóminas del año","RIB"], time:"3-5 días", status:"" },
  { id:"cv",           icon:"📝", title:"CV en Francés",           sub:"Elaboración y adaptación",         price:"desde 59€", hot:false, cat:"empleo",
    docs:["CV actual (si tienes)","Descripción de tu experiencia","Tipo de trabajo buscado"], time:"48-72h", status:"" },
  { id:"casier",       icon:"⚖️", title:"Casier Judiciaire",       sub:"Antécédents pénaux",               price:"49€",       hot:false, cat:"documentos",
    docs:["DNI o pasaporte","Para qué lo necesitas (trabajo, trámite...)"], time:"1-2 semanas", status:"" },
  { id:"caf",          icon:"🏦", title:"Création Compte CAF",     sub:"Ouverture et inscription",         price:"49€",       hot:false, cat:"ayudas",
    docs:["NIR (número seguridad social)","DNI o pasaporte","Justificatif de domicile","RIB"], time:"24-48h", status:"" },
  { id:"ameli",        icon:"🩺", title:"Création Compte Ameli",   sub:"Assurance Maladie · CPAM",         price:"39€",       hot:false, cat:"salud",
    docs:["NIR o attestation CPAM","Email válido","DNI o pasaporte"], time:"Mismo día", status:"" },
  { id:"contrato",     icon:"📄", title:"Traducción Contrato",     sub:"Antes de firmar",                  price:"49€",       hot:false, cat:"empleo",
    docs:["El contrato en PDF o foto"], time:"24h", status:"" },
  { id:"carnet",       icon:"🚗", title:"Canje Carnet Conducir",   sub:"Permis de conduire français",      price:"69€",       hot:false, cat:"documentos",
    docs:["Carnet de conducir original","DNI o pasaporte","Justificatif de domicile","Foto carnet"], time:"4-8 semanas", status:"" },
  { id:"escuela",      icon:"👶", title:"Inscripción Escolar",     sub:"École / crèche / garderie",        price:"39€",       hot:false, cat:"familia",
    docs:["DNI o pasaporte (padre/madre)","Libro de familia o acta de nacimiento del niño","Justificatif de domicile"], time:"2-3 días", status:"" },
  { id:"impotsgouv",   icon:"💻", title:"Compte impots.gouv",      sub:"Création et configuration",        price:"39€",       hot:false, cat:"fiscal",
    docs:["Avis d'imposition (si tienes)","NIR","Email válido"], time:"Mismo día", status:"" },
  { id:"franceconnect",icon:"🔗", title:"France Connect",          sub:"Accès à tous les services",        price:"29€",       hot:false, cat:"digital",
    docs:["Cuenta CAF, Ameli o impots.gouv","Email válido"], time:"Mismo día", status:"" },
  { id:"rupture",      icon:"🤝", title:"Rupture Conventionnelle", sub:"Explicación · Documentos · CERFA", price:"89€",       hot:false, cat:"empleo",
    docs:["✅ Explicación del proceso en español","✅ Traducción de todos los documentos","✅ Ayuda para rellenar el formulario CERFA","✅ Asesoramiento y gestión de documentación","📄 Contrato de trabajo actual","📄 Últimas 3 nóminas","📄 Propuesta del empleador (si existe)"], time:"5-10 días", status:"" },
];

const INTROS = {
  carta:`${getGreeting()} 👋 Recibir una carta oficial puede ser estresante. Te lo traducimos y explicamos todo por 79€. ¿La tienes a mano?`,
  correspondencia:`${getGreeting()} 👋 Te gestionamos la correspondencia completa — traducción, explicación y respuesta — por 120€.`,
  medico:`${getGreeting()} 👋 Te pedimos la cita médica por solo 9€. ¿Es para médico de cabecera o especialista?`,
  francetravail:`${getGreeting()} 👋 Te inscribimos en France Travail por 59€. Solo necesitamos tus documentos. ¿Eres ciudadano europeo o tienes titre de séjour?`,
  actualizacion:`${getGreeting()} 👋 La actualización mensual de France Travail es obligatoria. Te la hacemos por 29€. ¿Quieres que lo gestionemos ahora?`,
  segsocial:`${getGreeting()} 👋 El NIR es imprescindible en Francia. Te lo tramitamos por 59€. ¿Cuánto tiempo llevas aquí?`,
  paro:`${getGreeting()} 👋 Te gestionamos la prestación por desempleo por 79€. Necesitamos tus documentos de la empresa.`,
  rsa:`${getGreeting()} 👋 El RSA es una ayuda a la que mucha gente tiene derecho sin saberlo. Te lo tramitamos por 69€.`,
  apl:`${getGreeting()} 👋 La APL puede ahorrarte cientos de euros al mes. Te la tramitamos por 69€. ¿Tienes contrato de alquiler?`,
  alquiler:`${getGreeting()} 👋 Un buen dossier es clave para conseguir piso en Francia. Te lo preparamos por 59€.`,
  cartevitale:`${getGreeting()} 👋 Sin Carte Vitale pagas el médico de tu bolsillo. Te la tramitamos por 59€.`,
  sejour:`${getGreeting()} 👋 Este servicio estará disponible muy pronto. Lo coordinamos con profesionales especializados. ¿Puedo ayudarte con otro trámite?`,
  impots:`${getGreeting()} 👋 Te hacemos la declaración de impuestos por 99€. ¿Es tu primera vez en Francia?`,
  cv:`${getGreeting()} 👋 El CV francés tiene un formato muy específico. Te lo elaboramos o adaptamos. ¿Tienes ya uno?`,
  casier:`${getGreeting()} 👋 Te gestionamos el casier judiciaire por 49€. ¿Para qué lo necesitas?`,
  caf:`${getGreeting()} 👋 La cuenta CAF es el acceso a todas las ayudas. Te la creamos por 49€.`,
  ameli:`${getGreeting()} 👋 El compte Ameli te permite gestionar tus reembolsos y Carte Vitale. Te lo creamos por 39€.`,
  contrato:`${getGreeting()} 👋 Te traducimos el contrato antes de firmar por 49€. ¿Lo tienes en PDF o foto?`,
  carnet:`${getGreeting()} 👋 Te gestionamos el canje del carnet por 69€. ¿Tu carnet es español o de otro país?`,
  escuela:`${getGreeting()} 👋 Te gestionamos la inscripción escolar por 39€. ¿Qué edad tiene el niño?`,
  impotsgouv:`${getGreeting()} 👋 Te creamos y configuramos la cuenta de impots.gouv por 39€.`,
  franceconnect:`${getGreeting()} 👋 France Connect te da acceso a todos los servicios públicos. Te lo configuramos por 29€.`,
  rupture:`${getGreeting()} 👋 Te ayudamos con la rupture conventionnelle por 89€. Incluye:
• Explicación completa del proceso en español
• Traducción de todos los documentos
• Ayuda para rellenar el formulario CERFA oficial

¿Ya te la ha propuesto tu empleador o quieres proponerla tú?`,
};

const DEFAULT_INTRO = `${getGreeting()}, soy ${ADVISOR.name} 👋\n\nSoy gestora de GestiFR. Estoy aquí para ayudarte con tus trámites en Francia.\n\n¿En qué puedo ayudarte?`;

const TARIFAS = [
  { icon:"📨", name:"Carta oficial — traducción + explicación",    price:"79€" },
  { icon:"📨", name:"Carta + respuesta o reclamación",             price:"129€" },
  { icon:"✉️", name:"Correspondencia oficial completa",            price:"120€" },
  { icon:"🏥", name:"Cita médica",                                 price:"9€" },
  { icon:"🏢", name:"Inscripción France Travail",                  price:"59€" },
  { icon:"🔄", name:"Actualización France Travail",                price:"29€/mes" },
  { icon:"🏥", name:"N° Sécurité Sociale (NIR)",                  price:"59€" },
  { icon:"💳", name:"Carte Vitale",                                price:"59€" },
  { icon:"🤝", name:"RSA",                                         price:"69€" },
  { icon:"🏠", name:"APL (ayuda al alquiler)",                     price:"69€" },
  { icon:"🏠", name:"Dossier de alquiler completo",                price:"59€" },
  { icon:"💼", name:"Prestación por desempleo",                    price:"79€" },
  { icon:"📋", name:"Carte de Séjour",                             price:"Próximamente", soon:true },
  { icon:"📊", name:"Declaración de impuestos",                    price:"99€" },
  { icon:"📝", name:"Adaptación CV al mercado francés",            price:"59€" },
  { icon:"📝", name:"CV en francés desde cero",                    price:"89€" },
  { icon:"⚖️", name:"Casier judiciaire",                           price:"49€" },
  { icon:"🏦", name:"Création compte CAF",                         price:"49€" },
  { icon:"🩺", name:"Création compte Ameli",                       price:"39€" },
  { icon:"📄", name:"Traducción contrato de trabajo",              price:"49€" },
  { icon:"🚗", name:"Canje carnet de conducir",                    price:"69€" },
  { icon:"👶", name:"Inscripción escolar",                         price:"39€" },
  { icon:"💻", name:"Création compte impots.gouv",                 price:"39€" },
  { icon:"🔗", name:"France Connect",                              price:"29€" },
  { icon:"🤝", name:"Rupture conventionnelle",                     price:"89€" },
];

// ─── CALENDAR ─────────────────────────────────────────────────────────────────
const SLOTS = ["09:00","09:30","10:00","10:30","11:00","11:30","16:00","16:30","17:00","17:30"];
const DE = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
const ME = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
function workDays(n=14){const d=[],t=new Date();while(d.length<n){t.setDate(t.getDate()+1);if(t.getDay()%6)d.push(new Date(t));}return d;}

function Modal({ onClose, onBooked, T }) {
  const [step,setStep]=useState(1);
  const [day,setDay]=useState(null);
  const [slot,setSlot]=useState(null);
  const [form,setForm]=useState({nombre:"",telefono:"",nota:""});
  const [err,setErr]=useState("");
  const days=workDays();
  const confirm=()=>{
    if(!form.nombre.trim()||!form.telefono.trim()){setErr("Completa nombre y teléfono.");return;}
    setStep(4);onBooked(`${DE[day.getDay()]} ${day.getDate()} de ${ME[day.getMonth()]} a las ${slot}`);
  };
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.8)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.card,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",paddingBottom:32}}>
        <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,color:T.text}}>{step===4?"Cita confirmada ✓":"Agendar cita"}</div>
            {step<4&&<div style={{fontSize:12,color:T.muted,marginTop:2}}>GestiFR · Lunes-Sábado 9h-19h</div>}
          </div>
          <button onClick={onClose} style={{background:T.card2,border:`1px solid ${T.line}`,borderRadius:"50%",width:32,height:32,cursor:"pointer",color:T.mut2,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
        </div>
        {step<4&&(
          <div style={{display:"flex",padding:"0 20px 18px"}}>
            {["Día","Hora","Datos"].map((l,i)=>(
              <div key={l} style={{flex:1,textAlign:"center"}}>
                <div style={{height:2,borderRadius:2,background:step>=i+1?T.blue:T.line,marginBottom:5}}/>
                <div style={{fontSize:10,color:step>=i+1?T.blue:T.muted,fontWeight:700}}>{l}</div>
              </div>
            ))}
          </div>
        )}
        {step===1&&(
          <div style={{padding:"0 20px"}}>
            <div style={{fontSize:13,color:T.muted,marginBottom:12,fontWeight:500}}>Selecciona un día</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8}}>
              {days.map((d,i)=>(
                <div key={i} onClick={()=>{setDay(d);setStep(2);}} style={{textAlign:"center",padding:"10px 4px",borderRadius:12,border:`1px solid ${T.line}`,cursor:"pointer",background:T.card2}}
                  onMouseEnter={e=>e.currentTarget.style.borderColor=T.blue}
                  onMouseLeave={e=>e.currentTarget.style.borderColor=T.line}>
                  <div style={{fontSize:9,color:T.muted,fontWeight:700}}>{DE[d.getDay()]}</div>
                  <div style={{fontSize:18,fontWeight:800,color:T.text,margin:"2px 0"}}>{d.getDate()}</div>
                  <div style={{fontSize:9,color:T.muted}}>{ME[d.getMonth()].slice(0,3)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {step===2&&(
          <div style={{padding:"0 20px"}}>
            <div style={{fontSize:13,color:T.muted,marginBottom:12}}>{DE[day.getDay()]} {day.getDate()} de {ME[day.getMonth()]}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {SLOTS.map(h=>(
                <div key={h} onClick={()=>{setSlot(h);setStep(3);}} style={{padding:"13px 0",textAlign:"center",borderRadius:12,border:`1px solid ${T.line}`,cursor:"pointer",fontSize:14,fontWeight:700,color:T.blue,background:T.card2}}
                  onMouseEnter={e=>{e.currentTarget.style.background=T.name==="dark"?"#1E3A5F":"#EFF6FF";e.currentTarget.style.borderColor=T.blue;}}
                  onMouseLeave={e=>{e.currentTarget.style.background=T.card2;e.currentTarget.style.borderColor=T.line;}}>
                  {h}
                </div>
              ))}
            </div>
            <button onClick={()=>setStep(1)} style={{marginTop:14,background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>鈫� D铆a</button>
          </div>
        )}
        {step===3&&(
          <div style={{padding:"0 20px"}}>
            <div style={{background:T.name==="dark"?"#1E3A5F":"#EFF6FF",borderRadius:12,padding:"12px 16px",marginBottom:18,border:`1px solid ${T.blue}44`,display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:20}}>馃搮</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.blue}}>{DE[day.getDay()]} {day.getDate()} de {ME[day.getMonth()]} 路 {slot}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:1}}>GestiFR</div>
              </div>
            </div>
            {[{k:"nombre",l:"Nombre completo *",p:"Tu nombre"},{k:"telefono",l:"Tel茅fono / WhatsApp *",p:"+34 / +33..."},{k:"nota",l:"Tr谩mite (opcional)",p:"France Travail, NIR..."}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <label style={{fontSize:12,fontWeight:600,color:T.mut2,display:"block",marginBottom:5}}>{f.l}</label>
                <input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.p}
                  style={{width:"100%",border:`1.5px solid ${T.line}`,borderRadius:10,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit",color:T.text,background:T.card2}}/>
              </div>
            ))}
            {err&&<div style={{color:"#F87171",fontSize:12,marginBottom:10}}>{err}</div>}
            <button onClick={confirm} style={{width:"100%",background:T.blue,color:"white",border:"none",borderRadius:12,padding:"14px 0",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Confirmar cita</button>
            <button onClick={()=>setStep(2)} style={{width:"100%",background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer",marginTop:10,fontFamily:"inherit"}}>鈫� Hora</button>
          </div>
        )}
        {step===4&&(
          <div style={{padding:"10px 20px 0",textAlign:"center"}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:T.name==="dark"?"#052E16":"#DCFCE7",border:`2px solid ${T.green}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,margin:"0 auto 16px",color:T.green}}>鉁�</div>
            <div style={{fontSize:17,fontWeight:800,color:T.text,marginBottom:8}}>隆Cita reservada!</div>
            <div style={{background:T.name==="dark"?"#1E3A5F":"#EFF6FF",borderRadius:12,padding:16,marginBottom:20,border:`1px solid ${T.line}`}}>
              <div style={{fontSize:14,fontWeight:700,color:T.blue}}>{DE[day.getDay()]} {day.getDate()} de {ME[day.getMonth()]} 路 {slot}</div>
              <div style={{fontSize:12,color:T.muted,marginTop:4}}>Te contactaremos para confirmar</div>
            </div>
            <button onClick={onClose} style={{width:"100%",background:T.blue,color:"white",border:"none",borderRadius:12,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Entendido</button>
          </div>
        )}
      </div>
    </div>
  );
}

// 鈹€鈹€鈹€ SERVICE DETAIL MODAL 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function ServiceDetail({ service, onClose, onChat, onCita, T }) {
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:150,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(6px)"}}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:T.card,borderRadius:"24px 24px 0 0",width:"100%",maxWidth:480,maxHeight:"80vh",overflowY:"auto",paddingBottom:32}}>
        <div style={{padding:"20px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{fontSize:28}}>{service.icon}</div>
            <div>
              <div style={{fontSize:16,fontWeight:700,color:T.text}}>{service.title}</div>
              <div style={{fontSize:12,color:T.muted}}>{service.sub}</div>
            </div>
          </div>
          <button onClick={onClose} style={{background:T.card2,border:`1px solid ${T.line}`,borderRadius:"50%",width:32,height:32,cursor:"pointer",color:T.mut2,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>鉁�</button>
        </div>
        <div style={{padding:"0 20px",display:"flex",flexDirection:"column",gap:12}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:T.card2,borderRadius:12,padding:"12px 16px",border:`1px solid ${T.line}`}}>
            <div>
              <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:2}}>PRECIO</div>
              <div style={{fontSize:22,fontWeight:900,color:service.soon?"#F59E0B":T.blue}}>{service.price}</div>
            </div>
            {service.time && (
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:T.muted,fontWeight:600,marginBottom:2}}>TIEMPO ESTIMADO</div>
                <div style={{fontSize:14,fontWeight:700,color:T.text}}>鈴� {service.time}</div>
              </div>
            )}
          </div>
          {service.docs && service.docs.length > 0 && (
            <div style={{background:T.card2,borderRadius:12,padding:"14px 16px",border:`1px solid ${T.line}`}}>
              <div style={{fontSize:12,fontWeight:700,color:T.text,marginBottom:10}}>馃搵 Documentos necesarios</div>
              {service.docs.map((doc,i) => (
                <div key={i} style={{display:"flex",alignItems:"center",gap:8,marginBottom:i<service.docs.length-1?8:0}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:T.blue,flexShrink:0}}/>
                  <div style={{fontSize:13,color:T.mut2}}>{doc}</div>
                </div>
              ))}
            </div>
          )}
          {service.soon ? (
            <div style={{background:"rgba(245,158,11,0.1)",borderRadius:12,padding:"14px 16px",border:"1px solid rgba(245,158,11,0.3)",textAlign:"center"}}>
              <div style={{fontSize:14,fontWeight:700,color:"#F59E0B",marginBottom:4}}>馃敎 Pr贸ximamente disponible</div>
              <div style={{fontSize:12,color:T.muted}}>Estamos coordinando este servicio con profesionales especializados.</div>
            </div>
          ) : (
            <div style={{display:"flex",gap:8}}>
              <button onClick={onChat} style={{flex:1,background:T.blue,color:"white",border:"none",borderRadius:12,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                馃挰 Consultar gratis
              </button>
              <button onClick={onCita} style={{flex:1,background:T.card2,color:T.text,border:`1px solid ${T.line}`,borderRadius:12,padding:"13px 0",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>
                馃搮 Agendar cita
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Dots({ T }) {
  return (
    <div style={{display:"flex",gap:4,padding:"10px 14px",alignItems:"center"}}>
      {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:T.muted,animation:`dot 1.2s ease-in-out ${i*0.2}s infinite`}}/>)}
      <style>{`@keyframes dot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}`}</style>
    </div>
  );
}

function Av({ size=38 }) {
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:ADVISOR.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.3,color:"white",fontWeight:800,flexShrink:0}}>
      {ADVISOR.avatar}
    </div>
  );
}

function ChatMsg({ msg, onCita, T }) {
  const isUser = msg.role === "user";
  const text = (msg.content||"").replace("[MOSTRAR_CITA]","").trim();
  const showCita = !isUser && msg.content?.includes("[MOSTRAR_CITA]");
  return (
    <div style={{display:"flex",justifyContent:isUser?"flex-end":"flex-start",marginBottom:14,gap:8}}>
      {!isUser && <Av/>}
      <div style={{maxWidth:"78%",display:"flex",flexDirection:"column",gap:4}}>
        {!isUser && <span style={{fontSize:11,color:T.muted,fontWeight:600,paddingLeft:2}}>{ADVISOR.name} 路 GestiFR</span>}
        {msg.image && <img src={msg.image} alt="carta" style={{maxWidth:"100%",borderRadius:12,marginBottom:4,border:`1px solid ${T.line}`}}/>}
        {text && <div style={{padding:"11px 15px",background:isUser?T.blue:T.card2,color:isUser?"white":T.text,borderRadius:isUser?"18px 18px 4px 18px":"4px 18px 18px 18px",fontSize:14,lineHeight:1.65,whiteSpace:"pre-wrap",border:isUser?"none":`1px solid ${T.line}`}}>{text}</div>}
        {showCita && (
          <button onClick={onCita} style={{alignSelf:"flex-start",marginTop:4,background:T.blue,color:"white",border:"none",borderRadius:20,padding:"8px 16px",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6}}>
            馃搮 Agendar cita
          </button>
        )}
      </div>
      {isUser && <div style={{width:34,height:34,borderRadius:"50%",background:T.card2,border:`1px solid ${T.line}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,marginTop:18,color:T.muted}}>馃懁</div>}
    </div>
  );
}

// 鈹€鈹€鈹€ LOGO 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
function Logo({ T }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <div style={{width:34,height:34,borderRadius:10,background:`linear-gradient(135deg,${T.blue},${T.cyan})`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:900,color:"white",fontSize:14,letterSpacing:-1}}>GF</div>
      <div>
        <div style={{fontSize:15,fontWeight:900,color:T.text,letterSpacing:-0.5}}>GestiFR</div>
        <div style={{fontSize:9,color:T.muted,letterSpacing:0.8,textTransform:"uppercase"}}>Tr谩mites en Francia 路 En espa帽ol</div>
      </div>
    </div>
  );
}

// 鈹€鈹€鈹€ APP 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
export default function App() {
  const [view, setView] = useState("home");
  const [msgs, setMsgs] = useState([{ role:"assistant", content:DEFAULT_INTRO }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const [showCal, setShowCal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [mounted, setMounted] = useState(false);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  const T = darkMode ? DARK : LIGHT;

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs, loading]);

  const toggleFav = (id) => setFavorites(f => f.includes(id) ? f.filter(x=>x!==id) : [...f, id]);

  const filteredServices = SERVICES.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.sub.toLowerCase().includes(search.toLowerCase())
  );

  const send = async (text) => {
    const t = (text||input).trim();
    if (!t||loading) return;
    setInput("");
    const next = [...msgs, { role:"user", content:t }];
    setMsgs(next); setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"llama-3.1-8b-instant",
          max_tokens:300,
          messages:[{role:"system",content:SYSTEM_PROMPT},...next.slice(-20).map(m=>({role:m.role,content:m.content.replace("[MOSTRAR_CITA]","").trim()})).filter(m=>m.content)],
        }),
      });
      const data = await res.json();
      setMsgs([...next, { role:"assistant", content:data.choices?.[0]?.message?.content||"Perdona, 驴puedes repetirlo?" }]);
    } catch { setMsgs([...next, { role:"assistant", content:"Ha habido un problema de conexi贸n." }]); }
    setLoading(false);
  };

  const sendImage = async (file) => {
    if (!file||loading||imgLoading) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const previewMsg = { role:"user", content:"馃搸 He subido una carta. Por favor anal铆zala y trad煤cela.", image:e.target.result };
      const next = [...msgs, previewMsg];
      setMsgs(next);
      setLoading(true);
      setImgLoading(true);
      try {
        const res = await fetch("/api/chat", {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body: JSON.stringify({
            model:"llama-3.1-8b-instant",
            max_tokens:600,
            messages:[
              {role:"system",content:SYSTEM_PROMPT},
              {role:"user",content:"El cliente ha subido una foto de carta oficial francesa. Analízala, tradúcela al español y explica qué le piden."}
            ],
          }),
        });
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content||"No pude leer la imagen. Escríbeme el texto de la carta.";
        setMsgs([...next, { role:"assistant", content:reply }]);
      } catch(err) {
        setMsgs([...next, { role:"assistant", content:"Ha habido un problema al analizar la imagen." }]);
      }
      setLoading(false);
      setImgLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const openChat = (s=null) => {
    setMsgs([{ role:"assistant", content:s?(INTROS[s.id]||DEFAULT_INTRO):DEFAULT_INTRO }]);
    setView("chat");
  };

  const onBooked = (d) => {
    setTimeout(()=>setMsgs(p=>[...p,{role:"assistant",content:`Perfecto, cita reservada para el ${d} 🗓️\n\nTe contactaremos para confirmarla.`}]),400);
    // Send WhatsApp notification to admin
    const msg = encodeURIComponent(`Nueva cita GestiFR 📅\nFecha: ${d}\n\nPor favor confirma la disponibilidad.`);
    window.open(`https://wa.me/33612186263?text=${msg}`, "_blank");
  };

  const share = () => {
    if (navigator.share) {
      navigator.share({ title:"GestiFR", text:"Trámites en Francia en español — gestión profesional", url:window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      alert("¡Enlace copiado!");
    }
  };

  const featured = SERVICES.filter(s => s.hot).slice(0,6);
  const NAV = [
    { id:"home",      label:"Inicio",    icon:"🏠" },
    { id:"gestiones", label:"Servicios", icon:"☰" },
    { id:"tarifas",   label:"Tarifas",   icon:"€" },
    { id:"legal",     label:"Legal",     icon:"⚖️" },
  ];

  const onlineNow = isOnline();

  return (
    <div style={{fontFamily:"'Inter','Segoe UI',sans-serif",minHeight:"100vh",background:T.bg,maxWidth:"100%",margin:"0 auto",display:"flex",flexDirection:"column",color:T.text,transition:"background 0.3s,color 0.3s"}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}html,body{width:100%;height:100%;overflow-x:hidden;}#root{width:100%;}::-webkit-scrollbar{display:none}input:focus,textarea:focus{border-color:${T.blue}!important;outline:none}::placeholder{color:${T.muted}}@keyframes pulse{0%,100%{box-shadow:0 4px 20px rgba(59,130,246,0.5)}50%{box-shadow:0 4px 30px rgba(59,130,246,0.8)}}@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {showCal && <Modal onClose={()=>setShowCal(false)} onBooked={d=>{setShowCal(false);onBooked(d);}} T={T}/>}
      {selectedService && (
        <ServiceDetail service={selectedService} onClose={()=>setSelectedService(null)}
          onChat={()=>{setSelectedService(null);openChat(selectedService);}}
          onCita={()=>{setSelectedService(null);setShowCal(true);}} T={T}/>
      )}

      {/* FLOATING CHAT BUTTON */}
      {view!=="chat" && (
        <div onClick={()=>openChat()} style={{position:"fixed",bottom:75,right:20,zIndex:50,background:T.blue,borderRadius:"50%",width:56,height:56,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,cursor:"pointer",animation:"pulse 2s ease-in-out infinite",boxShadow:`0 4px 20px ${T.blue}88`}}>
          💬
          <div style={{position:"absolute",top:-2,right:-2,width:14,height:14,borderRadius:"50%",background:onlineNow?T.green:"#94A3B8",border:`2px solid ${T.bg}`}}/>
        </div>
      )}

      {/* CHAT */}
      {view==="chat" && (
        <div style={{display:"flex",flexDirection:"column",height:"100vh",background:T.bg}}>
          <div style={{background:T.card,borderBottom:`1px solid ${T.line}`,padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
            <button onClick={()=>setView("home")} style={{background:"none",border:"none",fontSize:24,cursor:"pointer",color:T.text,lineHeight:1}}>‹</button>
            <div style={{position:"relative"}}>
              <Av size={40}/>
              <div style={{position:"absolute",bottom:0,right:0,width:10,height:10,borderRadius:"50%",background:onlineNow?T.green:"#94A3B8",border:`2px solid ${T.card}`}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:14,fontWeight:700,color:T.text}}>{ADVISOR.name}</div>
              <div style={{fontSize:11,color:onlineNow?T.green:"#94A3B8",fontWeight:600}}>
                {onlineNow?"En línea · Respuesta en -2h":"Fuera de horario · Resp. mañana"}
              </div>
            </div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setView("gestiones")} style={{background:T.blue,border:"none",borderRadius:20,padding:"6px 11px",fontSize:11,fontWeight:600,color:"white",cursor:"pointer",fontFamily:"inherit"}}>☰ Trámites</button>
              <button onClick={()=>setShowCal(true)} style={{background:T.blue,border:"none",borderRadius:20,padding:"6px 11px",fontSize:11,fontWeight:600,color:"white",cursor:"pointer",fontFamily:"inherit"}}>📅 Cita</button>
            </div>
          </div>

          {/* Schedule banner */}
          <div style={{background:T.name==="dark"?"rgba(59,130,246,0.08)":"#EFF6FF",padding:"8px 16px",display:"flex",alignItems:"center",gap:8,borderBottom:`1px solid ${T.line}`}}>
            <span style={{fontSize:14}}>🕐</span>
            <span style={{fontSize:11,color:T.mut2}}>Lunes–Sábado · 9h a 19h · Respuesta garantizada en menos de 2h</span>
          </div>

          <div style={{flex:1,overflowY:"auto",padding:"16px 14px 8px"}}>
            {msgs.map((m,i)=><ChatMsg key={i} msg={m} onCita={()=>setShowCal(true)} T={T}/>)}
            {loading && (
              <div style={{display:"flex",gap:8,marginBottom:12}}>
                <Av/>
                <div style={{display:"flex",flexDirection:"column",gap:3}}>
                  <span style={{fontSize:11,color:T.muted,fontWeight:600,paddingLeft:2}}>{ADVISOR.name} · GestiFR</span>
                  <div style={{background:T.card2,borderRadius:"4px 18px 18px 18px",border:`1px solid ${T.line}`}}><Dots T={T}/></div>
                </div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          <div style={{background:T.card,borderTop:`1px solid ${T.line}`}}>
            <div style={{display:"flex",gap:8,padding:"8px 14px 6px"}}>
              <textarea style={{flex:1,border:`1.5px solid ${T.line}`,borderRadius:22,padding:"10px 16px",fontSize:14,fontFamily:"inherit",resize:"none",background:T.card2,color:T.text}}
                rows={1} placeholder="Escribe tu consulta..."
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}/>
              <button onClick={()=>send()} disabled={!input.trim()||loading}
                style={{width:42,height:42,borderRadius:"50%",border:"none",background:input.trim()&&!loading?T.blue:T.card2,color:input.trim()&&!loading?"white":T.muted,fontSize:16,cursor:input.trim()&&!loading?"pointer":"default",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"all 0.2s"}}>
                ➤
              </button>
            </div>
            <div style={{padding:"0 14px 12px"}}>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{if(e.target.files[0])sendImage(e.target.files[0]);e.target.value="";}}/>
              <button onClick={()=>fileRef.current.click()} disabled={imgLoading||loading}
                style={{width:"100%",background:T.card2,border:`1.5px dashed ${T.line}`,borderRadius:12,padding:"10px 0",fontSize:12,fontWeight:600,color:imgLoading?T.muted:T.blue,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}
                onMouseEnter={e=>e.currentTarget.style.borderColor=T.blue}
                onMouseLeave={e=>e.currentTarget.style.borderColor=T.line}>
                {imgLoading?"⏳ Analizando carta...":"📷 Subir foto de carta para traducir"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NON-CHAT */}
      {view!=="chat" && (
        <>
          {/* TOP BAR */}
          <div style={{background:T.card,padding:"12px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.line}`}}>
            <Logo T={T}/>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <button onClick={share} style={{background:T.card2,border:`1px solid ${T.line}`,borderRadius:20,padding:"7px 12px",fontSize:11,fontWeight:600,color:T.mut2,cursor:"pointer",fontFamily:"inherit"}}>
                🔗 Compartir
              </button>
              <button onClick={()=>setDarkMode(!darkMode)} style={{background:T.card2,border:`1px solid ${T.line}`,borderRadius:20,padding:"7px 12px",fontSize:14,cursor:"pointer",fontFamily:"inherit"}}>
                {darkMode?"☀️":"🌙"}
              </button>
            </div>
          </div>

          {/* BOTTOM NAV */}
          <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:T.card,borderTop:`1px solid ${T.line}`,display:"flex",zIndex:10}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>setView(n.id)}
                style={{flex:1,padding:"10px 4px 12px",border:"none",background:"none",display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",fontFamily:"inherit"}}>
                <span style={{fontSize:18}}>{n.icon}</span>
                <span style={{fontSize:9,fontWeight:view===n.id?800:500,color:view===n.id?T.blue:T.muted,letterSpacing:0.5,textTransform:"uppercase"}}>{n.label}</span>
                {view===n.id && <div style={{width:20,height:2,background:T.blue,borderRadius:2}}/>}
              </button>
            ))}
          </div>

          {/* HOME */}
          {view==="home" && (
            <div style={{flex:1,overflowY:"auto",paddingBottom:80}}>
              <div style={{padding:"24px 20px 28px",opacity:mounted?1:0,animation:mounted?"fadeUp 0.5s ease forwards":"none"}}>

                {/* Stats */}
                <div style={{display:"flex",alignItems:"center",marginBottom:22,paddingBottom:18,borderBottom:`1px solid ${T.line}`}}>
                  {[{v:"+2.400",l:"TRÁMITES"},{v:"98%",l:"SATISFACCIÓN"},{v:"48h",l:"RESP."}].map((s,i)=>(
                    <div key={s.l} style={{flex:1,display:"flex",alignItems:"baseline",gap:4,paddingLeft:i>0?16:0,borderLeft:i>0?`1px solid ${T.line}`:"none",marginLeft:i>0?16:0}}>
                      <span style={{fontSize:18,fontWeight:900,color:T.blue}}>{s.v}</span>
                      <span style={{fontSize:9,fontWeight:700,color:T.muted,letterSpacing:0.8}}>{s.l}</span>
                    </div>
                  ))}
                </div>

                {/* Headline */}
                <div style={{fontSize:28,fontWeight:900,color:T.text,lineHeight:1.15,marginBottom:10,letterSpacing:-1,animation:"fadeUp 0.6s ease 0.1s both"}}>
                  La burocracia francesa,<br/>
                  <span style={{color:T.cyan,fontStyle:"italic"}}>en tu idioma</span>
                </div>
                <div style={{fontSize:14,color:T.mut2,marginBottom:20,lineHeight:1.6,animation:"fadeUp 0.6s ease 0.2s both"}}>
                  Gestiones en Francia para toda la comunidad hispanohablante.
                </div>

                {/* Schedule */}
                <div style={{background:T.name==="dark"?"rgba(34,197,94,0.08)":"#F0FDF4",borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:16,border:`1px solid ${onlineNow?"rgba(34,197,94,0.2)":T.line}`}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:onlineNow?T.green:"#94A3B8",flexShrink:0}}/>
                  <div style={{fontSize:12,color:T.mut2}}>
                    {onlineNow
                      ? <><strong style={{color:T.green}}>En línea ahora</strong> · Respondemos en menos de 2h</>
                      : <><strong style={{color:T.muted}}>Fuera de horario</strong> · Lunes–Sábado 9h–19h</>
                    }
                  </div>
                </div>

                {/* Buttons */}
                <div style={{display:"flex",gap:8,marginBottom:16,animation:"fadeUp 0.6s ease 0.3s both"}}>
                  <div onClick={()=>openChat()} style={{flex:2,background:T.blue,borderRadius:12,padding:"13px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:8,cursor:"pointer",boxShadow:`0 4px 16px ${T.blue}44`}}>
                    <span style={{fontSize:18}}>💬</span>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"white"}}>Chat gratuito</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.75)"}}>Respuesta inmediata</div>
                    </div>
                  </div>
                  <a href="https://wa.me/33612186263" style={{flex:1,textDecoration:"none",background:"#16A34A",borderRadius:12,padding:"13px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer"}}>
                    <span style={{fontSize:18}}>📱</span>
                    <div style={{fontSize:13,fontWeight:700,color:"white"}}>WhatsApp</div>
                  </a>
                  <div onClick={()=>setShowCal(true)} style={{flex:1,background:T.card2,borderRadius:12,padding:"13px 0",display:"flex",alignItems:"center",justifyContent:"center",gap:6,cursor:"pointer",border:`1px solid ${T.line}`}}>
                    <span style={{fontSize:18}}>📅</span>
                    <div style={{fontSize:13,fontWeight:700,color:T.text}}>Cita</div>
                  </div>
                </div>

                {/* Team */}
                <div onClick={()=>openChat()} style={{background:T.card,borderRadius:14,padding:"14px 16px",display:"flex",alignItems:"center",gap:12,border:`1px solid ${T.line}`,cursor:"pointer",marginBottom:16,animation:"fadeUp 0.6s ease 0.4s both"}}>
                  <div style={{display:"flex"}}>
                    {ADVISORS.map((a,i)=>(
                      <div key={a.name} style={{width:38,height:38,borderRadius:"50%",background:a.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:"white",fontWeight:800,marginLeft:i>0?-12:0,border:`2px solid ${T.card}`}}>{a.avatar}</div>
                    ))}
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13,fontWeight:700,color:T.text}}>Nuestro equipo</div>
