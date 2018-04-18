import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Button } from 'react-native';
import { WebBrowser, Constants, Location, Permissions } from 'expo';

import { MonoText } from '../components/StyledText';

import secrets from '../config/secrets';
import { mapApiUrl, placeApiUrl } from '../config/constants';

export default class HomeScreen extends React.Component {
    state = {
        location: null,
        errorMessage: null,
        addressFound: null,
        nearbyList: []
    };

    static navigationOptions = {
        header: null
    };

    componentWillMount() {
        this._maybeGetLocation();
    }

    render() {
        let text = 'Waiting..';
        if (this.state.errorMessage) {
            text = this.state.errorMessage;
        } else if (this.state.location) {
            text = JSON.stringify(this.state.location);
        }

        return (
            <View style={styles.container}>
                <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
                    <View style={styles.welcomeContainer}>
                        <Image source={__DEV__ ? require('../assets/images/robot-dev.png') : require('../assets/images/robot-prod.png')} style={styles.welcomeImage} />
                    </View>

                    <View style={styles.getStartedContainer}>
                        {this._maybeRenderDevelopmentModeWarning()}

                        <Button onPress={e => this._maybeGetLocation()} title="Check Location" />
                        <Text style={styles.getStartedText}>{text}</Text>

                        <Text>{'\n'}</Text>
                        <Button onPress={e => this._getNearby()} title="Nearby" />
                        <Text style={styles.getStartedText}>
                            {this.state.nearbyList.map((n, i) => {
                                return n + '\n';
                            })}
                        </Text>

                        {/* {this.state.nearbyList !== null && 
                          this.state.nearbyList.map((n, i) => {
                            return <Text style={styles.getStartedText}>{n}</Text>
                          });
                        } */}

                        {/* <Text style={styles.getStartedText}>Get started by opening</Text>

                        <View style={[styles.codeHighlightContainer, styles.homeScreenFilename]}>
                            <MonoText style={styles.codeHighlightText}>screens/HomeScreen.js</MonoText>
                        </View>

                        <Text style={styles.getStartedText}>New Text! For the stuff!</Text> */}
                    </View>

                    {/* <View style={styles.helpContainer}>
                        <TouchableOpacity onPress={this._handleHelpPress} style={styles.helpLink}>
                            <Text style={styles.helpLinkText}>Help, it didn’t automatically reload!</Text>
                        </TouchableOpacity>
                    </View> */}
                </ScrollView>

                {/* <View style={styles.tabBarInfoContainer}>
                    <Text style={styles.tabBarInfoText}>This is a tab bar. You can edit it in:</Text>

                    <View style={[styles.codeHighlightContainer, styles.navigationFilename]}>
                        <MonoText style={styles.codeHighlightText}>navigation/MainTabNavigator.js</MonoText>
                    </View>
                </View> */}
            </View>
        );
    }

    _maybeGetLocation() {
        if (Platform.OS === 'android' && !Constants.isDevice) {
            this.setState({
                errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!'
            });
        } else {
            this._getLocationAsync();
        }
    }

    _getLocationAsync = async () => {
        let { status } = await Permissions.askAsync(Permissions.LOCATION);
        if (status !== 'granted') {
            this.setState({
                errorMessage: 'Permission to access location was denied'
            });
        }

        let location = await Location.getCurrentPositionAsync({});
        this.setState({ location });
    };

    async _getNearby() {
        let location = '41.2635445,-95.9291076';
        if (this.state.location && this.state.location.coords && this.state.location.coords.latitude && this.state.location.coords.longitude) {
            location = this.state.location.coords.latitude + ',' + this.state.location.coords.longitude;
        } else {
            console.log('using default location');
        }
        try {
            let found = [];
            let response = await fetch(placeApiUrl.replace('[latlng]', location).replace('[key]', secrets.geoApiKey));
            let responseJson = await response.json();
            if (responseJson.status && responseJson.status === 'OK' && responseJson.results && responseJson.results.length > 0) {
                responseJson.results.forEach(r => {
                    if (r.types && r.name) {
                        console.log(`Found ${r.name}`);
                        found.push(`${r.name} ${r.types.join(',')}`);
                    }
                });
            }
            this.setState({ nearbyList: found });

            // let response = await fetch(mapApiUrl.replace('[latlng]', location).replace('[key]', secrets.geoApiKey));
            // let responseJson = await response.json();
            // if (responseJson.status && responseJson.status === 'OK' && responseJson.results && responseJson.results.length > 0) {
            //     let placeId = null;
            //     responseJson.results.forEach(r => {
            //         if (r.types.includes('street_address') && r.place_id) {
            //             console.log(`Found ${r.place_id} for ${r.formatted_address}`);
            //             this.setState({ addressFound: r.formatted_address + ' - ' + r.place_id });
            //             placeId = r.place_id;
            //             //break;
            //         }
            //     });
            //     if (placeId !== null) {
            //         // todo look for place

            //     }
            // }
        } catch (error) {
            console.error(error);
            this.setState({ errorMessage: error });
        }
    }

    _maybeRenderDevelopmentModeWarning() {
        if (__DEV__) {
            const learnMoreButton = (
                <Text onPress={this._handleLearnMorePress} style={styles.helpLinkText}>
                    Learn more
                </Text>
            );

            return <Text style={styles.developmentModeText}>Development mode is enabled, your app will be slower but you can use useful development tools. {learnMoreButton}</Text>;
        } else {
            return <Text style={styles.developmentModeText}>You are not in development mode, your app will run at full speed.</Text>;
        }
    }

    _handleLearnMorePress = () => {
        WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/development-mode');
    };

    _handleHelpPress = () => {
        WebBrowser.openBrowserAsync('https://docs.expo.io/versions/latest/guides/up-and-running.html#can-t-see-your-changes');
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center'
    },
    contentContainer: {
        paddingTop: 30
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10
    },
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50
    },
    homeScreenFilename: {
        marginVertical: 7
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)'
    },
    codeHighlightContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        paddingHorizontal: 4
    },
    getStartedText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center'
    },
    tabBarInfoContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        ...Platform.select({
            ios: {
                shadowColor: 'black',
                shadowOffset: { height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 3
            },
            android: {
                elevation: 20
            }
        }),
        alignItems: 'center',
        backgroundColor: '#fbfbfb',
        paddingVertical: 20
    },
    tabBarInfoText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center'
    },
    navigationFilename: {
        marginTop: 5
    },
    helpContainer: {
        marginTop: 15,
        alignItems: 'center'
    },
    helpLink: {
        paddingVertical: 15
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7'
    }
});
