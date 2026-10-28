import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, TextInput, ScrollView, StyleSheet, Alert, Image, PanResponder } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Svg, { Path } from 'react-native-svg';
import AsyncStorage from '@react-native-async-storage/async-storage';

const P='#ff1493', CY='#00f5ff', PU='#a855f7', BG='#090910', WHITE='#fff7fb';
const COLORS=[P,CY,PU,'#ffffff','#ffe600','#ff7f50','#7cff6b','#111111'];
const FONTS=[{label:'Bold',value:'900'},{label:'Elegant',value:'500'},{label:'Soft',value:'300'},{label:'Italic',value:'italic'}];
const STICKERS=['✦','★','♡','☾','☀','✿','⚡','✧','➤','☁','♛','✓','∞','💎','🦋','🌷'];
const uid=()=>String(Date.now())+Math.random().toString(36).slice(2,7);
export default function VisionStudio(){
 const [title,setTitle]=useState('My next chapter');
 const [boardId,setBoardId]=useState('current');
 const [boards,setBoards]=useState([]);
 const [elements,setElements]=useState([]);
 const [selected,setSelected]=useState(null);
 const [tool,setTool]=useState('text');
 const toolRef=useRef(tool);toolRef.current=tool;
 const [text,setText]=useState('My future is mine');
 const [color,setColor]=useState(P);
 const [fontSize,setFontSize]=useState(22);
 const [fontWeight,setFontWeight]=useState('900');
 const [bg,setBg]=useState('#211027');
 const [drawings,setDrawings]=useState([]);
 const [currentPath,setCurrentPath]=useState('');
 const canvasRef=useRef(null);
 const pathRef=useRef('');
 const elementsRef=useRef(elements);elementsRef.current=elements;
 const drawingsRef=useRef(drawings);drawingsRef.current=drawings;
 const titleRef=useRef(title);titleRef.current=title;
 const bgRef=useRef(bg);bgRef.current=bg;
 useEffect(()=>{(async()=>{try{const raw=await AsyncStorage.getItem('pinkprintVisionStudio');if(raw){const data=JSON.parse(raw);setBoards(data.boards||[]);if(data.current){setBoardId(data.current.id||'current');setTitle(data.current.title||'My next chapter');setElements(data.current.elements||[]);setDrawings(data.current.drawings||[]);setBg(data.current.bg||'#211027')}}}catch{}})()},[]);
 const persist=async(nextElements=elements,nextDrawings=drawings,nextTitle=title,nextBg=bg,nextBoards=boards,nextId=boardId)=>{const current={id:nextId,title:nextTitle,elements:nextElements,drawings:nextDrawings,bg:nextBg,updatedAt:new Date().toISOString()};const nextBoardList=[current,...nextBoards.filter(b=>b.id!==nextId)].slice(0,30);setBoards(nextBoardList);try{await AsyncStorage.setItem('pinkprintVisionStudio',JSON.stringify({boards:nextBoardList,current}))}catch{Alert.alert('Save issue','Could not save your board. Check your device storage.')}};
 const addText=()=>{if(!text.trim())return;const item={id:uid(),type:'text',text:text.trim(),x:24,y:32,color,fontSize,fontWeight};const next=[...elements,item];setElements(next);setSelected(item.id);persist(next)};
 const addSticker=(sticker)=>{const item={id:uid(),type:'sticker',text:sticker,x:35+Math.random()*70,y:35+Math.random()*80,color,fontSize:38};const next=[...elements,item];setElements(next);setSelected(item.id);persist(next)};
 const addPhoto=async()=>{const permission=await ImagePicker.requestMediaLibraryPermissionsAsync();if(!permission.granted){Alert.alert('Photo permission needed','Allow photo-library access to add pictures to your vision board.');return}const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],allowsEditing:true,quality:.85});if(result.canceled||!result.assets?.[0]?.uri)return;const item={id:uid(),type:'image',uri:result.assets[0].uri,x:18,y:35,width:130,height:130};const next=[...elements,item];setElements(next);setSelected(item.id);persist(next)};
 const updateSelected=(patch)=>{const next=elements.map(e=>e.id===selected?{...e,...patch}:e);setElements(next);persist(next)};
 const moveSelected=(dx,dy)=>{const e=elements.find(x=>x.id===selected);if(e)updateSelected({x:Math.max(0,Math.min(78,(e.x||0)+dx)),y:Math.max(0,Math.min(85,(e.y||0)+dy))})};
 const deleteSelected=()=>{const next=elements.filter(e=>e.id!==selected);setElements(next);setSelected(null);persist(next)};
 const clearBoard=()=>Alert.alert('Clear this board?','This removes its photos, text, stickers, and drawings.',[{text:'Cancel',style:'cancel'},{text:'Clear',style:'destructive',onPress:()=>{setElements([]);setDrawings([]);setSelected(null);persist([],[])}}]);
 const undoDrawing=()=>{const next=drawings.slice(0,-1);setDrawings(next);persist(elements,next)};
 const panResponder=useRef(PanResponder.create({onStartShouldSetPanResponder:()=>toolRef.current==='draw',onMoveShouldSetPanResponder:()=>toolRef.current==='draw',onPanResponderGrant:(evt)=>{const {locationX:x,locationY:y}=evt.nativeEvent;pathRef.current='M '+x+' '+y;setCurrentPath(pathRef.current)},onPanResponderMove:(evt)=>{const {locationX:x,locationY:y}=evt.nativeEvent;pathRef.current=pathRef.current+' L '+x+' '+y;setCurrentPath(pathRef.current)},onPanResponderRelease:()=>{if(pathRef.current){const next=[...drawings,{id:uid(),d:pathRef.current,color,width:3}];setDrawings(next);persist(elements,next)}pathRef.current='';setCurrentPath('')}})).current;
 const saveBoard=()=>persist();
 const newBoard=()=>{const id=uid();setBoardId(id);setTitle('Untitled vision board');setElements([]);setDrawings([]);setSelected(null);setBg('#211027');persist([],[],'Untitled vision board','#211027',boards,id)};
 const loadBoard=(b)=>{setBoardId(b.id);setTitle(b.title||'My next chapter');setElements(b.elements||[]);setDrawings(b.drawings||[]);setBg(b.bg||'#211027');setSelected(null);persist(b.elements||[],b.drawings||[],b.title||'My next chapter',b.bg||'#211027',boards.filter(x=>x.id!==b.id),b.id)};
 const tiny=(label,fn,active=false)=> <Pressable key={label} onPress={fn} style={[v.tool,active&&v.toolOn]}><Text style={[v.toolText,active&&{color:'#08080b'}]}>{label}</Text></Pressable>;
 return <View style={v.wrap}>
  <Text style={v.kicker}>✦ VISION STUDIO / CREATIVE CANVAS ✦</Text>
  <TextInput value={title} onChangeText={setTitle} onEndEditing={()=>persist()} placeholder="Name your board" placeholderTextColor="#aaa" style={v.titleInput}/>
  <View style={v.tools}>{tiny('TEXT',()=>setTool('text'),tool==='text')}{tiny('DRAW',()=>setTool('draw'),tool==='draw')}{tiny('STICKERS',()=>setTool('stickers'),tool==='stickers')}{tiny('PHOTOS',addPhoto)}</View>
  <View style={v.panel}>
   {tool==='text'&&<><TextInput value={text} onChangeText={setText} placeholder="Write your words…" placeholderTextColor="#888" style={v.input}/><View style={v.tools}>{FONTS.map(f=>tiny(f.label,()=>setFontWeight(f.value),fontWeight===f.value))}{tiny('ADD TEXT',addText,true)}</View><View style={v.tools}>{[16,22,30,40].map(n=>tiny(String(n),()=>setFontSize(n),fontSize===n))}</View></>}
   {tool==='stickers'&&<View style={v.stickers}>{STICKERS.map(st=>tiny(st,()=>addSticker(st)))}</View>}
   {tool==='draw'&&<Text style={v.hint}>Draw with your finger on the canvas. Choose a color below. Use UNDO STROKE to remove your last line.</Text>}
   <View style={v.colors}>{COLORS.map(c=><Pressable key={c} onPress={()=>setColor(c)} style={[v.swatch,{backgroundColor:c,borderColor:color===c?CY:'#555'}]}/>)}</View>
  </View>
  <View style={[v.canvas,{backgroundColor:bg}]} ref={canvasRef} {...(tool==='draw'?panResponder.panHandlers:{})}>
   <Text pointerEvents="none" style={v.canvasPrint}>◉  ●  ◎  ◉</Text>
   <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width="100%" height="100%" viewBox="0 0 320 480" preserveAspectRatio="none">
    {drawings.map(d=><Path key={d.id} d={d.d} stroke={d.color} strokeWidth={d.width} fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}{currentPath?<Path d={currentPath} stroke={color} strokeWidth={3} fill="none" strokeLinecap="round"/>:null}
   </Svg>
   {elements.map(e=><Pressable key={e.id} onPress={()=>setSelected(e.id)} style={[v.element,{left:e.x+'%',top:e.y+'%',borderColor:selected===e.id?CY:'transparent'}]}>
    {e.type==='image'?<Image source={{uri:e.uri}} resizeMode="cover" style={{width:e.width||130,height:e.height||130,borderRadius:10}}/>:<Text style={{color:e.color||P,fontSize:e.fontSize||22,fontWeight:e.fontWeight==='italic'?'500':(e.fontWeight||'900'),fontStyle:e.fontWeight==='italic'?'italic':'normal',textShadowColor:'#000',textShadowRadius:3}}>{e.text}</Text>}
   </Pressable>)}
   {elements.length===0&&drawings.length===0&&<Text pointerEvents="none" style={v.canvasPlaceholder}>YOUR DREAMS LOOK GOOD ON YOU.{"\n"}Add photos, words, stickers & sketches.</Text>}
  </View>
  {selected&&<View style={v.panel}><Text style={v.hint}>SELECTED LAYER · Move it, recolor it, resize it, or delete it.</Text><View style={v.tools}>{tiny('←',()=>moveSelected(-5,0))}{tiny('→',()=>moveSelected(5,0))}{tiny('↑',()=>moveSelected(0,-5))}{tiny('↓',()=>moveSelected(0,5))}{tiny('BIGGER',()=>updateSelected({fontSize:Math.min(60,(elements.find(e=>e.id===selected)?.fontSize||22)+4),width:Math.min(240,(elements.find(e=>e.id===selected)?.width||130)+15),height:Math.min(240,(elements.find(e=>e.id===selected)?.height||130)+15)}))}{tiny('SMALLER',()=>updateSelected({fontSize:Math.max(10,(elements.find(e=>e.id===selected)?.fontSize||22)-4),width:Math.max(50,(elements.find(e=>e.id===selected)?.width||130)-15),height:Math.max(50,(elements.find(e=>e.id===selected)?.height||130)-15)}))}{tiny('DELETE',deleteSelected)}</View></View>}
  <Text style={v.hint}>BACKGROUND</Text><View style={v.tools}>{['#211027','#101927','#3b0c28','#090910','#341a12','#24133d'].map(c=>tiny(' ',()=>{setBg(c);persist(elements,drawings,title,c)},bg===c))}{tiny('UNDO STROKE',undoDrawing)}</View>
  <View style={v.tools}>{tiny('SAVE BOARD',saveBoard,true)}{tiny('NEW BOARD',newBoard)}{tiny('CLEAR',clearBoard)}</View>
  <Text style={v.kicker}>SAVED BOARDS</Text><ScrollView horizontal showsHorizontalScrollIndicator={false}>{boards.filter(b=>b.id!==boardId).map(b=>tiny(b.title,()=>loadBoard(b)))}</ScrollView>
 </View>;
}
const v=StyleSheet.create({wrap:{gap:9},kicker:{color:CY,fontWeight:'900',fontSize:10,letterSpacing:1.5,marginTop:4},titleInput:{backgroundColor:'#0c0c11',borderColor:P,borderWidth:1,borderRadius:12,padding:12,color:WHITE,fontSize:18,fontWeight:'900'},tools:{flexDirection:'row',flexWrap:'wrap',gap:6,alignItems:'center'},tool:{borderWidth:1,borderColor:PU,borderRadius:12,paddingVertical:9,paddingHorizontal:11,backgroundColor:'#11111a',minWidth:32,alignItems:'center',justifyContent:'center'},toolOn:{backgroundColor:CY,borderColor:CY},toolText:{color:WHITE,fontWeight:'900',fontSize:10},panel:{backgroundColor:'#15151c',borderRadius:14,borderWidth:1,borderColor:'#39303b',padding:10,gap:8},input:{backgroundColor:'#090910',borderRadius:10,padding:10,color:WHITE,borderWidth:1,borderColor:'#333',minHeight:44},stickers:{flexDirection:'row',flexWrap:'wrap',gap:7},colors:{flexDirection:'row',gap:9,alignItems:'center',paddingVertical:4},swatch:{width:25,height:25,borderRadius:14,borderWidth:3},hint:{color:'#b8b8c3',fontSize:11,lineHeight:17},canvas:{height:480,borderRadius:18,borderWidth:2,borderColor:P,overflow:'hidden',position:'relative'},canvasPrint:{position:'absolute',top:8,right:6,color:P,fontSize:23,opacity:.7,fontWeight:'900'},element:{position:'absolute',maxWidth:'92%',padding:5,borderWidth:1,borderRadius:8},canvasPlaceholder:{color:'#ffb9dd',textAlign:'center',fontWeight:'900',fontSize:18,lineHeight:28,marginTop:175,padding:20}});
