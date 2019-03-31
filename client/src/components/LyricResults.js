import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from '@material-ui/core/Button';

class LyricResults extends Component {

    constructor(props){
        super(props);
    }

    componentDidMount(){
        console.log("hello ", this.props);
    }

    componentDidUpdate(nextProps){
        console.log(nextProps)
        if (nextProps.results !== this.props.results) {
            console.log(nextProps)
            this.fetchData(this.props.results)
            this.setState({
                results: nextProps.results,
            });
            console.log("lyricpage", this.state.results);
        }
    }

    onChangeResults(){
        this.props.changeResults(this.state.results);
    }

    render() {

        return (
            <MuiThemeProvider>
                <h1>hi</h1>
            </MuiThemeProvider>
        )
    }
}

export default LyricResults;