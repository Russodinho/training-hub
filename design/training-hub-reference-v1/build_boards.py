"""Rebuild the local SVG design handoff. No application code is changed."""
from pathlib import Path
from html import escape
import json, math, shutil, base64, re

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT.parent.parent / 'public' / 'training-hub-design'
ROOT.mkdir(parents=True, exist_ok=True)
ASSETS.mkdir(parents=True, exist_ok=True)
(ROOT/'boards').mkdir(exist_ok=True)
(ROOT/'references').mkdir(exist_ok=True)
REF = Path('C:/Users/mjrus/Downloads/Training Hub-20260910T154311Z-1-001/Training Hub')
for suffix, name in [('20','desktop-reference.png'),('24','mobile-reference.png')]:
    shutil.copy2(REF/f'Codex Image Sep 10, 2026, 11_35_{suffix} AM.png', ROOT/'references'/name)

C = dict(bg='#091319', panel='#14232d', raised='#1b2d38', border='#304653', text='#f3f7fa', muted='#afbec8', aqua='#28e5dc', purple='#b18afa', green='#75e888', amber='#ffc45a', blue='#56c8ee', red='#ff7877')
PATHS = {
 'home':'M3 10 12 3l9 7v10H3z M9 20v-7h6v7',
 'calendar':'M4 5h16v16H4z M4 10h16 M8 3v4 M16 3v4',
 'plan':'M4 19V5h16 M7 15l4-5 4 2 5-6',
 'log':'M7 4h13v17H4V4h3 M8 3h8v4H8z M8 12h8 M8 16h5',
 'chart':'M4 20V4 M4 20h17 M8 17v-4 M13 17V8 M18 17V5',
 'run':'M13 7l-3 5 5 3 2 6 M10 12l-4 5H2 M11 9l-4 1-3-2 M13 8l4 3 4-1 M15 3a1.5 1.5 0 1 0 .01 0',
 'bike':'M3 14a4 4 0 1 0 .01 0 M16 14a4 4 0 1 0 .01 0 M7 18l5-10 5 10H7l-3-8 M3 10h5 M11 8h5 M16 5l4 13',
 'swim':'M2 18q2-3 5 0t5 0t5 0t5 0 M3 13l6-3 6 3 M9 10l4-5 5 2 M18 10a2 2 0 1 0 .01 0',
 'strength':'M3 8v8 M6 5v14 M18 5v14 M21 8v8 M6 12h12',
 'mobility':'M13 3a1.5 1.5 0 1 0 .01 0 M12 8l-3 6 5 3 4 4 M10 12l-6 2-2 5 M11 9l6 2 4-3',
 'moon':'M19 15A8 8 0 0 1 9 5a8 8 0 1 0 10 10z',
 'recovery':'M20 8A8 8 0 1 0 20 16 M20 3v6h-6 M6 12h3l2-3 3 6 2-3h3',
 'injury':'M9 3h6v6h6v6h-6v6H9v-6H3V9h6z',
 'fuel':'M5 3v6q0 3 3 3V3 M5 7h3 M7 12v9 M17 3q-4 4-2 9h3V3 M18 12v9',
 'flag':'M5 21V3l14 3-14 6',
 'settings':'M12 8a4 4 0 1 0 .01 0 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2',
 'check':'M5 12l4 4L19 6', 'plus':'M12 5v14 M5 12h14',
 'chevron':'M9 5l7 7-7 7', 'water':'M12 3Q3 14 6 18a7 7 0 0 0 12 0Q21 14 12 3z',
 'leaf':'M4 20Q1 4 20 3q0 17-13 15 M4 20 15 8',
 'heart':'M12 20 3 11C-2 3 9 0 12 7c3-7 14-4 9 4z',
 'clock':'M12 3a9 9 0 1 0 .01 0 M12 7v6l4 2',
 'upload':'M12 16V3 M7 8l5-5 5 5 M4 15v6h16v-6',
 'edit':'M4 16 16 4l4 4L8 20H4z M14 6l4 4',
 'sun':'M12 8a4 4 0 1 0 .01 0 M12 1v3 M12 20v3 M1 12h3 M20 12h3 M4 4l2 2 M18 18l2 2 M4 20l2-2 M18 6l2-2'
}
for name, d in PATHS.items():
    (ASSETS/f'{name}.svg').write_text(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="{d}"/></svg>',encoding='utf-8')

PAGES = [
 ('dashboard','/','Dashboard','Good morning','home','Home',[]),
 ('race-calendar','/race-calendar','Race Calendar','Big days start with a plan.','calendar','Plan',[]),
 ('season-plan','/season-plan','Season Plan','Train today. Build toward race day.','plan','Plan',['Tri Plan','Stretch Goals']),
 ('log','/log','Workout Log','Record every set.','log','Train',['Upper A','Lower A','Upper B','Lower B']),
 ('training-log','/training-log','Training Log','Record the work. See the progress.','chart','Train',['Lifts','Tri Sessions','Body Comp','History']),
 ('cardio','/cardio','Cardio','Swim. Bike. Run. Progress.','heart','Train',[]),
 ('fuel','/fuel','Fuel','Nutrition for performance.','fuel','Fuel',['Targets','Meals','Supplements']),
 ('mobility','/mobility','Mobility','Move well. Train longer.','mobility','Recover',[]),
 ('sleep','/sleep','Sleep Protocol','Better sleep. Stronger tomorrow.','moon','Recover',[]),
 ('recovery','/recovery','Recovery','Garmin sleep and stress metrics.','recovery','Recover',['7 days','14 days','30 days']),
 ('wind-down','/wind-down','Wind-Down','Slow down. Settle into sleep.','moon','Recover',[]),
 ('injuries','/injuries','Injuries','Take care. Keep moving.','injury','Recover',[]),
 ('race-day','/race-day','Race Day','Plan. Prepare. Perform.','flag','Plan',[]),
 ('exercises','/settings/exercises','Exercises','Your movements. Your training.','settings','Train',['Upper Push','Upper Pull','Lower Quad','More'])
]

def text(x,y,s,size=14,color=None,weight=400):
    return f'<text x="{x}" y="{y}" fill="{color or C["text"]}" font-size="{size}" font-weight="{weight}">{escape(str(s))}</text>'
def rect(x,y,w,h,fill=None,r=10,stroke=True):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill or "url(#panel)"}"'+(f' stroke="{C["border"]}"' if stroke else '')+'/>'
def icon(name,x,y,color=None,size=24):
    return f'<g transform="translate({x} {y}) scale({size/24})" fill="none" stroke="{color or C["muted"]}" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="{PATHS.get(name,PATHS["log"])}"/></g>'
def button(x,y,w,label,primary=True):
    return rect(x,y,w,40,'url(#aqua)' if primary else C['raised'],8)+text(x+14,y+25,label,14,C['bg'] if primary else C['text'],600)
def row(x,y,w,title,sub='',ic='run',color='aqua',tail='›',done=False):
    out=rect(x,y,w,66)+rect(x+12,y+14,36,36,C['raised'],9,False)+icon(ic,x+18,y+20,C[color])+text(x+60,y+26,title,14,weight=600)+text(x+60,y+46,sub,12,C['muted'])
    if done:
        out+=f'<circle cx="{x+w-23}" cy="{y+33}" r="9" fill="{C["green"]}"/>'+icon('check',x+w-31,y+25,C['bg'],16)
    else: out+=text(x+w-25,y+38,tail,18,C['muted'])
    return out
def ring(x,y,r,val,label,pct=.78,color='aqua'):
    circ=2*math.pi*r
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{C["raised"]}" stroke-width="10"/><circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{C[color]}" stroke-width="10" stroke-linecap="round" stroke-dasharray="{circ*pct} {circ}" transform="rotate(-90 {x} {y})"/>'+f'<text x="{x}" y="{y+3}" text-anchor="middle" font-size="25" font-weight="600" fill="{C["text"]}">{escape(val)}</text><text x="{x}" y="{y+24}" text-anchor="middle" font-size="12" fill="{C["muted"]}">{escape(label)}</text>'
def chart(x,y,w,h,title,color='aqua'):
    out=rect(x,y,w,h)+text(x+18,y+28,title,16,weight=600)
    for i,label in enumerate(['12','8','4','0']):
        yy=y+55+i*(h-90)/3
        out+=text(x+15,yy+4,label,12,C['muted'])+f'<path d="M{x+40} {yy}h{w-58}" stroke="{C["border"]}" stroke-width=".6"/>'
    vals=[.36,.57,.41,.76,.3,.55,.68,.43,.9,.64,.4,.73]
    gap=(w-68)/len(vals)
    for i,v in enumerate(vals):
        hh=v*(h-100)
        out+=rect(x+44+i*gap,y+h-35-hh,max(7,gap*.48),hh,C[color],2,False)
    out+=text(x+43,y+h-13,'Wk 1',12,C['muted'])+text(x+w-70,y+h-13,'Wk 6',12,C['muted'])
    return out
def tabs(x,y,w,labels):
    out=rect(x,y,w,36,C['panel'],18)
    unit=w/len(labels)
    for i,label in enumerate(labels):
        if i==0: out+=rect(x+i*unit,y,unit,36,'url(#aqua)',18,False)
        out+=f'<text x="{x+(i+.5)*unit}" y="{y+23}" text-anchor="middle" fill="{C["bg"] if i==0 else C["muted"]}" font-size="12" font-weight="{600 if i==0 else 400}">{escape(label)}</text>'
    return out
def metrics(x,y,w,items):
    out=''; unit=(w-12*(len(items)-1))/len(items)
    for i,(lab,val,col) in enumerate(items):
        xx=x+i*(unit+12)
        out+=rect(xx,y,unit,92)+text(xx+12,y+24,lab,12,C['muted'])+text(xx+12,y+59,val,24,C[col],600)
    return out
def fields(x,y,w,items):
    out=''; unit=(w-12)/2
    for i,(lab,val) in enumerate(items):
        xx=x+(i%2)*(unit+12); yy=y+(i//2)*77
        out+=text(xx,yy+12,lab,12,C['muted'])+rect(xx,yy+22,unit,40,C['raised'],7)+text(xx+12,yy+47,val,14)
    return out

def content(slug,x,y,w,mobile):
    out=''; gap=16; half=(w-gap)/2
    if slug=='dashboard':
        rw=w if mobile else half
        out+=rect(x,y,rw,174)+f'<image href="../../public/training-hub-design/race-landscape.png" x="{x}" y="{y}" width="{rw}" height="174" preserveAspectRatio="xMidYMid slice" opacity=".38"/>'+text(x+18,y+25,'Next race',12,C['muted'])+text(x+18,y+53,'Your next starting line',19,weight=600)+text(x+18,y+77,'Race name and date from your calendar',12,C['muted'])
        for i,(v,l) in enumerate([('102','DAYS'),('14','HRS'),('27','MIN'),('18','SEC')]):
            xx=x+18+i*(rw-36)/4
            out+=text(xx,y+126,v,26,C['aqua'],600)+text(xx,y+148,l,10,C['muted'])
        xx=x if mobile else x+half+gap; yy=y+190 if mobile else y
        out+=text(xx,yy+18,"Today's workout",16,weight=600)+row(xx,yy+32,rw,'Zone 2 Run','45 min · Easy effort','run')+button(xx,yy+108,rw,'Start Workout')
        yy=y+362 if mobile else y+198
        out+=text(x,yy+18,"Today's timeline",16,weight=600)
        for i,(t,s,ic,col) in enumerate([('Mobility','7:00 · 15 min','mobility','green'),('Bike intervals','9:00 · 60 min','bike','amber'),('Wind-Down','21:35 · 10 min','moon','purple')]):out+=row(x,yy+32+i*74,w if mobile else half,t,s,ic,col,done=i==0)
        if mobile:out+=rect(x,yy+266,w,90,'#372d60')+icon('moon',x+18,yy+294,C['purple'],32)+text(x+64,yy+298,'Recovery',14)+text(x+64,yy+328,'78  ·  Good recovery',22,weight=600)
        else:out+=rect(x+half+gap,yy+32,half,238)+ring(x+half+gap+half/2,yy+139,67,'78','Recovery',.78,'purple')+chart(x,yy+274,w,220,'Weekly volume')
    elif slug=='race-calendar':
        out+=button(x,y,140,'+ Add Race')
        for i,(t,s,ic,col) in enumerate([('Next race','Date · Location · Sprint','swim','blue'),('Summer triathlon','Date · Location · Olympic','bike','amber'),('Season finale','Date · Location · To decide','flag','purple')]):
            yy=y+60+i*113
            out+=rect(x,yy,w,98)+f'<image href="../../public/training-hub-design/race-landscape.png" x="{x+10}" y="{yy+10}" width="70" height="78" preserveAspectRatio="xMidYMid slice"/>'+text(x+93,yy+30,t,16,weight=600)+text(x+93,yy+52,s,12,C['muted'])+text(x+93,yy+77,'Swim  /  Bike  /  Run',12,C[col])
        out+=text(x,y+425,'Add race',18,weight=600)+fields(x,y+442,w,[('Race name',''),('Date',''),('Location',''),('Type','Sprint')])+button(x,y+610,140,'Save Race')
    elif slug=='season-plan':
        labels=['Re-entry','Build + Brick','Sharpening','Taper']
        pw=(w-24)/4
        for i,lab in enumerate(labels):
            xx=x+i*(pw+8)
            out+=rect(xx,y,pw,83,[C['blue'],C['amber'],C['purple'],C['red']][i])+text(xx+8,y+31,lab if not mobile else ['Re-entry','Build','Sharpen','Taper'][i],12,C['bg'],600)+text(xx+8,y+57,f'Phase {i+1}',12,C['bg'])
        out+=text(x,y+119,'Weekly plan · Build + Brick Intro',16,weight=600)
        entries=[('Swim','Technique · planned distance','swim','blue'),('Upper A','Push + delts','strength','purple'),('Bike','Endurance · planned duration','bike','amber'),('Run','Easy effort · planned duration','run','aqua'),('Brick','Bike → Run','flag','red')]
        for i,(t,s,ic,c) in enumerate(entries):out+=row(x,y+138+i*74,w,t,s,ic,c)
        out+=text(x,y+540,'Stretch goals',18,weight=600)+row(x,y+554,w,'Distance progression','Swim · Brick · Off-bike run','plan','green')
    elif slug=='log':
        out+=fields(x,y,w,[('Workout date','Sep 10, 2026'),('Session','Upper A')])+rect(x,y+94,w,266)+icon('strength',x+16,y+112,C['purple'])+text(x+52,y+131,'Bench Press',18,weight=600)+text(x+18,y+163,'SET          REPS          WEIGHT          RPE',12,C['muted'])
        for i in range(3):
            yy=y+178+i*45
            out+=text(x+22,yy+24,str(i+1),14)
            for j,v in enumerate(['8','135','7']):out+=rect(x+66+j*(w-84)/3,yy,(w-110)/3,34,C['raised'],5)+text(x+78+j*(w-84)/3,yy+23,v,14)
        out+=button(x,y+376,140,'+ Add Set',False)+row(x,y+434,w,'Incline Dumbbell Press','3 sets · 8–10 reps','strength','purple')+fields(x,y+520,w,[('Session notes',''),('Previous weight','135 lb')])+button(x,y+615,w if mobile else 210,'Save Workout')
    elif slug=='training-log':
        out+=metrics(x,y,w,[('Sessions','24','aqua'),('Sets','186','purple'),('Latest week','12','text')])+chart(x,y+110,w,230,'Lift progress')+text(x,y+378,'Recent sessions · History',17,weight=600)
        for i,(t,s,ic,c) in enumerate([('Upper A','Sep 10 · 18 sets','strength','purple'),('Bike intervals','Sep 09 · Manual tri entry','bike','amber'),('Body composition','Sep 08 · Imported / manual','chart','blue')]):out+=row(x,y+398+i*74,w,t,s,ic,c)
    elif slug=='cardio':
        out+=button(x,y,160,'Last 30 days',False)+metrics(x,y+58,w,[('This week','6h 28m','aqua'),('Activities','18','text'),('Total time','24h','blue')])+chart(x,y+168,w,215,'Activity volume')+text(x,y+420,'Recent Garmin activities',17,weight=600)
        for i,(t,s,ic,c) in enumerate([('Morning run','8.2 km · 45:12','run','aqua'),('Long bike','64.8 km · 2:12:00','bike','amber'),('Pool swim','2,500 m · 1:03:33','swim','blue')]):out+=row(x,y+441+i*74,w,t,s,ic,c)
    elif slug=='fuel':
        out+=rect(x,y,w,166)
        for i,(v,l,c,p) in enumerate([('2,140','Calories','amber',.8),('142g','Protein','blue',.72),('210g','Carbs','green',.7)]):out+=ring(x+w*(i+.5)/3,y+73,40 if mobile else 52,v,l,p,c)
        out+=row(x,y+184,w,'Cronometer upload','Import daily summary CSV','upload','aqua')+text(x,y+282,'Daily targets',17,weight=600)+row(x,y+300,w,'Low / High / Saturday','Keep current day-specific targets','fuel','amber')
        out+=text(x,y+409,'Meals',17,weight=600)+rect(x,y+430,w,100)+f'<image href="../../public/training-hub-design/oats-blueberries.png" x="{x+10}" y="{y+440}" width="76" height="80" preserveAspectRatio="xMidYMid slice"/>'+text(x+100,y+461,'Oats & blueberries',16,weight=600)+text(x+100,y+487,'Ingredients · Method',12,C['muted'])+text(x+100,y+511,'Breakfast',12,C['amber'])+row(x,y+548,w,'Supplements','Daily timing and existing guidance','clock','purple')
    elif slug in ['mobility','wind-down']:
        wind=slug=='wind-down'; col='purple' if wind else 'green'
        out+=rect(x,y,w,148)+text(x+18,y+32,'Tonight’s routine',18,weight=600)+text(x+18,y+60,'5 stretches · About 10 min' if wind else '9 movements · 15–18 min',14,C['muted'])+text(x+18,y+95,'Slow breathing' if wind else 'Full routine',14,C[col])+ring(x+w-72,y+76,47,'2 / 5' if wind else '6 / 9','Completed',.4 if wind else .67,col)
        entries=['Legs up the wall','Supine spinal twist','Child’s pose','90/90 breathing','Neck release'] if wind else ['Thoracic extension','Lat stretch','Sleeper stretch','World’s greatest stretch','90/90 hip switch','Couch stretch','Pigeon stretch','Wall ankle stretch','Calf + soleus stretch']
        for i,t in enumerate(entries):out+=row(x,y+166+i*74,w,t,'Passive · Follow existing cues' if wind else 'Sets · Duration · Technique cues','moon' if wind else 'mobility',col,tail='○',done=i<(2 if wind else 6))
        out+=text(x,y+184+len(entries)*74,'Ground rules' if wind else 'Why these exercises',16,weight=600)
    elif slug=='sleep':
        out+=rect(x,y,w,116,'#292640')+icon('moon',x+17,y+23,C['purple'],40)+text(x+72,y+37,'Tonight’s protocol',18,weight=600)+text(x+72,y+64,'2 / 4 steps · 7-night streak',14,C['muted'])+text(x+18,y+95,'Lights out target  10:00–10:15 PM',14,C['purple'])
        for i,(t,s) in enumerate([('Magnesium Glycinate','9:00 PM'),('Phone out of room','9:30 PM'),('Wind-Down routine','9:35 PM'),('In bed reading','9:45 PM')]):out+=row(x,y+132+i*74,w,t,s,'moon','purple',tail='○',done=i<2)
        out+=fields(x,y+444,w,[('Date','Sep 10, 2026'),('Lights out','22:10')])+text(x,y+545,'Last night’s sleep quality',14)+tabs(x,y+562,w,['1','2','3','4','5'])+text(x,y+627,'Notes',12,C['muted'])+rect(x,y+637,w,48,C['raised'],7)+button(x,y+702,w,'Save Log')
    elif slug=='recovery':
        unit=(w-12)/2
        out+=metrics(x,y,w,[('Sleep score','82','purple'),('Body battery','76','green')])+metrics(x,y+106,w,[('Resting HR','52 bpm','aqua'),('Stress','24','amber')])+text(x,y+247,'Day-by-day recovery',17,weight=600)
        for i in range(5):out+=row(x,y+265+i*74,w,f'Sep {10-i}','Sleep 82 · Battery 76 · HR 52 · Stress 24','recovery','purple')
        out+=text(x,y+665,'Expand a day to inspect recorded metrics.',12,C['muted'])
    elif slug=='injuries':
        out+=button(x,y,140,'+ Add Injury')+rect(x,y+58,w,222)+f'<image href="../../public/training-hub-design/body-silhouette.png" x="{x+10}" y="{y+69}" width="105" height="198" preserveAspectRatio="xMidYMid meet"/>'+text(x+130,y+95,'Active injury',18,weight=600)+text(x+130,y+125,'Location from your log',12,C['muted'])+rect(x+130,y+143,105,28,C['red'],14,False)+text(x+143,y+162,'Managing',12,C['bg'],600)+text(x+130,y+207,'Pain  3 / 10',16)+text(x+130,y+247,'View details  ›',14,C['aqua'])+text(x,y+319,'Updates',17,weight=600)+row(x,y+340,w,'Latest update','Date · Pain · Notes','injury','red')+button(x,y+421,150,'+ Add Update',False)+text(x,y+508,'Past injuries',17,weight=600)+row(x,y+530,w,'Archived injury','History and treatment notes','injury','muted')
    elif slug=='race-day':
        out+=rect(x,y,w,123)+text(x+18,y+30,'Selected race',12,C['muted'])+text(x+18,y+60,'Your next race',22,weight=600)+text(x+18,y+92,'Swim  →  T1  →  Bike  →  T2  →  Run',14,C['aqua'])+text(x,y+162,'Morning timeline',18,weight=600)
        for i,(t,s) in enumerate([('Arrive at venue','Time from existing race plan'),('Transition opens','Set up gear'),('Race start','Your wave and race strategy')]):out+=row(x,y+183+i*74,w,t,s,'flag',['blue','amber','purple'][i])
        out+=text(x,y+443,'Kit checklist',18,weight=600)
        for i,t in enumerate(['Race documents','Bike and helmet','Nutrition and hydration']):out+=row(x,y+462+i*74,w,t,'Race preparation','check','green',tail='○',done=i==0)
    elif slug=='exercises':
        out+=button(x,y,160,'+ Add Exercise')
        for i,t in enumerate(['Bench Press','Incline Dumbbell Press','Overhead Press']):out+=row(x,y+60+i*74,w,t,'3 sets · 8 reps · RPE 7 · 90s rest','strength','purple')
        out+=text(x,y+324,'Edit exercise',18,weight=600)+fields(x,y+346,w,[('Name','Bench Press'),('Category','Upper Push'),('Sets','3'),('Reps','8'),('RPE','7'),('Rest (seconds)','90')])+button(x,y+598,130,'Save')+button(x+142,y+598,120,'Cancel',False)
    return out

DEFS='''<defs><linearGradient id="panel" x2="1" y2="1"><stop stop-color="#1a2a35"/><stop offset="1" stop-color="#13212a"/></linearGradient><linearGradient id="aqua" x2="0" y2="1"><stop stop-color="#65f3ec"/><stop offset="1" stop-color="#22dcd4"/></linearGradient><linearGradient id="bg" x2="1" y2="1"><stop stop-color="#0b171e"/><stop offset="1" stop-color="#071116"/></linearGradient></defs>'''

for idx,p in enumerate(PAGES):
    slug,route,title,sub,ic,group,tab=p
    height=1280 if slug=='mobility' else 1160
    out=f'<svg xmlns="http://www.w3.org/2000/svg" width="1580" height="{height}" viewBox="0 0 1580 {height}" font-family="Figtree, Segoe UI, Arial, sans-serif">{DEFS}'+rect(0,0,1580,height,'#1b252b',0,False)+text(24,34,f'{idx+1:02d}  {title}',23,weight=600)+text(24,59,f'{route}  •  Desktop / Mobile  •  Illustrative values only',13,C['muted'])
    # Desktop frame: real web surface, not fictional OS controls.
    out+=rect(24,82,1100,height-122,'url(#bg)',12)+rect(24,82,184,height-122,'#16242e',12)+text(42,118,'Training Hub',19,weight=600)+text(42,141,'2026',14,C['aqua'])
    for j,np in enumerate(PAGES):
        yy=166+j*44
        if np[0]==slug:out+=rect(34,yy,163,37,'#164951',6,False)
        out+=icon(np[4],44,yy+9,C['aqua'] if np[0]==slug else C['muted'],18)+text(73,yy+24,np[2],13,C['text'] if np[0]==slug else C['muted'],600 if np[0]==slug else 400)
    out+=text(232,127,title,27,weight=600)+text(232,153,sub,14,C['muted'])
    if tab:out+=tabs(232,174,min(600,868),tab)
    out+=content(slug,232,230 if tab else 181,868,False)
    # Mobile is shown as a full scrolling artboard; bottom nav is pinned only in the app.
    mx=1156; my=82; mw=390
    out+=rect(mx,my,mw,height-122,'url(#bg)',22)+text(mx+20,my+31,'Training Hub',13,weight=600)+icon(ic,mx+346,my+13,C['aqua'],22)+text(mx+20,my+77,title,25,weight=600)+text(mx+20,my+102,sub,13,C['muted'])
    if tab:out+=tabs(mx+20,my+125,350,tab)
    out+=content(slug,mx+20,my+(181 if tab else 133),350,True)
    ny=height-100
    out+=rect(mx,ny,mw,60,'#102029',0)
    for j,(label,ni) in enumerate([('Home','home'),('Plan','calendar'),('Train','run'),('Recover','leaf'),('Fuel','fuel')]):
        xx=mx+j*78+26; color=C['aqua'] if label==group else C['muted']
        out+=icon(ni,xx,ny+7,color,20)+text(xx-2,ny+43,label,11,color,600 if label==group else 400)
    out+='</svg>'
    out=out.replace('../../public/', '../../../public/')
    def embed(match):
        asset=ASSETS/match.group(1)
        return 'href="data:image/png;base64,'+base64.b64encode(asset.read_bytes()).decode()+'"' if asset.exists() else match.group(0)
    out=re.sub(r'href="../../../public/training-hub-design/([^\"]+)"',embed,out)
    (ROOT/'boards'/f'{idx+1:02d}-{slug}.svg').write_text(out,encoding='utf-8')

(ROOT/'route-manifest.json').write_text(json.dumps([dict(route=p[1],title=p[2],board=f'boards/{i+1:02d}-{p[0]}.svg',mobile_group=p[5],tabs=p[6]) for i,p in enumerate(PAGES)],indent=2),encoding='utf-8')
(ROOT/'tokens.json').write_text(json.dumps(C,indent=2),encoding='utf-8')
print(f'Created {len(PAGES)} paired desktop/mobile boards and {len(PATHS)} SVG icons.')

out=f'<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1000" font-family="Figtree, Segoe UI, sans-serif">{DEFS}'+rect(0,0,1200,1000,C['bg'],0,False)+text(32,43,'Training Hub · Components and visual assets',26,weight=600)
for i,(name,color) in enumerate(C.items()):
    xx=32+(i%7)*165; yy=75+(i//7)*85
    out+=rect(xx,yy,145,40,color,7)+text(xx,yy+59,name+' '+color,12,C['muted'])
out+=text(32,278,'Navigation and activity glyphs',18,weight=600)
for i,name in enumerate(PATHS):
    xx=32+(i%9)*128; yy=300+(i//9)*100
    out+=rect(xx,yy,44,44,C['raised'],10)+icon(name,xx+10,yy+10,C[['aqua','blue','green','purple','amber'][i%5]])+text(xx,yy+66,name,12,C['muted'])
out+=text(32,642,'Controls and state styling',18,weight=600)+button(32,663,190,'Save Workout')+button(238,663,170,'Cancel',False)+button(425,663,180,'Saving…',False)+tabs(625,663,530,['Today','This Week','This Month'])
out+=row(32,728,540,'Completed movement','Keep the label readable','mobility','green',done=True)+row(612,728,540,'Optional tonight','A label accompanies the muted state','mobility','muted',tail='○')
out+=rect(32,812,540,100)+text(50,844,'No activities yet',17,weight=600)+text(50,872,'Your synced activities will appear here.',14,C['muted'])+rect(612,812,540,100)+text(630,844,'Could not save your changes',17,C['red'],600)+text(630,872,'Your entries are still here. Try again.',14,C['muted'])+'</svg>'
(ROOT/'components.svg').write_text(out,encoding='utf-8')
