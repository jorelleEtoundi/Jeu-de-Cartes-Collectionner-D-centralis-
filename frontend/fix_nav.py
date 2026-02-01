import re

with open('pages/index.js', 'r', encoding='utf-8') as f:
    c = f.read()

DICE  = '<span style={{display:"inline-flex",alignItems:"center",width:"1em",height:"1em",marginRight:"6px"}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"100%",height:"100%"}}><rect x="1" y="1" width="22" height="22" rx="3" ry="3"/><circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="8" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="8" cy="16" r="1.5" fill="currentColor" stroke="none"/><circle cx="16" cy="16" r="1.5" fill="currentColor" stroke="none"/></svg></span>'
CARDS = '<span style={{display:"inline-flex",alignItems:"center",width:"1em",height:"1em",marginRight:"6px"}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"100%",height:"100%"}}><rect x="2" y="5" width="16" height="13" rx="2" ry="2"/><rect x="6" y="2" width="16" height="13" rx="2" ry="2" fill="rgba(99,102,241,0.15)"/><path d="M14 9l-2 4 3-1-3 4" strokeWidth="1.5"/></svg></span>'
ARROWS= '<span style={{display:"inline-flex",alignItems:"center",width:"1em",height:"1em",marginRight:"6px"}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width:"100%",height:"100%"}}><path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/></svg></span>'
BOLT  = '<span style={{display:"inline-flex",alignItems:"center",width:"1em",height:"1em",marginRight:"6px"}}><svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{width:"100%",height:"100%"}}><path d="M13 2L4.5 13.5H11L10 22l8.5-11.5H13L13 2z" fill="rgba(168,85,247,0.4)"/></svg></span>'

c = re.sub(r'>\s*\U0001f3b2\s*Mint\s*<',            '>{' + DICE   + '}Mint<',          c)
c = re.sub(r'>\s*\U0001f3b4\s*Ma Collection\s*<',   '>{' + CARDS  + '}Ma Collection<', c)
c = re.sub(r'>\s*\U0001f504\s*\u00c9changer\s*<',   '>{' + ARROWS + '}Échanger<',      c)
c = re.sub(r'>\s*\u26a1\s*Fusionner\s*<',           '>{' + BOLT   + '}Fusionner<',     c)

with open('pages/index.js', 'w', encoding='utf-8') as f:
    f.write(c)

print('OK - 4 nav buttons updated')
