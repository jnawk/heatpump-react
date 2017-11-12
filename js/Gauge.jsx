import React from 'react';

import './gauge.css';

const oneDegreeInPixels = (54 * 0.75 * 2 * Math.PI) / 60;
const oneDegreeInDegrees = 90 / 20;

const bigTicks = [0, 45, 90, 135, 180, 270, 315];

class Gauge extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {        
        var ticks = [];
        for(var tick in bigTicks) {
            transform='rotate(' + bigTicks[tick] + ' 60 60)';
            var key = 'bigTick' + bigTicks[tick];
            ticks.push(<use key={key} className='tick quarterTick' href='#tick' transform={transform}></use>);    
        }
        
        var angle = 4.5;  
        while (angle < 360) {
            if(angle < 180 || angle > 270) {
                if(!bigTicks.includes[angle]) {
                    var transform = 'rotate(' + angle + ' 60 60)';
                    key = 'tick' + angle;
                    ticks.push(<use key={key} className='tick' href='#tick' transform={transform}></use>);
                }
            }
            angle += 4.5;
        }

        const needleTransform = 'rotate(' + oneDegreeInDegrees * this.props.temperature + ' 60 60)';

        const coldPattern = {
            start: 0,
            stop: oneDegreeInPixels * (this.props.cold + 20)
        };
        const hotPattern = {
            start: oneDegreeInPixels * (this.props.hot + 20),
            stop: 60 * oneDegreeInPixels
        };
        const coldDashArray = (
            coldPattern.stop + 'px ' + 
            (hotPattern.stop - coldPattern.stop + 20 * oneDegreeInPixels) + 'px ' +
            (20 * oneDegreeInPixels) + 'px ' +
            '0px'
        );
        const hotDashArray = (
            '0px ' + 
            hotPattern.start + 'px ' + 
            (hotPattern.stop - hotPattern.start) + 'px ' +
            (120 * oneDegreeInPixels - hotPattern.stop) + 'px'
        );

        return (
            <svg className='radial-progress' 
                width='320' height='320' viewBox='0 0 120 120'>
                <defs>
                    <line id='tick' strokeLinecap='round'
                        x1='104' y1='60' 
                        x2='110' y2='60'></line>
                    <radialGradient id='radialCenter' cx='50%' cy='50%' r='50%'>
                        <stop stopColor='#dc3a79' offset='0'></stop>
                        <stop stopColor='#241d3b' offset='1'></stop>
                    </radialGradient>
                </defs>
                <g id='ticks'>{ticks}</g>
                <g id='tickLabels' className='tick-labels'>
                    <text x='59' y='100' textAnchor='middle' transform='rotate(180 60 60)'>-20</text>
                    <text x='24' y='62' textAnchor='middle' transform='rotate(180 60 60)'>0</text>
                    <text x='59' y='24' textAnchor='middle' transform='rotate(180 60 60)'>20</text>
                    <text x='96' y='62' textAnchor='middle' transform='rotate(180 60 60)'>40</text>
                </g>
                <circle className='radial-track' 
                    cx='60' cy='60' r='54' fill='none'
                    strokeDasharray='169.65px 84.82px 84.82px 0px'></circle>
                <circle className='radial-progress-bar cold' 
                    cx='60' cy='60' r='54' fill='none'
                    strokeDasharray={coldDashArray}
                    transform='rotate(-90 60,60)'></circle>
                <circle className='radial-progress-bar hot' 
                    cx='60' cy='60' r='54' fill='none' 
                    strokeDasharray={hotDashArray}
                    transform='rotate(-90 60,60)'></circle>

                <g id='needle' className='needle'>
                    <polygon className='point' points='60,50 60,70 120,60' 
                        transform={needleTransform}></polygon>
                    <circle className='center' cx='60' cy='60' r='23'></circle>
                </g>
            </svg>
        );    
    }
}

export default Gauge;
