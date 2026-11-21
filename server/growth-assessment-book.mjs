import { bookIllustration, illustrationHeight } from './book-illustrations.mjs';
import PDFDocument from 'pdfkit';
import { firstMove } from '../site/acquisition-assessment.mjs';

import { chapters as englishChapters, copy as englishCopy } from './growth-assessment-en.mjs';
import { spanishChapters, copy as spanishCopy, firstMoves as spanishMoves } from './growth-assessment-es.mjs';
import { spanishGuideTitle } from '../site/growth-guides.mjs';

const W = 432, H = 648, left = 43, width = W - 2 * left;
const ink = '#241F28', plum = '#4D3A63', muted = '#625B64', rule = '#B8ACBB';

export async function growthAssessmentBook(guide, qualification, language = 'en') {
  const spanish = language === 'es';
  const chapters = spanish ? spanishChapters : englishChapters;
  const copy = spanish ? spanishCopy : englishCopy;
  const title = spanish ? spanishGuideTitle : guide.title;
  const doc = new PDFDocument({size:[W,H], margin:0, autoFirstPage:false, bufferPages:true, lang:spanish ? 'es' : 'en',
    info:{Title:title, Author:'Lautaro Gärtner', Subject:copy.subject}});
  const chunks = [];
  const pdf = new Promise((resolve,reject)=>{
    doc.on('data',chunk=>chunks.push(chunk)); doc.on('end',()=>resolve(Buffer.concat(chunks))); doc.on('error',reject);
  });
  let number = 0;
  function text(value,x,y,w,font,size,color=ink,options={}) {
    doc.font(font).fontSize(size).fillColor(color).text(value,x,y,{width:w,lineGap:2.5,...options});
    return doc.y;
  }
  function small(value,x,y,w,options={}) {
    return text(value,x,y,w,'Helvetica',8,muted,{characterSpacing:1,...options});
  }
  function line(x,y,x2,y2,color=rule) {
    doc.save().strokeColor(color).lineWidth(0.6).moveTo(x,y).lineTo(x2,y2).stroke().restore();
  }
  function leaf() {
    doc.addPage(); number++;
    if(number===1) return;

    text(String(number),left,H-28,width,'Times-Roman',10,muted,{align:'center'});
  }
  function body(value,y) {return text(value,left,y,width,'Times-Roman',12.5,ink,{lineGap:2.8})+10;}
  function heading(kicker,title) {
    if (kicker) small(kicker,left,66,width);
    return text(title,left,87,width,'Times-Bold',30,ink,{lineGap:0})+20;
  }
  const contents = [];
  function destination(id,title,style='entry') {
    contents.push({id,title,page:number,style});
    doc.addNamedDestination(id,'Fit');
    doc.outline.addItem(title);
  }
  leaf();
  doc.rect(0,0,W,H).fill('#F5F0E8');
  small('LAUTARO GÄRTNER',left,51,width,{characterSpacing:2});
  line(left,91,W-left,91,plum);
  const titleBottom = text(title,left-2,122,width+4,'Times-Bold',43,ink,{lineGap:-1});
  text(copy.subtitle,left,titleBottom+26,width,'Times-Italic',19,plum);
  line(left,524,W-left,524,plum);
  text(copy.coverDescription,left,544,width,'Times-Roman',15);
  small(copy.coverDraft,left,575,width);

  leaf();
  const contentsIndex = number - 1;
  doc.addNamedDestination('contents','Fit');
  doc.outline.addItem(copy.contents);
  leaf(copy.first); destination('intro',copy.first);
  let y=heading(copy.introduction,copy.first);
  y=body(copy.firstIntro,y);
  y=body(copy.arc,y);
  y=body(copy.letter,y);
  text('Lautaro Gärtner',left,y,width,'Times-Italic',14,plum);

  leaf(copy.follow); destination('start',copy.follow);
  y=heading(copy.startHere,copy.follow);
  y=body(copy.quoteQuestion,y);
  for (const [index, [signal, move]] of [
    [copy.interest, copy.interestMove], [copy.calls, copy.callsMove], [copy.sales, copy.salesMove]
  ].entries()) {
    y=text(signal,left,y,width,'Times-Bold',14,plum,{goTo:'chapter-'+(index+1),underline:true})+4;
    y=body(move,y);
  }
  const start = qualification && (spanish ? spanishMoves[qualification.challenge] : firstMove(qualification)?.[1]);
  if(start) {
    y=text(copy.personalized,left,y+4,width,'Times-Bold',15)+5;
    y=body(start,y);
  }
  body(copy.firstClose,y);

  const parts = new Map([[0,copy.partOffer],[4,copy.partFunnel],[6,copy.partSales]]);
  let part = '', chapterNumber = 0;
  const measure = (value,font,size,lineGap) => doc.font(font).fontSize(size)
    .heightOfString(value,{width,lineGap});
  function fit(height) {
    if (y + height > H - 51) { leaf(); y=45; }
  }
  function paragraph(value, italic=false) {
    if (!value) return;
    const font = italic ? 'Times-Italic' : 'Times-Roman';
    fit(measure(value,font,12.5,2.8));
    y=text(value,left,y,width,font,12.5,italic ? plum : ink,{lineGap:2.8})+9;
  }
  function section(block, topicId, topicTitle = block.title) {
    const ad = block.ad;
    const adLines = ad ? [[ad.hook,'Times-Bold',15],[ad.benefit,'Times-Roman',12.5],[ad.cta,'Times-Bold',12.5]] : [];
    const adWidth = width-28;
    const adHeight = adLines.reduce((height,[words,font,size]) => height + doc.font(font).fontSize(size).heightOfString(words,{width:adWidth,lineGap:2.5}) + 6,18);
    const openingHeight = ad ? adHeight : measure(block.paragraphs[0],'Times-Roman',12.5,2.8);
    const art = block.plate ? illustrationHeight(block.plate) : 0;
    if (block.title) {
      const titleHeight = measure(block.title,'Times-Bold',19,1);
      fit(10+titleHeight+7+art+openingHeight);
    }
    if (topicId) {
      doc.addNamedDestination(topicId,'XYZ',null,y,null);
      contents.push({id:topicId,title:topicTitle,page:number,style:'topic'});
    }
    if (block.title) y=text(block.title,left,y+10,width,'Times-Bold',19,ink,{lineGap:1})+7;
    if (art) {
      fit(art);
      y=bookIllustration(doc,block.plate,left,y,width,spanish);
    }
    if (ad) {
      const top = y;
      doc.rect(left,top,width,adHeight).fill('#F5F1F7');
      y+=12;
      for (const [words,font,size] of adLines) y=text(words,left+14,y,adWidth,font,size,ink)+6;
      y=top+adHeight+12;
    }
    for(const value of block.paragraphs) paragraph(value);
    if (block.illustration) {
      fit(illustrationHeight(block.illustration));
      y=bookIllustration(doc,block.illustration,left,y,width,spanish);
    }
    if (block.figure) {
      fit(65);
      const xs=[left+8,left+width/2,W-left-8];
      line(xs[0],y+19,xs[2],y+19,ink);
      for(const x of xs) doc.circle(x,y+19,2.5).fill(ink);
      text(copy.workTime,left+10,y,width/2-14,'Times-Italic',10,muted,{align:'center'});
      text(copy.reviewTime,xs[1],y,width/2-14,'Times-Italic',10,muted,{align:'center'});
      [copy.scope,copy.delivery,copy.ready].forEach((label,i)=>text(label,left+i*width/3,y+27,width/3,'Times-Roman',10,ink,{align:['left','center','right'][i]}));
      y=text(copy.timelineCaption,left,y+44,width,'Times-Italic',10,muted)+8;
    }
    paragraph(block.closing,true);
  }
  for (const [i,topic] of chapters.entries()) {
    if (parts.has(i)) {
      chapterNumber++;
      part=parts.get(i);
      leaf();
      const id='chapter-'+chapterNumber;
      destination(id,copy.chapter+chapterNumber+' · '+part,'chapter');
      y=heading(copy.chapter+chapterNumber+' · '+part.toUpperCase(),topic.title);
    }
    section(parts.has(i) ? {...topic,title:null} : topic,'topic-'+(i+1),topic.title);
    for (const exercise of topic.practice) section(exercise,exercise.ad ? 'catering-example' : undefined);
  }

  leaf(copy.afterword); destination('close',copy.afterword);
  y=heading('',copy.afterword);
  y=body(copy.reflect,y);
  y=body(copy.next,y);
  y=body(copy.check,y);
  body(copy.signoff,y);
  text('Lautaro Gärtner',left,doc.y+5,width,'Times-Italic',14,plum);

  leaf(copy.draft); destination('draft',copy.draft);
  y=heading('',copy.draft);
  y=body(copy.draftIntro,y);
  const prompts=[copy.resultPrompt,copy.buttonPrompt,copy.proofPrompt,copy.datePrompt,copy.callPrompt,copy.pricePrompt,copy.testPrompt];
  doc.font('Helvetica').initForm();
  for(const prompt of prompts){
    text(prompt,left,y,width,'Times-Bold',11.7);
    doc.font('Helvetica').fontSize(10).formText(prompt,left,y+17,width,30,{multiline:true,backgroundColor:'#F6F3F8',borderColor:'#C9BFCE'});
    y+=53;
  }
  text(copy.help,left,y+4,width,'Times-Italic',12);
  text('lautaro@lautarogartner.com',left,y+42,width,'Times-Bold',12,plum,{link:'mailto:lautaro@lautarogartner.com',underline:true});
  // Fill in the reserved contents page after both text flow and folios are final.
  doc.switchToPage(contentsIndex);
  y=text(copy.contents,left,54,width,'Times-Bold',30)+20;
  for (const {id,title,page,style} of contents) {
    const chapter = style==='chapter';
    const inset = style==='topic' ? 12 : 0;
    if (chapter || id==='close') { y+=5; line(left,y,W-left,y); y+=8; }
    const font = chapter ? 'Times-Bold' : 'Times-Roman';
    const bottom = text(title,left+inset,y,width-inset-28,font,chapter ? 13.5 : 12.5,ink,{goTo:id,lineGap:1});
    text(String(page),W-left-23,y,23,font,12.5,plum,{align:'right',goTo:id});
    y=bottom+4;
  }
  doc.end();return pdf;
}
