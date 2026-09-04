import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import multer from 'multer';
import helmet from 'helmet';
import { z } from 'zod';
import { analyzeSituation } from './analysis.js';
import { detectPII } from './pii.js';
import { loadMetadata } from './manualStore.js';
import { reindexManual } from './reindex.js';

const app=express();
const PORT=Number(process.env.PORT || 8787);
const uploadDir=path.resolve(process.cwd(),'data','uploads');
fs.mkdirSync(uploadDir,{recursive:true});
const upload=multer({dest:uploadDir, limits:{fileSize:25*1024*1024}});

app.disable('x-powered-by');
app.use(helmet({contentSecurityPolicy:false}));
app.use(express.json({limit:'64kb'}));
app.use('/api',(_req,res,next)=>{res.setHeader('Cache-Control','no-store'); next();});

app.get('/api/health',(_req,res)=>res.json({ok:true,manual:loadMetadata()}));

app.post('/api/analyze',async(req,res)=>{
  const parsed=z.object({text:z.string().trim().min(8).max(3000)}).safeParse(req.body);
  if(!parsed.success) return res.status(400).json({error:'Describa la situación con al menos 8 caracteres.'});
  const findings=detectPII(parsed.data.text);
  if(findings.length) return res.status(400).json({
    code:'PII_DETECTED',
    error:'Por protección de datos de niños, niñas y adolescentes, elimine los nombres y demás información personal antes de continuar',
    findings
  });
  try {
    const result=await analyzeSituation(parsed.data.text);
    res.json(result);
  } catch {
    res.status(500).json({error:'No fue posible analizar la situación. Intente nuevamente o remita el caso a coordinación.'});
  }
});

app.post('/api/admin/manual', upload.single('manual'), async(req,res)=>{
  const expected=process.env.ADMIN_TOKEN;
  if(!expected || req.header('x-admin-token')!==expected) {
    if(req.file) fs.unlink(req.file.path,()=>{});
    return res.status(401).json({error:'No autorizado'});
  }
  if(!req.file || req.file.mimetype!=='application/pdf') return res.status(400).json({error:'Cargue un archivo PDF.'});
  try {
    const out=await reindexManual(req.file.path);
    fs.unlink(req.file.path,()=>{});
    res.json({ok:true,...out,message:'Manual reemplazado e indexado. La matriz estructurada debe revisarse nuevamente antes de habilitar clasificaciones automáticas estrictas.'});
  } catch {
    if(req.file) fs.unlink(req.file.path,()=>{});
    res.status(500).json({error:'No fue posible indexar el PDF.'});
  }
});

const dist=path.resolve(process.cwd(),'dist');
if(fs.existsSync(dist)){
  app.use(express.static(dist,{maxAge:'1h'}));
  app.get('*',(_req,res)=>res.sendFile(path.join(dist,'index.html')));
}

app.listen(PORT,()=>console.log(`Ruta de Convivencia ENSME disponible en http://localhost:${PORT}`));
