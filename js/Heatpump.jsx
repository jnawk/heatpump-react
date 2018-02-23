import React from 'react';

import AWS from 'aws-sdk';

import {GoogleLogin, GoogleLogout} from 'react-google-login';
import NumericInput from 'react-numeric-input';
import Gauge from './Gauge.jsx';

const setpointMappings = {
    'too_cold': 'heating_start',
    'cold': 'heating_stop',
    'hot': 'cooling_stop',
    'too_hot': 'cooling_start'
}

class Heatpump extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};

        AWS.config.region = this.props.awsRegion;        
    }

    logout = () => {
        window.console.log('logout');
    }

    getShadow = () => {
        var params = {
            thingName: this.props.thingName /* required */
        };
        this.iotdata.getThingShadow(params, (err, data) => {
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
                setTimeout(this.getShadow, 5000);
            } 
        });
    }

    responseGoogle = (authResult) => {
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
                    this.iotdata = new AWS.IotData({endpoint: this.props.endpoint});
                    this.getShadow();
                }
            });
        });      
    }

    changeTooCold = (value) => { this.changeSetpoints(value, 'too_cold'); }
    changeCold = (value) => { this.changeSetpoints(value, 'cold'); }
    changeHot = (value) => { this.changeSetpoints(value, 'hot'); }
    changeTooHot = (value) => { this.changeSetpoints(value, 'too_hot'); }

    changeSetpoints = (value, control) => {
        var desired = {}
        desired[setpointMappings[control]] = value;

        var payload = JSON.stringify({state: {
            desired: desired
        }}); 
        var params = { 
            thingName: this.props.thingName,
            payload: payload
        };
        window.console.log(params);
        this.iotdata.updateThingShadow(params, (err, data) => {
            window.console.log('hello');
            if(err) {
                window.console.log(err);
                return;
            }
            this.getShadow();
        });
    }

    render() {
        var gauge = null;
        var controls = null;
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
            controls = [
                (<NumericInput 
                    key='too_cold' 
                    min={-20} 
                    max={40} 
                    value={this.state.too_cold} 
                    precision={1} 
                    onChange={this.changeTooCold}/>),
                (<br key='br1'/>),
                (<NumericInput key='cold' 
                    min={-20} 
                    max={40} 
                    value={this.state.cold} 
                    precision={1} 
                    onChange={this.changeCold}/>),
                (<br key='br2'/>),
                (<NumericInput key='hot' 
                    min={-20} 
                    max={40} 
                    value={this.state.hot} 
                    precision={1} 
                    onChange={this.changeHot}/>),
                (<br key='br3'/>),
                (<NumericInput key='too_hot' 
                    min={-20} 
                    max={40} 
                    value={this.state.too_hot} 
                    precision={1} 
                    onChange={this.changeTooHot}/>),
                (<br key='br4'/>)
            ];
                
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
                {controls}
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
