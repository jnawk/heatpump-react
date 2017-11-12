import {render} from 'react-dom';
import Heatpump from './Heatpump.jsx';

const heatpump = (
    <Heatpump 
        awsRegion='ap-southeast-2'
        identityPoolId='ap-southeast-2:74cf592c-2ea2-427d-afff-80d1ad5fa9cb'
        roleArn='arn:aws:iam::232271975773:role/iotWebAccess'
        endpoint='a1pxxd60vwqsll.iot.ap-southeast-2.amazonaws.com'
        thingName='40stokesDHT'
        clientId='468664753155-1ng8v3r2ffn1cifimoklg3b7g3nkefvp.apps.googleusercontent.com'/>
);
render(heatpump, document.getElementById('Heatpump'));