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
            <button onClick={()=>setStep(1)} style={{marginTop:14,background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>← Día</button>
          </div>
        )}
        {step===3&&(
          <div style={{padding:"0 20px"}}>
            <div style={{background:T.name==="dark"?"#1E3A5F":"#EFF6FF",borderRadius:12,padding:"12px 16px",marginBottom:18,border:`1px solid ${T.blue}44`,display:"flex",gap:10,alignItems:"center"}}>
              <span style={{fontSize:20}}>📅</span>
              <div>
                <div style={{fontSize:13,fontWeight:700,color:T.blue}}>{DE[day.getDay()]} {day.getDate()} de {ME[day.getMonth()]} · {slot}</div>
                <div style={{fontSize:11,color:T.muted,marginTop:1}}>GestiFR</div>
              </div>
            </div>
            {[{k:"nombre",l:"Nombre completo *",p:"Tu nombre"},{k:"telefono",l:"Teléfono / WhatsApp *",p:"+34 / +33..."},{k:"nota",l:"Trámite (opcional)",p:"France Travail, NIR..."}].map(f=>(
              <div key={f.k} style={{marginBottom:12}}>
                <label style={{fontSize:12,
