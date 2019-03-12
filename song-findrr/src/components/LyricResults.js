import React, { Component } from 'react'

class LyricResults extends Component {

    constructor(props){
        super(props);
        this.state = {
            results: []
        };
    }

    render() {
        const { resultSearchStyle } = styles;

        return (
        <div style={resultSearchStyle}>
            <h1>Results</h1>
        </div>
        )
    }
}

const styles = {

    resultSearchStyle: {
        display: 'block'
    },
}

export default LyricResults;