import React from 'react';

import AWS from 'aws-sdk';

import {GoogleLogin, GoogleLogout} from 'react-google-login';

import Gauge from './Gauge.jsx';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';

class Heatpump extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.responseGoogle = this.responseGoogle.bind(this);
        this.logout = this.logout.bind(this);

        AWS.config.region = this.props.awsRegion;        
    }

    logout() {
        window.console.log('logout');
    }

    responseGoogle(authResult) {
        if(authResult.error) {
            window.console.log('nope');
            return;
        }

        // Add the Google access token to the Cognito credentials login map.
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: this.props.identityPoolId,
            Logins: {
                'accounts.google.com': authResult.tokenObj.id_token
            }
        });

        // Obtain AWS credentials
        AWS.config.credentials.get(err => {
            if(err) {
                window.console.log('it broke');
                window.console.log(err);
                this.setState({temperature: null});
                return;
            }

            var params = {
                RoleArn: this.props.roleArn,
                RoleSessionName: 'iotWebAccess',
                WebIdentityToken: authResult.tokenObj.id_token
            };
            const sts = new AWS.STS();
            sts.assumeRoleWithWebIdentity(params, (err, data) => {
                if (err) {
                    window.console.log(err, err.stack); // an error occurred          
                } else {
                    window.console.log(data);           // successful response
                    this.setState({id: AWS.config.credentials.identityId});
                    AWS.config.credentials = sts.credentialsFrom(data);
                    const iotdata = new AWS.IotData({endpoint: this.props.endpoint});
                    var params = {
                        thingName: this.props.thingName /* required */
                    };
                    iotdata.getThingShadow(params, (err, data) => {
                        if (err) {
                            window.console.log(err, err.stack); // an error occurred
                        } else {
                            var payload = JSON.parse(data.payload);
                            this.setState({
                                heatpump: payload,
                                temperature: payload.state.reported.temperature,
                                too_hot: payload.state.reported.cooling_start,
                                hot: payload.state.reported.cooling_stop,
                                cold: payload.state.reported.heating_stop,
                                too_cold: payload.state.reported.heating_start
                            });
                        } 
                    });
                }
            });
        });      
    }

    render() {
        var gauge = null;
        if(typeof this.state.temperature !== 'undefined' && 
            null != this.state.temperature) {
            gauge = (
                <Gauge 
                    cold={this.state.cold} 
                    too_cold={this.state.too_cold}
                    hot={this.state.hot}
                    too_hot={this.state.too_hot}
                    temperature={this.state.temperature}/>
            );
        }

        var loginText = 'Login';
        var logoutButton = null;
        if(null != gauge) {
            loginText = 'Change Login';
            logoutButton = (
                <GoogleLogout buttonText='Logout'
                    onLogoutSuccess={this.logout}/>
            );
        }
        return (
            <div>
                {gauge}
                <br/>
                <GoogleLogin
                    clientId={this.props.clientId}
                    buttonText={loginText}
                    onSuccess={this.responseGoogle}
                    onFailure={this.responseGoogle}/>
                {logoutButton}
            </div>
        );
    }
}

export default Heatpump;
