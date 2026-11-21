import { adGuide, homeGuide } from '../site/growth-guides.mjs';
import { growthAssessmentBook } from './growth-assessment-book.mjs';
import PDFDocument from 'pdfkit';
import { planningCall } from '../site/planning-call.mjs';

const W = 740, H = 564, M = 38;
const paper = '#FBFAFF', ink = '#342953', teal = '#594791', light = '#E6E1FF';
const gold = '#CBEFFF', rust = '#32698B', muted = '#544E63', rule = '#C9C2DB';


export async function salesFieldbook({ guide = adGuide, qualification, language = 'en' } = {}) {
  if (guide !== homeGuide) return growthAssessmentBook(guide, qualification, language);
  const doc = new PDFDocument({size:[W,H],margin:0,autoFirstPage:false,info:{Title:guide.title,Subject:'Choose your next profitable sales test'}});
  doc.registerFont('Body','Helvetica');
  const chunks = [];
  const result = new Promise((resolve,reject)=>{
    doc.on('data',chunk=>chunks.push(chunk)); doc.on('end',()=>resolve(Buffer.concat(chunks))); doc.on('error',reject);
  });
  function rect(x,y,w,h,c){doc.rect(x,y,w,h).fill(c);}
  function line(x,y,x2,y2,c=rule){doc.strokeColor(c).lineWidth(.7).moveTo(x,y).lineTo(x2,y2).stroke();}
  function t(str,x,y,w,size=12,face='Body',color=ink,options={}) {
    doc.font(face).fontSize(size).fillColor(color).text(str,x,y,{width:w,lineGap:2,...options});
    return doc.y;
  }
  function tag(str,x,y,w,color=teal){return t(str,x,y,w,8,'Helvetica-Bold',color,{characterSpacing:1});}
  function page(n,section,head,intro) {
    doc.addPage();rect(0,0,W,H,paper);
    tag('GROW YOUR SALES',M,23,179);tag(section.toUpperCase(),220,23,310,muted);
    t(String(n).padStart(2,'0'),W-M-35,19,35,13,'Helvetica-Bold',teal,{align:'right'});
    line(M,43,W-M,43);t(head,M,60,W-2*M,31,'Helvetica-Bold');
    t(intro,M,105,W-2*M,12.5,'Body',muted);
  }
  function takeaway(label,body) {
    rect(0,466,W,H-466,ink);tag(label.toUpperCase(),M,482,W-2*M,gold);
    t(body,M,502,W-2*M,13,'Body','#FFFFFF');
  }
  function block(x,y,w,label,body) {
    const end=t(label,x,y,w,15,'Helvetica-Bold');
    return t(body,x,end+7,w,11.5)+13;
  }
  function colText(x,y,w,items) {
    for(const [label,body] of items)y=block(x,y,w,label,body);
    return y;
  }
  doc.addPage();rect(0,0,W,H,ink);
  tag('FOR BUSINESS OWNERS',M,35,270,'#DED9FF');
  t('Grow Your Sales,\nKeep More of What\nYou Make',M,68,390,39,'Helvetica-Bold','#FFFFFF',{lineGap:-1});
  t('A seven-day guide for your next sale.',M,235,394,20,'Times-Italic',gold);
  t('Get a buyer talking, price an offer worth delivering and collect the cash when you need it. Start with one opportunity, whatever size your business is today.',M,307,358,14,'Body','#E9E5FA');
  // Three offset sheets reference the opportunities, invoices and schedule used in the review.
  doc.save().rect(417,59,323,405).clip();
  for(let i=0;i<10;i++){
    const x=428+i*10, y=294-i*16;
    doc.polygon([x,y],[x+169,y-82],[x+281,y-22],[x+111,y+62]).fill(i===9?gold:i%2?'#AEABFA':'#7F74BD');
    doc.polygon([x,y],[x+111,y+62],[x+111,y+70],[x,y+8]).fill('#51437B');
    doc.polygon([x+111,y+62],[x+281,y-22],[x+281,y-14],[x+111,y+70]).fill('#C7C2FA');
  }
  doc.restore();
  rect(0,461,W,103,'#E6E1FF');
  tag('YOUR FIRST SEVEN DAYS',M,482,300);t('Start with a buyer who can decide this week.',M,501,660,20,'Helvetica-Bold');
  homeChapters();
  doc.end();
  return result;

  function discountExample() {
    page(3,'Pricing','What does 10% off actually cost you?','Take a $100 sale that costs $70 to win and deliver. If you do the same work for $90, every dollar of the discount comes out of the $30 the sale would have contributed.');
    const rows=[
      ['Original offer',100,70,30],
      ['Same work, 10% off',90,70,20],
      ['Smaller scope',90,60,30]
    ];
    tag('PER SALE',M,167,210);tag('DIRECT COST',302,167,130);tag('LEFT BEFORE OVERHEAD',455,167,210);
    rows.forEach(([label,price,cost,left],i)=>{
      const y=194+64*i;
      line(M,y,702,y);
      t(label,M,y+9,210,15,'Helvetica-Bold');
      t('$'+price+' price',M,y+29,210,11,'Body',muted);
      t('$'+cost,302,y+11,95,16);
      rect(455,y+12,left*4,11,i===1?rust:teal);
      t('$'+left,592,y+8,72,16,'Helvetica-Bold');
    });
    paragraphAt('The trade to offer','“I can meet $90 if you handle pickup. If you want delivery included, I can do that for $100.” Use this trade only if pickup really saves you the $10.',396);
    takeaway('Before you agree','At $20 left per sale, you need three discounted sales to earn the same $60 as two full-price sales. Check whether those extra orders are likely and whether you can deliver them.');
  }

  function homeChapters() {
    page(2,'Your first week','Choose one sale you can influence.','Bring a live quote, a repeat order or an inquiry from someone deciding this week. If you’re working toward your first sale, use the offer you can put in front of one buyer today.');
    const week=[
      ['Today','Write down the usual deal','Price it, list the costs that rise when you sell one more, and note when you receive payment. Estimate your own hours separately.'],
      ['Within 48 hours','Give one buyer a choice','Quote your usual scope, then a smaller option that saves you real work. For example, offer $100 delivered or $90 collected if pickup cuts your cost by $10.'],
      ['Days 3–6','Ask for the decision','“Would either option work for you? What would you still need before choosing?” Record their actual words and the next date they can decide.'],
      ['Day 7','See what you kept','Write down the price agreed, cash received, direct costs still to pay and hours committed. For an open quote, record the next decision. Count cash when it clears.']
    ];
    week.forEach(([when,label,body],i)=>{
      const y=159+i*72;line(M,y,702,y);t(when,M,y+11,126,14,'Helvetica-Bold',teal);
      t(label,172,y+10,168,13,'Helvetica-Bold');t(body,350,y+8,350,11.2);
    });
    takeaway('Pick your page','If you’re being asked for a discount, turn to page 3. For more buyers or repeat orders, start on page 4. If a good order leaves you short of cash, use page 5.');
    discountExample();
    page(4,'Find your next sale','Give a buyer a reason to reply.','Start with the decision your buyer is already making. Pick the situation below that fits today. Use one message with a few relevant people so you can learn from each reply.');
    const situations=[
      ['Find a new buyer','Pick someone comparing options. Offer to price the two choices that matter to them.','“If you send the size and date, I can tell you what pickup and delivery would each cost.”'],
      ['Win a repeat order','Contact a buyer when they are likely to need the result again. Use the date or usage they gave you.','“You said the last order would last until Friday. Do you need the same amount this time?”'],
      ['Earn a bigger sale','Ask which part of the job the buyer still has to do. Price that part separately so they can choose.','“Would you like it supplied as usual, or installed and ready on Tuesday? I can quote both.”']
    ];
    situations.forEach(([label,action,words],i)=>{
      const y=162+i*95;line(M,y,702,y);t(label,M,y+12,160,15,'Helvetica-Bold',teal);
      t(action,206,y+10,212,12);t(words,445,y+10,249,12,'Times-Italic');
    });
    takeaway('Count the whole sequence','Record how many people you contacted, replied, ordered and paid. Five replies and zero orders is a reason to inspect the offer before paying to reach fifty more people.');
    page(5,'Cash timing','Who pays before the work is done?','A $100 order costs $70 to deliver. Of that, $40 is due before handoff. Look at the bank balance on that date and at what the order leaves once everything is paid.');
    const terms=[['$20 up front','You advance $20','$30'],['$40 up front','Early bills covered','$30'],['$96 paid in full','$56 after early bills','$26']];
    tag('TERMS ON THE QUOTE',M,174,205);tag('AFTER THE FIRST $40 OF COST',255,174,223);tag('AFTER ALL DIRECT COSTS',502,174,200);
    terms.forEach(([term,early,left],i)=>{
      const y=204+i*56;rect(M,y,664,47,i===1?light:'#F1EFF8');t(term,M+10,y+13,197,14,'Helvetica-Bold');
      t(early,255,y+13,225,13);t(left,502,y+11,180,18,'Helvetica-Bold',teal);
    });
    paragraphAt('What to ask first','“I can reserve the materials with $40 today and collect the remaining $60 at handoff. Does that work with your payment schedule?”',393);
    takeaway('Before you spend the early cash','With full prepayment, another $30 of delivery costs still falls due. Allow for overhead, tax and other commitments before deciding what you can reinvest or take home.');
    page(6,'Your working copy','Put your terms on one page.','Use this for one real buyer. Fill the fields, save a copy and set a reminder for day seven. If actual costs arrive later, add a second date to confirm the margin.');
    doc.font('Helvetica').initForm();
    const fields=['Buyer and decision date','Usual price, direct costs and hours','Alternative to offer and what changes','Cash due before delivery and on what date','Lowest terms worth accepting','Day-seven result and cash received','Next action and date'];
    fields.forEach((label,i)=>{
      const y=155+i*40;t(label,M,y+6,300,12,'Helvetica-Bold');
      doc.font('Helvetica').fontSize(11).formText(label,348,y,354,30,{backgroundColor:'#F0EDFA',borderColor:'#B9AFCF'});
    });
    takeaway('For a more detailed quote','Open the editable Deal Approval Memo included with this guide when you need to compare a counteroffer or explain the terms to someone else.');
    page(7,'Your next move','Decide what earns another week.','Put the original terms beside the result. The most useful outcome of a small test is knowing exactly what you’ll do with the next comparable buyer.');
    colText(M,161,660,[
      ['They bought and paid','Compare the contribution and hours with your usual sale. If the difference is worth the work, offer the same terms to the next few eligible buyers and count every refusal.'],
      ['They agreed, but cash or costs are still open','Record what cleared and when the rest is due. Reserve what you still owe. Set a date after delivery to check how much the sale actually left.'],
      ['They passed or haven’t decided','Record the objection in their words. Change one thing you can afford to change. If there’s no reply, set one relevant follow-up and keep the opportunity out of paid sales.']
    ]);
    rect(0,466,W,98,ink);
    t('Want a second pair of eyes on a real quote? Bring your price, costs and the buyer’s decision. On a free call we can choose what to try next.',M,478,660,12,'Body','#FFFFFF');
    t(planningCall.label,M,527,625,13,'Helvetica-Bold',gold,{underline:true,link:planningCall.href});
  }

  function paragraphAt(label,body,y) {
    t(label,M,y,133,12,'Helvetica-Bold');t(body,M+140,y,W-2*M-140,11.1);
  }
}
