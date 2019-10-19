import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput, Image, ScrollView } from 'react-native';
import * as Font from 'expo-font';
import {Keyboard} from 'react-native'

const WIDTH = 300;

const images = {
  'tip-etiquette': require('./assets/images/tip-etiquette.png'),
  'how-much': require('./assets/images/how-much.png'),
  'lounge': require('./assets/images/lounge.png'),
  'rex': require('./assets/images/rex.png'),
  'gibberish': require('./assets/images/gibberish.png'),
  'intro': require('./assets/images/intro.png'),
};

const Card = ({ image, description, attachments }) => (
  <React.Fragment>
    <View
      style={{
        width: WIDTH,
        padding: 15,
        paddingLeft: 20,
        paddingRight: 20,
        borderWidth: 2,
        borderColor: '#d4d4d4',
        borderRadius: 25,
        fontFamily: 'karla',
        fontSize: 15,
        marginBottom: 15,
      }}
    >
      <View style={{
        justifyContent: 'center',
        alignItems: 'center',
        padding: 15,
      }}>
        <Image
          source={images[image]}
        />
      </View>
      {/* <Text style={{ fontFamily: 'karla' }}>{image}</Text> */}
      <Text style={{ fontFamily: 'karla' }}>
        <Text style={{ fontFamily: 'karla-bold' }}>Daisy: </Text>
        <Text>{description}</Text>
      </Text>
    </View>
    { attachments && attachments.length > 0 ? attachments.map((attachment, key) => (
      <View
        key={key}
        style={{
          width: WIDTH,
          padding: 15,
          paddingLeft: 20,
          paddingRight: 20,
          borderWidth: 2,
          borderColor: '#d4d4d4',
          borderRadius: 25,
          fontFamily: 'karla',
          fontSize: 15,
        }}
      >
        <Text style={{ fontFamily: 'karla' }}>
          <Text style={{ fontFamily: 'karla-bold' }}>{attachment.title}</Text>
        </Text>
        <Text style={{ fontFamily: 'karla' }}>
          <Text style={{ fontFamily: 'karla' }}>{attachment.description}</Text>
        </Text>
        <View style={{
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15,
        }}>
          <Image
            source={images[attachment.image]}
          />
        </View>
        {/* <Text style={{ fontFamily: 'karla' }}>{image}</Text> */}
      </View>
    )) : null}
  </React.Fragment>
);

const gibberish = {
  description: 'Sorry but I don’t know the answer to that. I’ll ask one of my human colleagues and will get back to you shortly.',
  image: 'gibberish',
};

const intro = {
  description: 'Hi! I’m here to make you make the most of your DCI Membership. How can I help you?',
  image: 'intro',
};

export default class App extends Component {
  constructor (props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.renderResults = this.renderResults.bind(this);

    this.state = {
      fontLoaded: false,
      value: null,
    };
  }
  async componentDidMount () {
    await Font.loadAsync({
      'karla': require('./assets/fonts/Karla-Regular.ttf'),
      'karla-bold': require('./assets/fonts/Karla-Bold.ttf'),
      'palanquin': require('./assets/fonts/Palanquin-Regular.ttf'),
      'palanquin-medium': require('./assets/fonts/Palanquin-Medium.ttf'),
      'palanquin-light': require('./assets/fonts/Palanquin-ExtraLight.ttf'),
    });

    this.setState({ fontLoaded: true });
  }

  onChange (e) {
    clearTimeout(this.state.timeout)
    this.setState({
      value: e.nativeEvent.text,
      result: null,
      gibberish: false,
      timeout: setTimeout(async () => {
        let result;
        const res = await fetch(`http://localhost:3000/api?query=${this.state.value}`);
        const data = await res.json();
        if (data.result && Object.keys(data.result).length > 0) {
          result = data.result;
          Keyboard.dismiss();
        }

        this.setState({
          gibberish: !result,
          result,
        });
      }, 250),
    });
  }

  renderResults () {
    if (!this.state.result && !this.state.value) {
      return (
        <Card
          image={intro.image}
          description={intro.description}
        />
      );
    } else if (this.state.result) {
      return (
        <Card
          image={this.state.result.image}
          description={this.state.result.description}
          attachments={this.state.result.attachments}
        />
      );
    }

    if (this.state.gibberish) {
      return (
        <Card
          image={gibberish.image}
          description={gibberish.description}
        />
      )
    }

    return <View><Text>Loading...</Text></View>
  }

  render () {
    if (!this.state.fontLoaded) {
      return (
        <View />
      );
    }

    return (
      <ScrollView contentContainerStyle={{
        flexGrow: 1,
        // justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{ marginTop: 70 }} />
        <View style={{ width: WIDTH, marginBottom: 15, }}>
          <Text style={{ fontSize: 35, fontFamily: 'karla-bold' }}>Sydney</Text>
        </View>
        <TextInput
          style={{
            width: WIDTH,
            padding: 15,
            paddingLeft: 20,
            paddingRight: 20,
            borderWidth: 2,
            borderColor: '#d4d4d4',
            borderRadius: 25,
            fontFamily: 'karla',
            fontSize: 15,
            marginBottom: 15,
          }}
          placeholder="What do you need help with?"
          onChange={this.onChange}
          value={this.value}
        />
        {this.renderResults()}
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
