import React, {useEffect, useState} from 'react';
import {SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PINK='#ff1493', PINK2='#ff69b4', BLACK='#09090b', CARD='#17171c', CREAM='#fff6ec', GOLD='#d9a441';
const tabs=['Home','Me','Coach','Journal','Goals','Journey'];

function Cheetah({children}) {
  return <View style={s.cheetah}><Text style={s.spots}>●  ◖●◗   ●   ◖●◗  ●</Text>{children}</View>
}
function Card({title,children}) {
  return <View style={s.card}><Text style={s.cardTitle}>{title}</Text>{children}</View>
}
export default function App(){
 const [tab,setTab]=useState('Home');
 const [journal,setJournal]=useState('');
 const [entries,setEntries]=useState([]);
 const [goal,setGoal]=useState('');
 const [goals,setGoals]=useState([]);
 useEffect(()=>{(async()=>{
   setEntries(JSON.parse(await AsyncStorage.getItem('entries')||'[]'));
   setGoals(JSON.parse(await AsyncStorage.getItem('goals')||'[]'));
 })()},[]);
 const saveEntry=async()=>{ if(!journal.trim())return; const n=[{text:journal.trim(),date:new Date().toLocaleString()},...entries]; setEntries(n); await AsyncStorage.setItem('entries',JSON.stringify(n)); setJournal('');};
 const addGoal=async()=>{if(!goal.trim())return; const n=[{text:goal.trim(),done:false},...goals];setGoals(n);await AsyncStorage.setItem('goals',JSON.stringify(n));setGoal('');};
 const toggle=async(i)=>{const n=goals.map((g,x)=>x===i?{...g,done:!g.done}:g);setGoals(n);await AsyncStorage.setItem('goals',JSON.stringify(n));};
 return <SafeAreaView style={s.safe}><StatusBar style="light"/>
   <Cheetah><Text style={s.logo}>PINKPRINT</Text><Text style={s.tag}>YOUR LIFE • YOUR PATTERNS • YOUR BLUEPRINT</Text></Cheetah>
   <ScrollView contentContainerStyle={s.body}>
    {tab==='Home' && <><Text style={s.hero}>Build a life that feels like you. 🩷</Text>
      <Card title="TODAY"><Text style={s.text}>What would make today feel meaningful—not perfect?</Text></Card>
      <View style={s.row}><View style={s.mini}><Text style={s.big}>{goals.filter(g=>g.done).length}</Text><Text style={s.dim}>goals done</Text></View><View style={s.mini}><Text style={s.big}>{entries.length}</Text><Text style={s.dim}>journal entries</Text></View></View>
      <Card title="QUICK CHECK-IN"><Text style={s.text}>Mood • Energy • Stress • Motivation</Text><Text style={s.dim}>Full tracking is coming next.</Text></Card></>}
    {tab==='Me' && <><Text style={s.hero}>ME ✨</Text><Card title="SELF-DISCOVERY"><Text style={s.text}>What do I genuinely like when nobody else is choosing for me?</Text></Card><Card title="MY VALUES"><Text style={s.text}>Add, edit, reject, and refine what matters to you. PINKPRINT doesn't get to define you.</Text></Card><Card title="POSSIBLE INSIGHTS"><Text style={s.dim}>Future pattern insights will show their evidence and let you choose: Keep • Edit • Not true.</Text></Card></>}
    {tab==='Coach' && <><Text style={s.hero}>COACH 💬</Text><Card title="YOUR COACH, YOUR RULES"><Text style={s.text}>Reflection • Goals • Habits • Confidence • Career • Money • Custom Coach</Text></Card><Card title="AI CONNECTION"><Text style={s.dim}>The app is being designed so the AI provider can be swapped instead of locking you into a paid subscription.</Text></Card></>}
    {tab==='Journal' && <><Text style={s.hero}>JOURNAL ✍️</Text><TextInput multiline placeholder="What's on your mind?" placeholderTextColor="#777" value={journal} onChangeText={setJournal} style={s.input}/><Pressable style={s.button} onPress={saveEntry}><Text style={s.buttonText}>SAVE ENTRY</Text></Pressable>{entries.map((e,i)=><Card key={i} title={e.date}><Text style={s.text}>{e.text}</Text></Card>)}</>}
    {tab==='Goals' && <><Text style={s.hero}>GOALS 🎯</Text><TextInput placeholder="Something I want to build..." placeholderTextColor="#777" value={goal} onChangeText={setGoal} style={s.input}/><Pressable style={s.button} onPress={addGoal}><Text style={s.buttonText}>ADD GOAL</Text></Pressable>{goals.map((g,i)=><Pressable key={i} onPress={()=>toggle(i)}><Card title={g.done?'✓ COMPLETE':'○ IN PROGRESS'}><Text style={[s.text,g.done&&s.done]}>{g.text}</Text></Card></Pressable>)}</>}
    {tab==='Journey' && <><Text style={s.hero}>JOURNEY 🐆</Text><Card title="YOUR STORY"><Text style={s.text}>Your journal entries, milestones, quests, insights and wins will become a timeline here.</Text></Card>{entries.slice(0,5).map((e,i)=><Card key={i} title={e.date}><Text style={s.text}>Journaled: {e.text}</Text></Card>)}</>}
   </ScrollView>
   <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.nav} contentContainerStyle={s.navInner}>{tabs.map(t=><Pressable key={t} onPress={()=>setTab(t)} style={[s.navBtn,tab===t&&s.navOn]}><Text style={[s.navText,tab===t&&s.navTextOn]}>{t}</Text></Pressable>)}</ScrollView>
 </SafeAreaView>
}
const s=StyleSheet.create({
 safe:{flex:1,backgroundColor:BLACK},body:{padding:18,paddingBottom:30},cheetah:{backgroundColor:PINK,paddingTop:12,paddingBottom:14,paddingHorizontal:18,overflow:'hidden'},spots:{position:'absolute',right:-8,top:2,color:'#111',fontSize:31,opacity:.82,letterSpacing:2},logo:{color:'#fff',fontSize:28,fontWeight:'900',letterSpacing:2},tag:{color:'#19000d',fontSize:9,fontWeight:'900',letterSpacing:1.4},
 hero:{color:CREAM,fontSize:26,fontWeight:'900',marginBottom:16},card:{backgroundColor:CARD,borderRadius:20,padding:17,marginBottom:13,borderWidth:1,borderColor:'#2b2b32'},cardTitle:{color:PINK2,fontWeight:'900',fontSize:12,letterSpacing:1.2,marginBottom:8},text:{color:CREAM,fontSize:16,lineHeight:23},dim:{color:'#a9a9b2',fontSize:13,lineHeight:19,marginTop:4},row:{flexDirection:'row',gap:12,marginBottom:13},mini:{flex:1,backgroundColor:CARD,borderRadius:20,padding:18,borderWidth:1,borderColor:GOLD},big:{color:PINK,fontSize:32,fontWeight:'900'},input:{backgroundColor:CARD,color:CREAM,minHeight:58,borderRadius:18,padding:15,borderWidth:1,borderColor:'#333',marginBottom:10,textAlignVertical:'top'},button:{backgroundColor:PINK,borderRadius:18,padding:16,alignItems:'center',marginBottom:16},buttonText:{color:'#fff',fontWeight:'900',letterSpacing:1},done:{textDecorationLine:'line-through',opacity:.55},
 nav:{maxHeight:64,borderTopWidth:1,borderTopColor:'#292930',backgroundColor:'#0e0e12'},navInner:{paddingHorizontal:8,alignItems:'center',gap:4},navBtn:{paddingVertical:11,paddingHorizontal:14,borderRadius:18},navOn:{backgroundColor:PINK},navText:{color:'#aaa',fontWeight:'800'},navTextOn:{color:'#fff'}
});
