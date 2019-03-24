import React, { Component } from 'react'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Button from '@material-ui/core/Button';

class LyricResults extends Component {

    constructor(props){
        super(props);
        this.state = {
            results: this.props.results
        };
    }

    componentDidMount(){
        console.log(this.state.results);
    }

    componentDidUpdate(nextProps){
        if (nextProps.results !== this.props.results) {
            console.log(nextProps)
            this.setState({
                results: nextProps.results,
            });
            console.log("lyricpage", this.state.results);
        }
    }

    search() {

        console.log("results ", this.state.results)

    }

    render() {
        const { resultSearchStyle } = styles;

        return (
            
            <MuiThemeProvider>
                        
                <div style={resultSearchStyle}>
                    <h1>Results</h1>
                    <Button variant="contained" color="primary" style={this.state.searchBtnStyle} onClick={() => this.search()}>
                    Search
                    </Button>
                </div>

            </MuiThemeProvider>
        )
    }
}

const styles = {

    resultSearchStyle: {
        display: 'block'
    },

    
}

export default LyricResults;