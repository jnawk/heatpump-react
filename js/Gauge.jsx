import React from 'react';

import './gauge.css';

const radius = 60;
const trackRadius = 54

const oneUnitInPixels = (trackRadius * 0.75 * 2 * Math.PI) / 60;
const oneUnitInDegrees = 90 / 20;

const bigTicks = [0, 45, 90, 135, 180, 270, 315];

class Gauge extends React.Component {

    constructor(props) {
        super(props);
    }

    render() {        
        var ticks = [];
        for(var tick in bigTicks) {
            transform='rotate(' + bigTicks[tick] + ' ' + radius + ' ' + radius + ')';
            var key = 'bigTick' + bigTicks[tick];
            ticks.push(<use key={key} className='tick quarterTick' href='#tick' transform={transform}></use>);    
        }
        
        var angle = 4.5;  
        while (angle < 360) {
            if(angle < 180 || angle > 270) {
                if(!bigTicks.includes[angle]) {
                    var transform = 'rotate(' + angle + ' ' + radius + ' ' + radius + ')';
                    key = 'tick' + angle;
                    ticks.push(<use key={key} className='tick' href='#tick' transform={transform}></use>);
                }
            }
            angle += 4.5;
        }

        const needleTransform = 'rotate(' + oneUnitInDegrees * this.props.temperature + ' ' + radius + ' ' + radius + ')';

        const tooColdPattern = {
            start: 0,
            stop: oneUnitInPixels * (this.props.too_cold + 20)
        };

        const coldPattern = {
            start: tooColdPattern.stop,
            stop: oneUnitInPixels * (this.props.cold + 20)
        };

        const hotPattern = {
            start: oneUnitInPixels * (this.props.hot + 20),
            stop: oneUnitInPixels * (this.props.too_hot + 20)
        };

        const tooHotPattern = {
            start: hotPattern.stop,
            stop: 60 * oneUnitInPixels
        };

        const trackDefinitions = [
            {
                className: 'too_cold',
                dashArray: (
                    /* draw */ tooColdPattern.stop + 'px ' + 
                    /* skip */ (tooHotPattern.stop - tooColdPattern.stop + 20 * oneUnitInPixels) + 'px ' +
                    /* draw */ (20 * oneUnitInPixels) + 'px ' +
                    /* skip */ '0px'
                )
            },
            {
                className: 'cold',
                dashArray: (
                    /* draw */ '0px ' +
                    /* skip */ tooColdPattern.stop + 'px ' + 
                    /* draw */ (coldPattern.stop - coldPattern.start) + 'px ' +
                    /* skip */ (tooHotPattern.stop - coldPattern.stop + 40 * oneUnitInPixels) + 'px '
                )
            },
            {
                className: 'hot',
                dashArray: (
                    /* draw */ '0px ' + 
                    /* skip */ hotPattern.start + 'px ' + 
                    /* draw */ (tooHotPattern.start - hotPattern.start) + 'px ' +
                    /* skip */ (tooHotPattern.stop - hotPattern.stop + 40 * oneUnitInPixels) + 'px'
                )
            },
            {
                className: 'too_hot',
                dashArray: (
                    /* draw */ '0px ' + 
                    /* skip */ tooHotPattern.start + 'px ' + 
                    /* draw */ (tooHotPattern.stop - tooHotPattern.start) + 'px ' +
                    /* skip */ (40 * oneUnitInPixels) + 'px'
                )
            }
        ];
            
        var tracks = [];
        for(var track in trackDefinitions) {
            var classNames = 'radial-progress-bar ' + trackDefinitions[track].className; 
            key = 'track_' + trackDefinitions[track].className;
            transform = 'rotate(-90 ' + radius + ' ' + radius + ')';
            tracks.push(
                <circle key={key} className={classNames}
                    cx={radius} cy={radius} r={trackRadius} fill='none' 
                    strokeDasharray={trackDefinitions[track].dashArray}
                    transform={transform}></circle>
            );
        }

        const rotate = 'rotate(180 ' + radius + ' ' + radius + ')';

        return (
            <svg className='radial-progress' 
                width='320' height='320' viewBox='0 0 120 120'>
                <defs>
                    <line id='tick' strokeLinecap='round'
                        x1='104' y1={radius} 
                        x2='110' y2={radius}></line>
                    <radialGradient id='radialCenter' cx='50%' cy='50%' r='50%'>
                        <stop stopColor='#dc3a79' offset='0'></stop>
                        <stop stopColor='#241d3b' offset='1'></stop>
                    </radialGradient>
                </defs>
                <g id='ticks'>{ticks}</g>
                <g id='tickLabels' className='tick-labels'>
                    <text x='59' y='100' textAnchor='middle' transform={rotate}>-20</text>
                    <text x='24' y='62' textAnchor='middle' transform={rotate}>0</text>
                    <text x='59' y='24' textAnchor='middle' transform={rotate}>20</text>
                    <text x='96' y='62' textAnchor='middle' transform={rotate}>40</text>
                </g>
                <circle className='radial-track' 
                    cx={radius} cy={radius} r={trackRadius} fill='none'
                    strokeDasharray='169.65px 84.82px 84.82px 0px'></circle>
                {tracks}
                <g id='needle' className='needle'>
                    <polygon className='point' points='60,50 60,70 110,60' 
                        transform={needleTransform}></polygon>
                    <circle className='center' cx={radius} cy={radius} r='23'></circle>
                </g>
            </svg>
        );    
    }
}

export default Gauge;
