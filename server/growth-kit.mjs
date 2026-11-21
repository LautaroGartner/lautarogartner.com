import { AlignmentType, BorderStyle, Document, Footer, HeadingLevel, Packer, PageNumber, Paragraph, Table, TableCell, TableRow, TextRun, WidthType } from 'docx';

const ink='342953', teal='594791', pale='E6E1FF', cream='F3F8FC', grey='595464', white='FFFFFF';
const edge={style:BorderStyle.SINGLE,size:4,color:'C9C2DB'};
const clear={style:BorderStyle.NONE,size:0,color:white};
const run=(text,opts={})=>new TextRun({text,...opts});
const p=(children,after=145)=>new Paragraph({spacing:{after,line:310},children:typeof children==='string'?[run(children)]:children});
const small=(s,color=teal)=>p([run(s.toUpperCase(),{size:16,bold:true,color,characterSpacing:12})],50);
const heading=s=>new Paragraph({heading:HeadingLevel.HEADING_2,text:s,spacing:{before:220,after:90}});
const pad=(top=95)=>({top,bottom:top,left:135,right:135});
const totalWidth=9740;
function cell(children,width,fill,margin=140){
  return new TableCell({width:{size:width,type:WidthType.DXA},margins:pad(margin),shading:{fill},children});
}
function table(widths,rows,header=true) {
  return new Table({width:{size:totalWidth,type:WidthType.DXA},columnWidths:widths,
    borders:{top:clear,bottom:edge,left:clear,right:clear,insideHorizontal:edge,insideVertical:clear},
    rows:rows.map((row,i)=>new TableRow({cantSplit:true,tableHeader:header&&i===0,
      children:row.map((value,j)=>cell([p([run(value,{size:header&&i===0?20:23,bold:header&&i===0||j===0,color:header&&i===0?white:ink})],0)],widths[j],header&&i===0?ink:i%2?pale:cream))}))});
}
function recommendation(label,body){
  return new Table({width:{size:totalWidth,type:WidthType.DXA},columnWidths:[totalWidth],
    borders:{top:clear,bottom:clear,left:clear,right:clear,insideHorizontal:clear,insideVertical:clear},
    rows:[new TableRow({children:[cell([small(label,'D6EEFF'),p([run(body,{color:white,size:25})],0)],totalWidth,ink,190)]})]});
}
export async function growthKit() {
  const pages=[];
  function start(section,title,intro){
    pages.push(new Paragraph({pageBreakBefore:pages.length>0,spacing:{after:68},children:[run(section.toUpperCase(),{size:17,bold:true,color:teal,characterSpacing:16})]}));
    pages.push(new Paragraph({text:title,heading:HeadingLevel.HEADING_1,spacing:{after:165}}),p(intro,170));
  }
  start('Your working copy','Deal Approval Memo','Use this to price an idea or check an offer before you send it. Replace the brackets with your own figures. Use an estimate where you need one.');
  pages.push(heading('Write the offer'),table([3100,6640],[
    ['Decision','My draft'],
    ['Who could use it?','[The person and the problem I want to solve]'],
    ['What would they get?','[The result and how they could check it]'],
    ['Why act now?','[What changes if they wait, or leave the timing open]'],
    ['What do I promise?','[What I will deliver and what I will do if it falls short]']
  ]),heading('Check the price'),table([3100,6640],[
    ['Proposed price','[Amount I would charge]'],
    ['Cost to win and deliver','[Money I expect to spend, including any bonus or remedy]'],
    ['What the sale leaves','[Price less those costs, before overhead and tax]'],
    ['My time','[Hours needed and whether the amount left makes them worthwhile]']
  ]),recommendation('My decision','[Keep the offer / change it / set it aside]. The assumption that matters most is [   ].'));
  start('Payment and test','Decide what happens first','Work out when money comes in and when it goes out. Then choose one thing you want to learn.');
  pages.push(table([3100,6640],[
    ['Decision','My terms'],
    ['First payment','[Amount, due date and what that payment secures]'],
    ['Early bills','[What I must pay before the next payment clears]'],
    ['Cash left or gap to cover','[Cash collected by that date less the bills paid by then]'],
    ['Remaining work','[Cost, balance due and when I expect payment]']
  ]),heading('Put the terms in plain English'),p('“You get [result]. The first payment of [amount] covers [commitment]. The balance is due [when]. You can check the work by [agreed test].”'),
  heading('Choose one test'),p('I think [assumption]. I can check it by [action]. I can afford to spend [money and hours] finding out. I would keep going if [result], and change the offer if [result].'),
  recommendation('When I have a result','Record what actually happened. Compare it with your estimate and decide what to keep, change or stop.'));
  const footerRuns=[run('LAUTARO GÄRTNER     /     DEAL APPROVAL MEMO     ·     ',{size:16,color:grey}),new TextRun({children:[PageNumber.CURRENT],size:16,color:grey})];
  return Packer.toBuffer(new Document({title:'Deal Approval Memo',creator:'Lautaro Gärtner',
    styles:{default:{document:{run:{font:'Calibri',size:25,color:ink}}},paragraphStyles:[
      {id:'Heading1',name:'Heading 1',basedOn:'Normal',run:{font:'Calibri',size:52,bold:true,color:ink}},
      {id:'Heading2',name:'Heading 2',basedOn:'Normal',run:{font:'Calibri',size:30,bold:true,color:teal}}
    ]},
    sections:[{properties:{page:{size:{width:12240,height:15840},margin:{left:1250,right:1250,top:1000,bottom:1050,footer:410}}},
      footers:{default:new Footer({children:[new Paragraph({alignment:AlignmentType.RIGHT,children:footerRuns})]})},children:pages}]
  }));
}
