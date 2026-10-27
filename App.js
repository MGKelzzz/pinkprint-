import React, { useEffect, useMemo, useState } from 'react';
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const P='#ff1493', CY='#00f5ff', PU='#a855f7', BK='#07070a', CD='#15151c', TX='#fff7fb', M='#a8a8b3';
const tabs=['Home','Me','Coach','Create','Goals','Journey'];
const moods=['LOW','MEH','OKAY','GOOD','GREAT'];
const habitList=['Morning reset','Move my body','Do one thing for future me'];
const valuePrompts=['What matters to me?','What makes me feel most like myself?','What am I ready to outgrow?','What do I want more of in my life?'];
const coachModes=[
  {id:'reflect',label:'Reflect',intro:'Let’s slow down and separate the facts from the story your mind is telling.'},
  {id:'plan',label:'Make a plan',intro:'Make this smaller. Choose one next step you can realistically do today.'},
  {id:'confidence',label:'Confidence',intro:'Confidence grows when you keep small promises to yourself. What is one promise you can keep today?'},
  {id:'stuck',label:'Get unstuck',intro:'You do not have to solve your whole life right now. Name the next useful action, not the entire outcome.'},
  {id:'gratitude',label:'Find a win',intro:'Progress counts even when it is quiet. What did you handle, learn, or try today?'}
];
function Card({title,children,cyan=false,style}){return <View style={[s.card,cyan&&s.cyan,style]}><Text style={[s.ct,cyan&&{color:CY}]}>{title}</Text>{children}</View>}
function Field({value,onChangeText,placeholder,multiline=false,style}){return <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor="#686875" multiline={multiline} style={[s.input,multiline&&s.multiline,style]} textAlignVertical={multiline?'top':'center'}/> }
function Action({label,onPress,secondary=false}){return <Pressable accessibilityRole="button" onPress={onPress} style={[s.btn,secondary&&s.btnSecondary]}><Text style={[s.btnText,secondary&&s.btnTextSecondary]}>{label}</Text></Pressable>}
function Empty({children}){return <Text style={s.empty}>{children}</Text>}
export default function App(){
 const [tab,setTab]=useState('Home');
 const [section,setSection]=useState('Journal');
 const [journal,setJournal]=useState(''); const [entries,setEntries]=useState([]);
 const [goal,setGoal]=useState(''); const [goals,setGoals]=useState([]);
 const [focus,setFocus]=useState(''); const [mood,setMood]=useState('');
 const [done,setDone]=useState([]); const [doneDate,setDoneDate]=useState('');
 const [xp,setXp]=useState(0);
 const [values,setValues]=useState({matters:'',myself:'',outgrow:'',more:''});
 const [coachMode,setCoachMode]=useState('reflect'); const [coachNote,setCoachNote]=useState(''); const [coachSaved,setCoachSaved]=useState([]);
 const [boardTitle,setBoardTitle]=useState('My next chapter'); const [boardNote,setBoardNote]=useState(''); const [boardItems,setBoardItems]=useState([]);
 const [draftTitle,setDraftTitle]=useState(''); const [draftBody,setDraftBody]=useState(''); const [drafts,setDrafts]=useState([]);
 const [loaded,setLoaded]=useState(false);

 useEffect(()=>{(async()=>{try{
  const keys=['entries','goals','focus','mood','habits','habitDate','xp','values','coachSaved','boardItems','drafts'];
  const pairs=await AsyncStorage.multiGet(keys); const d=Object.fromEntries(pairs);
  const read=(k,fallback)=>{try{return d[k]?JSON.parse(d[k]):fallback}catch{return fallback}};
  setEntries(read('entries',[]));setGoals(read('goals',[]));setFocus(read('focus',''));setMood(read('mood',''));
  const today=new Date().toDateString(); const oldDate=read('habitDate','');
  setDone(oldDate===today?read('habits',[]):[]);setDoneDate(today);setXp(read('xp',0));
  setValues(read('values',{matters:'',myself:'',outgrow:'',more:''}));setCoachSaved(read('coachSaved',[]));setBoardItems(read('boardItems',[]));setDrafts(read('drafts',[]));
 }catch(e){console.warn('PINKPRINT data load failed',e)}finally{setLoaded(true)}})()},[]);
 const persist=async(key,value,setter)=>{setter(value);try{await AsyncStorage.setItem(key,JSON.stringify(value))}catch(e){Alert.alert('Could not save','Your device could not save this change. Please check available storage and try again.')}};
 const setFocusSaved=async(v)=>{setFocus(v);try{await AsyncStorage.setItem('focus',JSON.stringify(v))}catch{}};
 const addXp=async(n)=>{const next=xp+n;setXp(next);try{await AsyncStorage.setItem('xp',JSON.stringify(next))}catch{}};
 const level=Math.floor(xp/100)+1;
 const completedGoals=goals.filter(g=>g.done).length;
 const timeline=useMemo(()=>[
  ...entries.map(e=>({date:e.createdAt,label:'JOURNAL',text:e.text,sort:e.timestamp||0})),
  ...goals.filter(g=>g.doneAt).map(g=>({date:g.doneAt,label:'GOAL COMPLETED',text:g.text,sort:g.doneAtMs||0})),
  ...coachSaved.map(c=>({date:c.date,label:'COACH NOTE',text:c.note,sort:c.timestamp||0})),
  ...boardItems.map(b=>({date:b.date,label:'VISION',text:b.title+(b.note?' — '+b.note:''),sort:b.timestamp||0}))
 ].sort((a,b)=>b.sort-a.sort),[entries,goals,coachSaved,boardItems]);

 const saveEntry=async()=>{if(!journal.trim())return;const now=Date.now();const next=[{id:String(now),text:journal.trim(),date:new Date(now).toLocaleString(),createdAt:new Date(now).toLocaleString(),timestamp:now},...entries];await persist('entries',next,setEntries);setJournal('');await addXp(10)};
 const addGoal=async()=>{if(!goal.trim())return;const next=[{id:String(Date.now()),text:goal.trim(),done:false,createdAt:new Date().toLocaleDateString()},...goals];await persist('goals',next,setGoals);setGoal('')};
 const toggleGoal=async(g)=>{const next=goals.map(x=>x.id===g.id?{...x,done:!x.done,doneAt:!x.done?new Date().toLocaleString():'',doneAtMs:!x.done?Date.now():0}:x);await persist('goals',next,setGoals);if(!g.done)await addXp(15)};
 const deleteGoal=(g)=>Alert.alert('Delete this goal?','This removes it from your list.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>persist('goals',goals.filter(x=>x.id!==g.id),setGoals)}]);
 const toggleHabit=async(h)=>{const next=done.includes(h)?done.filter(x=>x!==h):[...done,h];setDone(next);setDoneDate(new Date().toDateString());try{await AsyncStorage.multiSet([['habits',JSON.stringify(next)],['habitDate',JSON.stringify(new Date().toDateString())]])}catch{}if(!done.includes(h))await addXp(5)};
 const chooseMood=async(m)=>{setMood(m);try{await AsyncStorage.setItem('mood',JSON.stringify(m))}catch{}};
 const saveValues=async(next)=>{setValues(next);try{await AsyncStorage.setItem('values',JSON.stringify(next))}catch{Alert.alert('Could not save','Please try again.')}};
 const saveCoach=async()=>{if(!coachNote.trim())return;const now=Date.now();const next=[{id:String(now),mode:coachMode,note:coachNote.trim(),date:new Date(now).toLocaleString(),timestamp:now},...coachSaved];await persist('coachSaved',next,setCoachSaved);setCoachNote('');await addXp(5)};
 const saveBoard=async()=>{if(!boardTitle.trim()&&!boardNote.trim())return;const now=Date.now();const next=[{id:String(now),title:boardTitle.trim()||'Untitled vision',note:boardNote.trim(),date:new Date(now).toLocaleDateString(),timestamp:now},...boardItems];await persist('boardItems',next,setBoardItems);setBoardNote('');await addXp(5)};
 const saveDraft=async()=>{if(!draftTitle.trim()&&!draftBody.trim())return;const now=Date.now();const next=[{id:String(now),title:draftTitle.trim()||'Untitled draft',body:draftBody.trim(),date:new Date(now).toLocaleString(),timestamp:now},...drafts];await persist('drafts',next,setDrafts);setDraftTitle('');setDraftBody('')};
 const deleteDraft=(d)=>Alert.alert('Delete draft?','This cannot be undone.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>persist('drafts',drafts.filter(x=>x.id!==d.id),setDrafts)}]);
 const deleteEntry=(e)=>Alert.alert('Delete journal entry?','This cannot be undone.',[{text:'Cancel',style:'cancel'},{text:'Delete',style:'destructive',onPress:()=>persist('entries',entries.filter(x=>x.id!==e.id),setEntries)}]);
 const mode=coachModes.find(m=>m.id===coachMode)||coachModes[0];
 if(!loaded)return <SafeAreaView style={s.safe}><StatusBar style="light"/><View style={s.loading}><Text style={s.logo}>PINKPRINT</Text><Text style={s.dim}>Opening your blueprint…</Text></View></SafeAreaView>;
 return <SafeAreaView style={s.safe}><StatusBar style="light"/>
  <View style={s.head}><View pointerEvents="none" style={s.print}><Text style={s.spots}>◉　●　◎　◉{'\n'}●　◎　◉　●{'\n'}◎　◉　●　◎</Text></View><Text style={s.logo}>PINKPRINT</Text><Text style={s.tag}>YOUR LIFE • YOUR PATTERNS • YOUR BLUEPRINT</Text></View>
  <ScrollView key={tab} contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
   {tab==='Home'&&<><Text style={s.hero}>YOUR DAY, YOUR WAY.</Text><Text style={s.sub}>Small choices. Real progress. No perfection required.</Text>
    <Card title="TODAY'S FOCUS"><Field value={focus} onChangeText={setFocusSaved} placeholder="What matters most today?"/></Card>
    <Card title="QUICK CHECK-IN" cyan><Text style={s.text}>How are you feeling?</Text><View style={s.chips}>{moods.map(m=><Pressable accessibilityRole="button" key={m} onPress={()=>chooseMood(m)} style={[s.chip,mood===m&&s.chipOn]}><Text style={[s.chipText,mood===m&&{color:BK}]}>{m}</Text></Pressable>)}</View></Card>
    <Card title="DAILY RESET">{habitList.map(h=><Pressable accessibilityRole="checkbox" accessibilityState={{checked:done.includes(h)}} key={h} onPress={()=>toggleHabit(h)} style={s.line}><Text style={[s.box,done.includes(h)&&{color:CY}]}>{done.includes(h)?'◆':'◇'}</Text><Text style={[s.text,done.includes(h)&&s.done]}>{h}</Text></Pressable>)}<Text style={s.dim}>Resets each day. Your progress is saved on this device.</Text></Card>
    <View style={s.row}><View style={s.stat}><Text style={s.num}>{xp}</Text><Text style={s.dim}>XP • LEVEL {level}</Text></View><View style={s.stat}><Text style={[s.num,{color:CY}]}>{completedGoals}</Text><Text style={s.dim}>GOALS DONE</Text></View></View>
    <Card title="TODAY'S AFFIRMATION"><Text style={s.quote}>“I can build my life one honest choice at a time.”</Text></Card>
   </>}
   {tab==='Me'&&<><Text style={s.hero}>MY BLUEPRINT</Text><Text style={s.sub}>You're the author. This is a space to discover, not define, you.</Text>
    {valuePrompts.map((p,i)=>{const k=['matters','myself','outgrow','more'][i];return <Card key={k} title={p.toUpperCase()}><Field value={values[k]} onChangeText={v=>saveValues({...values,[k]:v})} placeholder="Write what feels true for you…" multiline/></Card>})}
    <Card title="LIFE AREAS" cyan><Text style={s.text}>Self • Style • Relationships • Home • Money • Career • Creativity • Fun</Text><Text style={s.dim}>You get to decide what each area means to you.</Text></Card>
   </>}
   {tab==='Coach'&&<><Text style={s.hero}>YOUR POCKET COACH</Text><Text style={s.sub}>A gentle, practical reflection space. This version works offline; it does not pretend to be an AI therapist.</Text>
    <View style={s.chips}>{coachModes.map(m=><Pressable key={m.id} onPress={()=>setCoachMode(m.id)} style={[s.chip,coachMode===m.id&&s.chipOn]}><Text style={[s.chipText,coachMode===m.id&&{color:BK}]}>{m.label.toUpperCase()}</Text></Pressable>)}</View>
    <Card title={mode.label.toUpperCase()} cyan><Text style={s.text}>{mode.intro}</Text><Text style={[s.dim,{marginTop:12}]}>Try asking yourself: What do I know? What am I assuming? What is one thing I can control?</Text><Field value={coachNote} onChangeText={setCoachNote} placeholder="Write your thoughts or next step…" multiline/><Action label="SAVE REFLECTION  +5 XP" onPress={saveCoach}/></Card>
    {coachSaved.map(c=><Card key={c.id} title={c.mode.toUpperCase()+' • '+c.date}><Text style={s.text}>{c.note}</Text></Card>)}
    {!coachSaved.length&&<Empty>Your reflections will appear here after you save one.</Empty>}
   </>}
   {tab==='Create'&&<><Text style={s.hero}>CREATE STUDIO</Text><Text style={s.sub}>Ideas, dreams, words, and little pieces of your next chapter.</Text>
    <View style={s.chips}>{['Journal','Vision','Blog'].map(x=><Pressable key={x} onPress={()=>setSection(x)} style={[s.chip,section===x&&s.chipOn]}><Text style={[s.chipText,section===x&&{color:BK}]}>{x.toUpperCase()}</Text></Pressable>)}</View>
    {section==='Journal'&&<><Card title="PRIVATE JOURNAL" cyan><Field value={journal} onChangeText={setJournal} placeholder="What happened? What did you feel? What do you need?" multiline/><Action label="SAVE ENTRY  +10 XP" onPress={saveEntry}/></Card>{entries.map(e=><Card key={e.id} title={e.date}><Text style={s.text}>{e.text}</Text><Pressable onPress={()=>deleteEntry(e)}><Text style={s.delete}>DELETE ENTRY</Text></Pressable></Card>)}{!entries.length&&<Empty>Your first entry can be messy. It just has to be yours.</Empty>}</>}
    {section==='Vision'&&<><Card title="VISION BOARD BUILDER" cyan><Text style={s.dim}>Build your board one intention at a time. This text-based board saves privately on this device.</Text><Field value={boardTitle} onChangeText={setBoardTitle} placeholder="Name this chapter or dream"/><Field value={boardNote} onChangeText={setBoardNote} placeholder="Describe the feeling, goal, image idea, or reminder…" multiline/><Action label="ADD TO MY VISION BOARD  +5 XP" onPress={saveBoard}/></Card><View style={s.boardGrid}>{boardItems.map((b,i)=><View key={b.id} style={[s.boardCard,i%2===0?s.boardPink:s.boardPurple]}><Text style={s.boardLabel}>MY VISION</Text><Text style={s.boardTitle}>{b.title}</Text>{!!b.note&&<Text style={s.boardText}>{b.note}</Text>}<Text style={s.boardDate}>{b.date}</Text></View>)}</View>{!boardItems.length&&<Empty>Your vision board will grow as you add intentions and dreams.</Empty>}</>}
    {section==='Blog'&&<><Card title="BLOG DRAFT STUDIO" cyan><Text style={s.dim}>Draft and save writing offline. Publishing to WordPress requires a separate site connection, which is not configured in this version.</Text><Field value={draftTitle} onChangeText={setDraftTitle} placeholder="Post title"/><Field value={draftBody} onChangeText={setDraftBody} placeholder="Start writing your post…" multiline/><Action label="SAVE DRAFT" onPress={saveDraft}/></Card>{drafts.map(d=><Card key={d.id} title={d.title}><Text style={s.dim}>{d.date}</Text><Text style={s.text}>{d.body||'No body text yet.'}</Text><View style={s.row}><Action label="COPY TEXT" secondary onPress={()=>Alert.alert('Copy not available yet','Use your device text selection to copy this draft in this version.')}/><Action label="DELETE" secondary onPress={()=>deleteDraft(d)}/></View></Card>)}{!drafts.length&&<Empty>Your saved blog drafts will live here.</Empty>}</>}
   </>}
   {tab==='Goals'&&<><Text style={s.hero}>GOALS THAT FEEL LIKE YOU.</Text><Text style={s.sub}>Make it meaningful. Make it manageable. Keep going.</Text><Card title="NEW GOAL" cyan><Field value={goal} onChangeText={setGoal} placeholder="Something I want to build…"/><Action label="ADD GOAL" onPress={addGoal}/></Card>{goals.map(g=><Card key={g.id} title={g.done?'◆ COMPLETED':'◇ IN PROGRESS'}><Pressable onPress={()=>toggleGoal(g)} style={s.line}><Text style={[s.box,g.done&&{color:CY}]}>{g.done?'◆':'◇'}</Text><Text style={[s.text,g.done&&s.done,{flex:1}]}>{g.text}</Text></Pressable><Pressable onPress={()=>deleteGoal(g)}><Text style={s.delete}>DELETE GOAL</Text></Pressable></Card>)}{!goals.length&&<Empty>One small goal is enough to start.</Empty>}</>}
   {tab==='Journey'&&<><Text style={s.hero}>LOOK HOW FAR YOU'RE GOING.</Text><Text style={s.sub}>A timeline of the steps you choose to record.</Text><Card title="YOUR PROGRESS" cyan><Text style={s.num}>LEVEL {level}</Text><Text style={s.text}>{xp} XP earned</Text><Text style={s.dim}>{entries.length} journal entries • {completedGoals} goals completed • {coachSaved.length} reflections</Text></Card>{timeline.map((item,i)=><Card key={item.label+item.sort+i} title={item.label+' • '+item.date}><Text style={s.text}>{item.text}</Text></Card>)}{!timeline.length&&<Empty>Your journey starts with one small action. Journal, save a reflection, add a vision, or finish a goal to begin your timeline.</Empty>}</>}
  </ScrollView>
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.nav} contentContainerStyle={s.navIn}>{tabs.map(t=><Pressable accessibilityRole="tab" accessibilityState={{selected:tab===t}} key={t} onPress={()=>setTab(t)} style={[s.navBtn,tab===t&&s.navOn]}><Text style={[s.navText,tab===t&&s.navTextOn]}>{t}</Text></Pressable>)}</ScrollView>
 </SafeAreaView>;
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:BK},loading:{flex:1,alignItems:'center',justifyContent:'center',gap:12},
 head:{backgroundColor:'#0b0b10',paddingHorizontal:18,paddingTop:8,paddingBottom:13,borderBottomWidth:2,borderBottomColor:P,overflow:'hidden'},
 print:{position:'absolute',right:-8,top:-8,width:155,height:92,backgroundColor:P,transform:[{rotate:'-8deg'}],opacity:.98},
 spots:{fontSize:22,color:'#08080b',fontWeight:'900',lineHeight:27,letterSpacing:1,padding:9},
 logo:{color:P,fontSize:30,fontWeight:'900',letterSpacing:2,textShadowColor:PU,textShadowRadius:10},
 tag:{color:CY,fontSize:9,fontWeight:'800',letterSpacing:1.2},
 body:{padding:18,paddingBottom:32},hero:{color:TX,fontSize:27,fontWeight:'900',letterSpacing:.2,textShadowColor:P,textShadowRadius:8},sub:{color:M,marginTop:4,marginBottom:16,fontSize:13,lineHeight:19},
 card:{backgroundColor:CD,borderRadius:20,padding:16,marginBottom:13,borderWidth:1,borderColor:'#39303b'},cyan:{borderColor:CY},ct:{color:P,fontWeight:'900',fontSize:12,letterSpacing:1.2,marginBottom:10},
 text:{color:TX,fontSize:15,lineHeight:22},dim:{color:M,fontSize:12,lineHeight:18,marginTop:5},empty:{color:M,fontSize:13,lineHeight:20,paddingVertical:12},
 input:{backgroundColor:'#0c0c11',color:TX,minHeight:50,borderRadius:13,padding:13,borderWidth:1,borderColor:'#35353e',marginTop:7,marginBottom:8,fontSize:14},multiline:{minHeight:105,paddingTop:13},
 chips:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:8,marginBottom:12},chip:{borderWidth:1,borderColor:PU,borderRadius:20,paddingHorizontal:11,paddingVertical:9},chipOn:{backgroundColor:CY,borderColor:CY},chipText:{color:TX,fontSize:10,fontWeight:'900'},
 line:{flexDirection:'row',alignItems:'center',paddingVertical:8},box:{color:P,fontSize:19,marginRight:10},done:{textDecorationLine:'line-through',opacity:.55},
 row:{flexDirection:'row',gap:8,marginTop:8},stat:{flex:1,backgroundColor:CD,borderRadius:20,padding:16,borderWidth:1,borderColor:PU},num:{color:P,fontSize:29,fontWeight:'900'},quote:{color:TX,fontSize:18,fontWeight:'700',fontStyle:'italic',lineHeight:26},
 btn:{backgroundColor:P,borderRadius:14,padding:13,alignItems:'center',marginTop:8,marginBottom:3,flex:1},btnSecondary:{backgroundColor:'transparent',borderWidth:1,borderColor:PU},btnText:{color:'#fff',fontWeight:'900',letterSpacing:.5,fontSize:11},btnTextSecondary:{color:TX},
 delete:{color:'#ff8cbf',fontSize:10,fontWeight:'900',letterSpacing:1,marginTop:12,alignSelf:'flex-start'},
 boardGrid:{gap:10},boardCard:{borderRadius:18,padding:17,borderWidth:1,borderColor:'#ff79c8',minHeight:115},boardPink:{backgroundColor:'#4b1034'},boardPurple:{backgroundColor:'#26143d',borderColor:PU},boardLabel:{color:CY,fontSize:9,fontWeight:'900',letterSpacing:1.5,marginBottom:8},boardTitle:{color:TX,fontSize:19,fontWeight:'900'},boardText:{color:'#f5ddea',fontSize:13,lineHeight:19,marginTop:6},boardDate:{color:'#d3b4d0',fontSize:10,marginTop:12},
 nav:{maxHeight:62,backgroundColor:'#0b0b10',borderTopWidth:1,borderTopColor:'#33243a'},navIn:{paddingHorizontal:8,alignItems:'center',gap:3},navBtn:{paddingVertical:11,paddingHorizontal:13,borderRadius:17},navOn:{backgroundColor:P},navText:{color:'#8e8e9a',fontWeight:'800',fontSize:12},navTextOn:{color:'#fff'}
});
