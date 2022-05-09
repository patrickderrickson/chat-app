import React from 'react';
import PropTypes from 'prop-types';
import { GiftedChat, Bubble } from 'react-native-gifted-chat'
import { StyleSheet, Text, View, KeyboardAvoidingView, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'
import CustomActions from './CustomActions';



import { Constants, MapView, Location, Permissions } from 'expo';



import NetInfo from '@react-native-community/netinfo';



import * as firebase from "firebase";
import "firebase/firestore";

export default class Chat extends React.Component {
  constructor() {
    super();
    this.state = {
      messages: [],
      uid: 0,
      user: {
        _id: "",
        name: "",
        avatar: "",
      },
      isConnected: false,
    };

    const firebaseConfig = {
      apiKey: "AIzaSyDAdpHPRchpoYgLiYNPws_m7XBaZ-HQWM8",
      authDomain: "chat-9f0c1.firebaseapp.com",
      projectId: "chat-9f0c1",
      storageBucket: "chat-9f0c1.appspot.com",
      messagingSenderId: "324294237179",
      appId: "1:324294237179:web:d4ce271ebadce95cccc95e",
      measurementId: "G-LNR6YKGS9T"
    };

    if (!firebase.apps.length) {
      firebase.initializeApp(firebaseConfig);
    }

   
    this.referenceChatMessages = firebase.firestore().collection("messages");
  this.refMsgsUser = null;
  }

  async getMessages() {
    let messages = '';
    try {
      messages = await AsyncStorage.getItem('messages') || [];
      this.setState({
        messages: JSON.parse(messages)
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  async saveMessages() {
    try {
      await AsyncStorage.setItem('messages', JSON.stringify(this.state.messages));
    } catch (error) {
      console.log(error.message);
    }
  }

 

  async deleteMessages() {
    try {
      await AsyncStorage.removeItem('messages');
      this.setState({
        messages: []
      })
    } catch (error) {
      console.log(error.message);
    }
  }

  
 

  componentDidMount() {

    this.getMessages();


    NetInfo.fetch().then(connection => {
      if (connection.isConnected) {
        console.log('online');
      } else {
        console.log('offline');
      }
    });

    

    this.authUnsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (!user) {
        firebase.auth().signInAnonymously();
      }
      this.setState({
        uid: user.uid,
        messages: [],
      });
      this.unsubscribe = this.referenceChatMessages
        .orderBy("createdAt", "desc")
        .onSnapshot(this.onCollectionUpdate);
    });
    
  }

  onCollectionUpdate = (querySnapshot) => {
    const messages = [];
    querySnapshot.forEach((doc) => {
      let data = doc.data();
      messages.push({
        _id: data._id,
        text: data.text,
        createdAt: data.createdAt.toDate(),
        user: data.user,
      });
    });
    this.setState({
        messages,
    });
    
};

addMessages() {
  const message = this.state.messages[0];
  this.referenceChatMessages.add({
      uid: this.state.uid,
      _id: message._id,
      text: message.text || '',
      createdAt: message.createdAt,
      user: this.state.user,
  });
}
onSend(messages = []) {
  this.setState(previousState => ({
    messages: GiftedChat.append(previousState.messages, messages),
  }), () => {
    this.saveMessages();
  });
}
renderInputToolbar(props) {
  if (this.state.isConnected == false) {
  } else {
    return(
      <InputToolbar
      {...props}
      />
    );
  }
}
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          right: {
            backgroundColor: '#000'
          }
        }}
      />
    )
  }
  
  renderCustomActions = (props) => {
    return <CustomActions {...props} />;
  };

  renderCustomView(props) {
    const { currentMessage } = props;
    if (currentMessage.location) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 13, margin: 3 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  }


  render() {
    const { bgColor } = this.props.route.params;
    let name = this.props.route.params.name;
    this.props.navigation.setOptions({title: name}); 
    return (
      <View style = {{flex: 1, backgroundColor: bgColor}}>
      <GiftedChat
      renderBubble={this.renderBubble.bind(this)}
      messages={this.state.messages}
      onSend={(messages) => this.onSend(messages)}
      user={{
        _id: 1,
      }}
     />
     { Platform.OS === 'android' ? <KeyboardAvoidingView behavior="height" /> : null
 }


 
     </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: 26,
    height: 26,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 13,
    borderColor: '#b2b2b2',
    borderWidth: 2,
    flex: 1,
  },
  iconText: {
    color: '#b2b2b2',
    fontWeight: 'bold',
    fontSize: 16,
    backgroundColor: 'transparent',
    textAlign: 'center',
  },
 });
  

