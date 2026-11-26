import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const P = '#ff1493', CY = '#00f5ff', BK = '#07070a', CD = '#15151c', TX = '#fff7fb', M = '#a8a8b3';
const HISTORY_KEY = 'pinkprint_ai_history_v1';
const URL_KEY = 'pinkprint_ai_endpoint_v1';
const TOKEN_KEY = 'pinkprint_ai_access_token_v1';

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [endpoint, setEndpoint] = useState('');
  const [token, setToken] = useState('');
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [history, url, access] = await Promise.all([
          AsyncStorage.getItem(HISTORY_KEY),
          AsyncStorage.getItem(URL_KEY),
          SecureStore.getItemAsync(TOKEN_KEY),
        ]);
        if (history) setMessages(JSON.parse(history));
        setEndpoint(url || process.env.EXPO_PUBLIC_PINKPRINT_AI_URL || '');
        setToken(access || '');
      } catch (e) {
        console.warn('PinkPrint AI settings could not load', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(messages)).catch(() => {});
  }, [messages, ready]);

  const saveConnection = async () => {
    const url = endpoint.trim().replace(/\/$/, '');
    if (url && !/^https:\/\//i.test(url)) {
      Alert.alert('Use a secure URL', 'Your AI endpoint must begin with https://');
      return;
    }
    try {
      await Promise.all([
        AsyncStorage.setItem(URL_KEY, url),
        SecureStore.setItemAsync(TOKEN_KEY, token.trim()),
      ]);
      setEndpoint(url);
      setSettingsOpen(false);
      Alert.alert(url && token.trim() ? 'Connection settings saved' : 'Settings saved', url && token.trim() ? 'PinkPrint will use this secure AI endpoint when you send a message.' : 'Add both your deployed endpoint and access token to turn on AI chat.');
    } catch {
      Alert.alert('Could not save', 'Please try again.');
    }
  };

  const send = async () => {
    const text = draft.trim();
    if (!text || busy) return;
    const url = endpoint.trim().replace(/\/$/, '');
    if (!url || !token.trim()) {
      setSettingsOpen(true);
      Alert.alert('Connect PinkPrint AI', 'Add your secure AI endpoint and access token in AI settings first.');
      return;
    }
    const userMessage = { id: String(Date.now()), role: 'user', content: text, createdAt: new Date().toISOString() };
    const next = [...messages, userMessage];
    setMessages(next);
    setDraft('');
    setBusy(true);
    try {
      const response = await fetch(url + '/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token.trim() },
        body: JSON.stringify({ messages: next.slice(-20).map(m => ({ role: m.role, content: m.content })) }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'The AI service returned an error (' + response.status + ').');
      if (!data.reply || typeof data.reply !== 'string') throw new Error('The AI service returned an empty reply.');
      setMessages(current => [...current, { id: String(Date.now() + 1), role: 'assistant', content: data.reply, createdAt: new Date().toISOString() }]);
    } catch (error) {
      setMessages(current => [...current, { id: String(Date.now() + 2), role: 'assistant', content: 'I couldn’t reach your AI service. Check your endpoint, access token, and internet connection in AI settings.\n\nDetails: ' + (error?.message || 'Connection failed'), error: true, createdAt: new Date().toISOString() }]);
    } finally {
      setBusy(false);
    }
  };

  const clearChat = () => Alert.alert('Clear AI chat?', 'This deletes the saved chat from this device.', [
    { text: 'Keep chat', style: 'cancel' },
    { text: 'Clear', style: 'destructive', onPress: () => setMessages([]) },
  ]);

  return <View style={styles.wrap}>
    <View style={styles.heading}>
      <View style={styles.sparkle}><Text style={styles.sparkleText}>✦</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>PINKPRINT AI</Text>
        <Text style={styles.status}>{endpoint.trim() && token.trim() ? 'PRIVATE CONNECTION SETTINGS SAVED' : 'AI CONNECTION NOT SET UP YET'}</Text>
      </View>
      <Pressable onPress={() => setSettingsOpen(v => !v)} style={styles.smallButton}><Text style={styles.smallButtonText}>⚙</Text></Pressable>
      <Pressable onPress={clearChat} style={styles.smallButton}><Text style={styles.smallButtonText}>⌫</Text></Pressable>
    </View>
    {settingsOpen && <View style={styles.settings}>
      <Text style={styles.sectionTitle}>CONNECT YOUR AI</Text>
      <Text style={styles.help}>Paste the HTTPS URL of your deployed PinkPrint AI backend and its access token. The token is stored in Android secure storage; your AI provider key belongs on the backend only.</Text>
      <TextInput value={endpoint} onChangeText={setEndpoint} placeholder="https://your-worker.example.workers.dev" placeholderTextColor="#777" autoCapitalize="none" keyboardType="url" style={styles.input}/>
      <TextInput value={token} onChangeText={setToken} placeholder="Backend access token" placeholderTextColor="#777" autoCapitalize="none" secureTextEntry style={styles.input}/>
      <Pressable onPress={saveConnection} style={styles.primary}><Text style={styles.primaryText}>SAVE CONNECTION</Text></Pressable>
      <Text style={styles.help}>No AI is simulated while disconnected. Follow the setup guide in the PinkPrint GitHub repository to deploy the backend.</Text>
    </View>}
    {!endpoint.trim() || !token.trim() ? <View style={styles.notice}>
      <Text style={styles.noticeTitle}>Your AI is waiting to be connected ✨</Text>
      <Text style={styles.noticeText}>The chat is ready, but it needs a secure AI service. Tap the gear, then follow the backend setup guide. Your private API key must never be placed inside the app.</Text>
    </View> : null}
    <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messageContent} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })} keyboardShouldPersistTaps="handled">
      {messages.length === 0 && <View style={styles.welcome}>
        <Text style={styles.welcomeTitle}>Hey, lovely. 💗</Text>
        <Text style={styles.welcomeText}>This is your space to think out loud, explore who you are, make a plan, or get creative. No pressure to have it all figured out.</Text>
        <View style={styles.suggestions}>
          {['Help me sort through my thoughts','Help me make a realistic plan','Ask me a question to get to know myself'].map(item => <Pressable key={item} onPress={() => setDraft(item)} style={styles.suggestion}><Text style={styles.suggestionText}>{item}</Text></Pressable>)}
        </View>
      </View>}
      {messages.map(m => <View key={m.id} style={[styles.bubble, m.role === 'user' ? styles.userBubble : styles.aiBubble, m.error && styles.errorBubble]}>
        <Text style={styles.role}>{m.role === 'user' ? 'YOU' : 'PINKPRINT AI'}</Text>
        <Text style={styles.messageText}>{m.content}</Text>
      </View>)}
      {busy && <View style={[styles.bubble, styles.aiBubble]}><ActivityIndicator color={CY}/><Text style={styles.help}>Thinking…</Text></View>}
    </ScrollView>
    <View style={styles.composer}>
      <TextInput value={draft} onChangeText={setDraft} placeholder="Tell PinkPrint AI what's on your mind…" placeholderTextColor="#777" multiline maxLength={3000} style={styles.composeInput}/>
      <Pressable disabled={busy || !draft.trim()} onPress={send} style={[styles.send, (busy || !draft.trim()) && styles.sendDisabled]}><Text style={styles.sendText}>➤</Text></Pressable>
    </View>
    <Text style={styles.footer}>AI can make mistakes. Use it as a thinking partner, not a substitute for professional care.</Text>
  </View>;
}

const styles = StyleSheet.create({
  wrap:{backgroundColor:CD,borderRadius:20,borderWidth:1,borderColor:'#59304b',padding:12,marginBottom:14,minHeight:520},
  heading:{flexDirection:'row',alignItems:'center',gap:8,marginBottom:12},
  sparkle:{width:38,height:38,borderRadius:13,backgroundColor:'#3c1230',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:P},
  sparkleText:{color:P,fontSize:24,fontWeight:'900'},
  title:{color:TX,fontSize:16,fontWeight:'900',letterSpacing:1.2},
  status:{color:CY,fontSize:8,fontWeight:'800',letterSpacing:.7,marginTop:3},
  smallButton:{width:34,height:34,borderRadius:11,borderWidth:1,borderColor:'#514252',alignItems:'center',justifyContent:'center'},
  smallButtonText:{color:TX,fontSize:17},
  settings:{backgroundColor:'#0b0b10',borderRadius:15,borderWidth:1,borderColor:PU,padding:12,marginBottom:10},
  sectionTitle:{color:P,fontSize:11,fontWeight:'900',letterSpacing:1},
  help:{color:M,fontSize:11,lineHeight:16,marginTop:6},
  input:{backgroundColor:'#15151c',borderColor:'#45404b',borderWidth:1,borderRadius:10,color:TX,padding:10,marginTop:8,fontSize:12},
  primary:{backgroundColor:P,borderRadius:11,padding:11,alignItems:'center',marginTop:8},
  primaryText:{color:'#fff',fontSize:10,fontWeight:'900'},
  notice:{backgroundColor:'#241322',borderColor:'#7a2857',borderWidth:1,borderRadius:14,padding:13,marginBottom:10},
  noticeTitle:{color:P,fontSize:14,fontWeight:'900'},
  noticeText:{color:TX,fontSize:12,lineHeight:18,marginTop:6},
  messages:{maxHeight:350,minHeight:210},
  messageContent:{gap:9,paddingVertical:6},
  welcome:{padding:10},
  welcomeTitle:{color:P,fontSize:19,fontWeight:'900'},
  welcomeText:{color:TX,fontSize:13,lineHeight:20,marginTop:6},
  suggestions:{gap:6,marginTop:12},
  suggestion:{borderWidth:1,borderColor:'#54304a',borderRadius:12,padding:9},
  suggestionText:{color:CY,fontSize:11,fontWeight:'700'},
  bubble:{borderRadius:14,padding:11,maxWidth:'94%'},
  userBubble:{alignSelf:'flex-end',backgroundColor:'#46102f',borderWidth:1,borderColor:P},
  aiBubble:{alignSelf:'flex-start',backgroundColor:'#101017',borderWidth:1,borderColor:'#3b3744'},
  errorBubble:{borderColor:'#b45309'},
  role:{color:CY,fontSize:8,fontWeight:'900',letterSpacing:1,marginBottom:5},
  messageText:{color:TX,fontSize:13,lineHeight:20},
  composer:{flexDirection:'row',alignItems:'flex-end',gap:8,marginTop:8},
  composeInput:{flex:1,backgroundColor:'#0b0b10',borderColor:'#403a46',borderWidth:1,borderRadius:14,color:TX,padding:11,maxHeight:100,minHeight:44,fontSize:13},
  send:{width:44,height:44,borderRadius:14,backgroundColor:P,alignItems:'center',justifyContent:'center'},
  sendDisabled:{opacity:.45},
  sendText:{color:'#fff',fontSize:19,fontWeight:'900'},
  footer:{color:'#8b8793',fontSize:9,lineHeight:13,marginTop:7,textAlign:'center'},
});