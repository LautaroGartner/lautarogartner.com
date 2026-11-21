const plum = '#4D3A63', ink = '#29252C', wash = '#E8E2F1';
const green = '#CDE4D9', border = '#887E8E';

export function illustrationHeight(kind) {
  if (kind === 'negotiation') return 151;
  if (kind === 'cash-gap') return 177;
  return 104;
}

// Keep the labels selectable and translated independently of the ink artwork.
export function bookIllustration(doc, kind, x, y, width, spanish) {
  const label = (en, es) => spanish ? es : en;
  const height = illustrationHeight(kind) - 12;
  doc.save().translate(x, y);
  doc.lineWidth(.55).strokeColor(border).moveTo(0,2).lineTo(width,2).stroke();
  function type(value, left, top, w, size, bold = false, align = 'left') {
    doc.font(bold ? 'Times-Bold' : 'Times-Roman').fontSize(size).fillColor(ink)
      .text(value, left, top, {width:w, align, lineBreak:false});
  }
  if (kind === 'negotiation') {
    const cards = spanish
      ? [['Este viernes','$12.000','$6.000','$1.200','$4.800'],['Viernes siguiente','$11.000','$6.000','$0','$5.000']]
      : [['This Friday','$12,000','$6,000','$1,200','$4,800'],['Next Friday','$11,000','$6,000','$0','$5,000']];
    const cardWidth = (width-14)/2;
    cards.forEach(([date,price,cost,rush,kept],i)=>{
      const bx=i*(cardWidth+14);
      doc.rect(bx,8,cardWidth,117).fillAndStroke('#FBFAF7',border);
      type(date,bx+8,15,cardWidth-16,12,true);
      type(label('Two reviews included','Incluye dos revisiones'),bx+8,32,cardWidth-16,9);
      for (const [j,[key,val]] of [[label('Price','Precio'),price],[label('Work costs','Costo del trabajo'),cost],[label('Rush costs','Costo de urgencia'),rush],[label('You keep*','Te queda*'),kept]].entries()) {
        const top=50+j*18;
        if (j===3) doc.rect(bx+1,top-3,cardWidth-2,21).fill(i===1?green:wash);
        type(key,bx+8,top,cardWidth-68,10,j===3);
        type(val,bx+cardWidth-61,top,53,10,j===3,'right');
      }
    });
    type(label('*Before overhead and tax.','*Antes de gastos fijos e impuestos.'),1,132,width,9);
  } else if (kind === 'cash-gap') {
    const xs=[66,106,201,width-22], zero=72;
    const yy=n=>zero-n/250;
    const pts=(vals,color,dash)=>{
      doc.save().lineWidth(2).strokeColor(color);
      if (dash) doc.dash(4,{space:3});
      doc.moveTo(xs[0],yy(0));
      vals.forEach((n,i)=>doc.lineTo(xs[i+1],yy(i?vals[i-1]:0)).lineTo(xs[i+1],yy(n)));
      doc.stroke().restore();
    };
    const legend=(bx,name,color,dash)=>{
      doc.save().lineWidth(2).strokeColor(color);
      if (dash) doc.dash(4,{space:3});
      doc.moveTo(bx,14).lineTo(bx+17,14).stroke().restore();
      type(name,bx+21,8,width/2-21,10,true);
    };
    legend(1,label('Paid at the end','Todo al final'),plum,false);
    legend(width/2,label('Paid in stages','Por etapas'),'#26695A',true);
    for(const [n,en,es] of [[8000,'+$8,000','+$8.000'],[0,'$0','$0'],[-5000,'-$5,000','-$5.000'],[-12000,'-$12,000','-$12.000']]) {
      const row=yy(n);
      type(label(en,es),0,row-5,56,9,false,'right');
      doc.strokeColor('#D1C9D3').lineWidth(.5).moveTo(xs[0],row).lineTo(width-14,row).stroke();
    }
    pts([-5000,-12000,8000],plum,false);
    pts([0,0,8000],'#26695A',true);
    [label('Start','Inicio'),label('First delivery','Primera entrega'),label('Finish','Cierre')].forEach((t,i)=>type(t,xs[i+1]-38,126,76,9,false,'center'));
    doc.font('Times-Italic').fontSize(10.5).fillColor(plum).text(label('Cash left from this order. Collect $5,000 before starting, $7,000 at the first delivery and $8,000 at the end to stay above water.','Saldo del pedido. Si cobras $5.000 antes de empezar, $7.000 en la primera entrega y $8.000 al final, puedes cubrir cada gasto a tiempo.'),0,143,{width,lineGap:1});
  } else if (kind === 'gift') {
    const receipt = (left, top, fill) => {
      doc.moveTo(left,top).lineTo(left+23,top).lineTo(left+30,top+7).lineTo(left+30,top+37)
        .lineTo(left,top+37).closePath().fillAndStroke(fill,border);
      doc.moveTo(left+23,top+1).lineTo(left+23,top+7).lineTo(left+29,top+7)
        .moveTo(left+5,top+16).lineTo(left+24,top+16).moveTo(left+5,top+22).lineTo(left+20,top+22).stroke();
    };
    receipt(16,22,wash); receipt(20,18,'#fff');
    receipt(width/2+8,22,green); receipt(width/2+12,18,'#fff');
    type(label('Downloads','Descargas'),60,19,106,10,true);
    type(label('Before   40','Antes   40'),60,39,109,10);
    type(label('After      14','Ahora   14'),60,56,109,10);
    type(label('Paid assessments','Diagnósticos de pago'),width/2+51,19,120,10,true);
    type(label('Before   0','Antes   0'),width/2+51,39,110,10);
    type(label('After      2','Ahora   2'),width/2+51,56,110,10);
  } else if (kind === 'handover') {
    const start = 112, half = (width-start-18)/2;
    type(label('First change','Primer cambio'),start,12,half,9,true,'center');
    type(label('Second change','Segundo cambio'),start+half,12,half,9,true,'center');
    for (const [row,name] of [label('Part A','Parte A'),label('Part B','Parte B')].entries()) {
      const top = 29 + row*24;
      type(name,18,top+5,75,10,true);
      for (let col=0; col<2; col++) {
        const changing = col===row, bx=start+col*half;
        doc.rect(bx,top,half-2,18).fillAndStroke(changing ? wash : green,border);
        type(changing ? label('Changeover','En transición') : label('Available','Disponible'),bx,top+4,half-2,9,false,'center');
      }
    }
  }
  doc.restore();
  return y + height + 12;
}
